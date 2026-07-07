import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { contactFormLimiter, getClientIdentifier } from '@/lib/rateLimit'
import { validateName, validateEmail, validatePhone } from '@/lib/inputValidation'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Use service role key for server-side operations to bypass RLS
const supabase = createClient(
  supabaseUrl,
  supabaseServiceKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function POST(request) {
  try {
    // Rate limiting
    const clientId = getClientIdentifier(request)
    const rateLimitResult = await contactFormLimiter.limit(clientId)
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { 
          error: 'Too many requests. Please try again later.',
          retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
        },
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString(),
            'X-RateLimit-Limit': '5',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString()
          }
        }
      )
    }

    const body = await request.json()
    const { name, email, phone } = body

    const company = typeof body?.company === 'string' ? body.company.trim() : ''
    const website = typeof body?.website === 'string' ? body.website.trim() : ''
    const tsRaw = typeof body?.ts === 'string' ? body.ts.trim() : ''
    const ts = tsRaw ? Number(tsRaw) : NaN
    const submittedTooFast =
      Number.isFinite(ts) && Date.now() - ts >= 0 && Date.now() - ts < 2500
    const likelyBot = Boolean(company || website || submittedTooFast)
    if (likelyBot) {
      // Silently accept: don't store, don't email.
      return NextResponse.json({ message: 'Form submitted successfully' }, { status: 200 })
    }

    // Validate required fields (message is optional for popup)
    if (!name || !email || !phone) {
      return NextResponse.json(
        { error: 'Name, email, and phone number are required' },
        { status: 400 }
      )
    }

    // Validate and sanitize inputs
    const nameValidation = validateName(name)
    if (!nameValidation.valid) {
      return NextResponse.json(
        { error: nameValidation.error },
        { status: 400 }
      )
    }

    const emailValidation = validateEmail(email)
    if (!emailValidation.valid) {
      return NextResponse.json(
        { error: emailValidation.error },
        { status: 400 }
      )
    }

    const phoneValidation = validatePhone(phone)
    if (!phoneValidation.valid) {
      return NextResponse.json(
        { error: phoneValidation.error },
        { status: 400 }
      )
    }

    // Use validated and sanitized values
    const sanitizedName = nameValidation.value
    const sanitizedEmail = emailValidation.value
    const sanitizedPhone = phoneValidation.value

    // Insert into Supabase with sanitized values
    // Message field will be empty or null for popup submissions
    const { data, error } = await supabase
      .from('contact_submissions')
      .insert([
        {
          name: sanitizedName,
          email: sanitizedEmail,
          phone: sanitizedPhone,
          message: 'Popup form submission', // Mark as popup submission
        },
      ])
      .select()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to submit form. Please try again.' },
        { status: 500 }
      )
    }

    // Send email notification using Resend (optional, same as main contact form)
    try {
      const resendApiKey = process.env.RESEND_API_KEY
      const recipientEmail = process.env.CONTACT_EMAIL || 'sahil@rkgproperties.in'
      const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'

      if (resendApiKey) {
        const resend = new Resend(resendApiKey)

        // Create HTML email template
        const emailHtml = `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>New Popup Contact Form Submission</title>
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h1 style="color: #c99700; margin-top: 0;">New Popup Contact Form Submission</h1>
                <p style="color: #666; margin-bottom: 0;">A visitor has submitted their contact details through the popup form.</p>
              </div>
              
              <div style="background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px;">
                <h2 style="color: #333; border-bottom: 2px solid #c99700; padding-bottom: 10px; margin-top: 0;">Contact Details</h2>
                
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 10px 0; font-weight: bold; color: #555; width: 120px;">Name:</td>
                    <td style="padding: 10px 0; color: #333;">${sanitizedName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; font-weight: bold; color: #555;">Email:</td>
                    <td style="padding: 10px 0; color: #333;">
                      <a href="mailto:${sanitizedEmail}" style="color: #c99700; text-decoration: none;">${sanitizedEmail}</a>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; font-weight: bold; color: #555;">Phone:</td>
                    <td style="padding: 10px 0; color: #333;">
                      <a href="tel:${sanitizedPhone}" style="color: #c99700; text-decoration: none;">${sanitizedPhone}</a>
                    </td>
                  </tr>
                </table>
              </div>
              
              <div style="margin-top: 20px; padding: 15px; background-color: #f8f9fa; border-radius: 8px; text-align: center; color: #666; font-size: 12px;">
                <p style="margin: 0;">This email was sent from the RKG Properties popup contact form.</p>
                <p style="margin: 5px 0 0 0;">Timestamp: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
              </div>
            </body>
          </html>
        `

        await resend.emails.send({
          from: fromEmail,
          to: recipientEmail,
          subject: `New Popup Contact Form Submission from ${sanitizedName}`,
          html: emailHtml,
        })

        console.log('Email sent successfully to', recipientEmail)

        // Send confirmation email to the person who submitted the form
        const confirmationHtml = `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>We received your details</title>
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h1 style="color: #c99700; margin-top: 0;">Thank you for getting in touch</h1>
                <p style="color: #666; margin-bottom: 0;">Hi ${sanitizedName}, we have received your contact details and will reach out to you soon.</p>
              </div>
              <div style="background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px;">
                <p style="margin: 0 0 15px 0;">Our team typically responds within 1–2 business days. Need to speak with us now?</p>
                <p style="margin: 0;"><strong>Phone:</strong> <a href="tel:+919220286089" style="color: #c99700;">+91-9220286089</a> / <a href="tel:+918851753005" style="color: #c99700;">+91-8851753005</a></p>
                <p style="margin: 10px 0 0 0;"><strong>Email:</strong> <a href="mailto:sahil@rkgproperties.in" style="color: #c99700;">sahil@rkgproperties.in</a></p>
              </div>
              <div style="margin-top: 20px; padding: 15px; background-color: #f8f9fa; border-radius: 8px; text-align: center; color: #666; font-size: 12px;">
                <p style="margin: 0;">RKG Properties and Constructions</p>
                <p style="margin: 5px 0 0 0;">Sector 57, Sushant Lok, Gurugram, 122001</p>
              </div>
            </body>
          </html>
        `
        const confirmResult = await resend.emails.send({
          from: fromEmail,
          to: sanitizedEmail,
          subject: 'We received your details – RKG Properties and Constructions',
          html: confirmationHtml,
        })
        if (confirmResult.error) {
          console.error('Confirmation email failed:', confirmResult.error.message, 'to:', sanitizedEmail)
          // Resend with from=onboarding@resend.dev often only allows sending to the account owner.
          // Verify your domain in Resend and set RESEND_FROM_EMAIL e.g. noreply@rkgproperties.in to send to any recipient.
        } else {
          console.log('Confirmation email sent to', sanitizedEmail)
        }
      } else {
        console.warn('RESEND_API_KEY not configured. Email notification skipped.')
      }
    } catch (emailError) {
      // Log email error but don't fail the request if email sending fails
      console.error('Error sending email notification:', emailError)
      // Continue with success response even if email fails
    }

    return NextResponse.json(
      { message: 'Form submitted successfully', data },
      { 
        status: 200,
        headers: {
          'X-RateLimit-Limit': '5',
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
        }
      }
    )
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

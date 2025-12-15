import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { contactFormLimiter, getClientIdentifier } from '@/lib/rateLimit'
import { validateName, validateEmail, validatePhone, validateMessage } from '@/lib/inputValidation'

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
    const { name, email, phone, message } = body

    // Validate required fields
    if (!name || !email || !phone || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
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

    const messageValidation = validateMessage(message)
    if (!messageValidation.valid) {
      return NextResponse.json(
        { error: messageValidation.error },
        { status: 400 }
      )
    }

    // Use validated and sanitized values
    const sanitizedName = nameValidation.value
    const sanitizedEmail = emailValidation.value
    const sanitizedPhone = phoneValidation.value
    const sanitizedMessage = messageValidation.value

    // Insert into Supabase with sanitized values
    const { data, error } = await supabase
      .from('contact_submissions')
      .insert([
        {
          name: sanitizedName,
          email: sanitizedEmail,
          phone: sanitizedPhone,
          message: sanitizedMessage,
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

    // Send email notification using Resend
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
              <title>New Property Inquiry</title>
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h1 style="color: #AB090A; margin-top: 0;">New Property Inquiry</h1>
                <p style="color: #666; margin-bottom: 0;">You have received a new inquiry through the contact form.</p>
              </div>
              
              <div style="background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px;">
                <h2 style="color: #333; border-bottom: 2px solid #AB090A; padding-bottom: 10px; margin-top: 0;">Contact Details</h2>
                
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 10px 0; font-weight: bold; color: #555; width: 120px;">Name:</td>
                    <td style="padding: 10px 0; color: #333;">${sanitizedName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; font-weight: bold; color: #555;">Email:</td>
                    <td style="padding: 10px 0; color: #333;">
                      <a href="mailto:${sanitizedEmail}" style="color: #AB090A; text-decoration: none;">${sanitizedEmail}</a>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; font-weight: bold; color: #555;">Phone:</td>
                    <td style="padding: 10px 0; color: #333;">
                      <a href="tel:${sanitizedPhone}" style="color: #AB090A; text-decoration: none;">${sanitizedPhone}</a>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; font-weight: bold; color: #555; vertical-align: top;">Message:</td>
                    <td style="padding: 10px 0; color: #333; white-space: pre-wrap;">${sanitizedMessage}</td>
                  </tr>
                </table>
              </div>
              
              <div style="margin-top: 20px; padding: 15px; background-color: #f8f9fa; border-radius: 8px; text-align: center; color: #666; font-size: 12px;">
                <p style="margin: 0;">This email was sent from the RKG Properties contact form.</p>
                <p style="margin: 5px 0 0 0;">Timestamp: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
              </div>
            </body>
          </html>
        `

        await resend.emails.send({
          from: fromEmail,
          to: recipientEmail,
          subject: `New Property Inquiry from ${sanitizedName}`,
          html: emailHtml,
        })

        console.log('Email sent successfully to', recipientEmail)
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


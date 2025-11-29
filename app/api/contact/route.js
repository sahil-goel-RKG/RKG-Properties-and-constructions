import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
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


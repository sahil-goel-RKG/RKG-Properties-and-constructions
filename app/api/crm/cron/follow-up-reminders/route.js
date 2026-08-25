import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const REMINDER_MIN_MINUTES = 50
const REMINDER_MAX_MINUTES = 70

function authorize(request) {
  const secret = String(
    process.env.CRM_CRON_SECRET || process.env.CRON_SECRET || ''
  ).trim()
  if (!secret) return false
  const header = request.headers.get('authorization') || ''
  const bearer = header.startsWith('Bearer ') ? header.slice(7).trim() : ''
  const querySecret = new URL(request.url).searchParams.get('secret') || ''
  return bearer === secret || querySecret === secret
}

function indiaNowMs() {
  // Convert "now" into an absolute ms value representing IST wall clock via formatter parts
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(new Date())
  const get = (type) => parts.find((p) => p.type === type)?.value
  const y = Number(get('year'))
  const m = Number(get('month'))
  const d = Number(get('day'))
  const hh = Number(get('hour'))
  const mm = Number(get('minute'))
  const ss = Number(get('second'))
  // Treat IST as fixed UTC+5:30 for comparison math
  return Date.UTC(y, m - 1, d, hh, mm, ss) - (5 * 60 + 30) * 60 * 1000
}

function followUpToUtcMs(dateValue, timeValue) {
  const dateStr = String(dateValue || '').trim()
  const dm = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (!dm) return null
  const timeStr = String(timeValue || '').trim()
  const tm = timeStr.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?/)
  if (!tm) return null
  const y = Number(dm[1])
  const mo = Number(dm[2])
  const d = Number(dm[3])
  const hh = Number(tm[1])
  const mm = Number(tm[2])
  const ss = tm[3] != null ? Number(tm[3]) : 0
  // follow_up_date/time are IST business times
  return Date.UTC(y, mo - 1, d, hh, mm, ss) - (5 * 60 + 30) * 60 * 1000
}

function formatTimeAmPm(timeValue) {
  const s = String(timeValue || '').trim()
  const m = s.match(/^(\d{1,2}):(\d{2})/)
  if (!m) return s || '-'
  let hh = Number(m[1])
  const mm = m[2]
  const ap = hh >= 12 ? 'PM' : 'AM'
  hh = hh % 12
  if (hh === 0) hh = 12
  return `${hh}:${mm} ${ap}`
}

function siteBaseUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return String(process.env.NEXT_PUBLIC_SITE_URL).replace(/\/$/, '')
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  return 'https://rkgproperties.in'
}

async function sendCallMeBotWhatsApp(text) {
  const phone = String(process.env.CALLMEBOT_PHONE || '').trim()
  const apikey = String(process.env.CALLMEBOT_APIKEY || '').trim()
  if (!phone || !apikey) {
    return { ok: false, error: 'CALLMEBOT_PHONE or CALLMEBOT_APIKEY not configured' }
  }

  const url = new URL('https://api.callmebot.com/whatsapp.php')
  url.searchParams.set('phone', phone)
  url.searchParams.set('text', text)
  url.searchParams.set('apikey', apikey)

  const res = await fetch(url.toString(), { method: 'GET', cache: 'no-store' })
  const body = await res.text().catch(() => '')
  if (!res.ok) {
    return { ok: false, error: `CallMeBot HTTP ${res.status}: ${body.slice(0, 200)}` }
  }
  return { ok: true, body: body.slice(0, 200) }
}

function indiaTodayTomorrowIso() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date())
  const get = (type) => Number(parts.find((p) => p.type === type)?.value)
  const y = get('year')
  const m = get('month')
  const d = get('day')
  const today = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
  const tomorrowDt = new Date(Date.UTC(y, m - 1, d + 1))
  const tomorrow = `${tomorrowDt.getUTCFullYear()}-${String(tomorrowDt.getUTCMonth() + 1).padStart(2, '0')}-${String(tomorrowDt.getUTCDate()).padStart(2, '0')}`
  return { today, tomorrow }
}

async function runReminders() {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Supabase admin not configured' }, { status: 500 })
  }

  const phone = String(process.env.CALLMEBOT_PHONE || '').trim()
  const apikey = String(process.env.CALLMEBOT_APIKEY || '').trim()
  if (!phone || !apikey) {
    return NextResponse.json(
      { error: 'Set CALLMEBOT_PHONE and CALLMEBOT_APIKEY env vars' },
      { status: 500 }
    )
  }

  const { today, tomorrow } = indiaTodayTomorrowIso()
  const nowMs = indiaNowMs()

  const { data: leads, error } = await supabaseAdmin
    .from('crm_leads')
    .select(
      'id, customer_name, phone, location, follow_up_date, follow_up_time, follow_up_whatsapp_reminded_at, initial_assessment'
    )
    .in('follow_up_date', [today, tomorrow])
    .not('follow_up_time', 'is', null)
    .is('follow_up_whatsapp_reminded_at', null)
    .limit(200)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const due = []
  for (const lead of leads || []) {
    const status = String(lead.initial_assessment || '')
      .trim()
      .toLowerCase()
    if (status === 'closed') continue

    const followMs = followUpToUtcMs(lead.follow_up_date, lead.follow_up_time)
    if (followMs == null) continue
    const minutesUntil = (followMs - nowMs) / 60000
    if (minutesUntil >= REMINDER_MIN_MINUTES && minutesUntil <= REMINDER_MAX_MINUTES) {
      due.push({ lead, minutesUntil: Math.round(minutesUntil) })
    }
  }

  const results = []
  const base = siteBaseUrl()

  for (const { lead, minutesUntil } of due) {
    const name = lead.customer_name || 'Customer'
    const custPhone = lead.phone || '-'
    const when = formatTimeAmPm(lead.follow_up_time)
    const loc = lead.location ? ` (${lead.location})` : ''
    const link = `${base}/crm/leads/${lead.id}`

    const text = [
      `CRM reminder: call ${name}${loc}`,
      `Phone: ${custPhone}`,
      `Follow-up in ~${minutesUntil} min (${when})`,
      link,
    ].join('\n')

    const sent = await sendCallMeBotWhatsApp(text)
    if (!sent.ok) {
      results.push({ id: lead.id, ok: false, error: sent.error })
      continue
    }

    const { error: updateError } = await supabaseAdmin
      .from('crm_leads')
      .update({ follow_up_whatsapp_reminded_at: new Date().toISOString() })
      .eq('id', lead.id)

    results.push({
      id: lead.id,
      ok: !updateError,
      error: updateError?.message || null,
      minutesUntil,
    })
  }

  return NextResponse.json({
    ok: true,
    checked: (leads || []).length,
    due: due.length,
    results,
  })
}

export async function GET(request) {
  if (!authorize(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return runReminders()
}

export async function POST(request) {
  if (!authorize(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return runReminders()
}

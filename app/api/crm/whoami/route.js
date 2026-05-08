import { NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'

function isWhitelistedAdminEmail(email) {
  const list = String(process.env.CRM_ADMIN_EMAILS || '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
  if (!list.length) return false
  return list.includes(String(email || '').trim().toLowerCase())
}

export async function GET() {
  const { userId, sessionClaims } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let user = null
  try {
    user = await currentUser()
  } catch {
    // ignore
  }

  const claimsRole =
    sessionClaims?.publicMetadata?.role ||
    sessionClaims?.metadata?.role ||
    sessionClaims?.public_metadata?.role ||
    null

  const publicRole = user?.publicMetadata?.role ?? null
  const primaryEmail = user?.primaryEmailAddress?.emailAddress ?? null

  const isAdmin =
    claimsRole === 'admin' || publicRole === 'admin' || isWhitelistedAdminEmail(primaryEmail)

  return NextResponse.json({
    ok: true,
    userId,
    claimsRole,
    publicRole,
    primaryEmail,
    isAdmin,
    hasCrmAdminEmailsAllowlist: Boolean(process.env.CRM_ADMIN_EMAILS),
  })
}


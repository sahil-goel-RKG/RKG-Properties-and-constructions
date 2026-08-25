'use client'

import { SignIn } from '@clerk/nextjs'
import { useSearchParams } from 'next/navigation'
import '@/app/admin/admin-theme.css'

export default function AdminLoginPage() {
  const searchParams = useSearchParams()
  const returnUrl = searchParams?.get('returnUrl') || '/admin'

  return (
    <div className="admin-login-scope flex items-center justify-center py-16">
      <div className="w-full max-w-md px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Login</h1>
          <p>Sign in to access the admin dashboard</p>
        </div>
        <SignIn
          routing="path"
          path="/admin/login"
          signUpUrl="/admin/login"
          afterSignInUrl={returnUrl}
          afterSignUpUrl={returnUrl}
          redirectUrl={returnUrl}
          appearance={{
            variables: {
              colorPrimary: '#c9a227',
              colorBackground: '#141414',
              colorText: '#f5f5f5',
              colorInputBackground: '#1e1e1e',
              colorInputText: '#f5f5f5',
            },
            elements: {
              rootBox: 'mx-auto',
              card: 'shadow-lg bg-[#141414] border border-[#2a2a2a]',
              formButtonPrimary: 'bg-[#c99700] hover:bg-[#a67800]',
            },
            layout: {
              socialButtonsPlacement: 'top',
            },
          }}
        />
      </div>
    </div>
  )
}

'use client'

import { SignIn } from '@clerk/nextjs'
import { useSearchParams } from 'next/navigation'
import '@/app/crm/crm-theme.css'

export default function CrmLoginPage() {
  const searchParams = useSearchParams()
  const returnUrl = searchParams?.get('returnUrl') || '/crm'

  return (
    <div className="min-h-screen flex items-center justify-center py-16 crm-login-scope">
      <div className="w-full max-w-md px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">CRM Login</h1>
          <p>Sign in to access the CRM</p>
        </div>
        <SignIn
          routing="path"
          path="/crm/login"
          signUpUrl="/crm/login"
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
              otpCodeFieldInput:
                '!w-10 !h-10 text-center text-[14px] leading-none !p-0 !font-normal',
              otpCodeFieldInputs: 'gap-2',
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

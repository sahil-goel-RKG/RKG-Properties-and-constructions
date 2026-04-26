'use client'

import { SignIn } from '@clerk/nextjs'
import { useSearchParams } from 'next/navigation'

export default function CrmLoginPage() {
  const searchParams = useSearchParams()
  const returnUrl = searchParams?.get('returnUrl') || '/crm'

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">CRM Login</h1>
          <p className="text-gray-600">Sign in to access the CRM</p>
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
              colorPrimary: '#c99700',
            },
            elements: {
              rootBox: 'mx-auto',
              card: 'shadow-lg',
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


import { SignIn } from '@clerk/nextjs'

export default async function AdminLoginPage({ searchParams }) {
  // Get returnUrl from query params, default to /admin if not provided
  // In Next.js 15+, searchParams is a Promise
  const params = await searchParams
  const returnUrl = params?.returnUrl || '/admin'
  
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Login</h1>
          <p className="text-gray-600">Sign in to access the admin dashboard</p>
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
              colorPrimary: '#c99700',
            },
            elements: {
              rootBox: "mx-auto",
              card: "shadow-lg",
              formButtonPrimary: "bg-[#c99700] hover:bg-[#a67800]",
            },
            layout: {
              socialButtonsPlacement: "top",
            },
          }}
        />
      </div>
    </div>
  )
}


import { SignIn } from '@clerk/nextjs'

export default function AdminLoginPage() {
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
          afterSignInUrl="/admin"
          afterSignUpUrl="/admin"
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


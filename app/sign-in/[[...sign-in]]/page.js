import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-16">
      <SignIn 
        appearance={{
          variables: {
            colorPrimary: '#c99700',
          },
          elements: {
            formButtonPrimary: "bg-[#c99700] hover:bg-[#a67800]",
          },
        }}
      />
    </div>
  )
}

import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-16">
      <SignUp 
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

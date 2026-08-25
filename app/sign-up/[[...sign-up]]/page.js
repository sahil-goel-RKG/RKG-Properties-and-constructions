import { SignUp } from '@clerk/nextjs'

const clerkAppearance = {
  variables: {
    colorPrimary: '#c9a227',
    colorBackground: '#141414',
    colorText: '#f5f5f5',
    colorInputBackground: '#1e1e1e',
    colorInputText: '#f5f5f5',
  },
  elements: {
    formButtonPrimary: 'bg-[#c9a227] hover:bg-[#e0b840] text-[#0a0a0a]',
    card: 'bg-[#141414] border border-[#2a2a2a]',
  },
}

export default function SignUpPage() {
  return (
    <div className="page-shell flex items-center justify-center py-16">
      <SignUp appearance={clerkAppearance} />
    </div>
  )
}

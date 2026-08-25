'use client'

import { useUser, UserButton } from '@clerk/nextjs'

const userButtonAppearance = {
  variables: {
    colorPrimary: '#c9a227',
    colorBackground: '#141414',
    colorText: '#f5f5f5',
    colorTextSecondary: '#a3a3a3',
    colorNeutral: '#a3a3a3',
  },
  elements: {
    avatarBox: 'w-10 h-10',
    userButtonPopoverCard:
      'bg-[#141414] border border-[#2a2a2a] shadow-lg rounded-xl overflow-hidden',
    userButtonPopoverActionButton:
      'text-[#f5f5f5] hover:bg-white/5 focus:bg-white/5',
    userButtonPopoverActionButtonText: 'text-[#f5f5f5]',
    userButtonPopoverActionButtonIcon: 'text-[#a3a3a3]',
    userPreviewMainIdentifier: 'text-[#f5f5f5] font-semibold',
    userPreviewSecondaryIdentifier: 'text-[#a3a3a3]',
    userButtonPopoverFooter: 'bg-[#141414] border-t border-[#2a2a2a]',
  },
}

export default function UserButtonWrapper({ afterSignOutUrl = '/builder-floor' }) {
  const { user, isLoaded } = useUser()

  if (!isLoaded || !user) {
    return null
  }

  return (
    <div className="flex items-center">
      <UserButton afterSignOutUrl={afterSignOutUrl} appearance={userButtonAppearance} />
    </div>
  )
}

'use client'

import { useUser, UserButton } from '@clerk/nextjs'

export default function UserButtonWrapper({ afterSignOutUrl = '/builder-floor' }) {
  const { user, isLoaded } = useUser()

  // Only show user button if user is authenticated
  if (!isLoaded || !user) {
    return null
  }

  return (
    <div className="flex items-center">
      <UserButton
        afterSignOutUrl={afterSignOutUrl}
        appearance={{
          elements: {
            avatarBox: "w-10 h-10",
            userButtonPopoverCard: "shadow-lg",
          },
        }}
      />
    </div>
  )
}


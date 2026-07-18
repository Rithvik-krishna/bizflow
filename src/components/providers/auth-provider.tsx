'use client'

import React from 'react'
import { ClerkProvider } from '@clerk/nextjs'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const hasClerk = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

  if (!hasClerk) {
    return <>{children}</>
  }

  return (
    <ClerkProvider>
      {children}
    </ClerkProvider>
  )
}

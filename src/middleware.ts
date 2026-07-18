import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)', '/api/public(.*)'])

export default function middleware(request: any, event: any) {
  // If Clerk publishable key is missing, bypass auth entirely without initializing Clerk
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return NextResponse.next()
  }

  return clerkMiddleware(async (auth: any, req: any) => {
    if (!isPublicRoute(req)) {
      await auth.protect()
    }
  })(request, event)
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html|css|js|gif|svg|jpg|jpeg|png|webp|jwk|jwt|woff|woff2|ico|csv|docx|xlsx|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}

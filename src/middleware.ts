import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { clerkEnabled } from "@/lib/clerk";

// clerkMiddleware() throws on every request when no publishable key is set,
// which surfaces as MIDDLEWARE_INVOCATION_FAILED and takes down the whole
// deployment, API routes included. Without Clerk configured there is nothing
// to protect, so pass the request straight through.
export default clerkEnabled ? clerkMiddleware() : () => NextResponse.next();

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
};

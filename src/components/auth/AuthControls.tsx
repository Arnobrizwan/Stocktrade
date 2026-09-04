"use client";

import { UserButton, SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { clerkEnabled } from "@/lib/clerk";

export function AuthControls() {
    if (!clerkEnabled) return null;

    return (
        <>
            <SignedOut>
                <SignInButton mode="modal" forceRedirectUrl="/">
                    <button className="bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors">
                        Sign In
                    </button>
                </SignInButton>
            </SignedOut>
            <SignedIn>
                <UserButton />
            </SignedIn>
        </>
    );
}

export function AuthedOnly({ children }: { children: React.ReactNode }) {
    if (!clerkEnabled) return null;
    return <SignedIn>{children}</SignedIn>;
}

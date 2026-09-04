import type { ReactNode } from "react";

// Stand-in for @clerk/nextjs in the static export.
//
// Clerk's real package registers Server Actions, and `next build` with
// output: "export" refuses to build when any are present — even though this
// build never renders a signed-in state, because the import alone is enough.
// next.config.ts aliases the package here when STATIC_EXPORT=1.
//
// These mirror only the surface the app actually uses, and all of it is
// already behind `clerkEnabled`, which is false without a publishable key.

export function ClerkProvider({ children }: { children: ReactNode }) {
    return <>{children}</>;
}

export function SignedIn(_: { children?: ReactNode }) {
    return null;
}

export function SignedOut(_: { children?: ReactNode }) {
    return null;
}

export function SignInButton(_: {
    children?: ReactNode;
    mode?: string;
    forceRedirectUrl?: string;
}) {
    return null;
}

export function UserButton() {
    return null;
}

export function SignIn() {
    return null;
}

export function SignUp() {
    return null;
}

// CreatePost calls this at the top level. It only ever renders inside
// <AuthedOnly>, which is already null without Clerk, but the hook still has
// to resolve for the module to compile.
export function useUser() {
    return { isLoaded: true, isSignedIn: false, user: null } as const;
}

export function useAuth() {
    return { isLoaded: true, isSignedIn: false, userId: null } as const;
}

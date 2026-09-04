// Clerk is optional. Without a publishable key the app still renders in
// read-only mode instead of crashing at boot, which is what the static
// GitHub Pages build and any keyless deployment need.
export const clerkEnabled = Boolean(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
);

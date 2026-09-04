import type { NextConfig } from "next";

// STATIC_EXPORT=1 produces the GitHub Pages build: no server, no API routes,
// data read from the committed snapshot in public/data.
const isStaticExport = process.env.STATIC_EXPORT === "1";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig: NextConfig = {
    reactCompiler: true,
    ...(isStaticExport
        ? {
              output: "export" as const,
              basePath: basePath || undefined,
              assetPrefix: basePath || undefined,
              images: { unoptimized: true },
              trailingSlash: true,
              // Clerk registers Server Actions, which output: "export"
              // rejects outright. Nothing in this build can be signed in,
              // so swap the package for a no-op stub.
              turbopack: {
                  resolveAlias: {
                      "@clerk/nextjs": "./src/lib/clerk-stub.tsx",
                  },
              },
          }
        : {}),
};

export default nextConfig;

// Single switch between the live API routes and the pre-built static snapshot.
//
// The live app (Vercel) serves /api/* from Next route handlers.
// The static build (GitHub Pages) has no server, so the same payloads are read
// from /data/*.json, generated at snapshot time by scripts/capture-snapshot.mjs.

export const isStaticMode = process.env.NEXT_PUBLIC_STATIC_MODE === "1";
export const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

export function apiUrl(path: string): string {
    if (!isStaticMode) return path;

    const [pathname, query] = path.split("?");
    const name = pathname.replace(/^\/api\//, "");

    if (name === "signals") {
        const ticker = new URLSearchParams(query || "").get("ticker") || "NVDA";
        return `${basePath}/data/signals-${ticker.toUpperCase()}.json`;
    }

    return `${basePath}/data/${name}.json`;
}

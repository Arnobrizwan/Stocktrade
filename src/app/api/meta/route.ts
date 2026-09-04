import { NextResponse } from "next/server";
import yahooFinance from "@/lib/yahoo-finance";
import { snapshotCapturedAt } from "@/lib/snapshot";

export const dynamic = "force-dynamic";

// Tells the UI whether it is looking at a live market feed or the committed
// snapshot, so the page can say so instead of presenting stale prices as live.
export async function GET() {
    let live = false;

    try {
        const quote = (await Promise.race([
            yahooFinance.quote("NVDA"),
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error("probe timeout")), 4000)
            ),
        ])) as { regularMarketPrice?: number } | null;

        live = Boolean(quote?.regularMarketPrice);
    } catch {
        // Yahoo rejects datacenter IPs; treat any failure as snapshot mode.
        live = false;
    }

    return NextResponse.json({
        mode: live ? "live" : "snapshot",
        capturedAt: snapshotCapturedAt,
        source: "Yahoo Finance",
    });
}

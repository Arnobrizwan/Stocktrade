"use client";

import { useEffect, useState } from "react";
import { Archive } from "lucide-react";
import { isStaticMode, basePath } from "@/lib/api-source";

export default function SnapshotNotice() {
    const [capturedAt, setCapturedAt] = useState<string | null>(null);

    useEffect(() => {
        if (!isStaticMode) return;
        fetch(`${basePath}/data/meta.json`)
            .then((r) => r.json())
            .then((d) => setCapturedAt(d.capturedAt))
            .catch(() => setCapturedAt(null));
    }, []);

    if (!isStaticMode) return null;

    const when = capturedAt
        ? new Date(capturedAt).toLocaleString("en-GB", {
              dateStyle: "medium",
              timeStyle: "short",
              timeZone: "UTC",
          }) + " UTC"
        : "build time";

    return (
        <div className="mb-6 flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
            <Archive className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
                <span className="font-semibold">Static demo.</span> Real Yahoo
                Finance market data, captured {when}. Prices are not live here —
                Yahoo blocks both server-side and cross-origin browser requests,
                so a static host cannot refresh them. Posting and sign-in are
                disabled in this build.
            </p>
        </div>
    );
}

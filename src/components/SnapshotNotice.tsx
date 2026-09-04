"use client";

import { useEffect, useState } from "react";
import { Archive } from "lucide-react";
import { apiUrl, isStaticMode } from "@/lib/api-source";

export default function SnapshotNotice() {
    const [mode, setMode] = useState<"live" | "snapshot" | null>(null);
    const [capturedAt, setCapturedAt] = useState<string | null>(null);

    useEffect(() => {
        fetch(apiUrl("/api/meta"))
            .then((r) => r.json())
            .then((d) => {
                setMode(isStaticMode ? "snapshot" : d.mode);
                setCapturedAt(d.capturedAt ?? null);
            })
            .catch(() => setMode(null));
    }, []);

    if (mode !== "snapshot") return null;

    const when = capturedAt
        ? new Date(capturedAt).toLocaleString("en-GB", {
              dateStyle: "medium",
              timeStyle: "short",
              timeZone: "UTC",
          }) + " UTC"
        : "an earlier capture";

    return (
        <div className="mb-6 flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
            <Archive className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
                <span className="font-semibold">Snapshot data.</span> These are
                real Yahoo Finance figures captured {when}, not a live feed.
                Yahoo rejects requests from datacenter IPs and sends no CORS
                headers, so neither a serverless function nor a static page can
                refresh them from here.
                {isStaticMode && " Posting and sign-in are disabled in this build."}
            </p>
        </div>
    );
}

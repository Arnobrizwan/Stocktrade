import { NextResponse } from "next/server";

export async function GET() {
    // Mock data for trending tickers (Polymarket style needs live-feeling data)
    // In a real app, this would aggregate from DB and Market Data Provider
    const trending = [
        { symbol: "NVDA", price: 880.45, change: 2.5, volume: 1500000, sentiment: "Bullish" },
        { symbol: "TSLA", price: 175.30, change: -1.2, volume: 900000, sentiment: "Bearish" },
        { symbol: "AMD", price: 160.10, change: 1.8, volume: 500000, sentiment: "Bullish" },
        { symbol: "GME", price: 14.50, change: 5.4, volume: 2000000, sentiment: "Neutral" },
        { symbol: "BTC", price: 67000, change: 0.5, volume: 100000, sentiment: "Bullish" },
    ];

    return NextResponse.json(trending);
}

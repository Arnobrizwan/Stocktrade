import { NextResponse } from "next/server";
import yahooFinance from '@/lib/yahoo-finance';
import axios from 'axios';

export async function GET() {
    try {
        const symbols = ['^GSPC', '^IXIC', '^DJI', '^RUT', '^VIX'];

        // Fetch quotes in parallel
        const quotes = await Promise.all(
            symbols.map((s: string) => yahooFinance.quote(s).catch((e: any) => null))
        );

        const spy = quotes[0] || { regularMarketChangePercent: 0, regularMarketPrice: 0 };
        const qqq = quotes[1] || { regularMarketChangePercent: 0, regularMarketPrice: 0 };
        const dia = quotes[2] || { regularMarketChangePercent: 0, regularMarketPrice: 0 };
        const iwm = quotes[3] || { regularMarketChangePercent: 0, regularMarketPrice: 0 };
        const vix = quotes[4] || { regularMarketChangePercent: 0, regularMarketPrice: 15 };

        // Calculate market mood
        const avgChange = (
            (spy.regularMarketChangePercent || 0) +
            (qqq.regularMarketChangePercent || 0) +
            (dia.regularMarketChangePercent || 0)
        ) / 3;

        let mood = "Neutral";
        if (avgChange > 0.5) mood = "Greed";
        if (avgChange > 1.0) mood = "Extreme Greed";
        if (avgChange < -0.5) mood = "Fear";
        if (avgChange < -1.0) mood = "Extreme Fear";

        // VIX impact calculation
        const vixVal = vix.regularMarketPrice || 15;
        let fearGreedScore = 50 + (avgChange * 20); // Base 50, move by change

        // Adjust based on VIX (fear index)
        if (vixVal > 20) fearGreedScore -= 10;
        if (vixVal > 30) fearGreedScore -= 20;
        if (vixVal < 15) fearGreedScore += 10;

        // Clamp score between 0 and 100
        fearGreedScore = Math.max(0, Math.min(100, Math.round(fearGreedScore)));

        // Generate summary with Ollama
        let summary = "Market data is currently being analyzed.";
        try {
            const prompt = `You are a financial analyst. Analyze these market stats and give a very short 1-sentence summary of the market mood. Do not use markdown.
            S&P 500: ${spy.regularMarketChangePercent?.toFixed(2)}%
            Nasdaq: ${qqq.regularMarketChangePercent?.toFixed(2)}%
            Dow: ${dia.regularMarketChangePercent?.toFixed(2)}%
            VIX: ${vixVal}
            `;

            // Try to connect to local Ollama instance
            const response = await axios.post('http://localhost:11434/api/generate', {
                model: 'llama3', // Default to llama3, fallback handled if fails
                prompt: prompt,
                stream: false
            }, { timeout: 5000 }); // 5s timeout for LLM

            if (response.data && response.data.response) {
                summary = response.data.response.trim();
            }
        } catch (e) {
            console.log("Ollama generation failed or timed out, using fallback summary.");
            // Fallback summary logic
            if (avgChange > 0.5) summary = "Markets are rallying led by strong buying momentum.";
            else if (avgChange < -0.5) summary = "Markets are under pressure with broad-based selling.";
            else summary = "Markets are trading mixed with little direction today.";
        }

        return NextResponse.json({
            score: fearGreedScore,
            mood: mood,
            summary: summary,
            indices: {
                spy: spy.regularMarketChangePercent || 0,
                qqq: qqq.regularMarketChangePercent || 0,
                dia: dia.regularMarketChangePercent || 0,
                vix: vixVal
            }
        });
    } catch (error) {
        console.error("Error fetching market pulse:", error);
        return NextResponse.json({
            score: 50,
            mood: "Neutral",
            summary: "Market data unavailable.",
            indices: { spy: 0, qqq: 0, dia: 0, vix: 0 }
        });
    }
}

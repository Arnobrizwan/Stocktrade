import { generateObject } from 'ai';
import { createOllama } from 'ollama-ai-provider';
import { z } from 'zod';

const ollama = createOllama({
    baseURL: 'http://localhost:11434/api',
});

// Schema for LLM output
const AnalysisSchema = z.object({
    tags: z.array(z.string()).describe("Semantic tags like 'Tech', 'Earnings', 'High Risk'"),
    sentiment: z.enum(['BULLISH', 'BEARISH', 'NEUTRAL']).describe("Overall sentiment of the post"),
    qualityScore: z.number().min(0).max(100).describe("Quality score based on depth and reasoning (0-100)"),
    insightType: z.enum(['FUNDAMENTAL', 'TECHNICAL', 'MACRO', 'EARNINGS', 'RISK', 'GENERAL']).describe("Type of insight provided"),
    summary: z.string().describe("Brief summary of the key insight"),
    confidence: z.number().min(0).max(1).describe("Confidence in the analysis (0-1)"),
});

export type PostAnalysis = z.infer<typeof AnalysisSchema>;

export async function analyzePost(content: string): Promise<PostAnalysis> {
    try {
        const { object } = await generateObject({
            model: ollama('llama3') as any, // Type cast to resolve SDK version mismatch
            schema: AnalysisSchema,
            prompt: `Analyze the following stock trading post. Extract semantic tags, determine sentiment, score the quality (0-100) based on actionable insight and reasoning, categorize the insight type, and provide a brief summary.
      
      Post Content:
      "${content}"
      `,
        });

        return object;
    } catch (error) {
        console.error("Error analyzing post with LLM:", error);
        // Fallback for error cases
        return {
            tags: [],
            sentiment: 'NEUTRAL',
            qualityScore: 0,
            insightType: 'GENERAL',
            summary: 'Analysis failed',
            confidence: 0,
        };
    }
}

import { z } from 'zod';

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
        const prompt = `Analyze this stock trading post and extract the following information in JSON format:
- tags: array of semantic tags (e.g., "Tech", "Earnings", "High Risk", "AI", "Growth")
- sentiment: BULLISH, BEARISH, or NEUTRAL
- qualityScore: 0-100 based on depth, reasoning, and actionable insights
- insightType: FUNDAMENTAL, TECHNICAL, MACRO, EARNINGS, RISK, or GENERAL
- summary: brief 1-sentence summary of the key insight
- confidence: 0-1 confidence score

Post: "${content}"

Return ONLY valid JSON, no explanation:`;

        const response = await fetch('http://localhost:11434/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'llama3',
                prompt,
                stream: false,
                format: 'json'
            })
        });

        if (!response.ok) {
            throw new Error(`Ollama API error: ${response.statusText}`);
        }

        const data = await response.json();
        const jsonMatch = data.response.match(/\{[\s\S]*\}/);

        if (!jsonMatch) {
            throw new Error('No JSON found in response');
        }

        const parsed = JSON.parse(jsonMatch[0]);

        // Validate and return
        return AnalysisSchema.parse(parsed);
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

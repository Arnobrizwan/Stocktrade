// Quick test to verify Ollama is working
const testContent = "Tesla Q4 earnings strong. EV deliveries up 30%. Bullish outlook.";

const response = await fetch('http://localhost:11434/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        model: 'llama3',
        prompt: `Analyze this stock post and extract the following information in JSON format:
- tags: array of semantic tags (e.g., "Tech", "Earnings", "High Risk", "AI", "Growth")
- sentiment: BULLISH, BEARISH, or NEUTRAL
- qualityScore: 0-100 based on depth, reasoning, and actionable insights
- insightType: FUNDAMENTAL, TECHNICAL, MACRO, EARNINGS, RISK, or GENERAL
- summary: brief 1-sentence summary of the key insight
- confidence: 0-1 confidence score

Post: "${testContent}"

Return ONLY valid JSON, no explanation:`,
        stream: false,
        format: 'json'
    })
});

const data = await response.json();
console.log("Ollama response:", JSON.stringify(JSON.parse(data.response), null, 2));

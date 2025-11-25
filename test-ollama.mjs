// Test Ollama directly
const testContent = "NVDA earnings beat expectations. Strong AI chip demand driving 50% YoY growth.";

const response = await fetch('http://localhost:11434/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        model: 'llama3',
        prompt: `Analyze this stock post and extract: tags (array), sentiment (BULLISH/BEARISH/NEUTRAL), qualityScore (0-100), insightType (FUNDAMENTAL/TECHNICAL/MACRO/EARNINGS/RISK/GENERAL), summary (brief), confidence (0-1). Return as JSON.\n\nPost: "${testContent}"\n\nJSON:`,
        stream: false
    })
});

const data = await response.json();
console.log("Ollama response:", data.response);

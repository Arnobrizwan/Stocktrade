from pydantic import BaseModel
from typing import List, Optional
import random

class InsightRequest(BaseModel):
    content: string
    ticker: Optional[str] = None

class InsightResponse(BaseModel):
    tags: List[str]
    sentiment: str
    quality_score: float
    insight_type: str
    summary: str
    confidence: float

def process_insight(request: InsightRequest) -> InsightResponse:
    # In a real scenario, this would call an LLM (OpenAI/Anthropic/Ollama)
    # For this export, we'll simulate the logic or use a placeholder
    # to demonstrate the pipeline structure.
    
    content = request.content.lower()
    tags = []
    if "tech" in content or "ai" in content:
        tags.append("Tech")
    if "earnings" in content:
        tags.append("Earnings")
    if "risk" in content:
        tags.append("High Risk")
        
    sentiment = "NEUTRAL"
    if "buy" in content or "bull" in content:
        sentiment = "BULLISH"
    elif "sell" in content or "bear" in content:
        sentiment = "BEARISH"
        
    return InsightResponse(
        tags=tags,
        sentiment=sentiment,
        quality_score=random.uniform(60, 95),
        insight_type="GENERAL",
        summary=f"Analysis of {request.ticker or 'market'} sentiment.",
        confidence=0.85
    )

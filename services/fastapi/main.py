from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional, List
import random

app = FastAPI(title="StockTrade Insights API")

class InsightRequest(BaseModel):
    content: str
    ticker: Optional[str] = None

class InsightResponse(BaseModel):
    tags: List[str]
    sentiment: str
    quality_score: float
    insight_type: str
    summary: str
    confidence: float

@app.post("/analyze", response_model=InsightResponse)
async def analyze_post(request: InsightRequest):
    # Replicating logic from processor for simplicity in this single file example
    # or importing from the package if installed.
    
    content = request.content.lower()
    tags = []
    if "tech" in content or "ai" in content:
        tags.append("Tech")
    if "earnings" in content:
        tags.append("Earnings")
    
    sentiment = "NEUTRAL"
    if "buy" in content or "bull" in content:
        sentiment = "BULLISH"
    elif "sell" in content or "bear" in content:
        sentiment = "BEARISH"
        
    return InsightResponse(
        tags=tags,
        sentiment=sentiment,
        quality_score=round(random.uniform(60, 95), 1),
        insight_type="GENERAL",
        summary=f"Automated analysis of {request.ticker or 'market'} sentiment.",
        confidence=0.85
    )

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

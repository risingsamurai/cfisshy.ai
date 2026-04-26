from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import time
import random

app = FastAPI(title="AI Auditor ML Backend")

# Data Models
class AnalyzeRequest(BaseModel):
    dataset_url: str
    target_column: str = "target"
    protected_attribute: str = "gender"

class Metrics(BaseModel):
    statistical_parity: float
    equal_opportunity: float

class AnalyzeResponse(BaseModel):
    biasScore: int
    metrics: Metrics
    recommendations: List[str]

@app.get("/health")
def health():
    return {"status": "healthy", "timestamp": time.time()}

@app.post("/analyze", response_model=AnalyzeResponse)
def analyze(req: AnalyzeRequest):
    """
    Simulates a heavy ML audit process.
    In a real system, this would:
    1. Download dataset from req.dataset_url
    2. Run algorithmic bias tests
    3. Return calculated metrics
    """
    print(f"Analyzing dataset: {req.dataset_url}")
    
    # Simulate processing time (2-5 seconds)
    time.sleep(random.uniform(2, 5))
    
    # Dummy calculation logic
    # Higher scores mean more bias in this simulation
    bias_score = random.randint(10, 90)
    
    # Generate random metrics
    stat_parity = round(random.uniform(0.01, 0.3), 3)
    eq_opp = round(random.uniform(0.01, 0.2), 3)
    
    # Contextual recommendations
    recommendations = [
        "Review data collection for under-represented groups.",
        "Consider adversarial de-biasing techniques."
    ]
    if bias_score > 50:
        recommendations.append("High bias detected: Implement re-sampling or re-weighting.")
    else:
        recommendations.append("Low bias detected: Proceed with monitoring.")

    return AnalyzeResponse(
        biasScore=bias_score,
        metrics=Metrics(
            statistical_parity=stat_parity,
            equal_opportunity=eq_opp
        ),
        recommendations=recommendations
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
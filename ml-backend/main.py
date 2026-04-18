from fastapi import FastAPI
from pydantic import BaseModel
from bias_analyzer import analyze_bias


class AnalyzeRequest(BaseModel):
    dataset: str
    target_column: str
    protected_attributes: list[str]
    favorable_outcome: str


app = FastAPI()


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/analyze")
def analyze(payload: AnalyzeRequest) -> dict:
    return analyze_bias(payload.model_dump())

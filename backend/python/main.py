"""Optional FastAPI service for future verified content integrations."""
from datetime import date
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="Zaad API", version="0.1.0")

class DailyResponse(BaseModel):
    date: str
    message: str
    status: str

@app.get("/health", response_model=DailyResponse)
@app.get("/api/health", response_model=DailyResponse)
def health():
    return DailyResponse(date=date.today().isoformat(), message="Zaad API is running", status="ok")

@app.get("/api/v1/daily", response_model=DailyResponse)
def daily():
    return DailyResponse(date=date.today().isoformat(), message="راجع المصادر المعتمدة قبل نشر المحتوى الديني.", status="content-review-required")

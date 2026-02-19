from datetime import datetime
from pydantic import BaseModel

class OrderCreate(BaseModel):
    station: str
    item: str
    priority: str

class OrderStatusUpdate(BaseModel):
    status: str

class OrderResponse(BaseModel):
    id: int
    station: str
    item: str
    priority: str
    status: str
    runner_id: int | None = None
    eta_minutes: int | None = None
    created_at: datetime

    class Config:
        from_attributes = True

from ninja import Schema, Field
from typing import List, Optional
from datetime import datetime


class GetReadingResponse(Schema):
    id: int = Field(..., example=7)
    sensor_id: int = Field(..., example=12)
    temperature: float = Field(..., example=23.5)
    humidity: float = Field(..., example=56.2)
    timestamp: datetime = Field(..., example="2025-10-17T20:00:00Z")


class ReadingCreate(Schema):
    temperature: float = Field(..., example=23.5)
    humidity: float = Field(..., example=56.2)
    timestamp: datetime = Field(..., example="2025-10-17T20:00:00Z")

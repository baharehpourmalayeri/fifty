from ninja import Schema, Field
from typing import List, Optional
from datetime import datetime


class SensorItem(Schema):
    id: int = Field(..., example=12)
    name: str = Field(..., example="Greenhouse Temp Sensor #1")
    model: str = Field(..., example="GT-1000")
    description: Optional[str] = Field(
        None, example="Located in greenhouse section A")
    created_at: datetime = Field(..., example="2025-10-01T12:34:56Z")
    updated_at: datetime = Field(..., example="2025-10-10T09:20:00Z")


class GetSensorsResponse(Schema):
    has_next: bool
    has_previous: bool
    items: List[SensorItem]


class SensorCreate(Schema):
    name: str = Field(..., example="Greenhouse Temp Sensor #1")
    model: str = Field(..., example="GT-1000")
    description: Optional[str] = Field(
        None, example="Located in greenhouse section A")


class SensorDetail(Schema):
    id: int = Field(..., example=12)
    name: str = Field(..., example="Greenhouse Temp Sensor #1")
    model: str = Field(..., example="GT-1000")
    description: Optional[str] = Field(
        None, example="Located in greenhouse section A")
    created_at: datetime = Field(..., example="2025-10-01T12:34:56Z")
    updated_at: datetime = Field(..., example="2025-10-10T09:20:00Z")


class SensorUpdate(Schema):
    name: Optional[str] = Field(None, example="Greenhouse Temp Sensor #1")
    model: Optional[str] = Field(None, example="GT-1000")
    description: Optional[str] = Field(None, example="Updated description")

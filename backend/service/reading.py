from datetime import datetime
from typing import Optional
from django.shortcuts import get_object_or_404
from main.models import Sensor, Reading
from schema.reading import GetReadingResponse


def list_readings(
    user,
    sensor_id: int,
    timestamp_from: Optional[datetime] = None,
    timestamp_to: Optional[datetime] = None,
):
    sensor = get_object_or_404(Sensor, id=sensor_id, owner=user)

    readings_qs = Reading.objects.filter(sensor=sensor)

    if timestamp_from:
        readings_qs = readings_qs.filter(timestamp__gte=timestamp_from)
    if timestamp_to:
        readings_qs = readings_qs.filter(timestamp__lte=timestamp_to)

    readings_qs = readings_qs.order_by("-timestamp")

    return [
        GetReadingResponse(
            id=r.id,
            sensor_id=r.sensor_id,
            temperature=r.temperature,
            humidity=r.humidity,
            timestamp=r.timestamp,
        )
        for r in readings_qs
    ]


def create_reading(user,
                   sensor_id: int,
                   temperature: float,
                   humidity: float,
                   timestamp: datetime,
                   ):
    sensor = get_object_or_404(Sensor, id=sensor_id, owner=user)

    reading = Reading.objects.create(
        sensor=sensor,
        temperature=temperature,
        humidity=humidity,
        timestamp=timestamp,
    )

    return GetReadingResponse(
        id=reading.id,
        sensor_id=reading.sensor_id,
        temperature=reading.temperature,
        humidity=reading.humidity,
        timestamp=reading.timestamp,
    )

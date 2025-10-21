from datetime import timezone, datetime
from main.models import Sensor
from django.core.paginator import Paginator
from typing import Optional
from schema.sensor import GetSensorsResponse, SensorDetail, SensorItem
from django.shortcuts import get_object_or_404


def list_sensors(user, page: int = 1, page_size: int = 10,
                 q: Optional[str] = None):
    qs = Sensor.objects.filter(owner=user)

    if q:
        qs = qs.filter(name__icontains=q) | qs.filter(model__icontains=q)

    qs = qs.order_by("-created_at")

    paginator = Paginator(qs, page_size)
    page_obj = paginator.get_page(page)

    sensor_items = [
        SensorItem(
            id=s.id,
            name=s.name,
            model=s.model,
            description=s.description,
            created_at=s.created_at,
            updated_at=s.updated_at,
        )
        for s in page_obj
    ]

    return GetSensorsResponse(
        has_next=page_obj.has_next(),
        has_previous=page_obj.has_previous(),
        items=sensor_items
    )


def create_sensor(user, name: str, model: str, description: str):
    sensor = Sensor.objects.create(
        owner=user,
        name=name,
        model=model,
        description=description,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )

    return SensorDetail(
        id=sensor.id,
        name=sensor.name,
        model=sensor.model,
        description=sensor.description,
        owner_id=sensor.owner_id,
        created_at=sensor.created_at,
        updated_at=sensor.updated_at,
    )


def get_sensor(user, sensor_id: int):
    sensor = get_object_or_404(Sensor, id=sensor_id, owner=user)

    return SensorDetail(
        id=sensor.id,
        name=sensor.name,
        model=sensor.model,
        description=sensor.description,
        owner_id=sensor.owner_id,
        created_at=sensor.created_at,
        updated_at=sensor.updated_at,
    )


def update_sensor(
    user,
    sensor_id: int,
    name: str, model: str, description: str
):

    sensor = get_object_or_404(Sensor, id=sensor_id, owner=user)

    if name is not None:
        sensor.name = name
    if model is not None:
        sensor.model = model
    if description is not None:
        sensor.description = description

    sensor.updated_at = datetime.now(timezone.utc)
    sensor.save()

    return SensorDetail(
        id=sensor.id,
        name=sensor.name,
        model=sensor.model,
        description=sensor.description,
        owner_id=sensor.owner_id,
        created_at=sensor.created_at,
        updated_at=sensor.updated_at,
    )


def delete_sensor(user, sensor_id: int):

    sensor = get_object_or_404(Sensor, id=sensor_id, owner=user)

    sensor.delete()

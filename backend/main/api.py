from typing import List, Optional
from datetime import datetime
from django.http import Http404
from ninja import NinjaAPI, Router, Query, Path, Body

from schema.auth import RegisterRequest, RegisterResponse, UserSummary, LoginRequest, LoginResponse, TokenAuth
from schema.sensor import GetSensorsResponse, SensorCreate, SensorDetail, SensorUpdate
from schema.reading import GetReadingResponse, ReadingCreate
from schema.error import ErrorResponse

from service.auth import register_user, authenticate_user, refresh_user_token
from service.sensor import list_sensors, create_sensor, get_sensor, update_sensor, delete_sensor
from service.reading import list_readings, create_reading

api = NinjaAPI(
    title="Sensors API",
    version="1.0",
    docs_url="/docs",  # reachable at /api/docs when mounted under /api/
)

auth_router = Router(tags=["auth"])
sensors_router = Router(tags=["sensors"])

auth_scheme = TokenAuth()


# Auth
@auth_router.post("register/", response={201: RegisterResponse, 400: ErrorResponse})
def register(request, data: RegisterRequest = Body(...)):
    try:
        user, access_token, refresh_token = register_user(
            email=data.email,
            username=data.username,
            password=data.password
        )
    except ValueError as e:
        return 400, ErrorResponse(
            code=400,
            message=str(e)
        )

    return 201, RegisterResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserSummary(
            id=user.id,
            email=user.email,
            username=user.username
        )
    )


@auth_router.post("token/", response={200: LoginResponse, 401: ErrorResponse})
def token(request, data: LoginRequest = Body(...)):
    try:
        user, access_token, refresh_token = authenticate_user(
            email=data.email, password=data.password)
    except ValueError as e:
        return 401, ErrorResponse(
            code=401,
            message=str(e)
        )

    return 200, LoginResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserSummary(
            id=user.id,
            email=user.email,
            username=user.username
        )
    )


@auth_router.post("refresh/", response={200: LoginResponse, 401: ErrorResponse})
def refresh(request, token: str):
    try:
        user, access_token, refresh_token = refresh_user_token(token)
    except ValueError as e:
        return 401, ErrorResponse(
            code=401,
            message=str(e)
        )

    return 200, LoginResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserSummary(
            id=user.id,
            email=user.email,
            username=user.username
        )
    )


# Sensors (Auth required)
@sensors_router.get(
    "/",
    response={200: GetSensorsResponse, 400: ErrorResponse},
    auth=auth_scheme,
    summary="List sensors (paginated)",
)
def get_sensors(
    request,
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(10, ge=1, le=100, description="Items per page"),
    q: Optional[str] = Query(
        None, description="Search query for name and model"),
):
    try:
        sensors = list_sensors(
            user=request.user,
            page=page,
            page_size=page_size,
            q=q
        )
    except Exception as e:
        return 400, ErrorResponse(
            code=400,
            message=str(e)
        )

    return 200, sensors


@sensors_router.post(
    "/",
    response={201: SensorDetail, 400: ErrorResponse},
    auth=auth_scheme,
    summary="Create a sensor",
)
def create_a_sensor(request, data: SensorCreate = Body(...)):

    try:
        sensor = create_sensor(
            user=request.user,
            name=data.name,
            model=data.model,
            description=data.description,
        )
    except Exception as e:
        return 400, ErrorResponse(
            code=400,
            message=str(e)
        )

    return 201, sensor


@sensors_router.get(
    "/{sensor_id}/",
    response={200: SensorDetail, 400: ErrorResponse, 404: ErrorResponse},
    auth=auth_scheme,
    summary="Retrieve a sensor by id",
)
def retrieve_sensor(request, sensor_id: int = Path(..., description="Sensor ID")):
    try:
        sensor = get_sensor(
            user=request.user,
            sensor_id=sensor_id
        )
    except Http404 as e:
        return 404, ErrorResponse(
            code=404,
            message=str(e)
        )
    except Exception as e:
        return 400, ErrorResponse(
            code=400,
            message=str(e)
        )

    return 200, sensor


@sensors_router.put(
    "/{sensor_id}/",
    response={200: SensorDetail, 400: ErrorResponse, 404: ErrorResponse},
    auth=auth_scheme,
    summary="Update a sensor by id",
)
def update_a_sensor(
    request,
    sensor_id: int = Path(..., description="Sensor ID"),
    name: str = Body(None),
    model: str = Body(None),
    description: str = Body(None),
):
    try:
        sensor = update_sensor(
            user=request.user,
            sensor_id=sensor_id,
            name=name,
            model=model,
            description=description
        )
    except Http404 as e:
        return 404, ErrorResponse(
            code=404,
            message=str(e)
        )
    except Exception as e:
        return 400, ErrorResponse(
            code=400,
            message=str(e)
        )

    return 200, sensor


@sensors_router.delete(
    "/{sensor_id}/",
    response={204: None, 400: ErrorResponse, 404: ErrorResponse},
    auth=auth_scheme,
    summary="Delete a sensor (cascade readings)",
)
def delete_a_sensor(request, sensor_id: int = Path(..., description="Sensor ID")):
    try:
        delete_sensor(
            user=request.user,
            sensor_id=sensor_id
        )
    except Http404 as e:
        return 404, ErrorResponse(
            code=404,
            message=str(e)
        )
    except Exception as e:
        return 400, ErrorResponse(
            code=400,
            message=str(e)
        )

    return 204, None


# Readings (Auth required)
@sensors_router.get(
    "/{sensor_id}/readings/",
    response={200: List[GetReadingResponse],
              400: ErrorResponse, 404: ErrorResponse},
    auth=auth_scheme,
    summary="List readings for a sensor",
)
def get_readings(
    request,
    sensor_id: int = Path(..., description="Sensor ID"),
    timestamp_from: Optional[datetime] = Query(
        None, description="Filter readings from this timestamp (inclusive)"
    ),
    timestamp_to: Optional[datetime] = Query(
        None, description="Filter readings up to this timestamp (inclusive)"
    ),
):
    user = request.auth

    try:
        readings = list_readings(
            user=user,
            sensor_id=sensor_id,
            timestamp_from=timestamp_from,
            timestamp_to=timestamp_to,
        )
        return 200, readings
    except Http404 as e:
        return 404, ErrorResponse(
            code=404,
            message=str(e)
        )
    except Exception as e:
        return 400, ErrorResponse(
            code=400,
            message=str(e),
        )


@sensors_router.post(
    "/{sensor_id}/readings/",
    response={201: GetReadingResponse, 400: ErrorResponse, 404: ErrorResponse},
    auth=auth_scheme,
    summary="Create a reading for a sensor",
)
def create_a_reading(
    request,
    sensor_id: int = Path(..., description="Sensor ID"),
    data: ReadingCreate = Body(...),
):
    try:
        sensor = create_reading(
            user=request.user,
            sensor_id=sensor_id,
            temperature=data.temperature,
            humidity=data.humidity,
            timestamp=data.timestamp
        )
    except Exception as e:
        return 400, ErrorResponse(
            code=400,
            message=str(e)
        )

    return 201, sensor


api.add_router("/auth/", auth_router)
api.add_router("/sensors/", sensors_router)

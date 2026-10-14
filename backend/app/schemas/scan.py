from datetime import datetime

from pydantic import BaseModel, Field


class FaceRatios(BaseModel):
    """Measurements from the browser. Each one is compared with the cheekbone width (1.00)."""

    forehead: float = Field(ge=0.5, le=1.4)
    jaw: float = Field(ge=0.4, le=1.4)
    length: float = Field(ge=0.7, le=2.0)


class ScanCreate(BaseModel):
    ratios: FaceRatios


class StyleItem(BaseModel):
    name: str
    why: str


class StyleAdvice(BaseModel):
    title: str
    summary: str
    haircuts: list[StyleItem]
    beards: list[StyleItem]
    glasses: list[StyleItem]
    avoid: list[str]


class ScanOut(BaseModel):
    id: str
    created_at: datetime
    face_shape: str
    runner_up: str | None
    ratios: FaceRatios
    advice: StyleAdvice
    runner_up_title: str | None = None
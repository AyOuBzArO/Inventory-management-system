# backend/schemas/product.py
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ProductCreate(BaseModel):
    name: str
    description: Optional[str] = None
    quantity: int
    price: float

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    quantity: Optional[int] = None
    price: Optional[float] = None

class ProductResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    quantity: int
    price: float
    created_at: datetime

    class Config:
        from_attributes = True
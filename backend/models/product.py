from sqlalchemy import Column, Integer, String, Text, DECIMAL, TIMESTAMP
from sqlalchemy.sql import func
from backend.database import Base

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    quantity = Column(Integer, default=0)
    price = Column(DECIMAL(10, 2), nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.now())
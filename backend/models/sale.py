# backend/models/sale.py
from sqlalchemy import Column, Integer, DECIMAL, TIMESTAMP, ForeignKey
from sqlalchemy.sql import func
from backend.database import Base

class Sale(Base):
    __tablename__ = "sales"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    total_price = Column(DECIMAL(10, 2), nullable=False)
    sold_at = Column(TIMESTAMP, server_default=func.now())
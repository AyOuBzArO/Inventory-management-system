# backend/routes/products.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models.product import Product
from backend.schemas.product import ProductCreate, ProductUpdate, ProductResponse
from backend.auth import get_current_user
from typing import List

router = APIRouter(prefix="/products", tags=["products"])

@router.post("", response_model=ProductResponse)
def create_product(data: ProductCreate, db: Session = Depends(get_db), user_id: int = Depends(get_current_user)):
    product = Product(**data.model_dump())
    db.add(product)
    db.commit()
    db.refresh(product)
    return product

@router.get("", response_model=List[ProductResponse])
def get_products(db: Session = Depends(get_db), user_id: int = Depends(get_current_user)):
    return db.query(Product).all()

@router.get("/{product_id}", response_model=ProductResponse)
def get_product(product_id: int, db: Session = Depends(get_db), user_id: int = Depends(get_current_user)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.put("/{product_id}", response_model=ProductResponse)
def update_product(product_id: int, data: ProductUpdate, db: Session = Depends(get_db), user_id: int = Depends(get_current_user)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(product, key, value)
    db.commit()
    db.refresh(product)
    return product

@router.delete("/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db), user_id: int = Depends(get_current_user)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    db.delete(product)
    db.commit()
    return {"message": "Product deleted successfully"}

@router.patch("/{product_id}/quantity")
def update_quantity(product_id: int, quantity: int, db: Session = Depends(get_db), user_id: int = Depends(get_current_user)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    product.quantity = quantity
    db.commit()
    db.refresh(product)
    return {"message": "Quantity updated", "new_quantity": product.quantity}

@router.get("/stats/summary")
def get_stats(db: Session = Depends(get_db), user_id: int = Depends(get_current_user)):
    total_products = db.query(Product).count()
    low_stock = db.query(Product).filter(Product.quantity < 5).count()
    total_value = sum(p.price * p.quantity for p in db.query(Product).all())
    return {
        "total_products": total_products,
        "low_stock_items": low_stock,
        "total_inventory_value": float(total_value)
    }
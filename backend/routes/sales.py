# backend/routes/sales.py
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from backend.database import get_db
from backend.models.sale import Sale
from backend.models.product import Product
from backend.schemas.sale import SaleCreate

router = APIRouter(prefix="/sales", tags=["Sales"])

@router.post("/")
def create_sale(data: SaleCreate, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == data.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    if int(product.quantity) < data.quantity:  # type: ignore
        raise HTTPException(status_code=400, detail="Not enough stock")
    
    total_price = data.quantity * float(product.price)  # type: ignore
    
    new_sale = Sale(
        product_id=data.product_id,
        quantity=data.quantity,
        total_price=total_price
    )
    db.add(new_sale)
    product.quantity = int(product.quantity) - data.quantity  # type: ignore
    db.commit()
    
    return {"message": "Sale recorded successfully", "total_price": total_price}


@router.get("/revenue")
def get_revenue(period: str = Query("daily"), db: Session = Depends(get_db)):
    now = datetime.utcnow()
    
    if period == "daily":
        start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    elif period == "weekly":
        start = now - timedelta(days=7)
    elif period == "monthly":
        start = now - timedelta(days=30)
    else:
        raise HTTPException(status_code=400, detail="Period must be daily, weekly or monthly")
    
    result = db.query(func.sum(Sale.total_price)).filter(Sale.sold_at >= start).scalar()
    
    return {"period": period, "revenue": float(result or 0)}


@router.get("/best-selling")
def get_best_selling(db: Session = Depends(get_db)):
    results = (
        db.query(Sale.product_id, func.sum(Sale.quantity).label("total_sold"))
        .group_by(Sale.product_id)
        .order_by(func.sum(Sale.quantity).desc())
        .limit(5)
        .all()
    )
    
    output = []
    for product_id, total_sold in results:
        product = db.query(Product).filter(Product.id == product_id).first()
        output.append({
            "product_id": product_id,
            "product_name": product.name if product else "Unknown",
            "total_sold": int(total_sold)
        })
    
    return output


@router.get("/worst-selling")
def get_worst_selling(db: Session = Depends(get_db)):
    # Get all products
    all_products = db.query(Product).all()
    
    output = []
    for product in all_products:
        # Sum sales for this product (0 if none)
        total_sold = db.query(func.sum(Sale.quantity)).filter(
            Sale.product_id == product.id
        ).scalar() or 0
        
        output.append({
            "product_id": product.id,
            "product_name": product.name,
            "total_sold": int(total_sold)
        })
    
    # Sort ascending (worst first)
    output.sort(key=lambda x: x["total_sold"])
    
    return output[:5]


@router.get("/average-order")
def get_average_order(db: Session = Depends(get_db)):
    result = db.query(func.avg(Sale.total_price)).scalar()
    return {"average_order_value": float(result or 0)}


@router.get("/low-stock")
def get_low_stock(threshold: int = Query(10), db: Session = Depends(get_db)):
    products = db.query(Product).filter(Product.quantity <= threshold).all()
    
    return [
        {
            "product_id": p.id,
            "product_name": p.name,
            "quantity": p.quantity
        }
        for p in products
    ]


@router.get("/over-time")
def get_sales_over_time(db: Session = Depends(get_db)):
    results = (
        db.query(
            func.date(Sale.sold_at).label("date"),
            func.sum(Sale.total_price).label("revenue"),
            func.sum(Sale.quantity).label("units_sold")
        )
        .group_by(func.date(Sale.sold_at))
        .order_by(func.date(Sale.sold_at).asc())
        .all()
    )
    
    return [
        {
            "date": str(row.date),
            "revenue": float(row.revenue),
            "units_sold": int(row.units_sold)
        }
        for row in results
    ]


@router.get("/")
def get_all_sales(db: Session = Depends(get_db)):
    sales = db.query(Sale).order_by(Sale.sold_at.desc()).limit(100).all()
    result = []
    for s in sales:
        product = db.query(Product).filter(Product.id == s.product_id).first()
        result.append({
            "id": s.id,
            "product_name": product.name if product else "Unknown",
            "quantity": s.quantity,
            "total_price": float(s.total_price),
            "sold_at": str(s.sold_at) if s.sold_at else None
        })
    return result


@router.get("/revenue-by-product")
def get_revenue_by_product(db: Session = Depends(get_db)):
    results = (
        db.query(Sale.product_id, func.sum(Sale.total_price).label("total_revenue"))
        .group_by(Sale.product_id)
        .order_by(func.sum(Sale.total_price).desc())
        .limit(8)
        .all()
    )
    output = []
    for product_id, total_revenue in results:
        product = db.query(Product).filter(Product.id == product_id).first()
        output.append({
            "product_name": product.name if product else "Unknown",
            "total_revenue": float(total_revenue)
        })
    return output
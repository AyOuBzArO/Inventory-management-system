# backend/routes/chat.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from pydantic import BaseModel
from typing import List
import httpx

from backend.database import get_db
from backend.models.sale import Sale
from backend.models.product import Product
from backend.auth import get_current_user

router = APIRouter(prefix="/chat", tags=["Chat"])

OLLAMA_URL   = "http://localhost:11434/api/chat"
OLLAMA_MODEL = "qwen2.5:7b"

# ─────────────────────────────────────────────────────────────────────────────
# Schemas
# ─────────────────────────────────────────────────────────────────────────────
class Message(BaseModel):
    role: str      # "user" | "assistant"
    content: str

class ChatRequest(BaseModel):
    message: str
    history: List[Message] = []


# ─────────────────────────────────────────────────────────────────────────────
# DB context builder
# ─────────────────────────────────────────────────────────────────────────────
def gather_context(db: Session) -> str:
    now = datetime.utcnow()
    today_start  = now.replace(hour=0, minute=0, second=0, microsecond=0)
    week_start   = now - timedelta(days=7)
    month_start  = now - timedelta(days=30)

    # ── Products ──────────────────────────────────────────────────────────────
    products = db.query(Product).order_by(Product.name).all()
    prod_lines = [
        f"  • {p.name}: {p.quantity} units in stock @ ${float(p.price):.2f}"
        for p in products
    ] or ["  (no products yet)"]

    # ── Revenue ───────────────────────────────────────────────────────────────
    def rev(start):
        r = db.query(func.sum(Sale.total_price)).filter(Sale.sold_at >= start).scalar()
        return float(r or 0)

    today_rev  = rev(today_start)
    week_rev   = rev(week_start)
    month_rev  = rev(month_start)
    total_rev  = float(db.query(func.sum(Sale.total_price)).scalar() or 0)
    total_txns = int(db.query(func.count(Sale.id)).scalar() or 0)
    avg_order  = float(db.query(func.avg(Sale.total_price)).scalar() or 0)

    # ── Best sellers ─────────────────────────────────────────────────────────
    best_rows = (
        db.query(Sale.product_id, func.sum(Sale.quantity).label("qty"),
                 func.sum(Sale.total_price).label("rev"))
        .group_by(Sale.product_id)
        .order_by(func.sum(Sale.quantity).desc())
        .limit(5).all()
    )
    best_lines = []
    for pid, qty, prev in best_rows:
        p = db.query(Product).filter(Product.id == pid).first()
        best_lines.append(
            f"  • {p.name if p else 'Unknown'}: {int(qty)} units sold, ${float(prev):.2f} revenue"
        )
    if not best_lines:
        best_lines = ["  (no sales recorded yet)"]

    # ── Worst sellers (products with fewest sales) ────────────────────────────
    worst_lines = []
    sold_ids = {r.product_id for r in db.query(Sale.product_id).distinct()}
    unsold   = [p for p in products if p.id not in sold_ids]
    if unsold:
        for p in unsold[:3]:
            worst_lines.append(f"  • {p.name}: 0 units sold (no sales)")
    else:
        worst_rows = (
            db.query(Sale.product_id, func.sum(Sale.quantity).label("qty"))
            .group_by(Sale.product_id)
            .order_by(func.sum(Sale.quantity).asc())
            .limit(3).all()
        )
        for pid, qty in worst_rows:
            p = db.query(Product).filter(Product.id == pid).first()
            worst_lines.append(f"  • {p.name if p else 'Unknown'}: {int(qty)} units sold")

    # ── Low stock ─────────────────────────────────────────────────────────────
    low_products = db.query(Product).filter(Product.quantity <= 10).order_by(Product.quantity).all()
    low_lines = [
        f"  • {p.name}: only {p.quantity} units left" for p in low_products
    ] or ["  (none — all products well-stocked)"]

    # ── Out of stock ──────────────────────────────────────────────────────────
    oos = db.query(Product).filter(Product.quantity == 0).all()
    oos_lines = [f"  • {p.name}" for p in oos] or ["  (none)"]

    # ── Recent 7 sales ────────────────────────────────────────────────────────
    recent_sales = db.query(Sale).order_by(Sale.sold_at.desc()).limit(7).all()
    recent_lines = []
    for s in recent_sales:
        p = db.query(Product).filter(Product.id == s.product_id).first()
        recent_lines.append(
            f"  • {p.name if p else 'Unknown'}: {s.quantity} units, "
            f"${float(s.total_price):.2f} on {str(s.sold_at)[:10]}"
        )
    if not recent_lines:
        recent_lines = ["  (no sales yet)"]

    # ── Sales trend (last 7 days) ─────────────────────────────────────────────
    trend_rows = (
        db.query(
            func.date(Sale.sold_at).label("day"),
            func.sum(Sale.total_price).label("rev"),
            func.sum(Sale.quantity).label("units"),
        )
        .filter(Sale.sold_at >= week_start)
        .group_by(func.date(Sale.sold_at))
        .order_by(func.date(Sale.sold_at).asc())
        .all()
    )
    trend_lines = [
        f"  • {str(r.day)}: ${float(r.rev):.2f} revenue, {int(r.units)} units"
        for r in trend_rows
    ] or ["  (no data)"]

    return f"""=== LIVE IMS DATA (as of {now.strftime('%Y-%m-%d %H:%M')} UTC) ===

INVENTORY ({len(products)} products total):
{chr(10).join(prod_lines)}

REVENUE SUMMARY:
  • Today:      ${today_rev:.2f}
  • Last 7 days:  ${week_rev:.2f}
  • Last 30 days: ${month_rev:.2f}
  • All-time:     ${total_rev:.2f}
  • Total transactions: {total_txns}
  • Average order value: ${avg_order:.2f}

TOP SELLING PRODUCTS (by units sold):
{chr(10).join(best_lines)}

SLOWEST SELLING PRODUCTS:
{chr(10).join(worst_lines)}

LOW STOCK ALERTS (≤10 units):
{chr(10).join(low_lines)}

OUT OF STOCK:
{chr(10).join(oos_lines)}

RECENT SALES:
{chr(10).join(recent_lines)}

DAILY SALES TREND (last 7 days):
{chr(10).join(trend_lines)}
"""


# ─────────────────────────────────────────────────────────────────────────────
# System prompt
# ─────────────────────────────────────────────────────────────────────────────
SYSTEM_PROMPT = """You are an intelligent analytics assistant embedded in IMS (Inventory Management System).
You have access to real-time, live data about the user's inventory, products, and sales.

Your role:
- Answer questions about stock levels, sales performance, revenue, and trends
- Spot patterns and give actionable business insights
- Be concise, direct, and always cite real numbers from the data
- Format responses cleanly: use bullet points or short paragraphs, never long walls of text
- If asked something completely outside inventory/sales scope, politely redirect

Rules:
- Only use numbers from the data provided — never invent or estimate figures
- Keep responses under 150 words unless a detailed breakdown is explicitly requested
- Use $ for monetary values
- If data shows a problem (low stock, no sales), proactively mention it
- Speak like a knowledgeable business advisor, not a generic chatbot
"""


# ─────────────────────────────────────────────────────────────────────────────
# Endpoint
# ─────────────────────────────────────────────────────────────────────────────
@router.post("")
def chat(
    body: ChatRequest,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user),
):
    context = gather_context(db)

    # Build message list for Ollama
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT + "\n\n" + context}
    ]

    # Append conversation history (last 10 turns to keep context short)
    for msg in body.history[-10:]:
        messages.append({"role": msg.role, "content": msg.content})

    # Append the new user message
    messages.append({"role": "user", "content": body.message})

    try:
        resp = httpx.post(
            OLLAMA_URL,
            json={"model": OLLAMA_MODEL, "messages": messages, "stream": False},
            timeout=120.0,
        )
        resp.raise_for_status()
        data = resp.json()
        reply = data["message"]["content"].strip()
        return {"reply": reply}
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="AI model timed out. Try again.")
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"AI unavailable: {str(e)}")

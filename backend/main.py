# backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.database import engine, Base
from backend.models import user, product
from backend.routes import auth, products

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Inventory Management System", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(products.router)

@app.get("/health")
def health_check():
    return {"status": "ok", "message": "IMS API is running"}
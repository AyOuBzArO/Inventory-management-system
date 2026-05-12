from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import RedirectResponse
from backend.database import engine, Base
from backend.models import user, product, sale
from backend.routes import auth, products, sales
import os

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Inventory Management System", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.include_router(auth.router)
app.include_router(products.router)
app.include_router(sales.router)

@app.get("/health")
def health_check():
    return {"status": "ok", "message": "IMS API is running"}

@app.get("/")
def root():
    return RedirectResponse(url="/app/login.html")

app.mount("/app", StaticFiles(directory="frontend"), name="frontend")
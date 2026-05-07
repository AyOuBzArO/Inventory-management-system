from dotenv import load_dotenv
import os

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./inventory.db")
SECRET_KEY = os.getenv("SECRET_KEY", "change-this-in-production")
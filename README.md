# Inventory Management System

A web application to manage product inventory with authentication, CRUD operations, stock tracking, and statistics.

## Tech Stack

- **Backend:** FastAPI (Python)
- **Database:** MySQL + SQLAlchemy
- **Frontend:** HTML / CSS / JavaScript
- **Auth:** JWT Tokens
- **DevOps:** Docker + Docker Compose

## Features

- User authentication (register / login)
- Product management (add, view, edit, delete)
- Stock tracking with low-stock alerts
- Inventory statistics dashboard
- REST API with Swagger documentation

## Project Structure

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /register | Register new user |
| POST | /login | Login and get token |
| POST | /products | Create product |
| GET | /products | List all products |
| GET | /products/{id} | Get product |
| PUT | /products/{id} | Update product |
| DELETE | /products/{id} | Delete product |
| PATCH | /products/{id}/quantity | Update stock |
| GET | /products/stats/summary | Statistics |

## Run with Docker

```bash
docker-compose up --build
```

Then open: http://localhost:8000/docs

## Run Locally

```bash
# Activate venv
.\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run server
uvicorn backend.main:app --reload
```

## UML Diagrams

See `/docs` folder for use case, class, and sequence diagrams.

## Author

Ayoub — 2026
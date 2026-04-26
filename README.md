# Inventory Management System

A full-stack web application to manage product inventory with authentication, CRUD operations, stock tracking, sales recording, and statistics dashboard.

## Tech Stack

- **Backend:** FastAPI (Python)
- **Database:** MySQL + SQLAlchemy
- **Frontend:** HTML / CSS / JavaScript
- **Auth:** JWT Tokens
- **DevOps:** Docker + Docker Compose

## Features

- User authentication (register / login) with JWT
- Product management (add, view, edit, delete, image upload)
- Stock tracking with low-stock alerts
- Sales recording with automatic stock update
- Statistics dashboard (revenue, best/worst sellers, sales over time)
- REST API with Swagger documentation

## Project Structure

```
├── backend/
│   ├── models/
│   │   ├── user.py        # User model
│   │   ├── product.py     # Product model
│   │   └── sale.py        # Sale model
│   ├── routes/
│   │   ├── auth.py        # Auth endpoints
│   │   ├── products.py    # Product endpoints
│   │   └── sales.py       # Sales & statistics endpoints
│   ├── schemas/
│   │   ├── user.py        # User schemas
│   │   └── sale.py        # Sale schemas
│   ├── auth.py            # JWT authentication
│   ├── config.py          # Environment config
│   ├── database.py        # DB connection
│   └── main.py            # App entry point
├── frontend/
│   ├── login.html         # Login page
│   ├── index.html         # Dashboard
│   ├── add-product.html   # Add / edit product
│   └── statistics.html    # Statistics dashboard
├── docs/
│   ├── use-case.png
│   ├── class-diagram.png
│   └── sequence-diagram.png
├── uploads/               # Product images
├── docker-compose.yml
├── dockerfile
├── requirements.txt
└── README.md
```

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /register | Register new user |
| POST | /login | Login and get JWT token |

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /products | Create product |
| GET | /products | List all products |
| GET | /products/{id} | Get product by id |
| PUT | /products/{id} | Update product |
| DELETE | /products/{id} | Delete product |
| PATCH | /products/{id}/quantity | Update stock quantity |
| GET | /products/stats/summary | Inventory summary stats |
| POST | /products/upload-image | Upload product image |

### Sales & Statistics
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /sales/ | Record a new sale |
| GET | /sales/revenue?period= | Revenue (daily/weekly/monthly) |
| GET | /sales/best-selling | Top 5 best selling products |
| GET | /sales/worst-selling | Worst selling products |
| GET | /sales/average-order | Average order value |
| GET | /sales/low-stock | Products below stock threshold |
| GET | /sales/over-time | Sales data over time (chart) |

## Run with Docker

```bash
docker-compose up --build
```

Then open:
- API docs: http://localhost:8000/docs
- Frontend: open `frontend/index.html` in your browser

## Run Locally

```bash
# Activate virtual environment
.\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run server
uvicorn backend.main:app --reload
```

Make sure MySQL is running and your `.env` file is configured:

```env
DATABASE_URL=mysql+pymysql://root:@localhost/inventory_db
SECRET_KEY=mysecretkey123
```

## UML Diagrams

See `/docs` folder for:
- Use case diagram
- Class diagram (User, Product, Sale)
- Sequence diagram (login flow + sale flow)

## Database Schema

| Table | Key Fields |
|-------|-----------|
| users | id, username, password (hashed) |
| products | id, name, description, quantity, price, image |
| sales | id, product_id (FK), quantity, total_price, sold_at |

## Author

Ayoub — 2026
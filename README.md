# Inventory Management System

A full-stack web application to manage product inventory with authentication, CRUD operations, stock tracking, sales recording, and a statistics dashboard.

## Tech Stack

- **Backend:** FastAPI (Python)
- **Database:** SQLite + SQLAlchemy
- **Frontend:** HTML / CSS / JavaScript / ApexCharts
- **Auth:** JWT Tokens
- **DevOps:** Docker + Docker Compose

## Features

- User authentication (register/login) with JWT
- Product management (add, view, edit, delete, image upload)
- Stock tracking with low-stock alerts
- **Sales page** — record sales and view full transaction history directly from the UI
- Automatic stock deduction on every sale
- **Statistics dashboard** with 4 ApexCharts visualizations:
  - Sales Over Time (dual-axis area + line chart)
  - Top Selling Products (horizontal gradient bar chart)
  - Revenue by Product (donut chart)
  - Daily Revenue Trend (smooth area chart)
- Revenue tracking (daily / weekly / monthly)
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
│   ├── sales.html         # Sales recording & history
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
| GET | /sales/ | List all sales (history) |
| GET | /sales/revenue?period= | Revenue (daily/weekly/monthly) |
| GET | /sales/best-selling | Top 5 best selling products |
| GET | /sales/worst-selling | Worst selling products |
| GET | /sales/average-order | Average order value |
| GET | /sales/low-stock | Products below stock threshold |
| GET | /sales/over-time | Sales data over time (chart) |
| GET | /sales/revenue-by-product | Revenue breakdown per product |

## Run with Docker

```bash
docker-compose up --build
```

Or pull directly from Docker Hub:

```bash
docker pull ayoubzaro/inventory-management-system:latest
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

Your `.env` file should contain:

```env
DATABASE_URL=sqlite:///./inventory.db
SECRET_KEY=mysecretkey123
```

No external database setup needed — SQLite runs out of the box.

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

Ayoub ZARKOUNI.

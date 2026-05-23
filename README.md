<div align="center">

<img src="frontend/logo.png" width="80" alt="IMS Logo" />

# IMS — Inventory Management System

**A modern, full-stack inventory management application with AI-powered analytics.**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Railway-6366f1?style=for-the-badge&logo=railway)](https://inventory-management-system-production-3b31.up.railway.app/app/login.html)
[![Docker](https://img.shields.io/badge/Docker-Hub-2496ED?style=for-the-badge&logo=docker)](https://hub.docker.com/r/ayoubzaro/inventory-management-system)
[![GitHub](https://img.shields.io/badge/GitHub-Repo-181717?style=for-the-badge&logo=github)](https://github.com/AyOuBzArO/Inventory-management-system)
![Python](https://img.shields.io/badge/Python-3.13-3776AB?style=for-the-badge&logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=for-the-badge&logo=fastapi)

</div>

---

## 📺 Demo Video

> To add your video: drag the `.mp4` file into any GitHub Issue comment box — GitHub will host it and give you a URL like `https://github.com/user-attachments/assets/xxx.mp4`. Paste it below.

<!-- Replace this line with your video URL once uploaded -->

---

## ✨ Features

### 🏠 Smart Dashboard
Personalized greeting with time-of-day awareness, real-time KPI cards (total products, low-stock alerts, inventory value), mini sparkline charts, and quick-action buttons — all in one view.

### 📦 Product Management
Full CRUD operations with drag-and-drop image upload, a **live preview card** that updates as you type, instant stock level updates, and a product search bar.

### 🛒 Sales Tracking
Record sales in seconds, track total transactions, today's revenue, and all-time revenue. Full sales history table with date, product, quantity, and revenue columns.

### 📊 Statistics & Charts
- Daily / Weekly / Monthly revenue cards with percentage trend indicators
- Best & worst selling product rankings
- Interactive **bar chart** — top selling products by units sold
- Interactive **donut chart** — revenue breakdown by product
- **Daily revenue trend** line chart

### 🤖 AI Analytics Assistant
An intelligent chat assistant embedded on every authenticated page, powered by **Ollama locally** with automatic **Groq cloud fallback** when deployed:
- Reads **live database context** on every message: inventory levels, revenue, sales trends, low-stock alerts
- Answers natural-language questions: *"What's my best-selling product?"*, *"Which items are low on stock?"*, *"Give me a business summary"*
- Proactive business insights and restocking recommendations
- 6 quick-suggestion chips with inline SVG icons
- Persistent conversation history, animated typing indicator, markdown rendering (bold, bullet lists)
- Smart provider selection: **Ollama** (local, free, offline) → **Groq** (cloud, free tier, auto-fallback)

### 🌍 Bilingual Interface (EN / FR)
Full English ↔ French toggle on every page, persisted in `localStorage`. Every label, title, button, table header, form field, and dynamic content string is translated.

### 🎨 Light / Dark Theme
One-click theme toggle persisted across sessions and all page navigations.

### 🔐 Authentication & Security
- JWT-based authentication with 60-minute token expiry
- Passwords hashed with **bcrypt** — plain-text passwords are never stored
- Every API route is protected — requests without a valid token are rejected
- `SECRET_KEY` and API keys managed via environment variables, never hardcoded

### 🗄️ Persistent Database
- **PostgreSQL** on Railway (production) — data survives restarts and redeploys
- **SQLite** locally — zero-config for development
- Automatic URL adapter handles Railway's `postgres://` → `postgresql://` format

### 🐳 Docker Ready
Single command to run anywhere. Image published to Docker Hub.

---

## 📸 Screenshots

### Login
![Login](docs/screenshots/login.png)

### Dashboard
![Dashboard](docs/screenshots/dashboard.png)

### Products
![Products](docs/screenshots/products.png)

### Add Product — with Live Preview
![Add Product](docs/screenshots/add-product.png)

### Sales
![Sales](docs/screenshots/sales.png)

### Statistics
![Statistics](docs/screenshots/statistics.png)

### Charts — Top Selling & Revenue by Product
![Charts](docs/screenshots/charts.png)

### AI Assistant — Welcome & Quick Suggestions
![AI Assistant](docs/screenshots/ai-assistant.png)

### AI Assistant — Business Summary Response
![AI Response](docs/screenshots/ai-response.png)

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Backend** | FastAPI · Python 3.13 · Uvicorn |
| **Database** | SQLAlchemy ORM · PostgreSQL (prod) · SQLite (dev) |
| **Auth** | JWT (python-jose) · bcrypt password hashing |
| **AI — Local** | Ollama · qwen2.5:7b |
| **AI — Cloud** | Groq API · llama-3.1-8b-instant (free tier) |
| **Frontend** | Vanilla HTML5 · CSS3 · JavaScript (no framework) |
| **Charts** | ApexCharts (CDN) |
| **i18n** | Custom EN/FR engine · localStorage persistence |
| **Deployment** | Railway · Docker · Docker Hub |

---

## 🚀 Getting Started

### Prerequisites
- Python 3.10+
- [Ollama](https://ollama.com) *(optional — only needed for local AI)*

### Run Locally

```bash
# 1. Clone the repo
git clone https://github.com/AyOuBzArO/Inventory-management-system.git
cd Inventory-management-system

# 2. Create virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
source venv/bin/activate     # macOS / Linux

# 3. Install dependencies
pip install -r requirements.txt

# 4. Start the server
uvicorn backend.main:app --reload --port 8080

# 5. Open in browser → http://localhost:8080
```

### Enable Local AI Assistant
```bash
ollama pull qwen2.5:7b
ollama serve
```

### Run with Docker
```bash
docker pull ayoubzaro/inventory-management-system:latest
docker run -p 8080:8080 ayoubzaro/inventory-management-system:latest
```

---

## ☁️ Deploy on Railway

1. Fork this repository
2. Create a new Railway project → **Deploy from GitHub repo**
3. Add a **PostgreSQL** database service — Railway automatically injects `DATABASE_URL`
4. Set these environment variables on your app service:

| Variable | Description |
|---|---|
| `SECRET_KEY` | Any long random string — used to sign JWT tokens |
| `GROQ_API_KEY` | Free key from [console.groq.com](https://console.groq.com) — enables AI on cloud |

5. Railway redeploys automatically on every `git push` ✅

---

## 📁 Project Structure

```
Inventory-management-system/
├── backend/
│   ├── models/           # SQLAlchemy models: User, Product, Sale
│   ├── routes/           # API routers: auth, products, sales, chat
│   ├── schemas/          # Pydantic request/response schemas
│   ├── auth.py           # JWT creation + bcrypt helpers
│   ├── config.py         # Environment variable loading
│   ├── database.py       # Engine, session, Base
│   └── main.py           # FastAPI app + router registration
├── frontend/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   ├── app.js        # Theme toggle, EN/FR i18n engine, shared utils
│   │   └── chat.js       # AI chat widget (fully self-contained)
│   ├── index.html        # Dashboard
│   ├── sales.html        # Sales page
│   ├── statistics.html   # Statistics & charts
│   ├── add-product.html  # Add / edit product
│   ├── login.html        # Authentication
│   ├── logo.png          # App logo
│   └── ai-avatar.png     # AI assistant avatar
├── docs/
│   └── screenshots/      # README screenshots
├── Dockerfile
├── requirements.txt
└── README.md
```

---

## 🔒 Security

| Concern | Implementation |
|---|---|
| Password storage | bcrypt hash — plain text never saved |
| Session tokens | JWT signed with `SECRET_KEY`, 60 min expiry |
| API protection | Every endpoint requires `Authorization: Bearer <token>` |
| Database access | PostgreSQL on Railway's private network — not internet-accessible |
| Secrets | `SECRET_KEY` and `GROQ_API_KEY` via env vars, never in code |

> **Important:** Always set a strong, unique `SECRET_KEY` in production. The default value is insecure.

---

## 📄 License

MIT © [Ayoub Zarkouni](https://github.com/AyOuBzArO)

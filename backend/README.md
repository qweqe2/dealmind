# DealMind Backend

FastAPI backend for DealMind - a sales deal management and AI assistant platform.

## Tech Stack

- **Framework:** FastAPI 0.115.0
- **Server:** Uvicorn 0.30.6
- **Database:** PostgreSQL with SQLAlchemy 2.0.35
- **Validation:** Pydantic 2.9.2
- **Python:** 3.13+

## Project Structure

```
backend/
├── app/
│   ├── api/
│   │   └── v1/
│   │       ├── __init__.py
│   │       └── routes/
│   │           ├── health.py      # Health check endpoint
│   │           └── deals.py       # Deal management endpoints
│   │
│   ├── core/
│   │   ├── config.py              # Application settings
│   │   └── database.py            # Database connection
│   │
│   ├── models/
│   │   ├── deal.py                # Deal SQLAlchemy model
│   │   ├── timeline.py            # Timeline event model
│   │   └── memory.py              # Deal memory model
│   │
│   ├── schemas/
│   │   ├── deal.py                # Deal Pydantic schemas
│   │   ├── timeline.py            # Timeline schemas
│   │   ├── memory.py              # Memory schemas
│   │   └── common.py              # Shared schemas
│   │
│   ├── services/
│   │   └── deal_service.py        # Business logic layer
│   │
│   └── main.py                    # FastAPI application
│
├── .env                           # Environment variables (not committed)
├── .env.example                   # Environment template
├── requirements.txt               # Python dependencies
└── README.md                      # This file
```

## Setup

### 1. Python Environment

Ensure you have Python 3.13+ installed.

Create and activate virtual environment:

```bash
cd backend
python -m venv .venv
```

**Windows:**
```bash
.venv\Scripts\activate
```

**macOS/Linux:**
```bash
source .venv/bin/activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. PostgreSQL Setup

Install PostgreSQL if not already installed.

Create the database:

```bash
psql -U postgres
```

```sql
CREATE DATABASE dealmind;
\q
```

### 4. Environment Configuration

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Update `.env` with your PostgreSQL credentials:

```env
DATABASE_URL=postgresql+psycopg://postgres:YOUR_PASSWORD@localhost:5432/dealmind
```

**Important:** Never commit `.env` to version control.

### 5. Initialize Database

The database tables are created automatically on application startup using SQLAlchemy's `create_all()`.

## Running the Server

Start the development server:

```bash
uvicorn app.main:app --reload --port 8000
```

The API will be available at:
- **Base URL:** `http://127.0.0.1:8000`
- **API Docs:** `http://127.0.0.1:8000/docs` (Swagger UI)
- **Alternative Docs:** `http://127.0.0.1:8000/redoc`

## API Endpoints

### Health Check

```http
GET /api/health
```

Response:
```json
{"status": "ok"}
```

### Deals

```http
GET  /api/deals              # Get all deals
GET  /api/deals/{id}         # Get single deal
GET  /api/deals/{id}/timeline   # Get deal timeline
GET  /api/deals/{id}/memory     # Get deal memories
```

See [API_CONTRACT.md](../API_CONTRACT.md) for detailed API documentation.

## Development

### Database Models

- **Deal:** Core deal/opportunity information
- **Timeline:** Events and milestones for a deal
- **Memory:** AI agent context and notes

### Adding New Endpoints

1. Create route in `app/api/v1/routes/`
2. Add business logic in `app/services/`
3. Create Pydantic schemas in `app/schemas/`
4. Update `app/api/v1/__init__.py` to include router

### Database Migrations (Future)

When modifying models, use Alembic for migrations:

```bash
# Generate migration
alembic revision --autogenerate -m "description"

# Apply migration
alembic upgrade head
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql+psycopg://postgres:postgres@localhost:5432/dealmind` |
| `API_V1_PREFIX` | API route prefix | `/api` |
| `PROJECT_NAME` | Application name | `DealMind API` |
| `CORS_ORIGINS` | Allowed CORS origins (comma-separated) | `http://localhost:5173,http://127.0.0.1:5173` |
| `LLM_API_KEY` | LLM API key for AI agent | _(empty)_ |
| `HINDSIGHT_API_URL` | Hindsight API URL | _(empty)_ |
| `HINDSIGHT_API_KEY` | Hindsight API key | _(empty)_ |

## Frontend Integration

The frontend expects the backend at `http://127.0.0.1:8000`.

Start both:
1. Backend: `uvicorn app.main:app --reload --port 8000`
2. Frontend: `npm run dev` (from frontend directory)

The frontend will automatically fall back to demo data if the backend is unavailable.

## Future Features

### AI Agent Integration (Phase 2)

- `POST /api/agent/chat` - Deal Detective Q&A
- `POST /api/agent/prepare` - Meeting brief generation
- `POST /api/meetings` - Create meeting records

The service layer is designed to be reusable by AI agent tools.

## Troubleshooting

### Database Connection Failed

Check:
1. PostgreSQL is running
2. Database `dealmind` exists
3. Credentials in `.env` are correct
4. Connection string format: `postgresql+psycopg://user:pass@host:port/dbname`

### Import Errors

Ensure virtual environment is activated:
```bash
.venv\Scripts\activate  # Windows
```

### CORS Issues

Verify frontend URL is in `CORS_ORIGINS` in `.env`.

## Architecture

```
Frontend (React)
       ↓
FastAPI Routes (/api/*)
       ↓
Service Layer (business logic)
       ↓
SQLAlchemy Models
       ↓
PostgreSQL Database
```

AI Agent (future) will call service layer directly, not duplicate database logic.

## Contributing

1. Work on `backend-dev` branch
2. Never commit to `main` directly
3. Never commit `.env` or secrets
4. Test endpoints before committing
5. Update API_CONTRACT.md if changing API structure

## License

Proprietary - DealMind Project

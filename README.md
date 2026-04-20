# Asset Intelligence Assistant

A full-stack demo app for querying and analyzing company asset data with an AI-assisted workflow.

## What It Does

Asset Intelligence Assistant simulates an internal tool for IT, operations, and asset managers.

Users can ask questions such as:

- Which laptops are likely due for refresh soon?
- Which terminated employees still have assigned devices or active software licenses?
- Show assets with missing critical data.
- Which software licenses are underutilized?

The app classifies the request, routes it to a backend analytics task, queries PostgreSQL, and displays structured results with summary cards, charts, and tables.

## Demo Domain

The app uses a fictional company, **NordAxis Mobility Group**, as the demo environment.

NordAxis Mobility Group is imagined as a multinational operations and mobility company with multiple offices, departments, employees, IT assets, software licenses, vendors, and maintenance records.

The data is fictional, but designed to resemble realistic internal company data so the app can demonstrate practical asset-management and operations workflows.

## Main Features

 - AI intent classification
 - Backend-controlled analytics tasks
 - PostgreSQL database with realistic seeded company data
 - Multi-table SQL queries
 - Charts, summary cards, and tables
 - AI decision trace panel
 - Rate limiting on the chat API
 - Responsive frontend
 - Dockerized local setup
 - Deployed frontend, backend, and database

## Supported Analytics

1. Laptop Refresh Candidates

Find laptops that are due or nearly due for replacement.

Uses:

 - assets
 - asset categories
 - offices

2. Offboarding Risk

Find terminated employees who still have active devices or software licenses assigned.

Uses:

 - employees
 - departments
 - offices
 - assets
 - asset assignments
 - software licenses
 - license assignments

3. Data Quality Audit

Find asset records missing important fields like serial number, purchase date, warranty date, or vendor.

Uses:

 - assets
 - asset categories
 - offices

4. License Utilization

Find underused software licenses and estimate unused annual cost.

Uses:

 - software licenses
 - vendors
 - license assignments

## Tech Stack

Frontend:

 - React
 - Vite
 - TypeScript
 - Tailwind CSS
 - shadcn/ui
 - Recharts
 - React Router
 - Vercel

Backend:

 - FastAPI
 - Python
 - SQLAlchemy
 - Pydantic
 - SlowAPI
 - OpenAI-compatible LLM client
 - Render

Database:

 - PostgreSQL
 - Supabase
 - Docker Compose for local development

## AI Design

The AI does not directly write or execute SQL.

The flow is:

User message
→ AI intent classification
→ backend validates selected task
→ backend runs safe SQL analytics query
→ frontend renders structured result

If the AI provider is unavailable or rate-limited, the backend falls back to deterministic routing so the app can still work.

## How to Use

### Option 1: Use the Live App

1. Open:

https://asset-intelligence-demo.vercel.app

2. Log in with one of the demo accounts and try one of the demo prompts.

#### Demo Login

All demo accounts use:

Password: demo123

Available users:

asset.manager@nordaxis.demo
it.manager@nordaxis.demo
operations.manager@nordaxis.demo

### Option 2: Run Locally with Docker Compose

1. Clone the repo:

git clone https://github.com/Jonboyy/asset-intelligence-demo.git
cd asset-intelligence-demo

2. Create a root .env file based on .env.example. and add your API keys.

Example:

POSTGRES_HOST=localhost
POSTGRES_DB=asset_intelligence
POSTGRES_USER=asset_admin
POSTGRES_PASSWORD=asset_admin_dev
POSTGRES_PORT=5433

LLM_PROVIDER=openrouter
LLM_API_KEY=your_api_key_here
LLM_MODEL=openrouter/free
LLM_BASE_URL=https://openrouter.ai/api/v1

APP_ENV=development
APP_NAME=Asset Intelligence Assistant API
APP_DEBUG=true
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173

3. Start the full stack:

docker compose up --build

4. Open the frontend:

http://localhost:5173

Optional: Inspect the backend API docs:

http://localhost:8000/docs

5. Log in with one of the demo accounts and try one of the demo prompts. See demo login help above.

## Tests

Backend tests use pytest.

cd backend
source .venv/bin/activate
pytest -q

## Deployment

The deployed version uses:

Frontend: Vercel
Backend: Render
Database: Supabase Postgres

Main deployment environment variables:

Backend:

DATABASE_URL=your_supabase_database_url
LLM_API_KEY=your_api_key
LLM_MODEL=your_model
LLM_BASE_URL=your_provider_base_url
CORS_ORIGINS=https://asset-intelligence-demo.vercel.app

Frontend:

VITE_API_BASE_URL=your_render_backend_url

## Notes

This is a demo project.

Possible production improvements:

 - real authentication
 - role-based permissions
 - persistent audit logs
 - stronger test coverage
 - LLM provider fallback
 - database schema introspection
 - generic query-planner architecture
 - production monitoring
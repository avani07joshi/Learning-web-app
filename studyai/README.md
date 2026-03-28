# StudyAI — Full Stack Learning App

## Stack
- **Frontend**: React + Vite (Docker → Nginx)
- **Backend**: Python FastAPI + SQLAlchemy (Docker → Uvicorn)
- **Database**: PostgreSQL 16 (Docker volume)
- **Proxy**: Nginx (routes /api → backend, / → frontend)
- **Monitoring**: Prometheus + Grafana
- **IaC**: Terraform (docker provider)
- **CI/CD**: GitHub Actions

## Quick Start (Docker Compose)

```bash
cp backend/.env.example backend/.env
# Edit backend/.env — add your ANTHROPIC_API_KEY
docker compose up --build
```

| Service    | URL                          |
|------------|------------------------------|
| App        | http://localhost:80          |
| API docs   | http://localhost:80/docs     |
| Grafana    | http://localhost:3000        |
| Prometheus | http://localhost:9090        |

Grafana login: `admin` / `studyai123`

## Dev without Docker

```bash
# Backend
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env  # set DATABASE_URL to local postgres
uvicorn main:app --reload --port 8000

# Frontend
cd frontend
npm install
npm run dev
```

## Terraform (local Docker)

```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars  # fill in secrets
terraform init
terraform plan
terraform apply
```

## CI/CD

Push to `main` → GitHub Actions runs:
1. Python lint (ruff) + type check (mypy)
2. Frontend build
3. Docker build both images
4. Smoke test (health check against `/health`)

## Folder Structure

```
studyai/
├── backend/         FastAPI app
├── frontend/        React + Vite app
├── nginx/           Reverse proxy config
├── monitoring/      Prometheus + Grafana
├── terraform/       Infrastructure as code
└── .github/         CI/CD workflows
```

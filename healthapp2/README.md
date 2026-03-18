# HealthApp - EMR & Revenue Cycle Management System

[![FastAPI](https://img.shields.io/badge/FastAPI-0.109.0-009688.svg)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18.2.0-61DAFB.svg)](https://reactjs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0-47A248.svg)](https://www.mongodb.com)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg)](https://www.docker.com)
[![Kubernetes](https://img.shields.io/badge/Kubernetes-Ready-326CE5.svg)](https://kubernetes.io)

A **HIPAA-compliant-ready** Electronic Medical Records (EMR) and Revenue Cycle Management (RCM) system built with modern technologies.

## 🌟 Key Features

### Core Functionality
- ✅ **Patient Management**: Complete CRUD with soft delete (HIPAA compliance)
- ✅ **Clinical Scheduling**: Appointments with 1-4 hour duration constraint
- ✅ **Authorization Workflow**: State machine (Pending → Authorized → Completed)
- ✅ **Dynamic Billing Engine**: Automatic invoice generation with role-based multipliers
- ✅ **PDF Invoices**: Professional invoices via ReportLab
- ✅ **5 Master Reports**: Schedule, Finance, Authorization, Provider Performance, Dashboard

### Technical Highlights
- ✅ **JWT-based RBAC**: Admin, Physician, Clinician roles
- ✅ **State Machine**: Enforced appointment authorization flow
- ✅ **Prometheus Telemetry**: Authorization & payment timing metrics
- ✅ **Kubernetes HPA**: Auto-scaling based on CPU/Memory
- ✅ **Liveness/Readiness Probes**: Self-healing & zero-downtime deployments

## 📋 Table of Contents

- [Architecture](#architecture)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Business Logic](#business-logic)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Development](#development)
- [License](#license)

## 🏗️ Architecture

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│   React + Vite  │─────▶│  FastAPI + JWT  │─────▶│    MongoDB      │
│  (Tailwind CSS) │      │  (Beanie ODM)   │      │  (StatefulSet)  │
└─────────────────┘      └─────────────────┘      └─────────────────┘
        │                         │
        ▼                         ▼
  React Query           Prometheus Metrics
  (TanStack)            (Telemetry)
```

### Tech Stack

**Backend:**
- FastAPI (Python 3.11+)
- Beanie ODM (async MongoDB)
- JWT Authentication (OAuth2)
- ReportLab (PDF generation)
- Prometheus Client

**Frontend:**
- React 18 + Vite
- TailwindCSS
- TanStack Query (React Query)
- Axios

**Infrastructure:**
- Docker (multi-stage builds)
- Kubernetes (HPA, Ingress, Services)
- Nginx Ingress Controller

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose
- Python 3.11+
- Node.js 18+
- MongoDB 7.0+ (or use Docker Compose)

### Using Docker Compose (Recommended)

```bash
# 1. Clone the repository
git clone <repo-url>
cd healthapp

# 2. Start all services
cd infrastructure
docker-compose up -d

# 3. Wait for services to be ready (~30 seconds)
docker-compose logs -f backend

# 4. Seed database with sample data
docker-compose exec backend python scripts/seed_data.py

# 5. Access the application
# Frontend: http://localhost:5173
# Backend API: http://localhost:8000/api/docs
# MongoDB: localhost:27017
```

### Default Login Credentials

After seeding:
- **Admin**: username=`admin`, password=`admin123`
- **Physicians**: username=`physician1-5`, password=`password123`
- **Clinicians**: username=`clinician1-5`, password=`password123`

## 📁 Project Structure

```
healthapp/
├── backend/
│   ├── app/
│   │   ├── models/          # Beanie ODM models
│   │   ├── routers/         # FastAPI route handlers
│   │   ├── services/        # Business logic (billing, PDF, state machine)
│   │   ├── auth/            # JWT & RBAC
│   │   ├── config.py        # Configuration management
│   │   └── main.py          # FastAPI application
│   ├── scripts/
│   │   └── seed_data.py     # Database seeding (50 patients)
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── hooks/           # React Query hooks
│   │   ├── api/             # API client (Axios)
│   │   └── utils/           # Constants & helpers
│   ├── package.json
│   └── Dockerfile
├── infrastructure/
│   ├── docker-compose.yml   # Local development
│   └── k8s/                 # Kubernetes manifests
│       ├── deployment.yaml  # Pod definitions + probes
│       ├── service.yaml     # ClusterIP services
│       ├── ingress.yaml     # Nginx routing
│       └── hpa.yaml         # Horizontal Pod Autoscaler
└── docs/
    └── TECHNICAL_OPERATIONS_GUIDE.md
```

## 💼 Business Logic

### 1. Billing Engine Formula

```
Total = (BASE_RATE × Duration_Hours) × Role_Multiplier

Where:
- BASE_RATE = $150/hour
- Duration_Hours = 1-4 (strict validation)
- Role_Multiplier:
  * Physician: 1.2× (20% premium)
  * Clinician: 1.0× (standard rate)
```

**Example:** 2-hour Physician consultation
```
Total = ($150 × 2) × 1.2 = $360
```

### 2. Authorization State Machine

```
┌──────────────┐
│ Pending Auth │ ← New appointment
└──────┬───────┘
       │ authorize(auth_code)
       ▼
┌──────────────┐
│  Authorized  │
└──────┬───────┘
       │ complete() → Triggers Billing
       ▼
┌──────────────┐
│  Completed   │ ← Invoice auto-generated
└──────────────┘
```

**Rules:**
- Cannot skip states (must authorize before completing)
- Cannot reverse transitions
- Completion triggers automatic invoice generation

### 3. RBAC Permission Matrix

| Resource     | Admin | Physician | Clinician |
|--------------|-------|-----------|-----------|
| Patients     | CRUD  | CRU       | RU        |
| Appointments | CRUD  | CRUD      | CRU       |
| Billing      | CRUD  | R         | None      |
| Reports      | R     | R         | R         |
| Users        | CRUD  | R         | R         |

### 4. Soft Delete (HIPAA Compliance)

Patients are **never** physically deleted from the database:

```python
# Soft delete
patient.is_active = False
patient.deleted_at = datetime.utcnow()
await patient.save()
```

This ensures audit trails and regulatory compliance.

## 📚 API Documentation

### Interactive API Docs

- **Swagger UI**: http://localhost:8000/api/docs
- **ReDoc**: http://localhost:8000/api/redoc

### Key Endpoints

#### Authentication
```
POST /api/auth/login        # OAuth2 login
POST /api/auth/register     # Create user
GET  /api/auth/me           # Get current user
```

#### Patients
```
GET    /api/clients                # List patients
POST   /api/clients                # Create patient
GET    /api/clients/{id}           # Get patient details
PUT    /api/clients/{id}           # Update patient
DELETE /api/clients/{id}           # Soft delete patient
```

#### Appointments
```
GET    /api/scheduling              # List appointments
POST   /api/scheduling              # Create appointment
POST   /api/scheduling/{id}/authorize    # Authorize (Pending → Authorized)
POST   /api/scheduling/{id}/complete     # Complete (Authorized → Completed)
GET    /api/scheduling/{id}/state-info   # Get state machine info
```

#### Billing
```
GET  /api/billing                   # List invoices
GET  /api/billing/{id}              # Get invoice
POST /api/billing/{id}/payment      # Record payment
GET  /api/billing/{id}/pdf          # Download PDF invoice
GET  /api/billing/overdue/summary   # Get overdue buckets (30/60/90 days)
```

#### Reports
```
GET /api/reports/schedule-master        # Weekly provider loads
GET /api/reports/finance-master         # Revenue + overdue buckets
GET /api/reports/auth-master            # Pending authorizations
GET /api/reports/provider-performance   # Physician vs Clinician metrics
GET /api/reports/dashboard-summary      # KPIs for dashboard
```

#### Metrics (Prometheus)
```
GET /api/metrics/prometheus              # Prometheus metrics endpoint
GET /api/metrics/authorization-metrics   # Authorization timing
GET /api/metrics/payment-metrics         # Payment timing
GET /api/metrics/health                  # Health check (for K8s probes)
```

## 🚢 Deployment

### Local Development

See [Quick Start](#quick-start) above.

### Kubernetes Production

```bash
# 1. Create namespace
kubectl create namespace healthapp

# 2. Apply all manifests
kubectl apply -f infrastructure/k8s/ -n healthapp

# 3. Verify deployment
kubectl get pods -n healthapp
kubectl get svc -n healthapp
kubectl get hpa -n healthapp

# 4. Check HPA status
kubectl describe hpa healthapp-backend-hpa -n healthapp
```

### Horizontal Pod Autoscaling

**Backend HPA:**
- Min replicas: 3
- Max replicas: 10
- Triggers: CPU > 70% OR Memory > 80%
- Scale-up: Immediate
- Scale-down: 5-minute cooldown

**Traffic Capacity:**
- 3 replicas: ~300-600 concurrent users
- 10 replicas: ~1000-2000 concurrent users

See [Technical Operations Guide](docs/TECHNICAL_OPERATIONS_GUIDE.md) for detailed HPA behavior.

## 🛠️ Development

### Backend Development

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables
cp .env.example .env
# Edit .env with your configuration

# Run development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Development

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

### Database Seeding

```bash
# With Docker Compose running
docker-compose exec backend python scripts/seed_data.py

# Or locally
cd backend
python scripts/seed_data.py
```

This generates:
- 1 Admin user
- 5 Physicians
- 5 Clinicians
- 50 realistic patients (with Faker)
- Multiple appointments per patient
- Billing records for completed appointments

## 📊 Reports Overview

### 1. Schedule Master
Weekly view of provider appointment loads with total hours.

### 2. Finance Master
- Total revenue
- Paid vs pending
- Overdue buckets (30/60/90 days)
- Collection rate

### 3. Authorization Master
List of appointments stuck in "Pending Auth" with aging.

### 4. Provider Performance
Compare Physician vs Clinician:
- Average visit length
- Revenue per provider
- Revenue per hour
- Visit counts

### 5. Dashboard Summary
High-level KPIs for main dashboard.

## 🔒 Security

### HIPAA-Ready Features

- ✅ **Soft Deletes**: Audit trail preservation
- ✅ **RBAC**: Granular access control
- ✅ **JWT Authentication**: Secure token-based auth
- ✅ **Audit Logging**: All state transitions timestamped
- ✅ **TLS**: Encryption in transit (via Ingress)

### Production Checklist

- [ ] Change all default passwords
- [ ] Generate strong JWT secret key
- [ ] Enable MongoDB authentication
- [ ] Configure TLS certificates (Let's Encrypt)
- [ ] Set up backup strategy
- [ ] Configure log aggregation
- [ ] Set up Prometheus alerting
- [ ] Review RBAC permissions
- [ ] Enable MongoDB encryption at rest

## 📖 Documentation

- [Technical Operations Guide](docs/TECHNICAL_OPERATIONS_GUIDE.md) - Comprehensive ops manual
- [API Documentation](http://localhost:8000/api/docs) - Interactive Swagger UI

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **FastAPI**: Modern, fast web framework
- **Beanie**: Async MongoDB ODM
- **React**: UI library
- **TailwindCSS**: Utility-first CSS framework
- **Kubernetes**: Container orchestration

---

**Built with ❤️ for modern healthcare technology**

*For questions or support: support@healthapp.com*

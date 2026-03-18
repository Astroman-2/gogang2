# HealthApp - Quick Deployment Guide

## 🚀 Quick Start (5 Minutes)

### Prerequisites
- Docker & Docker Compose installed
- Git installed
- 8GB RAM minimum

### Step 1: Clone Repository
```bash
git clone <your-repo-url>
cd healthapp2
```

### Step 2: Start All Services
```bash
cd infrastructure
docker-compose up -d
```

### Step 3: Wait for Services (30 seconds)
```bash
# Watch backend logs until you see "Application ready"
docker-compose logs -f backend
```

### Step 4: Seed Database
```bash
# Populate with 50 patients, appointments, and billing data
docker-compose exec backend python scripts/seed_data.py
```

### Step 5: Access Application
- **Frontend**: http://localhost:5173
- **API Docs**: http://localhost:8000/api/docs
- **MongoDB**: localhost:27017

### Default Login Credentials
```
Admin:      username: admin       password: admin123
Physician:  username: physician1  password: password123
Clinician:  username: clinician1  password: password123
```

---

## 📦 What's Included

### Backend (Python/FastAPI)
✅ JWT Authentication & RBAC  
✅ Patient Management (soft delete for HIPAA)  
✅ Appointment Scheduling (1-4 hour validation)  
✅ Authorization State Machine (Pending → Authorized → Completed)  
✅ Dynamic Billing Engine  
✅ PDF Invoice Generation  
✅ 5 Master Reports  
✅ Prometheus Metrics  

### Frontend (React/Vite)
✅ Dashboard with sidebar navigation  
✅ Patient list & detail views  
✅ Appointment calendar  
✅ Billing & invoices  
✅ Reports (Schedule, Finance, Auth, Performance)  
✅ Responsive design with Tailwind CSS  

### Infrastructure
✅ Docker Compose for local dev  
✅ Kubernetes manifests (Deployment, Service, Ingress, HPA)  
✅ MongoDB StatefulSet  
✅ Nginx Ingress routing  

---

## 🛠️ Development Mode

### Backend Development
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables
cp .env.example .env
# Edit .env with your MongoDB URL

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

---

## 🌐 Production Deployment (Kubernetes)

### Prerequisites
- Kubernetes cluster (v1.24+)
- kubectl configured
- Nginx Ingress Controller
- Cert-manager (for TLS)

### Deploy to Kubernetes
```bash
# Create namespace
kubectl create namespace healthapp

# Apply all manifests
kubectl apply -f infrastructure/k8s/ -n healthapp

# Verify deployment
kubectl get pods -n healthapp
kubectl get svc -n healthapp
kubectl get ingress -n healthapp

# Check HPA status
kubectl describe hpa healthapp-backend-hpa -n healthapp
```

### Configure Domain
Edit `infrastructure/k8s/ingress.yaml`:
```yaml
spec:
  rules:
  - host: healthapp.yourdomain.com  # Change this
```

### Seed Database in Kubernetes
```bash
# Port-forward to MongoDB
kubectl port-forward svc/mongodb 27017:27017 -n healthapp &

# Run seed script locally
cd backend
python scripts/seed_data.py

# Or exec into backend pod
kubectl exec -it <backend-pod-name> -n healthapp -- python scripts/seed_data.py
```

---

## 📊 Key Features Explained

### Billing Engine Formula
```
Total = (BASE_RATE $150 × Duration_Hours) × Role_Multiplier

Multipliers:
- Physician: 1.2× (20% premium)
- Clinician: 1.0× (standard rate)
```

**Example:** 2-hour Physician visit
```
Total = ($150 × 2) × 1.2 = $360
```

### Authorization State Machine
```
Pending Auth → (authorize) → Authorized → (complete) → Completed
                                                           ↓
                                                   Auto-generate Invoice
```

**Rules:**
- Cannot skip states
- Cannot reverse transitions
- Completion triggers automatic billing

### RBAC Permissions
| Resource     | Admin | Physician | Clinician |
|--------------|-------|-----------|-----------|
| Patients     | CRUD  | CRU       | RU        |
| Appointments | CRUD  | CRUD      | CRU       |
| Billing      | CRUD  | R         | None      |
| Reports      | R     | R         | R         |

---

## 🔧 Troubleshooting

### Database Connection Failed
```bash
# Check MongoDB status
docker-compose ps mongodb

# View MongoDB logs
docker-compose logs mongodb

# Restart MongoDB
docker-compose restart mongodb
```

### Backend Not Starting
```bash
# View backend logs
docker-compose logs backend

# Rebuild backend
docker-compose build backend
docker-compose up -d backend
```

### Frontend Not Loading
```bash
# Check if port 5173 is available
lsof -i :5173

# Rebuild frontend
docker-compose build frontend
docker-compose up -d frontend
```

### Seed Data Fails
```bash
# Ensure MongoDB is ready
docker-compose exec mongodb mongosh healthapp --eval "db.stats()"

# Check backend can connect
docker-compose exec backend python -c "from motor.motor_asyncio import AsyncIOMotorClient; print('OK')"
```

---

## 📖 API Documentation

Once running, visit:
- **Swagger UI**: http://localhost:8000/api/docs
- **ReDoc**: http://localhost:8000/api/redoc

### Key Endpoints
```
POST /api/auth/login              # Login
GET  /api/clients                 # List patients
POST /api/scheduling              # Create appointment
POST /api/scheduling/{id}/authorize   # Authorize appointment
POST /api/scheduling/{id}/complete    # Complete → Auto-invoice
GET  /api/billing/{id}/pdf        # Download invoice PDF
GET  /api/reports/finance-master  # Finance report
GET  /api/metrics/prometheus      # Prometheus metrics
```

---

## 🎯 Next Steps

### For Portfolio Demo
1. ✅ Deploy to cloud (AWS, GCP, Azure)
2. ✅ Set up custom domain
3. ✅ Enable HTTPS with Let's Encrypt
4. ✅ Add monitoring (Grafana + Prometheus)
5. ✅ Set up CI/CD pipeline

### For Production Use
1. ⚠️ Change all default passwords
2. ⚠️ Generate secure JWT secret key
3. ⚠️ Enable MongoDB authentication
4. ⚠️ Configure backup strategy
5. ⚠️ Review HIPAA compliance checklist
6. ⚠️ Set up log aggregation
7. ⚠️ Configure alerting

---

## 📞 Support

- **Documentation**: [docs/TECHNICAL_OPERATIONS_GUIDE.md](docs/TECHNICAL_OPERATIONS_GUIDE.md)
- **Issues**: GitHub Issues
- **Email**: support@healthapp.com

---

## 🏆 Architecture Highlights

### Why This Stack?

**Backend: FastAPI**
- Async/await for high concurrency
- Auto-generated OpenAPI docs
- Built-in validation with Pydantic
- Production-ready performance

**Frontend: React + Vite**
- Fast HMR during development
- Optimized production builds
- Modern React patterns (hooks, context)
- TanStack Query for server state

**Database: MongoDB**
- Flexible schema for medical records
- Horizontal scalability
- Rich query language
- Document-oriented (perfect for EMR)

**Infrastructure: Kubernetes**
- Auto-scaling (HPA)
- Self-healing (liveness/readiness probes)
- Zero-downtime deployments
- Cloud-agnostic

---

## 📈 Performance Metrics

### Horizontal Pod Autoscaler
- **Min replicas**: 3
- **Max replicas**: 10
- **Target CPU**: 70%
- **Target Memory**: 80%

### Expected Capacity
- **3 replicas**: 300-600 concurrent users
- **10 replicas**: 1000-2000 concurrent users

### Resource Limits (per pod)
```yaml
Backend:
  requests: 256Mi RAM, 250m CPU
  limits:   512Mi RAM, 500m CPU

Frontend:
  requests: 128Mi RAM, 100m CPU
  limits:   256Mi RAM, 200m CPU
```

---

**Built with ❤️ for modern healthcare technology**

*Last updated: 2024*

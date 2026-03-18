# HealthApp EMR & RCM System - Technical Operations Guide

## Table of Contents
1. [System Architecture Overview](#system-architecture-overview)
2. [Billing Engine Mathematical Precision](#billing-engine-mathematical-precision)
3. [Authorization State Machine](#authorization-state-machine)
4. [Kubernetes Horizontal Pod Autoscaling (HPA)](#kubernetes-hpa)
5. [Deployment Guide](#deployment-guide)
6. [Monitoring & Telemetry](#monitoring-telemetry)
7. [Security & HIPAA Compliance](#security-hipaa-compliance)
8. [Troubleshooting](#troubleshooting)

---

## System Architecture Overview

### Technology Stack

**Backend:**
- **Framework:** FastAPI (Python 3.11+)
- **ORM:** Beanie (async MongoDB ODM)
- **Database:** MongoDB 7.0
- **Authentication:** JWT (OAuth2 Bearer)
- **PDF Generation:** ReportLab

**Frontend:**
- **Framework:** React 18 + Vite
- **Styling:** Tailwind CSS
- **State Management:** TanStack Query (React Query)
- **Routing:** React Router v6

**Infrastructure:**
- **Containerization:** Docker (multi-stage builds)
- **Orchestration:** Kubernetes
- **Ingress:** Nginx Ingress Controller
- **Autoscaling:** Horizontal Pod Autoscaler (HPA)

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    Nginx Ingress                         │
│            (SSL Termination & Load Balancing)            │
└────────────────┬───────────────────────┬─────────────────┘
                 │                       │
        ┌────────▼────────┐     ┌────────▼────────┐
        │   Frontend      │     │    Backend      │
        │   (React SPA)   │     │   (FastAPI)     │
        │   Replicas: 2-6 │     │   Replicas: 3-10│
        └─────────────────┘     └────────┬────────┘
                                         │
                                ┌────────▼────────┐
                                │    MongoDB      │
                                │  (StatefulSet)  │
                                └─────────────────┘
```

---

## Billing Engine Mathematical Precision

### Core Formula

The HealthApp billing engine uses a deterministic formula to calculate invoice amounts:

```
Total = (BASE_RATE × Duration_Hours) × Role_Multiplier
```

Where:
- **BASE_RATE:** $150.00 per hour (configurable via `BASE_RATE` env var)
- **Duration_Hours:** Integer between 1-4 (strictly validated)
- **Role_Multiplier:**
  - Physician: 1.2× (20% premium)
  - Clinician: 1.0× (standard rate)
  - Admin: 1.0× (fallback)

### Calculation Examples

**Example 1: Physician, 2-hour consultation**
```
Subtotal = ($150 × 2) × 1.2
         = $300 × 1.2
         = $360.00
```

**Example 2: Clinician, 3-hour procedure**
```
Subtotal = ($150 × 3) × 1.0
         = $450 × 1.0
         = $450.00
```

**Example 3: Physician, 4-hour emergency**
```
Subtotal = ($150 × 4) × 1.2
         = $600 × 1.2
         = $720.00
```

### Tax Calculation (Future Enhancement)

Currently, tax is set to 0%. When enabled:

```python
tax_amount = subtotal × tax_rate
total_amount = subtotal + tax_amount
```

### Invoice Generation Flow

```
Appointment Completed (State: "Completed")
         │
         ▼
Billing Engine Triggered (automatic)
         │
         ▼
1. Fetch Provider Role → Calculate Multiplier
2. Calculate Subtotal → (BASE_RATE × Duration) × Multiplier
3. Calculate Tax → Subtotal × Tax_Rate (currently 0%)
4. Calculate Total → Subtotal + Tax
5. Generate Invoice Number → INV-YYYY-MMDDHHMMSS
6. Set Due Date → Invoice_Date + 30 days
7. Create Billing Record → MongoDB
         │
         ▼
Invoice Ready for Payment/PDF Export
```

### Code Implementation

Located in: `backend/app/services/billing_engine.py`

```python
@staticmethod
def calculate_subtotal(base_rate: float, duration_hours: int, multiplier: float) -> float:
    """
    Calculate subtotal using the billing formula.
    
    Formula: (BASE_RATE * Duration_Hours) * Role_Multiplier
    """
    return (base_rate * duration_hours) * multiplier
```

---

## Authorization State Machine

### State Diagram

```
┌──────────────┐
│ Pending Auth │ ← Initial state (created)
└──────┬───────┘
       │ authorize(auth_code)
       │ [requires auth_code + authorized_by]
       ▼
┌──────────────┐
│  Authorized  │
└──────┬───────┘
       │ complete()
       │ [triggers billing engine]
       ▼
┌──────────────┐
│  Completed   │ ← Terminal state
└──────────────┘
```

### State Transition Rules

**1. Pending → Authorized**
- **Action:** `authorize(auth_code, authorized_by)`
- **Requirements:**
  - Valid `auth_code` (non-empty string)
  - `authorized_by` (User object, typically Admin/Physician)
- **Effects:**
  - Sets `status = "Authorized"`
  - Records `auth_code`
  - Sets `authorized_at = datetime.utcnow()`
  - Links `authorized_by` to User

**2. Authorized → Completed**
- **Action:** `complete()`
- **Requirements:**
  - Current status must be "Authorized"
- **Effects:**
  - Sets `status = "Completed"`
  - Sets `completed_at = datetime.utcnow()`
  - **TRIGGERS:** Automatic invoice generation via `BillingEngine.create_invoice_from_appointment()`

**3. Invalid Transitions**
- Pending → Completed: **BLOCKED** (must authorize first)
- Any → Pending: **BLOCKED** (cannot reverse)
- Completed → Any: **BLOCKED** (terminal state)

### Error Handling

```python
# Attempting invalid transition
if not appointment.can_authorize():
    raise ValueError(
        f"Cannot authorize appointment. Current status: {appointment.status.value}. "
        f"Expected status: {AuthorizationStatus.PENDING.value}"
    )
```

### Business Logic Rationale

This state machine ensures:
1. **Insurance Verification:** All appointments require explicit authorization before completion
2. **Financial Accuracy:** Billing only occurs after authorization + completion
3. **Audit Trail:** Every state transition is timestamped and attributed
4. **Compliance:** Meets healthcare regulatory requirements for pre-authorization

---

## Kubernetes Horizontal Pod Autoscaling (HPA)

### How HPA Handles Traffic Spikes

The HPA automatically scales pods based on CPU and memory metrics.

#### Backend HPA Configuration

```yaml
minReplicas: 3
maxReplicas: 10
metrics:
  - CPU: 70% average utilization
  - Memory: 80% average utilization
```

#### Scale-Up Behavior

When traffic spikes (e.g., 1000+ concurrent users):

1. **Monitoring:** Metrics Server detects CPU/Memory > threshold
2. **Calculation:** 
   ```
   desired_replicas = ceil(current_replicas × (current_metric / target_metric))
   ```
   Example: 3 replicas at 140% CPU:
   ```
   desired = ceil(3 × (140 / 70)) = ceil(6) = 6 replicas
   ```
3. **Scale-Up:** Kubernetes creates 3 new pods
4. **Stabilization:** 0 seconds (immediate scale-up)

#### Scale-Down Behavior

When traffic subsides:

1. **Cooldown:** 300 seconds (5 minutes) stabilization window
2. **Gradual:** Maximum 50% reduction per minute OR 2 pods/minute (whichever is smaller)
3. **Protection:** Never scales below `minReplicas: 3`

#### Traffic Spike Example

```
Time     | Traffic (RPS) | CPU Usage | Replicas | Action
---------|---------------|-----------|----------|------------------
00:00    | 500           | 50%       | 3        | Stable
00:05    | 2000          | 140%      | 3        | HPA triggered
00:05:30 | 2000          | 85%       | 6        | Scaled up +3
00:10    | 3000          | 120%      | 6        | HPA triggered
00:10:30 | 3000          | 75%       | 10       | Scaled up +4 (max)
00:20    | 500           | 40%       | 10       | Cooling down
00:25    | 500           | 40%       | 7        | Scaled down -3
00:30    | 500           | 45%       | 5        | Scaled down -2
00:35    | 500           | 50%       | 3        | At min replicas
```

#### Resource Requests & Limits

**Backend Pod:**
```yaml
resources:
  requests:
    memory: "256Mi"
    cpu: "250m"
  limits:
    memory: "512Mi"
    cpu: "500m"
```

Each pod can handle ~100-200 concurrent requests under normal load.

**Capacity Planning:**
- **3 replicas (min):** 300-600 concurrent users
- **10 replicas (max):** 1000-2000 concurrent users

### Liveness and Readiness Probes

#### Liveness Probe (Self-Healing)

Ensures container is alive. If it fails, Kubernetes restarts the pod.

```yaml
livenessProbe:
  httpGet:
    path: /api/metrics/health
    port: 8000
  initialDelaySeconds: 30
  periodSeconds: 10
  failureThreshold: 3
```

**Failure Scenario:**
1. Application crashes or hangs
2. Liveness probe fails 3 times (30 seconds)
3. Kubernetes kills and restarts container
4. New container starts and begins serving traffic

#### Readiness Probe (Traffic Control)

Ensures container is ready to serve traffic.

```yaml
readinessProbe:
  httpGet:
    path: /api/health
    port: 8000
  initialDelaySeconds: 10
  periodSeconds: 5
  failureThreshold: 3
```

**During Deployment:**
1. New pod created
2. Container starts but not ready (database connecting)
3. Readiness probe fails → No traffic routed
4. Database connection established
5. Readiness probe succeeds → Traffic starts flowing
6. Old pod drained and terminated

This ensures **zero-downtime deployments**.

---

## Deployment Guide

### Local Development (Docker Compose)

```bash
# 1. Clone repository
git clone <repo-url>
cd healthapp

# 2. Start services
cd infrastructure
docker-compose up -d

# 3. Wait for services to be ready
docker-compose logs -f backend

# 4. Seed database (optional)
docker-compose exec backend python scripts/seed_data.py

# 5. Access application
# Frontend: http://localhost:5173
# Backend API: http://localhost:8000/api/docs
# MongoDB: localhost:27017
```

### Kubernetes Deployment

#### Prerequisites

- Kubernetes cluster (1.24+)
- kubectl configured
- Nginx Ingress Controller installed
- Cert-manager (for TLS)

#### Step-by-Step Deployment

```bash
# 1. Create namespace
kubectl create namespace healthapp

# 2. Apply ConfigMap & Secrets
kubectl apply -f infrastructure/k8s/hpa.yaml -n healthapp

# 3. Deploy database (StatefulSet)
kubectl apply -f infrastructure/k8s/deployment.yaml -n healthapp

# 4. Wait for MongoDB to be ready
kubectl wait --for=condition=ready pod -l tier=database -n healthapp --timeout=300s

# 5. Deploy backend & frontend
kubectl apply -f infrastructure/k8s/deployment.yaml -n healthapp

# 6. Create services
kubectl apply -f infrastructure/k8s/service.yaml -n healthapp

# 7. Configure Ingress
kubectl apply -f infrastructure/k8s/ingress.yaml -n healthapp

# 8. Enable HPA
kubectl apply -f infrastructure/k8s/hpa.yaml -n healthapp

# 9. Verify deployment
kubectl get pods -n healthapp
kubectl get svc -n healthapp
kubectl get hpa -n healthapp
```

#### Database Seeding in Kubernetes

```bash
# Port-forward to MongoDB
kubectl port-forward svc/mongodb 27017:27017 -n healthapp

# In another terminal, run seed script
python backend/scripts/seed_data.py
```

---

## Monitoring & Telemetry

### Prometheus Metrics

Endpoint: `/api/metrics/prometheus`

**Key Metrics:**

1. **Authorization Time** (Pending → Authorized)
   - Metric: `authorization_time_seconds`
   - Type: Histogram
   - Buckets: 1h, 2h, 4h, 8h, 1d, 2d, 7d

2. **Payment Time** (Invoice → Paid)
   - Metric: `payment_time_seconds`
   - Type: Histogram
   - Buckets: 1d, 7d, 14d, 30d, 60d, 90d

3. **Active Appointments by Status**
   - Metric: `active_appointments_total{status="pending|authorized|completed"}`
   - Type: Gauge

4. **Revenue Metrics**
   - `revenue_total_dollars`: Total revenue
   - `outstanding_balance_dollars`: Total unpaid amount

### Prometheus Configuration

```yaml
scrape_configs:
  - job_name: 'healthapp-backend'
    kubernetes_sd_configs:
      - role: pod
        namespaces:
          names:
            - healthapp
    relabel_configs:
      - source_labels: [__meta_kubernetes_pod_label_tier]
        regex: backend
        action: keep
    metrics_path: '/api/metrics/prometheus'
    scrape_interval: 30s
```

### Grafana Dashboards

**Sample Queries:**

Authorization Time (Average):
```promql
rate(authorization_time_seconds_sum[5m]) 
/ 
rate(authorization_time_seconds_count[5m])
```

Payment Time (P95):
```promql
histogram_quantile(0.95, rate(payment_time_seconds_bucket[5m]))
```

---

## Security & HIPAA Compliance

### HIPAA-Ready Features

1. **Soft Deletes:** Patients never physically deleted (audit trail)
2. **Access Control:** Role-Based Access Control (RBAC)
3. **Audit Logging:** All state transitions timestamped
4. **Encryption:** TLS in transit (Ingress), encryption at rest (MongoDB)

### Authentication Flow

```
User → Login (username/password)
  ↓
FastAPI OAuth2PasswordRequestForm
  ↓
Verify credentials (bcrypt password hash)
  ↓
Generate JWT token (HS256)
  ↓
Return token to client
  ↓
Client stores in localStorage
  ↓
Subsequent requests include: Authorization: Bearer <token>
  ↓
FastAPI dependency extracts & validates token
  ↓
RBAC checks permission for endpoint
  ↓
Allow/Deny request
```

### RBAC Permission Matrix

| Resource     | Admin | Physician | Clinician |
|--------------|-------|-----------|-----------|
| Patients     | CRUD  | CRU       | RU        |
| Appointments | CRUD  | CRUD      | CRU       |
| Billing      | CRUD  | R         | -         |
| Reports      | R     | R         | R         |
| Users        | CRUD  | R         | R         |

---

## Troubleshooting

### Common Issues

**1. Database Connection Failed**
```bash
# Check MongoDB status
kubectl get pods -l tier=database -n healthapp

# Check logs
kubectl logs <mongodb-pod> -n healthapp

# Verify connection string
kubectl describe configmap healthapp-config -n healthapp
```

**2. HPA Not Scaling**
```bash
# Check metrics server
kubectl get apiservice v1beta1.metrics.k8s.io

# Check HPA status
kubectl describe hpa healthapp-backend-hpa -n healthapp

# Manually check metrics
kubectl top pods -n healthapp
```

**3. PDF Generation Errors**
```python
# Check ReportLab installation
pip list | grep reportlab

# Verify billing record has all links
await billing.fetch_all_links()
```

**4. State Machine Transition Blocked**
```python
# Check current state
appointment_state_info = await appointmentsAPI.getStateInfo(appointment_id)

# Verify transition is valid
valid_states = AuthorizationStateMachine.get_next_valid_states(current_status)
```

### Health Checks

```bash
# Backend health
curl http://localhost:8000/api/health

# Prometheus metrics
curl http://localhost:8000/api/metrics/prometheus
```

---

## Appendix: Default Credentials

**Admin User:**
- Username: `admin`
- Password: `admin123`

**Physicians:**
- Username: `physician1` to `physician5`
- Password: `password123`

**Clinicians:**
- Username: `clinician1` to `clinician5`
- Password: `password123`

**⚠️ IMPORTANT:** Change all default passwords in production!

---

*HealthApp EMR & RCM System v1.0.0*  
*For support: support@healthapp.com*

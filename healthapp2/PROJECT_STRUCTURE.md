# HealthApp Project Structure

```
healthapp2/
│
├── 📄 README.md                          # Main project documentation
├── 📄 DEPLOYMENT_GUIDE.md                # Quick deployment instructions
├── 📄 PORTFOLIO.md                       # Portfolio showcase document
├── 📄 LICENSE                            # MIT License
├── 📄 .gitignore                         # Git ignore rules
│
├── 📁 backend/                           # FastAPI Backend
│   ├── 📁 app/
│   │   ├── 📄 __init__.py
│   │   ├── 📄 main.py                   # FastAPI application entry
│   │   ├── 📄 config.py                 # Configuration management
│   │   ├── 📄 database.py               # MongoDB connection & Beanie init
│   │   │
│   │   ├── 📁 auth/                     # Authentication & Authorization
│   │   │   ├── 📄 __init__.py
│   │   │   ├── 📄 jwt.py               # JWT token handling
│   │   │   ├── 📄 rbac.py              # Role-Based Access Control
│   │   │   └── 📄 dependencies.py      # FastAPI dependencies
│   │   │
│   │   ├── 📁 models/                   # Beanie ODM Models
│   │   │   ├── 📄 __init__.py
│   │   │   ├── 📄 user.py              # User model (Admin/Physician/Clinician)
│   │   │   ├── 📄 patient.py           # Patient model (soft delete)
│   │   │   ├── 📄 appointment.py       # Appointment model (state machine)
│   │   │   └── 📄 billing.py           # Billing model (dynamic engine)
│   │   │
│   │   ├── 📁 routers/                  # API Endpoints (FastAPI APIRouter)
│   │   │   ├── 📄 __init__.py
│   │   │   ├── 📄 auth.py              # /api/auth/* - Login, register
│   │   │   ├── 📄 clients.py           # /api/clients/* - Patient CRUD
│   │   │   ├── 📄 scheduling.py        # /api/scheduling/* - Appointments
│   │   │   ├── 📄 billing.py           # /api/billing/* - Invoices, PDF
│   │   │   ├── 📄 reports.py           # /api/reports/* - 5 Master Reports
│   │   │   └── 📄 metrics.py           # /api/metrics/* - Prometheus
│   │   │
│   │   ├── 📁 services/                 # Business Logic
│   │   │   ├── 📄 __init__.py
│   │   │   ├── 📄 billing_engine.py    # Dynamic billing calculation
│   │   │   ├── 📄 auth_state_machine.py # Authorization workflow
│   │   │   └── 📄 pdf_generator.py     # ReportLab invoice PDFs
│   │   │
│   │   └── 📁 utils/
│   │       ├── 📄 __init__.py
│   │       └── 📄 validators.py
│   │
│   ├── 📁 scripts/
│   │   └── 📄 seed_data.py              # Faker - 50 patient profiles
│   │
│   ├── 📁 tests/
│   │   └── 📄 __init__.py
│   │
│   ├── 📄 requirements.txt               # Python dependencies
│   ├── 📄 Dockerfile                     # Multi-stage Docker build
│   └── 📄 .env.example                   # Environment variables template
│
├── 📁 frontend/                          # React Frontend
│   ├── 📁 src/
│   │   ├── 📄 main.jsx                  # React entry point
│   │   ├── 📄 App.jsx                   # Main app with routing
│   │   ├── 📄 index.css                 # Tailwind CSS styles
│   │   │
│   │   ├── 📁 components/
│   │   │   ├── 📁 Layout/
│   │   │   │   ├── 📄 Sidebar.jsx       # Navigation sidebar
│   │   │   │   └── 📄 DashboardLayout.jsx # Main layout wrapper
│   │   │   │
│   │   │   ├── 📁 Auth/
│   │   │   │   └── 📄 LoginForm.jsx     # Login page
│   │   │   │
│   │   │   ├── 📁 Patients/
│   │   │   │   ├── 📄 PatientList.jsx   # Patient grid view
│   │   │   │   ├── 📄 PatientDetail.jsx # Patient details
│   │   │   │   └── 📄 PatientForm.jsx   # Create/edit patient
│   │   │   │
│   │   │   ├── 📁 Scheduling/
│   │   │   │   ├── 📄 AppointmentCalendar.jsx # Appointment list
│   │   │   │   ├── 📄 AppointmentForm.jsx     # Create appointment
│   │   │   │   └── 📄 AuthorizationPanel.jsx  # Authorize workflow
│   │   │   │
│   │   │   ├── 📁 Billing/
│   │   │   │   ├── 📄 InvoiceList.jsx   # Invoice table
│   │   │   │   └── 📄 InvoiceDetail.jsx # Invoice details
│   │   │   │
│   │   │   └── 📁 Reports/
│   │   │       ├── 📄 ScheduleMaster.jsx      # Provider workload
│   │   │       ├── 📄 FinanceMaster.jsx       # Revenue & overdue
│   │   │       ├── 📄 AuthMaster.jsx          # Pending authorizations
│   │   │       └── 📄 ProviderPerformance.jsx # Performance metrics
│   │   │
│   │   ├── 📁 api/
│   │   │   └── 📄 client.js             # Axios API client
│   │   │
│   │   ├── 📁 hooks/                    # React Query Hooks
│   │   │   ├── 📄 useAuth.js           # Auth hooks
│   │   │   ├── 📄 usePatients.js       # Patient hooks
│   │   │   ├── 📄 useAppointments.js   # Appointment hooks
│   │   │   ├── 📄 useBilling.js        # Billing hooks
│   │   │   └── 📄 useReports.js        # Report hooks
│   │   │
│   │   └── 📁 utils/
│   │       └── 📄 constants.js          # Constants & helpers
│   │
│   ├── 📁 public/
│   │
│   ├── 📄 index.html                    # HTML entry point
│   ├── 📄 package.json                  # npm dependencies
│   ├── 📄 vite.config.js               # Vite configuration
│   ├── 📄 tailwind.config.js           # Tailwind configuration
│   ├── 📄 postcss.config.js            # PostCSS configuration
│   ├── 📄 nginx.conf                   # Nginx production config
│   └── 📄 Dockerfile                   # Frontend Docker build
│
├── 📁 infrastructure/                   # DevOps Configuration
│   ├── 📄 docker-compose.yml           # Local development setup
│   │
│   └── 📁 k8s/                         # Kubernetes Manifests
│       ├── 📄 deployment.yaml          # Pods + Probes
│       ├── 📄 service.yaml             # ClusterIP services
│       ├── 📄 ingress.yaml             # Nginx routing
│       └── 📄 hpa.yaml                 # Horizontal Pod Autoscaler
│
└── 📁 docs/                            # Documentation
    └── 📄 TECHNICAL_OPERATIONS_GUIDE.md # Comprehensive ops manual
```

---

## 📊 File Statistics

### Backend
- **Python Files**: 23
- **Models**: 4 (User, Patient, Appointment, Billing)
- **Routers**: 6 (Auth, Clients, Scheduling, Billing, Reports, Metrics)
- **Services**: 3 (Billing Engine, State Machine, PDF Generator)

### Frontend
- **React Components**: 15
- **Hooks**: 5 (useAuth, usePatients, useAppointments, useBilling, useReports)
- **Pages**: 12 (Login, Patients, Appointments, Billing, Reports)

### Infrastructure
- **Docker**: 2 Dockerfiles + 1 docker-compose.yml
- **Kubernetes**: 4 YAML manifests

### Documentation
- **Markdown Files**: 4 (README, Deployment, Portfolio, Technical Guide)
- **Total Lines**: ~8,500+

---

## 🎯 Key File Highlights

### Backend
```
📄 app/services/billing_engine.py       # Complex billing algorithm
📄 app/services/auth_state_machine.py   # State machine logic
📄 app/models/appointment.py            # 1-4 hour validation
📄 app/routers/reports.py               # 5 master reports
```

### Frontend
```
📄 src/hooks/useAppointments.js         # React Query patterns
📄 src/components/Reports/FinanceMaster.jsx # Data visualization
📄 src/api/client.js                    # Axios interceptors
```

### Infrastructure
```
📄 infrastructure/k8s/hpa.yaml          # Auto-scaling config
📄 infrastructure/k8s/deployment.yaml   # Liveness/readiness probes
```

---

## 🔢 Lines of Code (Estimated)

| Component       | Files | LOC   |
|----------------|-------|-------|
| Backend        | 23    | 3,500 |
| Frontend       | 20    | 2,500 |
| Infrastructure | 7     | 500   |
| Documentation  | 4     | 2,000 |
| **Total**      | **54**| **8,500** |

---

## 🚀 Getting Started

1. **Navigate** to any component folder
2. **Read** the corresponding documentation
3. **Run** with Docker Compose (see DEPLOYMENT_GUIDE.md)
4. **Explore** the code structure above

---

*This structure demonstrates enterprise-level organization and separation of concerns.*

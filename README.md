# Code Quality Analyzer

A professional SaaS-style dashboard built on top of SonarQube's REST APIs. Features grading, alerts, charts, and a modern dark UI.

---

## 🗂️ Project Structure

```
CODE QUALITY/
├── backend/          ← Node.js + Express API server
│   ├── src/
│   │   ├── routes/       (measures, issues, projects)
│   │   ├── services/     (sonarqube.js — Axios wrapper)
│   │   ├── middleware/   (errorHandler.js)
│   │   └── index.js
│   └── .env
│
└── frontend/         ← React + Vite + Tailwind CSS
    └── src/
        ├── components/   (Sidebar, MetricCard, GradeBadge, AlertBanner, ...)
        ├── pages/        (Dashboard, Issues, Settings)
        ├── services/     (api.js)
        └── utils/        (grading.js)
```

---

## ⚙️ Setup & Run

### Step 1 — Configure SonarQube Token

1. Open SonarQube at **http://localhost:9000**
2. Log in → My Account → Security → Generate Token
3. Copy the token

Edit `backend/.env`:
```
SONARQUBE_URL=http://localhost:9000
SONARQUBE_TOKEN=<paste your token here>
PORT=4000
```

### Step 2 — Start the Backend

```powershell
cd backend
npm start
# Backend runs on http://localhost:4000
```

### Step 3 — Start the Frontend

Open a second terminal:
```powershell
cd frontend
npm run dev
# Frontend runs on http://localhost:5173
```

### Step 4 — Open in Browser

Visit: **http://localhost:5173**

---

## 🔑 Features

| Feature | Details |
|---|---|
| **Dashboard** | Bugs, vulnerabilities, code smells, coverage cards |
| **Quality Gate** | Displays SonarQube quality gate pass/fail |
| **Grading** | A / B / C grades per metric + overall grade |
| **Alerts** | Auto-fires when bugs or vulns exceed thresholds |
| **Bar Chart** | All key metrics visualized |
| **Pie Chart** | Issue type distribution (bugs vs vulns vs smells) |
| **Issues Table** | Paginated, filterable by type & severity |
| **Settings** | Configure alert thresholds, test connection |
| **Project Selector** | Dropdown of all SonarQube projects + manual key input |

---

## 🌐 API Endpoints (Backend)

| Endpoint | Description |
|---|---|
| `GET /api/projects` | List all SonarQube projects |
| `GET /api/projects/status` | Test SonarQube connectivity |
| `GET /api/measures?projectKey=X` | Fetch all key measures |
| `GET /api/issues?projectKey=X&types=BUG&severities=CRITICAL` | Fetch + filter issues |
| `GET /health` | Backend health check |

---

## 🎨 Tech Stack

- **Frontend**: React 18 · Vite · Tailwind CSS 3 · Recharts · React Router · Lucide Icons
- **Backend**: Node.js · Express · Axios · dotenv · cors
- **Integration**: SonarQube REST API (token-based auth)

# Install Docker Engine

```bash
# Install Docker Engine
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io

```

# Install Docker Compose

```bash
# Install Docker Compose plugin
sudo apt-get install -y docker-compose-plugin

# (Optional) If you prefer the standalone binary:
# sudo curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" \
#   -o /usr/local/bin/docker-compose
# sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker compose version
# or for standalone:
# docker-compose --version
```

# Clone the repository

```bash
git clone https://github.com/digitalPavel/solar-dashboard.git
cd solardash
```

> By default, all connection strings and settings are taken from `docker-compose.yml` and `appsettings.Development.json`.

# Build & Run

```bash
docker-compose up -d --build
```

# Verify services

* Frontend:  [http://localhost:4200](http://localhost:4200)
* Swagger UI (Backend):  [http://localhost:5000/swagger](http://localhost:5000/swagger)
* KPI JSON API:  [http://localhost:5000/api/kpi/hourly](http://localhost:5000/api/kpi/hourly)

---

# Project Structure

```
/
├─ docker-compose.yml            # Orchestrates DB, Backend, Frontend
├─ measurement_dump_04132025.sql # Initial TimescaleDB data import
├─ solardash.Server/             # ASP.NET Core backend
│   ├─ Dockerfile.api            # Build & runtime stages
│   ├─ Program.cs                # Startup + auto-migrations
│   ├─ appsettings*.json         # Configuration + connection strings
│   ├─ Migrations/               # EF Core migrations
│   └─ …                         # Additional backend code
├─ solardash.Client/             # Angular frontend
│   ├─ Dockerfile.frontend       # Build + Nginx serve
│   ├─ package.json, angular.json
│   ├─ proxy.conf.json           # Local `ng serve` proxy (dev)
│   └─ src/                      # Angular components & services
└─ nginx/
    └─ default.conf              # Nginx reverse-proxy for `/api` and SPA
```

---

# Architecture Components

* **DB**: TimescaleDB (PostgreSQL 14) with hypertable & continuous aggregates
* **Backend**: ASP.NET Core 9

  * EF Core migrations & `db.Database.Migrate()` on startup
  * KPI controller exposes `/api/kpi/hourly`
* **Frontend**: Angular 19 + Chart.js (ng2-charts)

  * HTTP service calls `/api/kpi/hourly`
  * Visualizes KPI data on a line chart
* **Nginx**: Serves static Angular files and proxies `/api` requests to Backend

---

# Development Mode

* **Backend**

  ```bash
  cd solardash.Server
  dotnet run
  ```

* **Frontend**

  ```bash
  cd solardash.Client
  ng serve --open --proxy-config proxy.conf.json
  ```

---

# License

MIT ©&#x20;

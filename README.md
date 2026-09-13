# Toilapp

Toilapp helps people find public toilets in Oslo, inspect the available information and open walking directions in Google Maps. The user-facing interface is in Norwegian.

- [Open the live application](https://toilapp-frontend-production.up.railway.app)
- [View the live toilet API](https://toilapp-backend-production.up.railway.app/api/toilets)

The application is deployed on Railway with separate frontend, backend and PostgreSQL services. **82 toilets were imported successfully from Oslo municipality on 13 September 2026.**

## Features

- Browser geolocation, with Oslo as a fallback search area
- Interactive React Leaflet map with OpenStreetMap tiles
- Up to six nearby results within 2 km, ordered by straight-line distance
- Selection from map markers or a list, with a shared detail view
- Toilet names, recorded accessibility status and source comments
- Google Maps walking directions
- Responsive desktop and mobile layouts

## Technology

The backend uses Java 21, Spring Boot, Spring Data JPA and PostgreSQL. Flyway manages the database schema, and Maven builds the application. Backend tests use JUnit, Mockito and H2.

The frontend uses React, TypeScript and Vite, with React Leaflet for the map. Vitest and React Testing Library cover frontend behavior. Local development uses Docker Compose to run PostgreSQL.

## How the application works

An explicit import reads toilet data from Oslo municipality's ArcGIS service and stores it in PostgreSQL. During normal use, the Spring Boot API reads this stored data; it does not contact the municipality for every visitor.

The browser requests the toilet list and asks for the user's position. The frontend calculates straight-line distances from the search centre, keeps toilets within 2 km and displays the closest six. Selecting a marker or list item opens the same detail card. Google Maps handles walking directions outside the application.

### Backend responsibilities

The import client fetches the source records, the mapper converts source fields into the application's model, and the import service checks the mapped records before asking a transactional writer to save them. Keeping database writing in a separate Spring bean allows Spring to apply one transaction around the write operation.

For user requests, the controller handles the HTTP endpoints, the service reads toilets through the repository, and a response DTO defines the JSON sent to the frontend. This keeps database entities separate from the public API representation.

### Why store the data in PostgreSQL?

Storing a local copy makes user requests independent of the municipality's response time and temporary outages. It also gives the application a consistent dataset with stable local IDs and lets the import handle source-specific validation in one place.

The tradeoff is freshness: changes at the source do not appear until another manual import succeeds. This is a small portfolio application, not a real-time availability service.

### Location and distance

When location is unavailable, the search uses Oslo city centre. If the user's actual position has no nearby results, the interface offers **Vis Oslo** to search there instead. The Oslo centre is a search location, never a substitute for the user's real position marker.

Distances describe the current search centre and use the Haversine formula. They are straight-line estimates, not walking-route lengths. When searching Oslo from elsewhere, the displayed distance is from Oslo city centre; Google Maps determines the starting point for the actual walking route.

### Shared selection

`App.tsx` stores the selected toilet ID and derives its details from the current displayed results. The map and list therefore share one selection. Changing the search centre clears that selection.

## Project structure

```text
restroom-finder/
├── backend/
│   ├── src/main/java/no/jens/toilapp/
│   │   ├── importer/       # Source fetching, mapping and database import
│   │   └── toilet/         # Entity, repository, service, controller and response
│   ├── src/main/resources/db/migration/
│   ├── src/test/
│   ├── pom.xml
│   ├── mvnw
│   └── mvnw.cmd
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── test/
│   │   ├── types/
│   │   └── utils/
│   └── package.json
├── docs/data-source.md
└── docker-compose.yml
```

## Run locally

You need Java 21, Node.js 24 with npm, Docker with Docker Compose, and Git. The Maven wrapper is included.

### 1. Start PostgreSQL

From the repository root:

```powershell
docker compose up -d postgres
docker compose ps
```

PostgreSQL is available locally on port `5432`, with database name `toilapp`. The backend's default connection settings match the local Compose service. Its named volume preserves data across normal container restarts.

### 2. Import toilet data

A new database is empty. Flyway creates the schema at backend startup; it does not populate the toilet table. Run an explicit import before using a fresh local installation.

From `backend`, in Windows PowerShell:

```powershell
.\mvnw.cmd "-Dspring-boot.run.arguments=--toilapp.import.enabled=true --spring.main.web-application-type=none" spring-boot:run
```

From `backend`, on macOS or Linux:

```bash
sh mvnw -Dspring-boot.run.arguments="--toilapp.import.enabled=true --spring.main.web-application-type=none" spring-boot:run
```

This starts a non-web application for the import. It logs counts for created, updated, unchanged and rejected records. The import is idempotent: repeating it with the same source data does not create duplicate rows. Existing source records retain their local IDs when updated.

Import is disabled during normal server startup. Refresh is manual, and records missing from a later source response are retained. See [the data-source documentation](docs/data-source.md) for field mapping, inspection commands and failure behavior.

### 3. Start the backend

In Windows PowerShell:

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

On macOS or Linux:

```bash
cd backend
sh mvnw spring-boot:run
```

Run these commands from the repository root, or omit `cd backend` if already there. The backend normally listens at `http://localhost:8080` and exposes:

```text
GET /api/toilets
GET /api/toilets/{id}
```

### 4. Start the frontend

In another terminal, from the repository root:

```powershell
cd frontend
npm ci
npm run dev
```

Open `http://localhost:5173`. The API URL defaults to `http://localhost:8080`. If Vite selects another port, use an origin allowed by the backend's CORS configuration; the defaults include ports 5173, 5174 and 4173.

## Tests and production build

From `frontend`:

```powershell
npm test
npm run lint
npm run build
```

The build checks TypeScript and produces static files in `frontend/dist`. `npm run preview` can serve that build locally for inspection.

From `backend`, in Windows PowerShell:

```powershell
.\mvnw.cmd test
.\mvnw.cmd package
```

On macOS or Linux:

```bash
sh mvnw test
sh mvnw package
```

The packaged backend can be started from `backend` with:

```text
java -jar target/toilapp-0.0.1-SNAPSHOT.jar
```

Frontend tests cover loading and errors, geolocation, distance and nearby search, selection, detail content and walking URLs. Map-related tests use mocks; they do not replace checking the real map in a browser.

Backend tests cover API responses, service and repository behavior, source mapping and error handling, and repeated imports. Database tests use H2 with Flyway, rather than the deployed PostgreSQL instance. The test configuration disables import so tests do not call the live source.

## Railway deployment

The frontend and backend use separate service roots, `/frontend` and `/backend`. PostgreSQL runs as a third service and retains the imported dataset. The frontend serves the Vite production build, while the backend runs the packaged Spring Boot application.

The application reads the following deployment variables:

| Service | Variable | Purpose |
| --- | --- | --- |
| Backend | `PORT` | HTTP listening port, with 8080 as the local default |
| Backend | `DB_URL` | PostgreSQL JDBC URL in the form `jdbc:postgresql://<host>:<port>/<database>` |
| Backend | `DB_USERNAME`, `DB_PASSWORD` | Database credentials supplied through service variables |
| Backend | `FRONTEND_ALLOWED_ORIGINS` | Allowed browser origins, including the live frontend HTTPS origin |
| Frontend | `VITE_API_BASE_URL` | Public backend origin: `https://toilapp-backend-production.up.railway.app` |

`VITE_API_BASE_URL` is embedded during the frontend build. It contains the backend origin without `/api/toilets`; the API client appends that path. Changing the value requires rebuilding the frontend.

Flyway applies migrations and Hibernate validates the schema at backend startup. Normal deployments leave import disabled. A manual import must target the intended database and run separately from the long-running API process. Database credentials belong in service variables, not in documentation or frontend code.

## Current limitations

- Coverage is limited to the imported Oslo dataset and may not reflect current conditions at a toilet.
- Refresh is manual. There is no scheduled import or synchronization of source deletions.
- Opening hours and live availability are not provided by the application.
- Accessibility labels reflect the source assessment, which may be missing or outdated.
- Distances are straight-line estimates; walking navigation is handed off to Google Maps.
- The browser downloads the full dataset and performs nearby searching locally, which suits the current small dataset.
- The application has no user accounts or user-submitted reports.

## Possible next steps

Useful improvements include clearer refresh information, broader PostgreSQL integration tests, automated build checks and better handling of temporary API failures. Scheduled refresh and a policy for removed source records could follow once their behavior is defined. A much larger dataset could justify moving geographical search to the backend.

## Author

Built by Jens J. Bonten as a full-stack portfolio project.

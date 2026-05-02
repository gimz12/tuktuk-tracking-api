# Tuk-Tuk Tracking & Movement Logging API

> **Student ID:** COBSCCOMP242P-071
>
> Module: NB6007CEM — Web API Development | Batch 24.2P
> Lecturer: Niranga Dharmaratna

A RESTful API for the Sri Lanka Police that records and queries the real-time
locations of registered three-wheelers (tuk-tuks). Built with **NestJS +
TypeScript + MongoDB Atlas**, deployed on **Render**.

---

## Live deployment

| Resource              | URL                                                            |
|-----------------------|----------------------------------------------------------------|
| API base              | `https://tuktuk-tracking-api.onrender.com/api/v1`              |
| Swagger / OpenAPI UI  | `https://tuktuk-tracking-api.onrender.com/api/docs`            |
| Health check          | `https://tuktuk-tracking-api.onrender.com/api/v1/health`       |

---

## Stack

- **Runtime:** Node.js 20 + NestJS 10 (TypeScript, ES2022 target)
- **Database:** MongoDB Atlas (M0 free tier) via Mongoose
- **Auth:** JWT with two scopes (`user-jwt` and `device-jwt`)
- **RBAC:** four roles (`admin`, `province_admin`, `station_officer`, `device`)
- **Validation:** `class-validator` DTOs with a global `ValidationPipe`
- **Docs:** `@nestjs/swagger` auto-generated at `/api/docs`
- **Hosting:** Render Web Service (free tier)

---

## Local setup

```bash
yarn install
cp .env.example .env
# edit MONGODB_URI in .env
yarn seed
yarn start:dev
```

### Default user accounts (created by the seeder)

| Role               | Email                              | Default password           |
|--------------------|------------------------------------|----------------------------|
| HQ Admin           | `admin@police.gov.lk`              | `admin123`                 |
| Province Admin (WP)| `province.wp@police.gov.lk`        | `Province#WP2026`          |
| Station Officer    | `officer.colfort@police.gov.lk`    | `Officer#Col2026`          |

---

## Demo: simulating tuk-tuk location pings

```bash
node scripts/simulate-pings.mjs \
  --api https://tuktuk-tracking-api.onrender.com/api/v1 \
  --creds simulation-data/device-credentials.json \
  --count 5 \
  --interval 5000
```

---

## API endpoints

| Group       | Endpoint                                          | Roles                                          |
|-------------|---------------------------------------------------|------------------------------------------------|
| auth        | `POST /auth/login`                                | public                                         |
| auth        | `POST /auth/device-token`                         | public                                         |
| auth        | `GET  /auth/me`                                   | any user                                       |
| users       | `POST /users` `GET /users`                        | admin                                          |
| provinces   | `GET /provinces` `POST /provinces`                | all users / admin                              |
| districts   | `GET /districts` `POST /districts`                | all users / admin                              |
| stations    | `GET /stations` `POST /stations`                  | all users / admin + province admin             |
| drivers     | `GET/POST /drivers`                               | police users                                   |
| devices     | `GET/POST /devices`                               | admin (POST), province admin / station (GET)   |
| tuktuks     | `GET/POST /tuktuks`, `GET /tuktuks/:id`           | police users (scope-filtered)                  |
| pings       | `POST /pings`, `POST /pings/bulk`                 | device only                                    |
| locations   | `GET /locations/live`                             | police users (scope-filtered)                  |
| locations   | `GET /locations/history`                          | police users (scope-filtered)                  |
| locations   | `GET /locations/tuktuks/:id/last`                 | police users                                   |
| locations   | `GET /locations/tuktuks/:id/history`              | police users                                   |

Full details at `/api/docs`.

---

## Project layout

```
src/
  main.ts
  app.module.ts
  common/
  config/
  modules/
    auth/
    users/
    provinces/
    districts/
    stations/
    drivers/
    devices/
    tuktuks/
    pings/
    locations/
    health/
  seed/
scripts/
  simulate-pings.mjs
simulation-data/
render.yaml
```

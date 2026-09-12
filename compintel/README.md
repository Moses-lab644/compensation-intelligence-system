# Compensation Intelligence System

A backend-focused compensation intelligence API for structured, comparable compensation data across companies, roles, career levels, and locations.

Built for the **AI Software Engineer Internship Demo — Track B: Compensation Intelligence System**.

## Role

**Backend Engineer**

## Track

**Track B — Compensation Intelligence System**

## Overview

This system transforms raw compensation submissions into structured data that can be filtered, aggregated, and compared.

The core design principle is:

> **Career levels matter more than job titles.**

A compensation record is therefore associated with a company, role, career level, location, and compensation structure.

The API calculates total compensation consistently and provides company-level summaries and multi-company comparisons.

## Tech Stack

* **Node.js**
* **TypeScript**
* **NestJS**
* **PostgreSQL**
* **Prisma ORM**
* **Zod**
* **REST API**
* **Git/GitHub**

## Architecture

The backend follows a modular NestJS architecture:

```text
HTTP Request
     │
     ▼
Controller
     │
     ▼
Validation (Zod)
     │
     ▼
Service Layer
     │
     ▼
Prisma ORM
     │
     ▼
PostgreSQL
```

### Main modules

```text
src/
├── modules/
│   ├── compensations/
│   │   ├── compensation.controller.ts
│   │   ├── compensation.service.ts
│   │   ├── compensation.schema.ts
│   │   └── compensation.query.schema.ts
│   │
│   ├── companies/
│   │   ├── company.controller.ts
│   │   ├── company.service.ts
│   │   └── company.module.ts
│   │
│   └── prisma/
│       ├── prisma.service.ts
│       └── prisma.module.ts
│
├── utils/
│   └── normalize.ts
│
├── app.module.ts
├── health.controller.ts
└── main.ts
```

## Core Features

### 1. Compensation ingestion

Create compensation records containing:

* Company
* Role
* Career level
* Country
* City
* Base salary
* Bonus
* Stock/equity
* Currency
* Data source

### 2. Input validation

Zod validates incoming data before it reaches the database.

Examples:

* Base salary must be greater than zero.
* Bonus and stock cannot be negative.
* Currency must be a valid 3-letter code.
* Required fields cannot be empty.
* Query pagination is constrained to safe limits.

### 3. Company normalization

Company names are normalized before lookup.

For example:

```text
"  GOOGLE  "
"Google"
"google"
```

all resolve to the same normalized company:

```text
google
```

This prevents duplicate company entities caused by inconsistent user input.

### 4. Role normalization

Roles use the same normalization strategy.

For example:

```text
" Software Engineer "
"software engineer"
```

resolve to the same normalized role.

### 5. Total compensation calculation

The API does not trust a client-supplied total compensation value.

Instead:

```text
Total Compensation
=
Base Salary
+
Bonus
+
Stock
```

If bonus or stock is missing, it defaults to:

```text
0
```

### 6. Duplicate detection

The API rejects an identical compensation record when the relevant compensation attributes already exist.

This protects the dataset from accidental duplicate submissions.

### 7. Compensation filtering

Compensation records can be filtered by:

* Company
* Role
* Level
* Country
* City
* Currency

### 8. Pagination

Compensation results support pagination:

```text
?page=1&limit=10
```

The API returns:

* Current page
* Page size
* Total records
* Total pages

### 9. Company aggregation

Company summary endpoints calculate:

* Number of compensation records
* Average base salary
* Average bonus
* Average stock
* Average total compensation
* Compensation grouped by career level

### 10. Multi-company comparison

The comparison endpoint aggregates compensation data across multiple companies and ranks companies by average total compensation.

Example:

```text
Google       $202,500
Microsoft    $180,000
Amazon       $120,000
```

## Database Designs

The database contains five core entities:

```text
Company
   │
   └── Compensation

Role
   │
   └── Compensation

Level
   │
   └── Compensation

Location
   │
   └── Compensation

Compensation
   ├── Company
   ├── Role
   ├── Level
   └── Location
```

### Company

Stores canonical company names and their normalized representations.

### Role

Stores canonical job roles and normalized role names.

### Level

Represents career levels such as:

```text
L3
L4
L5
Senior
Staff
```

### Location

Stores country and city combinations.

### Compensation

Stores the actual compensation record.

Important fields include:

```text
baseSalary
bonus
stock
totalCompensation
currency
source
```

## API Endpoints

### Health Check

```http
GET /health
```

Example response:

```json
{
  "success": true,
  "status": "ok",
  "service": "compensation-intelligence-api"
}
```

### Create Compensation

```http
POST /api/compensations
```

Example request:

```json
{
  "company": "Google",
  "role": "Software Engineer",
  "level": "L4",
  "country": "United States",
  "city": "New York",
  "baseSalary": 150000,
  "bonus": 20000,
  "stock": 30000,
  "currency": "USD",
  "source": "user_submission"
}
```

### Get Compensation Records

```http
GET /api/compensations
```

Example:

```http
GET /api/compensations?company=Google&role=Software%20Engineer&level=L4
```

### Company Summary

```http
GET /api/companies/:company/summary
```

Example:

```http
GET /api/companies/Google/summary
```

### Compare Companies

```http
GET /api/compensations/compare
```

Example:

```http
GET /api/compensations/compare?companies=Google,Microsoft,Amazon&role=Software%20Engineer&level=L4&currency=USD
```

The response ranks companies by average total compensation.

## Research-Informed Design

The system was designed after reviewing major compensation intelligence platforms including:

* Levels.fyi
* 6figr
* AmbitionBox
* Glassdoor

Common capabilities observed across these platforms include:

* Company search
* Role/title search
* Location filtering
* Base salary
* Bonus
* Stock/equity
* Total compensation
* Career levels
* Company comparison
* Compensation aggregation

The project focuses on the backend capabilities most relevant to a compensation intelligence system rather than attempting to reproduce every feature of a production compensation platform.

## Key Design Decisions

### Levels are first-class data

Career levels are stored independently instead of being treated as part of the job title.

This allows compensation to be compared more meaningfully across organizations.

### Total compensation is calculated server-side

The API calculates total compensation from its components:

```text
base + bonus + stock
```

This prevents inconsistent totals supplied by clients.

### Missing compensation components default to zero

A missing bonus or stock value does not invalidate an otherwise valid compensation record.

Instead:

```text
missing bonus → 0
missing stock → 0
```

### Currency conversion is outside the MVP

The current system only compares records within the same currency.

Foreign exchange conversion is intentionally excluded from the MVP to avoid introducing external exchange-rate dependencies and additional data consistency concerns.

### Verification is simplified

A production compensation intelligence platform would require stronger verification and moderation systems.

This MVP focuses primarily on:

* Data structure
* Validation
* Normalization
* Duplicate prevention
* Aggregation
* Comparison
* API reliability

## Error Handling

The API returns appropriate HTTP errors for invalid operations.

Examples:

```text
400 Bad Request
```

for invalid input.

```text
409 Conflict
```

for duplicate compensation records.

```text
500 Internal Server Error
```

for unexpected server failures.

## Local Development

### 1. Clone the repository

```bash
git clone https://github.com/Moses-lab644/compensation-intelligence-system.git
cd compensation-intelligence-system
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file:

```env
DATABASE_URL="your-postgresql-connection-string"
```

Do not commit `.env`.

A safe template is available in:

```text
.env.example
```

### 4. Run database migrations

```bash
npx prisma migrate dev
```

### 5. Seed development data

```bash
npm run seed
```

### 6. Start the development server

```bash
npm run dev
```

The API runs on:

```text
http://localhost:5000
```

## Production Build

Build the TypeScript application:

```bash
npm run build
```

Start the compiled application:

```bash
npm start
```

For production database migrations:

```bash
npm run prisma:migrate
```

## Testing and Reliability

The backend has been manually tested against cases including:

* Negative salaries
* Negative bonuses
* Invalid currencies
* Missing required fields
* Missing bonus/stock
* Duplicate compensation records
* Company name normalization
* Company filtering
* Role filtering
* Location filtering
* Pagination
* Company aggregation
* Multi-company comparison
* Currency filtering
* Combined filters
* Invalid pagination limits
* Health checks

## Future Improvements

Potential future improvements include:

* Compensation data verification
* Authentication and authorization
* User-submitted compensation moderation
* More sophisticated company alias normalization
* Salary distribution statistics
* Compensation percentiles
* Historical compensation trends
* Currency conversion
* More advanced analytics
* Automated data ingestion pipelines
* Background processing for large ingestion workloads

## Project Status

**Backend MVP completed**

The current implementation focuses on building a reliable compensation intelligence backend with structured data, validation, normalization, aggregation, and comparison capabilities.

---

Built with **NestJS, TypeScript, PostgreSQL, Prisma, and Zod**.

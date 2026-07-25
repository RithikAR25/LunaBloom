# LunaBloom — API Contract

**Version:** 1.0.0  
**Status:** Draft  
**Date:** 2026-07-22  

> **Note:** LunaBloom V1 has no backend. This document defines the REST API contract that the V2 backend must implement, enabling the frontend to remain unchanged when the backend is introduced. The backend may be implemented as Firebase Cloud Functions, Spring Boot, or any RESTful framework — the contract is backend-agnostic.

---

## Table of Contents
1. [API Design Principles](#1-api-design-principles)
2. [Authentication](#2-authentication)
3. [Common Conventions](#3-common-conventions)
4. [Endpoints — Auth](#4-endpoints--auth)
5. [Endpoints — User Profile](#5-endpoints--user-profile)
6. [Endpoints — Cycles](#6-endpoints--cycles)
7. [Endpoints — Daily Logs](#7-endpoints--daily-logs)
8. [Endpoints — Symptoms](#8-endpoints--symptoms)
9. [Endpoints — Health Notes](#9-endpoints--health-notes)
10. [Endpoints — Intercourse Logs](#10-endpoints--intercourse-logs)
11. [Endpoints — Sync](#11-endpoints--sync)
12. [Error Responses](#12-error-responses)
13. [Rate Limiting](#13-rate-limiting)

---

## 1. API Design Principles

| Principle | Implementation |
|---|---|
| **RESTful** | Resource-based URLs; HTTP verbs for operations |
| **Offline-first compatible** | Sync endpoint accepts batches; not real-time |
| **Privacy-first** | No analytics endpoints; no behavioral tracking |
| **Idempotent writes** | PUT/PATCH operations are safe to retry |
| **Soft deletes** | No hard DELETE — records are marked `deletedAt` |
| **Versioned** | All endpoints prefixed with `/api/v1/` |
| **JSON** | All request/response bodies are `application/json` |
| **UUID keys** | All resource IDs are UUIDs — no auto-increment integers |

---

## 2. Authentication

V2 uses **JWT Bearer tokens** issued after Firebase Authentication (or equivalent).

```
Authorization: Bearer <jwt_token>
```

- Access token lifetime: 1 hour
- Refresh token lifetime: 30 days
- All endpoints (except `/auth/*`) require a valid Bearer token
- Tokens are stored in Expo SecureStore on the client

---

## 3. Common Conventions

### 3.1 Base URL

```
Production:  https://api.lunabloom.app/api/v1
Development: http://localhost:8080/api/v1
```

### 3.2 Date Format

All dates are **ISO 8601 UTC strings**:
- Date only: `"2026-07-22"`
- Date + time: `"2026-07-22T14:30:00.000Z"`

### 3.3 Pagination

List endpoints support cursor-based pagination:

```
GET /cycles?limit=20&cursor=<last_item_id>
```

Response includes:
```json
{
  "data": [...],
  "pagination": {
    "cursor": "uuid-of-last-item",
    "hasMore": true,
    "total": 48
  }
}
```

### 3.4 Sync Fields

Every resource in the database and API response includes these sync fields:

```json
{
  "id": "uuid-v4",
  "createdAt": "2026-07-22T14:30:00.000Z",
  "updatedAt": "2026-07-22T15:00:00.000Z",
  "deletedAt": null,
  "syncStatus": "SYNCED"
}
```

### 3.5 HTTP Methods

| Method | Usage |
|---|---|
| `GET` | Read resource(s) |
| `POST` | Create new resource |
| `PUT` | Full replace of resource |
| `PATCH` | Partial update of resource |
| `DELETE` | Soft delete (sets `deletedAt`) |

---

## 4. Endpoints — Auth

### POST /auth/register

Register a new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response:** `201 Created`
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "createdAt": "2026-07-22T14:30:00.000Z"
  },
  "tokens": {
    "accessToken": "eyJ...",
    "refreshToken": "eyJ...",
    "expiresIn": 3600
  }
}
```

---

### POST /auth/login

Authenticate with email and password.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response:** `200 OK`
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  },
  "tokens": {
    "accessToken": "eyJ...",
    "refreshToken": "eyJ...",
    "expiresIn": 3600
  }
}
```

---

### POST /auth/refresh

Exchange a refresh token for a new access token.

**Request:**
```json
{
  "refreshToken": "eyJ..."
}
```

**Response:** `200 OK`
```json
{
  "accessToken": "eyJ...",
  "expiresIn": 3600
}
```

---

### POST /auth/logout

Invalidate the current session.

**Response:** `204 No Content`

---

### DELETE /auth/account

Permanently delete the user account and all associated data.

**Request:**
```json
{
  "confirmPassword": "securepassword123",
  "confirmDelete": "DELETE MY ACCOUNT"
}
```

**Response:** `204 No Content`

---

## 5. Endpoints — User Profile

### GET /profile

Get the current user's profile.

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "preferredName": "Meera",
  "dateOfBirth": "1998-05-14",
  "height": 162,
  "weight": 58,
  "averageCycleLength": 28,
  "averagePeriodDuration": 5,
  "primaryGoal": "TRACK_CYCLE",
  "conditions": ["PCOS"],
  "birthControlType": "NONE",
  "trackingMode": "CYCLE",
  "learnModeEnabled": true,
  "onboardingCompleted": true,
  "createdAt": "2026-07-22T14:30:00.000Z",
  "updatedAt": "2026-07-22T14:30:00.000Z",
  "deletedAt": null,
  "syncStatus": "SYNCED"
}
```

---

### PUT /profile

Replace the user's profile (full update).

**Request:** Same shape as GET response (without `id`, `createdAt`, `syncStatus`)

**Response:** `200 OK` — Updated profile object

---

### PATCH /profile

Partial update of the user's profile.

**Request:**
```json
{
  "preferredName": "Meera",
  "averageCycleLength": 30
}
```

**Response:** `200 OK` — Updated profile object

---

## 6. Endpoints — Cycles

### GET /cycles

List all cycle entries (excluding soft-deleted).

**Query Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `limit` | integer | Max records to return (default: 50) |
| `cursor` | string | UUID of last item for pagination |
| `from` | string | ISO date — filter cycles starting from this date |
| `to` | string | ISO date — filter cycles up to this date |

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "uuid",
      "startDate": "2026-07-01",
      "endDate": "2026-07-05",
      "durationDays": 5,
      "cycleLengthDays": 28,
      "notes": null,
      "createdAt": "2026-07-01T08:00:00.000Z",
      "updatedAt": "2026-07-05T09:00:00.000Z",
      "deletedAt": null,
      "syncStatus": "SYNCED"
    }
  ],
  "pagination": { "cursor": "uuid", "hasMore": false, "total": 12 }
}
```

---

### POST /cycles

Create a new cycle entry.

**Request:**
```json
{
  "id": "client-generated-uuid",
  "startDate": "2026-07-01",
  "endDate": null,
  "notes": null,
  "createdAt": "2026-07-01T08:00:00.000Z",
  "updatedAt": "2026-07-01T08:00:00.000Z"
}
```

> **Note:** `id` is generated client-side (UUID v4) to support offline-first creation.

**Response:** `201 Created` — Full cycle object

---

### GET /cycles/:id

Get a single cycle entry.

**Response:** `200 OK` — Cycle object

---

### PATCH /cycles/:id

Partially update a cycle entry.

**Request:**
```json
{
  "endDate": "2026-07-05",
  "updatedAt": "2026-07-05T09:00:00.000Z"
}
```

**Response:** `200 OK` — Updated cycle object

---

### DELETE /cycles/:id

Soft-delete a cycle entry (sets `deletedAt`).

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "deletedAt": "2026-07-22T14:30:00.000Z"
}
```

---

## 7. Endpoints — Daily Logs

### GET /logs

List all daily log entries.

**Query Parameters:** `limit`, `cursor`, `from`, `to`, `cycleId`

**Response:** `200 OK` — Paginated list of daily log objects

---

### POST /logs

Create a daily log entry.

**Request:**
```json
{
  "id": "client-generated-uuid",
  "date": "2026-07-22",
  "cycleEntryId": "uuid-or-null",
  "cycleDay": 14,
  "flowIntensity": null,
  "symptoms": ["cramps", "fatigue", "custom-uuid"],
  "moods": ["calm", "motivated"],
  "painLevel": 3,
  "energyLevel": 4,
  "sleepQuality": 4,
  "sleepHours": 7.5,
  "waterIntakeLiters": 2.0,
  "exerciseMinutes": 30,
  "exerciseType": "yoga",
  "libidoLevel": null,
  "notes": "Feeling good today.",
  "attachments": [],
  "createdAt": "2026-07-22T08:00:00.000Z",
  "updatedAt": "2026-07-22T08:00:00.000Z"
}
```

**Response:** `201 Created` — Full log object

---

### GET /logs/:id

Get a single daily log entry.

**Response:** `200 OK` — Daily log object

---

### PATCH /logs/:id

Update a daily log entry.

**Response:** `200 OK` — Updated log object

---

### DELETE /logs/:id

Soft-delete a daily log entry.

**Response:** `200 OK`

---

## 8. Endpoints — Symptoms

### GET /symptoms

Get all predefined and custom symptoms for the user.

**Response:** `200 OK`
```json
{
  "predefined": [
    { "id": "cramps", "name": "Cramps", "category": "PHYSICAL", "icon": "body-outline" },
    { "id": "fatigue", "name": "Fatigue", "category": "PHYSICAL", "icon": "battery-dead-outline" }
  ],
  "custom": [
    {
      "id": "uuid",
      "name": "Back spasms",
      "category": "PHYSICAL",
      "icon": null,
      "color": "#7C3AED",
      "createdAt": "2026-07-01T08:00:00.000Z",
      "updatedAt": "2026-07-01T08:00:00.000Z",
      "deletedAt": null,
      "syncStatus": "SYNCED"
    }
  ]
}
```

---

### POST /symptoms

Create a custom symptom.

**Request:**
```json
{
  "id": "client-generated-uuid",
  "name": "Back spasms",
  "category": "PHYSICAL",
  "icon": null,
  "color": "#7C3AED",
  "createdAt": "2026-07-01T08:00:00.000Z",
  "updatedAt": "2026-07-01T08:00:00.000Z"
}
```

**Response:** `201 Created` — Custom symptom object

---

### DELETE /symptoms/:id

Soft-delete a custom symptom.

**Response:** `200 OK`

---

## 9. Endpoints — Health Notes

### GET /notes

List all health notes.

**Query Parameters:** `limit`, `cursor`, `from`, `to`, `type`

**Response:** `200 OK` — Paginated list of health note objects

---

### POST /notes

Create a health note.

**Request:**
```json
{
  "id": "client-generated-uuid",
  "date": "2026-07-22",
  "type": "MEDICATION",
  "title": "Ibuprofen 400mg",
  "content": "Took for cramp relief",
  "structuredData": {
    "dosage": "400mg"
  },
  "attachments": [],
  "createdAt": "2026-07-22T10:00:00.000Z",
  "updatedAt": "2026-07-22T10:00:00.000Z"
}
```

**Response:** `201 Created` — Full health note object

---

### PATCH /notes/:id

Update a health note.

**Response:** `200 OK`

---

### DELETE /notes/:id

Soft-delete a health note.

**Response:** `200 OK`

---

## 10. Endpoints — Intercourse Logs

### GET /intercourse

List all intercourse log entries.

**Query Parameters:** `limit`, `cursor`, `from`, `to`

**Response:** `200 OK` — Paginated list

---

### POST /intercourse

Create an intercourse log entry.

**Request:**
```json
{
  "id": "client-generated-uuid",
  "date": "2026-07-22",
  "protected": false,
  "notes": null,
  "createdAt": "2026-07-22T22:00:00.000Z",
  "updatedAt": "2026-07-22T22:00:00.000Z"
}
```

**Response:** `201 Created`

---

### DELETE /intercourse/:id

Soft-delete an intercourse log entry.

**Response:** `200 OK`

---

## 11. Endpoints — Sync

The sync endpoint enables the offline-first → cloud sync architecture. The client sends all records with `syncStatus = 'PENDING_SYNC'` and receives server-side changes.

### POST /sync

Bidirectional sync operation.

**Request:**
```json
{
  "lastSyncedAt": "2026-07-20T10:00:00.000Z",
  "clientChanges": {
    "cycles": {
      "created": [ /* CycleEntry[] */ ],
      "updated": [ /* CycleEntry[] */ ],
      "deleted": [ /* { id, deletedAt }[] */ ]
    },
    "dailyLogs": { "created": [], "updated": [], "deleted": [] },
    "healthNotes": { "created": [], "updated": [], "deleted": [] },
    "customSymptoms": { "created": [], "updated": [], "deleted": [] },
    "intercourse": { "created": [], "updated": [], "deleted": [] },
    "profile": { "updated": null }
  }
}
```

**Response:** `200 OK`
```json
{
  "syncedAt": "2026-07-22T15:00:00.000Z",
  "serverChanges": {
    "cycles": { "created": [], "updated": [], "deleted": [] },
    "dailyLogs": { "created": [], "updated": [], "deleted": [] },
    "healthNotes": { "created": [], "updated": [], "deleted": [] },
    "customSymptoms": { "created": [], "updated": [], "deleted": [] },
    "intercourse": { "created": [], "updated": [], "deleted": [] },
    "profile": null
  },
  "conflicts": [
    {
      "resourceType": "cycles",
      "id": "uuid",
      "resolution": "SERVER_WINS",
      "serverVersion": { /* ... */ },
      "clientVersion": { /* ... */ }
    }
  ]
}
```

**Conflict Resolution Strategy:** Last-write-wins by `updatedAt`. If `clientUpdatedAt > serverUpdatedAt`, client version wins. Otherwise server wins. All conflicts are returned to the client for logging.

---

## 12. Error Responses

All errors follow a consistent format:

```json
{
  "error": {
    "code": "CYCLE_OVERLAP",
    "message": "The period start date overlaps with an existing cycle entry.",
    "field": "startDate",
    "statusCode": 422
  }
}
```

### HTTP Status Codes

| Code | Meaning | Common Causes |
|---|---|---|
| `200` | OK | Successful GET, PATCH |
| `201` | Created | Successful POST |
| `204` | No Content | Successful DELETE, logout |
| `400` | Bad Request | Malformed JSON, missing required fields |
| `401` | Unauthorized | Missing or expired token |
| `403` | Forbidden | Accessing another user's data |
| `404` | Not Found | Resource does not exist |
| `409` | Conflict | Duplicate ID, version conflict |
| `422` | Unprocessable Entity | Validation error (overlap, invalid date) |
| `429` | Too Many Requests | Rate limit exceeded |
| `500` | Internal Server Error | Backend error |

### Error Codes

| Code | HTTP Status | Description |
|---|---|---|
| `INVALID_CREDENTIALS` | 401 | Wrong email or password |
| `TOKEN_EXPIRED` | 401 | Access token has expired |
| `CYCLE_OVERLAP` | 422 | New cycle overlaps existing cycle |
| `INVALID_DATE_RANGE` | 422 | End date before start date |
| `RESOURCE_NOT_FOUND` | 404 | Requested resource does not exist |
| `DUPLICATE_ID` | 409 | Client UUID already exists on server |
| `SYNC_CONFLICT` | 409 | Unresolvable sync conflict |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |

---

## 13. Rate Limiting

| Endpoint Group | Limit |
|---|---|
| `POST /auth/*` | 10 requests / minute per IP |
| `POST /sync` | 60 requests / hour per user |
| All other endpoints | 300 requests / minute per user |

Rate limit headers returned on every response:
```
X-RateLimit-Limit: 300
X-RateLimit-Remaining: 287
X-RateLimit-Reset: 1753195200
```

---

*API Contract v1.0.0 — Backend-agnostic. Implementable with Firebase Cloud Functions, Spring Boot, Express.js, or any RESTful framework.*

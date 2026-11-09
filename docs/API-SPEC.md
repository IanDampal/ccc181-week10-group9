# CampusConnect API Specification

Base URL: `http://localhost:3000/api/v1`
Format: JSON. All errors use the shape `{ "error": "message" }`.
Auth: protected routes need the header `Authorization: Bearer <token>`.

## Overview

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/health` | No | Server health check |
| POST | `/sessions` | No | Log in, receive a token |
| GET | `/users/me` | Yes | Current logged-in user |
| GET | `/events` | Yes | *(design only)* List events |
| GET | `/events/:id` | Yes | *(design only)* One event |
| POST | `/events/:id/rsvp` | Yes | *(design only)* Join an event |

## GET /health
**200**
```json
{ "status": "ok" }
```

## POST /sessions
Logs a user in.

**Request body**
```json
{ "email": "student@campusconnect.test", "password": "Campus26" }
```

| Status | When | Body |
|--------|------|------|
| 200 | Correct credentials | `{ "token": "<jwt, 1 hour>", "user": { "id": 1, "name": "Demo Student", "email": "student@campusconnect.test" } }` |
| 400 | Missing/invalid email or empty password | `{ "error": "Email and password are required." }` |
| 401 | Unknown email or wrong password | `{ "error": "Invalid email or password." }` |

## GET /users/me
Returns the user that owns the token.

**Header:** `Authorization: Bearer <token>`

| Status | When | Body |
|--------|------|------|
| 200 | Valid token | `{ "user": { "id": 1, "name": "Demo Student", "email": "student@campusconnect.test" } }` |
| 401 | Header missing or not `Bearer <token>` | `{ "error": "Authentication required." }` |
| 401 | Token invalid, tampered, or expired | `{ "error": "Invalid or expired token." }` |

## Global errors

| Status | When | Body |
|--------|------|------|
| 400 | Malformed JSON body | `{ "error": "Invalid JSON body." }` |
| 404 | No route matches | `{ "error": "Route not found." }` |
| 500 | Unexpected server error | `{ "error": "Internal server error." }` |

## Events design (planned, not yet implemented)

### Event object
```json
{
  "id": 1,
  "title": "Welcome Week Mixer",
  "description": "Meet students from every course.",
  "location": "Student Hall",
  "startsAt": "2026-11-20T17:00:00.000Z",
  "endsAt": "2026-11-20T19:00:00.000Z",
  "capacity": 100,
  "attendeeCount": 42
}
```

### GET /events (auth required)
Optional query: `?from=<ISO date>` to list only upcoming events.
- **200** `{ "events": [ <event>, ... ] }`
- **401** missing/invalid token

### GET /events/:id (auth required)
- **200** `{ "event": <event> }`
- **404** `{ "error": "Event not found." }`
- **401** missing/invalid token

### POST /events/:id/rsvp (auth required)
Registers the current user. No body needed.
- **201** `{ "event": <event> }` (attendeeCount increased)
- **404** event not found
- **409** `{ "error": "Already registered." }` or `{ "error": "Event is full." }`
- **401** missing/invalid token

### Rules
- Events are stored in `server/data/events.js` (in-memory, like users).
- Routes reuse the `requireAuth` middleware.
- Same error shape and status codes as above.

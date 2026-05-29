# HiddenStay AI — REST API Specification

Base URL: `{API_URL}/api`  
Auth header: `Authorization: Bearer <accessToken>`

## Authentication

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/register` | — | Register traveler or business owner |
| POST | `/auth/login` | — | Login; returns access + refresh tokens |
| POST | `/auth/refresh` | — | Rotate tokens using refresh token body |
| POST | `/auth/forgot-password` | — | Send reset token (logged in dev) |
| POST | `/auth/reset-password` | — | Reset with token |
| GET | `/auth/me` | ✓ | Current user profile |
| PATCH | `/auth/me` | ✓ | Update profile |

## Properties

| Method | Path | Auth | Roles |
|--------|------|------|-------|
| GET | `/properties` | — | Public approved listings (search/filter) |
| GET | `/properties/:id` | — | Public detail if approved |
| POST | `/properties` | ✓ | BUSINESS_OWNER |
| PATCH | `/properties/:id` | ✓ | Owner or ADMIN |
| DELETE | `/properties/:id` | ✓ | Owner or ADMIN |
| GET | `/properties/owner/me` | ✓ | BUSINESS_OWNER — own listings |

Query params (GET `/properties`): `country`, `city`, `minPrice`, `maxPrice`, `minRating`, `type`, `amenities`, `page`, `limit`

## Rooms

| Method | Path | Auth | Roles |
|--------|------|------|-------|
| GET | `/properties/:propertyId/rooms` | — | Public |
| POST | `/properties/:propertyId/rooms` | ✓ | Owner |
| PATCH | `/rooms/:id` | ✓ | Owner |
| DELETE | `/rooms/:id` | ✓ | Owner |
| PATCH | `/rooms/:id/availability` | ✓ | Owner |
| POST | `/rooms/:id/seasonal-prices` | ✓ | Owner |

## Bookings

| Method | Path | Auth | Roles |
|--------|------|------|-------|
| POST | `/bookings` | ✓ | TRAVELER |
| GET | `/bookings/me` | ✓ | TRAVELER |
| GET | `/bookings/owner` | ✓ | BUSINESS_OWNER |
| GET | `/bookings/:id` | ✓ | Participant |
| PATCH | `/bookings/:id/confirm` | ✓ | Owner |
| PATCH | `/bookings/:id/cancel` | ✓ | Traveler/Owner |
| POST | `/bookings/:id/payment-intent` | ✓ | TRAVELER |

## Reviews

| Method | Path | Auth |
|--------|------|------|
| GET | `/properties/:propertyId/reviews` | — |
| POST | `/properties/:propertyId/reviews` | ✓ TRAVELER |
| PATCH | `/reviews/:id` | ✓ Author |
| DELETE | `/reviews/:id` | ✓ Author/ADMIN |

## AI Planner

| Method | Path | Auth |
|--------|------|------|
| POST | `/itinerary/generate` | ✓ |
| GET | `/itinerary/me` | ✓ |
| GET | `/itinerary/:id` | ✓ |
| POST | `/itinerary/:id/regenerate` | ✓ |
| POST | `/itinerary/:id/days/:dayNumber/regenerate` | ✓ |

## Hidden Gems

| Method | Path | Auth |
|--------|------|------|
| GET | `/hidden-gems` | — |
| GET | `/hidden-gems/recommend` | — |

Query: `city`, `country`, `category`, `lat`, `lng`, `radius`

## Admin

| Method | Path | Auth | Roles |
|--------|------|------|-------|
| GET | `/admin/properties/pending` | ✓ | ADMIN |
| PATCH | `/admin/properties/:id/verify` | ✓ | ADMIN |
| PATCH | `/admin/properties/:id/suspend` | ✓ | ADMIN |
| GET | `/admin/users` | ✓ | ADMIN |
| PATCH | `/admin/users/:id/suspend` | ✓ | ADMIN |
| GET | `/admin/analytics` | ✓ | ADMIN |

## Analytics (Business Owner)

| Method | Path | Auth |
|--------|------|------|
| GET | `/analytics/owner` | ✓ BUSINESS_OWNER |

## Uploads

| Method | Path | Auth |
|--------|------|------|
| POST | `/uploads/image` | ✓ |

## Health

| GET | `/health` | — |

## Standard Response Envelope

```json
{
  "success": true,
  "data": {},
  "meta": { "page": 1, "limit": 20, "total": 100 }
}
```

## Error Format

```json
{
  "success": false,
  "error": { "code": "VALIDATION_ERROR", "message": "...", "details": [] }
}
```

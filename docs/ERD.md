# HiddenStay AI — Entity Relationship Diagram

## Mermaid ERD

```mermaid
erDiagram
    User ||--o{ Property : owns
    User ||--o{ Booking : makes
    User ||--o{ Review : writes
    User ||--o{ Itinerary : creates
    User ||--o{ RefreshToken : has
    User ||--o| BusinessProfile : has

    Property ||--o{ Room : contains
    Property ||--o{ Review : receives
    Property ||--o{ PropertyImage : has
    Property ||--o{ PropertyAmenity : has
    Property ||--o| VerificationRecord : has
    Property }o--|| User : owner

    Room ||--o{ Booking : booked
    Room ||--o{ RoomImage : has
    Room ||--o{ SeasonalPrice : has
    Room ||--o{ RoomAvailability : tracks

    Booking }o--|| User : traveler
    Booking }o--|| Room : room
    Booking }o--|| Property : property

    Review }o--|| User : author
    Review }o--|| Property : property
    Review ||--o{ ReviewImage : has

    Itinerary ||--o{ ItineraryDay : contains
    ItineraryDay ||--o{ ItineraryActivity : contains

    Amenity ||--o{ PropertyAmenity : linked

    HiddenGem }o--o| Property : near

    PlatformAnalytics ||--|| User : aggregated

    User {
        uuid id PK
        string email UK
        string passwordHash
        enum role
        string firstName
        string lastName
        string phone
        string avatarUrl
        boolean isActive
        boolean emailVerified
    }

    Property {
        uuid id PK
        uuid ownerId FK
        string name
        enum type
        enum status
        text description
        string address
        float latitude
        float longitude
        string city
        string country
        string contactPhone
        string contactEmail
        float avgRating
        int reviewCount
    }

    Room {
        uuid id PK
        uuid propertyId FK
        string name
        enum roomType
        int capacity
        decimal basePrice
        int quantity
        int availableCount
    }

    Booking {
        uuid id PK
        uuid userId FK
        uuid roomId FK
        date checkIn
        date checkOut
        enum status
        decimal totalPrice
        decimal platformFee
    }
```

## Entity Summary

| Entity | Purpose |
|--------|---------|
| **User** | All accounts; role distinguishes traveler/owner/admin |
| **BusinessProfile** | KYC fields for business owners |
| **RefreshToken** | Hashed refresh token rotation |
| **Property** | Listings with geo, contact, verification status |
| **VerificationRecord** | Admin approval audit trail |
| **Room** | Inventory unit with base price and quantity |
| **SeasonalPrice** | Peak/off/holiday multipliers per room |
| **RoomAvailability** | Per-date availability overrides |
| **Booking** | Reservations with status lifecycle |
| **Review** | Post-stay ratings and text |
| **Itinerary** | AI-generated travel plans |
| **HiddenGem** | Curated local attractions/restaurants |
| **Amenity** | Normalized amenity catalog |
| **PlatformAnalytics** | Daily snapshot metrics for admin dashboard |

## Indexes (Performance)

- `Property(city, country, status, type)`
- `Property(avgRating DESC)` for sort
- `Booking(userId, status)`
- `Booking(roomId, checkIn, checkOut)` for overlap checks
- `Review(propertyId)`

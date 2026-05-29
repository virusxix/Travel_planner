-- HiddenStay AI Initial Migration
-- Generated from Prisma schema

CREATE TYPE "UserRole" AS ENUM ('TRAVELER', 'BUSINESS_OWNER', 'ADMIN');
CREATE TYPE "PropertyType" AS ENUM ('HOTEL', 'MOTEL', 'GUESTHOUSE', 'HOMESTAY', 'BOUTIQUE_INN', 'ECO_LODGE');
CREATE TYPE "PropertyStatus" AS ENUM ('DRAFT', 'PENDING_REVIEW', 'APPROVED', 'REJECTED', 'SUSPENDED');
CREATE TYPE "RoomType" AS ENUM ('SINGLE', 'DOUBLE', 'TWIN', 'TRIPLE', 'FAMILY', 'DORM', 'SUITE', 'DELUXE');
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED');
CREATE TYPE "SeasonType" AS ENUM ('PEAK', 'OFF_SEASON', 'WEEKEND', 'HOLIDAY');
CREATE TYPE "HiddenGemCategory" AS ENUM ('ATTRACTION', 'RESTAURANT', 'EXPERIENCE', 'CULTURAL_SITE');
CREATE TYPE "VerificationAction" AS ENUM ('SUBMITTED', 'APPROVED', 'REJECTED', 'SUSPENDED', 'RESUBMITTED');

-- See prisma/schema.prisma for full model definitions.
-- Run: npx prisma migrate deploy  OR  npx prisma db push

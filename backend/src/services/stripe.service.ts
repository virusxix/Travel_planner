import Stripe from "stripe";
import { env } from "../config/env.js";
import { prisma } from "../lib/prisma.js";
import { confirmBookingPayment } from "./booking.service.js";

export const stripe = env.STRIPE_SECRET_KEY
  ? new Stripe(env.STRIPE_SECRET_KEY)
  : null;

export function isStripeEnabled(): boolean {
  return !!stripe;
}

export async function createCheckoutSession(bookingId: string, userId: string) {
  if (!stripe) throw new Error("Stripe is not configured");

  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, userId, status: "PENDING" },
    include: {
      property: { select: { name: true, city: true, country: true } },
      room: { select: { name: true } },
    },
  });
  if (!booking) throw new Error("Booking not found or already processed");

  if (booking.paymentExpiresAt && booking.paymentExpiresAt < new Date()) {
    throw new Error("Payment window expired — please book again");
  }

  const amountCents = Math.round(Number(booking.finalTotal) * 100);
  const label = `${booking.property.name} — ${booking.room.name}`;
  const description = `${booking.nights} night(s) · ${booking.property.city}, ${booking.property.country}`;

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    client_reference_id: booking.id,
    customer_email: undefined,
    metadata: {
      bookingId: booking.id,
      userId: booking.userId,
    },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: amountCents,
          product_data: {
            name: label,
            description,
          },
        },
      },
    ],
    success_url: `${env.FRONTEND_URL}/book/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${env.FRONTEND_URL}/book/${booking.roomId}?propertyId=${booking.propertyId}&cancelled=1`,
    expires_at: booking.paymentExpiresAt
      ? Math.floor(booking.paymentExpiresAt.getTime() / 1000)
      : undefined,
  });

  if (session.id) {
    await prisma.booking.update({
      where: { id: booking.id },
      data: { stripePaymentId: session.id },
    });
  }

  return {
    sessionId: session.id,
    url: session.url,
  };
}

export async function fulfillCheckoutSession(sessionId: string) {
  if (!stripe) throw new Error("Stripe is not configured");

  const session = await stripe.checkout.sessions.retrieve(sessionId);

  if (session.payment_status !== "paid") {
    throw new Error("Payment not completed");
  }

  const bookingId = session.metadata?.bookingId;
  const userId = session.metadata?.userId;
  if (!bookingId || !userId) {
    throw new Error("Invalid session metadata");
  }

  return confirmBookingPayment(bookingId, userId);
}

export async function handleStripeWebhook(payload: Buffer, signature: string) {
  if (!stripe) throw new Error("Stripe is not configured");
  if (!env.STRIPE_WEBHOOK_SECRET) {
    throw new Error("STRIPE_WEBHOOK_SECRET is not configured");
  }

  const event = stripe.webhooks.constructEvent(
    payload,
    signature,
    env.STRIPE_WEBHOOK_SECRET
  );

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.payment_status === "paid" && session.metadata?.bookingId && session.metadata?.userId) {
        await confirmBookingPayment(session.metadata.bookingId, session.metadata.userId);
      }
      break;
    }
    case "checkout.session.expired": {
      const session = event.data.object as Stripe.Checkout.Session;
      const bookingId = session.metadata?.bookingId;
      if (bookingId) {
        await prisma.booking.updateMany({
          where: { id: bookingId, status: "PENDING" },
          data: { status: "CANCELLED", cancelledAt: new Date() },
        });
      }
      break;
    }
    default:
      break;
  }

  return { received: true };
}

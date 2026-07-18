from fastapi import FastAPI, APIRouter, HTTPException, Request
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone
from emergentintegrations.llm.chat import LlmChat, UserMessage, TextDelta, StreamDone
import json
import stripe

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

stripe.api_key = os.environ.get("STRIPE_SECRET_KEY") or "sk_test_emergent"
STRIPE_WEBHOOK_SECRET = os.environ.get("STRIPE_WEBHOOK_SECRET", "")

app = FastAPI()
api_router = APIRouter(prefix="/api")


@api_router.get("/")
async def health():
    return {"status": "ok"}

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    role: str
    name: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Property(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    host_id: str
    name: str
    city: str
    type: str
    price_per_night: float
    images: List[str]
    description: str
    amenities: List[str]
    lat: float
    lng: float
    status: str = "pending"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Booking(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    property_id: str
    traveller_id: str
    host_id: str
    check_in: str
    check_out: str
    guests: int
    total_price: float
    platform_fee: float
    host_payout: float
    status: str = "confirmed"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Itinerary(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    city: str
    days: int
    plan: str
    recommended_properties: List[str]
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class LoginRequest(BaseModel):
    role: str

class PropertyCreate(BaseModel):
    name: str
    city: str
    type: str
    price_per_night: float
    images: List[str]
    description: str
    amenities: List[str]
    lat: float
    lng: float

class PropertyUpdate(BaseModel):
    name: Optional[str] = None
    city: Optional[str] = None
    type: Optional[str] = None
    price_per_night: Optional[float] = None
    images: Optional[List[str]] = None
    description: Optional[str] = None
    amenities: Optional[List[str]] = None

class BookingCreate(BaseModel):
    property_id: str
    check_in: str
    check_out: str
    guests: int

class ApprovalAction(BaseModel):
    action: str

class ChatRequest(BaseModel):
    message: str
    user_id: str

class CheckoutRequest(BaseModel):
    property_id: str
    check_in: str
    check_out: str
    guests: int
    origin_url: str
    user_id: str = "user-traveller-001"

@api_router.post("/auth/login")
async def demo_login(request: LoginRequest):
    users = {
        "traveller": {"id": "user-traveller-001", "email": "traveller@hiddenstay.com", "role": "traveller", "name": "Alex Chen"},
        "host": {"id": "user-host-001", "email": "host@hiddenstay.com", "role": "host", "name": "Maria Santos"},
        "admin": {"id": "user-admin-001", "email": "admin@hiddenstay.com", "role": "admin", "name": "Admin User"}
    }
    user_data = users.get(request.role)
    if not user_data:
        raise HTTPException(status_code=400, detail="Invalid role")
    return {"user": user_data, "token": f"demo-token-{request.role}"}

@api_router.get("/properties")
async def get_properties(city: Optional[str] = None, status: Optional[str] = None):
    query = {}
    if city:
        query["city"] = city
    if status:
        query["status"] = status
    else:
        query["status"] = "approved"
    properties = await db.properties.find(query, {"_id": 0}).to_list(100)
    for prop in properties:
        if isinstance(prop.get('created_at'), str):
            prop['created_at'] = datetime.fromisoformat(prop['created_at'])
    return properties

@api_router.get("/properties/{property_id}")
async def get_property(property_id: str):
    prop = await db.properties.find_one({"id": property_id}, {"_id": 0})
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")
    if isinstance(prop.get('created_at'), str):
        prop['created_at'] = datetime.fromisoformat(prop['created_at'])
    return prop

@api_router.post("/properties")
async def create_property(property_data: PropertyCreate, host_id: str = "user-host-001"):
    prop = Property(host_id=host_id, **property_data.model_dump())
    doc = prop.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.properties.insert_one(doc)
    return prop

@api_router.patch("/properties/{property_id}")
async def update_property(property_id: str, property_data: PropertyUpdate):
    update_data = {k: v for k, v in property_data.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    result = await db.properties.update_one({"id": property_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Property not found")
    return {"message": "Property updated successfully"}

@api_router.post("/bookings")
async def create_booking(booking_data: BookingCreate, traveller_id: str = "user-traveller-001"):
    prop = await db.properties.find_one({"id": booking_data.property_id}, {"_id": 0})
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")
    
    try:
        check_in_date = datetime.fromisoformat(booking_data.check_in)
        check_out_date = datetime.fromisoformat(booking_data.check_out)
        nights = max(1, (check_out_date - check_in_date).days)
    except (ValueError, TypeError):
        nights = 3
    
    total_price = prop["price_per_night"] * nights
    platform_fee = total_price * 0.05
    host_payout = total_price * 0.95
    
    booking = Booking(
        property_id=booking_data.property_id,
        traveller_id=traveller_id,
        host_id=prop["host_id"],
        check_in=booking_data.check_in,
        check_out=booking_data.check_out,
        guests=booking_data.guests,
        total_price=total_price,
        platform_fee=platform_fee,
        host_payout=host_payout
    )
    doc = booking.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.bookings.insert_one(doc)
    return booking

@api_router.get("/bookings")
async def get_bookings(user_id: Optional[str] = None, role: Optional[str] = None):
    query = {}
    if user_id and role == "traveller":
        query["traveller_id"] = user_id
    elif user_id and role == "host":
        query["host_id"] = user_id
    bookings = await db.bookings.find(query, {"_id": 0}).to_list(100)
    for booking in bookings:
        if isinstance(booking.get('created_at'), str):
            booking['created_at'] = datetime.fromisoformat(booking['created_at'])
    return bookings

@api_router.get("/admin/overview")
async def get_admin_overview():
    total_properties = await db.properties.count_documents({})
    pending_approvals = await db.properties.count_documents({"status": "pending"})
    total_bookings = await db.bookings.count_documents({})
    bookings = await db.bookings.find({}, {"_id": 0}).to_list(1000)
    platform_revenue = sum(b.get("platform_fee", 0) for b in bookings)
    return {
        "total_properties": total_properties,
        "pending_approvals": pending_approvals,
        "total_bookings": total_bookings,
        "platform_revenue": round(platform_revenue, 2)
    }

@api_router.get("/admin/pending-properties")
async def get_pending_properties():
    properties = await db.properties.find({"status": "pending"}, {"_id": 0}).to_list(100)
    for prop in properties:
        if isinstance(prop.get('created_at'), str):
            prop['created_at'] = datetime.fromisoformat(prop['created_at'])
    return properties

@api_router.patch("/admin/properties/{property_id}/status")
async def update_property_status(property_id: str, action: ApprovalAction):
    new_status = "approved" if action.action == "approve" else "rejected"
    result = await db.properties.update_one({"id": property_id}, {"$set": {"status": new_status}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Property not found")
    return {"message": f"Property {new_status} successfully"}

@api_router.get("/host/earnings")
async def get_host_earnings(host_id: str = "user-host-001"):
    bookings = await db.bookings.find({"host_id": host_id}, {"_id": 0}).to_list(1000)
    total_payout = sum(b.get("host_payout", 0) for b in bookings)
    total_platform_fee = sum(b.get("platform_fee", 0) for b in bookings)

    payouts = await db.payout_requests.find({"host_id": host_id}, {"_id": 0}).to_list(1000)
    withdrawn = sum(p.get("amount", 0) for p in payouts if p.get("status") in ("pending", "paid"))
    pending_payouts = sum(p.get("amount", 0) for p in payouts if p.get("status") == "pending")
    paid_payouts = sum(p.get("amount", 0) for p in payouts if p.get("status") == "paid")

    return {
        "available_earnings": round(max(0.0, total_payout - withdrawn), 2),
        "lifetime_earnings": round(total_payout, 2),
        "pending_payouts": round(pending_payouts, 2),
        "paid_payouts": round(paid_payouts, 2),
        "platform_fee": round(total_platform_fee, 2),
        "total_bookings": len(bookings)
    }

class PayoutRequestCreate(BaseModel):
    amount: float
    host_id: str = "user-host-001"

@api_router.post("/host/payouts")
async def create_payout_request(req: PayoutRequestCreate):
    if req.amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be positive")

    bookings = await db.bookings.find({"host_id": req.host_id}, {"_id": 0}).to_list(1000)
    total_payout = sum(b.get("host_payout", 0) for b in bookings)
    payouts = await db.payout_requests.find({"host_id": req.host_id}, {"_id": 0}).to_list(1000)
    withdrawn = sum(p.get("amount", 0) for p in payouts if p.get("status") in ("pending", "paid"))
    available = total_payout - withdrawn

    if req.amount > available + 0.01:
        raise HTTPException(status_code=400, detail=f"Requested amount exceeds available balance of SGD {available:.2f}")

    payout = {
        "id": str(uuid.uuid4()),
        "host_id": req.host_id,
        "amount": round(req.amount, 2),
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "paid_at": None,
    }
    await db.payout_requests.insert_one(payout)
    payout.pop("_id", None)
    return payout

@api_router.get("/host/payouts")
async def list_host_payouts(host_id: str = "user-host-001"):
    payouts = await db.payout_requests.find({"host_id": host_id}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return payouts

@api_router.patch("/host/payouts/{payout_id}/mark-paid")
async def mark_payout_paid(payout_id: str):
    result = await db.payout_requests.update_one(
        {"id": payout_id, "status": "pending"},
        {"$set": {"status": "paid", "paid_at": datetime.now(timezone.utc).isoformat()}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Payout not found or already paid")
    return {"message": "Payout marked as paid"}

class ReviewCreate(BaseModel):
    booking_id: str
    rating: int
    comment: str
    reviewer_id: str = "user-traveller-001"

@api_router.post("/reviews")
async def create_review(req: ReviewCreate):
    if req.rating < 1 or req.rating > 5:
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")

    booking = await db.bookings.find_one({"id": req.booking_id}, {"_id": 0})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    if booking.get("traveller_id") != req.reviewer_id:
        raise HTTPException(status_code=403, detail="Only the traveller who booked can review")

    existing = await db.reviews.find_one({"booking_id": req.booking_id})
    if existing:
        raise HTTPException(status_code=400, detail="Review already submitted for this booking")

    review = {
        "id": str(uuid.uuid4()),
        "booking_id": req.booking_id,
        "property_id": booking["property_id"],
        "reviewer_id": req.reviewer_id,
        "rating": req.rating,
        "comment": req.comment.strip(),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.reviews.insert_one(review)
    review.pop("_id", None)
    return review

@api_router.get("/reviews")
async def list_reviews(property_id: Optional[str] = None, user_id: Optional[str] = None, booking_id: Optional[str] = None):
    query = {}
    if property_id:
        query["property_id"] = property_id
    if user_id:
        query["reviewer_id"] = user_id
    if booking_id:
        query["booking_id"] = booking_id
    reviews = await db.reviews.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)

    reviewer_names = {
        "user-traveller-001": "Alex Chen",
    }
    for r in reviews:
        r["reviewer_name"] = reviewer_names.get(r["reviewer_id"], "Traveller")
        r["verified_stay"] = True
    return reviews

@api_router.get("/properties/{property_id}/rating")
async def get_property_rating(property_id: str):
    reviews = await db.reviews.find({"property_id": property_id}, {"_id": 0}).to_list(1000)
    if not reviews:
        return {"average_rating": None, "review_count": 0}
    avg = sum(r["rating"] for r in reviews) / len(reviews)
    return {"average_rating": round(avg, 1), "review_count": len(reviews)}

class ReviewReplyCreate(BaseModel):
    reply: str
    host_id: str = "user-host-001"

@api_router.post("/reviews/{review_id}/reply")
async def add_review_reply(review_id: str, req: ReviewReplyCreate):
    review = await db.reviews.find_one({"id": review_id}, {"_id": 0})
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")

    prop = await db.properties.find_one({"id": review["property_id"]}, {"_id": 0})
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")
    if prop["host_id"] != req.host_id:
        raise HTTPException(status_code=403, detail="Only the property host can reply to this review")

    reply_text = req.reply.strip()
    if not reply_text:
        raise HTTPException(status_code=400, detail="Reply cannot be empty")

    await db.reviews.update_one(
        {"id": review_id},
        {"$set": {
            "host_reply": reply_text,
            "host_reply_at": datetime.now(timezone.utc).isoformat(),
        }}
    )
    return {"message": "Reply posted successfully"}

@api_router.get("/host/reviews")
async def get_host_reviews(host_id: str = "user-host-001"):
    props = await db.properties.find({"host_id": host_id}, {"_id": 0}).to_list(1000)
    prop_map = {p["id"]: p for p in props}
    if not prop_map:
        return []
    reviews = await db.reviews.find(
        {"property_id": {"$in": list(prop_map.keys())}},
        {"_id": 0}
    ).sort("created_at", -1).to_list(1000)

    reviewer_names = {
        "user-traveller-001": "Alex Chen",
    }
    for r in reviews:
        r["reviewer_name"] = reviewer_names.get(r["reviewer_id"], "Traveller")
        r["verified_stay"] = True
        p = prop_map.get(r["property_id"], {})
        r["property_name"] = p.get("name", "")
        r["property_city"] = p.get("city", "")
        r["property_image"] = (p.get("images") or [None])[0]
    return reviews

@api_router.post("/ai/chat")
async def ai_chat_stream(request: ChatRequest):
    async def generate_stream():
        try:
            # Prefer legacy Groq key (same as old HiddenStay backend)
            api_key = os.environ.get("GROQ_API_KEY") or os.environ.get("EMERGENT_LLM_KEY")
            model = os.environ.get("GROQ_MODEL") or "llama-3.3-70b-versatile"
            chat = LlmChat(
                api_key=api_key,
                session_id=f"session-{request.user_id}",
                system_message=(
                    "You are a helpful travel assistant for HiddenStay, a Southeast Asia "
                    "homestay booking platform. Help users plan their trips with day-by-day "
                    "itineraries including activities, meals, and accommodation recommendations. "
                    "Focus on authentic local experiences in Chiang Mai, Da Nang, and other "
                    "Southeast Asian cities. Keep responses concise and structured. "
                    "When recommending stays, prefer HiddenStay properties (hosts keep 95%)."
                ),
            ).with_model("groq", model)

            user_message = UserMessage(text=request.message)

            async for event in chat.stream_message(user_message):
                if isinstance(event, TextDelta):
                    yield f"data: {json.dumps({'content': event.content})}\n\n"
                elif isinstance(event, StreamDone):
                    yield f"data: {json.dumps({'done': True})}\n\n"
                    break
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"
    
    return StreamingResponse(
        generate_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive"
        }
    )

@api_router.post("/payments/checkout")
async def create_checkout(req: CheckoutRequest):
    prop = await db.properties.find_one({"id": req.property_id}, {"_id": 0})
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")

    try:
        check_in_date = datetime.fromisoformat(req.check_in)
        check_out_date = datetime.fromisoformat(req.check_out)
        nights = max(1, (check_out_date - check_in_date).days)
    except (ValueError, TypeError):
        nights = 3

    total_price = prop["price_per_night"] * nights
    amount_cents = int(round(total_price * 100))

    try:
        session = stripe.checkout.Session.create(
            line_items=[{
                "price_data": {
                    "currency": "sgd",
                    "product_data": {
                        "name": prop["name"],
                        "description": f"{nights} night(s) in {prop['city']} - {req.guests} guest(s)",
                    },
                    "unit_amount": amount_cents,
                },
                "quantity": 1,
            }],
            mode="payment",
            success_url=f"{req.origin_url}/payment/success?session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{req.origin_url}/payment/cancel",
            metadata={
                "property_id": req.property_id,
                "user_id": req.user_id,
                "check_in": req.check_in,
                "check_out": req.check_out,
                "guests": str(req.guests),
                "nights": str(nights),
                "host_id": prop["host_id"],
            },
        )
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=500, detail=f"Stripe error: {str(e)}")

    await db.payment_transactions.insert_one({
        "session_id": session.id,
        "user_id": req.user_id,
        "property_id": req.property_id,
        "amount": total_price,
        "currency": "sgd",
        "nights": nights,
        "check_in": req.check_in,
        "check_out": req.check_out,
        "guests": req.guests,
        "status": "initiated",
        "payment_status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    })

    return {"checkout_url": session.url, "session_id": session.id}

@api_router.get("/payments/status/{session_id}")
async def get_payment_status(session_id: str):
    record = await db.payment_transactions.find_one({"session_id": session_id}, {"_id": 0})
    if not record:
        raise HTTPException(status_code=404, detail="Transaction not found")

    if record.get("payment_status") != "paid":
        try:
            s = stripe.checkout.Session.retrieve(session_id)
            if s.payment_status == "paid" or s.status == "complete":
                await db.payment_transactions.update_one(
                    {"session_id": session_id, "payment_status": {"$ne": "paid"}},
                    {"$set": {
                        "status": "completed",
                        "payment_status": "paid",
                        "stripe_payment_intent_id": s.payment_intent,
                        "updated_at": datetime.now(timezone.utc).isoformat(),
                    }},
                )
                await _create_booking_from_session(session_id)
                record = await db.payment_transactions.find_one({"session_id": session_id}, {"_id": 0})
        except stripe.error.StripeError:
            pass

    return {
        "session_id": record["session_id"],
        "status": record["status"],
        "payment_status": record["payment_status"],
    }

async def _create_booking_from_session(session_id: str):
    existing = await db.bookings.find_one({"stripe_session_id": session_id})
    if existing:
        return

    txn = await db.payment_transactions.find_one({"session_id": session_id}, {"_id": 0})
    if not txn or txn.get("payment_status") != "paid":
        return

    prop = await db.properties.find_one({"id": txn["property_id"]}, {"_id": 0})
    if not prop:
        return

    total_price = txn["amount"]
    platform_fee = total_price * 0.05
    host_payout = total_price * 0.95

    booking = Booking(
        property_id=txn["property_id"],
        traveller_id=txn["user_id"],
        host_id=prop["host_id"],
        check_in=txn["check_in"],
        check_out=txn["check_out"],
        guests=txn["guests"],
        total_price=total_price,
        platform_fee=platform_fee,
        host_payout=host_payout,
    )
    doc = booking.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['stripe_session_id'] = session_id
    await db.bookings.insert_one(doc)

@api_router.post("/stripe/webhook")
async def stripe_webhook(request: Request):
    payload = await request.body()
    sig = request.headers.get("stripe-signature", "")
    try:
        event = stripe.Webhook.construct_event(payload, sig, STRIPE_WEBHOOK_SECRET)
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")

    obj = event["data"]["object"]
    t = event["type"]

    if t == "checkout.session.completed":
        await db.payment_transactions.update_one(
            {"session_id": obj["id"], "payment_status": {"$ne": "paid"}},
            {"$set": {
                "status": "completed",
                "payment_status": obj.get("payment_status", "paid"),
                "stripe_payment_intent_id": obj.get("payment_intent"),
                "updated_at": datetime.now(timezone.utc).isoformat(),
            }},
        )
        await _create_booking_from_session(obj["id"])
    elif t == "checkout.session.async_payment_succeeded":
        await db.payment_transactions.update_one(
            {"session_id": obj["id"]},
            {"$set": {"payment_status": "paid", "updated_at": datetime.now(timezone.utc).isoformat()}},
        )
        await _create_booking_from_session(obj["id"])
    elif t == "checkout.session.async_payment_failed":
        await db.payment_transactions.update_one(
            {"session_id": obj["id"]},
            {"$set": {"status": "failed", "payment_status": "failed", "updated_at": datetime.now(timezone.utc).isoformat()}},
        )
    elif t == "checkout.session.expired":
        await db.payment_transactions.update_one(
            {"session_id": obj["id"]},
            {"$set": {"status": "expired", "payment_status": "expired", "updated_at": datetime.now(timezone.utc).isoformat()}},
        )

    return {"status": "ok"}

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

@app.on_event("startup")
async def seed_data():
    existing_props = await db.properties.count_documents({})
    if existing_props > 0:
        return
    
    sample_properties = [
        {
            "id": "prop-001",
            "host_id": "user-host-001",
            "name": "Bamboo Forest Retreat",
            "city": "Chiang Mai",
            "type": "Bamboo Hut",
            "price_per_night": 45.0,
            "images": ["https://images.pexels.com/photos/37800696/pexels-photo-37800696.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"],
            "description": "Serene bamboo hut nestled in dense forest with stunning mountain views",
            "amenities": ["WiFi", "Air Conditioning", "Kitchen", "Mountain View"],
            "lat": 18.7883,
            "lng": 98.9853,
            "status": "approved",
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": "prop-002",
            "host_id": "user-host-001",
            "name": "Hillside Wooden Haven",
            "city": "Chiang Mai",
            "type": "Wooden Cabin",
            "price_per_night": 55.0,
            "images": ["https://images.unsplash.com/photo-1764260664542-61117a514ba3?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NTZ8MHwxfHNlYXJjaHwzfHxjaGlhbmclMjBtYWklMjBob21lc3RheSUyMG5hdHVyZXxlbnwwfHx8fDE3ODQzNTA4ODd8MA&ixlib=rb-4.1.0&q=85"],
            "description": "Rustic wooden hut nestled in hillside overlooking lush valleys",
            "amenities": ["WiFi", "Hot Water", "Garden", "Terrace"],
            "lat": 18.8067,
            "lng": 98.9419,
            "status": "approved",
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": "prop-003",
            "host_id": "user-host-001",
            "name": "Temple View Room",
            "city": "Da Nang",
            "type": "Room",
            "price_per_night": 38.0,
            "images": ["https://images.unsplash.com/photo-1712927026825-f4519f64f025?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njd8MHwxfHNlYXJjaHwyfHxzb3V0aGVhc3QlMjBhc2lhJTIwdHJvcGljYWwlMjBiZWRyb29tfGVufDB8fHx8MTc4NDM1MDg4N3ww&ixlib=rb-4.1.0&q=85"],
            "description": "Cozy room with open window views and traditional Vietnamese architecture",
            "amenities": ["WiFi", "Air Conditioning", "Breakfast", "City View"],
            "lat": 16.0544,
            "lng": 108.2022,
            "status": "approved",
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": "prop-004",
            "host_id": "user-host-001",
            "name": "Lakeside Green Escape",
            "city": "Chiang Mai",
            "type": "Homestay",
            "price_per_night": 65.0,
            "images": ["https://images.unsplash.com/photo-1680896444797-07917f403a49?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NTZ8MHwxfHNlYXJjaHw0fHxjaGlhbmclMjBtYWklMjBob21lc3RheSUyMG5hdHVyZXxlbnwwfHx8fDE3ODQzNTA4ODd8MA&ixlib=rb-4.1.0&q=85"],
            "description": "Peaceful homestay next to lake surrounded by lush green forest",
            "amenities": ["WiFi", "Kitchen", "Lake Access", "Outdoor Seating"],
            "lat": 18.7965,
            "lng": 98.9925,
            "status": "approved",
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": "prop-005",
            "host_id": "user-host-001",
            "name": "Scenic Window Bedroom",
            "city": "Da Nang",
            "type": "Room",
            "price_per_night": 42.0,
            "images": ["https://images.pexels.com/photos/18292640/pexels-photo-18292640.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"],
            "description": "Charming bedroom with panoramic window views of mountains",
            "amenities": ["WiFi", "Breakfast", "Mountain View", "Private Bathroom"],
            "lat": 16.0471,
            "lng": 108.2068,
            "status": "approved",
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": "prop-006",
            "host_id": "user-host-001",
            "name": "Urban Chiang Mai Loft",
            "city": "Chiang Mai",
            "type": "Apartment",
            "price_per_night": 35.0,
            "images": ["https://images.pexels.com/photos/18292640/pexels-photo-18292640.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"],
            "description": "Modern loft in the heart of old city with easy access to temples",
            "amenities": ["WiFi", "Air Conditioning", "Kitchen", "Central Location"],
            "lat": 18.7883,
            "lng": 98.9853,
            "status": "pending",
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": "prop-007",
            "host_id": "user-host-001",
            "name": "Beachfront Da Nang Studio",
            "city": "Da Nang",
            "type": "Studio",
            "price_per_night": 48.0,
            "images": ["https://images.unsplash.com/photo-1498747468843-5ec2ad31cb89?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMzN8MHwxfHNlYXJjaHw0fHxkYSUyMG5hbmclMjB2aWV0bmFtJTIwdHJhdmVsfGVufDB8fHx8MTc4NDM1MDg4N3ww&ixlib=rb-4.1.0&q=85"],
            "description": "Cozy studio with direct beach access and ocean breeze",
            "amenities": ["WiFi", "Beach Access", "Kitchen", "Balcony"],
            "lat": 16.0678,
            "lng": 108.2208,
            "status": "pending",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    await db.properties.insert_many(sample_properties)
    
    sample_bookings = [
        {
            "id": "booking-001",
            "property_id": "prop-001",
            "traveller_id": "user-traveller-001",
            "host_id": "user-host-001",
            "check_in": "2026-02-15",
            "check_out": "2026-02-18",
            "guests": 2,
            "total_price": 135.0,
            "platform_fee": 6.75,
            "host_payout": 128.25,
            "status": "confirmed",
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": "booking-002",
            "property_id": "prop-004",
            "traveller_id": "user-traveller-001",
            "host_id": "user-host-001",
            "check_in": "2026-03-10",
            "check_out": "2026-03-13",
            "guests": 2,
            "total_price": 195.0,
            "platform_fee": 9.75,
            "host_payout": 185.25,
            "status": "confirmed",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    await db.bookings.insert_many(sample_bookings)
    logger.info("Sample data seeded successfully")

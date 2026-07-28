import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import axios from 'axios';
import { toast } from 'sonner';
import {
  CreditCard,
  ShieldCheck,
  MapPin,
  Check,
  BedDouble,
  Wifi,
  Ban,
  Clock,
  Lock,
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function formatStayDate(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso + 'T12:00:00').toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

const STEPS = [
  { n: 1, label: 'Your selection' },
  { n: 2, label: 'Your details' },
  { n: 3, label: 'Final step' },
];

export default function Checkout({ user }) {
  const location = useLocation();
  const navigate = useNavigate();
  const property = location.state?.property;
  const rateId = location.state?.rateId || 'best';
  const [loading, setLoading] = useState(false);
  const [bookingData, setBookingData] = useState({
    checkIn: '2026-03-01',
    checkOut: '2026-03-04',
    guests: 2,
  });
  const [guest, setGuest] = useState({
    givenName: user?.name?.split?.(' ')?.[0] || '',
    surname: user?.name?.split?.(' ')?.slice(1).join(' ') || '',
    email: user?.email || '',
    phone: '',
  });
  const [specialRequest, setSpecialRequest] = useState('');
  const [showRequests, setShowRequests] = useState(false);

  if (!property) {
    return (
      <div className="min-h-screen bg-[#f4f4f5] flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">No property selected</p>
          <Button onClick={() => navigate('/traveller')}>Go to Home</Button>
        </div>
      </div>
    );
  }

  const nights = Math.max(
    1,
    Math.ceil(
      (new Date(bookingData.checkOut) - new Date(bookingData.checkIn)) /
        (1000 * 60 * 60 * 24)
    )
  );
  const isFlexible = rateId === 'flex';
  const nightly = isFlexible
    ? Math.round(property.price_per_night * 1.08)
    : property.price_per_night;
  const roomTotal = nightly * nights;
  const serviceFee = 0;
  const totalPrice = roomTotal + serviceFee;

  const handleCheckout = async () => {
    if (!guest.givenName.trim() || !guest.email.trim()) {
      toast.error('Please enter guest name and email.');
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(`${API}/payments/checkout`, {
        property_id: property.id,
        check_in: bookingData.checkIn,
        check_out: bookingData.checkOut,
        guests: bookingData.guests,
        origin_url: window.location.origin,
        user_id: user.id,
      });
      window.location.href = response.data.checkout_url;
    } catch (error) {
      toast.error('Failed to start checkout. Please try again.');
      console.error('Checkout error:', error);
      setLoading(false);
    }
  };

  const card = 'bg-white border border-black/[0.06] shadow-sm rounded-2xl';

  return (
    <div className="min-h-[100dvh] bg-[#f4f4f5]">
      <Navbar
        logo="HiddenStay"
        logoTo="/traveller"
        action={{ label: 'Back', onClick: () => navigate(-1) }}
      />

      {/* Stepper */}
      <div className="border-b border-black/[0.06] bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-center gap-2 sm:gap-6">
          {STEPS.map((step, i) => {
            const active = step.n === 2;
            const done = step.n < 2;
            return (
              <div key={step.n} className="flex items-center gap-2 sm:gap-3">
                {i > 0 && (
                  <div className="hidden sm:block w-8 h-px bg-black/10 mr-1" />
                )}
                <span
                  className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${
                    done
                      ? 'bg-primary text-primary-foreground'
                      : active
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-[#ececee] text-muted-foreground'
                  }`}
                >
                  {done ? <Check className="w-3.5 h-3.5" /> : step.n}
                </span>
                <span
                  className={`text-xs sm:text-sm ${
                    active ? 'font-semibold text-foreground' : 'text-muted-foreground'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          {/* Soft info banner — honest, no fake savings */}
          <div className="mb-5 rounded-2xl border border-emerald-200/80 bg-emerald-50/90 px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-sm">
            <p className="text-emerald-800 flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              No guest service fees — you only pay the room price
            </p>
            <p className="text-emerald-800/80 flex items-center gap-2 sm:border-l sm:border-emerald-200 sm:pl-6">
              Host keeps 95% of this booking
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-start">
            {/* LEFT */}
            <div className="lg:col-span-7 space-y-4">
              {/* Who's staying */}
              <section className={`${card} p-5 sm:p-6`}>
                <h2 className="text-lg font-display font-medium text-foreground mb-1">
                  Who&apos;s staying?
                </h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Guest details for this booking
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="min-w-0">
                    <label className="block text-sm font-medium mb-1.5">Given name</label>
                    <Input
                      value={guest.givenName}
                      onChange={(e) => setGuest({ ...guest, givenName: e.target.value })}
                      className="rounded-xl bg-[#fafafa] border-slate-200"
                      placeholder="Given name"
                    />
                  </div>
                  <div className="min-w-0">
                    <label className="block text-sm font-medium mb-1.5">Surname</label>
                    <Input
                      value={guest.surname}
                      onChange={(e) => setGuest({ ...guest, surname: e.target.value })}
                      className="rounded-xl bg-[#fafafa] border-slate-200"
                      placeholder="Surname"
                    />
                  </div>
                  <div className="min-w-0 sm:col-span-2">
                    <label className="block text-sm font-medium mb-1.5">Email</label>
                    <Input
                      type="email"
                      value={guest.email}
                      onChange={(e) => setGuest({ ...guest, email: e.target.value })}
                      className="rounded-xl bg-[#fafafa] border-slate-200"
                      placeholder="you@email.com"
                    />
                  </div>
                  <div className="min-w-0 sm:col-span-2">
                    <label className="block text-sm font-medium mb-1.5">Phone (optional)</label>
                    <Input
                      type="tel"
                      value={guest.phone}
                      onChange={(e) => setGuest({ ...guest, phone: e.target.value })}
                      className="rounded-xl bg-[#fafafa] border-slate-200"
                      placeholder="+65 …"
                    />
                  </div>
                </div>
              </section>

              {/* Stay dates */}
              <section className={`${card} p-5 sm:p-6`}>
                <h2 className="text-lg font-display font-medium text-foreground mb-4">
                  Your stay
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div className="min-w-0">
                    <label className="block text-sm font-medium mb-1.5">Check-in</label>
                    <Input
                      data-testid="checkout-checkin-input"
                      type="date"
                      value={bookingData.checkIn}
                      onChange={(e) =>
                        setBookingData({ ...bookingData, checkIn: e.target.value })
                      }
                      className="rounded-xl min-w-0 bg-[#fafafa] border-slate-200"
                    />
                  </div>
                  <div className="min-w-0">
                    <label className="block text-sm font-medium mb-1.5">Check-out</label>
                    <Input
                      data-testid="checkout-checkout-input"
                      type="date"
                      value={bookingData.checkOut}
                      onChange={(e) =>
                        setBookingData({ ...bookingData, checkOut: e.target.value })
                      }
                      className="rounded-xl min-w-0 bg-[#fafafa] border-slate-200"
                    />
                  </div>
                  <div className="min-w-0">
                    <label className="block text-sm font-medium mb-1.5">Guests</label>
                    <Input
                      data-testid="checkout-guests-input"
                      type="number"
                      min="1"
                      value={bookingData.guests}
                      onChange={(e) =>
                        setBookingData({
                          ...bookingData,
                          guests: parseInt(e.target.value, 10) || 1,
                        })
                      }
                      className="rounded-xl min-w-0 bg-[#fafafa] border-slate-200"
                    />
                  </div>
                </div>
              </section>

              {/* Special requests */}
              <section className={`${card} p-5 sm:p-6`}>
                <button
                  type="button"
                  onClick={() => setShowRequests((v) => !v)}
                  className="w-full flex items-center justify-between text-left"
                >
                  <div>
                    <h2 className="text-lg font-display font-medium text-foreground">
                      Special requests
                    </h2>
                    <p className="text-sm text-muted-foreground">Optional</p>
                  </div>
                  <span className="text-sm font-medium text-primary">
                    {showRequests ? 'Hide' : 'Add'}
                  </span>
                </button>
                {showRequests && (
                  <Textarea
                    value={specialRequest}
                    onChange={(e) => setSpecialRequest(e.target.value)}
                    placeholder="e.g. late check-in, quiet room…"
                    className="mt-4 min-h-[88px] rounded-xl bg-[#fafafa] border-slate-200"
                  />
                )}
              </section>

              {/* Payment */}
              <section className={`${card} p-5 sm:p-6`}>
                <h2 className="text-lg font-display font-medium text-foreground mb-1">
                  How would you like to pay?
                </h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Secure payment via Stripe
                </p>

                <div className="rounded-xl border-2 border-primary bg-primary/5 p-4 flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 font-medium text-foreground">
                      <CreditCard className="w-4 h-4 text-primary" />
                      Credit / Debit card
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      You&apos;ll enter card details on Stripe&apos;s secure page after you book.
                    </p>
                    <p className="text-xs text-muted-foreground mt-3 rounded-lg bg-white border border-black/[0.05] px-3 py-2 font-mono">
                      Test: 4242 4242 4242 4242 · any future expiry · any CVC
                    </p>
                  </div>
                </div>

                <Button
                  data-testid="confirm-payment-button"
                  onClick={handleCheckout}
                  disabled={loading}
                  className="w-full mt-5 h-12 sm:h-14 text-base sm:text-lg rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-sm"
                >
                  {loading ? 'Redirecting…' : 'Book now'}
                </Button>

                <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                    Host keeps 95%
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-primary" />
                    Secure payment
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground text-center mt-3 leading-relaxed">
                  By booking, you agree to HiddenStay&apos;s demo terms. Capstone sandbox — no live charges.
                </p>
              </section>
            </div>

            {/* RIGHT summary */}
            <aside className="lg:col-span-5 space-y-3 lg:sticky lg:top-20">
              <div className={`${card} p-4 sm:p-5`}>
                <div className="flex gap-3">
                  <img
                    src={property.images?.[0]}
                    alt={property.name}
                    className="w-20 h-20 rounded-xl object-cover shrink-0"
                  />
                  <div className="min-w-0">
                    <h3
                      className="font-semibold text-foreground leading-snug"
                      data-testid="summary-property-name"
                    >
                      {property.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      {property.city}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1.5 capitalize">
                      {property.type || 'Homestay'}
                    </p>
                  </div>
                </div>
                <ul className="mt-3 pt-3 border-t border-black/[0.06] space-y-1.5 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <BedDouble className="w-4 h-4 text-primary shrink-0" />
                    Entire place
                  </li>
                  {(property.amenities || []).slice(0, 3).map((a) => (
                    <li key={a} className="flex items-center gap-2">
                      <Wifi className="w-4 h-4 text-primary shrink-0" />
                      {a}
                    </li>
                  ))}
                  <li className="flex items-center gap-2">
                    {isFlexible ? (
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <Ban className="w-4 h-4 text-muted-foreground shrink-0" />
                    )}
                    {isFlexible ? 'Free cancellation (48h)' : 'Non-refundable'}
                  </li>
                </ul>
              </div>

              <div className={`${card} p-4 sm:p-5`}>
                <h3 className="font-semibold text-foreground mb-3">Your stay</h3>
                <div className="flex items-start gap-3 text-sm">
                  <Clock className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-foreground font-medium">
                      {formatStayDate(bookingData.checkIn)} – {formatStayDate(bookingData.checkOut)}
                    </p>
                    <p className="text-muted-foreground mt-1">
                      {nights} night{nights === 1 ? '' : 's'} · {bookingData.guests} guest
                      {bookingData.guests === 1 ? '' : 's'}
                    </p>
                    <p className="text-muted-foreground text-xs mt-1">
                      Check-in from 14:00 · Check-out by 11:00
                    </p>
                  </div>
                </div>
              </div>

              <div className={`${card} p-4 sm:p-5`}>
                <h3 className="font-semibold text-foreground mb-3">Price details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between gap-3">
                    <span className="text-muted-foreground">
                      SGD {nightly} × {nights} night{nights === 1 ? '' : 's'}
                    </span>
                    <span className="tabular-nums">SGD {roomTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-muted-foreground">Guest service fee</span>
                    <span className="tabular-nums text-emerald-700">SGD 0.00</span>
                  </div>
                  {isFlexible && (
                    <div className="flex justify-between gap-3 text-muted-foreground">
                      <span>Flexible rate</span>
                      <span className="tabular-nums">Included</span>
                    </div>
                  )}
                </div>
                <div className="mt-4 pt-3 border-t border-black/[0.06] flex justify-between items-baseline gap-3">
                  <span className="font-semibold">Total</span>
                  <span
                    className="text-2xl font-semibold text-primary tabular-nums"
                    data-testid="total-price"
                  >
                    SGD {totalPrice.toFixed(2)}
                  </span>
                </div>
                <p className="text-xs text-emerald-700 mt-2">Incl. taxes as shown · no extra guest fees</p>
              </div>

              <div className={`${card} p-4 sm:p-5`}>
                <h3 className="font-semibold text-foreground mb-2">Cancellation policy</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {isFlexible
                    ? 'Free cancellation until 48 hours before check-in. After that, the stay is non-refundable.'
                    : 'This rate is non-refundable. The full amount is charged at booking (Stripe test mode).'}
                </p>
              </div>
            </aside>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

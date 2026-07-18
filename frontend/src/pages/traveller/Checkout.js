import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import { Input } from '@/components/ui/input';
import axios from 'axios';
import { toast } from 'sonner';
import { CreditCard, ShieldCheck } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Checkout({ user }) {
  const location = useLocation();
  const navigate = useNavigate();
  const property = location.state?.property;
  const [loading, setLoading] = useState(false);
  const [bookingData, setBookingData] = useState({
    checkIn: '2026-03-01',
    checkOut: '2026-03-04',
    guests: 2
  });

  if (!property) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">No property selected</p>
          <Button onClick={() => navigate('/traveller')}>Go to Home</Button>
        </div>
      </div>
    );
  }

  const nights = Math.max(1, Math.ceil((new Date(bookingData.checkOut) - new Date(bookingData.checkIn)) / (1000 * 60 * 60 * 24)));
  const totalPrice = property.price_per_night * nights;

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API}/payments/checkout`, {
        property_id: property.id,
        check_in: bookingData.checkIn,
        check_out: bookingData.checkOut,
        guests: bookingData.guests,
        origin_url: window.location.origin,
        user_id: user.id
      });
      window.location.href = response.data.checkout_url;
    } catch (error) {
      toast.error('Failed to start checkout. Please try again.');
      console.error('Checkout error:', error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        logo="HiddenStay"
        logoTo="/traveller"
        action={{ label: 'Back', onClick: () => navigate(-1) }}
      />

      <div className="max-w-4xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl sm:text-4xl font-display font-medium tracking-tight text-foreground mb-8">
            Complete Your Booking
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="backdrop-blur-xl bg-white/60 border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.08)] backdrop-saturate-150 rounded-3xl p-8 mb-6">
                <h2 className="text-xl font-display font-medium text-foreground mb-6">Booking Details</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Check-in</label>
                    <Input
                      data-testid="checkout-checkin-input"
                      type="date"
                      value={bookingData.checkIn}
                      onChange={(e) => setBookingData({ ...bookingData, checkIn: e.target.value })}
                      className="rounded-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Check-out</label>
                    <Input
                      data-testid="checkout-checkout-input"
                      type="date"
                      value={bookingData.checkOut}
                      onChange={(e) => setBookingData({ ...bookingData, checkOut: e.target.value })}
                      className="rounded-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Guests</label>
                    <Input
                      data-testid="checkout-guests-input"
                      type="number"
                      min="1"
                      value={bookingData.guests}
                      onChange={(e) => setBookingData({ ...bookingData, guests: parseInt(e.target.value) })}
                      className="rounded-full"
                    />
                  </div>
                </div>
              </div>

              <div className="backdrop-blur-xl bg-white/60 border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.08)] backdrop-saturate-150 rounded-3xl p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-display font-medium text-foreground">Secure Stripe Checkout</h2>
                    <p className="text-sm text-muted-foreground">You&apos;ll be redirected to Stripe to complete payment</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground bg-muted/40 rounded-xl p-4">
                  Test card: <span className="font-mono font-medium text-foreground">4242 4242 4242 4242</span> • Any future expiry • Any 3-digit CVC
                </p>
              </div>
            </div>

            <div>
              <div className="backdrop-blur-xl bg-white/60 border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.08)] backdrop-saturate-150 rounded-3xl p-8 sticky top-24">
                <h2 className="text-xl font-display font-medium text-foreground mb-6">Summary</h2>
                <div className="mb-6">
                  <img
                    src={property.images[0]}
                    alt={property.name}
                    className="w-full aspect-[4/3] object-cover rounded-2xl mb-4"
                  />
                  <h3 className="font-medium text-foreground" data-testid="summary-property-name">{property.name}</h3>
                  <p className="text-sm text-muted-foreground">{property.city}</p>
                </div>

                <div className="space-y-3 mb-6 pb-6 border-b border-border">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">SGD {property.price_per_night} x {nights} night(s)</span>
                    <span className="text-foreground">SGD {totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Service fee</span>
                    <span className="text-foreground">SGD 0.00</span>
                  </div>
                </div>

                <div className="flex justify-between mb-6">
                  <span className="font-semibold text-foreground">Total</span>
                  <span className="font-semibold text-2xl text-primary" data-testid="total-price">SGD {totalPrice.toFixed(2)}</span>
                </div>

                <Button
                  data-testid="confirm-payment-button"
                  onClick={handleCheckout}
                  disabled={loading}
                  className="w-full h-14 text-lg rounded-full bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 hover:-translate-y-1 hover:shadow-lg active:scale-95"
                >
                  <CreditCard className="w-5 h-5 mr-2" />
                  {loading ? 'Redirecting to Stripe...' : 'Pay with Stripe'}
                </Button>

                <p className="text-xs text-muted-foreground text-center mt-4">
                  No service fees added • Host keeps 95%
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

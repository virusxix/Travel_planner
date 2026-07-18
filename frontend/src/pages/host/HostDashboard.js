import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { CurrencyDollar, Calendar, House, TrendUp } from '@phosphor-icons/react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function HostDashboard({ user }) {
  const navigate = useNavigate();
  const [earnings, setEarnings] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [earningsRes, bookingsRes, propertiesRes] = await Promise.all([
        axios.get(`${API}/host/earnings?host_id=${user.id}`),
        axios.get(`${API}/bookings?user_id=${user.id}&role=host`),
        axios.get(`${API}/properties?status=approved`)
      ]);
      setEarnings(earningsRes.data);
      setBookings(bookingsRes.data.slice(0, 5));
      setProperties(propertiesRes.data.filter(p => p.host_id === user.id).slice(0, 3));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="backdrop-blur-xl bg-white/60 border-b border-white/40 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-display font-medium text-primary">HiddenStay Host</h1>
          <div className="flex items-center gap-4">
            <Button data-testid="host-listings-link" onClick={() => navigate('/host/listings')} variant="ghost">My Listings</Button>
            <Button data-testid="host-payouts-link" onClick={() => navigate('/host/payouts')} variant="ghost">Payouts</Button>
            <Button data-testid="host-reviews-link" onClick={() => navigate('/host/reviews')} variant="ghost">Reviews</Button>
            <span className="text-sm text-muted-foreground">Welcome, {user?.name}</span>
            <Button onClick={() => { localStorage.removeItem('hiddenstay_user'); window.location.href = '/'; }} variant="ghost" size="sm">Logout</Button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-medium tracking-tight leading-tight text-foreground mb-2">
            Dashboard
          </h1>
          <p className="text-muted-foreground">Manage your properties and track earnings</p>
        </motion.div>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading...</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.6 }}
                className="bg-card border border-border rounded-2xl p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <CurrencyDollar size={24} className="text-primary" weight="bold" />
                  </div>
                  {earnings?.available_earnings > 0 && (
                    <Button
                      data-testid="request-payout-button"
                      onClick={() => navigate('/host/payouts')}
                      size="sm"
                      className="rounded-full h-8 px-4 text-xs bg-primary hover:bg-primary/90"
                    >
                      Request Payout
                    </Button>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-1">Available Earnings (95%)</p>
                <p className="text-3xl font-display font-semibold text-foreground" data-testid="available-earnings">
                  SGD {earnings?.available_earnings || 0}
                </p>
                {earnings?.pending_payouts > 0 && (
                  <p className="text-xs text-muted-foreground mt-2">
                    <span className="font-medium text-accent">SGD {earnings.pending_payouts}</span> pending payout
                  </p>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="bg-card border border-border rounded-2xl p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                    <TrendUp size={24} className="text-accent" weight="bold" />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-1">Platform Fee (5%)</p>
                <p className="text-3xl font-display font-semibold text-foreground" data-testid="platform-fee">
                  SGD {earnings?.platform_fee || 0}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="bg-card border border-border rounded-2xl p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
                    <Calendar size={24} className="text-secondary" weight="bold" />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-1">Total Bookings</p>
                <p className="text-3xl font-display font-semibold text-foreground" data-testid="total-bookings">
                  {earnings?.total_bookings || 0}
                </p>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-display font-medium text-foreground">Recent Bookings</h2>
                  <Button onClick={() => navigate('/host/listings')} size="sm" variant="ghost">View All</Button>
                </div>
                <div className="space-y-4">
                  {bookings.length === 0 ? (
                    <div className="bg-card border border-border rounded-2xl p-8 text-center text-muted-foreground">
                      No bookings yet
                    </div>
                  ) : (
                    bookings.map((booking) => (
                      <div key={booking.id} className="bg-card border border-border rounded-2xl p-6" data-testid={`booking-${booking.id}`}>
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="font-medium text-foreground">Booking #{booking.id.slice(-6)}</p>
                            <p className="text-sm text-muted-foreground">{booking.check_in} to {booking.check_out}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-primary">SGD {booking.host_payout?.toFixed(2)}</p>
                            <p className="text-xs text-muted-foreground">Your payout (95%)</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Platform fee: SGD {booking.platform_fee?.toFixed(2)} (5%)</span>
                          <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                            {booking.status}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-display font-medium text-foreground">My Properties</h2>
                  <Button data-testid="add-listing-button" onClick={() => navigate('/host/add-listing')} size="sm" className="rounded-full">Add New</Button>
                </div>
                <div className="space-y-4">
                  {properties.length === 0 ? (
                    <div className="bg-card border border-border rounded-2xl p-8 text-center text-muted-foreground">
                      <House size={48} className="mx-auto mb-4 opacity-30" />
                      <p>No properties listed yet</p>
                      <Button onClick={() => navigate('/host/add-listing')} className="mt-4 rounded-full">Add Your First Property</Button>
                    </div>
                  ) : (
                    properties.map((property) => (
                      <div key={property.id} className="bg-card border border-border rounded-2xl overflow-hidden" data-testid={`property-${property.id}`}>
                        <div className="flex gap-4 p-4">
                          <img
                            src={property.images[0]}
                            alt={property.name}
                            className="w-24 h-24 object-cover rounded-xl"
                          />
                          <div className="flex-1">
                            <h3 className="font-medium text-foreground mb-1">{property.name}</h3>
                            <p className="text-sm text-muted-foreground mb-2">{property.city}</p>
                            <div className="flex items-center justify-between">
                              <span className="text-primary font-semibold">SGD {property.price_per_night} / night</span>
                              <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                                {property.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

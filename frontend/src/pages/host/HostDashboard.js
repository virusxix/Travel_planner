import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import { CurrencyDollar, Calendar, House, TrendUp } from '@phosphor-icons/react';
import axios from 'axios';
import { monthlyBookingSeries, countByStatus } from '@/lib/progressStats';
import {
  GoalTrackers,
  EarningsTrendChart,
  BookingsBarChart,
  StatusDonutChart,
} from '@/components/ProgressDashboard';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function HostDashboard({ user }) {
  const navigate = useNavigate();
  const [earnings, setEarnings] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
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
        axios.get(`${API}/properties?status=all`),
      ]);
      const hostBookings = bookingsRes.data || [];
      setAllBookings(hostBookings);
      setEarnings(earningsRes.data);
      setBookings(hostBookings.slice(0, 5));
      setProperties((propertiesRes.data || []).filter((p) => p.host_id === user.id));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const monthly = useMemo(
    () => monthlyBookingSeries(allBookings, { amountField: 'host_payout' }),
    [allBookings]
  );
  const statusData = useMemo(() => countByStatus(allBookings), [allBookings]);
  const liveListings = useMemo(
    () => properties.filter((p) => p.status === 'approved').length,
    [properties]
  );
  const goals = useMemo(
    () => [
      {
        id: 'bookings',
        label: 'Bookings goal',
        current: earnings?.total_bookings ?? allBookings.length,
        target: 10,
      },
      {
        id: 'earnings',
        label: 'Lifetime payout',
        current: earnings?.lifetime_earnings ?? 0,
        target: 1000,
        format: 'money',
      },
      {
        id: 'listings',
        label: 'Live listings',
        current: liveListings,
        target: 10,
      },
    ],
    [earnings, allBookings.length, liveListings]
  );

  return (
    <div className="min-h-screen bg-[#f4f4f5]">
      <Navbar
        logo="HiddenStay Host"
        logoTo="/host"
        links={[
          { label: 'My Listings', to: '/host/listings', testId: 'host-listings-link' },
          { label: 'Payouts', to: '/host/payouts', testId: 'host-payouts-link' },
          { label: 'Reviews', to: '/host/reviews', testId: 'host-reviews-link' },
        ]}
        user={user}
        showLogout
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 sm:mb-10"
        >
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-medium tracking-tight leading-tight text-foreground mb-2">
            Dashboard
          </h1>
          <p className="text-muted-foreground">Track earnings, bookings, and listing progress</p>
        </motion.div>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading...</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.6 }}
                className="bg-white border border-black/[0.06] shadow-sm rounded-2xl p-6"
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
                <p className="text-sm text-muted-foreground mb-1">
                  Available to withdraw (your 95%)
                </p>
                <p
                  className="text-3xl font-display font-semibold text-foreground"
                  data-testid="available-earnings"
                >
                  SGD {(earnings?.available_earnings ?? 0).toFixed(2)}
                </p>
                {earnings?.pending_payouts > 0 && (
                  <p className="text-xs text-muted-foreground mt-2">
                    <span className="font-medium text-accent">
                      SGD {Number(earnings.pending_payouts).toFixed(2)}
                    </span>{' '}
                    pending payout
                  </p>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="bg-white border border-black/[0.06] shadow-sm rounded-2xl p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                    <TrendUp size={24} className="text-accent" weight="bold" />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-1">
                  Fees paid to HiddenStay (5%)
                </p>
                <p
                  className="text-3xl font-display font-semibold text-foreground"
                  data-testid="platform-fee"
                >
                  SGD {(earnings?.platform_fee ?? 0).toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Lifetime payout SGD {(earnings?.lifetime_earnings ?? 0).toFixed(2)}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="bg-white border border-black/[0.06] shadow-sm rounded-2xl p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
                    <Calendar size={24} className="text-secondary" weight="bold" />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-1">Total Bookings</p>
                <p
                  className="text-3xl font-display font-semibold text-foreground"
                  data-testid="total-bookings"
                >
                  {earnings?.total_bookings ?? 0}
                </p>
              </motion.div>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-display font-medium text-foreground mb-4">
                Your progress
              </h2>
              <GoalTrackers goals={goals} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-10">
              <EarningsTrendChart
                data={monthly}
                title="Your payout over time"
                amountLabel="Your payout (SGD)"
              />
              <BookingsBarChart data={monthly} />
            </div>

            {statusData.length > 0 && (
              <div className="mb-10 max-w-xl">
                <StatusDonutChart
                  data={statusData}
                  title="Booking status"
                  subtitle="All your bookings"
                />
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-display font-medium text-foreground">
                    Recent Bookings
                  </h2>
                  <Button onClick={() => navigate('/host/listings')} size="sm" variant="ghost">
                    View All
                  </Button>
                </div>
                <div className="space-y-4">
                  {bookings.length === 0 ? (
                    <div className="bg-white border border-black/[0.06] rounded-2xl p-8 text-center text-muted-foreground">
                      No bookings yet
                    </div>
                  ) : (
                    bookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="bg-white border border-black/[0.06] shadow-sm rounded-2xl p-6"
                        data-testid={`booking-${booking.id}`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="font-medium text-foreground">
                              Booking #{booking.id.slice(-6)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {booking.check_in} to {booking.check_out}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-primary">
                              SGD {booking.host_payout?.toFixed(2)}
                            </p>
                            <p className="text-xs text-muted-foreground">Your payout (95%)</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            Platform fee: SGD {booking.platform_fee?.toFixed(2)} (5%)
                          </span>
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
                  <h2 className="text-xl font-display font-medium text-foreground">
                    My Properties
                    {liveListings > 0 && (
                      <span className="ml-2 text-sm font-sans font-normal text-muted-foreground">
                        ({liveListings} live)
                      </span>
                    )}
                  </h2>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => navigate('/host/listings')}
                      size="sm"
                      variant="ghost"
                    >
                      View All
                    </Button>
                    <Button
                      data-testid="add-listing-button"
                      onClick={() => navigate('/host/add-listing')}
                      size="sm"
                      className="rounded-full"
                    >
                      Add New
                    </Button>
                  </div>
                </div>
                <div className="space-y-4">
                  {properties.length === 0 ? (
                    <div className="bg-white border border-black/[0.06] rounded-2xl p-8 text-center text-muted-foreground">
                      <House size={48} className="mx-auto mb-4 opacity-30" />
                      <p>No properties listed yet</p>
                      <Button
                        onClick={() => navigate('/host/add-listing')}
                        className="mt-4 rounded-full"
                      >
                        Add Your First Property
                      </Button>
                    </div>
                  ) : (
                    properties.slice(0, 3).map((property) => (
                      <div
                        key={property.id}
                        className="bg-white border border-black/[0.06] shadow-sm rounded-2xl overflow-hidden"
                        data-testid={`property-${property.id}`}
                      >
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
                              <span className="text-primary font-semibold">
                                SGD {property.price_per_night} / night
                              </span>
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

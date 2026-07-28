import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import {
  ChartBar,
  House,
  CalendarCheck,
  CurrencyDollar,
  ClockCounterClockwise,
} from '@phosphor-icons/react';
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

export default function AdminDashboard({ user }) {
  const navigate = useNavigate();
  const [overview, setOverview] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOverview();
  }, []);

  const fetchOverview = async () => {
    try {
      const [overviewRes, bookingsRes, propsRes] = await Promise.all([
        axios.get(`${API}/admin/overview`),
        axios.get(`${API}/bookings`),
        axios.get(`${API}/properties?status=all`),
      ]);
      setOverview(overviewRes.data);
      setBookings(bookingsRes.data || []);
      setProperties(propsRes.data || []);
    } catch (error) {
      console.error('Error fetching overview:', error);
    } finally {
      setLoading(false);
    }
  };

  const monthly = useMemo(
    () => monthlyBookingSeries(bookings, { amountField: 'platform_fee' }),
    [bookings]
  );
  const propertyStatus = useMemo(() => countByStatus(properties), [properties]);
  const bookingStatus = useMemo(() => countByStatus(bookings), [bookings]);
  const approvedCount = properties.filter((p) => p.status === 'approved').length;

  // Capstone MVP targets (PROJECT_BRIEF §6.3): 5 pilots, 30+ bookings
  const goals = useMemo(
    () => [
      {
        id: 'listings',
        label: 'Approved listings',
        current: approvedCount,
        target: 5,
      },
      {
        id: 'bookings',
        label: 'Platform bookings',
        current: overview?.total_bookings ?? bookings.length,
        target: 30,
      },
      {
        id: 'revenue',
        label: 'Platform fee revenue',
        current: overview?.platform_revenue ?? 0,
        target: 200,
        format: 'money',
      },
    ],
    [approvedCount, overview, bookings.length]
  );

  return (
    <div className="min-h-screen bg-[#f4f4f5]">
      <Navbar
        logo="HiddenStay Admin"
        logoTo="/admin"
        links={[
          { label: 'Pending Approvals', to: '/admin/approvals', testId: 'admin-approvals-link' },
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
            Platform Overview
          </h1>
          <p className="text-muted-foreground">
            Track platform growth, revenue, and listing health
          </p>
        </motion.div>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading overview...</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.6 }}
                className="bg-white border border-black/[0.06] shadow-sm rounded-2xl p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <House size={24} className="text-primary" weight="bold" />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-1">Total properties</p>
                <p
                  className="text-3xl font-display font-semibold text-foreground"
                  data-testid="total-properties"
                >
                  {overview?.total_properties ?? 0}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  {approvedCount} approved · {overview?.pending_approvals ?? 0} pending
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="bg-white border border-black/[0.06] shadow-sm rounded-2xl p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                    <ClockCounterClockwise size={24} className="text-accent" weight="bold" />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-1">Pending Approvals</p>
                <p
                  className="text-3xl font-display font-semibold text-foreground"
                  data-testid="pending-approvals"
                >
                  {overview?.pending_approvals ?? 0}
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
                    <CalendarCheck size={24} className="text-secondary" weight="bold" />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-1">Total Bookings</p>
                <p
                  className="text-3xl font-display font-semibold text-foreground"
                  data-testid="total-bookings-admin"
                >
                  {overview?.total_bookings ?? 0}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="bg-white border border-black/[0.06] shadow-sm rounded-2xl p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <CurrencyDollar size={24} className="text-primary" weight="bold" />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-1">
                  Platform fee revenue (5%)
                </p>
                <p
                  className="text-3xl font-display font-semibold text-foreground"
                  data-testid="platform-revenue"
                >
                  SGD {(overview?.platform_revenue ?? 0).toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Commission only · Growth tools / ads not included
                </p>
              </motion.div>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-display font-medium text-foreground mb-4">
                Platform progress
              </h2>
              <GoalTrackers goals={goals} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
              <EarningsTrendChart
                data={monthly}
                title="Platform fee over time"
                amountLabel="Platform fee (SGD)"
              />
              <BookingsBarChart data={monthly} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-10">
              <StatusDonutChart
                data={propertyStatus}
                title="Listings by status"
                subtitle="Approved · pending · rejected"
              />
              <StatusDonutChart
                data={bookingStatus}
                title="Bookings by status"
                subtitle="Across the platform"
              />
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="bg-white border border-black/[0.06] shadow-sm rounded-3xl p-6 sm:p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-display font-medium text-foreground">Quick Actions</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  data-testid="view-pending-approvals-button"
                  onClick={() => navigate('/admin/approvals')}
                  className="h-20 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground text-lg justify-start px-6 transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                      <ClockCounterClockwise size={24} weight="bold" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold">Review Pending</div>
                      <div className="text-sm opacity-90">
                        {overview?.pending_approvals ?? 0} listings waiting
                      </div>
                    </div>
                  </div>
                </Button>

                <div className="h-20 rounded-2xl bg-[#fafafa] border border-black/[0.06] flex items-center px-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <ChartBar size={24} className="text-primary" weight="bold" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-foreground">Commission Model</div>
                      <div className="text-sm text-muted-foreground">
                        Host: 95% • Platform: 5%
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}

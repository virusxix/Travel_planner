import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import { ChartBar, House, CalendarCheck, CurrencyDollar, ClockCounterClockwise } from '@phosphor-icons/react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function AdminDashboard({ user }) {
  const navigate = useNavigate();
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOverview();
  }, []);

  const fetchOverview = async () => {
    try {
      const response = await axios.get(`${API}/admin/overview`);
      setOverview(response.data);
    } catch (error) {
      console.error('Error fetching overview:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        logo="HiddenStay Admin"
        logoTo="/admin"
        links={[{ label: 'Pending Approvals', to: '/admin/approvals', testId: 'admin-approvals-link' }]}
        user={user}
        showLogout
      />

      <div className="max-w-7xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-medium tracking-tight leading-tight text-foreground mb-2">
            Platform Overview
          </h1>
          <p className="text-muted-foreground">Monitor platform performance and manage listings</p>
        </motion.div>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading overview...</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.6 }}
                className="bg-card border border-border rounded-2xl p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <House size={24} className="text-primary" weight="bold" />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-1">Total Properties</p>
                <p className="text-3xl font-display font-semibold text-foreground" data-testid="total-properties">
                  {overview?.total_properties || 0}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="bg-card border border-border rounded-2xl p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                    <ClockCounterClockwise size={24} className="text-accent" weight="bold" />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-1">Pending Approvals</p>
                <p className="text-3xl font-display font-semibold text-foreground" data-testid="pending-approvals">
                  {overview?.pending_approvals || 0}
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
                    <CalendarCheck size={24} className="text-secondary" weight="bold" />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-1">Total Bookings</p>
                <p className="text-3xl font-display font-semibold text-foreground" data-testid="total-bookings-admin">
                  {overview?.total_bookings || 0}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="bg-card border border-border rounded-2xl p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <CurrencyDollar size={24} className="text-primary" weight="bold" />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-1">Platform Revenue (5%)</p>
                <p className="text-3xl font-display font-semibold text-foreground" data-testid="platform-revenue">
                  SGD {overview?.platform_revenue || 0}
                </p>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="backdrop-blur-xl bg-white/60 border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.08)] backdrop-saturate-150 rounded-3xl p-8"
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
                      <div className="text-sm opacity-90">{overview?.pending_approvals || 0} listings waiting</div>
                    </div>
                  </div>
                </Button>

                <div className="h-20 rounded-2xl bg-card border border-border flex items-center px-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <ChartBar size={24} className="text-primary" weight="bold" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-foreground">Commission Model</div>
                      <div className="text-sm text-muted-foreground">Host: 95% • Platform: 5%</div>
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

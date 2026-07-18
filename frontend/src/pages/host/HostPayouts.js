import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { CurrencyDollar, ClockCounterClockwise, CheckCircle } from '@phosphor-icons/react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function HostPayouts({ user }) {
  const navigate = useNavigate();
  const [earnings, setEarnings] = useState(null);
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [requestAmount, setRequestAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [earningsRes, payoutsRes] = await Promise.all([
        axios.get(`${API}/host/earnings?host_id=${user.id}`),
        axios.get(`${API}/host/payouts?host_id=${user.id}`)
      ]);
      setEarnings(earningsRes.data);
      setPayouts(payoutsRes.data);
    } catch (error) {
      console.error('Error fetching payouts:', error);
    } finally {
      setLoading(false);
    }
  };

  const openRequestDialog = () => {
    setRequestAmount(earnings?.available_earnings?.toString() || '');
    setShowDialog(true);
  };

  const handleSubmit = async () => {
    const amount = parseFloat(requestAmount);
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    setSubmitting(true);
    try {
      await axios.post(`${API}/host/payouts`, { amount, host_id: user.id });
      toast.success(`Payout of SGD ${amount.toFixed(2)} requested!`);
      setShowDialog(false);
      setRequestAmount('');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to request payout');
    } finally {
      setSubmitting(false);
    }
  };

  const pendingPayouts = payouts.filter(p => p.status === 'pending');
  const paidPayouts = payouts.filter(p => p.status === 'paid');

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        logo="HiddenStay Host"
        logoTo="/host"
        links={[
          { label: 'Dashboard', to: '/host', testId: 'back-to-dashboard' },
          { label: 'My Listings', to: '/host/listings', testId: 'listings-link' },
          { label: 'Reviews', to: '/host/reviews', testId: 'host-reviews-link' },
        ]}
        showLogout
      />

      <div className="max-w-6xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-4">Payouts</p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-medium tracking-tight leading-tight text-foreground mb-2">
            Your Earnings
          </h1>
          <p className="text-muted-foreground">Request payouts and track your history</p>
        </motion.div>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading...</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.6 }}
                className="bg-card border border-border rounded-2xl p-6 md:col-span-2"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <CurrencyDollar size={20} className="text-primary" weight="bold" />
                  </div>
                  <span className="text-sm text-muted-foreground">Available to Withdraw</span>
                </div>
                <p className="text-4xl font-display font-semibold text-foreground mb-4" data-testid="available-balance">
                  SGD {(earnings?.available_earnings || 0).toFixed(2)}
                </p>
                <Button
                  data-testid="open-payout-dialog"
                  onClick={openRequestDialog}
                  disabled={!earnings?.available_earnings || earnings.available_earnings <= 0}
                  className="rounded-full h-11 px-6 bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 hover:-translate-y-0.5"
                >
                  Request Payout
                </Button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="bg-card border border-border rounded-2xl p-6"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                    <ClockCounterClockwise size={20} className="text-accent" weight="bold" />
                  </div>
                  <span className="text-sm text-muted-foreground">Pending</span>
                </div>
                <p className="text-2xl font-display font-semibold text-foreground" data-testid="pending-total">
                  SGD {(earnings?.pending_payouts || 0).toFixed(2)}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="bg-card border border-border rounded-2xl p-6"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                    <CheckCircle size={20} className="text-secondary" weight="bold" />
                  </div>
                  <span className="text-sm text-muted-foreground">Paid Out</span>
                </div>
                <p className="text-2xl font-display font-semibold text-foreground" data-testid="paid-total">
                  SGD {(earnings?.paid_payouts || 0).toFixed(2)}
                </p>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                <h2 className="text-xl font-display font-medium text-foreground mb-6">Pending Requests</h2>
                {pendingPayouts.length === 0 ? (
                  <div className="bg-card border border-border rounded-2xl p-8 text-center text-muted-foreground">
                    No pending payouts
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingPayouts.map((payout) => (
                      <div
                        key={payout.id}
                        className="bg-card border border-border rounded-2xl p-5 flex items-center justify-between"
                        data-testid={`payout-pending-${payout.id}`}
                      >
                        <div>
                          <p className="font-semibold text-foreground">SGD {payout.amount.toFixed(2)}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Requested {new Date(payout.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <span className="px-3 py-1 bg-accent/20 text-accent rounded-full text-xs font-medium capitalize">
                          {payout.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                <h2 className="text-xl font-display font-medium text-foreground mb-6">Paid History</h2>
                {paidPayouts.length === 0 ? (
                  <div className="bg-card border border-border rounded-2xl p-8 text-center text-muted-foreground">
                    No paid payouts yet
                  </div>
                ) : (
                  <div className="space-y-3">
                    {paidPayouts.map((payout) => (
                      <div
                        key={payout.id}
                        className="bg-card border border-border rounded-2xl p-5 flex items-center justify-between"
                        data-testid={`payout-paid-${payout.id}`}
                      >
                        <div>
                          <p className="font-semibold text-foreground">SGD {payout.amount.toFixed(2)}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Paid {payout.paid_at ? new Date(payout.paid_at).toLocaleDateString() : ''}
                          </p>
                        </div>
                        <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium capitalize">
                          {payout.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            </div>
          </>
        )}
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-display">Request Payout</DialogTitle>
            <DialogDescription>
              Available balance: SGD {(earnings?.available_earnings || 0).toFixed(2)}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Amount (SGD)</label>
              <Input
                data-testid="payout-amount-input"
                type="number"
                min="0.01"
                step="0.01"
                max={earnings?.available_earnings}
                value={requestAmount}
                onChange={(e) => setRequestAmount(e.target.value)}
                placeholder="0.00"
                className="rounded-full"
              />
            </div>

            <div className="bg-muted/40 rounded-2xl p-4 text-sm text-muted-foreground">
              Payouts are typically processed within 2-3 business days. You&apos;ll receive a notification once paid.
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                onClick={() => setShowDialog(false)}
                variant="outline"
                className="flex-1 rounded-full"
              >
                Cancel
              </Button>
              <Button
                data-testid="submit-payout-request"
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {submitting ? 'Requesting...' : 'Request Payout'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

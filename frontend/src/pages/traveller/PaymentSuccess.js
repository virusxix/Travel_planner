import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import axios from 'axios';
import { CheckCircle2, Loader2 } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get('session_id');
  const [status, setStatus] = useState('polling');
  const [attempts, setAttempts] = useState(0);
  const pollingRef = useRef(false);

  useEffect(() => {
    if (!sessionId || pollingRef.current) return;
    pollingRef.current = true;

    let cancelled = false;
    let currentAttempts = 0;

    const poll = async () => {
      if (cancelled) return;

      if (currentAttempts >= 10) {
        setStatus('timeout');
        return;
      }

      try {
        const response = await axios.get(`${API}/payments/status/${sessionId}`);
        if (response.data.payment_status === 'paid') {
          setStatus('paid');
          return;
        }
        if (response.data.status === 'failed' || response.data.status === 'expired') {
          setStatus('failed');
          return;
        }
      } catch (error) {
        console.error('Polling error:', error);
      }

      currentAttempts += 1;
      setAttempts(currentAttempts);
      setTimeout(poll, 2000);
    };

    poll();

    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full backdrop-blur-xl bg-white/60 border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.08)] backdrop-saturate-150 rounded-3xl p-12 text-center"
      >
        {status === 'polling' && (
          <>
            <Loader2 data-testid="payment-loading-icon" className="w-16 h-16 text-primary mx-auto mb-6 animate-spin" />
            <h1 className="text-3xl sm:text-4xl font-display font-medium text-foreground mb-4">
              Confirming your booking
            </h1>
            <p className="text-muted-foreground">
              Please wait while we finalize your reservation... ({attempts}/10)
            </p>
          </>
        )}

        {status === 'paid' && (
          <>
            <CheckCircle2 data-testid="booking-success-icon" className="w-20 h-20 text-primary mx-auto mb-6" />
            <h1 className="text-3xl sm:text-4xl font-display font-medium text-foreground mb-4">
              Booking Confirmed!
            </h1>
            <p className="text-muted-foreground mb-8">
              Your stay is confirmed. Check your trips to see your booking details.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Button
                data-testid="view-trips-button"
                onClick={() => navigate('/trips')}
                className="rounded-full"
              >
                View My Trips
              </Button>
              <Button
                data-testid="back-to-home-button"
                onClick={() => navigate('/traveller')}
                variant="outline"
                className="rounded-full"
              >
                Back to Home
              </Button>
            </div>
          </>
        )}

        {status === 'failed' && (
          <>
            <div className="w-20 h-20 rounded-full bg-destructive/10 mx-auto mb-6 flex items-center justify-center">
              <svg className="w-10 h-10 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-3xl font-display font-medium text-foreground mb-4">Payment Failed</h1>
            <p className="text-muted-foreground mb-8">Something went wrong. Please try again.</p>
            <Button onClick={() => navigate('/traveller')} className="rounded-full">Back to Home</Button>
          </>
        )}

        {status === 'timeout' && (
          <>
            <h1 className="text-2xl font-display font-medium text-foreground mb-4">Still processing</h1>
            <p className="text-muted-foreground mb-8">
              Your payment is taking longer than expected. Check your trips shortly.
            </p>
            <Button onClick={() => navigate('/trips')} className="rounded-full">View My Trips</Button>
          </>
        )}
      </motion.div>
    </div>
  );
}

import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { XCircle } from 'lucide-react';

export default function PaymentCancel() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full backdrop-blur-xl bg-white/60 border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.08)] backdrop-saturate-150 rounded-3xl p-12 text-center"
      >
        <XCircle data-testid="payment-cancel-icon" className="w-20 h-20 text-muted-foreground mx-auto mb-6" />
        <h1 className="text-3xl sm:text-4xl font-display font-medium text-foreground mb-4">
          Payment Cancelled
        </h1>
        <p className="text-muted-foreground mb-8">
          No worries! Your card was not charged. You can try booking again anytime.
        </p>
        <div className="flex gap-4 justify-center">
          <Button
            data-testid="back-to-home-button"
            onClick={() => navigate('/traveller')}
            className="rounded-full"
          >
            Back to Home
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

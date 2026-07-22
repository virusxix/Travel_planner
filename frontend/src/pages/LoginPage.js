import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Globe from '@/components/Globe';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

/** SEA pilot markers — Chiang Mai, Bangkok, Da Nang, Singapore */
const SEA_MARKERS = [
  { lat: 18.79, lng: 98.98 },
  { lat: 13.76, lng: 100.5 },
  { lat: 16.05, lng: 108.2 },
  { lat: 1.35, lng: 103.8 },
];

export default function LoginPage({ setUser }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleLogin = async (role) => {
    setLoading(true);
    try {
      const response = await axios.post(`${API}/auth/login`, { role });
      setUser(response.data.user);
      toast.success(`Welcome back, ${response.data.user.name}!`);

      if (role === 'traveller') navigate('/traveller');
      else if (role === 'host') navigate('/host');
      else if (role === 'admin') navigate('/admin');
    } catch (error) {
      toast.error('Login failed. Please try again.');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#f4f4f5] relative overflow-hidden">
      {/* Dark radial pocket so the dotted globe reads; fades to traveller light */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_50%_42%,#27272a_0%,#18181b_42%,#f4f4f5_78%)]"
      />

      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
        <div className="w-[min(920px,140vw)] h-[min(920px,140vw)] opacity-90">
          <div className="w-full h-full pointer-events-auto">
            <Globe
              speed={2}
              smoothing={8}
              scale={9}
              direction="left"
              stopOnHover
              fill="dots"
              showGrid={false}
              showOutline
              oceanColor="#18181b"
              outlineColor="#e7e5e4"
              fillColor="#fafaf9"
              dots={{ color: '#fafaf9', size: 4, density: 7, allDots: false }}
              markerConfig={{
                markers: SEA_MARKERS,
                color: '#C45C3E',
                size: 48,
              }}
              initialLatitude={8}
              initialLongitude={105}
              detail={5}
            />
          </div>
        </div>
      </div>

      <div className="relative z-10 min-h-[100dvh] flex items-center justify-center p-6 sm:p-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="max-w-md w-full rounded-3xl bg-card border border-border/80 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.18)] p-8 sm:p-10"
        >
          <div className="text-center mb-10">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              className="text-primary text-xs font-bold uppercase tracking-[0.2em] mb-3"
            >
              Southeast Asia
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.55 }}
              className="text-4xl sm:text-5xl font-display font-medium tracking-tight text-foreground mb-3"
            >
              HiddenStay
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35, duration: 0.55 }}
              className="text-base text-muted-foreground"
            >
              Discover authentic Southeast Asia homestays
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.55 }}
            className="space-y-3"
          >
            <Button
              data-testid="login-traveller-button"
              onClick={() => handleLogin('traveller')}
              disabled={loading}
              className="w-full h-12 text-base rounded-full bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98]"
            >
              Login as Traveller
            </Button>

            <Button
              data-testid="login-host-button"
              onClick={() => handleLogin('host')}
              disabled={loading}
              variant="outline"
              className="w-full h-12 text-base rounded-full bg-white border-border text-foreground hover:bg-muted transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98]"
            >
              Login as Host
            </Button>

            <Button
              data-testid="login-admin-button"
              onClick={() => handleLogin('admin')}
              disabled={loading}
              variant="ghost"
              className="w-full h-12 text-base rounded-full border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-300 active:scale-[0.98]"
            >
              Login as Admin
            </Button>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="text-center mt-8 text-sm text-muted-foreground"
          >
            Demo mode: Choose your role to explore
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}

import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Button } from '@/components/ui/button';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function FloatingOrb() {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.2;
      meshRef.current.rotation.y += 0.005;
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.3;
    }
  });

  return (
    <mesh ref={meshRef} scale={2.5}>
      <icosahedronGeometry args={[1, 1]} />
      <meshStandardMaterial
        color="#C97D60"
        roughness={0.2}
        metalness={0.1}
        opacity={0.6}
        transparent
      />
    </mesh>
  );
}

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
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 5] }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <FloatingOrb />
        </Canvas>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="max-w-2xl w-full backdrop-blur-xl bg-white/60 border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.08)] backdrop-saturate-150 rounded-3xl p-12"
        >
          <div className="text-center mb-12">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-5xl sm:text-6xl font-display font-medium tracking-tight text-foreground mb-4"
            >
              HiddenStay
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-lg text-muted-foreground"
            >
              Discover authentic Southeast Asia homestays
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="space-y-4"
          >
            <Button
              data-testid="login-traveller-button"
              onClick={() => handleLogin('traveller')}
              disabled={loading}
              className="w-full h-14 text-lg rounded-full bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 hover:-translate-y-1 hover:shadow-lg active:scale-95"
            >
              Login as Traveller
            </Button>

            <Button
              data-testid="login-host-button"
              onClick={() => handleLogin('host')}
              disabled={loading}
              className="w-full h-14 text-lg rounded-full bg-secondary hover:bg-secondary/90 text-secondary-foreground transition-all duration-300 hover:-translate-y-1 hover:shadow-lg active:scale-95"
            >
              Login as Host
            </Button>

            <Button
              data-testid="login-admin-button"
              onClick={() => handleLogin('admin')}
              disabled={loading}
              className="w-full h-14 text-lg rounded-full bg-accent hover:bg-accent/90 text-accent-foreground transition-all duration-300 hover:-translate-y-1 hover:shadow-lg active:scale-95"
            >
              Login as Admin
            </Button>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="text-center mt-8 text-sm text-muted-foreground"
          >
            Demo mode: Choose your role to explore
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}

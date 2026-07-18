import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, MapPin } from 'lucide-react';
import ShinyPill from '@/components/ui/shiny-pill';
import Navbar from '@/components/Navbar';

export default function TravellerHome({ user }) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useState({
    city: 'Chiang Mai',
    checkIn: '',
    checkOut: '',
    guests: 2
  });

  const handleSearch = () => {
    navigate(`/search?city=${searchParams.city}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        logo="HiddenStay"
        logoTo="/traveller"
        links={[{ label: 'My Trips', to: '/trips', testId: 'my-trips-link' }]}
        user={user}
        showLogout
      />

      <div className="relative min-h-[600px] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1680896444797-07917f403a49?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NTZ8MHwxfHNlYXJjaHw0fHxjaGlhbmclMjBtYWklMjBob21lc3RheSUyMG5hdHVyZXxlbnwwfHx8fDE3ODQzNTA4ODd8MA&ixlib=rb-4.1.0&q=85)'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-background" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl sm:text-6xl lg:text-[4rem] font-display font-medium tracking-tight leading-[1.1] mb-6">
              <ShinyPill
                text="Discover Hidden Gems"
                textColor="rgba(255,255,255,0.7)"
                shineColor="#FFFFFF"
                speed={2}
              />
              <br />
              <ShinyPill
                text="Across Southeast Asia"
                textColor="rgba(255,255,255,0.7)"
                shineColor="#FFFFFF"
                speed={2}
              />
            </h1>
            <p className="text-xl max-w-2xl mx-auto">
              <ShinyPill
                text="Authentic homestays at 5% commission. Hosts keep 95%."
                textColor="rgba(255,255,255,0.65)"
                shineColor="#FFE8C8"
                speed={2.4}
              />
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="max-w-4xl mx-auto backdrop-blur-xl bg-white/90 border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.15)] backdrop-saturate-150 rounded-3xl p-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">City</label>
                <Select value={searchParams.city} onValueChange={(value) => setSearchParams({ ...searchParams, city: value })}>
                  <SelectTrigger data-testid="search-city-select" className="rounded-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Chiang Mai">Chiang Mai</SelectItem>
                    <SelectItem value="Da Nang">Da Nang</SelectItem>
                    <SelectItem value="Bangkok">Bangkok</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">Check-in</label>
                <Input
                  data-testid="search-checkin-input"
                  type="date"
                  className="rounded-full"
                  value={searchParams.checkIn}
                  onChange={(e) => setSearchParams({ ...searchParams, checkIn: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">Check-out</label>
                <Input
                  data-testid="search-checkout-input"
                  type="date"
                  className="rounded-full"
                  value={searchParams.checkOut}
                  onChange={(e) => setSearchParams({ ...searchParams, checkOut: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">Guests</label>
                <Input
                  data-testid="search-guests-input"
                  type="number"
                  min="1"
                  className="rounded-full"
                  value={searchParams.guests}
                  onChange={(e) => setSearchParams({ ...searchParams, guests: parseInt(e.target.value) })}
                />
              </div>
            </div>

            <Button
              data-testid="search-button"
              onClick={handleSearch}
              className="w-full h-14 text-lg rounded-full bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 hover:-translate-y-1 hover:shadow-lg active:scale-95"
            >
              <MapPin className="w-5 h-5 mr-2" />
              Search Hidden Gems
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-center mt-8"
          >
            <Button
              data-testid="ai-planner-link"
              onClick={() => navigate('/ai-planner')}
              variant="outline"
              size="lg"
              className="rounded-full border-2 border-white/60 bg-white/40 hover:bg-white/60 text-foreground backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Try AI Trip Planner
            </Button>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-4">Why HiddenStay</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-medium tracking-tight leading-tight mb-4">
            <ShinyPill
              text="Fair Commission, Authentic Stays"
              textColor="rgba(30, 41, 35, 0.72)"
              shineColor="#C45A3A"
              speed={2.2}
            />
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="bg-card shadow-[4px_4px_10px_rgba(0,0,0,0.05),-4px_-4px_10px_rgba(255,255,255,0.8)] border border-white/50 rounded-2xl p-8"
          >
            <div className="text-4xl mb-4">🏡</div>
            <h3 className="text-xl sm:text-2xl font-display font-medium mb-3 text-foreground">95% to Hosts</h3>
            <p className="text-muted-foreground">Hosts keep 95% of every booking. We only charge 5% platform fee.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="bg-card shadow-[4px_4px_10px_rgba(0,0,0,0.05),-4px_-4px_10px_rgba(255,255,255,0.8)] border border-white/50 rounded-2xl p-8"
          >
            <div className="text-4xl mb-4">💰</div>
            <h3 className="text-xl sm:text-2xl font-display font-medium mb-3 text-foreground">No Guest Fees</h3>
            <p className="text-muted-foreground">Pay only the room price. No hidden service fees for travellers.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="bg-card shadow-[4px_4px_10px_rgba(0,0,0,0.05),-4px_-4px_10px_rgba(255,255,255,0.8)] border border-white/50 rounded-2xl p-8"
          >
            <div className="text-4xl mb-4">✨</div>
            <h3 className="text-xl sm:text-2xl font-display font-medium mb-3 text-foreground">AI Trip Planner</h3>
            <p className="text-muted-foreground">Let AI create your perfect itinerary with recommended stays along the route.</p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

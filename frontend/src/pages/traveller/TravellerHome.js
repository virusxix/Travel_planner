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

      <div className="relative min-h-[min(100dvh,720px)] sm:min-h-[600px] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1680896444797-07917f403a49?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NTZ8MHwxfHNlYXJjaHw0fHxjaGlhbmclMjBtYWklMjBob21lc3RheSUyMG5hdHVyZXxlbnwwfHx8fDE3ODQzNTA4ODd8MA&ixlib=rb-4.1.0&q=85)'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-background" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-16 sm:pb-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-8 sm:mb-12"
          >
            {/* Plain wrapping text on mobile — ShinyPill uses nowrap and clips on phones */}
            <h1 className="text-[1.75rem] leading-tight sm:text-5xl lg:text-[4rem] font-display font-semibold tracking-tight text-white mb-3 sm:mb-6 px-1">
              Discover Hidden Gems
              <br />
              Across Southeast Asia
            </h1>
            <p className="text-sm sm:text-xl text-white/85 max-w-xl mx-auto leading-relaxed px-2">
              Authentic homestays at 5% commission. Hosts keep 95%.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="max-w-4xl mx-auto bg-white/95 sm:backdrop-blur-xl sm:bg-white/90 border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.15)] rounded-2xl sm:rounded-3xl p-4 sm:p-8"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div>
                <label className="block text-sm font-medium mb-1.5 sm:mb-2 text-foreground">City</label>
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
                <label className="block text-sm font-medium mb-1.5 sm:mb-2 text-foreground">Check-in</label>
                <Input
                  data-testid="search-checkin-input"
                  type="date"
                  className="rounded-full text-base sm:text-sm"
                  value={searchParams.checkIn}
                  onChange={(e) => setSearchParams({ ...searchParams, checkIn: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5 sm:mb-2 text-foreground">Check-out</label>
                <Input
                  data-testid="search-checkout-input"
                  type="date"
                  className="rounded-full text-base sm:text-sm"
                  value={searchParams.checkOut}
                  onChange={(e) => setSearchParams({ ...searchParams, checkOut: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5 sm:mb-2 text-foreground">Guests</label>
                <Input
                  data-testid="search-guests-input"
                  type="number"
                  min="1"
                  className="rounded-full text-base sm:text-sm"
                  value={searchParams.guests}
                  onChange={(e) => setSearchParams({ ...searchParams, guests: parseInt(e.target.value) })}
                />
              </div>
            </div>

            <Button
              data-testid="search-button"
              onClick={handleSearch}
              className="w-full h-12 sm:h-14 text-base sm:text-lg rounded-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <MapPin className="w-5 h-5 mr-2 shrink-0" />
              Search Hidden Gems
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-center mt-5 sm:mt-8"
          >
            <Button
              data-testid="ai-planner-link"
              onClick={() => navigate('/ai-planner')}
              variant="outline"
              size="lg"
              className="rounded-full border-2 border-white/60 bg-white/50 hover:bg-white/70 text-foreground backdrop-blur-md w-full sm:w-auto max-w-sm"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Try AI Trip Planner
            </Button>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-10 sm:mb-12"
        >
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-3 sm:mb-4">Why HiddenStay</p>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-display font-semibold tracking-tight leading-snug text-foreground px-2">
            <span className="sm:hidden">
              Fair Commission,
              <br />
              Authentic Stays
            </span>
            <span className="hidden sm:inline">
              <ShinyPill
                text="Fair Commission, Authentic Stays"
                textColor="rgba(30, 41, 35, 0.85)"
                shineColor="#C45A3A"
                speed={2.2}
              />
            </span>
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

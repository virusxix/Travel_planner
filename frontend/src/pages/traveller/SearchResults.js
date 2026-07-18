import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import axios from 'axios';
import { MapPin, Users, Home } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function SearchResults({ user }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const city = searchParams.get('city') || 'Chiang Mai';

  useEffect(() => {
    fetchProperties();
  }, [city]);

  const fetchProperties = async () => {
    try {
      const response = await axios.get(`${API}/properties?city=${city}&status=approved`);
      setProperties(response.data);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="backdrop-blur-xl bg-white/60 border-b border-white/40 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-display font-medium text-primary cursor-pointer" onClick={() => navigate('/traveller')}>HiddenStay</h1>
          <Button data-testid="back-home-button" onClick={() => navigate('/traveller')} variant="ghost">Back to Home</Button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-4">Hidden Gems</p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-medium tracking-tight leading-tight text-foreground mb-4">
            Stays in {city}
          </h1>
          <p className="text-muted-foreground">{properties.length} properties found</p>
        </motion.div>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading properties...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {properties.map((property, index) => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                data-testid={`property-card-${property.id}`}
                className="bg-card border border-border rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
                onClick={() => navigate(`/property/${property.id}`)}
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={property.images[0]}
                    alt={property.name}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-display font-medium text-foreground mb-2">{property.name}</h3>
                  <div className="flex items-center text-sm text-muted-foreground mb-3">
                    <MapPin className="w-4 h-4 mr-1" />
                    {property.city}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <span className="flex items-center">
                      <Home className="w-4 h-4 mr-1" />
                      {property.type}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-display font-semibold text-primary">SGD {property.price_per_night}</span>
                      <span className="text-sm text-muted-foreground ml-1">/ night</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

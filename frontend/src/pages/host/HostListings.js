import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import { Plus, MapPin } from '@phosphor-icons/react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function HostListings({ user }) {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const response = await axios.get(`${API}/properties`);
      const hostProperties = response.data.filter(p => p.host_id === user.id);
      setProperties(hostProperties);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const approvedProperties = properties.filter(p => p.status === 'approved');
  const pendingProperties = properties.filter(p => p.status === 'pending');

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        logo="HiddenStay Host"
        logoTo="/host"
        links={[
          { label: 'Dashboard', to: '/host', testId: 'back-to-dashboard-button' },
          { label: 'Payouts', to: '/host/payouts', testId: 'host-payouts-link' },
          { label: 'Reviews', to: '/host/reviews', testId: 'host-reviews-link' },
        ]}
        showLogout
      />

      <div className="max-w-7xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-medium tracking-tight leading-tight text-foreground mb-2">
              My Listings
            </h1>
            <p className="text-muted-foreground">{properties.length} total properties</p>
          </div>
          <Button
            data-testid="add-new-listing-button"
            onClick={() => navigate('/host/add-listing')}
            className="rounded-full h-12 px-6 bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
          >
            <Plus size={20} weight="bold" className="mr-2" />
            Add New Listing
          </Button>
        </motion.div>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading properties...</div>
        ) : (
          <>
            {approvedProperties.length > 0 && (
              <div className="mb-12">
                <h2 className="text-xl font-display font-medium text-foreground mb-6">Live Properties</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {approvedProperties.map((property, index) => (
                    <motion.div
                      key={property.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.6 }}
                      className="bg-card border border-border rounded-2xl overflow-hidden"
                      data-testid={`approved-property-${property.id}`}
                    >
                      <div className="aspect-[4/3] overflow-hidden">
                        <img
                          src={property.images[0]}
                          alt={property.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-6">
                        <h3 className="text-xl font-display font-medium text-foreground mb-2">{property.name}</h3>
                        <div className="flex items-center text-sm text-muted-foreground mb-3">
                          <MapPin size={16} className="mr-1" />
                          {property.city}
                        </div>
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-2xl font-display font-semibold text-primary">
                            SGD {property.price_per_night}
                          </span>
                          <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                            {property.status}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {pendingProperties.length > 0 && (
              <div>
                <h2 className="text-xl font-display font-medium text-foreground mb-6">Pending Approval</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {pendingProperties.map((property, index) => (
                    <motion.div
                      key={property.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.6 }}
                      className="bg-card border border-border rounded-2xl overflow-hidden opacity-75"
                      data-testid={`pending-property-${property.id}`}
                    >
                      <div className="aspect-[4/3] overflow-hidden">
                        <img
                          src={property.images[0]}
                          alt={property.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-6">
                        <h3 className="text-xl font-display font-medium text-foreground mb-2">{property.name}</h3>
                        <div className="flex items-center text-sm text-muted-foreground mb-3">
                          <MapPin size={16} className="mr-1" />
                          {property.city}
                        </div>
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-2xl font-display font-semibold text-foreground">
                            SGD {property.price_per_night}
                          </span>
                          <span className="px-3 py-1 bg-accent/20 text-accent rounded-full text-xs font-medium">
                            {property.status}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {properties.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="bg-card border border-border rounded-3xl p-16 text-center"
              >
                <div className="text-6xl mb-6">🏡</div>
                <h3 className="text-2xl font-display font-medium text-foreground mb-3">
                  No properties yet
                </h3>
                <p className="text-muted-foreground mb-8">
                  List your first property and start earning with 95% commission
                </p>
                <Button
                  data-testid="add-first-listing-button"
                  onClick={() => navigate('/host/add-listing')}
                  className="rounded-full h-12 px-8 bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <Plus size={20} weight="bold" className="mr-2" />
                  Add Your First Listing
                </Button>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

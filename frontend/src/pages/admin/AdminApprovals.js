import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { CheckCircle, XCircle, MapPin } from '@phosphor-icons/react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function AdminApprovals({ user }) {
  const navigate = useNavigate();
  const [pendingProperties, setPendingProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchPendingProperties();
  }, []);

  const fetchPendingProperties = async () => {
    try {
      const response = await axios.get(`${API}/admin/pending-properties`);
      setPendingProperties(response.data);
    } catch (error) {
      console.error('Error fetching pending properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (propertyId, action) => {
    setActionLoading(true);
    try {
      await axios.patch(`${API}/admin/properties/${propertyId}/status`, { action });
      toast.success(`Property ${action === 'approve' ? 'approved' : 'rejected'} successfully!`);
      setPendingProperties(prev => prev.filter(p => p.id !== propertyId));
      setShowPreview(false);
    } catch (error) {
      toast.error('Action failed. Please try again.');
      console.error('Action error:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const openPreview = (property) => {
    setSelectedProperty(property);
    setShowPreview(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        logo="HiddenStay Admin"
        logoTo="/admin"
        links={[{ label: 'Dashboard', to: '/admin', testId: 'back-to-admin-dashboard' }]}
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
            Pending Approvals
          </h1>
          <p className="text-muted-foreground">{pendingProperties.length} properties waiting for review</p>
        </motion.div>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading pending properties...</div>
        ) : pendingProperties.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-card border border-border rounded-3xl p-16 text-center"
          >
            <CheckCircle size={64} className="text-primary mx-auto mb-4" weight="bold" />
            <h3 className="text-2xl font-display font-medium text-foreground mb-3">
              All caught up!
            </h3>
            <p className="text-muted-foreground">
              No pending listings to review at the moment
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {pendingProperties.map((property, index) => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="bg-card border border-border rounded-2xl overflow-hidden"
                data-testid={`pending-property-card-${property.id}`}
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
                  <div className="mb-4">
                    <span className="text-2xl font-display font-semibold text-primary">
                      SGD {property.price_per_night}
                    </span>
                    <span className="text-sm text-muted-foreground ml-1">/ night</span>
                  </div>

                  <div className="flex gap-2 mb-3">
                    <Button
                      data-testid={`approve-button-${property.id}`}
                      onClick={() => handleAction(property.id, 'approve')}
                      disabled={actionLoading}
                      className="flex-1 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 hover:-translate-y-0.5"
                    >
                      <CheckCircle size={18} weight="bold" className="mr-1" />
                      Approve
                    </Button>
                    <Button
                      data-testid={`reject-button-${property.id}`}
                      onClick={() => handleAction(property.id, 'reject')}
                      disabled={actionLoading}
                      variant="outline"
                      className="flex-1 rounded-full border-2 hover:bg-destructive/10 hover:border-destructive hover:text-destructive transition-all duration-300 hover:-translate-y-0.5"
                    >
                      <XCircle size={18} weight="bold" className="mr-1" />
                      Reject
                    </Button>
                  </div>

                  <Button
                    data-testid={`preview-button-${property.id}`}
                    onClick={() => openPreview(property)}
                    variant="ghost"
                    className="w-full rounded-full"
                  >
                    View Details
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedProperty && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-display">{selectedProperty.name}</DialogTitle>
                <DialogDescription className="flex items-center text-muted-foreground">
                  <MapPin size={16} className="mr-1" />
                  {selectedProperty.city}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                <img
                  src={selectedProperty.images[0]}
                  alt={selectedProperty.name}
                  className="w-full aspect-[4/3] object-cover rounded-2xl"
                />

                <div>
                  <h3 className="font-semibold text-foreground mb-2">Description</h3>
                  <p className="text-muted-foreground">{selectedProperty.description}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-2">Details</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Type</p>
                      <p className="font-medium text-foreground">{selectedProperty.type}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Price per Night</p>
                      <p className="font-medium text-primary">SGD {selectedProperty.price_per_night}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-3">Amenities</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedProperty.amenities.map((amenity, index) => (
                      <span key={index} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    data-testid="approve-button-dialog"
                    onClick={() => handleAction(selectedProperty.id, 'approve')}
                    disabled={actionLoading}
                    className="flex-1 h-12 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    <CheckCircle size={20} weight="bold" className="mr-2" />
                    Approve Listing
                  </Button>
                  <Button
                    data-testid="reject-button-dialog"
                    onClick={() => handleAction(selectedProperty.id, 'reject')}
                    disabled={actionLoading}
                    variant="outline"
                    className="flex-1 h-12 rounded-full border-2 hover:bg-destructive/10 hover:border-destructive hover:text-destructive"
                  >
                    <XCircle size={20} weight="bold" className="mr-2" />
                    Reject Listing
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

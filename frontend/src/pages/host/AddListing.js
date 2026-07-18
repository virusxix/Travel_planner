import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import axios from 'axios';
import { toast } from 'sonner';
import { Plus, X, Check } from '@phosphor-icons/react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const SAMPLE_GALLERY = [
  'https://images.pexels.com/photos/37800696/pexels-photo-37800696.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
  'https://images.unsplash.com/photo-1764260664542-61117a514ba3?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NTZ8MHwxfHNlYXJjaHwzfHxjaGlhbmclMjBtYWklMjBob21lc3RheSUyMG5hdHVyZXxlbnwwfHx8fDE3ODQzNTA4ODd8MA&ixlib=rb-4.1.0&q=85',
  'https://images.pexels.com/photos/18292640/pexels-photo-18292640.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
  'https://images.unsplash.com/photo-1712927026825-f4519f64f025?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njd8MHwxfHNlYXJjaHwyfHxzb3V0aGVhc3QlMjBhc2lhJTIwdHJvcGljYWwlMjBiZWRyb29tfGVufDB8fHx8MTc4NDM1MDg4N3ww&ixlib=rb-4.1.0&q=85',
  'https://images.unsplash.com/photo-1680896444797-07917f403a49?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NTZ8MHwxfHNlYXJjaHw0fHxjaGlhbmclMjBtYWklMjBob21lc3RheSUyMG5hdHVyZXxlbnwwfHx8fDE3ODQzNTA4ODd8MA&ixlib=rb-4.1.0&q=85',
  'https://images.pexels.com/photos/35073640/pexels-photo-35073640.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
  'https://images.unsplash.com/photo-1498747468843-5ec2ad31cb89?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMzN8MHwxfHNlYXJjaHw0fHxkYSUyMG5hbmclMjB2aWV0bmFtJTIwdHJhdmVsfGVufDB8fHx8MTc4NDM1MDg4N3ww&ixlib=rb-4.1.0&q=85',
];

export default function AddListing({ user }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    city: 'Chiang Mai',
    type: 'Homestay',
    price_per_night: '',
    description: '',
    images: [SAMPLE_GALLERY[0]],
    amenities: [],
    lat: 18.7883,
    lng: 98.9853
  });
  const [newAmenity, setNewAmenity] = useState('');
  const [customUrl, setCustomUrl] = useState('');

  const toggleGalleryImage = (url) => {
    if (formData.images.includes(url)) {
      if (formData.images.length > 1) {
        setFormData({ ...formData, images: formData.images.filter(i => i !== url) });
      } else {
        toast.error('At least one photo is required');
      }
    } else {
      setFormData({ ...formData, images: [...formData.images, url] });
    }
  };

  const addCustomUrl = () => {
    const url = customUrl.trim();
    if (!url) return;
    if (!/^https?:\/\//i.test(url)) {
      toast.error('Please provide a valid http(s) URL');
      return;
    }
    if (formData.images.includes(url)) {
      toast.error('This image is already added');
      return;
    }
    setFormData({ ...formData, images: [...formData.images, url] });
    setCustomUrl('');
  };

  const removeImage = (url) => {
    if (formData.images.length === 1) {
      toast.error('At least one photo is required');
      return;
    }
    setFormData({ ...formData, images: formData.images.filter(i => i !== url) });
  };

  const handleAddAmenity = () => {
    if (newAmenity.trim() && !formData.amenities.includes(newAmenity.trim())) {
      setFormData({ ...formData, amenities: [...formData.amenities, newAmenity.trim()] });
      setNewAmenity('');
    }
  };

  const handleRemoveAmenity = (amenity) => {
    setFormData({ ...formData, amenities: formData.amenities.filter(a => a !== amenity) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.description || !formData.price_per_night) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (formData.images.length === 0) {
      toast.error('Please add at least one photo');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API}/properties`, {
        ...formData,
        price_per_night: parseFloat(formData.price_per_night)
      }, {
        params: { host_id: user.id }
      });
      toast.success('Property submitted for approval!');
      navigate('/host/listings');
    } catch (error) {
      toast.error('Failed to create listing. Please try again.');
      console.error('Create listing error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="backdrop-blur-xl bg-white/60 border-b border-white/40 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-display font-medium text-primary cursor-pointer" onClick={() => navigate('/host')}>HiddenStay Host</h1>
          <Button data-testid="cancel-add-listing" onClick={() => navigate('/host/listings')} variant="ghost">Cancel</Button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl sm:text-4xl font-display font-medium tracking-tight text-foreground mb-8">
            Add New Listing
          </h1>

          <form onSubmit={handleSubmit}>
            <div className="backdrop-blur-xl bg-white/60 border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.08)] backdrop-saturate-150 rounded-3xl p-8 mb-6">
              <h2 className="text-xl font-display font-medium text-foreground mb-6">Basic Information</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Property Name *</label>
                  <Input
                    data-testid="property-name-input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Cozy Mountain Retreat"
                    className="rounded-full"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">City *</label>
                    <Select value={formData.city} onValueChange={(value) => setFormData({ ...formData, city: value })}>
                      <SelectTrigger data-testid="property-city-select" className="rounded-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Chiang Mai">Chiang Mai</SelectItem>
                        <SelectItem value="Da Nang">Da Nang</SelectItem>
                        <SelectItem value="Bangkok">Bangkok</SelectItem>
                        <SelectItem value="Hanoi">Hanoi</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Property Type *</label>
                    <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                      <SelectTrigger data-testid="property-type-select" className="rounded-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Homestay">Homestay</SelectItem>
                        <SelectItem value="Room">Room</SelectItem>
                        <SelectItem value="Apartment">Apartment</SelectItem>
                        <SelectItem value="Villa">Villa</SelectItem>
                        <SelectItem value="Cabin">Cabin</SelectItem>
                        <SelectItem value="Studio">Studio</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Price per Night (SGD) *</label>
                  <Input
                    data-testid="property-price-input"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price_per_night}
                    onChange={(e) => setFormData({ ...formData, price_per_night: e.target.value })}
                    placeholder="45.00"
                    className="rounded-full"
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    You keep 95% (SGD {(formData.price_per_night * 0.95).toFixed(2)}), platform fee 5% (SGD {(formData.price_per_night * 0.05).toFixed(2)})
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Description *</label>
                  <Textarea
                    data-testid="property-description-input"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe your property, its surroundings, and what makes it special..."
                    rows={4}
                    className="rounded-2xl"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="backdrop-blur-xl bg-white/60 border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.08)] backdrop-saturate-150 rounded-3xl p-8 mb-6">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-display font-medium text-foreground">Photos</h2>
                <span className="text-sm text-muted-foreground" data-testid="photo-count">
                  {formData.images.length} selected
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                Pick from the gallery or add your own image URL. First photo is used as the cover.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-6">
                {SAMPLE_GALLERY.map((url, i) => {
                  const selected = formData.images.includes(url);
                  return (
                    <button
                      key={i}
                      type="button"
                      data-testid={`gallery-image-${i}`}
                      onClick={() => toggleGalleryImage(url)}
                      className={`relative aspect-square rounded-2xl overflow-hidden group transition-all duration-300 ${
                        selected ? 'ring-4 ring-primary shadow-lg -translate-y-0.5' : 'hover:-translate-y-0.5 hover:shadow-md'
                      }`}
                    >
                      <img src={url} alt={`Sample ${i + 1}`} className="w-full h-full object-cover" />
                      {selected && (
                        <div className="absolute inset-0 bg-primary/40 flex items-center justify-center">
                          <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                            <Check size={18} weight="bold" />
                          </div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-foreground mb-2">Or paste your own image URL</label>
                <div className="flex gap-2">
                  <Input
                    data-testid="custom-image-url"
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomUrl())}
                    placeholder="https://example.com/photo.jpg"
                    className="rounded-full"
                  />
                  <Button
                    data-testid="add-custom-image"
                    type="button"
                    onClick={addCustomUrl}
                    className="rounded-full px-6"
                  >
                    <Plus size={20} weight="bold" />
                  </Button>
                </div>
              </div>

              {formData.images.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-3">
                    Selected photos ({formData.images.length})
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {formData.images.map((url, i) => (
                      <div
                        key={i}
                        className="relative aspect-square rounded-2xl overflow-hidden group"
                        data-testid={`selected-image-${i}`}
                      >
                        <img src={url} alt={`Selected ${i + 1}`} className="w-full h-full object-cover" />
                        {i === 0 && (
                          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                            Cover
                          </span>
                        )}
                        <button
                          type="button"
                          data-testid={`remove-image-${i}`}
                          onClick={() => removeImage(url)}
                          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 text-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors flex items-center justify-center"
                        >
                          <X size={14} weight="bold" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="backdrop-blur-xl bg-white/60 border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.08)] backdrop-saturate-150 rounded-3xl p-8 mb-6">
              <h2 className="text-xl font-display font-medium text-foreground mb-6">Amenities</h2>
              
              <div className="flex gap-2 mb-4">
                <Input
                  data-testid="amenity-input"
                  value={newAmenity}
                  onChange={(e) => setNewAmenity(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAmenity())}
                  placeholder="Add amenity (e.g., WiFi, Kitchen)"
                  className="rounded-full"
                />
                <Button
                  data-testid="add-amenity-button"
                  type="button"
                  onClick={handleAddAmenity}
                  className="rounded-full px-6"
                >
                  <Plus size={20} weight="bold" />
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {formData.amenities.map((amenity, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm"
                    data-testid={`amenity-tag-${index}`}
                  >
                    {amenity}
                    <button
                      type="button"
                      onClick={() => handleRemoveAmenity(amenity)}
                      className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
                    >
                      <X size={14} weight="bold" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                type="button"
                onClick={() => navigate('/host/listings')}
                variant="outline"
                className="flex-1 h-14 rounded-full"
              >
                Cancel
              </Button>
              <Button
                data-testid="submit-listing-button"
                type="submit"
                disabled={loading}
                className="flex-1 h-14 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                {loading ? 'Submitting...' : 'Submit for Approval'}
              </Button>
            </div>

            <p className="text-xs text-muted-foreground text-center mt-4">
              Your listing will be reviewed by our admin team before going live
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

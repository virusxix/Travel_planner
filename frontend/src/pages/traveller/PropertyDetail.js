import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import axios from 'axios';
import { MapPin, Users, Home, CheckCircle2, Star } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function PropertyDetail({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [rating, setRating] = useState({ average_rating: null, review_count: 0 });
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProperty();
  }, [id]);

  const fetchProperty = async () => {
    try {
      const [propRes, ratingRes, reviewsRes] = await Promise.all([
        axios.get(`${API}/properties/${id}`),
        axios.get(`${API}/properties/${id}/rating`),
        axios.get(`${API}/reviews?property_id=${id}`)
      ]);
      setProperty(propRes.data);
      setRating(ratingRes.data);
      setReviews(reviewsRes.data);
    } catch (error) {
      console.error('Error fetching property:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookNow = () => {
    navigate('/checkout', { state: { property } });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading property...</div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Property not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="backdrop-blur-xl bg-white/60 border-b border-white/40 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-display font-medium text-primary cursor-pointer" onClick={() => navigate('/traveller')}>HiddenStay</h1>
          <Button data-testid="back-button" onClick={() => navigate(-1)} variant="ghost">Back</Button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <div className="aspect-[4/3] rounded-3xl overflow-hidden mb-4">
                <img
                  src={property.images[0]}
                  alt={property.name}
                  className="w-full h-full object-cover"
                  data-testid="property-main-image"
                />
              </div>
              {property.images.length > 1 && (
                <div className="grid grid-cols-3 gap-3" data-testid="property-image-gallery">
                  {property.images.slice(1, 7).map((url, i) => (
                    <div key={i} className="aspect-square rounded-2xl overflow-hidden" data-testid={`property-thumb-${i}`}>
                      <img
                        src={url}
                        alt={`${property.name} photo ${i + 2}`}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <div className="backdrop-blur-xl bg-white/60 border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.08)] backdrop-saturate-150 rounded-3xl p-8">
                <h1 data-testid="property-name" className="text-3xl sm:text-4xl font-display font-medium tracking-tight text-foreground mb-4">
                  {property.name}
                </h1>

                <div className="flex flex-wrap items-center gap-4 mb-6">
                  <div className="flex items-center text-muted-foreground">
                    <MapPin className="w-5 h-5 mr-2" />
                    <span data-testid="property-city">{property.city}</span>
                  </div>
                  {rating.review_count > 0 && (
                    <div className="flex items-center gap-1.5" data-testid="property-rating">
                      <Star className="w-5 h-5 fill-accent text-accent" />
                      <span className="font-semibold text-foreground">{rating.average_rating}</span>
                      <span className="text-sm text-muted-foreground">({rating.review_count} review{rating.review_count !== 1 ? 's' : ''})</span>
                    </div>
                  )}
                </div>

                <div className="mb-8">
                  <span className="text-4xl font-display font-semibold text-primary" data-testid="property-price">
                    SGD {property.price_per_night}
                  </span>
                  <span className="text-muted-foreground ml-2">/ night</span>
                </div>

                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-foreground mb-3">About</h3>
                  <p className="text-muted-foreground leading-relaxed" data-testid="property-description">{property.description}</p>
                </div>

                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-foreground mb-3">Property Type</h3>
                  <div className="flex items-center text-muted-foreground">
                    <Home className="w-5 h-5 mr-2" />
                    <span data-testid="property-type">{property.type}</span>
                  </div>
                </div>

                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Amenities</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {property.amenities.map((amenity, index) => (
                      <div key={index} className="flex items-center text-muted-foreground">
                        <CheckCircle2 className="w-4 h-4 mr-2 text-primary" />
                        <span>{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  data-testid="book-now-button"
                  onClick={handleBookNow}
                  className="w-full h-14 text-lg rounded-full bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 hover:-translate-y-1 hover:shadow-lg active:scale-95"
                >
                  Book Now
                </Button>

                <p className="text-xs text-muted-foreground text-center mt-4">
                  No guest service fees • You only pay the room price
                </p>
              </div>
            </div>
          </div>

          {reviews.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mt-16 pt-12 border-t border-border"
              data-testid="reviews-section"
            >
              <div className="flex items-center gap-3 mb-8">
                <Star className="w-6 h-6 fill-accent text-accent" />
                <h2 className="text-2xl sm:text-3xl font-display font-medium tracking-tight text-foreground">
                  {rating.average_rating} · {rating.review_count} review{rating.review_count !== 1 ? 's' : ''}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {reviews.map((review, index) => (
                  <motion.div
                    key={review.id}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.08, duration: 0.5 }}
                    className="bg-card border border-border rounded-2xl p-6"
                    data-testid={`review-${review.id}`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold">
                        {review.reviewer_name?.[0] || 'T'}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-foreground">{review.reviewer_name}</p>
                          {review.verified_stay && (
                            <span
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-semibold uppercase tracking-wider"
                              data-testid={`verified-badge-${review.id}`}
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              Verified Stay
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 mt-0.5">
                          {[1, 2, 3, 4, 5].map((n) => (
                            <Star
                              key={n}
                              size={14}
                              className={review.rating >= n ? 'fill-accent text-accent' : 'text-muted-foreground'}
                            />
                          ))}
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-foreground leading-relaxed">{review.comment}</p>

                    {review.host_reply && (
                      <div
                        className="mt-4 pl-4 border-l-2 border-primary/40 bg-primary/5 rounded-r-xl p-3"
                        data-testid={`host-reply-${review.id}`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold text-primary uppercase tracking-wider">Response from Host</span>
                          {review.host_reply_at && (
                            <span className="text-xs text-muted-foreground">
                              · {new Date(review.host_reply_at).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-foreground leading-relaxed">{review.host_reply}</p>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

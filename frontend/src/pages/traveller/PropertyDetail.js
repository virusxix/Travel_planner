import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import axios from 'axios';
import {
  MapPin,
  Users,
  Home,
  CheckCircle2,
  Star,
  BedDouble,
  Wifi,
  Wind,
  Bath,
  ChevronLeft,
  ChevronRight,
  Images,
  Zap,
  CreditCard,
  Ban,
  UtensilsCrossed,
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AMENITY_ICONS = {
  wifi: Wifi,
  'free wi-fi': Wifi,
  'free wifi': Wifi,
  'air conditioning': Wind,
  ac: Wind,
  bathroom: Bath,
  'private bathroom': Bath,
};

function amenityIcon(label) {
  const key = String(label || '').toLowerCase();
  for (const [k, Icon] of Object.entries(AMENITY_ICONS)) {
    if (key.includes(k)) return Icon;
  }
  return CheckCircle2;
}

export default function PropertyDetail({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [rating, setRating] = useState({ average_rating: null, review_count: 0 });
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchProperty();
  }, [id]);

  const fetchProperty = async () => {
    try {
      const [propRes, ratingRes, reviewsRes] = await Promise.all([
        axios.get(`${API}/properties/${id}`),
        axios.get(`${API}/properties/${id}/rating`),
        axios.get(`${API}/reviews?property_id=${id}`),
      ]);
      setProperty(propRes.data);
      setRating(ratingRes.data);
      setReviews(reviewsRes.data);
      setPhotoIndex(0);
    } catch (error) {
      console.error('Error fetching property:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReserve = (rateId) => {
    navigate('/checkout', { state: { property, rateId } });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4f4f5] flex items-center justify-center">
        <div className="text-muted-foreground">Loading property...</div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-[#f4f4f5] flex items-center justify-center">
        <div className="text-muted-foreground">Property not found</div>
      </div>
    );
  }

  const images = property.images?.length ? property.images : [];
  const mainImage = images[photoIndex] || images[0];
  const amenities = property.amenities || [];
  const price = property.price_per_night;
  // ponytail: two display rates from one nightly price until API supports rate plans
  const rates = [
    {
      id: 'best',
      badge: "Today's best price",
      label: 'Standard rate',
      price,
      choices: [
        { icon: UtensilsCrossed, text: 'Local breakfast optional', tone: 'muted' },
        { icon: Ban, text: 'Non-refundable', tone: 'muted' },
        { icon: Zap, text: 'Instant confirmation', tone: 'ok' },
        { icon: CreditCard, text: 'Prepay online', tone: 'muted' },
      ],
      highlight: true,
    },
    {
      id: 'flex',
      badge: null,
      label: 'Flexible rate',
      price: Math.round(price * 1.08),
      choices: [
        { icon: CheckCircle2, text: 'Free cancellation (48h)', tone: 'ok' },
        { icon: Zap, text: 'Instant confirmation', tone: 'ok' },
        { icon: CreditCard, text: 'Prepay online', tone: 'muted' },
      ],
      highlight: false,
    },
  ];

  const prevPhoto = () => {
    if (!images.length) return;
    setPhotoIndex((i) => (i - 1 + images.length) % images.length);
  };
  const nextPhoto = () => {
    if (!images.length) return;
    setPhotoIndex((i) => (i + 1) % images.length);
  };

  return (
    <div className="min-h-[100dvh] bg-[#f4f4f5]">
      <Navbar
        logo="HiddenStay"
        logoTo="/traveller"
        action={{ label: 'Back', onClick: () => navigate(-1), testId: 'back-button' }}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Title strip */}
          <div className="mb-5 sm:mb-6">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-2">
              <div className="flex items-center text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 mr-1.5 shrink-0" />
                <span data-testid="property-city">{property.city}</span>
              </div>
              {rating.review_count > 0 && (
                <div className="flex items-center gap-1.5 text-sm" data-testid="property-rating">
                  <Star className="w-4 h-4 fill-accent text-accent" />
                  <span className="font-semibold text-foreground">{rating.average_rating}</span>
                  <span className="text-muted-foreground">
                    ({rating.review_count} review{rating.review_count !== 1 ? 's' : ''})
                  </span>
                </div>
              )}
              <div className="flex items-center text-sm text-muted-foreground">
                <Home className="w-4 h-4 mr-1.5" />
                <span data-testid="property-type">{property.type}</span>
              </div>
            </div>
            <h1
              data-testid="property-name"
              className="text-2xl sm:text-3xl lg:text-4xl font-display font-medium tracking-tight text-foreground"
            >
              {property.name}
            </h1>
          </div>

          {/* Trip.com-style room + rates card */}
          <div
            className="bg-white border border-black/[0.06] shadow-sm rounded-3xl overflow-hidden"
            data-testid="room-rates-module"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 lg:divide-x divide-black/[0.06]">
              {/* Left: photo + amenities */}
              <div className="lg:col-span-5 p-4 sm:p-5">
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-[#ececee] group">
                  {mainImage && (
                    <img
                      src={mainImage}
                      alt={property.name}
                      className="w-full h-full object-cover"
                      data-testid="property-main-image"
                    />
                  )}
                  {images.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={prevPhoto}
                        className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 shadow flex items-center justify-center text-foreground hover:bg-white"
                        aria-label="Previous photo"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={nextPhoto}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 shadow flex items-center justify-center text-foreground hover:bg-white"
                        aria-label="Next photo"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                      <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-md bg-black/70 text-white text-xs px-2 py-1">
                        <Images className="w-3.5 h-3.5" />
                        {images.length}
                      </span>
                    </>
                  )}
                </div>

                <p className="mt-4 flex items-center gap-2 text-sm font-semibold text-foreground">
                  <BedDouble className="w-4 h-4 text-primary" />
                  Entire {String(property.type || 'homestay').toLowerCase()}
                </p>

                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                  {amenities.slice(0, 8).map((amenity) => {
                    const Icon = amenityIcon(amenity);
                    return (
                      <div
                        key={amenity}
                        className="flex items-center gap-2 text-sm text-muted-foreground min-w-0"
                      >
                        <Icon className="w-4 h-4 text-primary shrink-0" />
                        <span className="truncate">{amenity}</span>
                      </div>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => setShowDetails((v) => !v)}
                  className="mt-4 text-sm font-medium text-primary hover:underline"
                >
                  {showDetails ? 'Hide details' : 'Room details'}
                </button>

                {showDetails && (
                  <p
                    className="mt-2 text-sm text-muted-foreground leading-relaxed"
                    data-testid="property-description"
                  >
                    {property.description}
                  </p>
                )}
              </div>

              {/* Right: rate table */}
              <div className="lg:col-span-7 flex flex-col">
                <div className="hidden sm:grid grid-cols-[1fr_72px_minmax(140px,auto)] gap-3 px-4 sm:px-5 py-3 bg-[#fafafa] border-b border-black/[0.06] text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <span>Your choices</span>
                  <span className="text-center">Sleeps</span>
                  <span className="text-right pr-1">Today&apos;s price</span>
                </div>

                {rates.map((rate) => (
                  <div
                    key={rate.id}
                    className={`grid grid-cols-1 sm:grid-cols-[1fr_72px_minmax(140px,auto)] gap-4 sm:gap-3 px-4 sm:px-5 py-5 border-b border-black/[0.06] last:border-b-0 ${
                      rate.highlight ? 'bg-[#fafafa]/80' : 'bg-white'
                    }`}
                    data-testid={`rate-row-${rate.id}`}
                  >
                    <div className="min-w-0">
                      {rate.badge && (
                        <span className="inline-flex mb-2 px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[11px] font-semibold">
                          {rate.badge}
                        </span>
                      )}
                      <p className="font-medium text-foreground mb-2">{rate.label}</p>
                      <ul className="space-y-1.5">
                        {rate.choices.map((c) => (
                          <li
                            key={c.text}
                            className={`flex items-start gap-2 text-sm ${
                              c.tone === 'ok' ? 'text-emerald-700' : 'text-muted-foreground'
                            }`}
                          >
                            <c.icon className="w-4 h-4 mt-0.5 shrink-0" />
                            <span>{c.text}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex sm:flex-col items-center justify-start sm:justify-center gap-2 text-muted-foreground">
                      <span className="sm:hidden text-xs font-semibold uppercase tracking-wide">
                        Sleeps
                      </span>
                      <div className="flex items-center gap-0.5" title="Guests">
                        <Users className="w-5 h-5" />
                        <Users className="w-5 h-5 -ml-1 opacity-70" />
                      </div>
                    </div>

                    <div className="flex flex-row sm:flex-col items-end justify-between sm:justify-center gap-3 sm:gap-2 sm:text-right">
                      <div>
                        {rate.highlight && (
                          <span className="inline-flex mb-1.5 px-2 py-0.5 rounded-md bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wide">
                            Best value
                          </span>
                        )}
                        <div>
                          <span
                            className="text-2xl font-semibold text-primary tabular-nums"
                            data-testid={rate.highlight ? 'property-price' : undefined}
                          >
                            SGD {rate.price}
                          </span>
                          <span className="text-xs text-muted-foreground block mt-0.5">
                            / night · no guest service fee
                          </span>
                        </div>
                      </div>
                      <Button
                        data-testid={rate.highlight ? 'book-now-button' : `reserve-${rate.id}`}
                        onClick={() => handleReserve(rate.id)}
                        className="shrink-0 h-11 px-6 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-sm"
                      >
                        Reserve
                      </Button>
                    </div>
                  </div>
                ))}

                <p className="px-4 sm:px-5 py-3 text-xs text-muted-foreground text-center sm:text-left border-t border-black/[0.06]">
                  Host keeps 95% · You only pay the room price
                </p>
              </div>
            </div>
          </div>

          {/* About (collapsed by default into room details; keep short block for scans) */}
          {!showDetails && (
            <p className="mt-6 text-sm text-muted-foreground leading-relaxed max-w-3xl line-clamp-2">
              {property.description}
            </p>
          )}

          {reviews.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mt-12 pt-10 border-t border-black/[0.06]"
              data-testid="reviews-section"
            >
              <div className="flex items-center gap-3 mb-6">
                <Star className="w-6 h-6 fill-accent text-accent" />
                <h2 className="text-2xl font-display font-medium tracking-tight text-foreground">
                  {rating.average_rating} · {rating.review_count} review
                  {rating.review_count !== 1 ? 's' : ''}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reviews.map((review, index) => (
                  <motion.div
                    key={review.id}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.08, duration: 0.5 }}
                    className="bg-white border border-black/[0.06] shadow-sm rounded-2xl p-5"
                    data-testid={`review-${review.id}`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold">
                        {review.reviewer_name?.[0] || 'T'}
                      </div>
                      <div className="flex-1 min-w-0">
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
                              className={
                                review.rating >= n
                                  ? 'fill-accent text-accent'
                                  : 'text-muted-foreground'
                              }
                            />
                          ))}
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-foreground leading-relaxed text-sm">{review.comment}</p>

                    {review.host_reply && (
                      <div
                        className="mt-4 pl-4 border-l-2 border-primary/40 bg-primary/5 rounded-r-xl p-3"
                        data-testid={`host-reply-${review.id}`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                            Response from Host
                          </span>
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

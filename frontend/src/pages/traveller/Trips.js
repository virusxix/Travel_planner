import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import axios from 'axios';
import { toast } from 'sonner';
import { MapPin, Calendar, Users, Home, Star, PencilLine } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function StarInput({ value, onChange, size = 28 }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1" data-testid="star-input">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          data-testid={`star-${n}`}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(n)}
          className="transition-transform duration-200 hover:scale-110"
        >
          <Star
            size={size}
            className={
              (hover || value) >= n
                ? 'fill-accent text-accent'
                : 'text-muted-foreground'
            }
          />
        </button>
      ))}
    </div>
  );
}

export default function Trips({ user }) {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [properties, setProperties] = useState({});
  const [reviews, setReviews] = useState({});
  const [loading, setLoading] = useState(true);
  const [reviewDialog, setReviewDialog] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [bookingsRes, propsRes, reviewsRes] = await Promise.all([
        axios.get(`${API}/bookings?user_id=${user.id}&role=traveller`),
        axios.get(`${API}/properties`),
        axios.get(`${API}/reviews?user_id=${user.id}`)
      ]);
      setBookings(bookingsRes.data);
      const propMap = {};
      propsRes.data.forEach(p => { propMap[p.id] = p; });
      setProperties(propMap);
      const reviewMap = {};
      reviewsRes.data.forEach(r => { reviewMap[r.booking_id] = r; });
      setReviews(reviewMap);
    } catch (error) {
      console.error('Error fetching trips:', error);
    } finally {
      setLoading(false);
    }
  };

  const openReviewDialog = (booking) => {
    setReviewDialog(booking);
    setRating(0);
    setComment('');
  };

  const handleSubmitReview = async () => {
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }
    if (!comment.trim()) {
      toast.error('Please write a short review');
      return;
    }
    setSubmitting(true);
    try {
      await axios.post(`${API}/reviews`, {
        booking_id: reviewDialog.id,
        rating,
        comment: comment.trim(),
        reviewer_id: user.id
      });
      toast.success('Thanks for your review!');
      setReviewDialog(null);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const upcoming = bookings.filter(b => b.check_in >= today);
  const past = bookings.filter(b => b.check_in < today);

  const renderBookingCard = (booking, index, isPast = false) => {
    const property = properties[booking.property_id];
    if (!property) return null;
    const existingReview = reviews[booking.id];

    return (
      <motion.div
        key={booking.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.08, duration: 0.5 }}
        className="bg-card border border-border rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300"
        data-testid={`trip-card-${booking.id}`}
      >
        <div className="grid grid-cols-1 sm:grid-cols-3">
          <div className="aspect-[4/3] sm:aspect-square overflow-hidden">
            <img
              src={property.images[0]}
              alt={property.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="sm:col-span-2 p-6">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-xl font-display font-medium text-foreground mb-1">{property.name}</h3>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {property.city}
                </p>
              </div>
              <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium capitalize">
                {booking.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Check-in</p>
                  <p className="font-medium text-foreground">{booking.check_in}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Check-out</p>
                  <p className="font-medium text-foreground">{booking.check_out}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Users className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Guests</p>
                  <p className="font-medium text-foreground">{booking.guests}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Home className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Total</p>
                  <p className="font-medium text-primary">SGD {booking.total_price?.toFixed(2)}</p>
                </div>
              </div>
            </div>

            {existingReview && (
              <div className="mb-4 bg-muted/30 rounded-2xl p-3" data-testid={`existing-review-${booking.id}`}>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star
                      key={n}
                      size={14}
                      className={existingReview.rating >= n ? 'fill-accent text-accent' : 'text-muted-foreground'}
                    />
                  ))}
                  <span className="text-xs text-muted-foreground ml-1">Your review</span>
                  {existingReview.verified_stay && (
                    <span
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-semibold uppercase tracking-wider"
                      data-testid={`verified-badge-${existingReview.id}`}
                    >
                      Verified Stay
                    </span>
                  )}
                </div>
                <p className="text-sm text-foreground">{existingReview.comment}</p>
                {existingReview.host_reply && (
                  <div
                    className="mt-3 pl-3 border-l-2 border-primary/40 bg-primary/5 rounded-r-xl p-2"
                    data-testid={`existing-host-reply-${booking.id}`}
                  >
                    <span className="text-xs font-semibold text-primary uppercase tracking-wider">Host replied</span>
                    <p className="text-sm text-foreground mt-1">{existingReview.host_reply}</p>
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <Button
                data-testid={`view-property-${booking.id}`}
                onClick={() => navigate(`/property/${booking.property_id}`)}
                variant="ghost"
                size="sm"
                className="rounded-full"
              >
                View Property Details
              </Button>
              {isPast && !existingReview && (
                <Button
                  data-testid={`leave-review-${booking.id}`}
                  onClick={() => openReviewDialog(booking)}
                  size="sm"
                  className="rounded-full bg-accent hover:bg-accent/90 text-accent-foreground"
                >
                  <PencilLine className="w-4 h-4 mr-2" />
                  Leave a Review
                </Button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        logo="HiddenStay"
        logoTo="/traveller"
        links={[
          { label: 'Home', to: '/traveller', testId: 'home-link' },
          { label: 'AI Planner', to: '/ai-planner', testId: 'ai-planner-nav' },
        ]}
        user={user}
      />

      <div className="max-w-6xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-4">Your Journey</p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-medium tracking-tight leading-tight text-foreground mb-4">
            My Trips
          </h1>
          <p className="text-muted-foreground">
            {bookings.length} booking{bookings.length !== 1 ? 's' : ''} — {upcoming.length} upcoming, {past.length} past
          </p>
        </motion.div>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading trips...</div>
        ) : bookings.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-card border border-border rounded-3xl p-16 text-center"
          >
            <MapPin className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-40" />
            <h3 className="text-2xl font-display font-medium text-foreground mb-3">No trips yet</h3>
            <p className="text-muted-foreground mb-8">Start exploring authentic Southeast Asia stays</p>
            <Button
              data-testid="explore-stays-button"
              onClick={() => navigate('/traveller')}
              className="rounded-full h-12 px-8"
            >
              Explore Stays
            </Button>
          </motion.div>
        ) : (
          <div className="space-y-12">
            {upcoming.length > 0 && (
              <div>
                <h2 className="text-xl font-display font-medium text-foreground mb-6">Upcoming</h2>
                <div className="space-y-4">
                  {upcoming.map((booking, index) => renderBookingCard(booking, index, false))}
                </div>
              </div>
            )}

            {past.length > 0 && (
              <div>
                <h2 className="text-xl font-display font-medium text-foreground mb-6">Past Trips</h2>
                <div className="space-y-4">
                  {past.map((booking, index) => renderBookingCard(booking, index, true))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <Dialog open={!!reviewDialog} onOpenChange={(open) => !open && setReviewDialog(null)}>
        <DialogContent className="max-w-lg">
          {reviewDialog && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-display">Leave a Review</DialogTitle>
                <DialogDescription>
                  How was your stay at {properties[reviewDialog.property_id]?.name}?
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-3">Your Rating</label>
                  <StarInput value={rating} onChange={setRating} />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Your Review</label>
                  <Textarea
                    data-testid="review-comment-input"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share what made this stay special..."
                    rows={4}
                    className="rounded-2xl"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    onClick={() => setReviewDialog(null)}
                    variant="outline"
                    className="flex-1 rounded-full"
                  >
                    Cancel
                  </Button>
                  <Button
                    data-testid="submit-review-button"
                    onClick={handleSubmitReview}
                    disabled={submitting}
                    className="flex-1 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    {submitting ? 'Submitting...' : 'Submit Review'}
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

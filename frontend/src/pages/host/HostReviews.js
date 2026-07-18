import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import axios from 'axios';
import { toast } from 'sonner';
import { Star, ChatCircleDots, CheckCircle, MapPin } from '@phosphor-icons/react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function HostReviews({ user }) {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyDialog, setReplyDialog] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await axios.get(`${API}/host/reviews?host_id=${user.id}`);
      setReviews(response.data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const openReplyDialog = (review) => {
    setReplyDialog(review);
    setReplyText(review.host_reply || '');
  };

  const submitReply = async () => {
    if (!replyText.trim()) {
      toast.error('Please write a reply');
      return;
    }
    setSubmitting(true);
    try {
      await axios.post(`${API}/reviews/${replyDialog.id}/reply`, {
        reply: replyText.trim(),
        host_id: user.id
      });
      toast.success('Reply posted!');
      setReplyDialog(null);
      setReplyText('');
      fetchReviews();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to post reply');
    } finally {
      setSubmitting(false);
    }
  };

  const withReply = reviews.filter(r => r.host_reply);
  const withoutReply = reviews.filter(r => !r.host_reply);
  const avgRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        logo="HiddenStay Host"
        logoTo="/host"
        links={[
          { label: 'Dashboard', to: '/host', testId: 'back-to-dashboard' },
          { label: 'My Listings', to: '/host/listings', testId: 'listings-link' },
          { label: 'Payouts', to: '/host/payouts', testId: 'payouts-link' },
        ]}
        showLogout
      />

      <div className="max-w-5xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-4">Guest Feedback</p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-medium tracking-tight leading-tight text-foreground mb-4">
            Reviews
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
            <span>{reviews.length} review{reviews.length !== 1 ? 's' : ''}</span>
            {avgRating && (
              <span className="inline-flex items-center gap-1.5">
                <Star size={16} weight="fill" className="text-accent" />
                <span className="font-semibold text-foreground" data-testid="host-avg-rating">{avgRating}</span>
                <span>average</span>
              </span>
            )}
            {withoutReply.length > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/20 text-accent text-xs font-medium">
                {withoutReply.length} awaiting reply
              </span>
            )}
          </div>
        </motion.div>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading reviews...</div>
        ) : reviews.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-card border border-border rounded-3xl p-16 text-center"
          >
            <ChatCircleDots size={64} className="text-muted-foreground mx-auto mb-4 opacity-40" />
            <h3 className="text-2xl font-display font-medium text-foreground mb-3">No reviews yet</h3>
            <p className="text-muted-foreground">Reviews will appear here after guests complete their stays</p>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {reviews.map((review, index) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08, duration: 0.5 }}
                className="bg-card border border-border rounded-2xl overflow-hidden"
                data-testid={`host-review-${review.id}`}
              >
                <div className="grid grid-cols-1 sm:grid-cols-4">
                  <div className="aspect-[4/3] sm:aspect-square overflow-hidden">
                    <img
                      src={review.property_image}
                      alt={review.property_name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="sm:col-span-3 p-6">
                    <div className="mb-3">
                      <h3 className="text-lg font-display font-medium text-foreground">{review.property_name}</h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin size={14} />
                        {review.property_city}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 mb-3 flex-wrap">
                      <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm">
                        {review.reviewer_name?.[0] || 'T'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-foreground text-sm">{review.reviewer_name}</p>
                          {review.verified_stay && (
                            <span
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-semibold uppercase tracking-wider"
                              data-testid={`verified-badge-${review.id}`}
                            >
                              <CheckCircle size={10} weight="bold" />
                              Verified Stay
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 mt-0.5">
                          {[1, 2, 3, 4, 5].map((n) => (
                            <Star
                              key={n}
                              size={12}
                              weight={review.rating >= n ? 'fill' : 'regular'}
                              className={review.rating >= n ? 'text-accent' : 'text-muted-foreground'}
                            />
                          ))}
                          <span className="text-xs text-muted-foreground ml-1">
                            · {new Date(review.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-foreground leading-relaxed mb-4">{review.comment}</p>

                    {review.host_reply ? (
                      <div
                        className="pl-4 border-l-2 border-primary/40 bg-primary/5 rounded-r-xl p-3 mb-3"
                        data-testid={`host-reply-${review.id}`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold text-primary uppercase tracking-wider">Your reply</span>
                          {review.host_reply_at && (
                            <span className="text-xs text-muted-foreground">
                              · {new Date(review.host_reply_at).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-foreground">{review.host_reply}</p>
                      </div>
                    ) : null}

                    <Button
                      data-testid={`reply-button-${review.id}`}
                      onClick={() => openReplyDialog(review)}
                      variant={review.host_reply ? 'ghost' : 'default'}
                      size="sm"
                      className="rounded-full"
                    >
                      <ChatCircleDots size={16} weight="bold" className="mr-2" />
                      {review.host_reply ? 'Edit reply' : 'Reply to review'}
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={!!replyDialog} onOpenChange={(open) => !open && setReplyDialog(null)}>
        <DialogContent className="max-w-lg">
          {replyDialog && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-display">Reply to Review</DialogTitle>
                <DialogDescription>
                  Your reply will be visible to all future guests on the property page.
                </DialogDescription>
              </DialogHeader>

              <div className="mt-4 mb-4 bg-muted/30 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star
                      key={n}
                      size={12}
                      weight={replyDialog.rating >= n ? 'fill' : 'regular'}
                      className={replyDialog.rating >= n ? 'text-accent' : 'text-muted-foreground'}
                    />
                  ))}
                  <span className="text-xs text-muted-foreground ml-1">by {replyDialog.reviewer_name}</span>
                </div>
                <p className="text-sm text-foreground italic">&ldquo;{replyDialog.comment}&rdquo;</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Your Reply</label>
                  <Textarea
                    data-testid="reply-text-input"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Thank the guest, address feedback, or share updates..."
                    rows={4}
                    className="rounded-2xl"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    onClick={() => setReplyDialog(null)}
                    variant="outline"
                    className="flex-1 rounded-full"
                  >
                    Cancel
                  </Button>
                  <Button
                    data-testid="submit-reply-button"
                    onClick={submitReply}
                    disabled={submitting}
                    className="flex-1 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    {submitting ? 'Posting...' : 'Post Reply'}
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

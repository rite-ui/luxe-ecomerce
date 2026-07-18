import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api, { getErrorMessage } from '../services/api';
import { Star, Trash2, ShieldAlert } from 'lucide-react';

const ReviewSystem = ({ productId, reviews = [], onReviewAdded }) => {
  const { user } = useAuth();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [hoverRating, setHoverRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Check if current user already submitted a review
  const alreadyReviewed = user && reviews.some((r) => r.user?._id === user._id || r.user === user._id);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setLoading(true);
    setError(null);
    try {
      // POST /api/products/:id/reviews
      const response = await api.post(`/products/${productId}/reviews`, {
        rating,
        comment: comment.trim(),
      });
      if (response.data.success) {
        setComment('');
        setRating(5);
        if (onReviewAdded) onReviewAdded();
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm('Delete this review?')) return;
    try {
      // DELETE /api/reviews/:productId/:reviewId
      const response = await api.delete(`/reviews/${productId}/${reviewId}`);
      if (response.data.success) {
        if (onReviewAdded) onReviewAdded();
      }
    } catch (err) {
      alert(getErrorMessage(err));
    }
  };

  // Helper to render stars
  const renderStars = (count, interactive = false) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={interactive ? 20 : 12}
            className={`${
              star <= (interactive ? hoverRating || rating : count)
                ? 'fill-[#D4AF37] text-[#D4AF37]'
                : 'text-gray-300 dark:text-neutral-700'
            } ${interactive ? 'cursor-pointer transition-colors duration-150' : ''}`}
            onClick={interactive ? () => setRating(star) : undefined}
            onMouseEnter={interactive ? () => setHoverRating(star) : undefined}
            onMouseLeave={interactive ? () => setHoverRating(0) : undefined}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="w-full space-y-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Reviews List */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-xl font-serif font-semibold tracking-wide">
            Client Reviews ({reviews.length})
          </h3>

          {reviews.length === 0 ? (
            <p className="text-xs text-[var(--text-tertiary)] italic font-light">
              No reviews have been written for this product yet.
            </p>
          ) : (
            <div className="divide-y divide-[var(--border-color)]">
              {reviews.map((review) => {
                const userName = review.name || 'Anonymous User';
                const dateStr = new Date(review.createdAt).toLocaleDateString('en-IN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                });
                return (
                  <div key={review._id} className="py-6 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {/* Avatar */}
                        <div className="h-8 w-8 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center border border-[var(--border-color)] text-[var(--text-primary)] text-xs font-semibold">
                          {userName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-xs font-semibold">{userName}</p>
                          <p className="text-[10px] text-[var(--text-tertiary)]">{dateStr}</p>
                        </div>
                      </div>

                      {/* Stars & Admin Delete */}
                      <div className="flex items-center space-x-3">
                        {renderStars(review.rating)}
                        {user?.role === 'admin' && (
                          <button
                            onClick={() => handleDelete(review._id)}
                            className="text-red-500 hover:text-red-700 p-1"
                            title="Delete review as Admin"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-xs leading-relaxed font-light pl-11 text-[var(--text-secondary)]">
                      {review.comment}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Review Form */}
        <div>
          {alreadyReviewed ? (
            <div className="border border-[var(--border-color)] bg-[var(--bg-secondary)] p-6 text-center space-y-2">
              <ShieldAlert className="mx-auto text-[var(--color-gold-500)]" size={24} />
              <h4 className="text-xs uppercase tracking-widest font-semibold">Review Already Submitted</h4>
              <p className="text-[10px] text-[var(--text-tertiary)]">
                You have already shared your thoughts on this item.
              </p>
            </div>
          ) : user ? (
            <div className="border border-[var(--border-color)] p-6 space-y-4">
              <h4 className="text-sm uppercase tracking-widest font-semibold text-left">Write a Review</h4>
              {error && <p className="text-xs text-red-500 text-left">{error}</p>}
              
              <form onSubmit={handleSubmit} className="space-y-4 text-left">
                {/* Rating selection */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest text-[var(--text-tertiary)]">
                    Rating
                  </label>
                  {renderStars(rating, true)}
                </div>

                {/* Comment area */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest text-[var(--text-tertiary)]">
                    Your Review
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Describe your experience with this premium product..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] p-3 text-xs outline-none focus:border-[var(--text-primary)] text-[var(--text-primary)]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-luxe-primary text-xs"
                >
                  {loading ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            </div>
          ) : (
            <div className="border border-[var(--border-color)] bg-[var(--bg-secondary)] p-6 text-center space-y-2">
              <h4 className="text-xs uppercase tracking-widest font-semibold">Write a Review</h4>
              <p className="text-[10px] text-[var(--text-tertiary)]">
                Please log in to submit your rating.
              </p>
              <Link to="/login" className="inline-block border-b border-[var(--text-primary)] text-[10px] uppercase tracking-widest font-semibold py-1">
                Log In
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewSystem;

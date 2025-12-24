import React, { useState } from 'react';
import { Star, ThumbsUp, User, MessageSquare } from 'lucide-react';
import { Button } from './Button';
import { useReviews } from '../contexts/ReviewsContext';

interface ReviewSectionProps {
  itemId: string;
  itemName: string;
}

export const ReviewSection: React.FC<ReviewSectionProps> = ({ itemId, itemName }) => {
  const { getReviewsForProduct, addReview, markHelpful } = useReviews();
  const reviews = getReviewsForProduct(itemId);
  
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hoverRating, setHoverRating] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;
    addReview(itemId, rating, comment);
    setShowForm(false);
    setRating(0);
    setComment('');
  };

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1)
    : 'New';

  // Calculate rating distribution
  const distribution = [5, 4, 3, 2, 1].map(star => {
    const count = reviews.filter(r => Math.floor(r.rating) === star).length;
    const percentage = reviews.length ? (count / reviews.length) * 100 : 0;
    return { star, count, percentage };
  });

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-2 duration-500">
      {/* Header Summary & Distribution */}
      <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Average Score */}
          <div className="flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-700 pb-6 md:pb-0 md:pr-6">
             <div className="text-5xl font-bold text-health-text dark:text-white mb-2">{averageRating}</div>
             <div className="flex text-yellow-400 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-5 h-5 ${i < Math.round(Number(averageRating)) ? 'fill-current' : 'text-slate-200 dark:text-slate-600'}`} />
                ))}
             </div>
             <p className="text-slate-500 text-sm">{reviews.length} Ratings</p>
          </div>

          {/* Rating Bars */}
          <div className="md:col-span-2 flex flex-col justify-center space-y-2">
             {distribution.map(({ star, count, percentage }) => (
               <div key={star} className="flex items-center gap-3">
                 <span className="text-sm font-bold text-slate-600 dark:text-slate-400 w-3">{star}</span>
                 <Star className="w-4 h-4 text-slate-400" />
                 <div className="flex-1 h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                   <div 
                     className="h-full bg-health-primary rounded-full transition-all duration-500"
                     style={{ width: `${percentage}%` }}
                   ></div>
                 </div>
                 <span className="text-xs text-slate-400 w-8 text-right">{percentage.toFixed(0)}%</span>
               </div>
             ))}
          </div>

        </div>
        
        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700 flex justify-center">
           <Button onClick={() => setShowForm(!showForm)} size="lg" className="w-full md:w-auto min-w-[200px]">
             {showForm ? 'Cancel Review' : 'Write a Review'}
           </Button>
        </div>
      </div>

      {/* Review Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 rounded-2xl space-y-4 shadow-lg animate-in fade-in slide-in-from-top-2">
          <h4 className="font-bold text-health-text dark:text-white text-lg">Share your experience with {itemName}</h4>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="focus:outline-none transition-transform hover:scale-110 p-1"
                >
                  <Star 
                    className={`w-8 h-8 ${
                      star <= (hoverRating || rating) 
                        ? 'text-yellow-400 fill-current' 
                        : 'text-slate-200 dark:text-slate-600'
                    }`} 
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Your Review</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
              rows={4}
              placeholder="Tell us what you liked or didn't like. Be specific to help others!"
              className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-health-primary outline-none transition-all resize-none"
            />
          </div>

          <div className="flex justify-end">
             <Button type="submit" disabled={rating === 0 || !comment.trim()}>
               Submit Review
             </Button>
          </div>
        </form>
      )}

      {/* Review List */}
      <div className="space-y-6">
        {reviews.length === 0 ? (
          <div className="text-center py-12 text-slate-500 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>No reviews yet.</p>
            <p className="text-sm">Be the first to share your thoughts!</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm transition-shadow hover:shadow-md">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 shadow-inner">
                     <User className="w-5 h-5" />
                   </div>
                   <div>
                     <p className="font-bold text-sm text-health-text dark:text-white">{review.author}</p>
                     {review.verified && (
                       <span className="inline-flex items-center text-[10px] text-green-700 bg-green-50 dark:text-green-400 dark:bg-green-900/30 px-2 py-0.5 rounded-full mt-0.5 border border-green-100 dark:border-green-900/50">
                         Verified Buyer
                       </span>
                     )}
                   </div>
                </div>
                <span className="text-xs text-slate-400 font-medium">{review.date}</span>
              </div>
              
              <div className="flex text-yellow-400 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-slate-200 dark:text-slate-700'}`} />
                ))}
              </div>
              
              <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed mb-4">
                {review.comment}
              </p>
              
              <div className="flex items-center gap-4 pt-4 border-t border-slate-50 dark:border-slate-800">
                <button 
                  onClick={() => markHelpful(review.id)}
                  className="flex items-center text-xs font-medium text-slate-500 hover:text-health-primary transition-colors gap-1.5 group"
                >
                  <ThumbsUp className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  Helpful ({review.helpfulCount})
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Review } from '../types';
import { INITIAL_REVIEWS, CURRENT_USER } from '../constants';
import { useToast } from './ToastContext';

interface ReviewsContextType {
  getReviewsForProduct: (productId: string) => Review[];
  addReview: (productId: string, rating: number, comment: string) => void;
  markHelpful: (reviewId: string) => void;
}

const ReviewsContext = createContext<ReviewsContextType | undefined>(undefined);

export const ReviewsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [reviews, setReviews] = useState<Review[]>(() => {
    try {
      const saved = localStorage.getItem('vita_reviews');
      return saved ? JSON.parse(saved) : INITIAL_REVIEWS;
    } catch (e) {
      return INITIAL_REVIEWS;
    }
  });
  
  const { addToast } = useToast();

  useEffect(() => {
    localStorage.setItem('vita_reviews', JSON.stringify(reviews));
  }, [reviews]);

  const getReviewsForProduct = (productId: string) => {
    return reviews
      .filter(r => r.productId === productId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const addReview = (productId: string, rating: number, comment: string) => {
    const newReview: Review = {
      id: `r${Date.now()}`,
      productId,
      author: CURRENT_USER.name,
      rating,
      comment,
      date: new Date().toISOString().split('T')[0],
      verified: true,
      helpfulCount: 0
    };
    
    setReviews(prev => [newReview, ...prev]);
    addToast("Review submitted successfully!", "success");
  };

  const markHelpful = (reviewId: string) => {
    setReviews(prev => prev.map(r => 
      r.id === reviewId ? { ...r, helpfulCount: r.helpfulCount + 1 } : r
    ));
    addToast("Thanks for your feedback!", "info");
  };

  return (
    <ReviewsContext.Provider value={{ getReviewsForProduct, addReview, markHelpful }}>
      {children}
    </ReviewsContext.Provider>
  );
};

export const useReviews = () => {
  const context = useContext(ReviewsContext);
  if (!context) {
    throw new Error('useReviews must be used within a ReviewsProvider');
  }
  return context;
};
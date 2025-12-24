import React from 'react';
import { Star, Plus, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Product } from '../types';
import { Button } from './Button';
import { useCart } from '../contexts/CartContext';
import { useReviews } from '../contexts/ReviewsContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { getReviewsForProduct } = useReviews();

  const reviews = getReviewsForProduct(product.id);
  
  // Calculate dynamic rating
  const reviewCount = reviews.length;
  const averageRating = reviewCount > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviewCount)
    : product.rating;

  const displayCount = reviewCount > 0 ? reviewCount : product.reviews;

  return (
    <div 
      className="group bg-white dark:bg-slate-800 rounded-2xl shadow-card hover:shadow-xl transition-all duration-300 overflow-hidden border border-transparent hover:border-health-surface dark:hover:border-slate-700 flex flex-col h-full cursor-pointer"
      onClick={() => navigate(`/product/${product.id}`)}
    >
      <div className="relative aspect-square overflow-hidden bg-slate-50 dark:bg-slate-700">
        <img 
          src={product.image} 
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
        />
        {product.badges.includes('Doctor Pick') && (
          <div className="absolute top-3 left-3 bg-health-primary/90 backdrop-blur text-white text-xs px-2 py-1 rounded-full flex items-center font-medium shadow-sm">
            <ShieldCheck className="w-3 h-3 mr-1" />
            Doctor Pick
          </div>
        )}
      </div>
      
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <div className="text-xs font-semibold text-health-primary uppercase tracking-wide">
            {product.category}
          </div>
          {product.dosage && (
            <span className="text-[10px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">
              {product.dosage}
            </span>
          )}
        </div>
        
        <h3 className="font-serif font-bold text-lg text-health-text dark:text-slate-100 mb-1 group-hover:text-health-primary transition-colors line-clamp-1">
          {product.name}
        </h3>
        
        <div className="flex items-center mb-4">
          <div className="flex text-yellow-400">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className={`w-3.5 h-3.5 ${i < Math.round(averageRating) ? 'fill-current' : 'text-slate-300 dark:text-slate-600'}`} />
            ))}
          </div>
          <span className="text-xs text-slate-400 ml-2">({displayCount})</span>
        </div>

        <div className="mt-auto flex items-center justify-between">
          <span className="font-bold text-lg text-health-text dark:text-white">${product.price.toFixed(2)}</span>
          <Button 
            size="sm" 
            variant="outline" 
            className="rounded-xl dark:border-health-primary dark:text-health-primary dark:hover:bg-slate-700/50"
            onClick={(e) => {
              e.stopPropagation();
              addToCart(product);
            }}
          >
             <Plus className="w-4 h-4 mr-1" /> Add
          </Button>
        </div>
      </div>
    </div>
  );
};
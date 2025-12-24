import React, { useState } from 'react';
import { X, Trash2, ShoppingBag, Calendar, ArrowRight, Tag, Truck } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../contexts/ToastContext';
import { Button } from './Button';
import { useNavigate } from 'react-router-dom';

export const CartDrawer: React.FC = () => {
  const { items, removeFromCart, isCartOpen, setIsCartOpen, cartTotal } = useCart();
  const { addToast } = useToast();
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);

  if (!isCartOpen) return null;

  const handleApplyPromo = () => {
    if (promoCode.toUpperCase() === 'HEALTH10') {
      setDiscount(cartTotal * 0.1);
      addToast("Promo code applied! You saved 10%.", 'success');
    } else {
      addToast("Invalid promo code.", 'error');
    }
  };

  const shippingCost = cartTotal > 50 ? 0 : 5.99;
  const finalTotal = cartTotal - discount + shippingCost;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Drawer */}
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-2xl font-serif font-bold text-health-text dark:text-white flex items-center">
            <ShoppingBag className="w-6 h-6 mr-2 text-health-primary" />
            Your Cart
          </h2>
          <button 
            onClick={() => setIsCartOpen(false)}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-slate-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-500">
              <ShoppingBag className="w-16 h-16 mb-4 opacity-20" />
              <p>Your cart is empty.</p>
              <Button variant="ghost" className="mt-4" onClick={() => setIsCartOpen(false)}>Continue Shopping</Button>
            </div>
          ) : (
            items.map((item, index) => {
              const isDoctor = !('category' in item);
              const price = 'price' in item ? item.price : 35.00;
              
              return (
                <div key={`${item.id}-${index}`} className="flex gap-4 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-white flex-shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-health-text dark:text-white truncate pr-2">{item.name}</h3>
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs text-slate-500 mb-2">
                      {isDoctor ? 'Consultation' : (item as any).category}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="font-bold text-health-primary">${price.toFixed(2)}</span>
                      {isDoctor && (
                        <span className="text-[10px] flex items-center bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                          <Calendar className="w-3 h-3 mr-1" /> Today
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {items.length > 0 && (
          <div className="p-6 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 space-y-4">
            
            {/* Promo Code */}
            <div className="flex space-x-2">
               <div className="relative flex-grow">
                 <Tag className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                 <input 
                   type="text" 
                   value={promoCode}
                   onChange={(e) => setPromoCode(e.target.value)}
                   placeholder="Promo Code" 
                   className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-1 focus:ring-health-primary outline-none"
                 />
               </div>
               <Button size="sm" variant="outline" onClick={handleApplyPromo} disabled={!promoCode}>Apply</Button>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Subtotal</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-health-success">
                  <span>Discount</span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span className="flex items-center"><Truck className="w-3 h-3 mr-1"/> Shipping</span>
                <span>{shippingCost === 0 ? 'Free' : `$${shippingCost.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-health-text dark:text-white pt-2 border-t border-slate-200 dark:border-slate-700">
                <span>Total</span>
                <span>${finalTotal.toFixed(2)}</span>
              </div>
            </div>

            <Button size="lg" className="w-full justify-between group" onClick={() => { addToast("Proceeding to secure checkout...", "success"); setIsCartOpen(false); }}>
              Secure Checkout
              <ArrowRight className="w-5 h-5 opacity-70 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
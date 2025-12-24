import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, ShieldCheck, Clock, AlertTriangle, CheckCircle, ArrowLeft, ArrowRight, Play, FileText, Calendar, Video, MapPin, Award, ChevronLeft, ChevronRight } from 'lucide-react';
import { FEATURED_PRODUCTS, AVAILABLE_DOCTORS, CURRENT_USER } from '../constants';
import { Button } from '../components/Button';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../contexts/ToastContext';
import { ReviewSection } from '../components/ReviewSection';
import { ProductCard } from '../components/ProductCard';
import { useReviews } from '../contexts/ReviewsContext';

// Extracted Modal Component
const PurchaseModal: React.FC<{ 
  item: any; 
  onClose: () => void; 
  onConfirm: () => void;
  isDoctor: boolean;
}> = ({ item, onClose, onConfirm, isDoctor }) => {
  const [option, setOption] = useState<'one-time' | 'subscribe' | 'consult'>('one-time');

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-md w-full p-6 relative overflow-hidden">
        <div className="mb-6">
          <h3 className="font-serif font-bold text-2xl text-health-text dark:text-white mb-2">
            {isDoctor ? 'Confirm Booking' : 'Are you ready?'}
          </h3>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            Please confirm your selection for <span className="font-bold">{item.name}</span>.
          </p>
        </div>

        {isDoctor ? (
           <div className="space-y-3 mb-6">
              <div className="p-4 rounded-xl border border-health-primary bg-health-surface dark:bg-slate-800">
                <span className="block font-bold text-health-text dark:text-white">Video Consultation</span>
                <span className="block text-xs text-slate-500">15 minutes • $35.00</span>
                <span className="block text-xs text-health-primary mt-1 font-medium">Available Today at 2:00 PM</span>
              </div>
           </div>
        ) : (
          <div className="space-y-3 mb-6">
            <label className={`flex items-center p-4 rounded-xl border cursor-pointer transition-all ${option === 'one-time' ? 'border-health-primary bg-health-surface dark:bg-slate-800' : 'border-slate-200 dark:border-slate-700'}`}>
              <input type="radio" name="purchase" checked={option === 'one-time'} onChange={() => setOption('one-time')} className="text-health-primary focus:ring-health-primary" />
              <div className="ml-3">
                <span className="block font-bold text-health-text dark:text-white">Buy Now - One time</span>
                <span className="block text-xs text-slate-500">${item.price.toFixed(2)}</span>
              </div>
            </label>
            
            <label className={`flex items-center p-4 rounded-xl border cursor-pointer transition-all ${option === 'subscribe' ? 'border-health-primary bg-health-surface dark:bg-slate-800' : 'border-slate-200 dark:border-slate-700'}`}>
              <input type="radio" name="purchase" checked={option === 'subscribe'} onChange={() => setOption('subscribe')} className="text-health-primary focus:ring-health-primary" />
              <div className="ml-3">
                <span className="block font-bold text-health-text dark:text-white">Subscribe & Save 15%</span>
                <span className="block text-xs text-health-success">${(item.price * 0.85).toFixed(2)} / 30 days</span>
              </div>
            </label>
          </div>
        )}

        {!isDoctor && (
          <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-xl mb-6">
             <h4 className="font-bold text-xs uppercase text-orange-600 dark:text-orange-400 mb-2">Safety Check</h4>
             <div className="space-y-2">
               <label className="flex items-center text-sm text-slate-700 dark:text-slate-300">
                 <input type="checkbox" className="rounded text-health-primary mr-2" />
                 I've reviewed the warnings
               </label>
               <label className="flex items-center text-sm text-slate-700 dark:text-slate-300">
                 <input type="checkbox" className="rounded text-health-primary mr-2" />
                 I am not pregnant or nursing
               </label>
             </div>
          </div>
        )}

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onClose}>Back</Button>
          <Button className="flex-1" onClick={onConfirm}>
            {isDoctor ? 'Book Appointment' : 'Confirm Order'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { addToast } = useToast();
  const { getReviewsForProduct } = useReviews();
  
  // Handle both Products and Doctors
  const product = FEATURED_PRODUCTS.find(p => p.id === id);
  const doctor = AVAILABLE_DOCTORS.find(d => d.id === id);
  const item = product || doctor;
  
  const isDoctor = !!doctor;
  const [activeTab, setActiveTab] = useState<'overview' | 'science' | 'safety' | 'reviews'>('overview');
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  const reviews = item ? getReviewsForProduct(item.id) : [];
  const reviewCount = reviews.length;
  const averageRating = reviewCount > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviewCount)
    : item?.rating || 0;
  
  const displayCount = reviewCount > 0 ? reviewCount : (isDoctor ? '500+ patients' : `${product?.reviews} verified reviews`);

  // Recommendations Logic: Prioritize same category, then others
  const relatedProducts = !isDoctor 
    ? FEATURED_PRODUCTS
        .filter(p => p.id !== product?.id)
        .sort((a, b) => {
          if (a.category === product?.category && b.category !== product?.category) return -1;
          if (a.category !== product?.category && b.category === product?.category) return 1;
          return 0;
        })
        .slice(0, 5)
    : [];

  if (!item) {
    return <div className="p-8 text-center">Item not found. <Button onClick={() => navigate('/')}>Go Home</Button></div>;
  }

  const handleConfirmAction = () => {
    // Add item (product or doctor) to cart
    addToCart(item as any);
    
    if (isDoctor) {
      addToast(`Appointment with ${item.name} added to cart.`, 'success');
    } else {
      addToast(`${item.name} added to cart.`, 'success');
    }
    setShowPurchaseModal(false);
  };

  const handleScrollToDetails = () => {
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const handlePharmacistChat = () => {
    addToast("Connecting you with the next available pharmacist...", 'info');
  };

  const handleSelectSlot = (slot: string) => {
    setShowPurchaseModal(true);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 pb-20">
      {/* A. STICKY NAVIGATION BAR */}
      <div className="sticky top-16 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur border-b border-slate-100 dark:border-slate-800 py-3 px-4 sm:px-6 lg:px-8 flex justify-between items-center transition-transform">
        <button onClick={() => navigate(-1)} className="flex items-center text-slate-500 hover:text-health-primary transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" /> <span className="hidden sm:inline">Back</span>
        </button>
        <h2 className="font-serif font-bold text-health-text dark:text-white hidden md:block">{item.name}</h2>
        <div className="flex gap-2">
          {!isDoctor && <Button variant="ghost" size="sm" icon={<ShieldCheck className="w-4 h-4"/>} className="hidden sm:flex" onClick={handleScrollToDetails}>Details</Button>}
          <Button size="sm" onClick={() => setShowPurchaseModal(true)}>
            {isDoctor ? 'Book Appointment' : `Add to Cart - $${product?.price}`}
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* B. MAIN CONTENT AREA (Left Column) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-1/2 aspect-square rounded-3xl overflow-hidden bg-slate-50 relative group">
              <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              {!isDoctor && (
                <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur p-3 rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <p className="text-xs font-bold text-slate-500 uppercase">3D View Available</p>
                  <div className="w-full h-1 bg-slate-200 rounded-full mt-2 overflow-hidden">
                     <div className="bg-health-primary w-2/3 h-full"></div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="w-full md:w-1/2">
              <div className="flex items-center space-x-2 mb-4">
                 <span className="bg-health-primary/10 text-health-primary px-2 py-1 rounded-md text-xs font-bold uppercase">
                   {isDoctor ? doctor?.specialty : product?.category}
                 </span>
                 {isDoctor ? (
                   <span className="bg-green-100 text-green-700 px-2 py-1 rounded-md text-xs font-bold uppercase">Verified MD</span>
                 ) : (
                   product?.badges.map(b => (
                     <span key={b} className="bg-green-100 text-green-700 px-2 py-1 rounded-md text-xs font-bold uppercase">{b}</span>
                   ))
                 )}
              </div>
              <h1 className="text-4xl font-serif font-bold text-health-text dark:text-white mb-2">{item.name}</h1>
              <div className="flex items-center mb-6">
                <div className="flex text-yellow-400 mr-2">
                   {[...Array(5)].map((_, i) => (
                     <Star key={i} className={`w-4 h-4 ${i < Math.round(averageRating) ? 'fill-current' : 'text-slate-300'}`} />
                   ))}
                </div>
                <span className="text-slate-500 text-sm">
                   {typeof displayCount === 'number' ? `(${displayCount})` : displayCount}
                </span>
              </div>
              
              <p className="text-lg text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                {isDoctor ? `Dr. ${item.name.split(' ')[1]} is a board-certified specialist with over 15 years of experience in ${doctor?.specialty}.` : product?.description}
              </p>
              
              {!isDoctor && (
                <div className="flex items-center space-x-4 mb-8">
                  <div className="flex -space-x-3">
                    {[1,2,3].map(i => (
                      <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-xs overflow-hidden">
                         <img src={`https://randomuser.me/api/portraits/thumb/men/${i+20}.jpg`} alt="Doc" />
                      </div>
                    ))}
                  </div>
                  <div className="text-sm">
                    <p className="font-bold text-slate-800 dark:text-white">Doctor Verified</p>
                    <p className="text-slate-500">Recommended by Dr. Rostova + 12 others</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* TABS INTERFACE */}
          {isDoctor ? (
             <div className="space-y-8">
                <div className="space-y-6">
                  <h3 className="font-bold text-xl dark:text-white">Credentials & Experience</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                      <Award className="w-6 h-6 text-health-primary mb-2" />
                      <p className="font-bold dark:text-white">Board Certified</p>
                      <p className="text-sm text-slate-500">American Board of Medical Specialties</p>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                      <MapPin className="w-6 h-6 text-health-primary mb-2" />
                      <p className="font-bold dark:text-white">NYU Langone</p>
                      <p className="text-sm text-slate-500">Residency</p>
                    </div>
                  </div>
                </div>
                <hr className="border-slate-100 dark:border-slate-800" />
                <ReviewSection itemId={item.id} itemName={item.name} />
             </div>
          ) : (
            <>
              <div className="border-b border-slate-200 dark:border-slate-700">
                <nav className="flex space-x-8">
                  {['overview', 'science', 'safety', 'reviews'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab as any)}
                      className={`pb-4 text-sm font-medium capitalize transition-colors border-b-2 ${
                        activeTab === tab 
                          ? 'border-health-primary text-health-primary' 
                          : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="min-h-[300px] animate-in slide-in-from-bottom-4 duration-500">
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-6">
                       <h3 className="font-bold text-lg mb-4 dark:text-white">Personalize Your Dose</h3>
                       <div className="grid grid-cols-3 gap-4">
                          <div className="bg-white dark:bg-slate-700 p-4 rounded-xl text-center border border-slate-200 dark:border-slate-600">
                            <span className="text-2xl mb-2 block">🧘‍♀️</span>
                            <p className="font-bold text-sm dark:text-white">For Stress</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">1x Daily</p>
                          </div>
                          <div className="bg-white dark:bg-slate-700 p-4 rounded-xl text-center border border-slate-200 dark:border-slate-600">
                            <span className="text-2xl mb-2 block">😴</span>
                            <p className="font-bold text-sm dark:text-white">For Sleep</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">2x Night</p>
                          </div>
                          <div className="bg-white dark:bg-slate-700 p-4 rounded-xl text-center border border-slate-200 dark:border-slate-600">
                            <span className="text-2xl mb-2 block">⚡</span>
                            <p className="font-bold text-sm dark:text-white">For Energy</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">1x Morning</p>
                          </div>
                       </div>
                    </div>
                    
                    <div>
                       <h3 className="font-bold text-lg mb-4 dark:text-white">Ingredients</h3>
                       <ul className="grid grid-cols-2 gap-2">
                         {product?.ingredients?.map(ing => (
                           <li key={ing} className="flex items-center text-slate-700 dark:text-slate-300 text-sm">
                             <CheckCircle className="w-4 h-4 text-health-success mr-2" />
                             {ing}
                           </li>
                         ))}
                       </ul>
                    </div>
                  </div>
                )}

                {activeTab === 'science' && (
                  <div className="space-y-6">
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6 border border-blue-100 dark:border-blue-900">
                      <div className="flex items-start">
                        <FileText className="w-6 h-6 text-blue-600 mt-1 mr-4" />
                        <div>
                          <h4 className="font-bold text-blue-900 dark:text-blue-100">{product?.science?.studyTitle}</h4>
                          <p className="text-blue-800 dark:text-blue-200 mt-1">{product?.science?.result}</p>
                          <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 italic">{product?.science?.participants} participants • 8-week double-blind trial</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="relative rounded-2xl overflow-hidden bg-slate-900 text-white p-8 text-center group cursor-pointer">
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors"></div>
                      <Play className="w-12 h-12 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white opacity-80 group-hover:scale-110 transition-transform" />
                      <div className="relative z-10 h-full flex flex-col justify-end">
                        <p className="font-bold">Watch Dr. Rodriguez explain the mechanism of action</p>
                        <p className="text-xs opacity-80">2:14 Video</p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'safety' && (
                  <div className="space-y-6">
                     <div className="border-l-4 border-orange-500 pl-4 py-1">
                       <h4 className="font-bold text-orange-600 dark:text-orange-400 flex items-center mb-2">
                         <AlertTriangle className="w-5 h-5 mr-2" /> Important Warnings
                       </h4>
                       <ul className="list-disc list-inside text-sm text-slate-700 dark:text-slate-300 space-y-1">
                         {product?.warnings?.map(w => (
                           <li key={w}>{w}</li>
                         ))}
                       </ul>
                     </div>
                     
                     <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-2xl">
                       <h4 className="font-bold text-slate-900 dark:text-white mb-2">Pharmacist Note</h4>
                       <p className="text-sm text-slate-600 dark:text-slate-400">
                         Based on your profile, you are currently taking medications that may interact lightly with this supplement. 
                         We recommend spacing them 4 hours apart.
                       </p>
                       <Button variant="outline" size="sm" className="mt-4" onClick={handlePharmacistChat}>Chat with Pharmacist</Button>
                     </div>
                  </div>
                )}

                {activeTab === 'reviews' && (
                  <ReviewSection itemId={item.id} itemName={item.name} />
                )}
              </div>

              {/* Personalized Recommendations Carousel */}
              <div className="pt-12 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-serif font-bold text-2xl text-health-text dark:text-white">
                    Customers Also Bought
                  </h3>
                  <div className="hidden sm:flex space-x-2 text-slate-400">
                    <span className="text-xs self-center mr-2">Based on aggregated data</span>
                  </div>
                </div>
                
                <div className="relative group">
                  <div className="flex gap-6 overflow-x-auto pb-4 -mx-4 px-4 snap-x scrollbar-hide scroll-smooth">
                    {relatedProducts.map(relatedProduct => (
                      <div key={relatedProduct.id} className="min-w-[260px] w-[260px] snap-center">
                        <ProductCard product={relatedProduct} />
                      </div>
                    ))}
                  </div>
                  {/* Fade indicators */}
                  <div className="absolute top-0 right-0 h-full w-12 bg-gradient-to-l from-white dark:from-slate-950 to-transparent pointer-events-none md:block hidden"></div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* C. SMART SIDEBAR (Right Column) */}
        <div className="lg:col-span-4 space-y-6">
           {/* Profile Match Card - Only for products for now */}
           {!isDoctor && (
             <div className="bg-health-surface dark:bg-slate-800 rounded-3xl p-6 border border-health-primary/20 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold uppercase text-health-primary tracking-wider">Health Profile Match</span>
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-health-success shadow-sm">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-sm font-bold text-slate-800 dark:text-white mb-2">✅ Compatible with your needs</p>
                <ul className="space-y-2 mb-6">
                  <li className="text-xs text-slate-600 dark:text-slate-300 flex items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-health-success mr-2"></span>
                    Matches: {CURRENT_USER.recommendedFocus}
                  </li>
                  <li className="text-xs text-slate-600 dark:text-slate-300 flex items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mr-2"></span>
                    Caution: {CURRENT_USER.conditions[0]}
                  </li>
                </ul>
             </div>
           )}

           {isDoctor ? (
             <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm">
                <h4 className="font-bold text-slate-900 dark:text-white mb-4">Availability</h4>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-between group" onClick={() => handleSelectSlot('Today, 2:00 PM')}>
                    <span>Today, 2:00 PM</span>
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity"/>
                  </Button>
                  <Button variant="outline" className="w-full justify-between group" onClick={() => handleSelectSlot('Tomorrow, 9:00 AM')}>
                    <span>Tomorrow, 9:00 AM</span>
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity"/>
                  </Button>
                  <Button variant="outline" className="w-full justify-between group" onClick={() => handleSelectSlot('Thu, 11:30 AM')}>
                    <span>Thu, 11:30 AM</span>
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity"/>
                  </Button>
                </div>
             </div>
           ) : (
             <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm">
               <h4 className="font-bold text-slate-900 dark:text-white mb-4">Frequently Bought With</h4>
               <div className="space-y-4">
                  <div className="flex items-center justify-between">
                     <div className="flex items-center">
                       <img src="https://images.unsplash.com/photo-1550572017-edd951aa8f72?auto=format&fit=crop&q=80&w=100" className="w-10 h-10 rounded-lg object-cover mr-3" alt="Tea" />
                       <div>
                         <p className="text-sm font-bold dark:text-white">Sleep Tea</p>
                         <p className="text-xs text-slate-500">$14.99</p>
                       </div>
                     </div>
                     <Button size="sm" variant="outline" className="px-2 h-8" onClick={() => { addToCart(product as any); addToast("Sleep Tea added to cart", 'success'); }}>+</Button>
                  </div>
                  <div className="flex items-center justify-between">
                     <div className="flex items-center">
                       <img src="https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=100" className="w-10 h-10 rounded-lg object-cover mr-3" alt="Melatonin" />
                       <div>
                         <p className="text-sm font-bold dark:text-white">Melatonin</p>
                         <p className="text-xs text-slate-500">$12.99</p>
                       </div>
                     </div>
                     <Button size="sm" variant="outline" className="px-2 h-8" onClick={() => { addToCart(product as any); addToast("Melatonin added to cart", 'success'); }}>+</Button>
                  </div>
               </div>
             </div>
           )}

           {/* Telehealth Promo */}
           {!isDoctor && (
             <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-6 text-white text-center">
                <Clock className="w-8 h-8 mx-auto mb-3 opacity-80" />
                <h4 className="font-bold text-lg mb-1">Not sure?</h4>
                <p className="text-sm text-blue-100 mb-4">Talk to a certified nutritionist in 15 minutes.</p>
                <Button variant="outline" className="w-full border-white text-white hover:bg-white/10" onClick={() => navigate('/product/d1')}>Start Consult ($35)</Button>
             </div>
           )}
        </div>
      </div>

      {showPurchaseModal && <PurchaseModal item={item} isDoctor={isDoctor} onClose={() => setShowPurchaseModal(false)} onConfirm={handleConfirmAction} />}
    </div>
  );
};
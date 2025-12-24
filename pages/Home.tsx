import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, Video, Stethoscope, ChevronRight, XCircle, 
  Pill, Activity, Brain, Heart, Zap, Coffee, FileText, AlertCircle, Users,
  X, MapPin, Download, Search, CheckCircle2, Sparkles, TrendingUp, ShieldCheck,
  Phone, Ambulance, AlertTriangle, ChevronLeft, Calendar, MessageSquare, Quote
} from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { GoogleGenAI, Type } from "@google/genai";
import { Button } from '../components/Button';
import { ProductCard } from '../components/ProductCard';
import { HealthAssessment } from '../components/HealthAssessment';
import { SymptomChecker } from '../components/SymptomChecker';
import { InteractionChecker } from '../components/InteractionChecker';
import { FEATURED_PRODUCTS, AVAILABLE_DOCTORS, CURRENT_USER, HEALTH_TIPS } from '../constants';
import { Product } from '../types';

// Internal reusable Modal component for Home page interactions
const InfoModal: React.FC<{
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}> = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-lg w-full relative overflow-hidden flex flex-col max-h-[90vh]">
      <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
        <h3 className="font-serif font-bold text-xl text-health-text dark:text-white">{title}</h3>
        <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
          <X className="w-5 h-5 text-slate-500" />
        </button>
      </div>
      <div className="p-6 overflow-y-auto">
        {children}
      </div>
    </div>
  </div>
);

interface RecommendationGroup {
  id: string;
  title: string;
  description: string;
  productIds: string[];
  icon: 'sparkles' | 'trending' | 'shield';
}

export const Home: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const searchQuery = searchParams.get('q');
  const view = searchParams.get('view'); // 'products', 'services', 'emergency'
  
  // Carousel State
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // State for Modals
  const [activeModal, setActiveModal] = useState<{ title: string; content: React.ReactNode } | null>(null);

  // State for AI Recommendations
  const [recommendations, setRecommendations] = useState<RecommendationGroup[]>([]);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(true);

  // Hero Slides Data
  const slides = [
    {
      id: 1,
      welcome: `Welcome back, ${CURRENT_USER.name}.`,
      title: <>Your <span className="text-health-primary">Vitamin D</span> is running low.</>,
      desc: "Consistency is key. Reorder now to maintain your 15-day streak, or check in with a doctor.",
      image: "https://images.unsplash.com/photo-1544367563-12123d8965cd?auto=format&fit=crop&q=80&w=800",
      cta1: { label: "Reorder Now", icon: <ArrowRight className="w-5 h-5" />, action: () => navigate('/product/p1') },
      cta2: { label: "Health Check", icon: <Activity className="w-5 h-5" />, action: () => navigate('/dashboard') }
    },
    {
      id: 2,
      welcome: "Telehealth Services",
      title: <>Expert Care, <span className="text-health-primary">Anytime, Anywhere.</span></>,
      desc: "Connect with board-certified specialists in minutes. No waiting rooms, just quality care.",
      image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=800",
      cta1: { label: "Book Consult", icon: <Video className="w-5 h-5" />, action: () => navigate('/?view=services') },
      cta2: { label: "Our Doctors", icon: <Users className="w-5 h-5" />, action: () => navigate('/?view=services') }
    },
    {
      id: 3,
      welcome: "Success Stories",
      title: <>Trusted by <span className="text-health-primary">2 Million+</span> Lives.</>,
      desc: "Join a community dedicated to better health. Real people, real results, backed by science.",
      image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&q=80&w=800",
      cta1: { label: "Read Reviews", icon: <MessageSquare className="w-5 h-5" />, action: () => navigate('/?view=products') },
      cta2: { label: "Join Us", icon: <Heart className="w-5 h-5" />, action: () => navigate('/login') }
    },
    {
      id: 4,
      welcome: "Smart Features",
      title: <>Your Health, <span className="text-health-primary">Intelligently Tracked.</span></>,
      desc: "Our AI-powered Health Hub helps you spot trends and reach your wellness goals faster.",
      image: "https://images.unsplash.com/photo-1576091160550-2187d80a1a44?auto=format&fit=crop&q=80&w=800",
      cta1: { label: "Go to Hub", icon: <Brain className="w-5 h-5" />, action: () => navigate('/dashboard') },
      cta2: { label: "Learn More", icon: <FileText className="w-5 h-5" />, action: () => setActiveModal({ title: "Health Hub", content: <p>Our hub uses advanced analytics...</p> }) }
    },
    {
      id: 5,
      welcome: "Emergency Support",
      title: <>Here When You <span className="text-health-primary">Need Us Most.</span></>,
      desc: "Quick access to urgent care centers, poison control, and emergency resources.",
      image: "https://images.unsplash.com/photo-1516574187841-693018f374ce?auto=format&fit=crop&q=80&w=800",
      cta1: { label: "Find Urgent Care", icon: <MapPin className="w-5 h-5" />, action: () => navigate('/?view=emergency') },
      cta2: { label: "Emergency Info", icon: <AlertTriangle className="w-5 h-5" />, action: () => navigate('/?view=emergency') }
    }
  ];

  // Auto-play Effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  // AI Recommendation Logic
  useEffect(() => {
    const fetchRecommendations = async () => {
      // Only fetch if we are in default view
      if (view || searchQuery) {
        setIsLoadingRecommendations(false);
        return;
      }

      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        // Prepare context for the model
        const productCatalog = FEATURED_PRODUCTS.map(p => ({ id: p.id, name: p.name, description: p.description, badges: p.badges, category: p.category }));
        const userContext = {
          profile: CURRENT_USER,
          location: "New York, NY", // Simulated location
          season: "Spring (Allergy Season)" // Simulated season
        };

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-preview-09-2025',
          contents: `Act as a personal health concierge for 'VitaCare'.
            
            INPUT DATA:
            1. User Context: ${JSON.stringify(userContext)}
            2. Product Catalog: ${JSON.stringify(productCatalog)}

            TASK:
            Select the most relevant products from the catalog and group them into exactly these 3 categories:
            
            1. "Based on your profile" 
               - Criteria: Matches user's conditions (${CURRENT_USER.conditions.join(', ')}) or goals (${CURRENT_USER.recommendedFocus}).
               - Icon: "sparkles"
            
            2. "Trending in your area"
               - Criteria: Relevant to the current season (${userContext.season}) or general wellness trends.
               - Icon: "trending"
            
            3. "Doctor recommended"
               - Criteria: Products with 'Doctor Pick' badge, 'Clinically Proven', or high scientific backing.
               - Icon: "shield"

            REQUIREMENTS:
            - Each group must have at least 1 product.
            - Do not invent products. Use only IDs from the catalog.
            - Provide a short, friendly description for each group explaining why these items were picked.
            `,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  productIds: { 
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  icon: { 
                    type: Type.STRING, 
                    enum: ['sparkles', 'trending', 'shield'] 
                  }
                },
                required: ['title', 'productIds', 'icon', 'description']
              }
            }
          }
        });

        if (response.text) {
          const data = JSON.parse(response.text);
          setRecommendations(data);
        }
      } catch (error) {
        console.error("AI Recommendation failed", error);
        // Fallback handled by UI
      } finally {
        setIsLoadingRecommendations(false);
      }
    };

    fetchRecommendations();
  }, [view, searchQuery]);

  // --- Quick Access Grid Data ---
  const quickAccessItems = [
    { icon: <Pill className="w-6 h-6" />, label: 'Vitamins', color: 'bg-blue-100 text-blue-600', link: '/?view=products&q=Vitamins' },
    { icon: <Stethoscope className="w-6 h-6" />, label: 'Doctors', color: 'bg-green-100 text-green-600', link: '/?view=services' },
    { icon: <FileText className="w-6 h-6" />, label: 'Guides', color: 'bg-purple-100 text-purple-600', link: '/dashboard' },
    { icon: <Activity className="w-6 h-6" />, label: 'Pharmacy', color: 'bg-red-100 text-red-600', link: '/?view=products' },
    { icon: <Zap className="w-6 h-6" />, label: 'Fitness', color: 'bg-yellow-100 text-yellow-600', link: '/?view=products' },
    { icon: <Coffee className="w-6 h-6" />, label: 'Sleep', color: 'bg-indigo-100 text-indigo-600', link: '/?view=products&q=Sleep' },
    { icon: <Brain className="w-6 h-6" />, label: 'Mental', color: 'bg-teal-100 text-teal-600', link: '/?view=services' },
    { icon: <Heart className="w-6 h-6" />, label: 'Heart', color: 'bg-rose-100 text-rose-600', link: '/?view=services' },
  ];

  const handleConsultClick = () => {
    navigate('/product/d1');
  };

  // --- Tool & Tip Handlers ---
  
  const handleReadTip = (tip: any) => {
    setActiveModal({
      title: tip.title,
      content: (
        <div className="space-y-4">
            <div className={`inline-flex p-3 rounded-full mb-2 ${tip.icon === 'sun' ? 'bg-orange-100 text-health-accent' : 'bg-indigo-100 text-indigo-600'}`}>
               {tip.icon === 'sun' ? <Zap className="w-6 h-6" /> : <Coffee className="w-6 h-6" />}
            </div>
            <h4 className="text-lg font-bold text-health-primary uppercase tracking-wide text-xs">{tip.category} Advice</h4>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-lg">
                {tip.content}
            </p>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Start small. Even minor adjustments to your daily routine can yield significant long-term health benefits. 
                Remember to track your progress in the Health Hub to see how these changes affect your overall wellness score.
            </p>
            <div className="bg-slate-50 dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 mt-4">
                <h5 className="font-bold mb-3 text-sm flex items-center dark:text-white">
                  <CheckCircle2 className="w-4 h-4 mr-2 text-health-success" />
                  Key Takeaways
                </h5>
                <ul className="list-disc list-inside text-sm text-slate-600 dark:text-slate-400 space-y-2">
                    <li>Consistency is more important than intensity.</li>
                    <li>Listen to your body's signals and adjust accordingly.</li>
                    <li>Consult a professional for personalized advice.</li>
                </ul>
            </div>
            <Button className="w-full mt-4" onClick={() => setActiveModal(null)}>Got it</Button>
        </div>
      )
    });
  };

  const handleToolClick = (toolName: string) => {
    let content: React.ReactNode;

    switch(toolName) {
        case 'Symptom Checker':
            content = <SymptomChecker onClose={() => setActiveModal(null)} />;
            break;
        case 'Interaction Checker':
             content = <InteractionChecker onClose={() => setActiveModal(null)} />;
            break;
        case 'Urgent Care Finder':
             content = (
                <div className="space-y-4">
                    <div className="relative mb-4">
                         <MapPin className="absolute left-3 top-3.5 w-4 h-4 text-health-primary" />
                         <input type="text" defaultValue="Current Location" className="w-full pl-10 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white font-medium" />
                    </div>
                    <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                        {[
                            { name: 'CityMD Urgent Care', dist: '0.8 mi', time: 'Open until 8:00 PM', status: 'Open', color: 'text-green-600' },
                            { name: 'Northwell Health', dist: '1.2 mi', time: 'Open 24/7', status: 'Open', color: 'text-green-600' },
                            { name: 'GoHealth Urgent Care', dist: '2.5 mi', time: 'Closes at 10:00 PM', status: 'Closing Soon', color: 'text-orange-600' },
                            { name: 'Downtown Medical', dist: '3.1 mi', time: 'Closed', status: 'Closed', color: 'text-red-600' },
                        ].map((loc, i) => (
                            <div key={i} className="flex justify-between items-center p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:shadow-md transition-shadow">
                                <div>
                                    <p className="font-bold text-sm dark:text-white text-slate-900">{loc.name}</p>
                                    <p className="text-xs text-slate-500 mt-1">{loc.dist} • <span className={loc.color}>{loc.time}</span></p>
                                </div>
                                <Button size="sm" variant="outline" className="h-8 text-xs px-3">Directions</Button>
                            </div>
                        ))}
                    </div>
                </div>
            );
            break;
        case 'Health Forms':
             content = (
                <div className="space-y-3">
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">Download common forms to prepare for your visit.</p>
                    {[
                        { name: 'New Patient Intake Form', size: '1.2 MB' },
                        { name: 'Medical History Release', size: '850 KB' },
                        { name: 'HIPAA Consent Form', size: '420 KB' },
                        { name: 'Telehealth Authorization', size: '350 KB' }
                    ].map((form, i) => (
                        <div key={i} className="flex justify-between items-center p-4 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-white dark:hover:bg-slate-700 border border-slate-100 dark:border-slate-700 transition-all cursor-pointer group shadow-sm hover:shadow-md">
                            <div className="flex items-center space-x-4">
                                <div className="p-2 bg-white dark:bg-slate-900 rounded-lg text-health-primary">
                                  <FileText className="w-5 h-5" />
                                </div>
                                <div>
                                  <span className="block text-sm font-bold text-slate-700 dark:text-slate-200 group-hover:text-health-primary transition-colors">{form.name}</span>
                                  <span className="text-xs text-slate-400">{form.size} • PDF</span>
                                </div>
                            </div>
                            <Button size="sm" variant="ghost" icon={<Download className="w-4 h-4" />}>
                                Save
                            </Button>
                        </div>
                    ))}
                </div>
            );
            break;
        default:
            content = <p>Content coming soon.</p>;
    }

    setActiveModal({
      title: toolName,
      content: content
    });
  };

  const isServicesView = view === 'services';
  const isProductsView = view === 'products';
  const isEmergencyView = view === 'emergency';
  const isDefaultView = !view && !searchQuery;

  const filteredProducts = searchQuery 
  ? FEATURED_PRODUCTS.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
    )
  : FEATURED_PRODUCTS;

  return (
    <div className="space-y-16 pb-20">
      
      {/* 1. HERO CAROUSEL - Replaces static hero */}
      {isDefaultView && (
        <section className="relative overflow-hidden pt-6 lg:pt-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-br from-health-surface via-white to-teal-50 dark:from-slate-800 dark:via-slate-900 dark:to-slate-900 rounded-[2.5rem] relative border border-health-primary/10 dark:border-slate-700 shadow-sm overflow-hidden min-h-[500px] flex items-center">
              
              {/* Slides */}
              {slides.map((slide, index) => (
                <div 
                  key={slide.id}
                  className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                >
                  <div className="flex flex-col lg:flex-row h-full">
                    {/* Text Content (Left) */}
                    <div className="w-full lg:w-1/2 p-8 md:p-12 lg:p-16 flex flex-col justify-center relative z-20">
                       <div className="inline-flex items-center space-x-2 bg-white/60 dark:bg-slate-800/60 backdrop-blur rounded-full px-3 py-1 mb-6 border border-slate-100 dark:border-slate-700 w-fit">
                        <span className="text-xl">✨</span>
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{slide.welcome}</span>
                      </div>
                      
                      <h1 className="text-4xl lg:text-5xl font-serif font-bold text-health-text dark:text-white leading-tight mb-4">
                        {slide.title}
                      </h1>
                      
                      <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-lg">
                        {slide.desc}
                      </p>

                      <div className="flex flex-col sm:flex-row gap-4">
                        <Button size="lg" icon={slide.cta1.icon} onClick={slide.cta1.action}>
                          {slide.cta1.label}
                        </Button>
                        <Button 
                          size="lg" 
                          variant="outline" 
                          icon={slide.cta2.icon} 
                          className="dark:text-white dark:border-white dark:hover:bg-white/10"
                          onClick={slide.cta2.action}
                        >
                          {slide.cta2.label}
                        </Button>
                      </div>
                    </div>

                    {/* Image (Right) */}
                    <div className="w-full lg:w-1/2 h-full absolute lg:relative inset-0 lg:inset-auto z-0 lg:z-10">
                       <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-white via-white/80 to-transparent dark:from-slate-900 dark:via-slate-900/80 lg:w-1/2 z-10 lg:hidden"></div>
                       <img 
                         src={slide.image} 
                         alt="Slide" 
                         className="w-full h-full object-cover rounded-br-[2.5rem] rounded-bl-[2.5rem] lg:rounded-bl-none" 
                       />
                    </div>
                  </div>
                </div>
              ))}

              {/* Controls */}
              <button 
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur shadow-lg hover:scale-110 transition-transform text-health-primary"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button 
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur shadow-lg hover:scale-110 transition-transform text-health-primary"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
              
              {/* Dots */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex space-x-2">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${idx === currentSlide ? 'bg-health-primary w-8' : 'bg-slate-300 dark:bg-slate-600'}`}
                  />
                ))}
              </div>

            </div>
          </div>
        </section>
      )}

      {/* 2. HEALTH ASSESSMENT MODULE (New Section) */}
      {isDefaultView && <HealthAssessment />}

      {/* 3. QUICK ACCESS GRID - Only on default view */}
      {isDefaultView && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <h2 className="sr-only">Quick Access</h2>
           <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
             {quickAccessItems.map((item, index) => (
               <button 
                 key={index} 
                 className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:shadow-md hover:border-health-primary/30 transition-all group"
                 onClick={() => navigate(item.link)}
               >
                 <div className={`p-3 rounded-full mb-3 ${item.color} bg-opacity-10 group-hover:scale-110 transition-transform`}>
                   {item.icon}
                 </div>
                 <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 group-hover:text-health-primary">{item.label}</span>
               </button>
             ))}
           </div>
        </section>
      )}

      {/* 4. MAIN CONTENT GRID (Products or Services) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* EMERGENCY VIEW */}
        {isEmergencyView ? (
          <div className="animate-in fade-in slide-in-from-bottom-8">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900 rounded-3xl p-8 mb-8 text-center">
               <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
               <h1 className="text-3xl font-bold text-red-700 dark:text-red-400 mb-2">Emergency Resources</h1>
               <p className="text-red-600 dark:text-red-300 max-w-xl mx-auto">
                 If you are experiencing a life-threatening medical emergency, please call 911 or your local emergency number immediately.
               </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mr-4">
                      <Phone className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg dark:text-white">Emergency Services</h3>
                      <p className="text-slate-500">Police, Fire, Ambulance</p>
                    </div>
                  </div>
                  <a href="tel:911" className="bg-red-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-700 transition-colors">
                    Call 911
                  </a>
               </div>

               <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mr-4">
                      <Ambulance className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg dark:text-white">Poison Control</h3>
                      <p className="text-slate-500">24/7 Expert Help</p>
                    </div>
                  </div>
                  <a href="tel:18002221222" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors">
                    Call 1-800-222-1222
                  </a>
               </div>
            </div>

            <div className="mt-8 bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-100 dark:border-slate-700">
               <h3 className="font-bold text-xl mb-6 dark:text-white">Nearby Urgent Care Centers</h3>
               <div className="space-y-4">
                  {[
                      { name: 'CityMD Urgent Care', dist: '0.8 mi', time: 'Open until 8:00 PM', status: 'Open', color: 'text-green-600' },
                      { name: 'Northwell Health', dist: '1.2 mi', time: 'Open 24/7', status: 'Open', color: 'text-green-600' },
                      { name: 'GoHealth Urgent Care', dist: '2.5 mi', time: 'Closes at 10:00 PM', status: 'Closing Soon', color: 'text-orange-600' },
                  ].map((loc, i) => (
                      <div key={i} className="flex justify-between items-center p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                          <div>
                              <p className="font-bold text-lg dark:text-white text-slate-900">{loc.name}</p>
                              <p className="text-sm text-slate-500 mt-1">{loc.dist} • <span className={loc.color}>{loc.time}</span></p>
                          </div>
                          <Button size="sm" variant="outline">Get Directions</Button>
                      </div>
                  ))}
               </div>
            </div>
          </div>
        ) : (
        <>
        <div className="flex justify-between items-end mb-8">
          <div>
            {searchQuery ? (
               <div className="flex items-center space-x-4">
                 <h2 className="text-3xl font-serif font-bold text-health-text dark:text-white">
                   Results for "{searchQuery}"
                 </h2>
                 <Button variant="ghost" size="sm" onClick={() => setSearchParams({})} icon={<XCircle className="w-4 h-4"/>}>Clear</Button>
               </div>
            ) : isServicesView ? (
              <>
                 <span className="text-sm font-bold text-health-primary uppercase tracking-wider mb-2 block">Telehealth & In-Person</span>
                 <h2 className="text-3xl font-serif font-bold text-health-text dark:text-white">Our Specialists</h2>
              </>
            ) : isProductsView ? (
               <>
                 <span className="text-sm font-bold text-health-primary uppercase tracking-wider mb-2 block">Catalog</span>
                 <h2 className="text-3xl font-serif font-bold text-health-text dark:text-white">All Products</h2>
               </>
            ) : (
              <>
                 <span className="text-sm font-bold text-health-primary uppercase tracking-wider mb-2 block">AI Curated</span>
                 <h2 className="text-3xl font-serif font-bold text-health-text dark:text-white">
                   Personalized for You
                 </h2>
              </>
            )}
          </div>
          {!searchQuery && !view && (
             <button 
               onClick={() => navigate('/?view=products')}
               className="hidden sm:flex items-center text-health-primary font-medium hover:text-health-accent transition-colors"
             >
               View Full Catalog <ChevronRight className="w-4 h-4 ml-1" />
             </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* CONTENT COLUMN */}
          <div className="lg:col-span-2">
            
            {/* Case: Services View - Show Doctors Grid */}
            {isServicesView ? (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {AVAILABLE_DOCTORS.map(doctor => (
                   <div 
                     key={doctor.id} 
                     className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 hover:shadow-xl transition-all cursor-pointer group flex flex-col"
                     onClick={() => navigate(`/product/${doctor.id}`)}
                   >
                     <div className="flex items-start space-x-4 mb-4">
                       <img src={doctor.image} alt={doctor.name} className="w-16 h-16 rounded-2xl object-cover group-hover:scale-105 transition-transform" />
                       <div>
                         <h4 className="font-bold text-lg text-health-text dark:text-white group-hover:text-health-primary transition-colors">{doctor.name}</h4>
                         <p className="text-sm text-health-primary font-medium">{doctor.specialty}</p>
                         <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center">
                           <Users className="w-3 h-3 mr-1" /> 500+ Patients
                         </p>
                       </div>
                     </div>
                     <div className="mt-auto pt-4 border-t border-slate-50 dark:border-slate-700/50 flex justify-between items-center">
                       <span className={`text-xs px-2.5 py-1 rounded-full flex items-center ${doctor.availability.includes('Today') ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                         <Video className="w-3 h-3 mr-1" /> {doctor.availability}
                       </span>
                       <Button size="sm">Book Visit</Button>
                     </div>
                   </div>
                 ))}
               </div>
            ) : isDefaultView ? (
              /* Case: Personalized Dashboard View (AI Categories) */
              <div className="space-y-10">
                {isLoadingRecommendations ? (
                  <div className="space-y-6">
                     {[1,2,3].map(i => (
                       <div key={i} className="animate-pulse">
                         <div className="h-6 w-48 bg-slate-200 dark:bg-slate-700 rounded mb-4"></div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="h-48 bg-slate-100 dark:bg-slate-800 rounded-2xl"></div>
                            <div className="h-48 bg-slate-100 dark:bg-slate-800 rounded-2xl"></div>
                         </div>
                       </div>
                     ))}
                  </div>
                ) : (
                  recommendations.map((group) => {
                     // Get full product objects for this group
                     const groupProducts = FEATURED_PRODUCTS.filter(p => group.productIds.includes(p.id));
                     
                     if (groupProducts.length === 0) return null;

                     let Icon = Sparkles;
                     if (group.icon === 'trending') Icon = TrendingUp;
                     if (group.icon === 'shield') Icon = ShieldCheck;

                     return (
                       <div key={group.title} className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                          <div className="flex items-center mb-4">
                             <div className="p-2 bg-health-surface dark:bg-slate-800 rounded-lg mr-3 text-health-primary">
                               <Icon className="w-5 h-5" />
                             </div>
                             <div>
                               <h3 className="font-bold text-xl text-health-text dark:text-white">{group.title}</h3>
                               <p className="text-xs text-slate-500 dark:text-slate-400">{group.description}</p>
                             </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {groupProducts.map(product => (
                                <ProductCard key={product.id} product={product} />
                              ))}
                          </div>
                       </div>
                     );
                  })
                )}
                {/* Fallback/Generic if AI returns nothing useful */}
                {!isLoadingRecommendations && recommendations.length === 0 && (
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     {FEATURED_PRODUCTS.slice(0, 4).map(product => (
                       <ProductCard key={product.id} product={product} />
                     ))}
                   </div>
                )}
              </div>
            ) : (
              /* Case: Product View (Filtered or Full Catalog) */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {filteredProducts.length > 0 ? (
                   filteredProducts.map(product => (
                     <ProductCard key={product.id} product={product} />
                   ))
                 ) : (
                    <div className="col-span-2 text-center py-12 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                      <p className="text-slate-500">No products found for "{searchQuery}".</p>
                      <Button variant="ghost" className="mt-2" onClick={() => setSearchParams({})}>View all</Button>
                    </div>
                 )}
              </div>
            )}
          </div>

          {/* SIDEBAR COLUMN */}
          <div className="space-y-6">
             {/* If we are on Services view, show a generic Help card instead of doctor list */}
             {isServicesView ? (
               <div className="bg-health-surface dark:bg-slate-800 rounded-2xl p-6 border border-health-primary/20 sticky top-24">
                  <h4 className="font-bold text-health-text dark:text-white mb-2">How it works</h4>
                  <ul className="space-y-4 mb-6">
                    <li className="flex gap-3 text-sm text-slate-600 dark:text-slate-300">
                      <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-health-primary font-bold shadow-sm shrink-0">1</div>
                      Choose a specialist based on your needs.
                    </li>
                    <li className="flex gap-3 text-sm text-slate-600 dark:text-slate-300">
                      <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-health-primary font-bold shadow-sm shrink-0">2</div>
                      Book a time that works for you.
                    </li>
                    <li className="flex gap-3 text-sm text-slate-600 dark:text-slate-300">
                      <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-health-primary font-bold shadow-sm shrink-0">3</div>
                      Connect via secure video call.
                    </li>
                  </ul>
                  <Button size="sm" className="w-full" variant="outline">Learn More</Button>
               </div>
             ) : (
               /* Default Sidebar */
               <>
                 <h3 className="font-bold text-slate-900 dark:text-white flex items-center">
                   <Stethoscope className="w-5 h-5 mr-2 text-health-primary" />
                   Top-Rated Services
                 </h3>
                 {AVAILABLE_DOCTORS.slice(0, 2).map(doctor => (
                   <div 
                     key={doctor.id} 
                     className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 hover:shadow-md transition-all cursor-pointer group"
                     onClick={() => navigate(`/product/${doctor.id}`)}
                   >
                     <div className="flex items-center space-x-4 mb-3">
                       <img src={doctor.image} alt={doctor.name} className="w-12 h-12 rounded-full object-cover group-hover:ring-2 ring-health-primary transition-all" />
                       <div>
                         <h4 className="font-bold text-sm text-health-text dark:text-white group-hover:text-health-primary transition-colors">{doctor.name}</h4>
                         <p className="text-xs text-slate-500 dark:text-slate-400">{doctor.specialty}</p>
                       </div>
                     </div>
                     <div className="flex justify-between items-center text-xs">
                       <span className="flex items-center text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full">
                         <Video className="w-3 h-3 mr-1" /> {doctor.availability}
                       </span>
                       <Button 
                         size="sm" 
                         variant="outline" 
                         className="text-xs h-8"
                         onClick={(e) => {
                           e.stopPropagation();
                           navigate(`/product/${doctor.id}`);
                         }}
                       >
                         Book
                       </Button>
                     </div>
                   </div>
                 ))}
                 
                 <div className="bg-health-surface dark:bg-slate-800 rounded-2xl p-6 border border-health-primary/20">
                    <h4 className="font-bold text-health-text dark:text-white mb-2">Need a prescription?</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">Consult with a certified practitioner in minutes.</p>
                    <Button size="sm" className="w-full" onClick={handleConsultClick}>Start Telehealth Visit</Button>
                 </div>
               </>
             )}
          </div>
        </div>
        </>
        )}
      </section>

      {/* 5. HEALTH EDUCATION & TOOLS - Hide on specific views to reduce clutter */}
      {isDefaultView && (
        <section className="bg-slate-50 dark:bg-slate-900 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
               
               {/* Today's Tip */}
               <div>
                  <h2 className="text-2xl font-serif font-bold text-health-text dark:text-white mb-6">Today's Health Tip</h2>
                  {HEALTH_TIPS.map(tip => (
                    <div key={tip.id} className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 flex items-start space-x-4 mb-4 hover:border-health-primary/50 transition-colors">
                       <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-full text-health-accent">
                         {tip.icon === 'sun' ? <Zap className="w-6 h-6" /> : <Coffee className="w-6 h-6" />}
                       </div>
                       <div>
                         <span className="text-xs font-bold text-health-primary uppercase tracking-wide">{tip.category}</span>
                         <h3 className="font-bold text-lg text-health-text dark:text-white mt-1 mb-2">{tip.title}</h3>
                         <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-3">{tip.content}</p>
                         <button onClick={() => handleReadTip(tip)} className="text-health-primary text-sm font-medium hover:underline">Read More</button>
                       </div>
                    </div>
                  ))}
               </div>

               {/* Quick Tools */}
               <div>
                 <h2 className="text-2xl font-serif font-bold text-health-text dark:text-white mb-6">Quick Health Tools</h2>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button onClick={() => handleToolClick('Symptom Checker')} className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 hover:border-health-primary text-left transition-colors group">
                      <Activity className="w-8 h-8 text-health-primary mb-3 group-hover:scale-110 transition-transform" />
                      <h3 className="font-bold text-slate-800 dark:text-white">Symptom Checker</h3>
                      <p className="text-xs text-slate-500 mt-1">AI-powered analysis</p>
                    </button>
                    <button onClick={() => handleToolClick('Interaction Checker')} className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 hover:border-health-primary text-left transition-colors group">
                      <AlertCircle className="w-8 h-8 text-red-500 mb-3 group-hover:scale-110 transition-transform" />
                      <h3 className="font-bold text-slate-800 dark:text-white">Interaction Check</h3>
                      <p className="text-xs text-slate-500 mt-1">Drug safety tool</p>
                    </button>
                    <button onClick={() => handleToolClick('Urgent Care Finder')} className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 hover:border-health-primary text-left transition-colors group">
                      <Heart className="w-8 h-8 text-rose-500 mb-3 group-hover:scale-110 transition-transform" />
                      <h3 className="font-bold text-slate-800 dark:text-white">Find Urgent Care</h3>
                      <p className="text-xs text-slate-500 mt-1">Near your location</p>
                    </button>
                    <button onClick={() => handleToolClick('Health Forms')} className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 hover:border-health-primary text-left transition-colors group">
                      <FileText className="w-8 h-8 text-purple-500 mb-3 group-hover:scale-110 transition-transform" />
                      <h3 className="font-bold text-slate-800 dark:text-white">Health Forms</h3>
                      <p className="text-xs text-slate-500 mt-1">Download & print</p>
                    </button>
                 </div>
               </div>

             </div>
          </div>
        </section>
      )}
      
      {/* 6. TRUSTED BY SECTION (New) */}
      {isDefaultView && (
        <section className="bg-white dark:bg-slate-800 py-16 border-t border-slate-100 dark:border-slate-700">
           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
             <div className="text-center mb-12">
               <span className="text-health-primary font-bold tracking-wider uppercase text-sm">Community Stories</span>
               <h2 className="text-3xl font-serif font-bold text-health-text dark:text-white mt-2">Trusted by 2 Million+ People</h2>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  {
                    name: "Michael R.",
                    role: "Marathon Runner",
                    quote: "The personalized vitamin packs changed my recovery game completely. I feel stronger and more energetic.",
                    image: "https://randomuser.me/api/portraits/men/32.jpg"
                  },
                  {
                    name: "Sarah L.",
                    role: "New Mom",
                    quote: "Having instant access to a pediatrician via video chat saved us so many late-night trips to the ER.",
                    image: "https://randomuser.me/api/portraits/women/44.jpg"
                  },
                  {
                    name: "David K.",
                    role: "Managing Stress",
                    quote: "The Ashwagandha supplements recommended by the AI were spot on. My sleep score has improved by 20%.",
                    image: "https://randomuser.me/api/portraits/men/86.jpg"
                  }
                ].map((testimonial, i) => (
                  <div key={i} className="bg-slate-50 dark:bg-slate-900 p-8 rounded-3xl relative">
                    <Quote className="w-10 h-10 text-health-primary/20 absolute top-6 right-6" />
                    <div className="flex items-center mb-6">
                      <img src={testimonial.image} alt={testimonial.name} className="w-12 h-12 rounded-full mr-4" />
                      <div>
                        <h4 className="font-bold text-health-text dark:text-white">{testimonial.name}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{testimonial.role}</p>
                      </div>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 italic leading-relaxed">"{testimonial.quote}"</p>
                    <div className="flex text-yellow-400 mt-4">
                      {[...Array(5)].map((_, i) => <Sparkles key={i} className="w-4 h-4 fill-current" />)}
                    </div>
                  </div>
                ))}
             </div>
           </div>
        </section>
      )}

      {/* Render Modal if active */}
      {activeModal && (
        <InfoModal title={activeModal.title} onClose={() => setActiveModal(null)}>
          {activeModal.content}
        </InfoModal>
      )}
    </div>
  );
};
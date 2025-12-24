import React, { useState } from 'react';
import { Eye, ShieldCheck, HeartPulse, Phone, AlertTriangle, Mail, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';
import { Button } from './Button';

export const Footer: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [email, setEmail] = useState('');

  const handleNavigation = (path: string) => {
    navigate(path);
    window.scrollTo(0, 0);
  };

  const toggleHighContrast = () => {
    document.documentElement.classList.toggle('contrast-125');
    document.documentElement.classList.toggle('grayscale');
    const isHighContrast = document.documentElement.classList.contains('grayscale');
    addToast(isHighContrast ? "High Contrast Mode Enabled" : "High Contrast Mode Disabled", 'info');
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    addToast("Thanks for subscribing! Check your inbox for 10% off.", 'success');
    setEmail('');
  };

  return (
    <footer className="bg-slate-900 text-slate-300 mt-20">
      {/* Newsletter Section */}
      <div className="border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-gradient-to-r from-health-primary to-teal-800 rounded-3xl p-8 md:p-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full transform translate-x-1/2 -translate-y-1/2"></div>
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-serif font-bold text-white mb-2">Join the Wellness Circle</h3>
                <p className="text-teal-100">Get expert health tips, early access to new products, and exclusive offers delivered to your inbox.</p>
              </div>
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-grow">
                  <Mail className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full pl-12 pr-4 py-3 rounded-xl border-none focus:ring-2 focus:ring-white bg-white/10 text-white placeholder:text-teal-200/70 backdrop-blur-sm"
                  />
                </div>
                <Button variant="secondary" className="whitespace-nowrap" type="submit">
                  Subscribe
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <div className="col-span-1 md:col-span-1">
            <span className="font-serif font-bold text-xl text-white tracking-tight">
              Vita<span className="text-health-primary">Care</span>
            </span>
            <p className="mt-4 text-sm text-slate-400">
              Science-backed health solutions for a better you. Trusted by 2M+ users worldwide.
            </p>
            <div className="mt-6 flex items-center space-x-2 text-xs text-health-success">
              <ShieldCheck className="w-4 h-4" />
              <span>HIPAA Compliant</span>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Shop</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <button onClick={() => handleNavigation('/?view=products&q=Vitamins')} className="hover:text-white transition-colors text-left">
                  Vitamins & Supplements
                </button>
              </li>
              <li>
                <button onClick={() => handleNavigation('/?view=products&q=Devices')} className="hover:text-white transition-colors text-left">
                  Medical Devices
                </button>
              </li>
              <li>
                <button onClick={() => handleNavigation('/?view=products&q=Herbal')} className="hover:text-white transition-colors text-left">
                  Personal Care
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Services</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <button onClick={() => handleNavigation('/?view=services')} className="hover:text-white transition-colors text-left">
                  Doctor Consultation
                </button>
              </li>
              <li>
                <button onClick={() => handleNavigation('/?view=services&q=Lab')} className="hover:text-white transition-colors text-left">
                  Lab Testing
                </button>
              </li>
              <li>
                <button onClick={() => handleNavigation('/?view=services&q=Health')} className="hover:text-white transition-colors text-left">
                  Health Coaching
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Accessibility</h3>
            <ul className="space-y-3 text-sm">
               <li>
                 <button onClick={toggleHighContrast} className="flex items-center hover:text-white transition-colors text-left">
                   <Eye className="w-4 h-4 mr-2" />
                   High Contrast Mode
                 </button>
               </li>
               <li>
                 <button onClick={() => handleNavigation('/?view=emergency')} className="flex items-center hover:text-white transition-colors text-left text-red-400 hover:text-red-300">
                   <HeartPulse className="w-4 h-4 mr-2" />
                   Emergency Resources
                 </button>
               </li>
            </ul>
          </div>

        </div>
        <div className="mt-12 pt-8 border-t border-slate-800 text-center text-xs text-slate-500">
          <p>© 2024 VitaCare Marketplace. All rights reserved. Not medical advice.</p>
        </div>
      </div>
    </footer>
  );
};
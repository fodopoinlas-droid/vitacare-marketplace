import React, { useState, useEffect } from 'react';
import { ShoppingCart, Search, Menu, Mic, Moon, Sun, HeartPulse, X, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CURRENT_USER } from '../constants';
import { VoiceAssistant } from './VoiceAssistant';
import { useCart } from '../contexts/CartContext';
import { Button } from './Button';

export const Header: React.FC = () => {
  const [showVoiceSearch, setShowVoiceSearch] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { items, setIsCartOpen } = useCart();
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || 
        (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const handleNavClick = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const cartCount = items.length;

  // Submenu items configuration
  const menuItems = [
    {
      label: 'Home',
      path: '/',
      submenu: [
        { label: 'Personalized Gateway', path: '/' },
        { label: 'Quick Access', path: '/?section=quick-access' },
        { label: 'Todays Tip', path: '/?section=tips' }
      ]
    },
    {
      label: 'Products',
      path: '/?view=products',
      submenu: [
        { label: 'Shop All', path: '/?view=products' },
        { label: 'Vitamins & Supplements', path: '/?view=products&q=Vitamins' },
        { label: 'Medical Devices', path: '/?view=products&q=Devices' },
        { label: 'Skincare', path: '/?view=products&q=Skincare' }
      ]
    },
    {
      label: 'Services',
      path: '/?view=services',
      submenu: [
        { label: 'Find a Doctor', path: '/?view=services' },
        { label: 'Telehealth', path: '/?view=services&type=telehealth' },
        { label: 'In-Person Care', path: '/?view=services&type=in-person' }
      ]
    },
    {
      label: 'Health Hub',
      path: '/dashboard',
      submenu: [
        { label: 'My Dashboard', path: '/dashboard' },
        { label: 'Intake Logs', path: '/dashboard?tab=logs' },
        { label: 'Reports', path: '/dashboard?tab=reports' }
      ]
    }
  ];

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center cursor-pointer group" onClick={() => navigate('/')}>
              <div className="w-9 h-9 bg-health-primary rounded-xl flex items-center justify-center mr-2 shadow-sm group-hover:bg-teal-700 transition-colors">
                <HeartPulse className="w-5 h-5 text-white" />
              </div>
              <span className="font-serif font-bold text-xl text-health-text dark:text-white tracking-tight">
                Vita<span className="text-health-primary">Care</span>
              </span>
            </div>

            {/* Desktop Nav with Dropdowns */}
            <nav className="hidden md:flex space-x-2">
              {menuItems.map((item) => (
                <div key={item.label} className="relative group">
                  <button 
                    onClick={() => navigate(item.path)} 
                    className="flex items-center px-4 py-2 text-health-text dark:text-slate-200 hover:text-health-primary dark:hover:text-health-primary font-medium transition-colors rounded-lg group-hover:bg-slate-50 dark:group-hover:bg-slate-800/50"
                  >
                    {item.label}
                    <ChevronDown className="w-3 h-3 ml-1 opacity-50 group-hover:rotate-180 transition-transform duration-200" />
                  </button>
                  
                  {/* Dropdown Menu */}
                  <div className="absolute top-full left-0 w-48 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden py-1">
                      {item.submenu.map((sub) => (
                        <button
                          key={sub.label}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(sub.path);
                          }}
                          className="block w-full text-left px-4 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-health-surface dark:hover:bg-slate-700 hover:text-health-primary transition-colors"
                        >
                          {sub.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center space-x-2 lg:space-x-4">
              {/* Voice Search */}
              <div className="hidden lg:flex items-center bg-slate-100 dark:bg-slate-800 rounded-full px-4 py-1.5 border border-transparent focus-within:border-health-primary focus-within:ring-2 focus-within:ring-health-primary/20 transition-all">
                 <button 
                   onClick={() => setShowVoiceSearch(true)}
                   className="focus:outline-none"
                   aria-label="Start Voice Search"
                 >
                   <Mic className="w-4 h-4 text-health-primary mr-2 hover:scale-110 transition-transform cursor-pointer" />
                 </button>
                 <input 
                   type="text" 
                   placeholder="Search..." 
                   className="bg-transparent border-none outline-none text-sm w-32 xl:w-48 text-slate-600 dark:text-slate-300 placeholder:text-slate-400" 
                   onKeyDown={(e) => {
                     if (e.key === 'Enter') {
                       navigate(`/?q=${encodeURIComponent((e.target as HTMLInputElement).value)}`);
                     }
                   }}
                 />
              </div>

              {/* Mobile Search Icon */}
              <button className="p-2 text-health-muted dark:text-slate-400 lg:hidden" onClick={() => setShowVoiceSearch(true)}>
                <Search className="w-5 h-5" />
              </button>

              {/* Theme Toggle */}
              <button 
                onClick={toggleTheme}
                className="p-2 text-health-muted dark:text-slate-400 hover:text-health-primary dark:hover:text-health-primary transition-colors"
                aria-label="Toggle Dark Mode"
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {/* Cart */}
              <button 
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 text-health-muted dark:text-slate-400 hover:text-health-primary transition-colors"
              >
                <ShoppingCart className="w-6 h-6" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-health-accent text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white dark:border-slate-900 animate-in zoom-in">
                    {cartCount}
                  </span>
                )}
              </button>
              
              {/* Profile - Links to Login if not authenticated logic could be added, linking to Login Page for demo */}
              <button 
                onClick={() => navigate('/login')}
                className="hidden md:flex items-center space-x-2 pl-2 border-l border-slate-200 dark:border-slate-700"
              >
                <div className="w-8 h-8 rounded-full bg-health-surface dark:bg-slate-800 border border-health-primary flex items-center justify-center text-health-primary font-bold shadow-sm">
                  {CURRENT_USER.name[0]}
                </div>
                {CURRENT_USER.healthScore > 0 && (
                  <div className="flex flex-col items-start">
                    <span className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Health Score</span>
                    <span className="text-xs font-bold text-health-success">{CURRENT_USER.healthScore}</span>
                  </div>
                )}
              </button>

              {/* Mobile Menu Button */}
              <button 
                className="md:hidden p-2 text-health-text dark:text-white"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 w-full bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 shadow-lg animate-in slide-in-from-top-5 max-h-[80vh] overflow-y-auto">
            <div className="flex flex-col p-4 space-y-2">
              {menuItems.map(item => (
                <div key={item.label} className="border-b border-slate-50 dark:border-slate-800 pb-2 last:border-0">
                  <button onClick={() => handleNavClick(item.path)} className="text-left font-bold text-lg text-slate-800 dark:text-white py-2 w-full">
                    {item.label}
                  </button>
                  <div className="pl-4 space-y-2 flex flex-col">
                    {item.submenu.map(sub => (
                      <button 
                        key={sub.label} 
                        onClick={() => handleNavClick(sub.path)}
                        className="text-left text-sm text-slate-600 dark:text-slate-400 py-1"
                      >
                        {sub.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              <div className="pt-4 mt-2">
                <Button className="w-full justify-center" onClick={() => handleNavClick('/login')}>
                   Log In / Sign Up
                </Button>
              </div>
            </div>
          </div>
        )}
      </header>

      {showVoiceSearch && (
        <VoiceAssistant 
          onClose={() => setShowVoiceSearch(false)} 
          onSearch={(query) => {
             navigate(`/?q=${encodeURIComponent(query)}`);
          }}
        />
      )}
    </>
  );
};
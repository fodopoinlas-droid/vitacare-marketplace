import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { Dashboard } from './pages/Dashboard';
import { ProductDetail } from './pages/ProductDetail';
import { Login } from './pages/Login';
import { CartProvider } from './contexts/CartContext';
import { ToastProvider } from './contexts/ToastContext';
import { ReviewsProvider } from './contexts/ReviewsContext';
import { CartDrawer } from './components/CartDrawer';
import { Chatbot } from './components/Chatbot';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const App: React.FC = () => {
  return (
    <ToastProvider>
      <ReviewsProvider>
        <CartProvider>
          <HashRouter>
            <ScrollToTop />
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans flex flex-col transition-colors duration-300">
              <Header />
              <CartDrawer />
              
              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/product/:id" element={<ProductDetail />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>

              <Footer />
              <Chatbot />
            </div>
          </HashRouter>
        </CartProvider>
      </ReviewsProvider>
    </ToastProvider>
  );
};

export default App;
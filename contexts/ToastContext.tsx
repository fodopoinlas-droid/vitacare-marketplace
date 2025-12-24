import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  addToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[110] flex flex-col gap-3 pointer-events-none">
        {toasts.map(toast => (
          <div 
            key={toast.id}
            className={`pointer-events-auto flex items-center p-4 pr-12 rounded-xl shadow-lg border backdrop-blur-md animate-in slide-in-from-right-full duration-300 relative overflow-hidden max-w-sm ${
              toast.type === 'success' ? 'bg-white/95 border-green-200 text-green-800 dark:bg-slate-800/95 dark:border-green-900 dark:text-green-400' :
              toast.type === 'error' ? 'bg-white/95 border-red-200 text-red-800 dark:bg-slate-800/95 dark:border-red-900 dark:text-red-400' :
              'bg-white/95 border-slate-200 text-slate-800 dark:bg-slate-800/95 dark:border-slate-700 dark:text-slate-100'
            }`}
          >
            <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
               toast.type === 'success' ? 'bg-green-500' :
               toast.type === 'error' ? 'bg-red-500' :
               'bg-blue-500'
            }`}></div>
            
            {toast.type === 'success' && <CheckCircle className="w-5 h-5 mr-3 shrink-0" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 mr-3 shrink-0" />}
            {toast.type === 'info' && <Info className="w-5 h-5 mr-3 shrink-0 text-blue-500" />}
            
            <span className="text-sm font-medium leading-tight">{toast.message}</span>
            
            <button 
              onClick={() => removeToast(toast.id)} 
              className="absolute top-2 right-2 p-1 rounded-full opacity-50 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};
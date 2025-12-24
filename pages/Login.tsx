import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HeartPulse, Lock, Mail, ArrowRight } from 'lucide-react';
import { Button } from '../components/Button';
import { HealthAssessment } from '../components/HealthAssessment';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [stage, setStage] = useState<'login' | 'assessment'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setStage('assessment');
    }, 1000);
  };

  const handleFinish = () => {
    navigate('/');
  };

  if (stage === 'assessment') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
         <div className="w-full max-w-2xl animate-in slide-in-from-bottom-8 duration-700">
           <div className="text-center mb-8">
             <h1 className="font-serif text-3xl font-bold text-health-text dark:text-white mb-2">Welcome Back, Sarah!</h1>
             <p className="text-slate-600 dark:text-slate-400">Before we head to your dashboard, let's update your health preferences for better recommendations.</p>
           </div>
           
           <HealthAssessment 
              isStandalone={true} 
              onComplete={handleFinish} 
              onSkip={handleFinish} 
           />
         </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl w-full max-w-md p-8 border border-slate-100 dark:border-slate-800 animate-in fade-in zoom-in duration-500">
        
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-health-primary rounded-2xl mb-4 shadow-lg shadow-health-primary/30">
             <HeartPulse className="w-6 h-6 text-white" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-health-text dark:text-white">Sign in to VitaCare</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Access your personalized health hub</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-health-primary focus:border-transparent outline-none transition-all"
                  required 
                />
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1 ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-health-primary focus:border-transparent outline-none transition-all"
                  required 
                />
              </div>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full py-4 text-lg" 
            disabled={isLoading}
            icon={!isLoading ? <ArrowRight className="w-5 h-5" /> : undefined}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>

          <div className="text-center">
            <a href="#" className="text-sm text-health-primary hover:underline">Forgot password?</a>
          </div>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
          <p className="text-sm text-slate-500">Don't have an account? <a href="#" className="font-bold text-health-text dark:text-white hover:text-health-primary">Create one</a></p>
        </div>
      </div>
    </div>
  );
};
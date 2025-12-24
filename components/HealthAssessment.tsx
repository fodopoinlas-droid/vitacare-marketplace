import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, Sparkles, Activity, ThumbsUp, Heart, Zap, Moon, Shield, SkipForward } from 'lucide-react';
import { Button } from './Button';
import { useNavigate } from 'react-router-dom';

interface HealthAssessmentProps {
  isStandalone?: boolean;
  onComplete?: () => void;
  onSkip?: () => void;
}

export const HealthAssessment: React.FC<HealthAssessmentProps> = ({ 
  isStandalone = false, 
  onComplete, 
  onSkip 
}) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [isExpanded, setIsExpanded] = useState(isStandalone); // Always expanded if standalone
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<string | null>(null);

  const questions = [
    {
      id: 'energy',
      question: "How are you feeling today?",
      options: [
        { label: "Energized", icon: <Zap className="w-5 h-5" />, color: "text-yellow-600 bg-yellow-50" },
        { label: "Tired", icon: <Moon className="w-5 h-5" />, color: "text-indigo-600 bg-indigo-50" },
        { label: "Stressed", icon: <Activity className="w-5 h-5" />, color: "text-red-600 bg-red-50" },
        { label: "Balanced", icon: <Heart className="w-5 h-5" />, color: "text-green-600 bg-green-50" }
      ],
      encouragement: "Acknowledging how you feel is the first step! 🌱"
    },
    {
      id: 'goal',
      question: "What's your main health focus right now?",
      options: [
        { label: "Immunity", icon: <Shield className="w-5 h-5" />, color: "text-blue-600 bg-blue-50" },
        { label: "Sleep", icon: <Moon className="w-5 h-5" />, color: "text-indigo-600 bg-indigo-50" },
        { label: "Energy", icon: <Zap className="w-5 h-5" />, color: "text-orange-600 bg-orange-50" },
        { label: "Stress", icon: <Sparkles className="w-5 h-5" />, color: "text-purple-600 bg-purple-50" }
      ],
      encouragement: "Great choice. Focusing on one thing helps you succeed! 🎯"
    }
  ];

  const handleSelect = (questionId: string, value: string, encouragement: string) => {
    // 1. Haptic Feedback
    if (navigator.vibrate) {
      navigator.vibrate(15);
    }

    // 2. Save Selection
    setSelections(prev => ({ ...prev, [questionId]: value }));

    // 3. Show Feedback (Micro-copy)
    setFeedback(encouragement);

    // 4. Progressive Disclosure Logic
    setTimeout(() => {
      setFeedback(null);
      if (step < questions.length - 1) {
        setStep(prev => prev + 1);
        if (!isExpanded && !isStandalone) setIsExpanded(true); 
      } else {
        setStep(prev => prev + 1); // Move to completion
      }
    }, 1200);
  };

  const currentQ = questions[step];

  if (step >= questions.length) {
    return (
      <div className={`mx-auto ${isStandalone ? 'max-w-xl' : 'max-w-4xl -mt-8 mb-12'} relative z-20`}>
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-xl border border-health-success/20 animate-in zoom-in duration-500 text-center relative overflow-hidden">
          {/* Confetti / Success Decoration */}
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-health-success to-teal-400"></div>
          
          <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4 text-health-success animate-bounce">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          
          <h3 className="font-serif font-bold text-2xl text-health-text dark:text-white mb-2">
            Profile Updated!
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-lg mx-auto">
            We've personalized your product grid based on your focus on <span className="font-bold text-health-primary">{selections['goal']}</span> and current mood.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button onClick={() => onComplete ? onComplete() : navigate('/?view=products')}>
              {isStandalone ? 'Go to Dashboard' : 'View Recommendations'}
            </Button>
            {!isStandalone && (
              <Button variant="outline" onClick={() => setStep(0)}>
                Retake Assessment
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`mx-auto ${isStandalone ? 'max-w-xl' : 'max-w-4xl -mt-8 mb-12'} relative z-20`}>
      <div className={`bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700 transition-all duration-500 overflow-hidden ${isExpanded || isStandalone ? 'p-8' : 'p-6'}`}>
        
        {/* Header / Progress */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-health-primary/10 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-health-primary" />
            </div>
            <span className="text-sm font-bold text-health-primary uppercase tracking-wide">
              {isStandalone ? 'Customize Your Experience' : 'Quick Health Check'}
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex space-x-1">
              {questions.map((_, idx) => (
                <div 
                  key={idx} 
                  className={`h-1.5 rounded-full transition-all duration-300 ${idx === step ? 'w-8 bg-health-primary' : idx < step ? 'w-2 bg-health-success' : 'w-2 bg-slate-200 dark:bg-slate-700'}`}
                />
              ))}
            </div>
            {onSkip && (
               <button onClick={onSkip} className="text-xs text-slate-400 hover:text-health-primary flex items-center">
                 Skip <SkipForward className="w-3 h-3 ml-1" />
               </button>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="relative min-h-[180px]">
          {feedback ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300 text-center">
              <ThumbsUp className="w-12 h-12 text-health-accent mb-4 animate-bounce" />
              <h4 className="text-xl font-serif font-bold text-health-text dark:text-white mb-2">
                {feedback}
              </h4>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Updating preferences...</p>
            </div>
          ) : (
            <div className="animate-in slide-in-from-right duration-300">
              <h3 className="font-serif text-2xl font-bold text-health-text dark:text-white mb-8 text-center sm:text-left">
                {currentQ.question}
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {currentQ.options.map((opt) => (
                  <button
                    key={opt.label}
                    onClick={() => handleSelect(currentQ.id, opt.label, currentQ.encouragement)}
                    className="flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-slate-100 dark:border-slate-700 hover:border-health-primary dark:hover:border-health-primary bg-slate-50 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-800 transition-all duration-200 group relative overflow-hidden"
                  >
                    <div className={`p-3 rounded-full mb-3 transition-transform group-hover:scale-110 duration-300 ${opt.color}`}>
                      {opt.icon}
                    </div>
                    <span className="font-medium text-slate-700 dark:text-slate-200 group-hover:text-health-primary transition-colors">
                      {opt.label}
                    </span>
                    {/* Ripple effect background on hover */}
                    <div className="absolute inset-0 bg-health-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer info (only visible if not engaged yet or expanded) */}
        {!isExpanded && !isStandalone && step === 0 && (
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
             <p className="text-xs text-slate-400">
               Takes less than 30 seconds • Helps AI personalize your results
             </p>
          </div>
        )}
      </div>
    </div>
  );
};
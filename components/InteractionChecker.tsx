import React, { useState } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { Pill, AlertTriangle, Plus, X, Search, CheckCircle, Loader2, Info } from 'lucide-react';
import { Button } from './Button';

interface InteractionCheckerProps {
  onClose: () => void;
}

interface InteractionResult {
  hasInteractions: boolean;
  severityLevel: 'None' | 'Low' | 'Moderate' | 'Severe';
  summary: string;
  interactions: {
    items: string;
    severity: 'Low' | 'Moderate' | 'Severe';
    effect: string;
  }[];
}

export const InteractionChecker: React.FC<InteractionCheckerProps> = ({ onClose }) => {
  const [items, setItems] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<InteractionResult | null>(null);

  const handleAddItem = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (inputValue.trim() && !items.includes(inputValue.trim())) {
      setItems(prev => [...prev, inputValue.trim()]);
      setInputValue('');
      setResult(null); // Reset result on change
    }
  };

  const handleRemoveItem = (itemToRemove: string) => {
    setItems(prev => prev.filter(item => item !== itemToRemove));
    setResult(null); // Reset result on change
  };

  const handleCheck = async () => {
    if (items.length < 2) return;

    setIsLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-preview-09-2025',
        contents: `Analyze potential drug interactions between the following list of medications and supplements: ${items.join(', ')}.
        
        Return a JSON object with:
        1. hasInteractions (boolean)
        2. severityLevel (None, Low, Moderate, Severe)
        3. summary (brief overview for the patient)
        4. interactions (array of objects with fields: items (names involved), severity (Low/Moderate/Severe), effect (what happens))
        
        Be conservative and prioritize safety.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              hasInteractions: { type: Type.BOOLEAN },
              severityLevel: { type: Type.STRING, enum: ['None', 'Low', 'Moderate', 'Severe'] },
              summary: { type: Type.STRING },
              interactions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    items: { type: Type.STRING },
                    severity: { type: Type.STRING, enum: ['Low', 'Moderate', 'Severe'] },
                    effect: { type: Type.STRING }
                  },
                  required: ['items', 'severity', 'effect']
                }
              }
            },
            required: ['hasInteractions', 'severityLevel', 'summary', 'interactions']
          }
        }
      });

      if (response.text) {
        setResult(JSON.parse(response.text));
      }
    } catch (error) {
      console.error("Interaction check failed", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {!result ? (
        <>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-xl flex items-start space-x-3 border border-yellow-100 dark:border-yellow-900/30">
            <Info className="w-5 h-5 text-yellow-600 shrink-0" />
            <p className="text-sm text-yellow-700 dark:text-yellow-400 leading-relaxed">
              Add at least two medications or supplements to check for potential interactions.
            </p>
          </div>

          <form onSubmit={handleAddItem} className="relative">
            <Search className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="e.g., Lisinopril, Ibuprofen, Vitamin D" 
              className="w-full pl-10 pr-12 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-health-primary outline-none transition-all"
            />
            <button 
              type="submit"
              disabled={!inputValue.trim()}
              className="absolute right-2 top-2 p-1.5 bg-health-primary text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </form>

          <div className="flex flex-wrap gap-2 min-h-[40px]">
            {items.map((item, idx) => (
              <span key={idx} className="inline-flex items-center px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-medium border border-slate-200 dark:border-slate-700 animate-in zoom-in duration-200">
                <Pill className="w-3 h-3 mr-2 text-health-primary" />
                {item}
                <button onClick={() => handleRemoveItem(item)} className="ml-2 hover:text-red-500">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>

          <Button 
            className="w-full" 
            size="lg" 
            onClick={handleCheck} 
            disabled={items.length < 2 || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Checking Safety...
              </>
            ) : (
              'Check Interactions'
            )}
          </Button>
        </>
      ) : (
        <div className="animate-in slide-in-from-right duration-300">
          <div className={`p-6 rounded-2xl mb-6 text-center ${
            result.hasInteractions 
              ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900' 
              : 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900'
          }`}>
            {result.hasInteractions ? (
              <div className="flex flex-col items-center text-red-700 dark:text-red-300">
                <AlertTriangle className="w-12 h-12 mb-3" />
                <h3 className="text-xl font-bold mb-1">Interactions Found</h3>
                <span className="px-3 py-1 bg-red-100 dark:bg-red-900/40 rounded-full text-xs font-bold uppercase mt-2">
                  {result.severityLevel} Severity
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center text-green-700 dark:text-green-300">
                <CheckCircle className="w-12 h-12 mb-3" />
                <h3 className="text-xl font-bold">No Interactions Found</h3>
                <p className="text-sm mt-2 opacity-90">Based on current medical data.</p>
              </div>
            )}
          </div>

          {result.hasInteractions && (
            <div className="space-y-4 mb-6">
              <p className="text-sm text-slate-600 dark:text-slate-300">{result.summary}</p>
              <div className="space-y-3">
                {result.interactions.map((interaction, idx) => (
                  <div key={idx} className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold text-slate-800 dark:text-white text-sm">{interaction.items}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                        interaction.severity === 'Severe' ? 'bg-red-100 text-red-700' :
                        interaction.severity === 'Moderate' ? 'bg-orange-100 text-orange-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>{interaction.severity}</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{interaction.effect}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Button variant="outline" className="w-full" onClick={() => setResult(null)}>
            Check Another Combination
          </Button>
          
          <p className="text-[10px] text-slate-400 text-center mt-4">
            This tool does not replace professional medical advice. Always consult your doctor or pharmacist.
          </p>
        </div>
      )}
    </div>
  );
};
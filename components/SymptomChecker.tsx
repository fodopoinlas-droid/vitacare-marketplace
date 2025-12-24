import React, { useState } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { 
  Activity, AlertCircle, CheckCircle, Loader2, Stethoscope, 
  AlertTriangle, ChevronRight, RefreshCw, User, Thermometer, 
  Brain, HeartPulse, Pill 
} from 'lucide-react';
import { Button } from './Button';
import { useNavigate } from 'react-router-dom';

interface SymptomCheckerProps {
  onClose: () => void;
}

interface Condition {
  name: string;
  likelihood: string;
  description: string;
}

interface AnalysisResult {
  urgency: 'Low' | 'Moderate' | 'High' | 'Emergency';
  summary: string;
  potentialConditions: Condition[];
  recommendedSpecialist: string;
  specialistReasoning: string;
  redFlags: string[];
  careSteps: string[];
}

export const SymptomChecker: React.FC<SymptomCheckerProps> = ({ onClose }) => {
  const navigate = useNavigate();
  const [symptoms, setSymptoms] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const commonSymptoms = [
    'Headache', 'Fever', 'Fatigue', 'Nausea', 
    'Cough', 'Sore Throat', 'Dizziness', 'Muscle Pain',
    'Anxiety', 'Insomnia', 'Rash', 'Joint Pain'
  ];

  const handleTagToggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(prev => prev.filter(t => t !== tag));
    } else {
      setSelectedTags(prev => [...prev, tag]);
    }
  };

  const handleAnalyze = async () => {
    const allSymptoms = [...selectedTags, symptoms].filter(Boolean).join(', ');
    if (!allSymptoms) return;

    setIsLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-preview-09-2025',
        contents: `You are an advanced medical triage AI. Analyze the following user symptoms: "${allSymptoms}".

        Provide a detailed JSON response with:
        1. urgency: 'Low', 'Moderate', 'High', or 'Emergency'.
        2. summary: A 2-sentence empathy-driven summary of the situation.
        3. potentialConditions: An array of 3 possible causes. Each must have a 'name', 'likelihood' (High/Med/Low), and a 1-sentence 'description'.
        4. recommendedSpecialist: The specific type of doctor they should see (e.g., "Dermatologist", "Neurologist", "General Practitioner").
        5. specialistReasoning: Why this specialist is the right choice.
        6. redFlags: An array of strings listing specific symptoms that, if present, require immediate ER attention (e.g., "Trouble breathing", "Sudden vision loss").
        7. careSteps: An array of 3-4 immediate actionable steps (home care or medical preparation).

        Disclaimer: You are an AI. Do not diagnose.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              urgency: { type: Type.STRING, enum: ['Low', 'Moderate', 'High', 'Emergency'] },
              summary: { type: Type.STRING },
              potentialConditions: { 
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    likelihood: { type: Type.STRING },
                    description: { type: Type.STRING }
                  },
                  required: ['name', 'likelihood', 'description']
                }
              },
              recommendedSpecialist: { type: Type.STRING },
              specialistReasoning: { type: Type.STRING },
              redFlags: { type: Type.ARRAY, items: { type: Type.STRING } },
              careSteps: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ['urgency', 'summary', 'potentialConditions', 'recommendedSpecialist', 'specialistReasoning', 'redFlags', 'careSteps']
          }
        }
      });

      if (response.text) {
        setResult(JSON.parse(response.text));
      }
    } catch (error) {
      console.error("Symptom check failed", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (result) {
    const isEmergency = result.urgency === 'Emergency' || result.urgency === 'High';

    return (
      <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
        {/* Urgency Header */}
        <div className={`p-5 rounded-2xl border-l-8 shadow-sm ${
          result.urgency === 'Emergency' ? 'bg-red-50 border-red-600 text-red-900 dark:bg-red-900/20 dark:text-red-100' :
          result.urgency === 'High' ? 'bg-orange-50 border-orange-500 text-orange-900 dark:bg-orange-900/20 dark:text-orange-100' :
          result.urgency === 'Moderate' ? 'bg-yellow-50 border-yellow-500 text-yellow-900 dark:bg-yellow-900/20 dark:text-yellow-100' :
          'bg-green-50 border-green-500 text-green-900 dark:bg-green-900/20 dark:text-green-100'
        }`}>
          <div className="flex items-start">
            <div className={`p-2 rounded-full mr-3 shrink-0 ${
               result.urgency === 'Emergency' ? 'bg-red-200 text-red-700' :
               result.urgency === 'High' ? 'bg-orange-200 text-orange-700' :
               'bg-white/50'
            }`}>
               {isEmergency ? <AlertTriangle className="w-6 h-6" /> : <Activity className="w-6 h-6" />}
            </div>
            <div>
              <h4 className="font-bold text-xl mb-1 uppercase tracking-wide">Analysis: {result.urgency}</h4>
              <p className="text-sm opacity-90 leading-relaxed">{result.summary}</p>
            </div>
          </div>
        </div>

        {/* Specialist Recommendation */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col md:flex-row gap-5 items-center">
            <div className="flex-1">
                <h5 className="text-xs font-bold text-slate-500 uppercase mb-1">Recommended Specialist</h5>
                <div className="flex items-center text-health-primary text-xl font-bold mb-2">
                    <User className="w-6 h-6 mr-2" />
                    {result.recommendedSpecialist}
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300">{result.specialistReasoning}</p>
            </div>
            <Button 
                onClick={() => { onClose(); navigate(`/?view=services&q=${encodeURIComponent(result.recommendedSpecialist)}`); }}
                className="w-full md:w-auto whitespace-nowrap"
            >
                Find {result.recommendedSpecialist}
            </Button>
        </div>

        {/* Detailed Conditions */}
        <div>
           <h5 className="font-bold text-health-text dark:text-white mb-3 flex items-center">
              <Stethoscope className="w-4 h-4 mr-2 text-health-primary" /> Potential Causes
           </h5>
           <div className="space-y-3">
             {result.potentialConditions.map((condition, idx) => (
               <div key={idx} className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-bold text-slate-800 dark:text-white">{condition.name}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        condition.likelihood === 'High' ? 'bg-orange-100 text-orange-700' : 'bg-slate-200 text-slate-600'
                    }`}>
                        {condition.likelihood} Probability
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{condition.description}</p>
               </div>
             ))}
           </div>
        </div>

        {/* Action Plan & Red Flags */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <h5 className="font-bold text-health-text dark:text-white mb-3 flex items-center">
                   <CheckCircle className="w-4 h-4 mr-2 text-health-success" /> Immediate Steps
                </h5>
                <ul className="space-y-2">
                  {result.careSteps.map((step, idx) => (
                    <li key={idx} className="flex items-start text-sm text-slate-600 dark:text-slate-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-health-success mt-1.5 mr-2 shrink-0"></span>
                      {step}
                    </li>
                  ))}
                </ul>
            </div>
            
            {result.redFlags.length > 0 && (
                <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-xl border border-red-100 dark:border-red-900/30">
                    <h5 className="font-bold text-red-700 dark:text-red-400 mb-2 flex items-center text-sm">
                       <AlertCircle className="w-4 h-4 mr-2" /> Watch for (Red Flags)
                    </h5>
                    <ul className="space-y-1">
                      {result.redFlags.map((flag, idx) => (
                        <li key={idx} className="text-xs text-red-600 dark:text-red-300 flex items-start">
                           <span className="mr-2 text-red-400">⚠</span> {flag}
                        </li>
                      ))}
                    </ul>
                    <p className="text-[10px] text-red-500 mt-3 font-medium">If any of these occur, go to ER immediately.</p>
                </div>
            )}
        </div>

        <div className="flex flex-col gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button variant="outline" className="w-full" onClick={() => setResult(null)}>
            <RefreshCw className="w-4 h-4 mr-2" /> Check Different Symptoms
          </Button>
        </div>
        
        <p className="text-[10px] text-slate-400 text-center">
          This AI analysis is for informational purposes only and does not constitute a medical diagnosis. 
          Always consult with a qualified healthcare professional.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-5 rounded-2xl flex items-start space-x-4">
        <div className="bg-white dark:bg-slate-800 p-2 rounded-full text-blue-600 shadow-sm">
            <Brain className="w-6 h-6" />
        </div>
        <div>
            <h4 className="font-bold text-blue-900 dark:text-blue-100 text-sm mb-1">AI Health Assistant</h4>
            <p className="text-xs text-blue-800 dark:text-blue-200 leading-relaxed">
                Describe your symptoms in detail. I will analyze potential causes, recommend the right specialist, and suggest immediate care steps.
            </p>
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold uppercase text-slate-500 mb-3 flex items-center">
            <Thermometer className="w-3 h-3 mr-1" /> Common Symptoms
        </label>
        <div className="flex flex-wrap gap-2">
          {commonSymptoms.map(sym => (
            <button
              key={sym}
              onClick={() => handleTagToggle(sym)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 ${
                selectedTags.includes(sym)
                  ? 'bg-health-primary text-white border-health-primary shadow-md transform scale-105'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-health-primary hover:text-health-primary'
              }`}
            >
              {sym}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold uppercase text-slate-500 mb-2 flex items-center">
            <Activity className="w-3 h-3 mr-1" /> Detailed Description
        </label>
        <textarea
          value={symptoms}
          onChange={(e) => setSymptoms(e.target.value)}
          placeholder="e.g., I have a sharp pain in my lower back that gets worse when I bend over. It started 2 days ago after lifting a box..."
          className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-health-primary outline-none transition-all min-h-[120px] text-sm resize-none"
        />
      </div>

      <div className="pt-2">
          <Button 
            className="w-full shadow-lg shadow-health-primary/20" 
            size="lg" 
            onClick={handleAnalyze} 
            disabled={isLoading || (!symptoms && selectedTags.length === 0)}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Analyzing Symptoms...
              </>
            ) : (
              <span className="flex items-center">
                 Run Analysis <ChevronRight className="w-4 h-4 ml-2" />
              </span>
            )}
          </Button>
          <p className="text-[10px] text-slate-400 text-center mt-3 flex items-center justify-center">
             <HeartPulse className="w-3 h-3 mr-1" /> Powered by Gemini Medical AI Model
          </p>
      </div>
    </div>
  );
};
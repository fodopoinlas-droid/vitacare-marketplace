import React, { useEffect, useRef, useState } from 'react';
import { FunctionDeclaration, GoogleGenAI, LiveServerMessage, Modality, Type } from '@google/genai';
import { X, Mic, Loader2, Volume2, MicOff, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from './Button';

interface VoiceAssistantProps {
  onClose: () => void;
  onSearch: (query: string) => void;
}

interface TranscriptItem {
  role: 'user' | 'model';
  text: string;
}

const searchProductsDeclaration: FunctionDeclaration = {
  name: 'searchProducts',
  parameters: {
    type: Type.OBJECT,
    description: 'Search for health products, vitamins, or supplements in the catalog.',
    properties: {
      query: {
        type: Type.STRING,
        description: 'The search keywords provided by the user, e.g. "vitamin c", "sleep aid".',
      },
    },
    required: ['query'],
  },
};

export const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ onClose, onSearch }) => {
  const [status, setStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(true);
  const [transcript, setTranscript] = useState<TranscriptItem[]>([]);
  const [showTranscript, setShowTranscript] = useState(false);

  // Audio refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const audioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const sessionRef = useRef<Promise<any> | null>(null);

  // Transcription accumulation refs
  const currentInputRef = useRef('');
  const currentOutputRef = useRef('');
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showTranscript && transcriptEndRef.current) {
      transcriptEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [transcript, showTranscript]);

  useEffect(() => {
    let mounted = true;

    const startSession = async () => {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        // Setup Audio Contexts
        inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        
        // Get User Media
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;

        // Connect to Gemini Live
        const sessionPromise = ai.live.connect({
          model: 'gemini-2.5-flash-native-audio-preview-09-2025',
          config: {
            responseModalities: [Modality.AUDIO],
            inputAudioTranscription: {},
            outputAudioTranscription: {},
            tools: [{ functionDeclarations: [searchProductsDeclaration] }],
            systemInstruction: "You are a helpful, empathetic health assistant for VitaCare Marketplace. Help users find vitamins, supplements, and doctors. If the user asks to find or search for a product, use the searchProducts tool. Keep responses concise and friendly. If asked about medical advice, provide general wellness info but always recommend seeing a doctor.",
            speechConfig: {
              voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
            },
          },
          callbacks: {
            onopen: () => {
              if (mounted) setStatus('connected');
              
              // Start Input Streaming
              if (!inputAudioContextRef.current || !streamRef.current) return;
              
              const source = inputAudioContextRef.current.createMediaStreamSource(streamRef.current);
              sourceRef.current = source;
              
              const processor = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);
              processorRef.current = processor;
              
              processor.onaudioprocess = (e) => {
                const inputData = e.inputBuffer.getChannelData(0);
                const pcmData = floatTo16BitPCM(inputData);
                const base64Data = arrayBufferToBase64(pcmData);
                
                sessionPromise.then(session => {
                  session.sendRealtimeInput({
                    media: {
                      mimeType: 'audio/pcm;rate=16000',
                      data: base64Data
                    }
                  });
                });
              };

              source.connect(processor);
              processor.connect(inputAudioContextRef.current.destination);
            },
            onmessage: async (message: LiveServerMessage) => {
              if (!mounted) return;

              // Handle Tool Calls
              if (message.toolCall) {
                for (const fc of message.toolCall.functionCalls) {
                  if (fc.name === 'searchProducts') {
                    const query = (fc.args as any).query;
                    onSearch(query);
                    
                    // Respond to model
                    sessionPromise.then(session => {
                      session.sendToolResponse({
                        functionResponses: {
                          id: fc.id,
                          name: fc.name,
                          response: { result: `Executed search for "${query}". The results are now visible on the screen.` }
                        }
                      });
                    });
                  }
                }
              }

              // Handle Transcription
              if (message.serverContent?.outputTranscription) {
                currentOutputRef.current += message.serverContent.outputTranscription.text;
              }
              if (message.serverContent?.inputTranscription) {
                currentInputRef.current += message.serverContent.inputTranscription.text;
              }
              if (message.serverContent?.turnComplete) {
                const userText = currentInputRef.current.trim();
                const modelText = currentOutputRef.current.trim();
                
                if (userText || modelText) {
                  setTranscript(prev => {
                    const newItems: TranscriptItem[] = [];
                    if (userText) newItems.push({ role: 'user', text: userText });
                    if (modelText) newItems.push({ role: 'model', text: modelText });
                    return [...prev, ...newItems];
                  });
                }
                currentInputRef.current = '';
                currentOutputRef.current = '';
              }

              // Handle Audio Output
              if (audioContextRef.current) {
                const audioData = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                if (audioData) {
                  setIsSpeaking(true);
                  setIsListening(false);
                  const ctx = audioContextRef.current;
                  const audioBuffer = await decodeAudioData(base64ToArrayBuffer(audioData), ctx);
                  
                  const source = ctx.createBufferSource();
                  source.buffer = audioBuffer;
                  source.connect(ctx.destination);
                  
                  const now = ctx.currentTime;
                  const startTime = Math.max(now, nextStartTimeRef.current);
                  source.start(startTime);
                  nextStartTimeRef.current = startTime + audioBuffer.duration;
                  
                  audioSourcesRef.current.add(source);
                  
                  source.onended = () => {
                    audioSourcesRef.current.delete(source);
                    if (audioSourcesRef.current.size === 0 && mounted) {
                      setIsSpeaking(false);
                      setIsListening(true);
                    }
                  };
                }
              }

              // Handle Interruption
              if (message.serverContent?.interrupted) {
                audioSourcesRef.current.forEach(src => {
                  try { src.stop(); } catch (e) {}
                });
                audioSourcesRef.current.clear();
                nextStartTimeRef.current = 0;
                if (mounted) {
                  setIsSpeaking(false);
                  setIsListening(true);
                }
              }
            },
            onclose: () => {
              if (mounted) setStatus('error');
            },
            onerror: (err) => {
              console.error(err);
              if (mounted) setStatus('error');
            }
          }
        });
        
        sessionRef.current = sessionPromise;

      } catch (err) {
        console.error("Failed to connect", err);
        if (mounted) setStatus('error');
      }
    };

    startSession();

    return () => {
      mounted = false;
      if (processorRef.current && sourceRef.current) {
        sourceRef.current.disconnect();
        processorRef.current.disconnect();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (inputAudioContextRef.current) {
        inputAudioContextRef.current.close();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // --- Audio Helper Functions ---

  const floatTo16BitPCM = (float32Array: Float32Array) => {
    const buffer = new ArrayBuffer(float32Array.length * 2);
    const view = new DataView(buffer);
    for (let i = 0; i < float32Array.length; i++) {
      let s = Math.max(-1, Math.min(1, float32Array[i]));
      view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }
    return buffer;
  };

  const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  };

  const base64ToArrayBuffer = (base64: string) => {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  };

  const decodeAudioData = async (arrayBuffer: ArrayBuffer, ctx: AudioContext) => {
    const dataView = new DataView(arrayBuffer);
    const numChannels = 1;
    const sampleRate = 24000; 
    const pcmLength = arrayBuffer.byteLength / 2;
    const audioBuffer = ctx.createBuffer(numChannels, pcmLength, sampleRate);
    const channelData = audioBuffer.getChannelData(0);
    
    for (let i = 0; i < pcmLength; i++) {
      const int16 = dataView.getInt16(i * 2, true);
      channelData[i] = int16 / 32768.0;
    }
    
    return audioBuffer;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className={`bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative transition-all duration-500 ${showTranscript ? 'h-[600px]' : 'h-auto'}`}>
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors z-10"
        >
          <X className="w-6 h-6" />
        </button>

        <div className={`p-8 flex flex-col items-center text-center transition-all duration-300 ${showTranscript ? 'pb-4' : ''}`}>
          <div className="mb-6 relative">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500 ${
              status === 'connected' ? 'bg-health-primary/10' : 'bg-slate-100 dark:bg-slate-800'
            }`}>
              {status === 'connecting' && (
                <Loader2 className="w-10 h-10 text-health-primary animate-spin" />
              )}
              {status === 'connected' && !isSpeaking && (
                <Mic className="w-10 h-10 text-health-primary animate-pulse" />
              )}
              {status === 'connected' && isSpeaking && (
                <Volume2 className="w-10 h-10 text-health-accent animate-bounce" />
              )}
              {status === 'error' && (
                <MicOff className="w-10 h-10 text-red-500" />
              )}
            </div>
            {status === 'connected' && (
              <>
                <div className={`absolute inset-0 rounded-full border-4 border-health-primary/20 opacity-20 ${!isSpeaking ? 'animate-ping' : ''}`}></div>
                {isSpeaking && <div className="absolute inset-0 rounded-full border-4 border-health-accent/20 animate-ping opacity-30 delay-75"></div>}
              </>
            )}
          </div>

          <h2 className="font-serif text-2xl font-bold text-health-text dark:text-white mb-2">
            {status === 'connecting' ? 'Connecting...' : 
             status === 'error' ? 'Connection Failed' : 'VitaCare Assistant'}
          </h2>
          
          <p className="text-slate-500 dark:text-slate-400 mb-6 h-6">
            {status === 'connecting' ? 'Establishing secure line...' :
             status === 'error' ? 'Check microphone permissions.' :
             isSpeaking ? 'VitaCare is speaking...' : 'Try saying "Find Vitamin C"'}
          </p>

          <div className="flex gap-3">
             <Button variant="outline" onClick={onClose} size="sm" className="dark:text-white dark:border-white">End Conversation</Button>
             <Button 
               variant={showTranscript ? "secondary" : "ghost"} 
               size="sm"
               onClick={() => setShowTranscript(!showTranscript)}
               icon={showTranscript ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
               className="dark:text-slate-300 dark:hover:text-white"
             >
               {showTranscript ? "Hide Transcript" : "View Transcript"}
             </Button>
          </div>
        </div>

        {/* Transcript Section */}
        {showTranscript && (
          <div className="flex-1 px-6 pb-6 h-[250px] overflow-y-auto border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
            <div className="py-4 space-y-4">
              {transcript.length === 0 ? (
                <p className="text-center text-slate-400 text-sm mt-8">Conversation history will appear here...</p>
              ) : (
                transcript.map((item, index) => (
                  <div key={index} className={`flex ${item.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                      item.role === 'user' 
                        ? 'bg-health-primary text-white rounded-br-none' 
                        : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-bl-none shadow-sm'
                    }`}>
                      {item.text}
                    </div>
                  </div>
                ))
              )}
              <div ref={transcriptEndRef} />
            </div>
          </div>
        )}
        
        {/* Decorative Waveform (Visual Only) */}
        {!showTranscript && status === 'connected' && (
           <div className="h-16 bg-health-surface dark:bg-slate-800 flex items-center justify-center gap-1 px-8 overflow-hidden">
             {[...Array(24)].map((_, i) => (
               <div 
                 key={i} 
                 className={`w-1 rounded-full transition-all duration-150 ${isSpeaking ? 'bg-health-accent/40' : 'bg-health-primary/40'}`}
                 style={{
                   height: (isSpeaking || isListening) ? `${Math.max(20, Math.random() * 100)}%` : '20%',
                   animation: (isSpeaking || isListening) ? `pulse 0.5s infinite ${i * 0.05}s` : 'none'
                 }}
               ></div>
             ))}
           </div>
        )}
      </div>
    </div>
  );
};
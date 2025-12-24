import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { MessageSquare, X, Send, Mic, Minimize2, Move, Loader2, ShoppingCart, Calendar } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { FEATURED_PRODUCTS, AVAILABLE_DOCTORS } from '../constants';
import { Button } from './Button';

// --- Tool Definitions ---

const addToCartTool: FunctionDeclaration = {
  name: 'addToCart',
  parameters: {
    type: Type.OBJECT,
    description: 'Add a specific product to the user\'s shopping cart.',
    properties: {
      productId: {
        type: Type.STRING,
        description: 'The ID of the product to add (e.g., "p1", "p2").',
      },
    },
    required: ['productId'],
  },
};

const checkStockTool: FunctionDeclaration = {
  name: 'checkAvailability',
  parameters: {
    type: Type.OBJECT,
    description: 'Check if a product is in stock or if a doctor has availability.',
    properties: {
      itemId: {
        type: Type.STRING,
        description: 'The ID of the product or doctor.',
      },
    },
    required: ['itemId'],
  },
};

// --- Component ---

export const Chatbot: React.FC = () => {
  // UI State
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [position, setPosition] = useState({ x: window.innerWidth - 380, y: window.innerHeight - 600 });
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  // Chat State
  const [messages, setMessages] = useState<{ role: 'user' | 'model'; text: string }[]>([
    { role: 'model', text: 'Hi there! 👋 I\'m VitaBot, your wellness companion. How are you feeling today?' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);

  // Contexts
  const { addToCart } = useCart();
  const chatSessionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // --- Drag Logic ---
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragOffset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragOffset.current.x,
          y: e.clientY - dragOffset.current.y
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  // --- AI Setup ---
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const initializeChat = async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Create System Context with Product Data
    const catalogContext = `
      CATALOG DATA:
      Products: ${JSON.stringify(FEATURED_PRODUCTS.map(p => ({ id: p.id, name: p.name, price: p.price, category: p.category, description: p.description, ingredients: p.ingredients })))}
      Doctors: ${JSON.stringify(AVAILABLE_DOCTORS.map(d => ({ id: d.id, name: d.name, specialty: d.specialty, availability: d.availability })))}
    `;

    const chat = ai.chats.create({
      model: 'gemini-2.5-flash-preview-09-2025',
      config: {
        systemInstruction: `You are VitaBot, the warm, empathetic, and knowledgeable AI health companion for VitaCare Marketplace. Your goal is to make health information accessible and support users on their wellness journey.

        ${catalogContext}
        
        YOUR PERSONA:
        1. **Empathetic & Warm**: Use supportive language ("I understand," "That sounds difficult"). Use occasional gentle emojis (🌿, 💙, ✨) to create a friendly atmosphere.
        2. **Safety First**: ALWAYS disclaim that you are an AI and not a doctor when discussing symptoms or medical conditions.
        3. **Solution-Oriented**: Connect user needs to the products and services in the CATALOG DATA provided above.

        COMMON HEALTH FAQS & BEHAVIORS:
        - **Immunity**: If asked about preventing colds, mention Vitamin C, Zinc, or Elderberry products from the catalog (e.g., ImmunoShield).
        - **Sleep**: If a user has insomnia, suggest magnesium or melatonin (e.g., NeuroCalm, DeepSleep) and mention sleep hygiene.
        - **Stress/Anxiety**: Recommend Ashwagandha or speaking to a mental health professional if available in the catalog.
        - **Skin Care**: Suggest dermatology consults or SPF products.
        
        TOOL USAGE:
        - If a user wants to buy/add an item, find its ID from the catalog and use the \`addToCart\` tool.
        - If a user asks about stock/availability, use the \`checkAvailability\` tool.
        
        EXAMPLE INTERACTIONS:
        - User: "I'm so stressed lately."
        - You: "I'm sorry to hear you're going through a stressful time. 💙 It's important to take time for yourself. We have supplements like Organic Ashwagandha that may help with stress relief, or you could book a session with a specialist. Would you like to hear more about either?"

        - User: "Do you have anything for dry skin?"
        - You: "Yes, taking care of your skin is vital! We have the SolarGuard SPF 50 for protection. For specific conditions, Dr. Elena Rostova is our top dermatologist available for consultation. Shall I add the sunscreen to your cart or show you Dr. Rostova's profile?"
        `,
        tools: [{ functionDeclarations: [addToCartTool, checkStockTool] }],
      },
    });
    chatSessionRef.current = chat;
  };

  useEffect(() => {
    initializeChat();
    // Set initial position to bottom right safely
    setPosition({ x: window.innerWidth - 340 - 20, y: window.innerHeight - 500 - 20 });
  }, []);

  // --- Message Handling ---

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || !chatSessionRef.current) return;

    // 1. Add User Message
    setMessages(prev => [...prev, { role: 'user', text }]);
    setInputValue('');
    setIsLoading(true);

    try {
      // 2. Send to Gemini
      let result = await chatSessionRef.current.sendMessage({ message: text });
      
      // 3. Handle Function Calls (Loop for multi-turn tool use)
      while (result.functionCalls && result.functionCalls.length > 0) {
        const call = result.functionCalls[0]; // Handle first call
        let toolResult = {};

        if (call.name === 'addToCart') {
          const { productId } = call.args as any;
          const product = FEATURED_PRODUCTS.find(p => p.id === productId);
          if (product) {
            addToCart(product);
            toolResult = { result: `Successfully added ${product.name} to cart.` };
          } else {
            toolResult = { result: `Product ID ${productId} not found.` };
          }
        } else if (call.name === 'checkAvailability') {
           toolResult = { result: 'Item is In Stock and available for immediate delivery.' };
        }

        // Send tool result back to model
        result = await chatSessionRef.current.sendMessage({
          content: [{ 
            role: 'function',
            parts: [{
              functionResponse: {
                name: call.name,
                response: toolResult
              }
            }]
          }]
        });
      }

      // 4. Add Model Response
      setMessages(prev => [...prev, { role: 'model', text: result.text }]);

    } catch (error) {
      console.error("Chat Error", error);
      setMessages(prev => [...prev, { role: 'model', text: "I'm having trouble connecting right now. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Voice Input ---
  const toggleVoice = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice input is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputValue(transcript);
      handleSendMessage(transcript);
    };

    recognition.start();
  };


  // --- Render ---

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-health-primary text-white p-4 rounded-full shadow-2xl hover:bg-teal-700 hover:scale-110 transition-all duration-300 animate-in zoom-in"
      >
        <MessageSquare className="w-8 h-8" />
        <span className="absolute top-0 right-0 w-3 h-3 bg-health-accent rounded-full border-2 border-white"></span>
      </button>
    );
  }

  return (
    <div 
      style={{ left: position.x, top: position.y }}
      className="fixed z-50 w-[340px] flex flex-col shadow-2xl rounded-2xl overflow-hidden font-sans animate-in zoom-in duration-200"
    >
      {/* Header (Draggable) */}
      <div 
        onMouseDown={handleMouseDown}
        className="bg-health-primary p-4 flex justify-between items-center cursor-move select-none"
      >
        <div className="flex items-center text-white space-x-2">
          <div className="bg-white/20 p-1.5 rounded-lg">
            <MessageSquare className="w-4 h-4" />
          </div>
          <span className="font-bold text-sm">VitaBot AI</span>
        </div>
        <div className="flex items-center text-white/80 space-x-1">
          <button onClick={() => setIsMinimized(!isMinimized)} className="p-1 hover:bg-white/10 rounded">
            {isMinimized ? <Move className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </button>
          <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-red-500/20 rounded hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      {!isMinimized && (
        <div className="bg-white dark:bg-slate-900 h-[450px] flex flex-col border border-slate-200 dark:border-slate-800 border-t-0">
          
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-950">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div 
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-health-primary text-white rounded-br-none' 
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-700 rounded-bl-none'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-slate-800 p-3 rounded-2xl rounded-bl-none shadow-sm border border-slate-100 dark:border-slate-700">
                  <Loader2 className="w-4 h-4 text-health-primary animate-spin" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Controls */}
          <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
             <div className="flex gap-2 mb-2 overflow-x-auto pb-1 no-scrollbar">
                <button 
                  onClick={() => handleSendMessage("Are vitamins in stock?")}
                  className="whitespace-nowrap px-3 py-1 bg-slate-100 dark:bg-slate-800 text-xs rounded-full text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center"
                >
                  <ShoppingCart className="w-3 h-3 mr-1" /> Check Stock
                </button>
                <button 
                  onClick={() => handleSendMessage("Book a dermatologist")}
                  className="whitespace-nowrap px-3 py-1 bg-slate-100 dark:bg-slate-800 text-xs rounded-full text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center"
                >
                  <Calendar className="w-3 h-3 mr-1" /> Book Appt
                </button>
             </div>
             
             <div className="flex items-center gap-2">
               <button 
                 onClick={toggleVoice}
                 className={`p-2.5 rounded-full transition-all ${
                   isListening 
                     ? 'bg-red-500 text-white animate-pulse' 
                     : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'
                 }`}
               >
                 <Mic className="w-5 h-5" />
               </button>
               <input 
                 type="text" 
                 value={inputValue}
                 onChange={(e) => setInputValue(e.target.value)}
                 onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(inputValue)}
                 placeholder="Ask about health, products..."
                 className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white px-4 py-2.5 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-health-primary/50"
               />
               <button 
                 onClick={() => handleSendMessage(inputValue)}
                 disabled={!inputValue.trim() || isLoading}
                 className="p-2.5 bg-health-primary text-white rounded-full hover:bg-teal-700 disabled:opacity-50 transition-colors"
               >
                 <Send className="w-4 h-4" />
               </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};
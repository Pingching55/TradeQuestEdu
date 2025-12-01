import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage } from '../types';
import { getMentorResponse } from '../services/geminiService';
import { Send, Bot, User } from 'lucide-react';

const AiMentor: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Hello! I am your Forex Mentor. I can help you with trading concepts, risk management, or psychology. What is on your mind?', timestamp: Date.now() }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', text: inputText, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    const responseText = await getMentorResponse(inputText);
    
    setMessages(prev => [...prev, {
      role: 'model',
      text: responseText,
      timestamp: Date.now()
    }]);
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-background">
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-20 no-scrollbar">
        {messages.map((msg, idx) => (
          <div 
            key={idx} 
            className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'model' ? 'bg-primary/20 text-primary' : 'bg-slate-700 text-slate-300'}`}>
              {msg.role === 'model' ? <Bot size={18} /> : <User size={18} />}
            </div>
            <div 
              className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm
                ${msg.role === 'user' 
                  ? 'bg-primary text-white rounded-tr-none' 
                  : 'bg-surface border border-slate-700 text-slate-200 rounded-tl-none'
                }`}
            >
              {msg.text.split('\n').map((line, i) => (
                <p key={i} className={i > 0 ? 'mt-2' : ''}>{line}</p>
              ))}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-center gap-2 text-slate-500 text-xs ml-12">
            <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="fixed bottom-16 left-0 right-0 p-4 bg-background/80 backdrop-blur-md border-t border-slate-800">
        <form onSubmit={handleSend} className="relative max-w-2xl mx-auto">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask your mentor..."
            className="w-full bg-surface border border-slate-700 text-white rounded-full py-3 pl-4 pr-12 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-slate-500"
          />
          <button 
            type="submit" 
            disabled={!inputText.trim() || isLoading}
            className="absolute right-2 top-1.5 bg-primary text-white p-2 rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AiMentor;
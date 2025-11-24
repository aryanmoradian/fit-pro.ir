
import React, { useState } from 'react';
import { Send, Search, ExternalLink } from 'lucide-react';
import { chatWithSearch } from '../services/geminiService';
import { ChatMessage } from '../types';

const ResearchChat: React.FC = () => {
  const [query, setQuery] = useState('');
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!query.trim()) return;
    
    const userMsg: ChatMessage = { role: 'user', text: query };
    setHistory(prev => [...prev, userMsg]);
    setQuery('');
    setLoading(true);

    // Flatten history for context
    const context = history.map(m => `${m.role}: ${m.text}`).join('\n');
    
    const response = await chatWithSearch(query, context);
    
    const modelMsg: ChatMessage = { 
        role: 'model', 
        text: response.text,
        sources: response.sources 
    };
    
    setHistory(prev => [...prev, modelMsg]);
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-slate-800 border border-slate-700 rounded-xl overflow-hidden animate-fade-in">
        <div className="bg-slate-900 p-4 border-b border-slate-700 flex items-center gap-2">
            <Search size={20} className="text-blue-400" />
            <h2 className="font-semibold text-white">تحقیقات علوم ورزشی</h2>
            <span className="text-xs text-slate-500 mr-auto">قدرت گرفته از جستجوی گوگل</span>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {history.length === 0 && (
                <div className="text-center text-slate-500 mt-20">
                    <p>درباره مکمل‌ها، آخرین مقالات تمرینی یا پروتکل‌های ریکاوری بپرسید.</p>
                </div>
            )}
            {history.map((msg, idx) => (
                <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-start' : 'items-end'}`}>
                    <div className={`max-w-[80%] p-4 rounded-2xl ${
                        msg.role === 'user' 
                        ? 'bg-emerald-600 text-white' 
                        : 'bg-slate-700 text-slate-200'
                    }`}>
                        <p className="whitespace-pre-wrap">{msg.text}</p>
                        
                        {/* Grounding Sources */}
                        {msg.sources && msg.sources.length > 0 && (
                            <div className="mt-4 pt-3 border-t border-slate-600">
                                <p className="text-xs text-slate-400 mb-2">منابع:</p>
                                <div className="flex flex-wrap gap-2">
                                    {msg.sources.map((source, i) => (
                                        <a 
                                            key={i} 
                                            href={source.uri} 
                                            target="_blank" 
                                            rel="noreferrer"
                                            className="flex items-center gap-1 text-xs bg-slate-800 hover:bg-slate-900 text-blue-300 px-2 py-1 rounded transition-colors"
                                        >
                                            <ExternalLink size={10} />
                                            {source.title}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ))}
            {loading && (
                <div className="flex items-end">
                    <div className="bg-slate-700 px-4 py-3 rounded-2xl rounded-tr-none animate-pulse text-slate-400">
                        در حال تحقیق...
                    </div>
                </div>
            )}
        </div>

        <div className="p-4 bg-slate-900 border-t border-slate-700">
            <div className="flex gap-2">
                <input 
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="مثلا: بهترین دوز کراتین برای وزن ۹۰ کیلو چقدر است؟"
                    className="flex-1 bg-slate-800 border border-slate-600 text-white rounded-lg px-4 focus:outline-none focus:border-emerald-500 transition-colors"
                />
                <button 
                    onClick={handleSend}
                    disabled={loading}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white p-3 rounded-lg transition-colors disabled:opacity-50"
                >
                    <Send size={20} className="rotate-180" /> {/* Rotate icon for RTL feel */}
                </button>
            </div>
        </div>
    </div>
  );
};

export default ResearchChat;
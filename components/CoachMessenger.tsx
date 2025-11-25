import React, { useState, useEffect, useRef } from 'react';
import { DirectMessage, TraineeSummary } from '../types';
import { Send, Search, User, CheckCheck, MessageSquare, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchCoachTrainees, fetchMessages, sendDirectMessage } from '../services/userData';
import { supabase } from '../lib/supabaseClient';

const CoachMessenger: React.FC = () => {
  const { user } = useAuth();
  const [trainees, setTrainees] = useState<TraineeSummary[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string>('');
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoadingChats, setIsLoadingChats] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 1. Load Contact List (Trainees)
  useEffect(() => {
      if (user?.id) {
          fetchCoachTrainees(user.id)
            .then(data => {
                setTrainees(data);
                // Auto-select first trainee if available
                if(data.length > 0) setSelectedChatId(data[0].id);
            })
            .catch(console.error)
            .finally(() => setIsLoadingChats(false));
      }
  }, [user?.id]);

  // 2. Load Messages & Subscribe to Realtime
  useEffect(() => {
      if (!user?.id || !selectedChatId) return;

      const loadHistory = async () => {
          const history = await fetchMessages(user.id, selectedChatId);
          setMessages(history);
          setTimeout(scrollToBottom, 100);
      };
      loadHistory();

      // --- REALTIME SUBSCRIPTION ---
      const channel = supabase
        .channel(`chat_${user.id}_${selectedChatId}`)
        .on(
            'postgres_changes', 
            { 
                event: 'INSERT', 
                schema: 'public', 
                table: 'direct_messages',
                filter: `receiver_id=eq.${user.id}` // Listen for incoming messages
            }, 
            (payload) => {
                // Only add if it belongs to current chat
                if (payload.new.sender_id === selectedChatId) {
                    const newMsg: DirectMessage = {
                        id: payload.new.id,
                        senderId: payload.new.sender_id,
                        receiverId: payload.new.receiver_id,
                        senderName: 'Trainee', // Simplified
                        text: payload.new.text,
                        timestamp: new Date(payload.new.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        isRead: false
                    };
                    setMessages(prev => [...prev, newMsg]);
                    setTimeout(scrollToBottom, 100);
                }
            }
        )
        .subscribe();

      return () => {
          supabase.removeChannel(channel);
      };
  }, [selectedChatId, user?.id]);

  const handleSend = async () => {
      if (!newMessage.trim() || !selectedChatId || !user?.id) return;
      
      const tempId = `temp_${Date.now()}`;
      const tempMsg: DirectMessage = {
          id: tempId,
          senderId: user.id,
          receiverId: selectedChatId,
          senderName: 'Me',
          text: newMessage,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isRead: false
      };

      // Optimistic UI Update
      setMessages(prev => [...prev, tempMsg]);
      setNewMessage('');
      setTimeout(scrollToBottom, 100);
      setIsSending(true);

      try {
          await sendDirectMessage(user.id, selectedChatId, tempMsg.text);
          // Real message will replace temp via fetch or we just keep it
      } catch (err) {
          console.error("Failed to send", err);
          alert("خطا در ارسال پیام.");
          setMessages(prev => prev.filter(m => m.id !== tempId)); // Revert on error
      } finally {
          setIsSending(false);
      }
  };

  const selectedTrainee = trainees.find(t => t.id === selectedChatId);

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden animate-fade-in shadow-2xl">
        
        {/* Sidebar: Chat List */}
        <div className="w-1/3 border-l border-slate-700 bg-slate-900/50 flex flex-col">
            <div className="p-4 border-b border-slate-700">
                <div className="relative">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <input 
                        type="text" 
                        placeholder="جستجو در گفتگوها..." 
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg pr-10 pl-3 py-2 text-sm text-white focus:border-emerald-500 outline-none"
                    />
                </div>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {isLoadingChats && <div className="p-4 text-center"><Loader2 className="animate-spin text-emerald-500 mx-auto"/></div>}
                
                {!isLoadingChats && trainees.length === 0 && (
                    <div className="p-6 text-center text-slate-500">
                        <MessageSquare className="mx-auto mb-2 opacity-30" size={24}/>
                        <p className="text-xs">لیست مخاطبین خالی است.</p>
                    </div>
                )}
                
                {trainees.map(trainee => (
                    <div 
                        key={trainee.id}
                        onClick={() => setSelectedChatId(trainee.id)}
                        className={`p-4 flex items-center gap-3 cursor-pointer hover:bg-slate-800/50 transition-colors border-b border-slate-800/50 ${selectedChatId === trainee.id ? 'bg-slate-800 border-r-4 border-r-emerald-500' : ''}`}
                    >
                        <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                            {trainee.photoUrl ? <img src={trainee.photoUrl} className="w-full h-full object-cover" alt=""/> : <User size={20} className="text-slate-400"/>}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center mb-1">
                                <h4 className={`font-bold text-sm truncate ${selectedChatId === trainee.id ? 'text-white' : 'text-slate-300'}`}>{trainee.name}</h4>
                            </div>
                            <p className="text-xs text-slate-500 truncate">{trainee.planName}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Main Chat Window */}
        <div className="flex-1 flex flex-col bg-slate-800 relative">
            {selectedTrainee ? (
                <>
                    {/* Header */}
                    <div className="p-4 border-b border-slate-700 flex items-center gap-3 bg-slate-800/80 backdrop-blur z-10">
                         <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center overflow-hidden">
                            {selectedTrainee.photoUrl ? <img src={selectedTrainee.photoUrl} className="w-full h-full object-cover" alt=""/> : <User size={20} className="text-slate-400"/>}
                        </div>
                        <div>
                            <h3 className="font-bold text-white">{selectedTrainee.name}</h3>
                            <p className="text-xs text-emerald-400 flex items-center gap-1">
                                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div> آنلاین
                            </p>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4 flex flex-col custom-scrollbar bg-slate-900/30">
                        {messages.length === 0 && (
                            <div className="text-center text-slate-500 my-auto">
                                <MessageSquare size={48} className="mx-auto mb-2 opacity-20"/>
                                <p className="text-sm">هنوز پیامی رد و بدل نشده است.</p>
                                <p className="text-xs">سرصحبت را باز کنید!</p>
                            </div>
                        )}
                        {messages.map((msg, idx) => {
                            const isMe = msg.senderId === user?.id;
                            return (
                                <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[75%] rounded-2xl p-3 shadow-md ${isMe ? 'bg-emerald-600 text-white rounded-tl-none' : 'bg-slate-700 text-slate-200 rounded-tr-none'}`}>
                                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                                        <div className={`flex items-center gap-1 text-[10px] mt-1 ${isMe ? 'text-emerald-200 justify-end' : 'text-slate-400'}`}>
                                            <span>{msg.timestamp}</span>
                                            {isMe && <CheckCheck size={12} className="opacity-70" />}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-slate-900 border-t border-slate-700">
                        <div className="flex items-center gap-2">
                            <input 
                                type="text" 
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="پیام خود را بنویسید..." 
                                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-500 transition-colors placeholder-slate-500"
                                disabled={isSending}
                            />
                            <button 
                                onClick={handleSend}
                                disabled={!newMessage.trim() || isSending}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white p-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSending ? <Loader2 size={20} className="animate-spin"/> : <Send size={20} className="rotate-180" />}
                            </button>
                        </div>
                    </div>
                </>
            ) : (
                <div className="flex items-center justify-center h-full text-slate-500 flex-col gap-4">
                    <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center animate-pulse">
                        <MessageSquare size={32} className="opacity-50" />
                    </div>
                    <p>لطفاً یک گفتگو را انتخاب کنید</p>
                </div>
            )}
        </div>
    </div>
  );
};

export default CoachMessenger;
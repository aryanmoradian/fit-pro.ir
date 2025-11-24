
import React, { useState } from 'react';
import { MOCK_TRAINEES, MOCK_MESSAGES, USER_ID } from '../constants';
import { Send, Search, User, Clock, CheckCheck, MessageSquare } from 'lucide-react';

const CoachMessenger: React.FC = () => {
  // Ensure we start with empty if MOCK_TRAINEES is empty (which it is now)
  const [selectedChatId, setSelectedChatId] = useState<string>('');
  const [messages, setMessages] = useState(MOCK_MESSAGES); // Now empty
  const [newMessage, setNewMessage] = useState('');
  
  const trainees = MOCK_TRAINEES; // Now empty

  const selectedTrainee = trainees.find(t => t.id === selectedChatId);
  
  // Filter messages for selected chat
  const activeMessages = messages.filter(
      m => (m.senderId === USER_ID && m.receiverId === selectedChatId) || 
           (m.senderId === selectedChatId && m.receiverId === USER_ID)
  );

  const handleSend = () => {
      if (!newMessage.trim() || !selectedChatId) return;
      
      const msg = {
          id: `msg_${Date.now()}`,
          senderId: USER_ID,
          receiverId: selectedChatId,
          senderName: 'مربی',
          text: newMessage,
          timestamp: 'الان',
          isRead: true
      };
      
      setMessages([...messages, msg]);
      setNewMessage('');
  };

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
            <div className="flex-1 overflow-y-auto">
                {trainees.length === 0 && (
                    <div className="p-6 text-center text-slate-500">
                        <MessageSquare className="mx-auto mb-2 opacity-30" size={24}/>
                        <p className="text-xs">لیست مخاطبین خالی است.</p>
                    </div>
                )}
                {trainees.map(trainee => {
                    const lastMsg = messages.filter(m => m.senderId === trainee.id || m.receiverId === trainee.id).pop();
                    
                    return (
                        <div 
                            key={trainee.id}
                            onClick={() => setSelectedChatId(trainee.id)}
                            className={`p-4 flex items-center gap-3 cursor-pointer hover:bg-slate-800/50 transition-colors ${selectedChatId === trainee.id ? 'bg-slate-800 border-r-4 border-emerald-500' : ''}`}
                        >
                            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center overflow-hidden">
                                {trainee.photoUrl ? <img src={trainee.photoUrl} className="w-full h-full object-cover"/> : <User size={20} className="text-slate-400"/>}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center mb-1">
                                    <h4 className="font-bold text-white text-sm truncate">{trainee.name}</h4>
                                    <span className="text-[10px] text-slate-500">{lastMsg?.timestamp}</span>
                                </div>
                                <p className="text-xs text-slate-400 truncate">{lastMsg?.text || 'شروع گفتگو'}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>

        {/* Main Chat Window */}
        <div className="flex-1 flex flex-col bg-slate-800">
            {selectedTrainee ? (
                <>
                    {/* Header */}
                    <div className="p-4 border-b border-slate-700 flex items-center gap-3 bg-slate-800/80 backdrop-blur">
                         <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center overflow-hidden">
                            {selectedTrainee.photoUrl ? <img src={selectedTrainee.photoUrl} className="w-full h-full object-cover"/> : <User size={20} className="text-slate-400"/>}
                        </div>
                        <div>
                            <h3 className="font-bold text-white">{selectedTrainee.name}</h3>
                            <p className="text-xs text-emerald-400 flex items-center gap-1">
                                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div> آنلاین
                            </p>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4 flex flex-col">
                        {activeMessages.length === 0 && (
                            <div className="text-center text-slate-500 my-auto">
                                <p>هنوز پیامی رد و بدل نشده است.</p>
                            </div>
                        )}
                        {activeMessages.map((msg, idx) => {
                            const isMe = msg.senderId === USER_ID;
                            return (
                                <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[70%] rounded-2xl p-3 ${isMe ? 'bg-emerald-600 text-white rounded-tl-none' : 'bg-slate-700 text-slate-200 rounded-tr-none'}`}>
                                        <p className="text-sm leading-relaxed">{msg.text}</p>
                                        <div className={`flex items-center gap-1 text-[10px] mt-1 ${isMe ? 'text-emerald-200 justify-end' : 'text-slate-400'}`}>
                                            <span>{msg.timestamp}</span>
                                            {isMe && <CheckCheck size={12} />}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
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
                                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-500 transition-colors"
                            />
                            <button 
                                onClick={handleSend}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white p-3 rounded-xl transition-colors"
                            >
                                <Send size={20} className="rotate-180" />
                            </button>
                        </div>
                    </div>
                </>
            ) : (
                <div className="flex items-center justify-center h-full text-slate-500 flex-col gap-2">
                    <MessageSquare size={48} className="opacity-20" />
                    <p>یک گفتگو را انتخاب کنید</p>
                </div>
            )}
        </div>
    </div>
  );
};

export default CoachMessenger;

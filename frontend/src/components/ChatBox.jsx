import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Send, Loader2, User, Building2, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';

const ChatBox = ({ otherId, otherName, otherLogo, currentUserRole }) => {
    const { isSupportEnabled } = useSelector(store => store.auth);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const scrollRef = useRef(null);

    const fetchMessages = async () => {
        try {
            const res = await axios.get(`http://localhost:8000/api/v1/message/chat/${otherId}?role=${currentUserRole}`, { withCredentials: true });
            if (res.data.success) {
                setMessages(res.data.messages);
            }
        } catch (error) {
            console.error("Chat fetch fail");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!isSupportEnabled) return; // 🟢 Stop polling if system is OFF
        fetchMessages();
        const interval = setInterval(fetchMessages, 5000); // Poll every 5s
        return () => clearInterval(interval);
    }, [otherId, isSupportEnabled]);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            setSending(true);
            const res = await axios.post("http://localhost:8000/api/v1/message/send", {
                receiverId: otherId,
                content: newMessage,
                role: currentUserRole // 🟢 Pass role context
            }, { withCredentials: true });

            if (res.data.success) {
                setMessages([...messages, res.data.message]);
                setNewMessage("");
            }
        } catch (error) {
            console.error("Send fail");
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="flex flex-col h-[600px] bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
            {/* Chat Header */}
            <div className="p-5 border-b border-slate-100 flex items-center gap-4 bg-slate-50/50">
                <div className="w-10 h-10 bg-white border border-slate-200 rounded-xl overflow-hidden flex items-center justify-center shadow-sm">
                    {otherLogo ? <img src={otherLogo} className="w-full h-full object-cover" alt="L"/> : <User className="text-slate-300" size={20}/>}
                </div>
                <div>
                    <h4 className="text-sm font-bold text-slate-800">{otherName}</h4>
                    <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-1"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> Active Chat</p>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-[#F8FAFC]/50">
                {loading ? (
                    <div className="flex justify-center py-10"><Loader2 className="animate-spin text-indigo-600" /></div>
                ) : messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-300 opacity-50">
                        <Clock size={40} className="mb-2" />
                        <p className="text-xs font-bold uppercase tracking-widest">No conversation yet</p>
                    </div>
                ) : (
                    messages.map((msg, i) => {
                        const isMe = msg.senderType === currentUserRole;
                        return (
                            <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] p-4 rounded-2xl text-sm font-medium shadow-sm ${isMe ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'}`}>
                                    {msg.content}
                                    <p className={`text-[9px] mt-1 opacity-50 ${isMe ? 'text-right' : 'text-left'}`}>
                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={scrollRef} />
            </div>

            {/* Input Area */}
            {isSupportEnabled ? (
                <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-slate-100 flex gap-3">
                    <input 
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1 px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:bg-white focus:border-indigo-600 outline-none transition-all font-medium"
                    />
                    <button 
                        disabled={sending || !newMessage.trim()}
                        className="p-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50"
                    >
                        {sending ? <Loader2 className="animate-spin" size={20}/> : <Send size={20}/>}
                    </button>
                </form>
            ) : (
                <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Messaging is currently disabled</p>
                </div>
            )}
        </div>
    );
};

export default ChatBox;

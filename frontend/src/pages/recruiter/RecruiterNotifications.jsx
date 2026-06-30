import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { 
    Bell, 
    Briefcase, 
    Clock, 
    CheckCircle2, 
    Loader2, 
    ChevronRight, 
    XCircle,
    AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const RecruiterNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); 
    const navigate = useNavigate();

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const res = await axios.get("https://mediumturquoise-goshawk-440855.hostingersite.com/api/v1/company/notifications", { withCredentials: true });
            if (res.data.success) {
                setNotifications(res.data.notifications);
            }
        } catch (error) {
            toast.error("Failed to fetch notification history");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const markAsRead = async (id) => {
        try {
            await axios.put(`https://mediumturquoise-goshawk-440855.hostingersite.com/api/v1/company/notifications/${id}/read`, {}, { withCredentials: true });
            setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
        } catch (error) {
            console.error("Error marking read");
        }
    };

    const filtered = notifications.filter(n => filter === 'all' || !n.isRead);

    const getIcon = (type) => {
        if (type === 'JOB_APPROVED') return <CheckCircle2 className="text-emerald-500" size={18}/>;
        if (type === 'JOB_REJECTED') return <XCircle className="text-rose-500" size={18}/>;
        return <Bell className="text-indigo-500" size={18}/>;
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20 px-4">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Activity Feed</h1>
                    <p className="text-sm text-slate-500 font-medium mt-1">Updates regarding your job listings and account.</p>
                </div>
                <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                    {['all', 'unread'].map(f => (
                        <button 
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-5 py-1.5 rounded-lg text-xs font-bold transition-all uppercase tracking-wider ${filter === f ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="animate-spin text-indigo-600 mb-4" size={32} />
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading Alerts...</p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-100 py-24 text-center shadow-sm">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Bell size={32} className="text-slate-200" />
                    </div>
                    <p className="text-sm font-bold text-slate-800">No notifications yet</p>
                    <p className="text-xs text-slate-400 mt-1 font-medium">We'll notify you when your jobs are reviewed.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map((n) => (
                        <motion.div 
                            layout
                            key={n.id}
                            className={`group bg-white p-5 rounded-2xl border transition-all flex gap-4 items-start ${!n.isRead ? 'border-indigo-100 shadow-sm' : 'border-slate-100 opacity-75'}`}
                        >
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${!n.isRead ? 'bg-indigo-50' : 'bg-slate-50'}`}>
                                {getIcon(n.type)}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-4 mb-1">
                                    <h3 className="text-sm font-bold text-slate-800 truncate">{n.title}</h3>
                                    <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap uppercase tracking-tighter">{new Date(n.createdAt).toLocaleDateString()}</span>
                                </div>
                                <p className="text-xs text-slate-600 leading-relaxed font-medium">{n.message}</p>
                                
                                <div className="mt-4 flex items-center gap-4">
                                    {!n.isRead && (
                                        <button 
                                            onClick={() => markAsRead(n.id)}
                                            className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest hover:underline"
                                        >
                                            Mark as Read
                                        </button>
                                    )}
                                    {n.type.includes('JOB') && (
                                        <button 
                                            onClick={() => {
                                                markAsRead(n.id);
                                                navigate('/recruiter/jobs');
                                            }}
                                            className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-indigo-600 flex items-center gap-1"
                                        >
                                            View Job <ChevronRight size={10}/>
                                        </button>
                                    )}
                                </div>
                            </div>
                            
                            {!n.isRead && <div className="w-2 h-2 bg-indigo-600 rounded-full mt-2 shrink-0" />}
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default RecruiterNotifications;

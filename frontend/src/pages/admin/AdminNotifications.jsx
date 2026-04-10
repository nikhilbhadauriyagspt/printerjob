import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { 
    Bell, 
    Briefcase, 
    User, 
    Clock, 
    CheckCircle2, 
    Loader2, 
    Building2,
    ChevronRight,
    Filter
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const AdminNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // 'all', 'unread'
    const navigate = useNavigate();

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const res = await axios.get("http://localhost:8000/api/v1/admin/notifications", { withCredentials: true });
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
            await axios.put(`http://localhost:8000/api/v1/admin/notifications/${id}/read`, {}, { withCredentials: true });
            setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
        } catch (error) {
            console.error("Error marking read");
        }
    };

    const filtered = notifications.filter(n => filter === 'all' || !n.isRead);

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20 px-4">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight">System Alerts</h1>
                    <p className="text-sm text-slate-500 font-medium">Keep track of every recruiter action and platform event.</p>
                </div>
                <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                    <button 
                        onClick={() => setFilter('all')}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${filter === 'all' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        All Activity
                    </button>
                    <button 
                        onClick={() => setFilter('unread')}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${filter === 'unread' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        Unread
                    </button>
                </div>
            </div>

            {/* List */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="animate-spin text-indigo-600 mb-4" size={40} />
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Fetching Logs...</p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="bg-white rounded-3xl border-2 border-dashed border-slate-100 py-20 text-center">
                    <Bell size={40} className="mx-auto text-slate-200 mb-4" />
                    <p className="text-sm font-bold text-slate-800">Everything is up to date</p>
                    <p className="text-xs text-slate-400 mt-1">No notifications found matching your filter.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map((n) => (
                        <motion.div 
                            layout
                            key={n.id}
                            className={`group bg-white p-5 rounded-2xl border transition-all flex gap-4 items-start ${!n.isRead ? 'border-indigo-100 bg-indigo-50/10 shadow-sm' : 'border-slate-100 opacity-80'}`}
                        >
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${!n.isRead ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-slate-100 text-slate-400'}`}>
                                {n.type === 'JOB_POSTED' ? <Briefcase size={18}/> : <Bell size={18}/>}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-4 mb-1">
                                    <h3 className="text-sm font-bold text-slate-800 truncate pr-2">{n.title}</h3>
                                    <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap">{new Date(n.createdAt).toLocaleString()}</span>
                                </div>
                                <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>
                                
                                <div className="mt-4 flex items-center gap-3">
                                    {!n.isRead && (
                                        <button 
                                            onClick={() => markAsRead(n.id)}
                                            className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest hover:underline"
                                        >
                                            Mark as Seen
                                        </button>
                                    )}
                                    {n.type === 'JOB_POSTED' && (
                                        <button 
                                            onClick={() => {
                                                markAsRead(n.id);
                                                navigate('/admin/jobs');
                                            }}
                                            className="text-[10px] font-bold text-slate-500 uppercase tracking-widest hover:text-indigo-600 flex items-center gap-1"
                                        >
                                            Review Job <ChevronRight size={10}/>
                                        </button>
                                    )}
                                    {n.type === 'NEW_MESSAGE' && (
                                        <button 
                                            onClick={() => {
                                                markAsRead(n.id);
                                                navigate('/admin/messages');
                                            }}
                                            className="text-[10px] font-bold text-slate-500 uppercase tracking-widest hover:text-indigo-600 flex items-center gap-1"
                                        >
                                            Go to Chat <ChevronRight size={10}/>
                                        </button>
                                    )}
                                </div>
                            </div>
                            
                            {!n.isRead && <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full mt-1.5" />}
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminNotifications;

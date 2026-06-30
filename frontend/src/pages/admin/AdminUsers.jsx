import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { 
    User, Mail, Phone, Search, Eye, MapPin, Briefcase, Building2,
    FileText, Loader2, ShieldAlert, ShieldCheck, CheckCircle2, 
    XCircle, Download, ExternalLink, Calendar, Award, School,
    History, Clock, TrendingUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminUsers = () => {
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedUser, setSelectedUser] = useState(null);
    const [history, setHistory] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [stats, setStats] = useState({ total: 0, active: 0, blocked: 0 });

    const fetchCandidates = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`http://localhost:8000/api/v1/admin/candidates?search=${searchTerm}`, { withCredentials: true });
            if (res.data.success) {
                setCandidates(res.data.candidates);
                const active = res.data.candidates.filter(c => c.status === 'active').length;
                const blocked = res.data.candidates.filter(c => c.status === 'blocked').length;
                setStats({ total: res.data.candidates.length, active, blocked });
            }
        } catch (error) {
            toast.error("Failed to fetch candidates");
        } finally {
            setLoading(false);
        }
    };

    const fetchCandidateHistory = async (id) => {
        try {
            setLoadingHistory(true);
            const res = await axios.get(`http://localhost:8000/api/v1/admin/candidates/${id}/applications`, { withCredentials: true });
            if (res.data.success) {
                setHistory(res.data.applications);
            }
        } catch (error) {
            console.error("Error fetching history");
        } finally {
            setLoadingHistory(false);
        }
    };

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            fetchCandidates();
        }, 500);
        return () => clearTimeout(delayDebounce);
    }, [searchTerm]);

    const handleSelectUser = (user) => {
        setSelectedUser(user);
        fetchCandidateHistory(user.id);
    };

    const toggleStatus = async (id) => {
        try {
            const res = await axios.put(`http://localhost:8000/api/v1/admin/candidates/${id}/status`, {}, { withCredentials: true });
            if (res.data.success) {
                toast.success(res.data.message);
                fetchCandidates();
                if (selectedUser && selectedUser.id === id) {
                    setSelectedUser({ ...selectedUser, status: selectedUser.status === 'blocked' ? 'active' : 'blocked' });
                }
            }
        } catch (error) {
            toast.error("Status update failed");
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'active': return <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-bold uppercase border border-emerald-100">Live</span>;
            case 'blocked': return <span className="px-2 py-0.5 bg-rose-50 text-rose-600 rounded-full text-[9px] font-bold uppercase border border-rose-100">Blocked</span>;
            default: return <span className="px-2 py-0.5 bg-slate-50 text-slate-500 rounded-full text-[9px] font-bold uppercase border border-slate-200">{status}</span>;
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-20">
            {/* Header & Stats */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-xl font-bold text-slate-800">Candidate Directory</h1>
                    <p className="text-sm text-slate-500 font-medium">Monitor and manage all platform users.</p>
                </div>
                <div className="flex gap-4">
                    <div className="px-4 py-2 bg-white border border-slate-100 rounded-xl shadow-sm">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Total</p>
                        <p className="text-sm font-bold text-slate-700">{stats.total}</p>
                    </div>
                    <div className="px-4 py-2 bg-white border border-slate-100 rounded-xl shadow-sm border-l-4 border-l-emerald-500">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Active</p>
                        <p className="text-sm font-bold text-emerald-600">{stats.active}</p>
                    </div>
                    <div className="px-4 py-2 bg-white border border-slate-100 rounded-xl shadow-sm border-l-4 border-l-rose-500">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Blocked</p>
                        <p className="text-sm font-bold text-rose-600">{stats.blocked}</p>
                    </div>
                </div>
            </div>

            {/* Search Bar */}
            <div className="relative max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                    type="text" 
                    placeholder="Search by name, email or phone..." 
                    className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all shadow-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Candidate</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Verification</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Location</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr><td colSpan="5" className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-indigo-600" /></td></tr>
                            ) : candidates.length === 0 ? (
                                <tr><td colSpan="5" className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs italic">No candidates found</td></tr>
                            ) : candidates.map((user) => (
                                <tr key={user.id} className="hover:bg-slate-50/30 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200 shrink-0">
                                                {user.profilePhoto ? <img src={user.profilePhoto} alt="" className="w-full h-full object-cover" /> : <User size={20} className="text-slate-300" />}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-bold text-slate-700 truncate">{user.fullName}</p>
                                                <p className="text-[10px] text-slate-400 font-medium truncate">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2">
                                            <div title="Email Verified" className={`p-1 rounded ${user.isEmailVerified ? 'text-emerald-500 bg-emerald-50' : 'text-slate-300 bg-slate-50'}`}><Mail size={12}/></div>
                                            <div title="Phone Verified" className={`p-1 rounded ${user.isPhoneVerified ? 'text-blue-500 bg-blue-50' : 'text-slate-300 bg-slate-50'}`}><Phone size={12}/></div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-xs font-bold text-slate-500">
                                        <div className="flex items-center gap-1.5"><MapPin size={12} className="opacity-40" /> {user.currentLocation || 'Not Set'}</div>
                                    </td>
                                    <td className="px-6 py-4">{getStatusBadge(user.status)}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => handleSelectUser(user)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"><Eye size={16} /></button>
                                            <button 
                                                onClick={() => toggleStatus(user.id)}
                                                className={`p-2 rounded-lg transition-all ${user.status === 'blocked' ? 'text-emerald-500 hover:bg-emerald-50' : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'}`}
                                            >
                                                {user.status === 'blocked' ? <ShieldCheck size={16} /> : <ShieldAlert size={16} />}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Profile Sidebar Drawer */}
            <AnimatePresence>
                {selectedUser && (
                    <div className="fixed inset-0 z-[100] flex justify-end">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedUser(null)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
                        <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="bg-white w-full max-w-2xl relative z-10 shadow-2xl flex flex-col h-full border-l border-slate-100">
                            
                            {/* Drawer Header */}
                            <div className="p-6 border-b border-slate-50 flex items-center justify-between sticky top-0 bg-white z-20">
                                <h2 className="text-lg font-bold text-slate-800">Candidate Detailed View</h2>
                                <button onClick={() => setSelectedUser(null)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-50 text-slate-400 transition-colors">✕</button>
                            </div>

                            {/* Profile Content */}
                            <div className="flex-1 overflow-y-auto p-8 space-y-12 custom-scrollbar">
                                
                                {/* Info Row */}
                                <div className="flex items-center gap-6">
                                    <div className="w-20 h-20 rounded-3xl bg-slate-50 border border-slate-100 overflow-hidden shadow-sm flex-shrink-0">
                                        {selectedUser.profilePhoto ? <img src={selectedUser.profilePhoto} className="w-full h-full object-cover" /> : <User size={30} className="m-auto text-slate-200" />}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900">{selectedUser.fullName}</h3>
                                        <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mt-1">{selectedUser.headline || "Candidate"}</p>
                                        <div className="flex gap-4 mt-3">
                                            <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500"><Mail size={12}/> {selectedUser.email}</span>
                                            <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500"><Phone size={12}/> {selectedUser.phoneNumber || 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Dynamic Hiring History (HamaRE PASSS candidate ka hiring data) */}
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><History size={16}/> Application History</h4>
                                        <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-bold rounded-full">{history.length} Jobs</span>
                                    </div>

                                    {loadingHistory ? (
                                        <div className="py-10 text-center"><Loader2 className="animate-spin mx-auto text-slate-300" /></div>
                                    ) : history.length === 0 ? (
                                        <div className="py-10 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                            <p className="text-xs font-bold text-slate-400 uppercase">No applications yet</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {history.map((app) => (
                                                <div key={app.id} className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:border-indigo-100 transition-all flex items-center justify-between group">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                                            <Briefcase size={18}/>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-slate-800">{app.Job?.title}</p>
                                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{app.Job?.Company?.companyName}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase ${
                                                            app.status === 'hired' ? 'bg-emerald-50 text-emerald-600' :
                                                            app.status === 'rejected' ? 'bg-rose-50 text-rose-600' :
                                                            'bg-slate-50 text-slate-500'
                                                        }`}>
                                                            {app.status}
                                                        </span>
                                                        <p className="text-[9px] text-slate-400 font-bold mt-1.5 uppercase flex items-center gap-1 justify-end">
                                                            <Clock size={10}/> {new Date(app.createdAt).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Skills Section */}
                                <div className="space-y-4">
                                    <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><TrendingUp size={16}/> Verified & Listed Skills</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {(Array.isArray(selectedUser.skills) ? selectedUser.skills : JSON.parse(selectedUser.skills || '[]')).map((skill, i) => (
                                            <span key={i} className="px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-600 flex items-center gap-1.5">
                                                <CheckCircle2 size={12} className="text-emerald-500" />
                                                {typeof skill === 'object' ? skill.name : skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Resume Action */}
                                {selectedUser.resume && (
                                    <div className="p-6 bg-slate-900 rounded-[2rem] text-white flex items-center justify-between shadow-2xl shadow-slate-200">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-indigo-300"><FileText size={24}/></div>
                                            <div>
                                                <p className="text-sm font-bold">Resume / Professional CV</p>
                                                <p className="text-[10px] text-slate-400">Download to view full qualifications</p>
                                            </div>
                                        </div>
                                        <a href={selectedUser.resume} target="_blank" rel="noreferrer" className="p-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all shadow-lg shadow-indigo-900/20">
                                            <ExternalLink size={20}/>
                                        </a>
                                    </div>
                                )}
                            </div>

                            {/* Footer Actions */}
                            <div className="p-8 border-t border-slate-50 bg-slate-50/50 flex gap-4">
                                <button 
                                    onClick={() => toggleStatus(selectedUser.id)}
                                    className={`flex-1 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all ${selectedUser.status === 'blocked' ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xl shadow-emerald-100' : 'bg-rose-500 text-white hover:bg-rose-600 shadow-xl shadow-rose-100'}`}
                                >
                                    {selectedUser.status === 'blocked' ? 'Unblock Account' : 'Restrict Account'}
                                </button>
                                <button onClick={() => setSelectedUser(null)} className="px-6 py-3 bg-white border border-slate-200 text-slate-400 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-slate-50 transition-all">Close</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminUsers;

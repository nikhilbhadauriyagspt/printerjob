import React, { useState, useEffect } from 'react';
import { 
    Search, Filter, Clock, Briefcase, Building2, 
    User, MapPin, CheckCircle2, XCircle, ArrowUpRight,
    ExternalLink, Mail, Phone
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

const AdminApplications = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    const fetchApplications = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`http://localhost:8000/api/v1/admin/applications?search=${searchTerm}&status=${statusFilter === 'all' ? '' : statusFilter}`, { withCredentials: true });
            if (res.data.success) {
                setApplications(res.data.applications);
            }
        } catch (error) {
            console.error("Error fetching applications:", error);
            toast.error("Failed to load applications");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            fetchApplications();
        }, 500);
        return () => clearTimeout(delayDebounce);
    }, [searchTerm, statusFilter]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'hired': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'rejected': return 'bg-rose-50 text-rose-600 border-rose-100';
            case 'shortlisted': return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'interview_scheduled': return 'bg-amber-50 text-amber-600 border-amber-100';
            default: return 'bg-slate-50 text-slate-500 border-slate-100';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div>
                    <h1 className="text-xl font-bold text-slate-800">Global Hiring Tracker</h1>
                    <p className="text-sm text-slate-500 font-medium">Monitor all candidate applications and recruitment progress</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex bg-slate-100 p-1 rounded-xl">
                        {['all', 'hired', 'pending', 'rejected'].map((f) => (
                            <button
                                key={f}
                                onClick={() => setStatusFilter(f)}
                                className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                                    statusFilter === f ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                <input
                    type="text"
                    placeholder="Search by candidate name or email..."
                    className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Applications Table */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Candidate</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Job Details</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Company</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center">Status</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right">Applied Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 text-sm">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="py-20 text-center">
                                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto" />
                                    </td>
                                </tr>
                            ) : applications.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs italic">No applications found</td>
                                </tr>
                            ) : (
                                applications.map((app) => (
                                    <tr key={app.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 overflow-hidden flex items-center justify-center shrink-0">
                                                    {app.Candidate?.profilePhoto ? (
                                                        <img src={app.Candidate.profilePhoto} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <User size={18} className="text-blue-400" />
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-bold text-slate-800 truncate">{app.Candidate?.fullName}</p>
                                                    <p className="text-[11px] text-slate-500 truncate flex items-center gap-1"><Mail size={10}/> {app.Candidate?.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="min-w-0">
                                                <p className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors truncate">{app.Job?.title}</p>
                                                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-tighter flex items-center gap-1 mt-0.5"><MapPin size={10}/> {app.Job?.location}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden">
                                                    {app.Job?.Company?.logo ? <img src={app.Job.Company.logo} className="w-full h-full object-cover" /> : <Building2 size={12} className="text-slate-300" />}
                                                </div>
                                                <span className="text-xs font-bold text-slate-600">{app.Job?.Company?.companyName}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${getStatusColor(app.status)}`}>
                                                {app.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex flex-col items-end">
                                                <p className="text-xs font-bold text-slate-800">{new Date(app.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                                                <p className="text-[10px] text-slate-400 font-medium mt-0.5 flex items-center gap-1"><Clock size={10}/> {new Date(app.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Global hiring stats for admin */}
            {!loading && applications.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Placements</p>
                        <p className="text-2xl font-black text-emerald-600">{applications.filter(a => a.status === 'hired').length}</p>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Active Pipeline</p>
                        <p className="text-2xl font-black text-blue-600">{applications.filter(a => ['applied', 'shortlisted', 'interview_scheduled'].includes(a.status)).length}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminApplications;

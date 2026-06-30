import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { 
    Search, 
    Briefcase, 
    Loader2, 
    Plus, 
    MoreVertical, 
    Eye, 
    Edit, 
    Trash2, 
    Clock, 
    CheckCircle2, 
    XCircle,
    Calendar,
    Users,
    ChevronRight,
    AlertCircle,
    MapPin,
    IndianRupee,
    Tag
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const RecruiterJobs = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeFilter, setActiveStatus] = useState('all'); 
    const navigate = useNavigate();

    const fetchJobs = async () => {
        try {
            setLoading(true);
            const res = await axios.get("http://localhost:8000/api/v1/job/recruiter-jobs", { withCredentials: true });
            if (res.data.success) {
                setJobs(res.data.jobs);
            }
        } catch (error) {
            toast.error("Failed to fetch jobs");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchJobs(); }, []);

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this listing?")) return;
        try {
            const res = await axios.delete(`http://localhost:8000/api/v1/job/delete/${id}`, { withCredentials: true });
            if (res.data.success) {
                toast.success("Job deleted");
                fetchJobs();
            }
        } catch (error) {
            toast.error("Delete failed");
        }
    };

    const filteredJobs = jobs.filter(job => {
        const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = activeFilter === 'all' || job.status === activeFilter;
        return matchesSearch && matchesFilter;
    });

    const getStatusConfig = (status) => {
        switch(status) {
            case 'active': return { label: 'Active', color: 'text-emerald-600 bg-emerald-50 border-emerald-100', icon: <CheckCircle2 size={12}/> };
            case 'pending': return { label: 'Pending Review', color: 'text-amber-600 bg-amber-50 border-amber-100', icon: <Clock size={12}/> };
            case 'draft': return { label: 'Draft', color: 'text-slate-400 bg-slate-50 border-slate-100', icon: <Edit size={12}/> };
            case 'rejected': return { label: 'Update Required', color: 'text-rose-600 bg-rose-50 border-rose-100', icon: <XCircle size={12}/> };
            case 'closed': return { label: 'Closed', color: 'text-slate-400 bg-slate-100', icon: <Briefcase size={12}/> };
            default: return { label: status, color: 'text-slate-500 bg-slate-50', icon: null };
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20 px-4">
            
            {/* Header - Simple & Clean */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Hiring Repository</h1>
                    <p className="text-sm text-slate-500 font-medium">Manage your active job listings and drafts.</p>
                </div>
                <Link to="/recruiter/post-job" className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-md hover:bg-indigo-700 transition-all flex items-center justify-center gap-2">
                    <Plus size={18} /> Post New Opening
                </Link>
            </div>

            {/* Filters Row */}
            <div className="flex flex-col lg:flex-row items-center gap-4">
                <div className="flex p-1 bg-white border border-slate-200 rounded-xl w-full lg:w-auto shadow-sm overflow-x-auto no-scrollbar">
                    {['all', 'active', 'pending', 'draft', 'rejected'].map((status) => (
                        <button 
                            key={status}
                            onClick={() => setActiveStatus(status)}
                            className={`px-5 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${activeFilter === status ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
                <div className="relative w-full lg:flex-1 lg:max-w-md ml-auto">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                        type="text" 
                        placeholder="Search by title..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-11 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-all font-medium"
                    />
                </div>
            </div>

            {/* Jobs List */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-32 space-y-4">
                    <Loader2 className="animate-spin text-indigo-600" size={32} />
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Synchronizing Jobs...</p>
                </div>
            ) : filteredJobs.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-100 py-32 text-center shadow-sm">
                    <Briefcase size={40} className="mx-auto text-slate-200 mb-4" />
                    <p className="text-sm font-bold text-slate-800">No jobs found</p>
                    <p className="text-xs text-slate-400 mt-1">Start by creating a new position.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {filteredJobs.map((job) => {
                        const status = getStatusConfig(job.status);
                        return (
                            <motion.div 
                                layout
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                key={job.id} 
                                className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-indigo-300 transition-all shadow-sm hover:shadow-md flex flex-col group"
                            >
                                <div className="flex items-start justify-between mb-5">
                                    <div className={`px-2 py-0.5 rounded-md border text-[9px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${status.color}`}>
                                        {status.icon} {status.label}
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => navigate(`/recruiter/post-job?edit=${job.id}`)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"><Edit size={14}/></button>
                                        <button onClick={() => handleDelete(job.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"><Trash2 size={14}/></button>
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <h3 className="text-base font-bold text-slate-800 leading-tight group-hover:text-indigo-600 transition-colors line-clamp-1">{job.title}</h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{job.jobType} &bull; {job.experienceLevel}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-3 mb-6">
                                    <div 
                                        onClick={() => navigate(`/recruiter/applicants/${job.id}`)}
                                        className="p-3 bg-slate-50/50 rounded-xl border border-slate-100 cursor-pointer hover:border-indigo-300 transition-all group/card"
                                    >
                                        <div className="flex items-center gap-1.5 text-slate-400 mb-1 group-hover/card:text-indigo-500">
                                            <Users size={10}/>
                                            <span className="text-[9px] font-bold uppercase">Applies</span>
                                        </div>
                                        <p className="text-xs font-bold text-slate-700 group-hover/card:text-indigo-600">{job.applicationCount || 0}</p>
                                    </div>
                                    <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-100">
                                        <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                                            <Calendar size={10}/>
                                            <span className="text-[9px] font-bold uppercase">Posted</span>
                                        </div>
                                        <p className="text-xs font-bold text-slate-700">{new Date(job.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-5 border-t border-slate-50 mt-auto">
                                    <button 
                                        onClick={() => navigate(`/recruiter/applicants/${job.id}`)}
                                        className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-[11px] font-bold hover:bg-indigo-600 hover:text-white transition-all flex items-center gap-2"
                                    >
                                        <Users size={14}/> View Applicants
                                    </button>
                                    {job.status === 'rejected' && (
                                        <div className="relative group/msg">
                                            <AlertCircle size={16} className="text-rose-400" />
                                            <div className="absolute bottom-full right-0 mb-2 w-48 p-3 bg-slate-900 text-white text-[10px] rounded-xl opacity-0 group-hover/msg:opacity-100 transition-all pointer-events-none z-10 shadow-xl border border-white/10">
                                                {job.rejectionReason}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default RecruiterJobs;

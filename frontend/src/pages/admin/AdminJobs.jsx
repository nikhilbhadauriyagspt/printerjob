import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { 
    Search, Briefcase, Building2, Loader2, CheckCircle2, 
    XCircle, Eye, IndianRupee, MapPin, Calendar, AlertCircle,
    Users, User, Mail, Phone, ExternalLink, ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminJobs = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    
    const [selectedJob, setSelectedJob] = useState(null);
    const [applicants, setApplicants] = useState([]);
    const [loadingApplicants, setLoadingApplicants] = useState(false);
    
    const [rejectReason, setRejectReason] = useState("");
    const [actionLoading, setActionLoading] = useState(false);

    const fetchJobs = async () => {
        try {
            setLoading(true);
            const res = await axios.get("https://mediumturquoise-goshawk-440855.hostingersite.com/api/v1/admin/jobs", { withCredentials: true });
            if (res.data.success) {
                setJobs(res.data.jobs.filter(j => j.status !== 'draft'));
            }
        } catch (error) {
            toast.error("Failed to fetch jobs");
        } finally {
            setLoading(false);
        }
    };

    const fetchApplicants = async (jobId) => {
        try {
            setLoadingApplicants(true);
            const res = await axios.get(`https://mediumturquoise-goshawk-440855.hostingersite.com/api/v1/admin/jobs/${jobId}/applicants`, { withCredentials: true });
            if (res.data.success) {
                setApplicants(res.data.applicants);
            }
        } catch (error) {
            console.error("Error fetching applicants");
        } finally {
            setLoadingApplicants(false);
        }
    };

    useEffect(() => {
        fetchJobs();
    }, []);

    const handleSelectJob = (job) => {
        setSelectedJob(job);
        fetchApplicants(job.id);
    };

    const handleReviewJob = async (jobId, action) => {
        if (action === 'reject' && !rejectReason.trim()) {
            return toast.error("Please provide a reason for rejection");
        }

        try {
            setActionLoading(true);
            const res = await axios.post("https://mediumturquoise-goshawk-440855.hostingersite.com/api/v1/job/admin/review", {
                jobId,
                action,
                reason: action === 'reject' ? rejectReason : ""
            }, { withCredentials: true });

            if (res.data.success) {
                toast.success(res.data.message);
                setSelectedJob(null);
                setRejectReason("");
                fetchJobs();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Review action failed");
        } finally {
            setActionLoading(false);
        }
    };

    const parseJSON = (data, fallback = []) => {
        if (!data) return fallback;
        if (Array.isArray(data)) return data;
        try {
            const parsed = typeof data === 'string' ? JSON.parse(data) : data;
            return Array.isArray(parsed) ? parsed : fallback;
        } catch (e) { return fallback; }
    };

    const filteredJobs = jobs.filter(job => {
        const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              job.Company?.companyName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === "all" || job.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const getStatusBadge = (status) => {
        switch(status) {
            case 'pending': return <span className="px-2.5 py-1 bg-amber-50 text-amber-600 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-amber-100 flex items-center gap-1.5"><AlertCircle size={10}/> Review</span>;
            case 'active': return <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-emerald-100 flex items-center gap-1.5"><CheckCircle2 size={10}/> Active</span>;
            case 'rejected': return <span className="px-2.5 py-1 bg-rose-50 text-rose-600 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-rose-100 flex items-center gap-1.5"><XCircle size={10}/> Rejected</span>;
            default: return <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-slate-200">{status}</span>;
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Job Moderation Center</h1>
                    <p className="text-sm text-slate-500 font-medium">Verify jobs and monitor applicant activities.</p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                    <select 
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 outline-none focus:border-indigo-600"
                    >
                        <option value="all">All Statuses</option>
                        <option value="pending">Pending Review</option>
                        <option value="active">Currently Active</option>
                    </select>
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input 
                            type="text" 
                            placeholder="Search jobs..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full sm:w-64 pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:border-indigo-600 transition-all outline-none font-medium"
                        />
                    </div>
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                    <Loader2 className="animate-spin text-indigo-600" size={40} />
                </div>
            ) : filteredJobs.length === 0 ? (
                <div className="bg-white rounded-3xl border-2 border-dashed border-slate-100 py-20 flex flex-col items-center justify-center text-center">
                    <Briefcase size={40} className="text-slate-200 mb-4"/>
                    <p className="text-sm font-bold text-slate-800 uppercase tracking-widest">Queue is empty</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredJobs.map((job) => (
                        <div key={job.id} className="bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm hover:border-indigo-200 transition-all group">
                            <div className="flex items-start justify-between gap-4 mb-5">
                                <div className="flex gap-3">
                                    <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center overflow-hidden shrink-0">
                                        {job.Company?.logo ? <img src={job.Company.logo} className="w-full h-full object-cover" /> : <Building2 size={20} className="text-slate-400"/>}
                                    </div>
                                    <div>
                                        <h3 className="text-base font-bold text-slate-800 line-clamp-1 group-hover:text-indigo-600 transition-colors">{job.title}</h3>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">{job.Company?.companyName}</p>
                                    </div>
                                </div>
                                {getStatusBadge(job.status)}
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 pb-5">
                                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase">
                                    <Users size={14} className="text-indigo-400"/>
                                    {job.applicationCount || 0} Applicants
                                </div>
                                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase justify-end">
                                    <MapPin size={14} className="text-slate-400"/>
                                    {parseJSON(job.location)[0] || 'Remote'}
                                </div>
                            </div>

                            <button 
                                onClick={() => handleSelectJob(job)}
                                className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-indigo-600 transition-all flex items-center justify-center gap-2"
                            >
                                <Eye size={16}/> Inspect & Manage
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Job & Applicants Insight Modal */}
            <AnimatePresence>
                {selectedJob && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedJob(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
                        
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white w-full max-w-5xl max-h-[90vh] rounded-[40px] shadow-2xl relative z-10 flex flex-col overflow-hidden border border-slate-200">
                            
                            {/* Modal Header */}
                            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 overflow-hidden">
                                        {selectedJob.Company?.logo ? <img src={selectedJob.Company.logo} className="w-full h-full object-cover" /> : <Building2 className="text-slate-300" />}
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black text-slate-800">{selectedJob.title}</h2>
                                        <p className="text-sm font-bold text-indigo-600 uppercase tracking-widest">{selectedJob.Company?.companyName}</p>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedJob(null)} className="w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-800 transition-all font-bold">✕</button>
                            </div>

                            {/* Modal Body */}
                            <div className="flex-1 overflow-y-auto custom-scrollbar">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 divide-x divide-slate-100 h-full">
                                    
                                    {/* Left: Job Details */}
                                    <div className="p-8 space-y-8">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><Briefcase size={16}/> Listing Overview</h4>
                                            {getStatusBadge(selectedJob.status)}
                                        </div>
                                        <div className="space-y-6">
                                            <div>
                                                <p className="text-xs font-bold text-slate-400 uppercase mb-2">Description</p>
                                                <p className="text-sm text-slate-600 leading-relaxed font-medium bg-slate-50/50 p-4 rounded-2xl border border-slate-100">{selectedJob.description}</p>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Experience</p>
                                                    <p className="text-xs font-bold text-slate-800">{selectedJob.experienceLevel}</p>
                                                </div>
                                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Salary Range</p>
                                                    <p className="text-xs font-bold text-slate-800">₹{selectedJob.minSalary} - ₹{selectedJob.maxSalary}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Moderation Actions for Pending */}
                                        {selectedJob.status === 'pending' && (
                                            <div className="pt-6 border-t border-slate-100 space-y-4">
                                                <textarea 
                                                    placeholder="Rejection reason (sent to recruiter)..."
                                                    value={rejectReason}
                                                    onChange={(e) => setRejectReason(e.target.value)}
                                                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:bg-white outline-none"
                                                    rows={3}
                                                />
                                                <div className="flex gap-4">
                                                    <button onClick={() => handleReviewJob(selectedJob.id, 'reject')} className="flex-1 py-3 bg-rose-50 text-rose-600 rounded-xl text-xs font-bold uppercase">Reject</button>
                                                    <button onClick={() => handleReviewJob(selectedJob.id, 'approve')} className="flex-1 py-3 bg-emerald-500 text-white rounded-xl text-xs font-bold uppercase shadow-lg shadow-emerald-200">Approve</button>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Right: Real-time Applicants (Jo job me kisten apllicated ayea hai) */}
                                    <div className="p-8 bg-slate-50/30">
                                        <div className="flex items-center justify-between mb-6">
                                            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><Users size={16}/> Applied Candidates</h4>
                                            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-full">{applicants.length} Total</span>
                                        </div>

                                        {loadingApplicants ? (
                                            <div className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-slate-300" /></div>
                                        ) : applicants.length === 0 ? (
                                            <div className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-[10px] italic">No applicants for this job yet</div>
                                        ) : (
                                            <div className="space-y-3">
                                                {applicants.map((app) => (
                                                    <div key={app.id} className="p-4 bg-white border border-slate-100 rounded-2xl flex items-center justify-between shadow-sm">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 overflow-hidden shrink-0">
                                                                {app.Candidate?.profilePhoto ? <img src={app.Candidate.profilePhoto} className="w-full h-full object-cover" /> : <User size={18} className="text-slate-300" />}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-bold text-slate-800">{app.Candidate?.fullName}</p>
                                                                <p className="text-[10px] font-medium text-slate-400">{new Date(app.createdAt).toLocaleDateString()} • {app.Candidate?.email}</p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase ${
                                                                app.status === 'hired' ? 'bg-emerald-50 text-emerald-600' :
                                                                app.status === 'rejected' ? 'bg-rose-50 text-rose-600' :
                                                                'bg-indigo-50 text-indigo-600'
                                                            }`}>
                                                                {app.status}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                </div>
                            </div>

                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
};

export default AdminJobs;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { 
    Search, 
    Briefcase, 
    Building2, 
    Loader2, 
    CheckCircle2, 
    XCircle,
    Eye,
    IndianRupee,
    MapPin,
    Calendar,
    AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminJobs = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("all"); // 'all', 'pending', 'active', 'rejected'
    
    const [selectedJob, setSelectedJob] = useState(null);
    const [rejectReason, setRejectReason] = useState("");
    const [actionLoading, setActionLoading] = useState(false);

    const fetchJobs = async () => {
        try {
            setLoading(true);
            const res = await axios.get("http://localhost:8000/api/v1/admin/jobs", { withCredentials: true });
            if (res.data.success) {
                // Filter out drafts - Admin only reviews submitted jobs
                setJobs(res.data.jobs.filter(j => j.status !== 'draft'));
            }
        } catch (error) {
            toast.error("Failed to fetch jobs");
        } finally {
            setLoading(false);
        }
    };

    const parseJSON = (data, fallback = []) => {
        if (!data) return fallback;
        if (Array.isArray(data)) return data;
        try {
            const parsed = typeof data === 'string' ? JSON.parse(data) : data;
            return Array.isArray(parsed) ? parsed : fallback;
        } catch (e) {
            return fallback;
        }
    };

    useEffect(() => {
        fetchJobs();
    }, []);

    const handleReviewJob = async (jobId, action) => {
        if (action === 'reject' && !rejectReason.trim()) {
            return toast.error("Please provide a reason for rejection");
        }

        try {
            setActionLoading(true);
            const res = await axios.post("http://localhost:8000/api/v1/job/admin/review", {
                jobId,
                action,
                reason: action === 'reject' ? rejectReason : ""
            }, { withCredentials: true });

            if (res.data.success) {
                toast.success(res.data.message);
                setSelectedJob(null);
                setRejectReason("");
                fetchJobs(); // Refresh list
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Review action failed");
        } finally {
            setActionLoading(false);
        }
    };

    const filteredJobs = jobs.filter(job => {
        const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              job.Company?.companyName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === "all" || job.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const getStatusBadge = (status) => {
        switch(status) {
            case 'pending': return <span className="px-2.5 py-1 bg-amber-50 text-amber-600 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-amber-100 flex items-center gap-1.5"><AlertCircle size={10}/> Pending Review</span>;
            case 'active': return <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-emerald-100 flex items-center gap-1.5"><CheckCircle2 size={10}/> Active</span>;
            case 'rejected': return <span className="px-2.5 py-1 bg-rose-50 text-rose-600 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-rose-100 flex items-center gap-1.5"><XCircle size={10}/> Rejected</span>;
            case 'closed': return <span className="px-2.5 py-1 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-slate-200 flex items-center gap-1.5"><Briefcase size={10}/> Closed</span>;
            default: return <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-slate-200">{status}</span>;
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Job Verification Queue</h1>
                    <p className="text-sm text-slate-500 font-medium">Review and approve jobs before they go live.</p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                    <select 
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 outline-none focus:border-indigo-600"
                    >
                        <option value="all">All Jobs</option>
                        <option value="pending">Pending Only</option>
                        <option value="active">Active Jobs</option>
                        <option value="rejected">Rejected Jobs</option>
                    </select>
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input 
                            type="text" 
                            placeholder="Search jobs or companies..." 
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
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading Jobs...</p>
                </div>
            ) : filteredJobs.length === 0 ? (
                <div className="bg-white rounded-3xl border-2 border-dashed border-slate-100 py-20 flex flex-col items-center justify-center text-center space-y-4">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                        <Briefcase size={32} />
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm font-bold text-slate-800">No jobs found in queue</p>
                        <p className="text-xs text-slate-400 font-medium">Wait for recruiters to post new jobs.</p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredJobs.map((job) => (
                        <div key={job.id} className="bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm space-y-5 hover:border-indigo-200 transition-all">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex gap-3">
                                    <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center overflow-hidden shrink-0">
                                        {job.Company?.logo ? (
                                            <img src={job.Company.logo} className="w-full h-full object-cover" alt="logo"/>
                                        ) : (
                                            <Building2 size={20} className="text-slate-400"/>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-base font-bold text-slate-800 line-clamp-1">{job.title}</h3>
                                        <p className="text-xs font-medium text-slate-500">{job.Company?.companyName}</p>
                                    </div>
                                </div>
                                {getStatusBadge(job.status)}
                            </div>
                            
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                                    <MapPin size={14} className="text-slate-400"/>
                                    {parseJSON(job.location).length > 0 ? parseJSON(job.location).join(", ") : 'Multiple Locations'}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                                    <IndianRupee size={14} className="text-slate-400"/>
                                    {parseFloat(job.minSalary) > 0 || parseFloat(job.maxSalary) > 0 
                                        ? `${job.minSalary} - ${job.maxSalary}` 
                                        : "Not Disclosed"}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                                    <Calendar size={14} className="text-slate-400"/>
                                    Posted: {new Date(job.createdAt).toLocaleDateString()}
                                </div>
                            </div>

                            <button 
                                onClick={() => setSelectedJob(job)}
                                className="w-full py-2.5 bg-slate-50 text-indigo-600 rounded-xl text-xs font-bold hover:bg-indigo-50 transition-all flex items-center justify-center gap-2"
                            >
                                <Eye size={16}/> Review Job Details
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Deep Review Modal */}
            <AnimatePresence>
                {selectedJob && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedJob(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
                        
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[32px] shadow-2xl relative z-10 flex flex-col overflow-hidden border border-slate-200">
                            
                            {/* Modal Header */}
                            <div className="p-6 md:p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
                                <div>
                                    <h2 className="text-xl font-black text-slate-800">{selectedJob.title}</h2>
                                    <p className="text-sm font-medium text-slate-500 mt-1">{selectedJob.Company?.companyName} &bull; {selectedJob.jobType}</p>
                                </div>
                                <button onClick={() => setSelectedJob(null)} className="w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-800 transition-all font-bold shadow-sm">✕</button>
                            </div>

                            {/* Modal Body (Scrollable) */}
                            <div className="p-6 md:p-8 overflow-y-auto space-y-8 flex-1 custom-scrollbar">
                                
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <DetailBox label="Experience" value={selectedJob.experienceLevel} />
                                    <DetailBox label="Schedule" value={selectedJob.workingSchedule || "Not specified"} />
                                    <DetailBox label="App Limit" value={selectedJob.maxApplications || "Unlimited"} />
                                    <DetailBox label="Urgent Hiring" value={selectedJob.isUrgent ? "Yes" : "No"} />
                                </div>

                                <div className="space-y-6">
                                    <Section title="Job Overview" content={selectedJob.description} />
                                    {selectedJob.responsibilities && <Section title="Responsibilities" content={selectedJob.responsibilities} />}
                                    {selectedJob.requirements && <Section title="Requirements" content={selectedJob.requirements} />}
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {parseJSON(selectedJob.skills).length > 0 && (
                                            <div className="space-y-3">
                                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Required Skills</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {parseJSON(selectedJob.skills).map((s, i) => <span key={i} className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold">{s}</span>)}
                                                </div>
                                            </div>
                                        )}
                                        {parseJSON(selectedJob.benefits).length > 0 && (
                                            <div className="space-y-3">
                                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Benefits & Perks</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {parseJSON(selectedJob.benefits).map((b, i) => <span key={i} className="px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-bold">{b}</span>)}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {parseJSON(selectedJob.screeningQuestions).length > 0 && (
                                        <div className="space-y-3">
                                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><AlertCircle size={14}/> Screening Questions</h4>
                                            <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                                {parseJSON(selectedJob.screeningQuestions).map((q, i) => (
                                                    <p key={i} className="text-sm font-medium text-slate-700">Q{i+1}: {q.question} <span className="text-[10px] text-slate-400 uppercase tracking-widest ml-2">({q.type})</span></p>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Modal Footer Actions */}
                            <div className="p-6 border-t border-slate-100 bg-white shrink-0">
                                {selectedJob.status === 'pending' ? (
                                    <div className="space-y-4">
                                        <textarea 
                                            placeholder="If rejecting, please provide a reason for the recruiter to fix..."
                                            value={rejectReason}
                                            onChange={(e) => setRejectReason(e.target.value)}
                                            rows={2}
                                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:bg-white focus:border-red-300 transition-all text-sm font-medium"
                                        />
                                        <div className="flex flex-col sm:flex-row gap-4">
                                            <button 
                                                onClick={() => handleReviewJob(selectedJob.id, 'reject')}
                                                disabled={actionLoading}
                                                className="flex-1 py-3.5 bg-white border border-rose-200 text-rose-600 rounded-2xl text-sm font-bold hover:bg-rose-50 hover:border-rose-300 transition-all flex items-center justify-center gap-2"
                                            >
                                                {actionLoading ? <Loader2 className="animate-spin" size={18}/> : <><XCircle size={18}/> Reject Job</>}
                                            </button>
                                            <button 
                                                onClick={() => handleReviewJob(selectedJob.id, 'approve')}
                                                disabled={actionLoading}
                                                className="flex-1 py-3.5 bg-emerald-500 text-white rounded-2xl text-sm font-bold shadow-xl shadow-emerald-500/20 hover:bg-emerald-600 transition-all flex items-center justify-center gap-2"
                                            >
                                                {actionLoading ? <Loader2 className="animate-spin" size={18}/> : <><CheckCircle2 size={18}/> Approve & Publish</>}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Current Status</p>
                                                <div className="mt-1">{getStatusBadge(selectedJob.status)}</div>
                                            </div>
                                            {selectedJob.status === 'rejected' && selectedJob.rejectionReason && (
                                                <div className="text-right max-w-[60%]">
                                                    <p className="text-[10px] font-bold text-rose-400 uppercase tracking-widest">Rejection Reason</p>
                                                    <p className="text-xs font-medium text-rose-600 mt-1 truncate" title={selectedJob.rejectionReason}>{selectedJob.rejectionReason}</p>
                                                </div>
                                            )}
                                        </div>
                                        
                                        {selectedJob.status === 'active' && (
                                            <div className="space-y-4 pt-4 border-t border-slate-100">
                                                <div className="flex items-center gap-2 text-rose-600">
                                                    <ShieldAlert size={16}/>
                                                    <p className="text-xs font-bold uppercase tracking-tight">Administrative Control</p>
                                                </div>
                                                <textarea 
                                                    placeholder="Reason for blocking this live job..."
                                                    value={rejectReason}
                                                    onChange={(e) => setRejectReason(e.target.value)}
                                                    rows={2}
                                                    className="w-full p-4 bg-rose-50/30 border border-rose-100 rounded-2xl outline-none focus:bg-white focus:border-rose-300 transition-all text-sm font-medium"
                                                />
                                                <button 
                                                    onClick={() => handleReviewJob(selectedJob.id, 'block')}
                                                    disabled={actionLoading}
                                                    className="w-full py-3 bg-rose-600 text-white rounded-2xl text-sm font-bold shadow-lg shadow-rose-100 hover:bg-rose-700 transition-all flex items-center justify-center gap-2"
                                                >
                                                    {actionLoading ? <Loader2 className="animate-spin" size={18}/> : "Block Live Listing"}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
};

const DetailBox = ({ label, value }) => (
    <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-sm font-bold text-slate-800 truncate">{value}</p>
    </div>
);

const Section = ({ title, content }) => (
    <div className="space-y-2">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">{title}</h4>
        <div className="text-sm font-medium text-slate-700 leading-relaxed whitespace-pre-wrap bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
            {content}
        </div>
    </div>
);

export default AdminJobs;

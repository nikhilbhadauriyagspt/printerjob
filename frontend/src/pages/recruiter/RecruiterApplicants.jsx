import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  User, Mail, Phone, Calendar, Download, 
  ExternalLink, CheckCircle2, XCircle, Clock, 
  MoreVertical, Filter, Search, ArrowLeft,
  Eye, Zap, Video, MapPin, Loader2, Send
} from 'lucide-react';
import axios from 'axios';
import { APPLICATION_API_END_POINT } from '../../utils/constant';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const RecruiterApplicants = () => {
    const { id: jobId } = useParams();
    const navigate = useNavigate();
    const [applicants, setApplicants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    
    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [selectedApp, setSelectedApp] = useState(null);
    const [scheduling, setScheduling] = useState(false);
    const [interviewData, setInterviewData] = useState({
        interviewDate: '',
        interviewTime: '',
        mode: 'online',
        locationOrLink: ''
    });

    const fetchApplicants = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${APPLICATION_API_END_POINT}/${jobId}/applicants`, { withCredentials: true });
            if (res.data.success) {
                setApplicants(res.data.applicants);
            }
        } catch (error) {
            console.error("Error fetching applicants:", error);
            toast.error("Failed to load applicants");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApplicants();
    }, [jobId]);

    const handleStatusUpdate = async (applicationId, status) => {
        try {
            const res = await axios.put(`${APPLICATION_API_END_POINT}/status/${applicationId}`, { status }, { withCredentials: true });
            if (res.data.success) {
                toast.success(`Candidate marked as ${status}`);
                fetchApplicants();
            }
        } catch (error) {
            toast.error("Status update failed");
        }
    };

    const handleScheduleInterview = async (e) => {
        e.preventDefault();
        try {
            setScheduling(true);
            const res = await axios.post(`${APPLICATION_API_END_POINT}/schedule-interview`, {
                applicationId: selectedApp.id,
                ...interviewData
            }, { withCredentials: true });

            if (res.data.success) {
                toast.success("Interview scheduled successfully!");
                setShowModal(false);
                fetchApplicants();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to schedule interview");
        } finally {
            setScheduling(false);
        }
    };

    const getTimeAgo = (date) => {
        if (!date) return "Never";
        const now = new Date();
        const past = new Date(date);
        const diffInMs = now - past;
        const diffInMins = Math.floor(diffInMs / (1000 * 60));
        if (diffInMins < 1) return "Just now";
        if (diffInMins < 60) return `${diffInMins}m ago`;
        const diffInHours = Math.floor(diffInMins / 60);
        if (diffInHours < 24) return `${diffInHours}h ago`;
        return `${Math.floor(diffInHours / 24)}d ago`;
    };

    const filteredApplicants = applicants.filter(app => 
        app.Candidate?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.Candidate?.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-8 bg-[#f8fafe] min-h-screen">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div>
                        <button onClick={() => navigate(-1)} className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-blue-600 transition-colors">
                            <ArrowLeft size={16} /> Back to Jobs
                        </button>
                        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                            Applicants Management
                            <span className="px-3 py-1 bg-blue-100 text-blue-600 text-xs rounded-full font-bold">
                                {applicants.length} Total
                            </span>
                        </h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative flex-1 md:w-80">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input 
                                type="text" 
                                placeholder="Search by name or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-400 transition-all font-medium text-sm"
                            />
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full" />
                    </div>
                ) : filteredApplicants.length === 0 ? (
                    <div className="bg-white border border-slate-200 rounded-2xl p-20 text-center shadow-sm">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <User size={40} className="text-slate-200" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900">No applicants yet</h2>
                        <p className="text-slate-500 mt-2">When candidates apply for this job, they will appear here.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {filteredApplicants.map((app, idx) => (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                key={app.id} 
                                className="bg-white border border-slate-200 rounded-2xl p-6 hover:border-blue-300 transition-all shadow-sm group"
                            >
                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                                    <div className="flex items-start gap-5 flex-1">
                                        <div className="relative">
                                            <div className="w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center overflow-hidden border border-slate-100">
                                                {app.Candidate?.profilePhoto ? (
                                                    <img src={app.Candidate.profilePhoto} className="w-full h-full object-cover" alt="" />
                                                ) : (
                                                    <User className="text-slate-300" size={28} />
                                                )}
                                            </div>
                                            {new Date() - new Date(app.Candidate?.lastActive) < 5 * 60 * 1000 && (
                                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></div>
                                            )}
                                        </div>
                                        
                                        <div className="flex-1 min-w-0">
                                            <div onClick={() => navigate(`/recruiter/candidate/${app.Candidate?.id}?mode=applicant`)} className="cursor-pointer group-hover:text-blue-600 transition-colors">
                                                <h3 className="font-bold text-slate-900 text-lg">
                                                    {app.Candidate?.fullName}
                                                </h3>
                                                <p className="text-sm font-medium text-slate-500 line-clamp-1">{app.Candidate?.headline || "Software Engineer"}</p>
                                            </div>
                                            
                                            <div className="flex flex-wrap items-center gap-4 mt-3">
                                                <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                                                    <Mail size={14} /> {app.Candidate?.email}
                                                </span>
                                                <span className={`flex items-center gap-1.5 text-xs font-bold px-2 py-0.5 rounded-md ${
                                                    new Date() - new Date(app.Candidate?.lastActive) < 3600000 ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'
                                                }`}>
                                                    <Zap size={12} fill="currentColor" /> {getTimeAgo(app.Candidate?.lastActive)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-3">
                                        <div className="flex flex-col items-end mr-4">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-1.5 ${
                                                app.status === 'shortlisted' ? 'bg-emerald-50 text-emerald-600' :
                                                app.status === 'rejected' ? 'bg-rose-50 text-rose-600' :
                                                app.status === 'interview_scheduled' ? 'bg-indigo-100 text-indigo-600' :
                                                app.status === 'hired' ? 'bg-emerald-600 text-white' :
                                                'bg-blue-50 text-blue-600'
                                            }`}>
                                                {app.status.replace('_', ' ')}
                                            </span>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Applied {new Date(app.createdAt).toLocaleDateString()}</span>
                                        </div>

                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => navigate(`/recruiter/candidate/${app.Candidate?.id}?mode=applicant`)}
                                                className="p-3 bg-slate-50 text-slate-600 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all"
                                            >
                                                <Eye size={18} />
                                            </button>
                                        </div>

                                        <div className="h-10 w-[1px] bg-slate-100 mx-2 hidden lg:block"></div>

                                        <div className="flex gap-2">
                                            {app.status === 'applied' || app.status === 'reviewing' ? (
                                                <button 
                                                    onClick={() => handleStatusUpdate(app.id, 'shortlisted')}
                                                    className="px-4 py-2.5 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-xl hover:bg-emerald-100 transition-all"
                                                >
                                                    Shortlist
                                                </button>
                                            ) : app.status === 'shortlisted' ? (
                                                <button 
                                                    onClick={() => { setSelectedApp(app); setShowModal(true); }}
                                                    className="px-4 py-2.5 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition-all flex items-center gap-2"
                                                >
                                                    <Calendar size={16} /> Schedule
                                                </button>
                                            ) : (app.status === 'interview_scheduled' || app.status === 'offered') ? (
                                                <button 
                                                    onClick={() => handleStatusUpdate(app.id, 'hired')}
                                                    className="px-6 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-emerald-600 transition-all"
                                                >
                                                    Hire Candidate
                                                </button>
                                            ) : null}

                                            {app.status !== 'rejected' && app.status !== 'hired' && (
                                                <button 
                                                    onClick={() => handleStatusUpdate(app.id, 'rejected')}
                                                    className="px-4 py-2.5 bg-white border border-rose-100 text-rose-500 text-xs font-bold rounded-xl hover:bg-rose-50 transition-all"
                                                >
                                                    Reject
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Schedule Interview Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
                        >
                            <div className="p-6 border-b border-slate-100">
                                <h2 className="text-xl font-bold text-slate-900">Schedule Interview</h2>
                                <p className="text-sm text-slate-500 font-medium">For {selectedApp?.Candidate?.fullName}</p>
                            </div>
                            
                            <form onSubmit={handleScheduleInterview} className="p-6 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase">Date</label>
                                        <input 
                                            type="date" 
                                            required
                                            className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold outline-none focus:border-indigo-400"
                                            onChange={(e) => setInterviewData({...interviewData, interviewDate: e.target.value})}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase">Time</label>
                                        <input 
                                            type="time" 
                                            required
                                            className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold outline-none focus:border-indigo-400"
                                            onChange={(e) => setInterviewData({...interviewData, interviewTime: e.target.value})}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase">Mode</label>
                                    <div className="flex gap-2">
                                        {['online', 'offline'].map(m => (
                                            <button 
                                                key={m}
                                                type="button"
                                                onClick={() => setInterviewData({...interviewData, mode: m})}
                                                className={`flex-1 py-2 rounded-xl text-xs font-bold capitalize transition-all border ${
                                                    interviewData.mode === m ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                                                }`}
                                            >
                                                {m}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase">
                                        {interviewData.mode === 'online' ? 'Meeting Link (Zoom/Google Meet)' : 'Office Address'}
                                    </label>
                                    <div className="relative">
                                        {interviewData.mode === 'online' ? <Video size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" /> : <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />}
                                        <input 
                                            type="text" 
                                            placeholder={interviewData.mode === 'online' ? 'https://meet.google.com/...' : 'Office No 404, Tech Park...'}
                                            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium outline-none focus:border-indigo-400"
                                            onChange={(e) => setInterviewData({...interviewData, locationOrLink: e.target.value})}
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button 
                                        type="button" 
                                        onClick={() => setShowModal(false)}
                                        className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit"
                                        disabled={scheduling}
                                        className="flex-1 py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2"
                                    >
                                        {scheduling ? <Loader2 size={18} className="animate-spin" /> : <><Send size={18} /> Send Invitation</>}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default RecruiterApplicants;

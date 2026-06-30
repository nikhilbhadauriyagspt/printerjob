import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { 
    Building2, 
    CheckCircle2, 
    XCircle, 
    Globe, 
    Mail, 
    Phone,
    ShieldAlert,
    ShieldCheck,
    Search,
    Eye,
    MapPin,
    Briefcase,
    BadgeCheck,
    UserCircle,
    FileText,
    Clock,
    History,
    Activity,
    Loader2,
    ChevronRight,
    IndianRupee,
    Calendar,
    ArrowLeft,
    Info,
    Shield,
    Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const InfoCard = ({ label, value, icon, isLink }) => (
    <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm space-y-1">
        <div className="flex items-center gap-2 text-slate-400">{icon} <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span></div>
        {isLink && value ? (
            <a href={value} target="_blank" rel="noreferrer" className="text-xs font-bold text-indigo-600 hover:underline truncate block">{value}</a>
        ) : (
            <p className="text-xs font-bold text-slate-700 truncate">{value || 'N/A'}</p>
        )}
    </div>
);

const AdminCompanies = () => {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCompany, setSelectedCompany] = useState(null); 
    const [history, setHistory] = useState([]);
    const [companyJobs, setCompanyJobs] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [jobsLoading, setJobsLoading] = useState(false);
    const [blockModal, setBlockModal] = useState({ show: false, companyId: null, companyName: '', reason: '' });
    const [activeTab, setActiveTab] = useState('info'); 
    const [selectedJob, setSelectedJob] = useState(null); 
    const [billingHistory, setBillingHistory] = useState([]);
    const [billingLoading, setBillingLoading] = useState(false);
    
    const [showOnboardModal, setShowOnboardModal] = useState(false);
    const [onboardFormData, setOnboardFormData] = useState({
        companyName: '',
        email: '',
        phoneNumber: '',
        contactPersonName: '',
        password: '',
        industry: '',
        planType: 'trial'
    });

    const generatePassword = () => {
        const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
        let retVal = "";
        for (let i = 0, n = charset.length; i < 10; ++i) {
            retVal += charset.charAt(Math.floor(Math.random() * n));
        }
        setOnboardFormData({ ...onboardFormData, password: retVal });
    };

    const handleOnboardSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post("https://mediumturquoise-goshawk-440855.hostingersite.com/api/v1/admin/companies/onboard", onboardFormData, { withCredentials: true });
            if (res.data.success) {
                toast.success(res.data.message);
                setShowOnboardModal(false);
                fetchCompanies();
                setOnboardFormData({ companyName: '', email: '', phoneNumber: '', contactPersonName: '', password: '', industry: '', planType: 'trial' });
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Onboarding failed");
        }
    };

    const [showPlanForm, setShowPlanForm] = useState(false);
    const [planFormData, setPlanFormData] = useState({
        packageName: '',
        durationDays: 30,
        jobLimit: 10,
        tier: 1,
        amount: 0,
        type: 'job_post',
        databaseCredits: 0
    });

    const fetchBillingHistory = async (id) => {
        try {
            setBillingLoading(true);
            const res = await axios.get(`https://mediumturquoise-goshawk-440855.hostingersite.com/api/v1/admin/companies/${id}/billing`, { withCredentials: true });
            if (res.data.success) setBillingHistory(res.data.history);
        } catch (error) { console.error("Billing fail"); } finally { setBillingLoading(false); }
    };

    const handleAssignPlan = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`https://mediumturquoise-goshawk-440855.hostingersite.com/api/v1/admin/companies/${selectedCompany.id}/assign-plan`, planFormData, { withCredentials: true });
            if (res.data.success) {
                toast.success("Custom plan/credits assigned!");
                setShowPlanForm(false);
                fetchBillingHistory(selectedCompany.id);
                fetchCompanies(); 
            }
        } catch (error) { toast.error("Failed to assign plan"); }
    };

    const fetchCompanies = async () => {
        try {
            setLoading(true);
            const res = await axios.get("https://mediumturquoise-goshawk-440855.hostingersite.com/api/v1/admin/companies", { withCredentials: true });
            if (res.data.success) setCompanies(res.data.companies);
        } catch (error) { toast.error("Failed to fetch recruiters"); } finally { setLoading(false); }
    };

    const fetchHistory = async (id) => {
        try {
            setHistoryLoading(true);
            const res = await axios.get(`https://mediumturquoise-goshawk-440855.hostingersite.com/api/v1/admin/companies/${id}/history`, { withCredentials: true });
            if (res.data.success) setHistory(res.data.logs);
        } catch (error) { console.error("History fail"); } finally { setHistoryLoading(false); }
    };

    const fetchCompanyJobs = async (id) => {
        try {
            setJobsLoading(true);
            const res = await axios.get(`https://mediumturquoise-goshawk-440855.hostingersite.com/api/v1/admin/companies/${id}/jobs`, { withCredentials: true });
            if (res.data.success) setCompanyJobs(res.data.jobs);
        } catch (error) { console.error("Jobs fail"); } finally { setJobsLoading(false); }
    };

    useEffect(() => { fetchCompanies(); }, []);

    useEffect(() => {
        if (selectedCompany) {
            if (activeTab === 'history') fetchHistory(selectedCompany.id);
            if (activeTab === 'jobs') fetchCompanyJobs(selectedCompany.id);
            if (activeTab === 'billing') fetchBillingHistory(selectedCompany.id);
        } else {
            setHistory([]);
            setCompanyJobs([]);
            setBillingHistory([]);
            setActiveTab('info');
            setSelectedJob(null);
        }
    }, [selectedCompany, activeTab]);

    const getPlanBadge = (company) => {
        const now = new Date();
        const isPremium = company.planType === 'premium' && company.planExpiresAt && new Date(company.planExpiresAt) > now;
        const isTrial = company.planType === 'trial' && company.trialExpiresAt && new Date(company.trialExpiresAt) > now;

        if (isPremium) return <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[9px] font-bold uppercase tracking-tighter border border-indigo-100">Premium T{company.currentPackageTier}</span>;
        if (isTrial) return <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[9px] font-bold uppercase tracking-tighter border border-blue-100">Trial</span>;
        return <span className="px-2 py-0.5 bg-slate-100 text-slate-400 rounded text-[9px] font-bold uppercase tracking-tighter border border-slate-200">No Plan</span>;
    };

    const toggleStatus = async (id, reason = '') => {
        try {
            const res = await axios.put(`https://mediumturquoise-goshawk-440855.hostingersite.com/api/v1/admin/companies/${id}/status`, { reason }, { withCredentials: true });
            if (res.data.success) {
                toast.success(res.data.message);
                fetchCompanies();
                if(selectedCompany && selectedCompany.id === id) setSelectedCompany({...selectedCompany, isApproved: !selectedCompany.isApproved});
                setBlockModal({ show: false, companyId: null, companyName: '', reason: '' });
            }
        } catch (error) { toast.error("Action failed"); }
    };

    const getStatusBadge = (status) => {
        switch(status) {
            case 'pending': return <span className="px-2 py-0.5 bg-amber-50 text-amber-600 rounded text-[10px] font-semibold uppercase tracking-wider border border-amber-100">Pending</span>;
            case 'active': return <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded text-[10px] font-semibold uppercase tracking-wider border border-emerald-100">Live</span>;
            case 'rejected': return <span className="px-2 py-0.5 bg-rose-50 text-rose-600 rounded text-[10px] font-semibold uppercase tracking-wider border border-rose-100">Rejected</span>;
            case 'closed': return <span className="px-2 py-0.5 bg-slate-50 text-slate-500 rounded text-[10px] font-semibold uppercase tracking-wider border border-slate-200">Closed</span>;
            case 'draft': return <span className="px-2 py-0.5 bg-slate-100 text-slate-400 rounded text-[10px] font-semibold uppercase tracking-wider border border-slate-200">Draft</span>;
            default: return status;
        }
    };

    const filteredCompanies = companies.filter(c => 
        c.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-20 px-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-slate-800">Recruiter Network</h1>
                    <p className="text-sm text-slate-500 font-medium">Manage and monitor platform recruiters.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input 
                            type="text" 
                            placeholder="Search recruiters..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 w-full sm:w-64 transition-all"
                        />
                    </div>
                    <button 
                        onClick={() => setShowOnboardModal(true)}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all flex items-center gap-2 whitespace-nowrap shadow-sm"
                    >
                        <UserCircle size={16}/> Add Recruiter
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Company</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Stats</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Contact</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-20 text-center">
                                        <Loader2 className="animate-spin mx-auto text-indigo-600 mb-2" size={32} />
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading Recruiters...</p>
                                    </td>
                                </tr>
                            ) : filteredCompanies.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-20 text-center">
                                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Search className="text-slate-300" size={24} />
                                        </div>
                                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No recruiters found</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredCompanies.map((company) => (
                                    <tr key={company.id} className="hover:bg-slate-50/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-slate-100 border border-slate-200 rounded-lg flex items-center justify-center text-slate-400 font-bold overflow-hidden shrink-0">
                                                    {company.logo ? <img src={company.logo} alt="" className="w-full h-full object-cover" /> : company.companyName.charAt(0)}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-sm font-semibold text-slate-700 truncate">{company.companyName}</p>
                                                        {getPlanBadge(company)}
                                                    </div>
                                                    <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{company.industry || 'IT'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="text-center">
                                                    <p className="text-[10px] font-bold text-slate-300 uppercase">Total</p>
                                                    <p className="text-xs font-bold text-slate-600">{company.totalJobs || 0}</p>
                                                </div>
                                                <div className="w-px h-6 bg-slate-100"></div>
                                                <div className="text-center">
                                                    <p className="text-[10px] font-bold text-emerald-300 uppercase">Live</p>
                                                    <p className="text-xs font-bold text-emerald-600">{company.activeJobs || 0}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-xs font-medium text-slate-500">
                                            <div className="flex flex-col gap-0.5">
                                                <span className="flex items-center gap-1.5"><Mail size={12} className="opacity-40" /> {company.email}</span>
                                                <span className="flex items-center gap-1.5"><Phone size={12} className="opacity-40" /> {company.phoneNumber}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {company.isApproved ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">Verified</span>
                                            ) : company.status === 'rejected' ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-100">Blocked</span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-100 animate-pulse">Pending</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <button onClick={() => setSelectedCompany(company)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"><Eye size={16} /></button>
                                                <button onClick={() => { if(company.isApproved) setBlockModal({ show: true, companyId: company.id, companyName: company.companyName, reason: '' }); else toggleStatus(company.id); }} className={`p-2 rounded-lg transition-all ${company.isApproved ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50' : 'text-emerald-500 hover:bg-emerald-50'}`}>{company.isApproved ? <ShieldAlert size={16} /> : <ShieldCheck size={16} />}</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <AnimatePresence>
                {selectedCompany && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedCompany(null)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl relative z-10 overflow-hidden flex flex-col border border-slate-200 h-[85vh]">
                            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-slate-50 border border-slate-200 rounded-xl overflow-hidden flex items-center justify-center shrink-0">
                                        {selectedCompany.logo ? <img src={selectedCompany.logo} alt="" className="w-full h-full object-cover" /> : <Building2 className="text-slate-300" size={24} />}
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                            {selectedCompany.companyName} {selectedCompany.isApproved && <BadgeCheck className="text-blue-500" size={18} />}
                                        </h2>
                                        <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">{selectedCompany.industry || 'IT Services'} &bull; {selectedCompany.city}</p>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedCompany(null)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-50 text-slate-400 transition-colors">✕</button>
                            </div>

                            <div className="px-8 border-b border-slate-100 flex gap-6 shrink-0 bg-slate-50/30">
                                {[
                                    { id: 'info', label: 'Company Info', icon: <Info size={14}/> },
                                    { id: 'jobs', label: 'Job Listings', icon: <Briefcase size={14}/> },
                                    { id: 'billing', label: 'Billing & Plans', icon: <IndianRupee size={14}/> },
                                    { id: 'history', label: 'Activity Logs', icon: <Activity size={14}/> }
                                ].map(tab => (
                                    <button 
                                        key={tab.id}
                                        onClick={() => { setActiveTab(tab.id); setSelectedJob(null); }}
                                        className={`py-4 px-1 text-xs font-bold uppercase tracking-widest transition-all border-b-2 flex items-center gap-2 ${activeTab === tab.id ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                                    >
                                        {tab.icon} {tab.label}
                                    </button>
                                ))}
                            </div>
                            
                            <div className="flex-1 overflow-y-auto custom-scrollbar p-8 bg-white">
                                <AnimatePresence mode="wait">
                                    {activeTab === 'info' && (
                                        <motion.div key="info" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8 animate-in fade-in duration-300">
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <InfoCard label="Email" value={selectedCompany.email} icon={<Mail size={14}/>} />
                                                <InfoCard label="Phone" value={selectedCompany.phoneNumber} icon={<Phone size={14}/>} />
                                                <InfoCard label="Website" value={selectedCompany.website} icon={<Globe size={14}/>} isLink />
                                                <InfoCard label="Location" value={`${selectedCompany.city}, ${selectedCompany.state}`} icon={<MapPin size={14}/>} />
                                                <InfoCard label="GST" value={selectedCompany.gstNumber || "N/A"} icon={<FileText size={14}/>} />
                                                <InfoCard label="Login" value={selectedCompany.allowGoogleLogin ? "Google" : "Email/Pass"} icon={<Shield size={14}/>} />
                                            </div>
                                            <div className="space-y-2">
                                                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Company Bio</h4>
                                                <p className="text-sm text-slate-600 leading-relaxed bg-slate-50/50 p-5 rounded-2xl border border-slate-100">{selectedCompany.description || "No description provided."}</p>
                                            </div>
                                            <div className="p-5 bg-slate-900 rounded-2xl text-white flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-indigo-300"><UserCircle size={20}/></div>
                                                <div>
                                                    <p className="text-[10px] font-bold opacity-50 uppercase tracking-widest leading-none mb-1">Primary POC</p>
                                                    <p className="text-sm font-bold">{selectedCompany.contactPersonName || "N/A"} &bull; <span className="text-indigo-300">{selectedCompany.designation || 'Contact'}</span></p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    {activeTab === 'jobs' && (
                                        <motion.div key="jobs" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="animate-in fade-in duration-300">
                                            {selectedJob ? (
                                                <div className="space-y-6">
                                                    <button onClick={() => setSelectedJob(null)} className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors mb-4"><ArrowLeft size={14}/> Back to Listings</button>
                                                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 space-y-6">
                                                        <div className="flex justify-between items-start">
                                                            <h3 className="text-lg font-bold text-slate-800">{selectedJob.title}</h3>
                                                            {getStatusBadge(selectedJob.status)}
                                                        </div>
                                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                            <div className="space-y-1"><p className="text-[10px] font-bold text-slate-400 uppercase">Exp</p><p className="text-xs font-bold">{selectedJob.experienceLevel}</p></div>
                                                            <div className="space-y-1"><p className="text-[10px] font-bold text-slate-400 uppercase">Type</p><p className="text-xs font-bold">{selectedJob.jobType}</p></div>
                                                            <div className="space-y-1"><p className="text-[10px] font-bold text-slate-400 uppercase">Sal</p><p className="text-xs font-bold">{selectedJob.minSalary || 'N/A'}</p></div>
                                                            <div className="space-y-1"><p className="text-[10px] font-bold text-slate-400 uppercase">Posted</p><p className="text-xs font-bold">{new Date(selectedJob.createdAt).toLocaleDateString()}</p></div>
                                                        </div>
                                                        <div className="space-y-2 pt-4 border-t border-slate-200">
                                                            <p className="text-[10px] font-bold text-slate-400 uppercase">Requirements</p>
                                                            <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">{selectedJob.description || selectedJob.requirements}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="space-y-3">
                                                    {jobsLoading ? <div className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-indigo-600" /></div> : 
                                                     companyJobs.length === 0 ? <div className="py-20 text-center opacity-40"><Briefcase size={40} className="mx-auto mb-2" /><p className="text-sm font-bold">No jobs posted yet.</p></div> :
                                                     companyJobs.map(job => (
                                                        <div key={job.id} onClick={() => setSelectedJob(job)} className="p-4 bg-white border border-slate-100 rounded-xl hover:border-indigo-200 cursor-pointer flex items-center justify-between transition-all group">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-10 h-10 bg-slate-50 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 rounded-lg flex items-center justify-center transition-colors"><Briefcase size={18}/></div>
                                                                <div>
                                                                    <p className="text-sm font-bold text-slate-700">{job.title}</p>
                                                                    <p className="text-[10px] font-medium text-slate-400 uppercase">{job.jobType} &bull; {new Date(job.createdAt).toLocaleDateString()}</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-3">
                                                                {getStatusBadge(job.status)}
                                                                <ChevronRight size={14} className="text-slate-300 group-hover:translate-x-1 transition-all" />
                                                            </div>
                                                        </div>
                                                     ))}
                                                </div>
                                            )}
                                        </motion.div>
                                    )}

                                    {activeTab === 'billing' && (
                                        <motion.div key="billing" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8 animate-in fade-in duration-300">
                                            <div className="bg-slate-900 text-white rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden">
                                                <div className="z-10">
                                                    <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest mb-1">Active Posting Plan</p>
                                                    <h3 className="text-2xl font-bold">{selectedCompany.planType === 'premium' ? 'Premium Subscription' : (selectedCompany.planType === 'trial' ? 'Free Trial' : 'No Active Plan')}</h3>
                                                    <p className="text-xs text-slate-400 mt-1 font-medium">Job Limit: <span className="text-white">{selectedCompany.jobPostingLimit === -1 ? 'Unlimited' : selectedCompany.jobPostingLimit}</span> &bull; Expires: <span className="text-white">{selectedCompany.planExpiresAt ? new Date(selectedCompany.planExpiresAt).toLocaleDateString() : (selectedCompany.trialExpiresAt ? new Date(selectedCompany.trialExpiresAt).toLocaleDateString() : 'N/A')}</span></p>
                                                </div>
                                                <button onClick={() => setShowPlanForm(!showPlanForm)} className="z-10 px-6 py-2.5 bg-white text-slate-900 rounded-xl text-xs font-bold hover:bg-indigo-50 transition-all flex items-center gap-2">
                                                    <Zap size={14} fill="currentColor"/> {showPlanForm ? 'Close Form' : 'Assign Custom Plan'}
                                                </button>
                                                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-indigo-600/20 rounded-full blur-3xl"></div>
                                            </div>

                                            {showPlanForm && (
                                                <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} onSubmit={handleAssignPlan} className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4 overflow-hidden shadow-sm">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-widest flex items-center gap-2"><IndianRupee size={14}/> Configure Manual Plan</h4>
                                                        <div className="flex gap-2 bg-white p-1 rounded-lg border border-slate-200 shadow-inner">
                                                            <button type="button" onClick={() => setPlanFormData({...planFormData, type: 'job_post'})} className={`px-4 py-1 rounded text-[9px] font-bold uppercase transition-all ${planFormData.type === 'job_post' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>Job Posting</button>
                                                            <button type="button" onClick={() => setPlanFormData({...planFormData, type: 'database_access'})} className={`px-4 py-1 rounded text-[9px] font-bold uppercase transition-all ${planFormData.type === 'database_access' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>Search Credits</button>
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                                                        <div className="space-y-1">
                                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Plan Name</label>
                                                            <input type="text" required value={planFormData.packageName} onChange={(e) => setPlanFormData({...planFormData, packageName: e.target.value})} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-indigo-500" placeholder="e.g. Special Credits" />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Duration (Days)</label>
                                                            <input type="number" required value={planFormData.durationDays} onChange={(e) => setPlanFormData({...planFormData, durationDays: e.target.value})} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-indigo-500" />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                                                                {planFormData.type === 'job_post' ? 'Job Limit (-1 for Unl)' : 'Search Credits'}
                                                            </label>
                                                            {planFormData.type === 'job_post' ? (
                                                                <input type="number" required value={planFormData.jobLimit} onChange={(e) => setPlanFormData({...planFormData, jobLimit: e.target.value})} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-indigo-500" />
                                                            ) : (
                                                                <input type="number" required value={planFormData.databaseCredits} onChange={(e) => setPlanFormData({...planFormData, databaseCredits: e.target.value})} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-emerald-500" placeholder="50" />
                                                            )}
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Tier (1-10)</label>
                                                            <input type="number" required value={planFormData.tier} onChange={(e) => setPlanFormData({...planFormData, tier: e.target.value})} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-indigo-500" />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Price (₹)</label>
                                                            <input type="number" required value={planFormData.amount} onChange={(e) => setPlanFormData({...planFormData, amount: e.target.value})} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-indigo-500" />
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-end pt-2">
                                                        <button type="submit" className={`px-6 py-2 rounded-lg text-[11px] font-bold uppercase tracking-widest transition-all ${planFormData.type === 'job_post' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-emerald-600 hover:bg-emerald-700'} text-white`}>Assign Now</button>
                                                    </div>
                                                </motion.form>
                                            )}

                                            <div className="space-y-4">
                                                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Transaction Records</h4>
                                                <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                                                    <table className="w-full text-left">
                                                        <thead>
                                                            <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                                                <th className="px-6 py-3">Package</th>
                                                                <th className="px-6 py-3">Amount</th>
                                                                <th className="px-6 py-3">Ref ID</th>
                                                                <th className="px-6 py-3">Date</th>
                                                                <th className="px-6 py-3 text-right">Status</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-slate-50">
                                                            {billingLoading ? <tr><td colSpan="5" className="py-10 text-center"><Loader2 className="animate-spin mx-auto text-indigo-600" /></td></tr> :
                                                             billingHistory.length === 0 ? <tr><td colSpan="5" className="py-10 text-center text-slate-400 text-xs font-bold uppercase opacity-50">No payments found</td></tr> :
                                                             billingHistory.map(tx => (
                                                                <tr key={tx.id} className="text-xs hover:bg-slate-50 transition-colors">
                                                                    <td className="px-6 py-4 font-bold text-slate-700">{tx.packageName}</td>
                                                                    <td className="px-6 py-4 font-bold text-indigo-600">₹{tx.amount}</td>
                                                                    <td className="px-6 py-4 font-mono text-[10px] text-slate-400">{tx.paymentId}</td>
                                                                    <td className="px-6 py-4 text-slate-500">{new Date(tx.createdAt).toLocaleDateString()}</td>
                                                                    <td className="px-6 py-4 text-right">
                                                                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border ${tx.status === 'success' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>{tx.status}</span>
                                                                    </td>
                                                                </tr>
                                                             ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    {activeTab === 'history' && (
                                        <motion.div key="history" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6 animate-in fade-in duration-300">
                                            {historyLoading ? <div className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-indigo-600" /></div> :
                                             history.length === 0 ? <div className="py-20 text-center opacity-40"><Clock size={40} className="mx-auto mb-2" /><p className="text-sm font-bold">No history logs.</p></div> :
                                             <div className="relative pl-4 space-y-6 before:absolute before:left-4 before:top-2 before:bottom-2 before:w-px before:bg-slate-100">
                                                {history.map((log) => (
                                                    <div key={log.id} className="relative pl-8">
                                                        <div className={`absolute left-[-4px] top-1 w-2 h-2 rounded-full border-2 border-white shadow-sm ${log.action.includes('JOB') ? 'bg-indigo-500' : 'bg-slate-300'}`}></div>
                                                        <div className="bg-slate-50/50 border border-slate-100 p-4 rounded-xl space-y-1">
                                                            <div className="flex items-center justify-between text-[10px] font-bold">
                                                                <span className="text-indigo-600 uppercase tracking-wider">{log.action.replace(/_/g, ' ')}</span>
                                                                <span className="text-slate-400">{new Date(log.createdAt).toLocaleString()}</span>
                                                            </div>
                                                            <p className="text-xs text-slate-600 font-medium leading-relaxed">{log.details}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                             </div>
                                            }
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {blockModal.show && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setBlockModal({ ...blockModal, show: false })} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white w-full max-w-md rounded-2xl shadow-xl relative z-10 p-8 space-y-6">
                            <h3 className="text-lg font-bold text-slate-800">Restrict Corporate Access</h3>
                            <textarea 
                                value={blockModal.reason}
                                onChange={(e) => setBlockModal({...blockModal, reason: e.target.value})}
                                placeholder="Reason for blocking..."
                                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-rose-300 transition-all min-h-[120px]"
                            />
                            <div className="flex gap-3">
                                <button onClick={() => setBlockModal({ show: false, companyId: null, companyName: '', reason: '' })} className="flex-1 py-2.5 text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-all">Cancel</button>
                                <button onClick={() => toggleStatus(blockModal.companyId, blockModal.reason)} className="flex-1 py-2.5 bg-rose-500 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-rose-100 hover:bg-rose-600 transition-all">Confirm Block</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Onboarding Modal */}
            <AnimatePresence>
                {showOnboardModal && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowOnboardModal(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl relative z-10 overflow-hidden border border-slate-200">
                            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                                <h3 className="text-lg font-bold text-slate-800">Direct Recruiter Onboarding</h3>
                                <button onClick={() => setShowOnboardModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
                            </div>
                            <form onSubmit={handleOnboardSubmit} className="p-8 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Company Name</label>
                                        <input type="text" required value={onboardFormData.companyName} onChange={(e) => setOnboardFormData({...onboardFormData, companyName: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:bg-white focus:border-indigo-500 transition-all" placeholder="e.g. Acme Corp" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Industry</label>
                                        <input type="text" required value={onboardFormData.industry} onChange={(e) => setOnboardFormData({...onboardFormData, industry: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:bg-white focus:border-indigo-500 transition-all" placeholder="e.g. Software" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Contact Person</label>
                                        <input type="text" required value={onboardFormData.contactPersonName} onChange={(e) => setOnboardFormData({...onboardFormData, contactPersonName: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:bg-white focus:border-indigo-500 transition-all" placeholder="John Doe" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                                        <input type="email" required value={onboardFormData.email} onChange={(e) => setOnboardFormData({...onboardFormData, email: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:bg-white focus:border-indigo-500 transition-all" placeholder="hr@acme.com" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                                        <input type="text" required value={onboardFormData.phoneNumber} onChange={(e) => setOnboardFormData({...onboardFormData, phoneNumber: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:bg-white focus:border-indigo-500 transition-all" placeholder="+91..." />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Account Password</label>
                                        <div className="relative">
                                            <input type="text" required value={onboardFormData.password} onChange={(e) => setOnboardFormData({...onboardFormData, password: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:bg-white focus:border-indigo-500 transition-all font-mono" />
                                            <button type="button" onClick={generatePassword} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-white shadow-sm border border-slate-100 rounded-lg text-indigo-600 hover:text-indigo-700 transition-colors"><Zap size={14}/></button>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-indigo-600"><IndianRupee size={20}/></div>
                                        <div>
                                            <p className="text-xs font-bold text-indigo-900">Initial Posting Plan</p>
                                            <p className="text-[10px] text-indigo-600 font-medium">Select a plan to activate immediately.</p>
                                        </div>
                                    </div>
                                    <select 
                                        value={onboardFormData.planType} 
                                        onChange={(e) => setOnboardFormData({...onboardFormData, planType: e.target.value})}
                                        className="bg-white border border-indigo-200 rounded-lg px-3 py-1.5 text-xs font-bold text-indigo-900 outline-none"
                                    >
                                        <option value="none">No Initial Plan</option>
                                        <option value="trial">6 Months Free Trial</option>
                                    </select>
                                </div>
                                <div className="flex gap-3 pt-4 border-t border-slate-50">
                                    <button type="button" onClick={() => setShowOnboardModal(false)} className="flex-1 py-3 text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-all">Cancel</button>
                                    <button type="submit" className="flex-1 py-3 bg-slate-900 text-white rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-200">Onboard & Share Credentials</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminCompanies;

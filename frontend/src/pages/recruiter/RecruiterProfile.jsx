import React, { useEffect, useState } from "react";
import { 
    Building2, 
    Globe, 
    MapPin, 
    Mail, 
    Phone, 
    Linkedin, 
    Twitter, 
    Facebook, 
    Instagram, 
    Edit3, 
    ShieldCheck, 
    BadgeCheck, 
    BriefcaseBusiness, 
    FileText, 
    Users,
    ChevronRight,
    ExternalLink,
    Clock,
    UserCircle,
    ArrowUpRight
} from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";

const API_BASE = "https://mediumturquoise-goshawk-440855.hostingersite.com/api/v1";

const RecruiterProfile = () => {
    const navigate = useNavigate();
    const [company, setCompany] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await axios.get(`${API_BASE}/company/me`, { withCredentials: true });
                if (res.data.success) {
                    setCompany(res.data.company);
                }
            } catch (error) {
                toast.error("Failed to load profile");
                navigate("/recruiter/login");
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [navigate]);

    if (loading) return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    if (!company) return null;

    const isComplete = company.profileCompletionScore === 100;

    return (
        <div className="max-w-6xl mx-auto space-y-10 pb-20 px-4">
            
            {/* Minimal Header / Hero */}
            <div className="relative">
                <div className="h-40 w-full bg-slate-900 rounded-[24px] shadow-sm overflow-hidden flex items-center justify-center">
                    <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                    <div className="relative z-10 text-white/10 font-bold text-6xl tracking-widest uppercase select-none">
                        {company.companyName}
                    </div>
                </div>
                
                <div className="px-6 -mt-12 relative z-10 flex flex-col md:flex-row items-center md:items-end justify-between gap-6">
                    <div className="flex flex-col md:flex-row items-center md:items-end gap-5">
                        <div className="w-24 h-24 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                            {company.logo ? (
                                <img src={company.logo} alt="Logo" className="w-full h-full object-cover" />
                            ) : (
                                <Building2 size={40} className="text-slate-300" />
                            )}
                        </div>
                        <div className="pb-1 text-center md:text-left space-y-1">
                            <div className="flex items-center gap-2 justify-center md:justify-start">
                                <h1 className="text-2xl font-bold text-slate-800 tracking-tight">{company.companyName}</h1>
                                {isComplete && (
                                    <BadgeCheck size={18} className="text-emerald-500" />
                                )}
                            </div>
                            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500 justify-center md:justify-start uppercase tracking-wider">
                                <span className="flex items-center gap-1.5"><BriefcaseBusiness size={14} className="text-indigo-500" />{company.industry || "General"}</span>
                                <span className="flex items-center gap-1.5"><MapPin size={14} className="text-rose-500" />{company.city}, {company.state}</span>
                            </div>
                        </div>
                    </div>

                    <button 
                        onClick={() => navigate("/recruiter/setup-profile")}
                        className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-sm hover:bg-indigo-700 transition-all active:scale-95"
                    >
                        <Edit3 size={16} /> Edit Profile
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Left Sidebar: Contact & Stats */}
                <div className="lg:col-span-4 space-y-6">
                    
                    {/* Status Card */}
                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Profile Status</h3>
                            <span className={`text-xs font-bold ${isComplete ? 'text-emerald-600' : 'text-indigo-600'}`}>{company.profileCompletionScore}%</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${company.profileCompletionScore}%` }} className={`h-full ${isComplete ? 'bg-emerald-500' : 'bg-indigo-600'}`} />
                        </div>
                        {!isComplete && (
                            <p className="text-[10px] text-slate-400 font-medium leading-relaxed italic">Complete your profile to gain more candidate trust.</p>
                        )}
                    </div>

                    {/* Contact Details */}
                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
                        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2">Contact Information</h3>
                        <DetailRow icon={<Mail className="text-indigo-400" />} label="Email" value={company.email} />
                        <DetailRow icon={<Phone className="text-indigo-400" />} label="Phone" value={company.phoneNumber} />
                        <DetailRow icon={<Globe className="text-indigo-400" />} label="Website" value={company.website} isLink />
                        <DetailRow icon={<ShieldCheck className="text-indigo-400" />} label="GSTIN" value={company.gstNumber || "Not Provided"} />
                    </div>

                    {/* Social presence */}
                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-5">Social Presence</h3>
                        <div className="flex flex-wrap gap-3">
                            <SocialIcon icon={<Linkedin size={16}/>} link={company.socialLinks?.linkedin} color="text-blue-600 bg-blue-50" />
                            <SocialIcon icon={<Twitter size={16}/>} link={company.socialLinks?.twitter} color="text-sky-500 bg-sky-50" />
                            <SocialIcon icon={<Facebook size={16}/>} link={company.socialLinks?.facebook} color="text-indigo-600 bg-indigo-50" />
                            <SocialIcon icon={<Instagram size={16}/>} link={company.socialLinks?.instagram} color="text-rose-600 bg-rose-50" />
                        </div>
                    </div>
                </div>

                {/* Right Content Area */}
                <div className="lg:col-span-8 space-y-8">
                    
                    {/* About Section */}
                    <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm space-y-4">
                        <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
                            <FileText size={18} className="text-indigo-600" />
                            <h3 className="text-base font-bold text-slate-800">Company Overview</h3>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed font-medium whitespace-pre-line">
                            {company.description || "No description provided. Tell candidates about your company culture and mission!"}
                        </p>
                    </div>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <MetricCard icon={<Users className="text-indigo-600" />} label="Company Size" value={company.companySize || "N/A"} bg="bg-indigo-50/50" />
                        <MetricCard icon={<Building2 className="text-indigo-600" />} label="Company Type" value={company.companyType || "N/A"} bg="bg-indigo-50/50" />
                    </div>

                    {/* Team Contact Point */}
                    <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200 relative overflow-hidden flex flex-col md:flex-row items-center gap-8">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                        <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center border border-slate-100 shadow-sm shrink-0">
                            <UserCircle size={28} className="text-indigo-500" />
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Point of Contact</p>
                            <h4 className="text-lg font-bold text-slate-800">{company.contactPersonName || "Not Set"}</h4>
                            <p className="text-xs text-indigo-600 font-semibold">{company.designation || "No Designation"}</p>
                        </div>
                    </div>

                    {/* Location Card */}
                    <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm space-y-5">
                        <div className="flex items-center gap-3">
                            <MapPin size={18} className="text-indigo-600" />
                            <h3 className="text-base font-bold text-slate-800">Office Location</h3>
                        </div>
                        <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <div className="flex-1">
                                <p className="text-sm font-bold text-slate-800">{company.address || "Street address not provided"}</p>
                                <p className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wider">
                                    {company.city}, {company.state} {company.pincode} • {company.country}
                                </p>
                            </div>
                            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-slate-300">
                                <ExternalLink size={18} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const DetailRow = ({ icon, label, value, isLink }) => (
    <div className="flex items-center gap-4">
        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
            {React.cloneElement(icon, { size: 14 })}
        </div>
        <div className="min-w-0">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight leading-none mb-1">{label}</p>
            {isLink && value ? (
                <a href={value} target="_blank" rel="noreferrer" className="text-xs font-semibold text-indigo-600 hover:underline truncate block">{value}</a>
            ) : (
                <p className="text-xs font-semibold text-slate-700 truncate">{value || "Not Set"}</p>
            )}
        </div>
    </div>
);

const MetricCard = ({ icon, label, value, bg }) => (
    <div className={`p-5 rounded-2xl border border-slate-200 ${bg} flex items-center gap-4`}>
        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-slate-100 shadow-sm shrink-0">
            {React.cloneElement(icon, { size: 18 })}
        </div>
        <div>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
            <p className="text-base font-bold text-slate-800">{value}</p>
        </div>
    </div>
);

const SocialIcon = ({ icon, link, color }) => (
    <a 
        href={link || "#"} 
        target="_blank" 
        rel="noreferrer" 
        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${link ? `${color} hover:scale-105 shadow-sm` : "bg-slate-50 text-slate-200 pointer-events-none"}`}
    >
        {icon}
    </a>
);

export default RecruiterProfile;

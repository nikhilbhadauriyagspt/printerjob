import React, { useState, useEffect } from 'react';
import { 
    Download, ArrowLeft, ShieldCheck, Mail, Phone, 
    FileText, Search, Loader2, Database, ExternalLink,
    MapPin, Briefcase, Clock
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { COMPANY_API_END_POINT } from '../../utils/constant';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const RecruiterUnlockedTalent = () => {
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const navigate = useNavigate();

    const fetchHistory = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${COMPANY_API_END_POINT}/unlocked-history`, { withCredentials: true });
            if (res.data.success) setCandidates(res.data.candidates);
        } catch (error) {
            toast.error("Failed to load history");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchHistory(); }, []);

    const exportToExcel = () => {
        if (candidates.length === 0) return;
        const headers = ["Full Name", "Email", "Phone", "Headline", "Location", "Experience", "Salary", "Resume Link"];
        const rows = candidates.map(c => [
            c.fullName, c.email, c.phoneNumber, c.headline, c.currentLocation, 
            `${c.experienceYears} Yrs`, `${c.currentSalary} LPA`, c.resume || "N/A"
        ]);
        let csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
        const link = document.createElement("a");
        link.setAttribute("href", encodeURI(csvContent));
        link.setAttribute("download", `Unlocked_Database_${new Date().toLocaleDateString()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const filtered = candidates.filter(c => 
        c.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.headline?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="h-[60vh] flex flex-col items-center justify-center gap-4"><Loader2 className="animate-spin text-indigo-600" size={32}/><p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Accessing Secure Vault...</p></div>;

    return (
        <div className="max-w-7xl mx-auto pb-20 px-4 space-y-8 font-sans">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-slate-800 transition-all font-bold text-xs uppercase mb-4 tracking-widest">
                        <ArrowLeft size={16} /> Back to Search
                    </button>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                        Unlocked Talent Vault 
                        <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-bold rounded-md border border-indigo-100 uppercase">{candidates.length} Profiles</span>
                    </h1>
                    <p className="text-sm text-slate-500 font-medium mt-1">Direct access to all candidates you've previously unlocked.</p>
                </div>
                <button 
                    onClick={exportToExcel}
                    disabled={candidates.length === 0}
                    className="px-6 py-3 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-emerald-600 transition-all flex items-center gap-2 shadow-lg shadow-slate-200 active:scale-95 disabled:opacity-50"
                >
                    <Download size={16}/> Export Full Vault to Excel
                </button>
            </div>

            {/* Search within vault */}
            <div className="relative max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                    type="text" 
                    placeholder="Search within your vault..." 
                    className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-indigo-400 transition-all text-sm font-medium"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* List */}
            <div className="grid grid-cols-1 gap-4">
                {filtered.map((c, idx) => (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        key={c.id} 
                        className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-200 transition-all group flex flex-col md:flex-row items-center gap-6"
                    >
                        <div className="w-16 h-16 bg-slate-100 rounded-xl overflow-hidden shrink-0 border border-slate-100">
                            <img src={c.profilePhoto || `https://ui-avatars.com/api/?name=${c.fullName}&background=f1f5f9&color=6366f1`} className="w-full h-full object-cover" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <h3 className="text-base font-bold text-slate-800">{c.fullName}</h3>
                                <ShieldCheck size={16} className="text-emerald-500" />
                            </div>
                            <p className="text-xs font-semibold text-indigo-600 truncate">{c.headline || "Professional Developer"}</p>
                            
                            <div className="flex flex-wrap items-center gap-6 mt-4">
                                <div className="flex items-center gap-2">
                                    <Mail size={14} className="text-slate-300" />
                                    <span className="text-xs font-bold text-slate-600">{c.email}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Phone size={14} className="text-slate-300" />
                                    <span className="text-xs font-bold text-slate-600">{c.phoneNumber}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin size={14} className="text-slate-300" />
                                    <span className="text-[11px] font-semibold text-slate-500">{c.currentLocation}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                            <Link 
                                to={`/recruiter/candidate/${c.id}`}
                                className="px-4 py-2 bg-slate-50 text-slate-600 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-indigo-50 hover:text-indigo-600 transition-all border border-slate-100"
                            >
                                View Dossier
                            </Link>
                            {c.resume && (
                                <a 
                                    href={c.resume} 
                                    target="_blank"
                                    className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all border border-indigo-100"
                                >
                                    <Download size={16}/>
                                </a>
                            )}
                        </div>
                    </motion.div>
                ))}

                {filtered.length === 0 && (
                    <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] p-20 text-center">
                        <Database className="mx-auto text-slate-300 mb-4" size={48} />
                        <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">No profiles in vault matching your search</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RecruiterUnlockedTalent;

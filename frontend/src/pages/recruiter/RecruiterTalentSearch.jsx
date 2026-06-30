import React, { useState, useEffect, useRef } from 'react';
import {
    Search, MapPin, Briefcase, ChevronDown, X,
    Lock, Unlock, ShieldCheck, Mail, Phone, FileText,
    Zap, Sparkles, TrendingUp, HelpCircle, Info, Clock,
    AlertCircle, CheckCircle2, Loader2, Sparkle, Tag,
    Github, Linkedin, Globe, GraduationCap, Calendar,
    UserCheck, PlaneTakeoff, Filter, Download, Star,
    Building2, School, MessageSquare, FolderPlus,
    UserPlus, CheckCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { COMPANY_API_END_POINT } from '../../utils/constant';
import { toast } from 'sonner';
import { useNavigate, Link } from 'react-router-dom';

const RecruiterTalentSearch = () => {
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(false);
    const [company, setCompany] = useState(null);
    const [searchPerformed, setSearchPerformed] = useState(false);
    const navigate = useNavigate();

    // Multi-Selection State
    const [selectedIds, setSelectedIds] = useState([]);
    const [bulkUnlocking, setBulkUnlocking] = useState(false);

    // Interaction Modal State
    const [showInteractionModal, setShowInteractionModal] = useState(false);
    const [activeCandidate, setActiveCandidate] = useState(null);
    const [interactionData, setInteractionData] = useState({ notes: '', rating: 0, folder: 'General', isContacted: false });
    const [savingInteraction, setSavingInteraction] = useState(false);

    const [keywords, setKeywords] = useState([]);
    const [keywordInput, setKeywordInput] = useState('');
    const [locationInput, setLocationInput] = useState('');

    const [filters, setFilters] = useState({
        location: '',
        minExp: '',
        maxExp: '',
        minSalary: '',
        maxSalary: '',
        noticePeriod: 'All',
        experienceLevel: 'All',
        degree: 'All',
        jobType: 'All',
        workMode: 'All',
        lastActive: 'All',
        hasSocial: 'All',
        openToRelocate: false,
        // NEW ADVANCED FILTERS
        companyName: '',
        institution: '',
        isImmediate: false
    });

    const [suggestions, setSuggestions] = useState([]);
    const [locSuggestions, setLocSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [showLocSuggestions, setShowLocSuggestions] = useState(false);

    const suggestRef = useRef(null);
    const locSuggestRef = useRef(null);

    const fetchSuggestions = async (query, type = 'keyword') => {
        if (query.length < 2) {
            type === 'keyword' ? setSuggestions([]) : setLocSuggestions([]);
            return;
        }
        try {
            const res = await axios.get(`${COMPANY_API_END_POINT}/search-suggestions?query=${query}&type=${type}`, { withCredentials: true });
            if (res.data.success) {
                type === 'keyword' ? setSuggestions(res.data.suggestions) : setLocSuggestions(res.data.suggestions);
            }
        } catch (e) { }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            if (keywordInput) fetchSuggestions(keywordInput, 'keyword');
        }, 300);
        return () => clearTimeout(timer);
    }, [keywordInput]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (locationInput) fetchSuggestions(locationInput, 'location');
        }, 300);
        return () => clearTimeout(timer);
    }, [locationInput]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (suggestRef.current && !suggestRef.current.contains(event.target)) setShowSuggestions(false);
            if (locSuggestRef.current && !locSuggestRef.current.contains(event.target)) setShowLocSuggestions(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchCandidates = async (isManual = false) => {
        try {
            setLoading(true);
            const params = { ...filters, keyword: keywords.join(','), location: locationInput };
            const res = await axios.get(`${COMPANY_API_END_POINT}/talent-search`, { params, withCredentials: true });
            if (res.data.success) {
                setCandidates(res.data.candidates);
                setSearchPerformed(true);
                setSelectedIds([]); 
                if (isManual) {
                    if (res.data.count > 0) toast.success(`Found ${res.data.count} candidates`);
                    else toast.info("No candidates found.");
                }
            }
        } catch (error) { toast.error("Search failed"); }
        finally { setLoading(false); }
    };

    const fetchMe = async () => {
        try {
            const res = await axios.get(`${COMPANY_API_END_POINT}/me`, { withCredentials: true });
            if (res.data.success) setCompany(res.data.company);
        } catch (e) { }
    };

    useEffect(() => {
        fetchMe();
        fetchCandidates();
    }, []);

    const handleSearch = (e) => {
        e?.preventDefault();
        setShowSuggestions(false);
        setShowLocSuggestions(false);
        fetchCandidates(true);
    };

    const addKeyword = (name) => {
        const cleanName = name.trim();
        if (cleanName && !keywords.includes(cleanName)) setKeywords([...keywords, cleanName]);
        setKeywordInput('');
        setSuggestions([]);
        setShowSuggestions(false);
    };

    const removeKeyword = (name) => setKeywords(keywords.filter(k => k !== name));
    const selectLocation = (name) => { setLocationInput(name); setLocSuggestions([]); setShowLocSuggestions(false); };

    const unlockProfile = async (candidateId) => {
        try {
            const res = await axios.post(`${COMPANY_API_END_POINT}/unlock-candidate`, { candidateId }, { withCredentials: true });
            if (res.data.success) {
                toast.success("Profile Unlocked");
                setCandidates(prev => prev.map(c => c.id === candidateId ? { ...res.data.candidate, isUnlocked: true } : c));
                fetchMe();
            }
        } catch (error) { toast.error("Unlock failed"); }
    };

    const handleBulkUnlock = async () => {
        if (selectedIds.length === 0) return;
        try {
            setBulkUnlocking(true);
            const res = await axios.post(`${COMPANY_API_END_POINT}/bulk-unlock`, { candidateIds: selectedIds }, { withCredentials: true });
            if (res.data.success) {
                toast.success(res.data.message);
                fetchCandidates();
                fetchMe();
            }
        } catch (error) { toast.error("Bulk unlock failed"); }
        finally { setBulkUnlocking(false); }
    };

    const exportToExcel = () => {
        const unlockedOnes = candidates.filter(c => c.isUnlocked);
        if (unlockedOnes.length === 0) { toast.error("No unlocked profiles to export."); return; }

        const headers = ["Full Name", "Email", "Phone", "Headline", "Industry", "Location", "Experience", "Salary", "Resume Link", "Folder", "Rating", "Notes"];
        const rows = unlockedOnes.map(c => [
            c.fullName, c.email, c.phoneNumber, c.headline, c.industry, c.currentLocation, 
            `${c.experienceYears} Yrs`, `${c.currentSalary} LPA`, c.resume || "N/A",
            c.interaction?.folder || 'General', c.interaction?.rating || 0, c.interaction?.notes?.replace(/,/g, ';') || ''
        ]);

        let csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
        const link = document.createElement("a");
        link.setAttribute("href", encodeURI(csvContent));
        link.setAttribute("download", `Recruiter_Talent_Export.csv`);
        document.body.appendChild(link); link.click(); document.body.removeChild(link);
    };

    const toggleSelection = (id) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const openInteractionModal = (e, candidate) => {
        e.preventDefault();
        e.stopPropagation();
        if (!candidate.isUnlocked) {
            toast.info("Unlock this profile to manage notes and ratings.");
            return;
        }
        setActiveCandidate(candidate);
        setInteractionData(candidate.interaction);
        setShowInteractionModal(true);
    };

    const saveInteraction = async () => {
        try {
            setSavingInteraction(true);
            const res = await axios.post(`${COMPANY_API_END_POINT}/update-interaction`, {
                candidateId: activeCandidate.id,
                ...interactionData
            }, { withCredentials: true });
            
            if (res.data.success) {
                toast.success("Candidate updated in your pipeline");
                setCandidates(prev => prev.map(c => c.id === activeCandidate.id ? { ...c, interaction: res.data.interaction } : c));
                setShowInteractionModal(false);
            }
        } catch (error) { toast.error("Failed to save notes"); }
        finally { setSavingInteraction(false); }
    };

    const FilterSection = ({ title, icon: Icon, children }) => (
        <div className="space-y-2">
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">
                <Icon size={12} />
                <span>{title}</span>
            </div>
            {children}
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-6 bg-slate-50 min-h-screen font-sans relative">

            {/* Interaction Modal */}
            <AnimatePresence>
                {showInteractionModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-[2rem] w-full max-w-lg border border-slate-200 shadow-2xl overflow-hidden">
                            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm"><Settings size={20} className="text-indigo-600"/></div>
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight">Manage Candidate</h3>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{activeCandidate?.fullName}</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowInteractionModal(false)} className="p-2 hover:bg-white rounded-full transition-all text-slate-400 shadow-inner"><X size={20}/></button>
                            </div>
                            <div className="p-8 space-y-6">
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 block px-1">Recruiter Rating</label>
                                    <div className="flex gap-2">
                                        {[1,2,3,4,5].map(star => (
                                            <button key={star} onClick={() => setInteractionData({...interactionData, rating: star})} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${interactionData.rating >= star ? 'bg-amber-50 text-amber-500 shadow-sm border border-amber-100' : 'bg-slate-50 text-slate-300'}`}>
                                                <Star size={20} fill={interactionData.rating >= star ? "currentColor" : "none"}/>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 block px-1">Pipeline Folder</label>
                                    <div className="flex flex-wrap gap-2">
                                        {['General', 'Shortlisted', 'Interviewing', 'On Hold', 'Future Leads'].map(f => (
                                            <button key={f} onClick={() => setInteractionData({...interactionData, folder: f})} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${interactionData.folder === f ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}>{f}</button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 block px-1">Private Internal Notes</label>
                                    <textarea rows={4} value={interactionData.notes} onChange={(e) => setInteractionData({...interactionData, notes: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/10 transition-all text-sm font-medium" placeholder="E.g. Great communication skills, proficient in Node.js..."></textarea>
                                </div>
                                <div className="pt-2 border-t border-slate-50 flex items-center justify-between">
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <div className={`w-9 h-5 rounded-full p-1 transition-all ${interactionData.isContacted ? 'bg-emerald-500' : 'bg-slate-200'}`}><div className={`w-3 h-3 bg-white rounded-full transition-transform ${interactionData.isContacted ? 'translate-x-4' : ''}`}></div></div>
                                        <input type="checkbox" className="hidden" checked={interactionData.isContacted} onChange={(e) => setInteractionData({...interactionData, isContacted: e.target.checked})} />
                                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest group-hover:text-slate-800 transition-colors">Mark as Contacted</span>
                                    </label>
                                    <button disabled={savingInteraction} onClick={saveInteraction} className="px-8 py-3 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-2 uppercase tracking-widest">
                                        {savingInteraction ? <Loader2 size={16} className="animate-spin"/> : <CheckCircle size={16}/>} Save Detail
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Header */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-3">Discovery Engine <Sparkles className="text-indigo-500" size={24}/></h1>
                    <div className="flex items-center gap-3 mt-1">
                        <p className="text-slate-500 text-sm font-medium">Precision matching with internal talent management</p>
                        <Link to="/recruiter/unlocked-talent" className="text-[10px] font-bold text-indigo-600 uppercase bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 flex items-center gap-1 hover:bg-indigo-100"><Clock size={10}/> History</Link>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="bg-emerald-50 px-4 py-2 rounded-lg border border-emerald-100 flex items-center gap-3">
                        <Zap size={18} className="text-emerald-600" />
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase leading-none mb-1">Available Credits</p>
                            <p className="text-lg font-bold text-emerald-700 leading-none">{company?.databaseCredits || 0}</p>
                        </div>
                    </div>
                    <button onClick={() => navigate("/recruiter/buy-credits")} className="px-5 py-2.5 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 transition-all text-sm">Refill</button>
                </div>
            </div>

            {/* Selection Bar */}
            <AnimatePresence>
                {(selectedIds.length > 0 || candidates.some(c => c.isUnlocked)) && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between bg-indigo-900 text-white p-4 rounded-xl shadow-lg border border-indigo-800/50">
                        <div className="flex items-center gap-6">
                            {selectedIds.length > 0 && (
                                <div className="flex items-center gap-3 border-r border-indigo-700 pr-6">
                                    <span className="text-xs font-bold text-indigo-100">{selectedIds.length} profiles selected</span>
                                    <button onClick={handleBulkUnlock} disabled={bulkUnlocking} className="bg-white text-indigo-900 px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-emerald-50 transition-all flex items-center gap-2">
                                        {bulkUnlocking ? <Loader2 size={12} className="animate-spin"/> : <Zap size={12} fill="currentColor"/>}
                                        Unlock Selected ({selectedIds.length})
                                    </button>
                                </div>
                            )}
                            <button onClick={exportToExcel} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider bg-indigo-800 hover:bg-indigo-700 px-4 py-2 rounded-lg transition-all"><Download size={14}/> Export to Excel</button>
                        </div>
                        <button onClick={() => setSelectedIds([])} className="p-1 hover:bg-indigo-800 rounded-full transition-all text-indigo-300 hover:text-white"><X size={20}/></button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Search Form */}
            <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
                <form onSubmit={handleSearch} className="flex flex-col lg:flex-row gap-2">
                    <div className="flex-[2] relative" ref={suggestRef}>
                        <div className="flex flex-wrap items-center gap-2 p-2 bg-slate-50 border border-slate-100 rounded-lg min-h-[48px]">
                            <div className="pl-2 text-slate-400"><Search size={18} /></div>
                            {keywords.map(k => (
                                <span key={k} className="flex items-center gap-1 bg-indigo-600 text-white px-2.5 py-1 rounded-md text-[11px] font-semibold">
                                    {k}
                                    <X size={12} className="cursor-pointer" onClick={() => removeKeyword(k)} />
                                </span>
                            ))}
                            <input type="text" placeholder={keywords.length === 0 ? "Skills, Roles, Boolean Query..." : ""} className="flex-1 bg-transparent border-none outline-none text-sm font-medium text-slate-700 placeholder:text-slate-400 min-w-[150px]" value={keywordInput} onFocus={() => setShowSuggestions(true)} onChange={(e) => setKeywordInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && keywordInput) { e.preventDefault(); addKeyword(keywordInput); } }} />
                        </div>
                        <AnimatePresence>
                            {showSuggestions && suggestions.length > 0 && (
                                <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} className="absolute left-0 right-0 mt-2 bg-white border border-slate-200 rounded-lg shadow-lg z-50 overflow-hidden">
                                    {suggestions.map((s, i) => (
                                        <button key={i} type="button" onClick={() => addKeyword(s.name)} className="w-full flex items-center justify-between px-4 py-3 hover:bg-indigo-50 transition-colors text-left border-b border-slate-50 last:border-0">
                                            <span className="text-sm font-semibold text-slate-700">{s.name}</span>
                                            <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full uppercase">{s.type}</span>
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                    <div className="flex-1 relative" ref={locSuggestRef}>
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><MapPin size={18} /></div>
                        <input type="text" placeholder="Location" className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-lg outline-none text-sm font-medium text-slate-700" value={locationInput} onFocus={() => setShowLocSuggestions(true)} onChange={(e) => setLocationInput(e.target.value)} />
                        <AnimatePresence>
                            {showLocSuggestions && locSuggestions.length > 0 && (
                                <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} className="absolute left-0 right-0 mt-2 bg-white border border-slate-200 rounded-lg shadow-lg z-50 overflow-hidden">
                                    {locSuggestions.map((s, i) => (
                                        <button key={i} type="button" onClick={() => selectLocation(s.name)} className="w-full px-4 py-3 hover:bg-slate-50 text-left text-sm font-semibold text-slate-700 border-b border-slate-50 last:border-0">{s.name}</button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                    <button disabled={loading} className="px-8 py-3 bg-indigo-600 text-white font-bold text-sm rounded-lg hover:bg-indigo-700 transition-all flex items-center justify-center gap-2">{loading ? <Loader2 className="animate-spin" size={18} /> : "Discover"}</button>
                </form>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Sidebar - UPGRADED ADVANCED FILTERS */}
                <aside className="lg:col-span-3 space-y-4">
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-6 sticky top-6">
                        <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2"><Filter size={14} /> Power Filters</h3>
                            <button onClick={() => { setKeywords([]); setLocationInput(''); setFilters({ location: '', minExp: '', maxExp: '', minSalary: '', maxSalary: '', noticePeriod: 'All', experienceLevel: 'All', degree: 'All', jobType: 'All', workMode: 'All', lastActive: 'All', hasSocial: 'All', openToRelocate: false, companyName: '', institution: '', isImmediate: false }); }} className="text-[10px] font-bold text-indigo-600 hover:underline">Reset</button>
                        </div>

                        {/* NEW: Immediate Toggle */}
                        <div className="pt-1">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className={`w-9 h-5 rounded-full p-1 transition-all ${filters.isImmediate ? 'bg-amber-500' : 'bg-slate-200'}`}><div className={`w-3 h-3 bg-white rounded-full transition-transform ${filters.isImmediate ? 'translate-x-4' : ''}`}></div></div>
                                <input type="checkbox" className="hidden" checked={filters.isImmediate} onChange={(e) => setFilters({ ...filters, isImmediate: e.target.checked })} />
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-slate-800">Immediate Joiners</span>
                            </label>
                        </div>

                        {/* NEW: Company Search */}
                        <FilterSection title="Target Company" icon={Building2}>
                            <input type="text" placeholder="E.g. Google, Amazon..." className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-xs font-semibold outline-none" value={filters.companyName} onChange={(e) => setFilters({ ...filters, companyName: e.target.value })} />
                        </FilterSection>

                        {/* NEW: Institution Search */}
                        <FilterSection title="College / University" icon={School}>
                            <input type="text" placeholder="E.g. IIT, NIT..." className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-xs font-semibold outline-none" value={filters.institution} onChange={(e) => setFilters({ ...filters, institution: e.target.value })} />
                        </FilterSection>

                        <FilterSection title="Experience (Years)" icon={Briefcase}>
                            <div className="flex gap-2">
                                <input type="number" placeholder="Min" className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-xs font-semibold" value={filters.minExp} onChange={(e) => setFilters({ ...filters, minExp: e.target.value })} />
                                <input type="number" placeholder="Max" className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-xs font-semibold" value={filters.maxExp} onChange={(e) => setFilters({ ...filters, maxExp: e.target.value })} />
                            </div>
                        </FilterSection>

                        <FilterSection title="Education" icon={GraduationCap}>
                            <select className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-xs font-semibold outline-none" value={filters.degree} onChange={(e) => setFilters({ ...filters, degree: e.target.value })}>
                                <option value="All">All Degrees</option><option value="B.Tech">B.Tech</option><option value="M.Tech">M.Tech</option><option value="MBA">MBA</option><option value="MCA">MCA</option>
                            </select>
                        </FilterSection>

                        <FilterSection title="Work Mode" icon={Globe}>
                            <select className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-xs font-semibold outline-none" value={filters.workMode} onChange={(e) => setFilters({ ...filters, workMode: e.target.value })}>
                                <option value="All">Any Mode</option><option value="Remote">Remote</option><option value="Hybrid">Hybrid</option><option value="In-office">In-office</option>
                            </select>
                        </FilterSection>

                        <FilterSection title="Recency" icon={Clock}>
                            <select className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-xs font-semibold outline-none" value={filters.lastActive} onChange={(e) => setFilters({ ...filters, lastActive: e.target.value })}>
                                <option value="All">Anytime</option><option value="7">Active in 7 Days</option><option value="30">Active in 30 Days</option>
                            </select>
                        </FilterSection>
                        
                        <div className="pt-2 border-t border-slate-50">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <div className={`w-9 h-5 rounded-full p-1 transition-all ${filters.openToRelocate ? 'bg-indigo-600' : 'bg-slate-200'}`}><div className={`w-3 h-3 bg-white rounded-full transition-transform ${filters.openToRelocate ? 'translate-x-4' : ''}`}></div></div>
                                <input type="checkbox" className="hidden" checked={filters.openToRelocate} onChange={(e) => setFilters({ ...filters, openToRelocate: e.target.checked })} />
                                <span className="text-[11px] font-bold text-slate-600 uppercase flex items-center gap-2"><PlaneTakeoff size={14} /> Open to Relocate</span>
                            </label>
                        </div>
                    </div>
                </aside>

                {/* Feed - UPGRADED WITH INTERACTION DATA */}
                <div className="lg:col-span-9 space-y-4">
                    {loading ? (
                        <div className="text-center py-20 bg-white rounded-xl border border-slate-100"><Loader2 className="animate-spin mx-auto mb-4 text-indigo-500" size={32} /><p className="text-sm font-semibold text-slate-500 uppercase tracking-widest">Accessing Professional Vault...</p></div>
                    ) : candidates.length === 0 ? (
                        <div className="bg-white p-20 rounded-xl border border-slate-200 text-center shadow-sm">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6"><Search size={40} className="text-slate-200" /></div>
                            <h3 className="text-xl font-bold text-slate-800">No candidates match your power search</h3>
                            <p className="text-sm text-slate-500 mt-2">Try reducing filter complexity or broadening your keywords.</p>
                        </div>
                    ) : (
                        candidates.map((c) => (
                            <div key={c.id} className="relative group/card flex items-start gap-4">
                                <button onClick={() => toggleSelection(c.id)} className={`mt-10 w-6 h-6 rounded-lg border-2 transition-all flex items-center justify-center shrink-0 ${selectedIds.includes(c.id) ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-100' : 'bg-white border-slate-200 text-transparent hover:border-indigo-300'}`}><CheckCircle2 size={14} strokeWidth={3} /></button>
                                <div className={`flex-1 bg-white p-5 rounded-xl border transition-all flex flex-col gap-5 relative ${selectedIds.includes(c.id) ? 'border-indigo-400 ring-4 ring-indigo-50/50 shadow-sm' : 'border-slate-200 shadow-sm hover:border-indigo-100'}`}>
                                    <div className="flex flex-col md:flex-row gap-5">
                                        <Link to={`/recruiter/candidate/${c.id}`} className="w-20 h-20 bg-slate-100 rounded-lg overflow-hidden shrink-0 border border-slate-100 shadow-inner">
                                            <img src={c.profilePhoto || `https://ui-avatars.com/api/?name=${c.fullName}&background=6366f1&color=fff`} className={`w-full h-full object-cover ${!c.isUnlocked && 'blur-sm opacity-50'}`} />
                                        </Link>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <Link to={`/recruiter/candidate/${c.id}`} className="text-base font-bold text-slate-800 flex items-center gap-2 group-hover:text-indigo-600 transition-colors">
                                                        {c.isUnlocked ? c.fullName : c.fullName.split(' ')[0] + ' ****'}{c.isUnlocked && <ShieldCheck size={16} className="text-emerald-500" />}
                                                    </Link>
                                                    <p className="text-xs font-semibold text-indigo-600 mt-0.5">{c.headline || "Professional"}</p>
                                                    {/* Rating Display */}
                                                    {c.isUnlocked && c.interaction?.rating > 0 && (
                                                        <div className="flex gap-0.5 mt-1">
                                                            {[1,2,3,4,5].map(s => <Star key={s} size={10} fill={c.interaction.rating >= s ? "#f59e0b" : "none"} className={c.interaction.rating >= s ? "text-amber-500" : "text-slate-200"}/>)}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="text-right flex flex-col items-end gap-1 shrink-0">
                                                    <div className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                                                        <p className="text-base font-bold text-slate-800 leading-none">₹{c.currentSalary || 0} LPA</p>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">{c.experienceYears || 0} Yrs Exp</p>
                                                    </div>
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase">Updated {new Date(c.updatedAt).toLocaleDateString(undefined, {month: 'short', day:'numeric'})}</span>
                                                </div>
                                            </div>
                                            
                                            <div className="flex flex-wrap items-center gap-5 text-slate-500 mt-4">
                                                <div className="flex items-center gap-1.5"><MapPin size={14} className="text-slate-400" /><span className="text-[11px] font-semibold">{c.currentLocation || "N/A"}</span></div>
                                                <div className="flex items-center gap-1.5"><Clock size={14} className="text-slate-400" /><span className="text-[11px] font-semibold">{c.noticePeriod || "30 Days"} Notice</span></div>
                                                <div className="flex items-center gap-1.5 ml-auto">
                                                    {c.interaction?.isContacted && <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase rounded border border-emerald-100">Contacted</span>}
                                                    <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-100 rounded-md border border-slate-200"><TrendingUp size={12} className="text-emerald-500" /><span className="text-[10px] font-bold text-emerald-600">{c.matchScore || 70}% MATCH</span></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Bar inside card */}
                                    <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                        <div className="flex items-center gap-4">
                                            {c.isUnlocked ? (
                                                <>
                                                    <button onClick={(e) => openInteractionModal(e, c)} className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 hover:text-indigo-600 transition-all uppercase tracking-wider">
                                                        <MessageSquare size={14}/> {c.interaction?.notes ? 'View Notes' : 'Add Note'}
                                                    </button>
                                                    <button onClick={(e) => openInteractionModal(e, c)} className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 hover:text-indigo-600 transition-all uppercase tracking-wider">
                                                        <FolderPlus size={14}/> Pipeline: {c.interaction?.folder || 'General'}
                                                    </button>
                                                </>
                                            ) : (
                                                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest italic flex items-center gap-2"><Lock size={12}/> Unlock to manage candidate pipeline</p>
                                            )}
                                        </div>
                                        <div>
                                            {!c.isUnlocked ? (
                                                <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); unlockProfile(c.id); }} className="px-5 py-2 bg-indigo-600 text-white text-[11px] font-bold rounded-xl hover:bg-slate-900 transition-all flex items-center gap-2 shadow-sm shadow-indigo-100"><Zap size={14} fill="currentColor"/> Unlock Profile</button>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <span className="px-3 py-1.5 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded-full border border-emerald-100 flex items-center gap-1"><Unlock size={10} /> Unlocked</span>
                                                    {c.resume && <a href={c.resume} target="_blank" className="p-2 bg-slate-900 text-white rounded-lg hover:bg-indigo-600 transition-all shadow-sm"><Download size={14}/></a>}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default RecruiterTalentSearch;

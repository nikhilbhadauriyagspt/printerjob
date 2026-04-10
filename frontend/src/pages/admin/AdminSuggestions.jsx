import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { 
    Plus, 
    Upload, 
    Search, 
    Trash2, 
    Briefcase, 
    Building2, 
    Loader2, 
    CheckCircle2, 
    AlertCircle,
    FileText,
    Sparkles,
    Trash,
    Hash
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';

const AdminSuggestions = () => {
    const { type } = useParams(); // 'industry' | 'designation' | 'jobtitle' | 'skill'
    const navigate = useNavigate();
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    
    // Active Tab Sync (Ensures internal consistency if URL changes)
    const activeTab = type || 'industry';

    // Icon & Label Helper
    const getTypeConfig = () => {
        switch(activeTab) {
            case 'industry': return { label: 'Industry', icon: <Building2 size={14} />, listIcon: <Building2 size={32} /> };
            case 'designation': return { label: 'Designation', icon: <Briefcase size={14} />, listIcon: <Briefcase size={32} /> };
            case 'jobtitle': return { label: 'Job Title', icon: <FileText size={14} />, listIcon: <FileText size={32} /> };
            case 'skill': return { label: 'Skill', icon: <Hash size={14} />, listIcon: <Hash size={32} /> };
            default: return { label: 'Suggestion', icon: <Sparkles size={14} />, listIcon: <Sparkles size={32} /> };
        }
    };
    const config = getTypeConfig();
    
    // Modals
    const [showAddModal, setShowAddModal] = useState(false);
    const [showBulkModal, setShowBulkModal] = useState(false);
    
    const [singleItem, setSingleItem] = useState("");
    const [bulkItems, setBulkItems] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const fetchSuggestions = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`http://localhost:8000/api/v1/admin/suggestions?type=${activeTab}`, { withCredentials: true });
            if (res.data.success) {
                setSuggestions(res.data.suggestions);
            }
        } catch (error) {
            toast.error("Failed to fetch suggestions");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSuggestions();
    }, [activeTab]);

    const handleAddSingle = async (e) => {
        e.preventDefault();
        if (!singleItem.trim()) return;
        try {
            setSubmitting(true);
            const res = await axios.post("http://localhost:8000/api/v1/admin/suggestions/add", {
                type: activeTab,
                name: singleItem
            }, { withCredentials: true });
            
            if (res.data.success) {
                toast.success(`${singleItem} added successfully`);
                setSingleItem("");
                setShowAddModal(false);
                fetchSuggestions();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Addition failed");
        } finally {
            setSubmitting(false);
        }
    };

    const handleBulkUpload = async (e) => {
        e.preventDefault();
        const itemsArray = bulkItems.split(/[,\n]/).map(i => i.trim()).filter(i => i.length > 0);
        if (itemsArray.length === 0) return toast.error("Please enter at least one item");

        try {
            setSubmitting(true);
            const res = await axios.post("http://localhost:8000/api/v1/admin/suggestions/bulk", {
                type: activeTab,
                items: itemsArray
            }, { withCredentials: true });

            if (res.data.success) {
                toast.success(`Successfully uploaded ${itemsArray.length} items`);
                setBulkItems("");
                setShowBulkModal(false);
                fetchSuggestions();
            }
        } catch (error) {
            toast.error("Bulk upload failed");
        } finally {
            setSubmitting(false);
        }
    };

    const filteredSuggestions = suggestions.filter(s => 
        s.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20 px-4">
            
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">{config.label}s Manager</h1>
                    <p className="text-sm text-slate-500 font-medium">Control the dropdown options for recruiters worldwide.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setShowBulkModal(true)}
                        className="px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200 transition-all flex items-center gap-2"
                    >
                        <Upload size={16} /> Bulk Upload
                    </button>
                    <button 
                        onClick={() => setShowAddModal(true)}
                        className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-2"
                    >
                        <Plus size={18} /> Add New
                    </button>
                </div>
            </div>

            {/* Filter & Search Area */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 px-4">
                    <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                        {config.icon}
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Active View</p>
                        <span className="text-sm font-bold text-slate-700 tracking-tight">Managing {config.label}s</span>
                    </div>
                </div>
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                        type="text" 
                        placeholder={`Search ${config.label}s...`} 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-transparent rounded-xl text-sm focus:bg-white focus:border-indigo-200 transition-all outline-none font-medium"
                    />
                </div>
            </div>

            {/* Suggestions Grid */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                    <Loader2 className="animate-spin text-indigo-600" size={40} />
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading Repository...</p>
                </div>
            ) : filteredSuggestions.length === 0 ? (
                <div className="bg-white rounded-3xl border-2 border-dashed border-slate-100 py-20 flex flex-col items-center justify-center text-center space-y-4">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                        {config.listIcon}
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm font-bold text-slate-800">No {config.label}s found</p>
                        <p className="text-xs text-slate-400 font-medium">Add some items to help recruiters find them easily.</p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredSuggestions.map((item, index) => (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            key={index}
                            className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between group hover:border-indigo-200 transition-all"
                        >
                            <div className="flex items-center gap-3 truncate">
                                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all shrink-0">
                                    {config.icon}
                                </div>
                                <span className="text-sm font-bold text-slate-700 truncate">{item}</span>
                            </div>
                            <CheckCircle2 size={16} className="text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Single Add Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddModal(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white w-full max-w-md rounded-2xl shadow-xl relative z-10 overflow-hidden border border-slate-200">
                            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                                <h3 className="text-lg font-bold text-slate-800">Add {config.label}</h3>
                                <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-800 font-bold">✕</button>
                            </div>
                            <form onSubmit={handleAddSingle} className="p-6 space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{config.label} Name</label>
                                    <input 
                                        autoFocus
                                        required 
                                        type="text" 
                                        value={singleItem}
                                        onChange={(e) => setSingleItem(e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-600 transition-all font-bold text-sm" 
                                        placeholder={`Enter ${config.label} name...`}
                                    />
                                </div>
                                <button 
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                                >
                                    {submitting ? <Loader2 className="animate-spin" size={18}/> : `Add ${config.label}`}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Bulk Upload Modal */}
            <AnimatePresence>
                {showBulkModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowBulkModal(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white w-full max-w-lg rounded-3xl shadow-xl relative z-10 overflow-hidden border border-slate-200">
                            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
                                        <Upload size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-800">Bulk Import {config.label}s</h3>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Efficiency Protocol v1.0</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowBulkModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white text-slate-400 hover:text-slate-800 transition-all font-bold">✕</button>
                            </div>
                            
                            <form onSubmit={handleBulkUpload} className="p-8 space-y-6">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between px-1">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Input List</label>
                                        <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">CSV / New Lines</span>
                                    </div>
                                    <textarea 
                                        required 
                                        rows={8}
                                        value={bulkItems}
                                        onChange={(e) => setBulkItems(e.target.value)}
                                        className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:bg-white focus:border-indigo-600 transition-all font-medium text-sm leading-relaxed" 
                                        placeholder={`Paste multiple ${config.label}s here...\nExample:\nReact.js\nNode.js\nSystem Architecture`}
                                    />
                                </div>

                                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-4">
                                    <AlertCircle className="text-amber-600 shrink-0" size={20} />
                                    <div className="space-y-1">
                                        <p className="text-xs font-bold text-amber-800">Formatting Tip</p>
                                        <p className="text-[10px] text-amber-700 font-medium leading-relaxed">Separate each item by a comma (,) or a new line. Duplicate entries will be automatically ignored by the system.</p>
                                    </div>
                                </div>

                                <button 
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full py-4 bg-indigo-600 text-white rounded-2xl text-sm font-bold shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-3"
                                >
                                    {submitting ? <Loader2 className="animate-spin" size={20}/> : (
                                        <>
                                            <Sparkles size={18} /> Process & Import List
                                        </>
                                    )}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminSuggestions;

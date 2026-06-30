import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { 
    Plus, 
    Trash2, 
    Loader2, 
    Zap, 
    Clock, 
    ShieldCheck, 
    Briefcase,
    LayoutGrid,
    Database,
    ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminPackages = () => {
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        price: '',
        durationDays: '',
        jobLimit: 0,
        tier: 1,
        description: '',
        type: 'job_post',
        databaseCredits: 0
    });

    const fetchPackages = async () => {
        try {
            const res = await axios.get("https://mediumturquoise-goshawk-440855.hostingersite.com/api/v1/admin/packages", { withCredentials: true });
            if (res.data.success) setPackages(res.data.packages);
        } catch (error) {
            toast.error("Failed to load packages");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPackages();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleEdit = (pkg) => {
        setFormData({
            name: pkg.name,
            price: pkg.price,
            durationDays: pkg.durationDays,
            jobLimit: pkg.jobLimit || 0,
            tier: pkg.tier || 1,
            description: pkg.description || '',
            type: pkg.type || 'job_post',
            databaseCredits: pkg.databaseCredits || 0
        });
        setIsEditing(true);
        setEditId(pkg.id);
        setShowAddForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure?")) return;
        try {
            const res = await axios.delete(`https://mediumturquoise-goshawk-440855.hostingersite.com/api/v1/admin/packages/${id}`, { withCredentials: true });
            if (res.data.success) {
                toast.success(res.data.message);
                fetchPackages();
            }
        } catch (error) { toast.error("Delete failed"); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            const res = isEditing 
                ? await axios.put(`https://mediumturquoise-goshawk-440855.hostingersite.com/api/v1/admin/packages/${editId}`, formData, { withCredentials: true })
                : await axios.post("https://mediumturquoise-goshawk-440855.hostingersite.com/api/v1/admin/packages", formData, { withCredentials: true });

            if (res.data.success) {
                toast.success(res.data.message);
                handleCancel();
                fetchPackages();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to process");
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = () => {
        setShowAddForm(false);
        setIsEditing(false);
        setEditId(null);
        setFormData({ name: '', price: '', durationDays: '', jobLimit: 0, tier: 1, description: '', type: 'job_post', databaseCredits: 0 });
    };

    return (
        <div className="max-w-6xl mx-auto pb-20 px-4 font-sans">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 border-b border-slate-100 pb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Monetization Plans</h1>
                    <p className="text-sm text-slate-500 font-medium mt-1">Configure job posting and talent search packages.</p>
                </div>
                <button 
                    onClick={() => showAddForm ? handleCancel() : setShowAddForm(true)}
                    className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${showAddForm ? 'bg-slate-100 text-slate-600' : 'bg-indigo-600 text-white shadow-lg shadow-indigo-100'}`}
                >
                    {showAddForm ? "Cancel" : <><Plus size={18} /> Create Plan</>}
                </button>
            </div>

            <AnimatePresence>
                {showAddForm && (
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="mb-10">
                        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-5">
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Package Type</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button type="button" onClick={() => setFormData({...formData, type: 'job_post'})} className={`py-3 rounded-xl text-xs font-bold border transition-all ${formData.type === 'job_post' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-slate-50 border-transparent text-slate-500'}`}>Job Postings</button>
                                        <button type="button" onClick={() => setFormData({...formData, type: 'database_access'})} className={`py-3 rounded-xl text-xs font-bold border transition-all ${formData.type === 'database_access' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-slate-50 border-transparent text-slate-500'}`}>Database Credits</button>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Package Name</label>
                                    <input name="name" value={formData.name} onChange={handleInputChange} required className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none text-sm font-semibold" placeholder="e.g. Talent Search Pro" />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Price (INR)</label>
                                        <input type="number" name="price" value={formData.price} onChange={handleInputChange} required className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-semibold" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Validity (Days)</label>
                                        <input type="number" name="durationDays" value={formData.durationDays} onChange={handleInputChange} required className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-semibold" />
                                    </div>
                                </div>

                                {formData.type === 'job_post' ? (
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Job Posting Limit (-1 for Unlimited)</label>
                                        <input type="number" name="jobLimit" value={formData.jobLimit} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-semibold" />
                                    </div>
                                ) : (
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Database Credits (Profiles)</label>
                                        <input type="number" name="databaseCredits" value={formData.databaseCredits} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-semibold" placeholder="e.g. 50" />
                                    </div>
                                )}
                            </div>

                            <div className="space-y-5 flex flex-col">
                                <div className="flex-1">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Description</label>
                                    <textarea name="description" value={formData.description} onChange={handleInputChange} rows={6} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium outline-none focus:bg-white transition-all" placeholder="What's included in this plan?" />
                                </div>
                                <button type="submit" disabled={submitting} className="w-full py-4 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2">
                                    {submitting ? <Loader2 className="animate-spin" size={20}/> : (isEditing ? "Update Plan" : "Create Plan")}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {loading ? (
                <div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-600" size={32} /></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {packages.map((pkg) => (
                        <div key={pkg.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
                            <div className="flex justify-between items-start mb-6">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${pkg.type === 'database_access' ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'}`}>
                                    {pkg.type === 'database_access' ? <Database size={24} /> : <Zap size={24} fill="currentColor" />}
                                </div>
                                <div className="text-right">
                                    <p className="text-xl font-bold text-slate-800">₹{pkg.price}</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">{pkg.durationDays} Days</p>
                                </div>
                            </div>
                            <h3 className="font-bold text-slate-800 mb-1">{pkg.name}</h3>
                            <p className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider mb-3">{pkg.type === 'database_access' ? 'Talent Search' : 'Recruitment'}</p>
                            <p className="text-xs text-slate-500 font-medium mb-6 line-clamp-2">{pkg.description}</p>
                            
                            <div className="space-y-3 mb-8 flex-1">
                                {pkg.type === 'job_post' ? (
                                    <div className="flex items-center gap-3 text-xs font-bold text-slate-600"><Briefcase size={14} className="text-indigo-400"/> {pkg.jobLimit === -1 ? "Unlimited" : pkg.jobLimit} Job Posts</div>
                                ) : (
                                    <div className="flex items-center gap-3 text-xs font-bold text-slate-600"><Database size={14} className="text-emerald-400"/> {pkg.databaseCredits} Profile Unlocks</div>
                                )}
                                <div className="flex items-center gap-3 text-xs font-bold text-slate-600"><Clock size={14} className="text-slate-400"/> {pkg.durationDays} Days Validity</div>
                                <div className="flex items-center gap-3 text-xs font-bold text-slate-600"><ShieldCheck size={14} className="text-indigo-400"/> Admin Verified</div>
                            </div>

                            <div className="flex gap-2">
                                <button onClick={() => handleEdit(pkg)} className="flex-1 py-2 bg-slate-50 text-slate-600 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-slate-100 transition-all">Edit</button>
                                <button onClick={() => handleDelete(pkg.id)} className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 transition-all"><Trash2 size={16}/></button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminPackages;

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
    IndianRupee
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
        jobLimit: -1, // -1 for unlimited
        tier: 1,
        description: ''
    });

    const fetchPackages = async () => {
        try {
            const res = await axios.get("http://localhost:8000/api/v1/admin/packages", { withCredentials: true });
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
            jobLimit: pkg.jobLimit,
            tier: pkg.tier || 1,
            description: pkg.description || ''
        });
        setIsEditing(true);
        setEditId(pkg.id);
        setShowAddForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this package?")) return;
        try {
            const res = await axios.delete(`http://localhost:8000/api/v1/admin/packages/${id}`, { withCredentials: true });
            if (res.data.success) {
                toast.success(res.data.message);
                fetchPackages();
            }
        } catch (error) {
            toast.error("Failed to delete package");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            let res;
            if (isEditing) {
                res = await axios.put(`http://localhost:8000/api/v1/admin/packages/${editId}`, formData, { withCredentials: true });
            } else {
                res = await axios.post("http://localhost:8000/api/v1/admin/packages", formData, { withCredentials: true });
            }

            if (res.data.success) {
                toast.success(res.data.message);
                setShowAddForm(false);
                setIsEditing(false);
                setEditId(null);
                setFormData({ name: '', price: '', durationDays: '', jobLimit: -1, tier: 1, description: '' });
                fetchPackages();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to process package");
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = () => {
        setShowAddForm(false);
        setIsEditing(false);
        setEditId(null);
        setFormData({ name: '', price: '', durationDays: '', jobLimit: -1, tier: 1, description: '' });
    };

    return (
        <div className="max-w-6xl mx-auto pb-20 px-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 border-b border-slate-100 pb-8">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight">Recruitment Packages</h1>
                    <p className="text-sm text-slate-500 font-medium mt-1">Manage paid subscription plans for recruiters.</p>
                </div>
                <button 
                    onClick={() => showAddForm ? handleCancel() : setShowAddForm(true)}
                    className={`px-6 py-2.5 ${showAddForm ? 'bg-slate-100 text-slate-600' : 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700'} rounded-xl text-xs font-bold transition-all flex items-center gap-2`}
                >
                    {showAddForm ? "Cancel" : <><Plus size={18} /> Create New Plan</>}
                </button>
            </div>

            <AnimatePresence>
                {showAddForm && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden mb-10"
                    >
                        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Package Name</label>
                                    <input name="name" value={formData.name} onChange={handleInputChange} required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-600 transition-all text-sm font-bold" placeholder="e.g. Standard Monthly" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Price (INR)</label>
                                        <input type="number" name="price" value={formData.price} onChange={handleInputChange} required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-600 transition-all text-sm font-bold" placeholder="4999" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Tier (1-10)</label>
                                        <input type="number" name="tier" min="1" max="10" value={formData.tier} onChange={handleInputChange} required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-600 transition-all text-sm font-bold" placeholder="1" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Duration (Days)</label>
                                        <input type="number" name="durationDays" value={formData.durationDays} onChange={handleInputChange} required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-600 transition-all text-sm font-bold" placeholder="30" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Job Limit (-1 for Unlimited)</label>
                                        <input type="number" name="jobLimit" value={formData.jobLimit} onChange={handleInputChange} required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-600 transition-all text-sm font-bold" />
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4 flex flex-col">
                                <div className="space-y-1.5 flex-1">
                                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Plan Description</label>
                                    <textarea name="description" value={formData.description} onChange={handleInputChange} rows={5} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:bg-white focus:border-indigo-600 outline-none transition-all leading-relaxed" placeholder="Mention key benefits of this plan..." />
                                </div>
                                <button 
                                    type="submit" 
                                    disabled={submitting}
                                    className="w-full py-4 bg-indigo-600 text-white rounded-2xl text-sm font-bold shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                                >
                                    {submitting ? <Loader2 className="animate-spin" size={20}/> : (isEditing ? "Update Package" : "Save Package")}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="animate-spin text-indigo-600" size={32} />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {packages.map((pkg) => (
                        <div key={pkg.id} className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm hover:shadow-md transition-all group">
                            <div className="flex justify-between items-start mb-6">
                                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                                    <Zap size={24} fill="currentColor" />
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-black text-slate-800">₹{pkg.price}</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{pkg.durationDays} Days</p>
                                </div>
                            </div>
                            <h3 className="text-lg font-bold text-slate-800 mb-2">{pkg.name}</h3>
                            <p className="text-xs text-slate-500 font-medium mb-6 line-clamp-2">{pkg.description}</p>
                            
                            <div className="space-y-3 mb-8">
                                <div className="flex items-center gap-3 text-xs font-bold text-slate-600">
                                    <Briefcase size={14} className="text-indigo-400"/>
                                    {pkg.jobLimit === -1 ? "Unlimited" : pkg.jobLimit} Job Posts
                                </div>
                                <div className="flex items-center gap-3 text-xs font-bold text-slate-600">
                                    <Clock size={14} className="text-indigo-400"/>
                                    {pkg.durationDays} Days Validity
                                </div>
                                <div className="flex items-center gap-3 text-xs font-bold text-slate-600">
                                    <ShieldCheck size={14} className="text-emerald-400"/>
                                    Full Support
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button 
                                    onClick={() => handleEdit(pkg)}
                                    className="flex-1 py-2.5 bg-slate-50 text-slate-600 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-slate-100 transition-all"
                                >
                                    Edit Plan
                                </button>
                                <button 
                                    onClick={() => handleDelete(pkg.id)}
                                    className="p-2.5 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition-all"
                                >
                                    <Trash2 size={16}/>
                                </button>
                            </div>
                        </div>
                    ))}
                    {packages.length === 0 && (
                        <div className="col-span-full py-20 text-center bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-200">
                            <LayoutGrid className="mx-auto text-slate-300 mb-4" size={48} />
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No packages created yet</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AdminPackages;

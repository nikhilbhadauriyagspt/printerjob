import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { 
    MessageSquare, 
    ShieldCheck, 
    Power, 
    Loader2, 
    User,
    Mail,
    Lock,
    Settings as SettingsIcon,
    Bell,
    ChevronRight,
    Globe,
    Zap,
    Shield,
    CreditCard,
    Key,
    DollarSign,
    RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';

const AdminSettings = () => {
    const { user } = useSelector(store => store.auth);
    const [isSupportEnabled, setIsSupportEnabled] = useState(true);
    const [freeMonths, setFreeMonths] = useState(6);
    const [loading, setLoading] = useState(true);
    const [toggling, setToggling] = useState(false);
    const [updatingFree, setUpdatingFree] = useState(false);
    const [updatingPayment, setUpdatingPayment] = useState(false);

    // Payment States
    const [activeGateway, setActiveGateway] = useState('none');
    const [paymentMode, setPaymentMode] = useState('sandbox');
    const [currency, setCurrency] = useState('INR');
    const [razorpayKeyId, setRazorpayKeyId] = useState('');
    const [razorpaySecret, setRazorpaySecret] = useState('');
    const [paypalClientId, setPaypalClientId] = useState('');
    const [paypalSecret, setPaypalSecret] = useState('');

    const [activeTab, setActiveTab] = useState('razorpay');

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const res = await axios.get("http://localhost:8000/api/v1/admin/config", { withCredentials: true });
                if (res.data.success) {
                    const config = res.data.config;
                    setIsSupportEnabled(config.isSupportEnabled !== false); // Ensure boolean
                    setFreeMonths(config.defaultFreeMonths || 6);
                    setActiveGateway(config.activeGateway || 'none');
                    setPaymentMode(config.paymentMode || 'sandbox');
                    setCurrency(config.currency || 'INR');
                    setRazorpayKeyId(config.razorpayKeyId || '');
                    setRazorpaySecret(config.razorpaySecret || '');
                    setPaypalClientId(config.paypalClientId || '');
                    setPaypalSecret(config.paypalSecret || '');
                }
            } catch (error) {
                console.error("Config fetch fail");
            } finally {
                setLoading(false);
            }
        };
        fetchConfig();
    }, []);

    const handleToggleSupport = async () => {
        try {
            setToggling(true);
            const res = await axios.put("http://localhost:8000/api/v1/admin/config/support", 
                { isEnabled: !isSupportEnabled }, 
                { withCredentials: true }
            );
            if (res.data.success) {
                setIsSupportEnabled(res.data.isEnabled);
                toast.success(`Support system ${res.data.isEnabled ? 'Enabled' : 'Disabled'}`);
            }
        } catch (error) {
            toast.error("Failed to update status");
        } finally {
            setToggling(false);
        }
    };

    const handleUpdateFreeMonths = async () => {
        try {
            setUpdatingFree(true);
            const res = await axios.put("http://localhost:8000/api/v1/admin/config/free-access", 
                { months: freeMonths }, 
                { withCredentials: true }
            );
            if (res.data.success) {
                toast.success(res.data.message);
            }
        } catch (error) {
            toast.error("Failed to update settings");
        } finally {
            setUpdatingFree(false);
        }
    };

    const handleUpdatePaymentSettings = async () => {
        try {
            setUpdatingPayment(true);
            const res = await axios.put("http://localhost:8000/api/v1/admin/config/payment", 
                { 
                    activeGateway, 
                    paymentMode, 
                    currency, 
                    razorpayKeyId, 
                    razorpaySecret, 
                    paypalClientId, 
                    paypalSecret 
                }, 
                { withCredentials: true }
            );
            if (res.data.success) {
                toast.success("Payment settings updated successfully");
            }
        } catch (error) {
            toast.error("Failed to update payment settings");
        } finally {
            setUpdatingPayment(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-indigo-600 mb-4" size={32} />
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading Configuration...</p>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto pb-20 animate-in fade-in duration-500">
            
            {/* Header */}
            <div className="mb-10 px-4">
                <h1 className="text-2xl font-bold text-slate-800 tracking-tight">System Settings</h1>
                <p className="text-sm text-slate-500 font-medium">Manage your administrative account and global platform features.</p>
            </div>

            <div className="space-y-6 px-4">
                
                {/* Section 1: Account Overview */}
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                    <div className="p-6 border-b border-slate-50 flex items-center gap-3 bg-slate-50/30">
                        <User className="text-indigo-600" size={20} />
                        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Administrative Profile</h2>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                            <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-xl">
                                <UserCircle size={18} className="text-slate-400" />
                                <span className="text-sm font-semibold text-slate-700">{user?.fullName}</span>
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                            <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-xl">
                                <Mail size={18} className="text-slate-400" />
                                <span className="text-sm font-semibold text-slate-700">{user?.email}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section: Payment Gateway Configuration */}
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                    <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                        <div className="flex items-center gap-3">
                            <CreditCard className="text-indigo-600" size={20} />
                            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Payment Gateways</h2>
                        </div>
                        <div className="flex items-center gap-2">
                             <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${paymentMode === 'live' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                                <div className={`w-1.5 h-1.5 rounded-full ${paymentMode === 'live' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></div>
                                {paymentMode} mode
                             </div>
                        </div>
                    </div>

                    <div className="p-6 space-y-8">
                        {/* Global Payment Toggles */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Active Gateway</label>
                                <select 
                                    value={activeGateway}
                                    onChange={(e) => setActiveGateway(e.target.value)}
                                    className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer"
                                >
                                    <option value="none">Disabled</option>
                                    <option value="razorpay">Razorpay Only</option>
                                    <option value="paypal">PayPal Only</option>
                                    <option value="both">Both Enabled</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Environment</label>
                                <select 
                                    value={paymentMode}
                                    onChange={(e) => setPaymentMode(e.target.value)}
                                    className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer"
                                >
                                    <option value="sandbox">Sandbox / Testing</option>
                                    <option value="live">Production / Live</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Currency</label>
                                <select 
                                    value={currency}
                                    onChange={(e) => setCurrency(e.target.value)}
                                    className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer"
                                >
                                    <option value="INR">INR (₹)</option>
                                    <option value="USD">USD ($)</option>
                                    <option value="EUR">EUR (€)</option>
                                    <option value="GBP">GBP (£)</option>
                                </select>
                            </div>
                        </div>

                        {/* Keys Configuration Tabs */}
                        <div className="border border-slate-100 rounded-2xl overflow-hidden">
                            <div className="flex bg-slate-50 border-b border-slate-100">
                                <button 
                                    onClick={() => setActiveTab('razorpay')}
                                    className={`flex-1 py-3 px-4 text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'razorpay' ? 'bg-white text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    Razorpay Credentials
                                </button>
                                <button 
                                    onClick={() => setActiveTab('paypal')}
                                    className={`flex-1 py-3 px-4 text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'paypal' ? 'bg-white text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    PayPal Credentials
                                </button>
                            </div>
                            
                            <div className="p-6">
                                <AnimatePresence mode='wait'>
                                    {activeTab === 'razorpay' ? (
                                        <motion.div 
                                            key="razorpay"
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 10 }}
                                            className="space-y-4"
                                        >
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Key ID</label>
                                                <div className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl focus-within:border-indigo-500 transition-all">
                                                    <Key size={16} className="text-slate-400" />
                                                    <input 
                                                        type="text"
                                                        value={razorpayKeyId}
                                                        onChange={(e) => setRazorpayKeyId(e.target.value)}
                                                        placeholder="rzp_test_..."
                                                        className="w-full text-sm font-semibold text-slate-700 outline-none"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Key Secret</label>
                                                <div className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl focus-within:border-indigo-500 transition-all">
                                                    <ShieldCheck size={16} className="text-slate-400" />
                                                    <input 
                                                        type="password"
                                                        value={razorpaySecret}
                                                        onChange={(e) => setRazorpaySecret(e.target.value)}
                                                        placeholder="••••••••••••••••"
                                                        className="w-full text-sm font-semibold text-slate-700 outline-none"
                                                    />
                                                </div>
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <motion.div 
                                            key="paypal"
                                            initial={{ opacity: 0, x: 10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -10 }}
                                            className="space-y-4"
                                        >
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Client ID</label>
                                                <div className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl focus-within:border-indigo-500 transition-all">
                                                    <Key size={16} className="text-slate-400" />
                                                    <input 
                                                        type="text"
                                                        value={paypalClientId}
                                                        onChange={(e) => setPaypalClientId(e.target.value)}
                                                        placeholder="PayPal Client ID"
                                                        className="w-full text-sm font-semibold text-slate-700 outline-none"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Secret Key</label>
                                                <div className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl focus-within:border-indigo-500 transition-all">
                                                    <ShieldCheck size={16} className="text-slate-400" />
                                                    <input 
                                                        type="password"
                                                        value={paypalSecret}
                                                        onChange={(e) => setPaypalSecret(e.target.value)}
                                                        placeholder="••••••••••••••••"
                                                        className="w-full text-sm font-semibold text-slate-700 outline-none"
                                                    />
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* Save Button */}
                        <div className="flex justify-end pt-4">
                            <button 
                                onClick={handleUpdatePaymentSettings}
                                disabled={updatingPayment}
                                className="px-8 py-3 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-slate-200"
                            >
                                {updatingPayment ? <Loader2 className="animate-spin" size={14}/> : <RefreshCw size={14}/>}
                                Save Payment Configuration
                            </button>
                        </div>
                    </div>
                </div>

                {/* Section 2: Platform Controls */}
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                    <div className="p-6 border-b border-slate-50 flex items-center gap-3 bg-slate-50/30">
                        <Zap className="text-amber-500" size={20} />
                        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">System Capabilities</h2>
                    </div>
                    
                    <div className="p-6 space-y-4">
                        {/* Support Toggle Card */}
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <div className="flex gap-4">
                                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                                    <MessageSquare className="text-indigo-600" size={20} />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-700">Recruiter Support Bridge</p>
                                    <p className="text-[11px] text-slate-500 font-medium">Allow recruiters to message platform administrators.</p>
                                </div>
                            </div>
                            <button 
                                onClick={handleToggleSupport}
                                disabled={toggling}
                                className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all flex items-center gap-2 ${isSupportEnabled ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}
                            >
                                {toggling ? <Loader2 className="animate-spin" size={12}/> : <Power size={12}/>}
                                {isSupportEnabled ? 'System Active' : 'System Halted'}
                            </button>
                        </div>

                        {/* SEO / Slug Generation (Information only) */}
                        <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-100">
                            <div className="flex gap-4">
                                <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400">
                                    <Globe size={20} />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-700">SEO Metadata Engine</p>
                                    <p className="text-[11px] text-slate-500 font-medium italic">Automatic slug generation for all active jobs.</p>
                                </div>
                            </div>
                            <span className="px-3 py-1 bg-slate-50 text-slate-400 text-[9px] font-bold rounded-md uppercase tracking-widest border border-slate-100">Core Feature</span>
                        </div>

                        {/* Free Access Settings */}
                        <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 mt-6">
                            <div className="flex items-center gap-3 mb-4">
                                <Zap className="text-indigo-600" size={18} />
                                <p className="text-sm font-bold text-slate-700">Recruiter Free Access Policy</p>
                            </div>
                            <div className="flex items-end gap-4">
                                <div className="flex-1 space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Default Free Months</label>
                                    <input 
                                        type="number" 
                                        value={freeMonths}
                                        onChange={(e) => setFreeMonths(e.target.value)}
                                        className="w-full p-2.5 bg-white border border-indigo-100 rounded-lg text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                        placeholder="e.g. 6"
                                    />
                                </div>
                                <button 
                                    onClick={handleUpdateFreeMonths}
                                    disabled={updatingFree}
                                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-2 shadow-sm shadow-indigo-200"
                                >
                                    {updatingFree ? <Loader2 className="animate-spin" size={14}/> : null}
                                    Update Policy
                                </button>
                            </div>
                            <p className="text-[10px] text-slate-400 font-medium mt-3 italic">* This duration will be applied to all NEW recruiters who complete their profile 100%.</p>
                        </div>
                    </div>
                </div>

                {/* Section 3: Security & Governance */}
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                    <div className="p-6 border-b border-slate-50 flex items-center gap-3 bg-slate-50/30">
                        <Shield className="text-emerald-600" size={20} />
                        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Security & Privacy</h2>
                    </div>
                    <div className="p-6">
                        <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200">
                            <div className="flex gap-4">
                                <div className="w-10 h-10 bg-rose-50 rounded-lg flex items-center justify-center text-rose-600">
                                    <Lock size={20} />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-700">Change Administrator Password</p>
                                    <p className="text-[11px] text-slate-500 font-medium italic">Update your security credentials regularly.</p>
                                </div>
                            </div>
                            <button className="px-4 py-2 bg-white border border-slate-200 hover:border-indigo-600 hover:text-indigo-600 rounded-lg text-xs font-bold transition-all">
                                Update
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

const UserCircle = ({ size, className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
);

export default AdminSettings;


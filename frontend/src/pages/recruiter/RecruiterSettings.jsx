import React, { useState } from 'react';
import { 
    Lock, 
    ShieldCheck, 
    Mail, 
    Smartphone, 
    ChevronRight, 
    Loader2,
    CheckCircle2,
    AlertCircle,
    KeyRound
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast } from 'sonner';
import { useSelector } from 'react-redux';

const API_BASE = "http://localhost:8000/api/v1/company";

const RecruiterSettings = () => {
    const { user } = useSelector(store => store.auth);
    const [loading, setLoading] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    
    const [formData, setFormData] = useState({
        otp: "",
        newPassword: "",
        confirmPassword: ""
    });

    const sendOtpHandler = async () => {
        try {
            setLoading(true);
            const res = await axios.post(`${API_BASE}/send-password-otp`, {}, { withCredentials: true });
            if (res.data.success) {
                setOtpSent(true);
                toast.success("Verification OTP sent to your registered email");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to send OTP");
        } finally {
            setLoading(false);
        }
    };

    const handleSetPassword = async (e) => {
        e.preventDefault();
        if (formData.newPassword !== formData.confirmPassword) {
            return toast.error("Passwords do not match");
        }

        try {
            setLoading(true);
            const res = await axios.post(`${API_BASE}/set-password-google`, {
                password: formData.newPassword,
                otp: formData.otp
            }, { withCredentials: true });

            if (res.data.success) {
                toast.success("Security Updated! Please login with your new password.");
                setShowPasswordModal(false);
                
                // Logout and Redirect
                await axios.post(`${API_BASE}/logout`, {}, { withCredentials: true });
                window.location.href = "/recruiter/login";
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to set password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            <div>
                <h1 className="text-2xl font-bold text-slate-800">Account Settings</h1>
                <p className="text-sm text-slate-500 font-medium">Manage your security preferences and login methods.</p>
            </div>

            <div className="grid grid-cols-1 gap-6">
                
                {/* Login Methods Card */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                            <ShieldCheck size={18} className="text-indigo-600" /> Login & Security
                        </h3>
                    </div>
                    
                    <div className="p-6 space-y-6">
                        {/* Google Login Status */}
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <div className="flex gap-4">
                                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                                    <img src="https://www.gstatic.com/images/branding/product/1x/googleg_48dp.png" className="w-5 h-5" alt="Google" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-700">Google Authentication</p>
                                    <p className="text-xs text-slate-500 font-medium">
                                        {user?.allowGoogleLogin 
                                            ? `Direct access enabled for ${user?.email}` 
                                            : "Direct access disabled for security"}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {user?.allowGoogleLogin ? (
                                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-tight rounded-md border border-emerald-100">Active</span>
                                ) : (
                                    <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-tight rounded-md border border-slate-200">Disabled</span>
                                )}
                            </div>
                        </div>

                        {/* Password Setting Option */}
                        {user?.allowGoogleLogin && (
                            <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200">
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
                                        <KeyRound size={20} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-700">Email & Password Login</p>
                                        <p className="text-xs text-slate-500 font-medium italic">Create a password to disable Google Login and use traditional sign-in.</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setShowPasswordModal(true)}
                                    className="px-4 py-2 bg-white border border-slate-200 hover:border-indigo-600 hover:text-indigo-600 rounded-lg text-xs font-bold transition-all"
                                >
                                    Set Password
                                </button>
                            </div>
                        )}

                        {!user?.allowGoogleLogin && (
                            <div className="flex items-center justify-between p-4 bg-indigo-50/30 rounded-xl border border-indigo-100">
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
                                        <Lock size={20} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-indigo-900">Manual Login Active</p>
                                        <p className="text-xs text-indigo-700 font-medium">You are using Email & Password to secure your account.</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 size={18} className="text-indigo-600" />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Verification Status */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
                    <h3 className="text-sm font-bold text-slate-800">Verification Status</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl">
                            <CheckCircle2 size={20} className="text-emerald-500" />
                            <div>
                                <p className="text-xs font-bold text-slate-700 uppercase tracking-tighter">Email Verified</p>
                                <p className="text-[10px] text-slate-500 font-medium">{user?.email}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl">
                            <CheckCircle2 size={20} className="text-emerald-500" />
                            <div>
                                <p className="text-xs font-bold text-slate-700 uppercase tracking-tighter">Phone Verified</p>
                                <p className="text-[10px] text-slate-500 font-medium">Authenticated with OTP</p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* Set Password Modal */}
            <AnimatePresence>
                {showPasswordModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowPasswordModal(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white w-full max-w-md rounded-2xl shadow-xl relative z-10 overflow-hidden border border-slate-200">
                            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                                <h3 className="text-lg font-bold text-slate-800">Setup Account Password</h3>
                                <button onClick={() => setShowPasswordModal(false)} className="text-slate-400 hover:text-slate-800 font-bold">✕</button>
                            </div>
                            
                            <div className="p-6 space-y-6">
                                {!otpSent ? (
                                    <div className="text-center space-y-4 py-4">
                                        <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto text-indigo-600">
                                            <Mail size={32} />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm font-bold text-slate-700">Verify your Email</p>
                                            <p className="text-xs text-slate-500 font-medium">We will send a one-time password to <br/> <b>{user?.email}</b></p>
                                        </div>
                                        <button 
                                            onClick={sendOtpHandler}
                                            disabled={loading}
                                            className="w-full py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                                        >
                                            {loading ? <Loader2 className="animate-spin" size={18}/> : "Send Verification OTP"}
                                        </button>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSetPassword} className="space-y-5">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Enter OTP (111222)</label>
                                            <input 
                                                required 
                                                type="text" 
                                                value={formData.otp}
                                                onChange={(e) => setFormData({...formData, otp: e.target.value})}
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-600 transition-all font-bold text-sm tracking-[0.5em] text-center" 
                                                placeholder="••••••"
                                                maxLength={6}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">New Password</label>
                                            <input 
                                                required 
                                                type="password" 
                                                value={formData.newPassword}
                                                onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-600 transition-all font-medium text-sm" 
                                                placeholder="Min 8 characters"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Confirm Password</label>
                                            <input 
                                                required 
                                                type="password" 
                                                value={formData.confirmPassword}
                                                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-600 transition-all font-medium text-sm" 
                                                placeholder="Repeat new password"
                                            />
                                        </div>
                                        <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 flex gap-3">
                                            <AlertCircle className="text-amber-600 shrink-0" size={18} />
                                            <p className="text-[10px] text-amber-700 font-bold leading-relaxed">Warning: setting a password will disable direct Google Login. You must use your email and this password from next time.</p>
                                        </div>
                                        <button 
                                            type="submit"
                                            disabled={loading}
                                            className="w-full py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                                        >
                                            {loading ? <Loader2 className="animate-spin" size={18}/> : "Set Password & Disable Google"}
                                        </button>
                                        <button type="button" onClick={() => setOtpSent(false)} className="w-full text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-widest">Resend OTP</button>
                                    </form>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default RecruiterSettings;

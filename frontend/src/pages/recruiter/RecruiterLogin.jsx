import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
    Mail, 
    Lock, 
    Briefcase, 
    Eye, 
    EyeOff,
    Loader2,
    ShieldCheck,
    CheckCircle2,
    Globe
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setLoading, setUser } from '../../redux/authSlice';
import axios from 'axios';
import { toast } from 'sonner';
import { useGoogleLogin } from '@react-oauth/google';

const RecruiterLogin = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [input, setInput] = useState({ email: "", password: "" });
    const { loading } = useSelector(store => store.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleGoogleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                dispatch(setLoading(true));
                const userInfo = await axios.get(
                    'https://www.googleapis.com/oauth2/v3/userinfo',
                    { headers: { Authorization: `Bearer ${tokenResponse.access_token}` } }
                );

                const res = await axios.post(`https://mediumturquoise-goshawk-440855.hostingersite.com/api/v1/company/google-login`, {
                    idToken: tokenResponse.access_token,
                    userData: {
                        email: userInfo.data.email,
                        name: userInfo.data.name,
                        picture: userInfo.data.picture
                    }
                }, { withCredentials: true });

                if (res.data.success) {
                    dispatch(setUser(res.data.company));
                    toast.success(res.data.message);
                    
                    if (!res.data.company.isPhoneVerified) {
                        navigate("/recruiter/verify-phone");
                    } else if (res.data.company.status === 'profile_incomplete') {
                        navigate("/recruiter/setup-profile");
                    } else {
                        navigate("/recruiter/dashboard");
                    }
                }
            } catch (error) {
                toast.error(error.response?.data?.message || "Google Login failed");
            } finally {
                dispatch(setLoading(false));
            }
        },
        onError: () => toast.error("Google Login Failed")
    });

    const changeEventHandler = (e) => {
        setInput({ ...input, [e.target.name]: e.target.value });
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        try {
            dispatch(setLoading(true));
            const res = await axios.post(`https://mediumturquoise-goshawk-440855.hostingersite.com/api/v1/company/login`, input, {
                headers: { 'Content-Type': 'application/json' },
                withCredentials: true
            });
            
            if (res.data.success) {
                dispatch(setUser(res.data.company));
                toast.success(res.data.message);
                
                if (res.data.redirectTo === 'verify-otp') {
                    navigate("/recruiter/verify-otp");
                } else if (res.data.redirectTo === 'complete-profile') {
                    navigate("/recruiter/setup-profile");
                } else {
                    navigate("/recruiter/dashboard");
                }
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Login failed");
        } finally {
            dispatch(setLoading(false));
        }
    };

    return (
        <div className="min-h-screen bg-[#F9FAFB] flex font-sans text-slate-900">
            
            {/* Left Brand Side (Reference from Signup) */}
            <div className="hidden lg:flex w-[35%] bg-indigo-600 p-12 flex-col justify-between relative overflow-hidden">
                <div className="z-10">
                    <div className="flex items-center gap-3 mb-16">
                        <div className="p-2.5 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
                            <Briefcase className="text-white" size={24} />
                        </div>
                        <span className="text-xl font-bold text-white tracking-tight">JobPortal<span className="text-indigo-200 ml-1">Console</span></span>
                    </div>
                    
                    <div className="space-y-6">
                        <h1 className="text-4xl font-extrabold text-white leading-[1.2] tracking-tight">Welcome Back to Your Hiring Hub.</h1>
                        <p className="text-indigo-100 text-lg font-medium leading-relaxed">Login to manage your active jobs, candidates and recruitment analytics.</p>
                    </div>

                    <div className="mt-12 space-y-4">
                        {[
                            "Track Real-time Applications",
                            "Collaborate with Team Members",
                            "Review AI Match Scores",
                            "Direct Messaging with Talent"
                        ].map((item, idx) => (
                            <div key={idx} className="flex items-center gap-3 text-white/90 font-medium">
                                <CheckCircle2 size={18} className="text-indigo-300" />
                                <span>{item}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="z-10 bg-white/10 border border-white/20 p-6 rounded-3xl backdrop-blur-sm">
                    <p className="text-sm text-indigo-50 font-medium leading-relaxed italic">"Manage your entire recruitment pipeline from a single, intuitive interface."</p>
                </div>

                <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-[100px]"></div>
                <div className="absolute -top-20 -left-20 w-60 h-60 bg-indigo-400/20 rounded-full blur-[80px]"></div>
            </div>

            {/* Right Form Side */}
            <div className="w-full lg:w-[65%] flex items-center justify-center p-6 md:p-12">
                <div className="w-full max-w-[460px]">
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white p-8 md:p-10 rounded-[32px] border border-slate-200/60 shadow-sm"
                    >
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Recruiter Login</h2>
                            <p className="text-slate-500 mt-1.5 font-medium text-sm">Enter your credentials to access your dashboard.</p>
                        </div>

                        {/* Google Login */}
                        <div className="mb-6">
                            <button 
                                onClick={() => handleGoogleLogin()}
                                disabled={loading}
                                className="w-full py-3 border border-slate-200 rounded-xl flex items-center justify-center gap-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all active:scale-95 disabled:opacity-70"
                            >
                                <img src="https://www.gstatic.com/images/branding/product/1x/googleg_48dp.png" className="w-5 h-5" alt="G" />
                                Continue with Google
                            </button>
                        </div>

                        <div className="relative mb-6">
                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
                            <div className="relative flex justify-center text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400"><span className="bg-white px-4">Or use email</span></div>
                        </div>

                        <form onSubmit={submitHandler} className="space-y-5">
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Official Email</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={17} />
                                        <input 
                                            required 
                                            type="email" 
                                            name="email" 
                                            value={input.email} 
                                            onChange={changeEventHandler} 
                                            placeholder="hr@company.com" 
                                            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50/50 transition-all font-medium text-sm" 
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <div className="flex justify-between items-center px-1">
                                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Password</label>
                                        <button type="button" className="text-[11px] font-bold text-indigo-600 hover:underline">Forgot password?</button>
                                    </div>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={17} />
                                        <input 
                                            required 
                                            type={showPassword ? "text" : "password"} 
                                            name="password" 
                                            value={input.password} 
                                            onChange={changeEventHandler} 
                                            placeholder="••••••••" 
                                            className="w-full pl-11 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50/50 transition-all font-medium text-sm" 
                                        />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600 transition-colors">
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                disabled={loading} 
                                className="w-full py-3.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 active:scale-[0.98] shadow-sm"
                            >
                                {loading ? <Loader2 className="animate-spin" size={20} /> : "Sign In to Console"}
                            </button>
                        </form>

                        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                            <p className="text-sm text-slate-500 font-medium">Don't have an account? <Link to="/recruiter/register" className="text-indigo-600 font-bold hover:underline">Register Company</Link></p>
                        </div>
                    </motion.div>

                    <div className="mt-8 flex items-center justify-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">
                        <ShieldCheck size={12} />
                        Enterprise Grade Security
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RecruiterLogin;

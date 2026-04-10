import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Mail, 
    Lock, 
    Phone, 
    Building2, 
    ChevronRight, 
    ShieldCheck,
    Briefcase,
    Loader2,
    CheckCircle2,
    Globe
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { useGoogleLogin } from '@react-oauth/google';
import { useDispatch } from 'react-redux';
import { setUser, setLoading as setAuthLoading } from '../../redux/authSlice';

const COMPANY_API_END_POINT = "http://localhost:8000/api/v1/company";

const CompanyRegister = () => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [companyId, setCompanyId] = useState(null);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleGoogleSignup = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                setLoading(true);
                const userInfo = await axios.get(
                    'https://www.googleapis.com/oauth2/v3/userinfo',
                    { headers: { Authorization: `Bearer ${tokenResponse.access_token}` } }
                );

                const res = await axios.post(`${COMPANY_API_END_POINT}/google-login`, {
                    idToken: tokenResponse.access_token,
                    userData: {
                        email: userInfo.data.email,
                        name: userInfo.data.name,
                        picture: userInfo.data.picture
                    }
                }, { withCredentials: true });

                if (res.data.success) {
                    dispatch(setUser(res.data.company));
                    toast.success("Signed up successfully with Google!");
                    
                    if (!res.data.company.isPhoneVerified) {
                        navigate("/recruiter/verify-phone");
                    } else {
                        navigate("/recruiter/setup-profile");
                    }
                }
            } catch (error) {
                toast.error(error.response?.data?.message || "Google Signup failed");
            } finally {
                setLoading(false);
            }
        },
        onError: () => toast.error("Google Signup Failed")
    });

    const [input, setInput] = useState({
        companyName: "",
        email: "",
        phoneNumber: "",
        password: "",
        confirmPassword: ""
    });

    const [otp, setOtp] = useState({
        emailOTP: "",
        phoneOTP: ""
    });

    const changeEventHandler = (e) => {
        setInput({ ...input, [e.target.name]: e.target.value });
    };

    const signupHandler = async (e) => {
        e.preventDefault();
        if (input.password !== input.confirmPassword) {
            return toast.error("Passwords do not match");
        }
        try {
            setLoading(true);
            const res = await axios.post(`${COMPANY_API_END_POINT}/register`, input);
            if (res.data.success) {
                toast.success(res.data.message);
                setCompanyId(res.data.companyId);
                setStep(2);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Registration failed");
        } finally {
            setLoading(false);
        }
    };

    const verifyHandler = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const res = await axios.post(`${COMPANY_API_END_POINT}/verify`, {
                companyId,
                emailOTP: otp.emailOTP,
                phoneOTP: otp.phoneOTP
            }, { withCredentials: true });

            if (res.data.success) {
                toast.success(res.data.message);
                navigate("/recruiter/setup-profile");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Verification failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F9FAFB] flex font-sans text-slate-900">
            {/* Left Brand Side */}
            <div className="hidden lg:flex w-[35%] bg-blue-600 p-12 flex-col justify-between relative overflow-hidden">
                <div className="z-10">
                    <div className="flex items-center gap-3 mb-16">
                        <div className="p-2.5 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
                            <Briefcase className="text-white" size={24} />
                        </div>
                        <span className="text-xl font-bold text-white tracking-tight">JobPortal<span className="text-blue-200 ml-1">Recruiter</span></span>
                    </div>
                    
                    <div className="space-y-6">
                        <h1 className="text-4xl font-extrabold text-white leading-[1.2] tracking-tight">Find the best talent for your company.</h1>
                        <p className="text-blue-100 text-lg font-medium leading-relaxed">Join 10,000+ companies hiring through our verified talent network.</p>
                    </div>

                    <div className="mt-12 space-y-4">
                        {[
                            "Verified Candidate Profiles",
                            "One-click Interview Scheduling",
                            "Advanced AI Talent Matching",
                            "Dedicated Account Manager"
                        ].map((item, idx) => (
                            <div key={idx} className="flex items-center gap-3 text-white/90 font-medium">
                                <CheckCircle2 size={18} className="text-blue-300" />
                                <span>{item}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="z-10 bg-white/10 border border-white/20 p-6 rounded-3xl backdrop-blur-sm">
                    <p className="text-sm text-blue-50 font-medium leading-relaxed italic">"The hiring process became 3x faster after we switched to JobPortal. Highly recommended!"</p>
                    <div className="mt-4 flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-400 rounded-full border-2 border-white/30"></div>
                        <div>
                            <p className="text-[11px] font-bold text-white uppercase tracking-widest">Sarah Jenkins</p>
                            <p className="text-[10px] text-blue-200 font-semibold">HR Head at TechFlow</p>
                        </div>
                    </div>
                </div>

                {/* Decorative Circles */}
                <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-[100px]"></div>
                <div className="absolute -top-20 -left-20 w-60 h-60 bg-blue-400/20 rounded-full blur-[80px]"></div>
            </div>

            {/* Right Form Side */}
            <div className="w-full lg:w-[65%] flex items-center justify-center p-6 md:p-12">
                <div className="w-full max-w-[500px]">
                    
                    <AnimatePresence mode="wait">
                        {step === 1 ? (
                            <motion.div 
                                key="signup"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="bg-white p-8 md:p-10 rounded-[32px] border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
                            >
                                <div className="mb-8">
                                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Create Business Account</h2>
                                    <p className="text-slate-500 mt-1.5 font-medium text-sm">Fill in your basic details to get started.</p>
                                </div>

                                <div className="mb-6">
                                    <button 
                                        onClick={() => handleGoogleSignup()}
                                        disabled={loading}
                                        className="w-full py-3 border border-slate-200 rounded-xl flex items-center justify-center gap-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all active:scale-95 disabled:opacity-70"
                                    >
                                        <Globe className="text-blue-600" size={18} /> Continue with Google
                                    </button>
                                </div>

                                <div className="relative mb-6">
                                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
                                    <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-bold text-slate-400"><span className="bg-white px-4">Or use email</span></div>
                                </div>

                                <form onSubmit={signupHandler} className="space-y-5">
                                    <div className="space-y-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Company Name</label>
                                            <div className="relative group">
                                                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={17} />
                                                <input required type="text" name="companyName" value={input.companyName} onChange={changeEventHandler} placeholder="e.g. Google India" className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-50 transition-all font-medium text-sm" />
                                            </div>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Official Email</label>
                                                <div className="relative group">
                                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={17} />
                                                    <input required type="email" name="email" value={input.email} onChange={changeEventHandler} placeholder="hr@company.com" className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-50 transition-all font-medium text-sm" />
                                                </div>
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Mobile Number</label>
                                                <div className="relative group">
                                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={17} />
                                                    <input required type="tel" name="phoneNumber" value={input.phoneNumber} onChange={changeEventHandler} placeholder="10 Digit Number" className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-50 transition-all font-medium text-sm" />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Password</label>
                                                <div className="relative group">
                                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={17} />
                                                    <input required type="password" name="password" value={input.password} onChange={changeEventHandler} placeholder="Min 8 characters" className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-50 transition-all font-medium text-sm" />
                                                </div>
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Confirm Password</label>
                                                <div className="relative group">
                                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={17} />
                                                    <input required type="password" name="confirmPassword" value={input.confirmPassword} onChange={changeEventHandler} placeholder="Repeat password" className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-50 transition-all font-medium text-sm" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <button type="submit" disabled={loading} className="w-full py-3.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 active:scale-[0.98]">
                                        {loading ? <Loader2 className="animate-spin" size={20} /> : <>Next: Verify OTP <ChevronRight size={18} /></>}
                                    </button>
                                </form>

                                <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                                    <p className="text-sm text-slate-500 font-medium">Already have a recruiter account? <Link to="/recruiter/login" className="text-blue-600 font-bold hover:underline">Sign In</Link></p>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div 
                                key="verify"
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                className="bg-white p-8 md:p-10 rounded-[32px] border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
                            >
                                <div className="text-center mb-10">
                                    <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-blue-100">
                                        <ShieldCheck className="text-blue-600" size={32} />
                                    </div>
                                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Verify Your Identity</h2>
                                    <p className="text-slate-500 mt-2 font-medium text-sm leading-relaxed">We've sent verification codes to your email <br/> and mobile number. Please enter them below.</p>
                                </div>

                                <form onSubmit={verifyHandler} className="space-y-8">
                                    <div className="space-y-6">
                                        <div className="space-y-2.5">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] block text-center">Email OTP</label>
                                            <input required type="text" maxLength={6} placeholder="••••••" value={otp.emailOTP} onChange={(e) => setOtp({...otp, emailOTP: e.target.value})} className="w-full text-center py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-50 text-2xl font-bold tracking-[0.8em] text-blue-600 placeholder:text-slate-200" />
                                        </div>
                                        <div className="space-y-2.5">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] block text-center">Mobile OTP (123456)</label>
                                            <input required type="text" maxLength={6} placeholder="••••••" value={otp.phoneOTP} onChange={(e) => setOtp({...otp, phoneOTP: e.target.value})} className="w-full text-center py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-50 text-2xl font-bold tracking-[0.8em] text-blue-600 placeholder:text-slate-200" />
                                        </div>
                                    </div>

                                    <button type="submit" disabled={loading} className="w-full py-3.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 active:scale-[0.98]">
                                        {loading ? <Loader2 className="animate-spin" size={20} /> : "Verify & Start Onboarding"}
                                    </button>

                                    <button type="button" className="w-full text-xs font-bold text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-widest">Resend OTPs</button>
                                </form>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default CompanyRegister;

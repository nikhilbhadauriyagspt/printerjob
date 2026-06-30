import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Phone, ArrowRight, CheckCircle2, ShieldCheck, Github, Chrome, Smartphone, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast } from 'sonner';
import { useGoogleLogin } from '@react-oauth/google';
import { CANDIDATE_API_END_POINT } from '../../utils/constant';
import { useDispatch } from 'react-redux';
import { setUser } from '../../redux/authSlice';

const CandidateRegister = () => {
  const [step, setStep] = useState(1); // 1: Info, 2: OTP
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: ""
  });

  const [candidateId, setCandidateId] = useState(null);
  const [emailOTP, setEmailOTP] = useState(["", "", "", "", "", ""]);
  const [phoneOTP, setPhoneOTP] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return toast.error("Passwords do not match");
    }
    setLoading(true);
    try {
      const res = await axios.post(`${CANDIDATE_API_END_POINT}/register`, formData);
      if (res.data.success) {
        toast.success(res.data.message);
        setCandidateId(res.data.candidateId);
        setStep(2);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${CANDIDATE_API_END_POINT}/verify-otp`, {
        candidateId,
        emailOTP: emailOTP.join(""),
        phoneOTP
      });
      if (res.data.success) {
        const candidate = res.data.candidate;
        dispatch(setUser(candidate));
        toast.success("Account verified successfully!");
        
        // Redirect to setup if completion < 80%
        if ((candidate.profileCompletion || 0) < 80) {
          navigate("/setup-profile");
        } else {
          navigate("/");
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...emailOTP];
    newOtp[index] = value;
    setEmailOTP(newOtp);
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  // Google Login Logic
  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const userInfo = await axios.get(
          'https://www.googleapis.com/oauth2/v3/userinfo',
          { headers: { Authorization: `Bearer ${tokenResponse.access_token}` } }
        );

        const res = await axios.post(`${CANDIDATE_API_END_POINT}/google-login`, {
          userData: userInfo.data
        }, { withCredentials: true });

        if (res.data.success) {
          toast.success(res.data.message);
          navigate("/");
        }
      } catch (err) {
        toast.error("Google login failed");
      }
    },
    onError: () => toast.error("Google login failed")
  });

  return (
    <div className="min-h-screen bg-white flex overflow-hidden font-sans">
      
      {/* Left Side: Brand & Visuals */}
      <div className="hidden lg:flex lg:w-[45%] bg-slate-900 relative items-center justify-center p-16">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        <div className="absolute top-[-20%] right-[-10%] w-[70%] h-[70%] bg-indigo-600/20 rounded-full blur-[120px]"></div>
        
        <div className="relative z-10 max-w-md">
          <Link to="/" className="flex items-center space-x-3 mb-20 text-white hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <span className="text-white font-bold text-xl">J</span>
            </div>
            <span className="text-2xl font-bold tracking-tight">Job<span className="text-indigo-400">Portal</span></span>
          </Link>

          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
            <h2 className="text-4xl lg:text-5xl font-bold text-white leading-[1.15] mb-8">Your career <br /><span className="text-indigo-400">reimagined.</span></h2>
            <div className="space-y-6 mb-16">
              {["AI-powered job matching system", "Direct chat with hiring managers", "Application tracking & insights", "Private and secure candidate profile"].map((text, i) => (
                <div key={i} className="flex items-center space-x-4 text-slate-300">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                    <CheckCircle2 size={14} className="text-indigo-400" />
                  </div>
                  <p className="text-[15px] font-medium">{text}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      <div className="w-full lg:w-[55%] flex items-center justify-center p-8 lg:p-20 bg-white overflow-y-auto">
        <div className="w-full max-w-[480px]">
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div key="register-form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="py-8">
                <div className="mb-10 text-center lg:text-left">
                  <h1 className="text-3xl font-bold text-slate-900 mb-3 tracking-tight tracking-[-0.03em]">Create your account</h1>
                  <p className="text-slate-500 text-[15px] font-medium">Join our community of elite professionals.</p>
                </div>

                {/* Google Button */}
                <button 
                  onClick={() => loginWithGoogle()}
                  className="w-full flex items-center justify-center space-x-3 py-3.5 border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all font-bold text-[14px] text-slate-700 shadow-sm mb-4 active:scale-[0.98]"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  <span>Sign up with Google</span>
                </button>

                <div className="relative flex items-center mb-8 pt-4">
                  <div className="flex-grow border-t border-slate-100"></div>
                  <span className="flex-shrink mx-4 text-slate-300 text-[11px] font-bold uppercase tracking-widest">or register manually</span>
                  <div className="flex-grow border-t border-slate-100"></div>
                </div>

                <form className="space-y-4" onSubmit={handleRegister}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-[13px] font-bold text-slate-700 ml-1">Full Name</label>
                        <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="John Doe" className="w-full px-5 py-3.5 bg-slate-50 border-2 border-transparent focus:border-indigo-600 focus:bg-white rounded-2xl outline-none transition-all font-medium text-[15px]" required />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[13px] font-bold text-slate-700 ml-1">Phone Number</label>
                        <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} placeholder="+91 98765 43210" className="w-full px-5 py-3.5 bg-slate-50 border-2 border-transparent focus:border-indigo-600 focus:bg-white rounded-2xl outline-none transition-all font-medium text-[15px]" required />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[13px] font-bold text-slate-700 ml-1">Email Address</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="name@email.com" className="w-full px-5 py-3.5 bg-slate-50 border-2 border-transparent focus:border-indigo-600 focus:bg-white rounded-2xl outline-none transition-all font-medium text-[15px]" required />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-[13px] font-bold text-slate-700 ml-1">Password</label>
                        <div className="relative group">
                            <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" className="w-full px-5 py-3.5 bg-slate-50 border-2 border-transparent focus:border-indigo-600 focus:bg-white rounded-2xl outline-none transition-all font-medium text-[15px]" required />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-5 flex items-center text-slate-400 hover:text-indigo-600">
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[13px] font-bold text-slate-700 ml-1">Confirm Password</label>
                        <div className="relative group">
                            <input type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="••••••••" className="w-full px-5 py-3.5 bg-slate-50 border-2 border-transparent focus:border-indigo-600 focus:bg-white rounded-2xl outline-none transition-all font-medium text-[15px]" required />
                            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 pr-5 flex items-center text-slate-400 hover:text-indigo-600">
                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>
                  </div>

                  <button type="submit" disabled={loading} className="w-full py-4.5 bg-slate-900 text-white font-bold rounded-2xl hover:bg-indigo-600 transition-all shadow-xl shadow-indigo-100 mt-4 flex items-center justify-center space-x-2 active:scale-[0.98]">
                    {loading ? <span className="animate-pulse">Processing...</span> : <><span>Create Account</span><ArrowRight size={18} /></>}
                  </button>
                </form>

                <p className="mt-10 text-center text-slate-500 text-[14px] font-medium">Already a member? <Link to="/login" className="text-indigo-600 font-bold hover:underline ml-1">Sign In</Link></p>
              </motion.div>
            ) : (
              <motion.div key="otp-step" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="text-center py-8">
                <button onClick={() => setStep(1)} className="absolute top-0 left-0 flex items-center space-x-2 text-slate-400 font-bold text-sm hover:text-indigo-600 transition-colors"><ArrowLeft size={16} /><span>Back</span></button>
                <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-8"><Smartphone size={36} /></div>
                <h2 className="text-3xl font-bold text-slate-900 mb-3 tracking-tight tracking-[-0.03em]">Verify Identity</h2>
                <p className="text-slate-500 text-[15px] font-medium mb-12 max-w-sm mx-auto">Verification codes have been sent to your phone and email.</p>
                
                <form className="space-y-10 text-left" onSubmit={handleVerify}>
                  <div className="space-y-4">
                    <label className="text-[13px] font-bold text-slate-700 ml-1 uppercase tracking-widest">Email Code</label>
                    <div className="flex justify-between gap-3">
                        {emailOTP.map((val, i) => (
                            <input key={i} id={`otp-${i}`} type="text" maxLength="1" value={val} onChange={(e) => handleOtpChange(i, e.target.value)} className="w-full h-14 bg-slate-50 border-2 border-transparent focus:border-indigo-600 focus:bg-white text-center text-xl font-bold rounded-xl outline-none transition-all" required />
                        ))}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="text-[13px] font-bold text-slate-700 ml-1 uppercase tracking-widest">Phone Code (Static: 123456)</label>
                    <input type="text" value={phoneOTP} onChange={(e) => setPhoneOTP(e.target.value)} placeholder="Enter 6-digit OTP" className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-600 focus:bg-white rounded-2xl outline-none transition-all font-bold tracking-[0.5em] text-center text-lg" maxLength="6" required />
                  </div>
                  <button type="submit" disabled={loading} className="w-full py-5 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-green-600 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center space-x-3">
                    {loading ? "Verifying..." : <><ShieldCheck size={20} /><span>Complete Verification</span></>}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default CandidateRegister;

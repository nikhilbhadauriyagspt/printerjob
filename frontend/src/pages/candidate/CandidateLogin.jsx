import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Github, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { toast } from 'sonner';
import { useGoogleLogin } from '@react-oauth/google';
import { CANDIDATE_API_END_POINT } from '../../utils/constant';
import { useDispatch } from 'react-redux';
import { setUser } from '../../redux/authSlice';

const CandidateLogin = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${CANDIDATE_API_END_POINT}/login`, formData, { withCredentials: true });
      if (res.data.success) {
        const candidate = res.data.candidate;
        dispatch(setUser(candidate));
        toast.success(res.data.message);
        
        // Redirect to setup if completion < 80%
        if ((candidate.profileCompletion || 0) < 80) {
          navigate("/setup-profile");
        } else {
          navigate("/");
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
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
          const candidate = res.data.candidate;
          dispatch(setUser(candidate));
          toast.success(res.data.message);
          
          // Redirect to setup if completion < 80%
          if ((candidate.profileCompletion || 0) < 80) {
            navigate("/setup-profile");
          } else {
            navigate("/");
          }
        }
      } catch (err) {
        toast.error("Google login failed");
      }
    },
    onError: () => toast.error("Google login failed")
  });

  return (
    <div className="min-h-screen bg-white flex overflow-hidden font-sans text-slate-900">
      
      {/* Left Side: Brand & Visuals */}
      <div className="hidden lg:flex lg:w-[45%] bg-slate-900 relative items-center justify-center p-16">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        <div className="absolute top-[-20%] right-[-10%] w-[70%] h-[70%] bg-indigo-600/20 rounded-full blur-[120px]"></div>
        
        <div className="relative z-10 max-w-md">
          <Link to="/" className="flex items-center space-x-3 mb-20">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <span className="text-white font-bold text-xl">J</span>
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">Job<span className="text-indigo-400">Portal</span></span>
          </Link>

          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
            <h2 className="text-4xl lg:text-5xl font-bold text-white leading-[1.15] mb-8">Welcome back to <br /><span className="text-indigo-400">your future.</span></h2>
            <div className="space-y-6 mb-16">
              {["Track application status in real-time", "New job alerts tailored for you", "Direct messages from recruiters", "Manage your professional profile"].map((text, i) => (
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

      {/* Right Side: Login Form */}
      <div className="w-full lg:w-[55%] flex items-center justify-center p-8 lg:p-20 bg-white overflow-y-auto">
        <div className="w-full max-w-[440px]">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="py-8">
            <div className="mb-10 text-center lg:text-left">
              <h1 className="text-3xl font-bold text-slate-900 mb-3 tracking-tight tracking-[-0.03em]">Candidate Sign In</h1>
              <p className="text-slate-500 text-[15px] font-medium">Please enter your credentials to continue.</p>
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
              <span>Sign in with Google</span>
            </button>

            <button className="w-full flex items-center justify-center space-x-3 py-3.5 border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all font-bold text-[14px] text-slate-700 shadow-sm mb-8 active:scale-[0.98]">
              <Github size={18} className="text-slate-900" />
              <span>Continue with GitHub</span>
            </button>

            <div className="relative flex items-center mb-8">
              <div className="flex-grow border-t border-slate-100"></div>
              <span className="flex-shrink mx-4 text-slate-300 text-[11px] font-bold uppercase tracking-widest">or use email</span>
              <div className="flex-grow border-t border-slate-100"></div>
            </div>

            <form className="space-y-5" onSubmit={handleLogin}>
              <div className="space-y-2">
                <label className="text-[13px] font-bold text-slate-700 ml-1">Email Address</label>
                <input 
                  type="email" 
                  name="email" 
                  value={formData.email} 
                  onChange={handleChange} 
                  placeholder="name@email.com" 
                  className="w-full px-5 py-3.5 bg-slate-50 border-2 border-transparent focus:border-indigo-600 focus:bg-white rounded-2xl outline-none transition-all font-medium text-[15px]" 
                  required 
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-[13px] font-bold text-slate-700">Password</label>
                  <button type="button" className="text-[12px] font-bold text-indigo-600 hover:text-indigo-700 transition-colors">Forgot Password?</button>
                </div>
                <div className="relative group">
                    <input 
                        type={showPassword ? 'text' : 'password'} 
                        name="password" 
                        value={formData.password} 
                        onChange={handleChange} 
                        placeholder="••••••••" 
                        className="w-full px-5 py-3.5 bg-slate-50 border-2 border-transparent focus:border-indigo-600 focus:bg-white rounded-2xl outline-none transition-all font-medium text-[15px]" 
                        required 
                    />
                    <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-5 flex items-center text-slate-400 hover:text-indigo-600 transition-colors"
                    >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading} 
                className="w-full py-4.5 bg-slate-900 text-white font-bold rounded-2xl hover:bg-indigo-600 transition-all shadow-xl shadow-indigo-100 mt-6 active:scale-[0.98] flex items-center justify-center space-x-2"
              >
                {loading ? <span className="animate-pulse">Signing in...</span> : <><span>Sign In</span><ArrowRight size={18} /></>}
              </button>
            </form>

            <p className="mt-10 text-center text-slate-500 text-[14px] font-medium leading-relaxed">
              New to JobPortal? <Link to="/register" className="text-indigo-600 font-bold hover:underline ml-1">Create an account</Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CandidateLogin;

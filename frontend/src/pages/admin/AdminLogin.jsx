import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setLoading, setUser } from '../../redux/authSlice';
import { ADMIN_API_END_POINT } from '../../utils/constant';
import { 
    Loader2, 
    Mail, 
    Lock, 
    Briefcase,
    Eye,
    EyeOff,
    ShieldCheck
} from 'lucide-react';

const AdminLogin = () => {
    const [input, setInput] = useState({
        email: "",
        password: ""
    });
    const [showPassword, setShowPassword] = useState(false);
    const { loading, user } = useSelector(store => store.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Redirect if already logged in
    React.useEffect(() => {
        if (!loading && user && user.role === 'super_admin') {
            navigate("/admin/dashboard");
        }
    }, [user, loading, navigate]);

    const changeEventHandler = (e) => {
        setInput({ ...input, [e.target.name]: e.target.value });
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        try {
            dispatch(setLoading(true));
            const res = await axios.post(`${ADMIN_API_END_POINT}/login`, input, {
                headers: { "Content-Type": "application/json" },
                withCredentials: true
            });

            if (res.data.success) {
                dispatch(setUser(res.data.admin));
                toast.success(res.data.message);
                navigate("/admin/dashboard");
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Invalid credentials");
        } finally {
            dispatch(setLoading(false));
        }
    };

    if (loading && !user) {
        return (
            <div className="h-screen w-screen flex items-center justify-center bg-[#F8FAFC]">
                <div className="w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 font-sans">
            <div className="w-full max-w-[440px] space-y-8 animate-in fade-in zoom-in-95 duration-700">
                
                {/* Brand Header */}
                <div className="text-center">
                    <div className="w-16 h-16 bg-slate-900 rounded-[24px] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-slate-200">
                        <ShieldCheck className="text-white" size={30} />
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Admin Console</h1>
                    <p className="text-slate-500 mt-2 font-medium text-sm">Authorized access only for system administrators.</p>
                </div>

                {/* Login Card */}
                <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.03)] space-y-8">
                    
                    <div className="space-y-1">
                        <h2 className="text-xl font-bold text-slate-800">Secure Sign In</h2>
                        <p className="text-xs text-slate-400 font-medium uppercase tracking-widest">Platform Governance</p>
                    </div>

                    <form onSubmit={submitHandler} className="space-y-6">
                        {/* Email Field */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">System Email</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors" size={18} />
                                <input 
                                    type="email" 
                                    name="email"
                                    value={input.email}
                                    onChange={changeEventHandler}
                                    placeholder="admin@jobportal.com" 
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-slate-900 transition-all text-sm font-semibold text-slate-800"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Access Key</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors" size={18} />
                                <input 
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={input.password}
                                    onChange={changeEventHandler}
                                    placeholder="••••••••" 
                                    className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-slate-900 transition-all text-sm font-semibold text-slate-800"
                                    required
                                />
                                <button 
                                    type="button" 
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600 transition-colors p-1"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button 
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-slate-900 text-white rounded-2xl text-sm font-bold shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : "Enter System Dashboard"}
                        </button>
                    </form>
                </div>

                {/* Footer Copy */}
                <div className="text-center pt-4">
                    <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.4em]">
                        JobPortal Pro &bull; Security Protocol v2.4
                    </p>
                </div>

            </div>
        </div>
    );
};

export default AdminLogin;

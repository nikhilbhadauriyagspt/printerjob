import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, Loader2, MessageSquare, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { useDispatch } from 'react-redux';
import { setUser } from '../../redux/authSlice';

const RecruiterVerifyPhone = () => {
    const [phoneNumber, setPhoneNumber] = useState("");
    const [otp, setOtp] = useState("");
    const [step, setStep] = useState(1); // 1: Enter Phone, 2: Enter OTP
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const sendOtpHandler = async (e) => {
        e.preventDefault();
        setLoading(true);
        // Mock sending OTP
        setTimeout(() => {
            setLoading(false);
            setStep(2);
            toast.success("OTP sent to your phone (Use 123456)");
        }, 1000);
    };

    const verifyOtpHandler = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const res = await axios.post(`http://localhost:8000/api/v1/company/verify-phone-google`, {
                phoneNumber,
                otp
            }, { withCredentials: true });

            if (res.data.success) {
                dispatch(setUser(res.data.company));
                toast.success("Phone verified successfully!");
                navigate("/recruiter/setup-profile");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Verification failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 font-sans">
            <div className="w-full max-w-[400px] space-y-8">
                
                <div className="text-center">
                    <div className="w-16 h-16 bg-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-100">
                        <Phone className="text-white" size={28} />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Security Verification</h1>
                    <p className="text-slate-500 mt-2 text-sm font-medium">Please verify your contact number to continue.</p>
                </div>

                <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm">
                    {step === 1 ? (
                        <form onSubmit={sendOtpHandler} className="space-y-6">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Mobile Number</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">+91</div>
                                    <input 
                                        type="tel" 
                                        placeholder="Enter 10 digit number" 
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        className="w-full pl-14 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-indigo-600 transition-all text-sm font-bold" 
                                        required
                                    />
                                </div>
                            </div>
                            <button 
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-indigo-600 text-white rounded-2xl text-sm font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : "Send Verification Code"}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={verifyOtpHandler} className="space-y-6">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Verification Code</label>
                                <div className="relative group">
                                    <MessageSquare className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input 
                                        type="text" 
                                        placeholder="Enter 6-digit OTP" 
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-indigo-600 transition-all text-sm font-bold tracking-[0.5em]" 
                                        maxLength={6}
                                        required
                                    />
                                </div>
                            </div>
                            <button 
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-indigo-600 text-white rounded-2xl text-sm font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : "Verify & Continue"}
                            </button>
                            <button type="button" onClick={() => setStep(1)} className="w-full text-xs font-bold text-slate-400 hover:text-indigo-600 uppercase tracking-widest">Change Number</button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RecruiterVerifyPhone;

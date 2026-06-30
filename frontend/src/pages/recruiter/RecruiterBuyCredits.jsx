import React, { useState, useEffect } from 'react';
import { Check, Zap, Shield, Loader2, X, CreditCard, Database, ArrowLeft, Sparkles } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useNavigate } from 'react-router-dom';
import { COMPANY_API_END_POINT } from '../../utils/constant';

const RecruiterBuyCredits = () => {
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [purchasing, setPurchasing] = useState(null);
    const [company, setCompany] = useState(null);
    const navigate = useNavigate();

    // Payment Modal States
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedPackage, setSelectedPackage] = useState(null);
    const [paymentConfig, setPaymentConfig] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [pkgRes, statsRes] = await Promise.all([
                    axios.get(`${COMPANY_API_END_POINT}/packages`, { withCredentials: true }),
                    axios.get(`${COMPANY_API_END_POINT}/me`, { withCredentials: true })
                ]);
                // Filter only database access packages
                if (pkgRes.data.success) {
                    setPackages(pkgRes.data.packages.filter(p => p.type === 'database_access'));
                }
                if (statsRes.data.success) setCompany(statsRes.data.company);
            } catch (error) {
                toast.error("Failed to load credit plans");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleRecharge = async (pkg) => {
        try {
            setPurchasing(pkg.id);
            const res = await axios.post(`${COMPANY_API_END_POINT}/purchase/initiate`, 
                { packageId: pkg.id }, 
                { withCredentials: true }
            );
            if (res.data.success) {
                setPaymentConfig(res.data.orderData);
                setSelectedPackage(pkg);
                setShowPaymentModal(true);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Payment initiation failed.");
        } finally {
            setPurchasing(null);
        }
    };

    const verifyPaymentOnBackend = async (paymentId, gateway) => {
        try {
            const res = await axios.post(`${COMPANY_API_END_POINT}/purchase/verify`, {
                packageId: selectedPackage.id,
                paymentId: paymentId,
                gateway: gateway
            }, { withCredentials: true });

            if (res.data.success) {
                toast.success(`Success! ${selectedPackage.databaseCredits} credits added.`);
                setShowPaymentModal(false);
                setTimeout(() => navigate("/recruiter/talent-pool"), 1500);
            }
        } catch (error) {
            toast.error("Verification failed. Contact support.");
        }
    };

    const handleRazorpayPayment = () => {
        const options = {
            key: paymentConfig.keys.razorpayKeyId,
            amount: paymentConfig.amount * 100,
            currency: paymentConfig.currency,
            name: "JobPortal Talent Search",
            description: `Buying ${selectedPackage.databaseCredits} Search Credits`,
            handler: (response) => verifyPaymentOnBackend(response.razorpay_payment_id, 'razorpay'),
            prefill: {
                name: company?.contactPersonName,
                email: company?.email,
                contact: company?.phoneNumber
            },
            theme: { color: "#10b981" }
        };
        new window.Razorpay(options).open();
    };

    if (loading) return <div className="h-[60vh] flex items-center justify-center"><Loader2 className="animate-spin text-emerald-600" size={32} /></div>;

    return (
        <div className="max-w-6xl mx-auto pb-20 px-4 space-y-10 font-sans">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-all font-bold text-sm">
                    <ArrowLeft size={18} /> Back to Search
                </button>
                <div className="bg-emerald-50 px-5 py-2.5 rounded-2xl border border-emerald-100 flex items-center gap-3">
                    <Database size={20} className="text-emerald-600" />
                    <div>
                        <p className="text-[10px] font-bold text-emerald-600/60 uppercase leading-none mb-1">Current Credits</p>
                        <p className="text-lg font-black text-emerald-700 leading-none">{company?.databaseCredits || 0}</p>
                    </div>
                </div>
            </div>

            <div className="text-center space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100 mb-2">
                   <Sparkles size={12}/> Talent database access
                </div>
                <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Buy Talent Search Credits</h1>
                <p className="text-slate-500 font-medium max-w-lg mx-auto text-sm italic">Unlock verified professional profiles and download resumes instantly.</p>
            </div>

            {/* Credit Packages Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                {packages.map((pkg, idx) => (
                    <motion.div 
                        key={pkg.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm hover:shadow-xl hover:border-emerald-200 transition-all group relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -mr-16 -mt-16 opacity-50 group-hover:scale-110 transition-transform"></div>
                        
                        <div className="relative z-10 space-y-6">
                            <div>
                                <h3 className="text-xl font-bold text-slate-800">{pkg.name}</h3>
                                <p className="text-xs text-slate-400 font-medium mt-1">{pkg.durationDays} days validity</p>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-100">
                                    <Database size={28} />
                                </div>
                                <div>
                                    <p className="text-3xl font-black text-slate-900">{pkg.databaseCredits}</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Profile Unlocks</p>
                                </div>
                            </div>

                            <div className="flex items-baseline gap-1 pt-4">
                                <span className="text-2xl font-bold text-slate-800">₹{pkg.price}</span>
                                <span className="text-slate-400 text-xs font-semibold">One-time payment</span>
                            </div>

                            <div className="space-y-4 py-6 border-t border-slate-50">
                                <FeatureItem text="Unlimited Candidate Search" />
                                <FeatureItem text="Deep Resume Matching" />
                                <FeatureItem text="Full Contact Details Access" />
                                <FeatureItem text="Direct Resume Downloads" />
                            </div>

                            <button 
                                onClick={() => handleRecharge(pkg)}
                                disabled={purchasing === pkg.id}
                                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-emerald-600 transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95 disabled:opacity-50"
                            >
                                {purchasing === pkg.id ? <Loader2 className="animate-spin" size={18}/> : <CreditCard size={18}/>}
                                {purchasing === pkg.id ? 'Processing...' : 'Buy Now'}
                            </button>
                        </div>
                    </motion.div>
                ))}

                {packages.length === 0 && (
                    <div className="col-span-full py-20 text-center bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
                        <Database className="mx-auto text-slate-300 mb-4" size={48} />
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No credit plans available yet</p>
                    </div>
                )}
            </div>

            {/* Payment Modal */}
            <AnimatePresence>
                {showPaymentModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
                            <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-100"><CreditCard size={20} /></div>
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-800">Checkout</h3>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{selectedPackage?.name} • ₹{selectedPackage?.price}</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowPaymentModal(false)} className="p-2 hover:bg-slate-200 rounded-full transition-all text-slate-400"><X size={20} /></button>
                            </div>
                            <div className="p-8 space-y-6">
                                {(paymentConfig?.gateway === 'razorpay' || paymentConfig?.gateway === 'both') && (
                                    <button onClick={handleRazorpayPayment} className="w-full p-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-3 shadow-lg">
                                        <Zap size={18} fill="currentColor"/> Pay with Razorpay
                                    </button>
                                )}
                                {(paymentConfig?.gateway === 'paypal' || paymentConfig?.gateway === 'both') && (
                                    <PayPalScriptProvider options={{ "client-id": paymentConfig.keys.paypalClientId, currency: paymentConfig.currency }}>
                                        <PayPalButtons 
                                            style={{ layout: "vertical", shape: "pill" }}
                                            createOrder={(data, actions) => actions.order.create({ purchase_units: [{ amount: { value: paymentConfig.amount.toString() }, description: `Credits - ${selectedPackage.name}` }] })}
                                            onApprove={(data, actions) => actions.order.capture().then((details) => verifyPaymentOnBackend(details.id, 'paypal'))}
                                        />
                                    </PayPalScriptProvider>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

const FeatureItem = ({ text }) => (
    <div className="flex items-center gap-3">
        <div className="w-5 h-5 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center shrink-0 border border-emerald-100"><Check size={10} strokeWidth={4} /></div>
        <span className="text-xs font-bold text-slate-600">{text}</span>
    </div>
);

export default RecruiterBuyCredits;

import React, { useState, useEffect } from 'react';
import { Check, Zap, Shield, Loader2, Sparkles, IndianRupee, X, CreditCard } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

const RecruiterPricing = () => {
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [purchasing, setPurchasing] = useState(null);
    const [currentStats, setCurrentStats] = useState(null);

    // Payment Modal States
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedPackage, setSelectedPackage] = useState(null);
    const [paymentConfig, setPaymentConfig] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Packages and Current Plan Stats in parallel
                const [pkgRes, statsRes] = await Promise.all([
                    axios.get("http://localhost:8000/api/v1/company/packages", { withCredentials: true }),
                    axios.get("http://localhost:8000/api/v1/company/me", { withCredentials: true })
                ]);

                if (pkgRes.data.success) setPackages(pkgRes.data.packages);
                if (statsRes.data.success) setCurrentStats(statsRes.data);
            } catch (error) {
                // Mock packages if API fails
                setPackages([
                    { id: '1', name: 'Standard', price: 4999, durationDays: 30, jobLimit: 10, tier: 1, description: 'Perfect for small startups' },
                    { id: '2', name: 'Professional', price: 9999, durationDays: 90, jobLimit: 50, tier: 2, description: 'Best for growing companies' },
                    { id: '3', name: 'Unlimited', price: 24999, durationDays: 365, jobLimit: -1, tier: 3, description: 'For enterprise scale hiring' }
                ]);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleRecharge = async (pkg) => {
        try {
            setPurchasing(pkg.id);
            const res = await axios.post("http://localhost:8000/api/v1/company/purchase/initiate", 
                { packageId: pkg.id }, 
                { withCredentials: true }
            );

            if (res.data.success) {
                setPaymentConfig(res.data.orderData);
                setSelectedPackage(pkg);
                setShowPaymentModal(true);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Could not initiate payment.");
        } finally {
            setPurchasing(null);
        }
    };

    const verifyPaymentOnBackend = async (paymentId, gateway) => {
        try {
            const res = await axios.post("http://localhost:8000/api/v1/company/purchase/verify", {
                packageId: selectedPackage.id,
                paymentId: paymentId,
                gateway: gateway
            }, { withCredentials: true });

            if (res.data.success) {
                toast.success(res.data.message);
                setShowPaymentModal(false);
                setTimeout(() => {
                    window.location.href = "/recruiter/dashboard";
                }, 1500);
            }
        } catch (error) {
            toast.error("Payment verification failed. Please contact support.");
        }
    };

    const handleRazorpayPayment = () => {
        const options = {
            key: paymentConfig.keys.razorpayKeyId,
            amount: paymentConfig.amount * 100,
            currency: paymentConfig.currency,
            name: "JobPortal",
            description: `Purchase ${selectedPackage.name} Plan`,
            handler: function (response) {
                verifyPaymentOnBackend(response.razorpay_payment_id, 'razorpay');
            },
            prefill: {
                name: currentStats?.company?.contactPersonName,
                email: currentStats?.company?.email,
                contact: currentStats?.company?.phoneNumber
            },
            theme: { color: "#4f46e5" }
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
    };

    const getButtonDetails = (pkg) => {
        if (!currentStats) return { label: 'Get Started', disabled: false };
        
        const { company } = currentStats;
        const now = new Date();
        const isPlanActive = company.planType === 'premium' && company.planExpiresAt && new Date(company.planExpiresAt) > now;

        if (!isPlanActive) return { label: 'Get Started', disabled: false, variant: 'primary' };

        if (pkg.id === company.currentPackageId) {
            const daysLeft = Math.ceil((new Date(company.planExpiresAt) - now) / (1000 * 60 * 60 * 24));
            return { 
                label: daysLeft <= 5 ? 'Renew Plan' : 'Current Plan', 
                disabled: daysLeft > 5,
                variant: 'success'
            };
        }

        if (pkg.tier > company.currentPackageTier) {
            return { label: 'Upgrade Now', disabled: false, variant: 'upgrade' };
        }

        if (pkg.tier < company.currentPackageTier) {
            return { label: 'Downgrade Locked', disabled: true, variant: 'locked' };
        }

        return { label: 'Get Started', disabled: false };
    };

    if (loading) return (
        <div className="h-[60vh] flex items-center justify-center">
            <Loader2 className="animate-spin text-indigo-600" size={32} />
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto pb-20 px-4 space-y-12">
            
            {/* Payment Selection Modal */}
            <AnimatePresence>
                {showPaymentModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl"
                        >
                            <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                                        <CreditCard size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-800">Complete Payment</h3>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{selectedPackage?.name} • ₹{selectedPackage?.price}</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowPaymentModal(false)} className="p-2 hover:bg-slate-200 rounded-full transition-all text-slate-400">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-8 space-y-6">
                                {(paymentConfig?.gateway === 'razorpay' || paymentConfig?.gateway === 'both') && (
                                    <button 
                                        onClick={handleRazorpayPayment}
                                        className="w-full p-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-3 shadow-lg shadow-indigo-100"
                                    >
                                        <Zap size={18} fill="currentColor"/> Pay with Razorpay
                                    </button>
                                )}

                                {(paymentConfig?.gateway === 'paypal' || paymentConfig?.gateway === 'both') && (
                                    <div className="space-y-4">
                                        {(paymentConfig?.gateway === 'both') && (
                                            <div className="relative flex items-center justify-center">
                                                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
                                                <span className="relative px-4 bg-white text-[10px] font-bold text-slate-400 uppercase tracking-widest">OR</span>
                                            </div>
                                        )}
                                        <PayPalScriptProvider options={{ "client-id": paymentConfig.keys.paypalClientId, currency: paymentConfig.currency }}>
                                            <PayPalButtons 
                                                style={{ layout: "vertical", shape: "pill", label: "pay" }}
                                                createOrder={(data, actions) => {
                                                    return actions.order.create({
                                                        purchase_units: [{
                                                            amount: { value: paymentConfig.amount.toString() },
                                                            description: `JobPortal - ${selectedPackage.name} Plan`
                                                        }]
                                                    });
                                                }}
                                                onApprove={(data, actions) => {
                                                    return actions.order.capture().then((details) => {
                                                        verifyPaymentOnBackend(details.id, 'paypal');
                                                    });
                                                }}
                                                onError={(err) => {
                                                    toast.error("PayPal Payment Failed");
                                                }}
                                            />
                                        </PayPalScriptProvider>
                                    </div>
                                )}
                            </div>

                            <div className="p-6 bg-slate-50 text-center">
                                <p className="text-[10px] text-slate-400 font-bold flex items-center justify-center gap-2">
                                    <Shield size={12} className="text-emerald-500"/> SECURE 256-BIT ENCRYPTED PAYMENT
                                </p>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Simple, Transparent Pricing</h1>
                <p className="text-slate-500 font-medium max-w-lg mx-auto text-sm">Choose the right plan to accelerate your hiring process and find the best talent.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {packages.map((pkg, idx) => {
                    const btn = getButtonDetails(pkg);
                    return (
                        <motion.div 
                            key={pkg.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className={`relative bg-white rounded-3xl border p-8 shadow-sm hover:shadow-md transition-all duration-300 ${btn.variant === 'upgrade' ? 'border-indigo-600 ring-4 ring-indigo-50 z-10' : 'border-slate-200'}`}
                        >
                            {btn.variant === 'upgrade' && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-indigo-100 flex items-center gap-2">
                                    <Sparkles size={12}/> Recommended
                                </div>
                            )}
                            {btn.label === 'Current Plan' && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-emerald-50 flex items-center gap-2">
                                    <Check size={12}/> Active Plan
                                </div>
                            )}

                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-800">{pkg.name}</h3>
                                    <p className="text-xs text-slate-400 font-medium mt-1 leading-relaxed">{pkg.description}</p>
                                </div>

                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-bold text-slate-900">₹{pkg.price}</span>
                                    <span className="text-slate-400 text-xs font-semibold">/ {pkg.durationDays} Days</span>
                                </div>

                                <div className="space-y-4 pt-6 border-t border-slate-50">
                                    <FeatureItem text={`${pkg.jobLimit === -1 ? 'Unlimited' : pkg.jobLimit} Job Postings`} />
                                    <FeatureItem text={`Tier ${pkg.tier} Visibility Priority`} />
                                    <FeatureItem text="AI Match Technology" />
                                    <FeatureItem text="Priority Admin Review" />
                                    <FeatureItem text="Candidate Messaging" />
                                </div>

                                <button 
                                    onClick={() => handleRecharge(pkg)}
                                    disabled={purchasing === pkg.id || btn.disabled}
                                    className={`w-full py-3.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                                        btn.variant === 'upgrade' || btn.variant === 'primary'
                                        ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm' 
                                        : btn.variant === 'success'
                                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 cursor-default'
                                        : 'bg-slate-50 text-slate-400 border border-slate-100 cursor-not-allowed'
                                    }`}
                                >
                                    {purchasing === pkg.id ? <Loader2 className="animate-spin" size={16}/> : <Zap size={16}/>}
                                    {purchasing === pkg.id ? 'Processing...' : btn.label}
                                </button>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            <div className="mt-16 p-8 bg-slate-900 rounded-3xl text-white flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden shadow-sm">
                <div className="space-y-2 z-10">
                    <h3 className="text-xl font-bold tracking-tight">Need a custom plan for your enterprise?</h3>
                    <p className="text-slate-400 text-sm font-medium">Get in touch with our sales team for tailored hiring solutions.</p>
                </div>
                <button className="z-10 px-8 py-3 bg-white text-slate-900 rounded-xl text-xs font-bold hover:bg-indigo-50 transition-all flex items-center gap-2">
                    Contact Sales <Shield size={18} className="text-indigo-600" />
                </button>
                <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl"></div>
            </div>
        </div>
    );
};

const FeatureItem = ({ text }) => (
    <div className="flex items-center gap-3">
        <div className="w-5 h-5 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center shrink-0">
            <Check size={12} strokeWidth={3} />
        </div>
        <span className="text-xs font-bold text-slate-600">{text}</span>
    </div>
);

export default RecruiterPricing;


import React, { useState, useEffect } from 'react';
import { Check, Zap, Shield, Loader2, Sparkles, X, CreditCard, Database, Briefcase } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

const RecruiterPricing = () => {
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [purchasing, setPurchasing] = useState(null);
    const [currentStats, setCurrentStats] = useState(null);
    const [activeTab, setActiveTab] = useState('job_post');

    // Payment Modal States
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedPackage, setSelectedPackage] = useState(null);
    const [paymentConfig, setPaymentConfig] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [pkgRes, statsRes] = await Promise.all([
                    axios.get("http://localhost:8000/api/v1/company/packages", { withCredentials: true }),
                    axios.get("http://localhost:8000/api/v1/company/me", { withCredentials: true })
                ]);

                if (pkgRes.data.success) setPackages(pkgRes.data.packages);
                if (statsRes.data.success) setCurrentStats(statsRes.data);
            } catch (error) {
                toast.error("Failed to load plans");
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
            toast.error("Payment verification failed.");
        }
    };

    const handleRazorpayPayment = () => {
        const options = {
            key: paymentConfig.keys.razorpayKeyId,
            amount: paymentConfig.amount * 100,
            currency: paymentConfig.currency,
            name: "JobPortal",
            description: `Purchase ${selectedPackage.name}`,
            handler: (response) => verifyPaymentOnBackend(response.razorpay_payment_id, 'razorpay'),
            prefill: {
                name: currentStats?.company?.contactPersonName,
                email: currentStats?.company?.email,
                contact: currentStats?.company?.phoneNumber
            },
            theme: { color: "#4f46e5" }
        };
        new window.Razorpay(options).open();
    };

    const getButtonDetails = (pkg) => {
        if (!currentStats) return { label: 'Get Started', disabled: false, variant: 'primary' };
        
        const { company } = currentStats;
        
        // Database credits can always be bought
        if (pkg.type === 'database_access') return { label: 'Buy Credits', disabled: false, variant: 'primary' };

        const now = new Date();
        const isPlanActive = company.planType === 'premium' && company.planExpiresAt && new Date(company.planExpiresAt) > now;

        if (!isPlanActive) return { label: 'Get Started', disabled: false, variant: 'primary' };

        if (pkg.id === company.currentPackageId) {
            const daysLeft = Math.ceil((new Date(company.planExpiresAt) - now) / (1000 * 60 * 60 * 24));
            return { 
                label: daysLeft <= 5 ? 'Renew Plan' : 'Active Plan', 
                disabled: daysLeft > 5,
                variant: daysLeft <= 5 ? 'upgrade' : 'success'
            };
        }

        if (pkg.tier > company.currentPackageTier) return { label: 'Upgrade Now', disabled: false, variant: 'upgrade' };
        if (pkg.tier < company.currentPackageTier) return { label: 'Downgrade Locked', disabled: true, variant: 'locked' };

        return { label: 'Get Started', disabled: false, variant: 'primary' };
    };

    if (loading) return <div className="h-[60vh] flex items-center justify-center"><Loader2 className="animate-spin text-indigo-600" size={32} /></div>;

    const filteredPackages = packages.filter(p => p.type === activeTab);

    return (
        <div className="max-w-6xl mx-auto pb-20 px-4 space-y-10 font-sans">
            
            {/* Payment Modal */}
            <AnimatePresence>
                {showPaymentModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
                            <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100"><CreditCard size={20} /></div>
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-800">Complete Purchase</h3>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{selectedPackage?.name} • ₹{selectedPackage?.price}</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowPaymentModal(false)} className="p-2 hover:bg-slate-200 rounded-full transition-all text-slate-400"><X size={20} /></button>
                            </div>
                            <div className="p-8 space-y-6">
                                {(paymentConfig?.gateway === 'razorpay' || paymentConfig?.gateway === 'both') && (
                                    <button onClick={handleRazorpayPayment} className="w-full p-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-3 shadow-lg">
                                        <Zap size={18} fill="currentColor"/> Pay with Razorpay
                                    </button>
                                )}
                                {(paymentConfig?.gateway === 'paypal' || paymentConfig?.gateway === 'both') && (
                                    <PayPalScriptProvider options={{ "client-id": paymentConfig.keys.paypalClientId, currency: paymentConfig.currency }}>
                                        <PayPalButtons 
                                            style={{ layout: "vertical", shape: "pill" }}
                                            createOrder={(data, actions) => actions.order.create({ purchase_units: [{ amount: { value: paymentConfig.amount.toString() }, description: `JobPortal - ${selectedPackage.name}` }] })}
                                            onApprove={(data, actions) => actions.order.capture().then((details) => verifyPaymentOnBackend(details.id, 'paypal'))}
                                        />
                                    </PayPalScriptProvider>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <div className="text-center space-y-4">
                <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Flexible Plans for Every Need</h1>
                <p className="text-slate-500 font-medium max-w-lg mx-auto text-sm">Choose between job posting subscriptions or talent database credits.</p>
                
                {/* Tabs */}
                <div className="flex justify-center mt-8">
                    <div className="bg-slate-100 p-1.5 rounded-2xl flex gap-1 border border-slate-200 shadow-inner">
                        <button onClick={() => setActiveTab('job_post')} className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'job_post' ? 'bg-white text-indigo-600 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}>
                            <Briefcase size={14} /> Job Postings
                        </button>
                        <button onClick={() => setActiveTab('database_access')} className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'database_access' ? 'bg-white text-emerald-600 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}>
                            <Database size={14} /> Talent Database
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {filteredPackages.map((pkg, idx) => {
                    const btn = getButtonDetails(pkg);
                    const isDB = pkg.type === 'database_access';
                    return (
                        <motion.div key={pkg.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} className={`relative bg-white rounded-3xl border p-8 shadow-sm hover:shadow-md transition-all duration-300 ${btn.variant === 'upgrade' ? (isDB ? 'border-emerald-600 ring-4 ring-emerald-50' : 'border-indigo-600 ring-4 ring-indigo-50') : 'border-slate-200'}`}>
                            {btn.variant === 'success' && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg flex items-center gap-2"><Check size={12}/> Active Plan</div>
                            )}

                            <div className="space-y-6">
                                <div>
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-xl font-bold text-slate-800">{pkg.name}</h3>
                                        <div className={`p-2 rounded-lg ${isDB ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'}`}>
                                            {isDB ? <Database size={20}/> : <Zap size={20} fill="currentColor"/>}
                                        </div>
                                    </div>
                                    <p className="text-xs text-slate-400 font-medium leading-relaxed">{pkg.description}</p>
                                </div>

                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-bold text-slate-900">₹{pkg.price}</span>
                                    <span className="text-slate-400 text-xs font-semibold">/ {pkg.durationDays} Days</span>
                                </div>

                                <div className="space-y-4 pt-6 border-t border-slate-50">
                                    {isDB ? (
                                        <>
                                            <FeatureItem text={`${pkg.databaseCredits} Profile Unlocks`} />
                                            <FeatureItem text="Unlimited Boolean Searches" />
                                            <FeatureItem text="Resume Deep-Scan Access" />
                                            <FeatureItem text="One-Click Profile Save" />
                                        </>
                                    ) : (
                                        <>
                                            <FeatureItem text={`${pkg.jobLimit === -1 ? 'Unlimited' : pkg.jobLimit} Job Postings`} />
                                            <FeatureItem text={`Tier ${pkg.tier} Visibility Priority`} />
                                            <FeatureItem text="AI Match Technology" />
                                            <FeatureItem text="Priority Admin Review" />
                                        </>
                                    )}
                                    <FeatureItem text="Email/Chat Support" />
                                </div>

                                <button 
                                    onClick={() => handleRecharge(pkg)}
                                    disabled={purchasing === pkg.id || btn.disabled}
                                    className={`w-full py-3.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                                        btn.variant === 'upgrade' || btn.variant === 'primary'
                                        ? (isDB ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm')
                                        : btn.variant === 'success'
                                        ? 'bg-slate-50 text-slate-400 border border-slate-100 cursor-default'
                                        : 'bg-slate-50 text-slate-400 border border-slate-100 cursor-not-allowed'
                                    }`}
                                >
                                    {purchasing === pkg.id ? <Loader2 className="animate-spin" size={16}/> : (isDB ? <Database size={16}/> : <Zap size={16}/>)}
                                    {purchasing === pkg.id ? 'Processing...' : btn.label}
                                </button>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};

const FeatureItem = ({ text }) => (
    <div className="flex items-center gap-3">
        <div className="w-5 h-5 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center shrink-0 border border-slate-100"><Check size={10} strokeWidth={4} /></div>
        <span className="text-xs font-bold text-slate-600">{text}</span>
    </div>
);

export default RecruiterPricing;

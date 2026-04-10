import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    CreditCard, 
    Download, 
    ChevronRight, 
    Zap, 
    Clock, 
    History,
    Loader2,
    FileText,
    CheckCircle2
} from 'lucide-react';
import { motion } from 'framer-motion';

const RecruiterBilling = () => {
    const [history, setHistory] = useState([]);
    const [stats, setPlanStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBillingData = async () => {
            try {
                const [historyRes, profileRes] = await Promise.all([
                    axios.get("http://localhost:8000/api/v1/company/billing", { withCredentials: true }),
                    axios.get("http://localhost:8000/api/v1/company/me", { withCredentials: true })
                ]);
                if (historyRes.data.success) setHistory(historyRes.data.history);
                if (profileRes.data.success) setPlanStats(profileRes.data.stats);
            } catch (error) {
                console.error("Billing fetch error");
            } finally {
                setLoading(false);
            }
        };
        fetchBillingData();
    }, []);

    if (loading) return (
        <div className="h-[60vh] flex items-center justify-center">
            <Loader2 className="animate-spin text-indigo-600" size={32} />
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto pb-20 px-4 space-y-10">
            <div className="space-y-1">
                <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Plans & Billing</h1>
                <p className="text-sm text-slate-500 font-medium">Manage your subscriptions and view payment history.</p>
            </div>

            {/* Current Plan Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">Active Subscription</p>
                            <h2 className="text-2xl font-bold text-slate-800">{stats?.planName}</h2>
                        </div>
                        <div className="px-4 py-1.5 bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-widest rounded-full border border-emerald-100 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div> Active
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
                        <div className="space-y-1">
                            <p className="text-xs font-bold text-slate-400">Jobs Posted</p>
                            <p className="text-xl font-bold text-slate-800">{stats?.jobsUsed}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs font-bold text-slate-400">Total Limit</p>
                            <p className="text-xl font-bold text-slate-800">{stats?.jobLimit === -1 ? 'Unlimited' : stats?.jobLimit}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs font-bold text-slate-400">Valid Until</p>
                            <p className="text-xl font-bold text-slate-800">{new Date(stats?.expiryDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                        </div>
                    </div>

                    <div className="mt-10 pt-8 border-t border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <p className="text-[11px] font-medium text-slate-400 italic leading-relaxed text-center sm:text-left">Need more posting capacity? Upgrade to a higher tier plan for more credits.</p>
                        <button onClick={() => window.location.href='/recruiter/pricing'} className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all shadow-sm shrink-0">Upgrade Now</button>
                    </div>
                </div>

                <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden flex flex-col justify-between shadow-sm">
                    <div className="z-10">
                        <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-6">
                            <CreditCard className="text-white" size={24} />
                        </div>
                        <h3 className="text-lg font-bold mb-2">Billing Support</h3>
                        <p className="text-slate-400 text-xs font-medium leading-relaxed">Having issues with a payment? Our support team is here to help you 24/7.</p>
                    </div>
                    <div className="z-10 mt-8">
                        <button className="w-full py-3 bg-white text-slate-900 rounded-xl text-xs font-bold hover:bg-indigo-50 transition-all shadow-sm">Contact Support</button>
                    </div>
                    <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-indigo-600/20 rounded-full blur-3xl"></div>
                </div>
            </div>

            {/* Transaction History Table */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-8 py-5 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                    <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 uppercase tracking-wide">
                        <History className="text-indigo-600" size={18} /> Transaction History
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50/50">
                                <th className="px-8 py-4">Package Name</th>
                                <th className="px-8 py-4 text-center">Amount</th>
                                <th className="px-8 py-4 text-center">Date</th>
                                <th className="px-8 py-4 text-center">Transaction ID</th>
                                <th className="px-8 py-4 text-center">Status</th>
                                <th className="px-8 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {history.map((tx) => (
                                <tr key={tx.id} className="hover:bg-slate-50/30 transition-colors group">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
                                                <Zap size={14} fill="currentColor"/>
                                            </div>
                                            <span className="text-sm font-bold text-slate-700">{tx.packageName}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-sm font-bold text-slate-800 text-center">₹{tx.amount}</td>
                                    <td className="px-8 py-5 text-xs font-medium text-slate-500 text-center">{new Date(tx.createdAt).toLocaleDateString('en-GB')}</td>
                                    <td className="px-8 py-5 font-mono text-[10px] text-slate-400 text-center">{tx.paymentId}</td>
                                    <td className="px-8 py-5 text-center">
                                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-tight ${
                                            tx.status === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'
                                        }`}>
                                            {tx.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                                            <Download size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {history.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="px-8 py-20 text-center bg-white">
                                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <FileText className="text-slate-300" size={24} />
                                        </div>
                                        <p className="text-slate-400 font-bold text-sm tracking-tight uppercase">No transaction records found</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default RecruiterBilling;

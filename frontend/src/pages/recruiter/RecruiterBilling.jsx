import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    CreditCard, 
    Download, 
    Zap, 
    Clock, 
    History,
    Loader2,
    FileText,
    Database,
    Briefcase
} from 'lucide-react';
import { motion } from 'framer-motion';
import { COMPANY_API_END_POINT } from '../../utils/constant';

const RecruiterBilling = () => {
    const [history, setHistory] = useState([]);
    const [stats, setPlanStats] = useState(null);
    const [company, setCompany] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBillingData = async () => {
            try {
                const [historyRes, profileRes] = await Promise.all([
                    axios.get(`${COMPANY_API_END_POINT}/billing`, { withCredentials: true }),
                    axios.get(`${COMPANY_API_END_POINT}/me`, { withCredentials: true })
                ]);
                if (historyRes.data.success) setHistory(historyRes.data.history);
                if (profileRes.data.success) {
                    setPlanStats(profileRes.data.stats);
                    setCompany(profileRes.data.company);
                }
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
        <div className="max-w-6xl mx-auto pb-20 px-4 space-y-10 font-sans">
            <div className="space-y-1">
                <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Billing & Subscriptions</h1>
                <p className="text-sm text-slate-500 font-medium">Manage your active plans and track credit usage.</p>
            </div>

            {/* Current Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* 1. Job Posting Plan */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                                <Briefcase size={20} />
                            </div>
                            <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase rounded-full">Recruitment Plan</span>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-800">{stats?.planName || 'No Plan'}</h2>
                            <p className="text-xs text-slate-400 font-semibold mt-1 uppercase tracking-wider">Active until {new Date(stats?.expiryDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-6 py-4 border-t border-slate-50">
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Jobs Remaining</p>
                                <p className="text-lg font-bold text-slate-800">{stats?.jobsRemaining}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Total Used</p>
                                <p className="text-lg font-bold text-slate-800">{stats?.jobsUsed}</p>
                            </div>
                        </div>
                    </div>
                    <button onClick={() => window.location.href='/recruiter/pricing'} className="w-full mt-4 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all">Modify Subscription</button>
                </div>

                {/* 2. Talent Database Plan */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                                <Database size={20} />
                            </div>
                            <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase rounded-full">Talent Database</span>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-800">Search Credits</h2>
                            <p className="text-xs text-slate-400 font-semibold mt-1 uppercase tracking-wider">Pay-as-you-go Access</p>
                        </div>
                        <div className="grid grid-cols-2 gap-6 py-4 border-t border-slate-50">
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Available Credits</p>
                                <p className="text-2xl font-black text-emerald-600">{company?.databaseCredits || 0}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Profiles Unlocked</p>
                                <p className="text-lg font-bold text-slate-800">{company?.unlockedCandidates?.length || 0}</p>
                            </div>
                        </div>
                    </div>
                    <button onClick={() => window.location.href='/recruiter/buy-credits'} className="w-full mt-4 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all">Refill Credits</button>
                </div>
            </div>

            {/* Transaction History */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-8 py-5 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
                    <History size={18} className="text-slate-400" />
                    <h3 className="text-sm font-bold text-slate-800">PAYMENT HISTORY</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-white border-b border-slate-50">
                                <th className="px-8 py-4">Plan / Package</th>
                                <th className="px-8 py-4">Amount</th>
                                <th className="px-8 py-4">Date</th>
                                <th className="px-8 py-4">Payment ID</th>
                                <th className="px-8 py-4">Status</th>
                                <th className="px-8 py-4 text-right">Invoice</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {history.map((tx) => (
                                <tr key={tx.id} className="hover:bg-slate-50/30 transition-colors">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${tx.packageName.includes('CUSTOM') || tx.packageName.includes('Standard') ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                                {tx.packageName.includes('Standard') ? <Briefcase size={14} /> : <Database size={14}/>}
                                            </div>
                                            <span className="text-sm font-bold text-slate-700">{tx.packageName}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-sm font-bold text-slate-800">₹{tx.amount}</td>
                                    <td className="px-8 py-5 text-xs font-medium text-slate-500">{new Date(tx.createdAt).toLocaleDateString('en-GB')}</td>
                                    <td className="px-8 py-5 font-mono text-[10px] text-slate-400">{tx.paymentId}</td>
                                    <td className="px-8 py-5">
                                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase ${
                                            tx.status === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                                        }`}>
                                            {tx.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <button className="p-2 text-slate-400 hover:text-indigo-600 rounded-lg transition-all">
                                            <Download size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {history.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="px-8 py-16 text-center text-slate-400 font-bold uppercase text-xs">No records found</td>
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

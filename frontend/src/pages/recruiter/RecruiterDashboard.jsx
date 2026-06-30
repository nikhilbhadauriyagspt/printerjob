import React, { useState, useEffect } from 'react';
import { 
    Users, 
    Briefcase, 
    ArrowUpRight, 
    Plus,
    Zap,
    Target,
    MessageSquare,
    Building2,
    Globe,
    MapPin,
    Search,
    TrendingUp,
    Calendar,
    ArrowDownRight,
    Clock,
    UserPlus,
    ChevronRight,
    LayoutGrid
} from 'lucide-react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
    AreaChart, 
    Area, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import { useNavigate } from 'react-router-dom';

const API_BASE = "https://mediumturquoise-goshawk-440855.hostingersite.com/api/v1";

// Mock data for Charts
const pipelineData = [
    { name: 'Mon', apps: 45, hires: 12 },
    { name: 'Tue', apps: 52, hires: 15 },
    { name: 'Wed', apps: 38, hires: 10 },
    { name: 'Thu', apps: 65, hires: 22 },
    { name: 'Fri', apps: 48, hires: 18 },
    { name: 'Sat', apps: 24, hires: 8 },
    { name: 'Sun', apps: 15, hires: 5 },
];

const categoryData = [
    { name: 'Tech', value: 40, color: '#6366f1' },
    { name: 'Design', value: 25, color: '#f43f5e' },
    { name: 'Marketing', value: 20, color: '#10b981' },
    { name: 'Sales', value: 15, color: '#f59e0b' },
];

const RecruiterDashboard = () => {
    const navigate = useNavigate();
    const [company, setCompany] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const res = await axios.get(`${API_BASE}/company/me`, { withCredentials: true });
                if (res.data.success) {
                    setCompany(res.data.company);
                }
            } catch (error) {
                console.error("Dashboard fetch error", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    if (loading) return (
        <div className="h-[60vh] flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    if (!company) return null;

    const stats = [
        { label: 'Active Jobs', value: '14', change: '+2', trend: 'up', icon: <Briefcase size={18} className="text-indigo-600" />, bg: 'bg-indigo-50' },
        { label: 'Total Applicants', value: '1,284', change: '+12%', trend: 'up', icon: <Users size={18} className="text-blue-600" />, bg: 'bg-blue-50' },
        { label: 'Avg. Match Rate', value: '82%', change: '+5%', trend: 'up', icon: <Target size={18} className="text-emerald-600" />, bg: 'bg-emerald-50' },
        { label: 'Selection Rate', value: '18%', change: '-2%', trend: 'down', icon: <Zap size={18} className="text-amber-600" />, bg: 'bg-amber-50' },
    ];

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-16 px-2">
            
            {/* Subscription Alert Banner */}
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm ${
                    (company.planType === 'none' || new Date(company.planType === 'trial' ? company.trialExpiresAt : company.planExpiresAt) < new Date())
                    ? 'bg-rose-50 border-rose-100'
                    : 'bg-indigo-50 border-indigo-100'
                }`}
            >
                <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        (company.planType === 'none' || new Date(company.planType === 'trial' ? company.trialExpiresAt : company.planExpiresAt) < new Date())
                        ? 'bg-rose-100 text-rose-600'
                        : 'bg-indigo-100 text-indigo-600'
                    }`}>
                        <Zap size={24} fill="currentColor" />
                    </div>
                    <div>
                        <h4 className={`text-sm font-bold ${
                            (company.planType === 'none' || new Date(company.planType === 'trial' ? company.trialExpiresAt : company.planExpiresAt) < new Date())
                            ? 'text-rose-800'
                            : 'text-indigo-800'
                        }`}>
                            {company.planType === 'none' ? 'No Active Plan' : (company.planType === 'trial' ? 'Free Trial Active' : 'Premium Plan Active')}
                        </h4>
                        <p className="text-xs font-medium text-slate-500">
                            {company.planType === 'none' 
                                ? "You don't have an active job posting plan. Please complete your profile (80%) or buy a package."
                                : (company.planType === 'trial' && !company.trialExpiresAt) || (company.planType === 'premium' && !company.planExpiresAt)
                                    ? "Setting up your access... Please refresh if this persists."
                                    : new Date(company.planType === 'trial' ? company.trialExpiresAt : company.planExpiresAt) < new Date() 
                                        ? "Your access has expired. Please recharge to continue posting jobs."
                                        : (new Date(company.trialExpiresAt).getFullYear() > 2100) 
                                            ? "You have Lifetime Free Access to post jobs." 
                                            : `Valid until ${new Date(company.planType === 'trial' ? company.trialExpiresAt : company.planExpiresAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`}
                        </p>
                    </div>
                </div>
                <button 
                    onClick={() => navigate("/recruiter/pricing")}
                    className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${
                        (company.planType === 'none' || (company.planType !== 'none' && new Date(company.planType === 'trial' ? company.trialExpiresAt : company.planExpiresAt) < new Date()))
                        ? 'bg-rose-600 text-white hover:bg-rose-700'
                        : 'bg-white text-indigo-600 border border-indigo-200 hover:bg-indigo-50'
                    }`}
                >
                    {company.planType === 'none' || (company.planType !== 'none' && new Date(company.planType === 'trial' ? company.trialExpiresAt : company.planExpiresAt) < new Date()) ? 'Recharge Now' : 'Upgrade Plan'}
                </button>
            </motion.div>

            {/* Minimal Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
                        Welcome back, {company.companyName}
                    </h1>
                    <p className="text-sm text-slate-500 font-medium tracking-wide">Here is what's happening with your recruitment today.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50 transition-all">
                        <Calendar size={16} /> Schedule
                    </button>
                    <button 
                        onClick={() => navigate("/recruiter/jobs/new")}
                        className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold shadow-sm hover:bg-indigo-700 transition-all active:scale-95"
                    >
                        <Plus size={18} /> Post New Job
                    </button>
                </div>
            </div>

            {/* Clean Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {stats.map((stat, idx) => (
                    <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm group">
                        <div className="flex items-center justify-between mb-3">
                            <div className={`${stat.bg} w-10 h-10 rounded-xl flex items-center justify-center`}>
                                {stat.icon}
                            </div>
                            <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                stat.trend === 'up' ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'
                            }`}>
                                {stat.trend === 'up' ? <TrendingUp size={10} /> : <ArrowDownRight size={10} />}
                                {stat.change}
                            </div>
                        </div>
                        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                        <div className="flex items-center justify-between mt-0.5">
                            <h3 className="text-2xl font-bold text-slate-800 tracking-tight">{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Main Analytics Area */}
                <div className="lg:col-span-8 space-y-6">
                    
                    {/* Activity Chart */}
                    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><LayoutGrid size={18}/></div>
                                <h3 className="text-base font-bold text-slate-800">Application Trends</h3>
                            </div>
                            <select className="bg-slate-50 border border-slate-100 rounded-lg text-[10px] font-bold px-3 py-1.5 outline-none text-slate-500 uppercase tracking-wider">
                                <option>Weekly View</option>
                                <option>Monthly View</option>
                            </select>
                        </div>
                        <div className="h-72 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={pipelineData}>
                                    <defs>
                                        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 600}} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 600}} />
                                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', fontSize: '12px', fontWeight: '600' }} />
                                    <Area type="monotone" dataKey="apps" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#chartGradient)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Compact Applicants Table */}
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="text-base font-bold text-slate-800">Recent Applicants</h3>
                            <button className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">View All Candidates</button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50/50">
                                        <th className="px-6 py-3">Candidate</th>
                                        <th className="px-6 py-3">Applied For</th>
                                        <th className="px-6 py-3">Status</th>
                                        <th className="px-6 py-3 text-right">Match</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {[
                                        { name: 'Aditya Kumar', role: 'Sr. Backend Dev', status: 'In Review', match: 95 },
                                        { name: 'Sneha Sharma', role: 'UI/UX Designer', status: 'Interview', match: 88 },
                                        { name: 'Rohan Mehra', role: 'Data Analyst', status: 'Screening', match: 72 },
                                    ].map((app, i) => (
                                        <tr key={i} className="hover:bg-slate-50/30 transition-colors cursor-pointer group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 font-bold text-[10px]">
                                                        {app.name.charAt(0)}
                                                    </div>
                                                    <span className="text-sm font-semibold text-slate-700">{app.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-xs font-medium text-slate-500">{app.role}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-tighter ${
                                                    app.status === 'Interview' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
                                                }`}>
                                                    {app.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="text-xs font-bold text-slate-800">{app.match}%</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Sidebar Column */}
                <div className="lg:col-span-4 space-y-6">
                    
                    {/* Completion Mini Widget */}
                    {company.profileCompletionScore < 100 && (
                        <div className="bg-indigo-600 rounded-3xl p-6 text-white shadow-sm relative overflow-hidden group">
                            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-500"></div>
                            <h4 className="text-sm font-bold mb-1">Boost Your Visibility</h4>
                            <p className="text-[11px] text-indigo-100 font-medium mb-4 leading-relaxed">Complete your profile to unlock premium hiring tools.</p>
                            <div className="h-1.5 w-full bg-indigo-800 rounded-full mb-4">
                                <div className="h-full bg-white rounded-full" style={{ width: `${company.profileCompletionScore}%` }}></div>
                            </div>
                            <button onClick={() => navigate("/recruiter/setup-profile")} className="w-full py-2.5 bg-white text-indigo-600 rounded-xl text-xs font-bold hover:bg-indigo-50 transition-all flex items-center justify-center gap-2">
                                Finish Setup <ChevronRight size={14}/>
                            </button>
                        </div>
                    )}

                    {/* Pie Chart Widget */}
                    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
                        <h4 className="text-sm font-bold text-slate-800 mb-6">Job Distribution</h4>
                        <div className="h-44 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={categoryData} innerRadius={50} outerRadius={65} paddingAngle={5} dataKey="value">
                                        {categoryData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="space-y-2 mt-4">
                            {categoryData.map((cat, i) => (
                                <div key={i} className="flex items-center justify-between text-[11px]">
                                    <div className="flex items-center gap-2 font-semibold text-slate-500">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }}></div>
                                        {cat.name}
                                    </div>
                                    <span className="font-bold text-slate-800">{cat.value}%</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Notification Feed */}
                    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h4 className="text-sm font-bold text-slate-800">Recent Feed</h4>
                            <Clock size={14} className="text-slate-400" />
                        </div>
                        <div className="space-y-6">
                            {[
                                { icon: <UserPlus size={14}/>, title: 'New Application', time: '10m ago', color: 'text-blue-500 bg-blue-50' },
                                { icon: <MessageSquare size={14}/>, title: 'Chat from Alex', time: '1h ago', color: 'text-emerald-500 bg-emerald-50' },
                                { icon: <Zap size={14}/>, title: 'New Top Match', time: '2h ago', color: 'text-amber-500 bg-amber-50' },
                            ].map((feed, i) => (
                                <div key={i} className="flex gap-4">
                                    <div className={`w-8 h-8 rounded-lg ${feed.color} flex items-center justify-center shrink-0`}>
                                        {feed.icon}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs font-bold text-slate-700 leading-none">{feed.title}</p>
                                        <p className="text-[10px] text-slate-400 font-medium mt-1">{feed.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>

        </div>
    );
};

export default RecruiterDashboard;

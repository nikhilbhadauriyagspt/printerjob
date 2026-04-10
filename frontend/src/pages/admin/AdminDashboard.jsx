import React from 'react';
import { 
    Users, 
    Briefcase, 
    ClipboardCheck, 
    TrendingUp, 
    Plus,
    Building2,
    MoreHorizontal,
    ArrowRight,
    Search
} from 'lucide-react';

const AdminDashboard = () => {
    
    const stats = [
        { label: 'Total Jobs', value: '142', change: '+12', icon: <Briefcase size={20} className="text-blue-600" />, bg: 'bg-blue-50' },
        { label: 'Total Applicants', value: '2,840', change: '+156', icon: <Users size={20} className="text-purple-600" />, bg: 'bg-purple-50' },
        { label: 'Shortlisted', value: '452', change: '+42', icon: <ClipboardCheck size={20} className="text-emerald-600" />, bg: 'bg-emerald-50' },
        { label: 'Companies', value: '86', change: '+4', icon: <Building2 size={20} className="text-orange-600" />, bg: 'bg-orange-50' },
    ];

    const recentJobs = [
        { title: 'Frontend Developer', company: 'Tech Solutions', type: 'Full-time', apps: 45, date: '2 days ago' },
        { title: 'Product Manager', company: 'Startup Hub', type: 'Remote', apps: 12, date: '5 days ago' },
        { title: 'UI/UX Designer', company: 'Design Agency', type: 'Contract', apps: 89, date: '1 week ago' },
    ];

    return (
        <div className="space-y-6">
            
            {/* Top Welcome Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-slate-800">Welcome Back, Admin</h1>
                    <p className="text-sm text-slate-500 mt-1 font-medium">Here's what's happening with your job portal today.</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm">
                    <Plus size={18} />
                    <span>Post New Job</span>
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, idx) => (
                    <div key={idx} className="bg-white border border-slate-200 rounded-xl p-5 hover:border-blue-200 transition-colors">
                        <div className="flex items-center justify-between mb-3">
                            <div className={`${stat.bg} p-2.5 rounded-lg`}>
                                {stat.icon}
                            </div>
                            <div className="flex items-center gap-1 text-emerald-600 text-xs font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                                <TrendingUp size={12} />
                                {stat.change}
                            </div>
                        </div>
                        <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                        <h3 className="text-2xl font-bold text-slate-800 mt-1">{stat.value}</h3>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Main Content: Recent Jobs */}
                <div className="lg:col-span-2">
                    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="font-bold text-slate-800">Recently Posted Jobs</h3>
                            <button className="text-sm font-bold text-blue-600 hover:underline">View All</button>
                        </div>
                        <div className="divide-y divide-slate-100">
                            {recentJobs.map((job, idx) => (
                                <div key={idx} className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors group cursor-pointer">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center font-bold text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                                            {job.company.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-800">{job.title}</p>
                                            <p className="text-xs text-slate-400 font-medium">{job.company} • {job.type}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-8">
                                        <div className="text-right hidden sm:block">
                                            <p className="text-sm font-bold text-slate-800">{job.apps}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Applicants</p>
                                        </div>
                                        <button className="p-1.5 hover:bg-white rounded-md text-slate-400 border border-transparent hover:border-slate-100">
                                            <MoreHorizontal size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar: Quick Stats/Actions */}
                <div className="space-y-6">
                    <div className="bg-slate-800 rounded-xl p-6 text-white shadow-sm">
                        <h4 className="font-bold text-sm mb-2">Hiring Tip</h4>
                        <p className="text-xs text-slate-300 leading-relaxed mb-4">Complete your company profile to increase candidate trust by up to 40%.</p>
                        <button className="text-[11px] font-bold bg-white text-slate-800 px-3 py-1.5 rounded flex items-center gap-1 hover:bg-blue-50 transition-colors">
                            Update Profile <ArrowRight size={12} />
                        </button>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                        <h3 className="font-bold text-slate-800 text-sm mb-4">Recent Activity</h3>
                        <div className="space-y-4">
                            {[1, 2, 3].map((_, i) => (
                                <div key={i} className="flex gap-3 items-start">
                                    <div className="w-1.5 h-1.5 mt-1.5 rounded-full bg-blue-600 shrink-0"></div>
                                    <div>
                                        <p className="text-xs font-semibold text-slate-700">New application for Frontend Dev</p>
                                        <p className="text-[10px] text-slate-400 mt-0.5">2 hours ago</p>
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

export default AdminDashboard;

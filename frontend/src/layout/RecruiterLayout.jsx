import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    LayoutDashboard, 
    Users, 
    Briefcase, 
    Settings, 
    Menu, 
    Search, 
    Bell, 
    LogOut,
    Plus,
    Zap,
    CreditCard,
    UserCircle,
    ClipboardList,
    MessageSquare,
    Target,
    ChevronDown,
    User,
    BadgeCheck,
    Clock,
    X,
    Database
} from 'lucide-react';

import { useDispatch, useSelector } from 'react-redux';
import { setUser } from '../redux/authSlice';
import { toast } from 'sonner';
import axios from 'axios';
import useGetCompany from '../hooks/useGetCompany';

const RecruiterLayout = () => {
    // Persistent Session for Recruiter
    useGetCompany();

    const [isCollapsed, setIsCollapsed] = useState(false);
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]);
    
    const [company, setCompany] = useState(null);
    const [planStats, setPlanStats] = useState(null);
    const location = useLocation();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user, isSupportEnabled } = useSelector(store => store.auth);

    const fetchNotifications = async () => {
        try {
            if (!user) return;
            const res = await axios.get("http://localhost:8000/api/v1/company/notifications", { withCredentials: true });
            if (res.data.success) setNotifications(res.data.notifications);
        } catch (error) { console.error("Error fetching notifications"); }
    };

    const fetchProfile = async () => {
        try {
            const res = await axios.get("http://localhost:8000/api/v1/company/me", { withCredentials: true });
            if (res.data.success) {
                setCompany(res.data.company);
                setPlanStats(res.data.stats);
            }
        } catch (error) { console.error("Profile fetch fail"); }
    };

    useEffect(() => {
        if (user) {
            fetchProfile();
            fetchNotifications();
            const interval = setInterval(fetchNotifications, 60000);
            return () => clearInterval(interval);
        }
    }, [user]);

    const markAsRead = async (id) => {
        try {
            await axios.put(`http://localhost:8000/api/v1/company/notifications/${id}/read`, {}, { withCredentials: true });
            fetchNotifications();
        } catch (error) {
            console.error("Error marking read");
        }
    };

    const logoutHandler = async () => {
        try {
            const res = await axios.post("http://localhost:8000/api/v1/company/logout", {}, { withCredentials: true });
            if (res.data.success) {
                dispatch(setUser(null));
                toast.success("Logged out successfully");
                navigate("/recruiter/login");
            }
        } catch (error) {
            toast.error("Logout failed");
        }
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;
    const hasUnreadMessages = isSupportEnabled && notifications.some(n => n.type === 'NEW_MESSAGE' && !n.isRead);

    const navItems = [
        { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: "/recruiter/dashboard" },
        { name: 'My Jobs', icon: <Briefcase size={20} />, path: "/recruiter/jobs" },
        { name: 'Applications', icon: <ClipboardList size={20} />, path: "/recruiter/applications" },
        { name: 'Talent Pool', icon: <Users size={20} />, path: "/recruiter/talent-pool" },
        ...(isSupportEnabled ? [{ 
            name: 'Messages', 
            icon: <MessageSquare size={20} />, 
            path: "/recruiter/messages",
            badge: hasUnreadMessages
        }] : []),
        { name: 'Settings', icon: <Settings size={20} />, path: "/recruiter/settings" },
        { name: 'Billing', icon: <CreditCard size={20} />, path: "/recruiter/billing" },
    ];

    const activeItem = navItems.find(item => location.pathname.startsWith(item.path)) || navItems[0];

    return (
        <div className="flex h-screen bg-[#F9FAFB] font-sans text-slate-900 overflow-hidden">

            {/* Sidebar */}
            <motion.aside
                initial={false}
                animate={{ width: isCollapsed ? 80 : 260 }}
                className="h-screen bg-white border-r border-slate-200 flex flex-col z-50 relative shadow-sm"
            >
                <div className="h-16 flex items-center px-6 border-b border-slate-100 bg-white">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center shrink-0">
                            <Briefcase className="text-white" size={20} />
                        </div>
                        {!isCollapsed && (
                            <span className="text-lg font-bold text-slate-800 tracking-tight">JobPortal</span>
                        )}
                    </div>
                </div>

                <div className="mt-6 px-4 mb-4">
                    {!isCollapsed ? (
                        <Link to="/recruiter/post-job" className="w-full py-3 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2">
                            <Plus size={16} /> Post a New Job
                        </Link>
                    ) : (
                        <Link to="/recruiter/post-job" className="w-12 h-12 mx-auto bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">
                            <Plus size={20} />
                        </Link>
                    )}
                </div>

                <nav className="flex-1 px-3 space-y-1">
                    {navItems.map((item) => {
                        const isActive = location.pathname.startsWith(item.path);
                        return (
                            <Link
                                key={item.name}
                                to={item.path}
                                className={`flex items-center h-10 px-3 rounded-lg transition-colors relative group ${isActive
                                        ? 'bg-indigo-50 text-indigo-700 font-semibold'
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                    }`}
                            >
                                <div className={`${isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`}>
                                    {item.icon}
                                </div>
                                {!isCollapsed && <span className="ml-3 text-sm">{item.name}</span>}
                                {item.badge && !isCollapsed && (
                                    <motion.div animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1.5, repeat: Infinity }} className="ml-auto w-2 h-2 bg-red-500 rounded-full" />
                                )}
                                {isActive && !isCollapsed && !item.badge && (
                                    <div className="ml-auto w-1.5 h-1.5 bg-indigo-600 rounded-full" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-slate-100">
                    <button onClick={logoutHandler} className="flex items-center w-full h-10 px-3 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all group">
                        <LogOut size={20} />
                        {!isCollapsed && <span className="ml-3 text-sm font-medium">Logout</span>}
                    </button>
                </div>
            </motion.aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

                {/* Header */}
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 z-40 shrink-0">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setIsCollapsed(!isCollapsed)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                            <Menu size={20} />
                        </button>
                        <div className="hidden md:flex items-center gap-2 text-slate-400">
                            <span className="text-sm font-medium text-slate-800 font-bold">{activeItem?.name}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        {/* Widgets Container */}
                        <div className="flex items-center gap-3">
                            {/* 🟢 Database Credits Widget */}
                            {company?.databaseCredits > 0 && (
                                <div 
                                    onClick={() => navigate("/recruiter/buy-credits")}
                                    className="hidden lg:flex items-center gap-3 px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-2xl cursor-pointer hover:bg-emerald-100 transition-all group"
                                >
                                    <div className="w-8 h-8 bg-white rounded-xl shadow-sm flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                                        <Database size={16} fill="currentColor" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-[10px] font-black text-emerald-600/60 uppercase tracking-widest leading-none">Credits</p>
                                        <p className="text-lg font-black text-emerald-700 leading-none mt-1">{company.databaseCredits}</p>
                                    </div>
                                </div>
                            )}

                            {/* 🟢 Plan Status Widget */}
                            {planStats && (company?.planType === 'premium' || company?.planType === 'trial') && new Date(planStats.expiryDate) > new Date() && (
                                <div 
                                    onClick={() => navigate("/recruiter/pricing")}
                                    className="hidden lg:flex items-center gap-3 px-4 py-2 bg-slate-50 border border-slate-100 rounded-2xl cursor-pointer hover:bg-slate-100 transition-all group"
                                >
                                    <div className="w-8 h-8 bg-white rounded-xl shadow-sm flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                                        <Zap size={16} fill="currentColor" />
                                    </div>
                                    <div className="text-left">
                                        <div className="flex items-center gap-2">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{planStats.planName}</p>
                                            <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
                                            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest leading-none">
                                                {planStats.jobsRemaining === -1 ? 'Unlimited' : planStats.jobsRemaining} Jobs
                                            </p>
                                        </div>
                                        <p className="text-[11px] font-bold text-slate-700 mt-1">
                                            Exp: {new Date(planStats.expiryDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Notification Bell */}
                        <div className="relative">
                            <button onClick={() => setShowNotifications(!showNotifications)} className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all relative group">
                                <Bell size={20} className="group-hover:rotate-12 transition-transform" />
                                {unreadCount > 0 && <span className="absolute top-2 right-2 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">{unreadCount}</span>}
                            </button>
                            <AnimatePresence>
                                {showNotifications && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                                        <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden">
                                            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                                <h3 className="font-bold text-slate-800 text-sm">Alerts</h3>
                                                <span className="px-2 py-0.5 bg-indigo-100 text-indigo-600 text-[10px] font-bold rounded-full">{unreadCount} New</span>
                                            </div>
                                            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                                                {notifications.length === 0 ? (
                                                    <div className="p-10 text-center text-slate-400 opacity-50"><Bell size={32} className="mx-auto mb-2" /><p className="text-xs font-bold uppercase tracking-widest">No alerts</p></div>
                                                ) : (
                                                    notifications.map((n) => (
                                                        <div key={n.id} onClick={() => { markAsRead(n.id); if (n.type.includes('JOB')) navigate('/recruiter/jobs'); if (n.type === 'NEW_MESSAGE') navigate('/recruiter/messages'); setShowNotifications(false); }} className={`p-4 border-b border-slate-50 last:border-0 cursor-pointer hover:bg-slate-50 transition-colors flex gap-3 ${!n.isRead ? 'bg-indigo-50/30' : ''}`}>
                                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${!n.isRead ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}><Clock size={14}/></div>
                                                            <div className="min-w-0"><p className={`text-xs font-bold text-slate-800`}>{n.title}</p><p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{n.message}</p></div>
                                                            {!n.isRead && <div className="w-2 h-2 bg-indigo-600 rounded-full mt-1.5 shrink-0" />}
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Profile Dropdown */}
                        <div className="relative border-l border-slate-200 pl-6">
                            <button onClick={() => setShowProfileDropdown(!showProfileDropdown)} className="flex items-center gap-3 group">
                                <div className="text-right hidden sm:block">
                                   <p className="text-sm font-bold text-slate-800 leading-none group-hover:text-indigo-600 transition-colors">{company?.companyName}</p>
                                   <p className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${company?.isApproved ? 'text-emerald-500' : 'text-slate-400'}`}>{company?.isApproved ? 'Verified Partner' : 'Verification Pending'}</p>
                                </div>
                                <div className="w-10 h-10 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center overflow-hidden shadow-sm group-hover:border-indigo-300 transition-all">
                                    {company?.logo ? <img src={company.logo} className="w-full h-full object-cover" /> : <UserCircle className="text-indigo-400" size={24} />}
                                </div>
                                <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${showProfileDropdown ? 'rotate-180' : ''}`} />
                            </button>
                            <AnimatePresence>
                                {showProfileDropdown && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setShowProfileDropdown(false)} />
                                        <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 py-2 overflow-hidden">
                                            <Link to="/recruiter/profile" onClick={() => setShowProfileDropdown(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-colors"><User size={16} /> My Profile</Link>
                                            <Link to="/recruiter/settings" onClick={() => setShowProfileDropdown(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-colors border-b border-slate-50"><Settings size={16} /> Settings</Link>
                                            <button onClick={logoutHandler} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 transition-colors text-left"><LogOut size={16} /> Logout</button>
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
                    <div className="max-w-[1400px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default RecruiterLayout;

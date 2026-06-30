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
    Building2,
    Plus,
    Zap,
    UserCircle,
    ChevronRight,
    Sparkles,
    ChevronDown,
    FileText,
    Hash,
    Clock,
    MessageSquare
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { setUser } from '../redux/authSlice';
import { toast } from 'sonner';
import axios from 'axios';

const AdminLayout = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [expandedMenu, setExpandedMenu] = useState(null); 
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const location = useLocation();
    const { user, isSupportEnabled } = useSelector(store => store.auth);

    const fetchNotifications = async () => {
        try {
            const res = await axios.get("http://localhost:8000/api/v1/admin/notifications", { withCredentials: true });
            if (res.data.success) {
                setNotifications(res.data.notifications);
            }
        } catch (error) {
            console.error("Error fetching notifications");
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 60000); // Check every minute
        return () => clearInterval(interval);
    }, []);

    const markAsRead = async (id) => {
        try {
            await axios.put(`http://localhost:8000/api/v1/admin/notifications/${id}/read`, {}, { withCredentials: true });
            fetchNotifications();
        } catch (error) {
            console.error("Error marking as read");
        }
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;
    const hasUnreadMessages = notifications.some(n => n.type === 'NEW_MESSAGE' && !n.isRead);

    const logoutHandler = async () => {
        try {
            const res = await axios.get("http://localhost:8000/api/v1/admin/logout", { withCredentials: true });
            if (res.data.success) {
                dispatch(setUser(null));
                toast.success("Logged out successfully");
                navigate("/admin/login");
            }
        } catch (error) {
            toast.error("Logout failed");
        }
    };

    const navItems = [
        { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: "/admin/dashboard" },
        { name: 'Jobs', icon: <Briefcase size={20} />, path: "/admin/jobs" },
        { name: 'Applications', icon: <FileText size={20} />, path: "/admin/applications" },
        { name: 'Candidates', icon: <Users size={20} />, path: "/admin/users" },
        { name: 'Companies', icon: <Building2 size={20} />, path: "/admin/companies" },
        { name: 'Packages', icon: <Zap size={20} />, path: "/admin/packages" },
        // 🟢 Conditional Messaging
        ...(isSupportEnabled ? [{ 
            name: 'Messages', 
            icon: <MessageSquare size={20} />, 
            path: "/admin/messages",
            badge: hasUnreadMessages
        }] : []),
        { 
            name: 'Suggestions', 
            icon: <Sparkles size={20} />, 
            children: [
                { name: 'Industries', path: "/admin/suggestions/industry", icon: <Building2 size={14} /> },
                { name: 'Designations', path: "/admin/suggestions/designation", icon: <Briefcase size={14} /> },
                { name: 'Job Titles', path: "/admin/suggestions/jobtitle", icon: <FileText size={14} /> },
                { name: 'Skills', path: "/admin/suggestions/skill", icon: <Hash size={14} /> },
            ]
        },
        { name: 'Settings', icon: <Settings size={20} />, path: "/admin/settings" },
    ];

    const activeItem = navItems.find(item => 
        item.path === location.pathname || 
        (item.children && item.children.some(child => child.path === location.pathname))
    ) || navItems[0];

    const toggleMenu = (name) => {
        if (isCollapsed) setIsCollapsed(false);
        setExpandedMenu(expandedMenu === name ? null : name);
    };

    return (
        <div className="flex h-screen bg-[#F9FAFB] font-sans text-slate-900 overflow-hidden">

            {/* Standard Professional Sidebar */}
            <motion.aside
                initial={false}
                animate={{ width: isCollapsed ? 80 : 260 }}
                className="h-screen bg-white border-r border-slate-200 flex flex-col z-50 relative shadow-sm"
            >
                {/* Logo Area */}
                <div className="h-16 flex items-center px-6 border-b border-slate-100 bg-white">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
                            <Briefcase className="text-white" size={20} />
                        </div>
                        {!isCollapsed && (
                            <span className="text-lg font-bold text-slate-800 tracking-tight">JobPortal</span>
                        )}
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
                    {navItems.map((item) => {
                        const hasChildren = !!item.children;
                        const isActive = location.pathname === item.path || (hasChildren && item.children.some(c => c.path === location.pathname));
                        const isExpanded = expandedMenu === item.name || (isActive && expandedMenu === null);

                        return (
                            <div key={item.name} className="space-y-1">
                                {hasChildren ? (
                                    <>
                                        <button
                                            onClick={() => toggleMenu(item.name)}
                                            className={`flex items-center w-full h-10 px-3 rounded-lg transition-colors group ${isActive && !isExpanded
                                                ? 'bg-blue-50 text-blue-700 font-semibold'
                                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                                }`}
                                        >
                                            <div className={`${isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`}>
                                                {item.icon}
                                            </div>
                                            {!isCollapsed && (
                                                <>
                                                    <span className="ml-3 text-sm">{item.name}</span>
                                                    <ChevronDown size={14} className={`ml-auto transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                                                </>
                                            )}
                                        </button>
                                        
                                        <AnimatePresence>
                                            {isExpanded && !isCollapsed && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="overflow-hidden pl-10 pr-2 space-y-1"
                                                >
                                                    {item.children.map((child) => (
                                                        <Link
                                                            key={child.name}
                                                            to={child.path}
                                                            className={`flex items-center h-9 px-3 rounded-md text-xs transition-colors ${location.pathname === child.path
                                                                ? 'text-blue-600 bg-blue-50/50 font-bold'
                                                                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                                                                }`}
                                                        >
                                                            <span className="mr-2 opacity-50">{child.icon}</span>
                                                            {child.name}
                                                        </Link>
                                                    ))}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </>
                                ) : (
                                    <Link
                                        to={item.path}
                                        className={`flex items-center h-10 px-3 rounded-lg transition-colors relative group ${isActive
                                            ? 'bg-blue-50 text-blue-700 font-semibold'
                                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                            }`}
                                    >
                                        <div className={`${isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`}>
                                            {item.icon}
                                        </div>

                                        {!isCollapsed && (
                                            <span className="ml-3 text-sm">{item.name}</span>
                                        )}

                                        {item.badge && !isCollapsed && (
                                            <motion.div 
                                                animate={{ opacity: [1, 0.4, 1] }} 
                                                transition={{ duration: 1.5, repeat: Infinity }}
                                                className="ml-auto w-2 h-2 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.6)]" 
                                            />
                                        )}

                                        {isActive && !isCollapsed && !item.badge && (
                                            <ChevronRight size={14} className="ml-auto opacity-50" />
                                        )}
                                    </Link>
                                )}
                            </div>
                        );
                    })}
                </nav>

                {/* Logout Button */}
                <div className="p-4 border-t border-slate-100">
                    <button
                        onClick={logoutHandler}
                        className="flex items-center gap-3 w-full h-10 px-3 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all group"
                    >
                        <LogOut size={20} />
                        {!isCollapsed && <span className="text-sm font-medium">Logout</span>}
                    </button>
                </div>
            </motion.aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

                {/* Header */}
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 z-40 shrink-0 sticky top-0">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            <Menu size={20} />
                        </button>
                        <div className="hidden md:flex items-center gap-2 text-slate-400">
                            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Admin</span>
                            <ChevronRight size={12} />
                            <span className="text-sm font-bold text-slate-800 tracking-tight">{activeItem?.name}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        {/* Notification Bell */}
                        <div className="relative">
                            <button 
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all relative group"
                            >
                                <Bell size={20} className="group-hover:rotate-12 transition-transform" />
                                {unreadCount > 0 && (
                                    <span className="absolute top-2 right-2 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
                                        {unreadCount}
                                    </span>
                                )}
                            </button>

                            {/* Notifications Dropdown */}
                            <AnimatePresence>
                                {showNotifications && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden"
                                        >
                                            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                                <h3 className="font-bold text-slate-800 text-sm">Activity Hub</h3>
                                                <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-[10px] font-bold rounded-full uppercase tracking-tighter">{unreadCount} New</span>
                                            </div>
                                            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                                                {notifications.length === 0 ? (
                                                    <div className="p-10 text-center text-slate-400">
                                                        <Bell size={32} className="mx-auto mb-2 opacity-20" />
                                                        <p className="text-xs font-medium">No alerts found</p>
                                                    </div>
                                                ) : (
                                                    notifications.map((n) => (
                                                        <div 
                                                            key={n.id} 
                                                            onClick={() => {
                                                                markAsRead(n.id);
                                                                if (n.type === 'JOB_POSTED') navigate('/admin/jobs');
                                                                if (n.type === 'NEW_MESSAGE') navigate('/admin/messages');
                                                                setShowNotifications(false);
                                                            }}
                                                            className={`p-4 border-b border-slate-50 last:border-0 cursor-pointer hover:bg-slate-50 transition-colors flex gap-3 ${!n.isRead ? 'bg-blue-50/30' : ''}`}
                                                        >
                                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${!n.isRead ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                                                                {n.type === 'JOB_POSTED' ? <Briefcase size={14}/> : <Bell size={14}/>}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className={`text-xs font-bold text-slate-800 ${!n.isRead ? 'pr-2' : ''}`}>{n.title}</p>
                                                                <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">{n.message}</p>
                                                                <div className="flex items-center gap-1.5 mt-1 text-slate-400">
                                                                    <Clock size={10}/>
                                                                    <p className="text-[9px] font-medium">{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                                                </div>
                                                            </div>
                                                            {!n.isRead && <div className="w-2 h-2 bg-blue-600 rounded-full mt-1.5 shrink-0" />}
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                            <div className="p-3 bg-slate-50 text-center border-t border-slate-100">
                                                <button 
                                                    onClick={() => {
                                                        navigate('/admin/notifications');
                                                        setShowNotifications(false);
                                                    }}
                                                    className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest hover:underline"
                                                >
                                                    View All Notifications
                                                </button>
                                            </div>
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Admin Profile */}
                        <div className="flex items-center gap-3 border-l border-slate-200 pl-6">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-bold text-slate-800 leading-none">{user?.fullName || "Admin"}</p>
                                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-1.5">System Admin</p>
                            </div>
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-blue-100">
                                {user?.fullName?.charAt(0) || "A"}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <main className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
                    <div className="max-w-full mx-auto">
                        <Outlet />
                    </div>
                </main>

            </div>
        </div>
    );
};

export default AdminLayout;

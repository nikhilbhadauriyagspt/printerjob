import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Menu, X, ChevronRight, ChevronDown, UserCircle, BriefcaseBusiness, 
  Globe, LogOut, LayoutDashboard, User, Settings, Bell, Clock, Briefcase, Trash2,
  FileText, Sparkles, Layers, Search, ArrowRight, TrendingUp, IndianRupee
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useSelector, useDispatch } from 'react-redux';
import { setUser } from '../../redux/authSlice';
import axios from 'axios';
import { CANDIDATE_API_END_POINT } from '../../utils/constant';

const CandidateHeader = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [activeDropdown, setActiveDropdown] = useState(null); 
  const [navSearch, setNavSearch] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestionsDropdown, setShowSuggestionsDropdown] = useState(false);
  
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector(store => store.auth);

  const trendingSearches = ["Frontend Developer", "Backend Developer", "React Developer", "Full Stack Developer"];

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await axios.get(`${CANDIDATE_API_END_POINT}/notifications`, { withCredentials: true });
      if (res.data.success) {
        setNotifications(res.data.notifications);
      }
    } catch (e) { console.log("Notif fetch failed"); }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [user]);

  // Debounced search suggestion API call
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (navSearch.trim().length >= 1) {
        try {
          const res = await axios.get(`http://localhost:8000/api/v1/admin/suggestions?type=jobtitle&query=${encodeURIComponent(navSearch.trim())}`);
          if (res.data.success) {
            setSearchSuggestions(res.data.suggestions);
          }
        } catch (e) {
          console.error("Suggestions fetch error:", e);
        }
      } else {
        setSearchSuggestions([]);
      }
    }, 200);

    return () => clearTimeout(delayDebounceFn);
  }, [navSearch]);

  const markAsRead = async (id) => {
    try {
      await axios.put(`${CANDIDATE_API_END_POINT}/notifications/${id}/read`, {}, { withCredentials: true });
      fetchNotifications();
    } catch (e) { console.log("Mark read failed"); }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await axios.get(`${CANDIDATE_API_END_POINT}/logout`, { withCredentials: true });
    } catch (e) {
      console.error("Logout API call failed:", e);
    } finally {
      dispatch(setUser(null));
      toast.success("Logged out successfully");
      navigate("/login");
    }
  };

  const handleNavSearch = (e) => {
    if (e.key === 'Enter' && navSearch.trim()) {
      navigate(`/jobs?keyword=${encodeURIComponent(navSearch.trim())}`);
      setNavSearch('');
      setShowSuggestionsDropdown(false);
    }
  };

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
      isScrolled ? 'bg-white/90 backdrop-blur-xl border-b border-slate-100 py-3 shadow-sm' : 'bg-transparent py-6'
    }`}>
      <div className="container mx-auto px-8 flex items-center justify-between">
        <div className="flex items-center space-x-6 shrink-0">
          <Link to="/" className="flex items-center space-x-2 group shrink-0">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-indigo-100 shadow-lg group-hover:rotate-6 transition-transform duration-300">
              <span className="text-white font-bold text-lg">J</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900 hidden sm:inline-block">
              Job<span className="text-indigo-600">Portal</span>
            </span>
          </Link>

          {/* Search bar inside navbar with Dynamic Suggestions */}
          <div className="relative hidden md:block">
            <div className="flex items-center bg-slate-50 border border-slate-200/50 rounded-full px-3.5 py-1.5 w-44 lg:w-60 focus-within:bg-white focus-within:border-indigo-300 focus-within:ring-2 focus-within:ring-indigo-50 transition-all duration-200">
              <Search size={14} className="text-slate-400 mr-2 shrink-0" />
              <input 
                type="text" 
                placeholder="Search jobs..." 
                value={navSearch}
                onChange={(e) => setNavSearch(e.target.value)}
                onFocus={() => setShowSuggestionsDropdown(true)}
                onBlur={() => setTimeout(() => setShowSuggestionsDropdown(false), 200)}
                onKeyDown={handleNavSearch}
                className="bg-transparent text-[11px] text-slate-700 outline-none w-full placeholder:text-slate-400 font-semibold"
              />
            </div>

            {/* Suggestions Overlay */}
            <AnimatePresence>
              {showSuggestionsDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="absolute left-0 mt-2 w-56 lg:w-64 bg-white border border-slate-200/60 rounded-2xl shadow-xl p-2 z-50 flex flex-col space-y-0.5 overflow-hidden"
                >
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-3 py-1.5 border-b border-slate-50 mb-1">
                    {navSearch.trim() ? "Suggestions" : "Trending Searches"}
                  </p>
                  
                  {(navSearch.trim() ? searchSuggestions : trendingSearches).map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setNavSearch(item);
                        navigate(`/jobs?keyword=${encodeURIComponent(item)}`);
                        setNavSearch('');
                        setShowSuggestionsDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2 text-[11px] font-bold text-slate-700 hover:bg-slate-50 hover:text-indigo-600 rounded-xl transition-all flex items-center space-x-2 cursor-pointer bg-white"
                    >
                      <Search size={10} className="text-slate-400 opacity-60" />
                      <span className="truncate">{item}</span>
                    </button>
                  ))}
                  
                  {navSearch.trim() && searchSuggestions.length === 0 && (
                    <p className="text-[10px] text-slate-400 font-medium px-3 py-3 text-center">No suggestions found.</p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="hidden lg:flex items-center space-x-8">
          <div 
            className="relative"
            onMouseEnter={() => setActiveDropdown('jobs')}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <button className="text-[13px] text-slate-600 hover:text-indigo-600 font-bold transition-colors flex items-center space-x-1.5 py-2 cursor-pointer outline-none">
              <Briefcase size={15} className="opacity-80" />
              <span>Find Jobs</span>
              <ChevronDown size={12} className={`opacity-85 transition-transform duration-300 ${activeDropdown === 'jobs' ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {activeDropdown === 'jobs' && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.96 }}
                  transition={{ duration: 0.2 }}
                  className="absolute left-[-40px] mt-1.5 w-[440px] bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.12)] border border-slate-100/60 p-6 z-50 grid grid-cols-2 gap-6"
                >
                  <div>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Job Types</h4>
                    <div className="flex flex-col space-y-1">
                      <Link to="/jobs?jobType=Remote" className="p-2 hover:bg-slate-50 rounded-xl transition-all flex flex-col group">
                        <span className="text-[12px] font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">Work From Home</span>
                        <span className="text-[10px] text-slate-400">Apply to remote roles</span>
                      </Link>
                      <Link to="/jobs?jobType=Part-time" className="p-2 hover:bg-slate-50 rounded-xl transition-all flex flex-col group">
                        <span className="text-[12px] font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">Part Time Jobs</span>
                        <span className="text-[10px] text-slate-400">Flexible hours, high impact</span>
                      </Link>
                      <Link to="/jobs?jobType=Full-time" className="p-2 hover:bg-slate-50 rounded-xl transition-all flex flex-col group">
                        <span className="text-[12px] font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">Full Time Jobs</span>
                        <span className="text-[10px] text-slate-400">Permanent career path</span>
                      </Link>
                      <Link to="/jobs?jobType=Internship" className="p-2 hover:bg-slate-50 rounded-xl transition-all flex flex-col group">
                        <span className="text-[12px] font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">Internships</span>
                        <span className="text-[10px] text-slate-400">Earn experience & stipends</span>
                      </Link>
                    </div>
                  </div>

                  <div className="border-l border-slate-100 pl-6 flex flex-col justify-between">
                    <div>
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Explore Categories</h4>
                      <div className="flex flex-col space-y-2">
                        <Link to="/companies" className="p-1 hover:text-indigo-600 transition-all flex items-center space-x-2 text-slate-600">
                          <Globe size={13} className="opacity-80" />
                          <span className="text-[12px] font-bold">Jobs By Company</span>
                        </Link>
                        <Link to="/jobs" className="p-1 hover:text-indigo-600 transition-all flex items-center space-x-2 text-slate-600">
                          <BriefcaseBusiness size={13} className="opacity-80" />
                          <span className="text-[12px] font-bold">All Jobs List</span>
                        </Link>
                        <Link to="/salaries" className="p-1 hover:text-indigo-600 transition-all flex items-center space-x-2 text-slate-600">
                          <TrendingUp size={13} className="opacity-80" />
                          <span className="text-[12px] font-bold">Salary Estimates</span>
                        </Link>
                      </div>
                    </div>
                    
                    <div className="mt-4 p-3 bg-indigo-50/40 rounded-2xl flex items-center justify-between">
                      <div className="min-w-0">
                        <p className="text-[10px] font-black text-indigo-700">Smart Match</p>
                        <p className="text-[9px] text-slate-500 truncate">Match jobs with your profile</p>
                      </div>
                      <Link to="/profile" className="p-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all shrink-0">
                        <ArrowRight size={10} />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Link to="/companies" className="text-[13px] text-slate-600 hover:text-indigo-600 font-bold transition-colors flex items-center space-x-1.5">
            <Globe size={15} className="opacity-80" />
            <span>Companies</span>
          </Link>

          <Link to="/salaries" className="text-[13px] text-slate-600 hover:text-indigo-600 font-bold transition-colors flex items-center space-x-1.5">
            <IndianRupee size={15} className="opacity-80" />
            <span>Salaries</span>
          </Link>

          <div 
            className="relative"
            onMouseEnter={() => setActiveDropdown('resume')}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <button className="text-[13px] text-slate-600 hover:text-indigo-600 font-bold transition-colors flex items-center space-x-1.5 py-2 cursor-pointer outline-none">
              <FileText size={15} className="opacity-80" />
              <span>Resume Tools</span>
              <ChevronDown size={12} className={`opacity-85 transition-transform duration-300 ${activeDropdown === 'resume' ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {activeDropdown === 'resume' && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.96 }}
                  transition={{ duration: 0.2 }}
                  className="absolute left-[-80px] mt-1.5 w-[360px] bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.12)] border border-slate-100/60 p-5 z-50 flex flex-col space-y-2.5"
                >
                  <div className="pb-2 border-b border-slate-50 flex items-center justify-between">
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[8px] font-black rounded uppercase tracking-wider">AI Powered</span>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Resume Hub</span>
                  </div>
                  
                  <Link to="/setup-profile" className="flex items-start space-x-3.5 p-2 hover:bg-slate-50 rounded-2xl transition-all group">
                    <div className="w-9 h-9 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-all">
                      <Sparkles size={16} />
                    </div>
                    <div>
                      <p className="text-[12px] font-bold text-slate-800">AI Resume Parser</p>
                      <p className="text-[10px] text-slate-400 font-medium">Instantly parse your resume to fill profile</p>
                    </div>
                  </Link>

                  <Link to="/profile" className="flex items-start space-x-3.5 p-2 hover:bg-slate-50 rounded-2xl transition-all group">
                    <div className="w-9 h-9 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-all">
                      <Layers size={16} />
                    </div>
                    <div>
                      <p className="text-[12px] font-bold text-slate-800">Resume Checker</p>
                      <p className="text-[10px] text-slate-400 font-medium">Analyze completeness of profile & resume</p>
                    </div>
                  </Link>

                  <Link to="/career-guide" className="flex items-start space-x-3.5 p-2 hover:bg-slate-50 rounded-2xl transition-all group">
                    <div className="w-9 h-9 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-all">
                      <Briefcase size={16} />
                    </div>
                    <div>
                      <p className="text-[12px] font-bold text-slate-800">Career compass guide</p>
                      <p className="text-[10px] text-slate-400 font-medium">Watch instructions to improve resume score</p>
                    </div>
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex items-center space-x-4 lg:space-x-6">
          {!user && (
            <Link 
              to="/recruiter/login" 
              className="hidden md:inline-block text-[13px] font-bold text-slate-500 hover:text-emerald-600 transition-colors"
            >
              Employer Login
            </Link>
          )}

          {!user ? (
            <>
              <Link 
                to="/login"
                className="flex items-center space-x-1.5 text-[13px] text-slate-600 font-bold hover:text-indigo-600 transition-all"
              >
                <UserCircle size={18} className="text-slate-400" />
                <span className="hidden sm:inline">Candidate Login</span>
              </Link>
              <div className="h-4 w-[1px] bg-slate-200 hidden sm:block"></div>
              <Link 
                to="/register"
                className="px-5 py-2.5 bg-slate-900 text-white text-[12px] font-bold rounded-full hover:bg-indigo-600 transition-all shadow-sm active:scale-95 whitespace-nowrap"
              >
                Register
              </Link>
            </>
          ) : (
            <div className="flex items-center space-x-4">
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 text-slate-400 hover:text-indigo-600 transition-all relative"
                >
                  <Bell size={22} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[9px] font-black flex items-center justify-center rounded-full border-2 border-white">
                      {unreadCount}
                    </span>
                  )}
                </button>

                <AnimatePresence>
                  {showNotifications && (
                    <>
                      <div className="fixed inset-0 z-0" onClick={() => setShowNotifications(false)}></div>
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-[-80px] sm:right-0 mt-4 w-80 bg-white rounded-[2rem] shadow-2xl border border-slate-50 overflow-hidden z-20"
                      >
                        <div className="p-5 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                          <h3 className="font-bold text-slate-800 text-xs uppercase tracking-widest">Job Matches</h3>
                          <span className="px-2 py-0.5 bg-indigo-100 text-indigo-600 text-[9px] font-bold rounded-full">{unreadCount} NEW</span>
                        </div>
                        <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
                          {notifications.length === 0 ? (
                            <div className="p-10 text-center text-slate-400">
                              <Bell size={32} className="mx-auto mb-2 opacity-20" />
                              <p className="text-[10px] font-bold uppercase tracking-wider">Stay tuned for matches!</p>
                            </div>
                          ) : (
                            notifications.map((n) => (
                              <div 
                                key={n.id} 
                                onClick={() => {
                                  markAsRead(n.id);
                                  if (n.relatedId) navigate(`/job/description/${n.relatedId}`);
                                  setShowNotifications(false);
                                }}
                                className={`p-4 border-b border-slate-50 last:border-0 cursor-pointer hover:bg-indigo-50/30 transition-all flex gap-3 ${!n.isRead ? 'bg-indigo-50/10' : ''}`}
                              >
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${!n.isRead ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                                  <Briefcase size={18}/>
                                </div>
                                <div className="min-w-0">
                                  <p className={`text-xs font-bold text-slate-800 ${!n.isRead ? 'pr-2' : ''}`}>{n.title}</p>
                                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 font-medium">{n.message}</p>
                                  <div className="flex items-center gap-1.5 mt-2 text-slate-400">
                                    <Clock size={10}/>
                                    <p className="text-[9px] font-bold uppercase">{new Date(n.createdAt).toLocaleDateString()}</p>
                                  </div>
                                </div>
                                {!n.isRead && <div className="w-2 h-2 bg-indigo-600 rounded-full mt-2 shrink-0" />}
                              </div>
                            ))
                          )}
                        </div>
                        <div className="p-3 bg-slate-50 text-center border-t border-slate-50">
                           <button className="text-[9px] font-bold text-indigo-600 uppercase tracking-widest hover:underline">Clear All</button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              <div className="relative">
                <button 
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-3 p-1 pr-3 bg-slate-50 hover:bg-slate-100 rounded-full transition-all border border-slate-100"
                >
                  <div className="w-8 h-8 rounded-full bg-indigo-600 overflow-hidden flex items-center justify-center text-white font-bold text-xs shadow-inner">
                    {user.profilePhoto ? (
                      <img src={user.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <span>{user.fullName?.split(" ").map(n => n[0]).join("").toUpperCase()}</span>
                    )}
                  </div>
                  <span className="text-[13px] font-bold text-slate-700 hidden sm:inline-block">{user.fullName || "My Account"}</span>
                </button>

                <AnimatePresence>
                  {isProfileOpen && (
                    <>
                      <div className="fixed inset-0 z-0" onClick={() => setIsProfileOpen(false)}></div>
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-3 w-56 bg-white rounded-[2rem] shadow-2xl shadow-slate-200 border border-slate-50 py-2 overflow-hidden z-10"
                      >
                        <Link to="/dashboard" className="flex items-center space-x-3 px-5 py-3 text-slate-600 hover:bg-slate-50 transition-colors">
                          <LayoutDashboard size={18} />
                          <span className="text-sm font-semibold">Dashboard</span>
                        </Link>
                        <Link to="/profile" className="flex items-center space-x-3 px-5 py-3 text-slate-600 hover:bg-slate-50 transition-colors">
                          <User size={18} />
                          <span className="text-sm font-semibold">My Profile</span>
                        </Link>
                        <Link to="/settings" className="flex items-center space-x-3 px-5 py-3 text-slate-600 hover:bg-slate-50 transition-colors border-b border-slate-50">
                          <Settings size={18} />
                          <span className="text-sm font-semibold">Settings</span>
                        </Link>
                        <button 
                          onClick={handleLogout}
                          className="w-full flex items-center space-x-3 px-5 py-4 text-rose-500 hover:bg-rose-50 transition-colors text-left"
                        >
                          <LogOut size={18} />
                          <span className="text-sm font-bold">Sign Out</span>
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}

          <button 
            className="lg:hidden p-2 text-slate-800"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="absolute top-full left-0 w-full bg-white border-t border-slate-50 overflow-hidden lg:hidden shadow-2xl"
          >
            <div className="p-8 flex flex-col space-y-6">
              {[
                { name: 'Find Jobs', link: '/jobs' },
                { name: 'Companies', link: '/companies' },
                { name: 'Salaries', link: '/salaries' },
                { name: 'AI Resume Parser', link: '/setup-profile' }
              ].map((item) => (
                <Link key={item.name} to={item.link} className="text-lg font-semibold text-slate-800 flex items-center justify-between group">
                  {item.name}
                  <ChevronRight size={18} className="text-slate-300" />
                </Link>
              ))}
              <div className="pt-6 border-t border-slate-100 flex flex-col space-y-4">
                {!user ? (
                  <>
                    <Link to="/recruiter/login" className="py-4 bg-emerald-50 text-emerald-600 font-bold rounded-2xl text-center">Employer Login</Link>
                    <Link to="/login" className="py-4 bg-slate-50 text-slate-900 font-bold rounded-2xl text-center">Candidate Login</Link>
                    <Link to="/register" className="py-4 bg-indigo-600 text-white font-bold rounded-2xl text-center">Register</Link>
                  </>
                ) : (
                  <button onClick={handleLogout} className="py-4 bg-red-50 text-red-500 font-bold rounded-2xl">Sign Out</button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default CandidateHeader;

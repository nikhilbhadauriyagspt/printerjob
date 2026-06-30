import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Briefcase, Eye, UserCheck, Bookmark, TrendingUp, 
  MapPin, DollarSign, Clock, ChevronRight, AlertCircle,
  Search, Star, Bell, Newspaper, Zap, CheckCircle2,
  Users, Award, Calendar, MoreHorizontal, ArrowUpRight,
  XCircle, Building2, Video, Trash2, Send, MessageSquare,
  ShieldCheck, Sparkles
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import CandidateHeader from './CandidateHeader';
import axios from 'axios';
import { APPLICATION_API_END_POINT, CANDIDATE_API_END_POINT } from '../../utils/constant';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

// MCQ Questions database for Skills Verification
const quizQuestions = {
  'React': [
    { q: "Which hook is used to handle side-effects in React components?", a: ["useState", "useEffect", "useContext", "useReducer"], correct: "useEffect" },
    { q: "What is the Virtual DOM in React?", a: ["A direct copy of the browser DOM", "An in-memory representation of the real DOM", "A browser extension for developers", "A node package for DOM rendering"], correct: "An in-memory representation of the real DOM" },
    { q: "What prop is required when rendering lists in React?", a: ["id", "key", "index", "ref"], correct: "key" }
  ],
  'Node.js': [
    { q: "Which engine powers Node.js?", a: ["SpiderMonkey", "Chakra", "V8", "Gecko"], correct: "V8" },
    { q: "Which core module is used to handle asynchronous file operations in Node?", a: ["fs", "path", "http", "os"], correct: "fs" },
    { q: "What library handles asynchronous I/O and event loop inside Node.js?", a: ["libuv", "npm", "v8", "http-parser"], correct: "libuv" }
  ],
  'JavaScript': [
    { q: "Which of the following is correct about Javascript runtime execution?", a: ["It is statically typed", "It is client-side only", "It is single-threaded", "It does not support closures"], correct: "It is single-threaded" },
    { q: "How do you instantiate a Promise in modern JS?", a: ["new Promise()", "Promise.create()", "make Promise()", "Promise.new()"], correct: "new Promise()" },
    { q: "What is the output of typeof null in JavaScript?", a: ["null", "undefined", "object", "string"], correct: "object" }
  ]
};

const CandidateDashboard = () => {
  const { user } = useSelector(store => store.auth);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Added Operational States
  const [savedJobs, setSavedJobs] = useState([]);
  const [verifiedSkills, setVerifiedSkills] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [activeThread, setActiveThread] = useState('assistant');
  const [typing, setTyping] = useState(false);
  const [chatThreads, setChatThreads] = useState({
    assistant: [
      { sender: 'bot', text: 'Hi! I am your JobPortal AI Career Assistant. I can help analyze your profile, suggest match keywords, and help you prepare for interviews. Ask me anything!' }
    ],
    support: [
      { sender: 'bot', text: 'Hello! Welcome to JobPortal System Support. Let me know if you face any issues with OTP login, resume parsing, or profile setup.' }
    ]
  });

  // Quiz Modal States
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState('');
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);

  const fetchDashboardData = async () => {
    try {
        setLoading(true);
        const [appRes, intRes, statsRes] = await Promise.all([
            axios.get(`${APPLICATION_API_END_POINT}/applied`, { withCredentials: true }),
            axios.get(`${APPLICATION_API_END_POINT}/candidate-interviews`, { withCredentials: true }),
            axios.get(`${CANDIDATE_API_END_POINT}/dashboard-stats`, { withCredentials: true })
        ]);
        
        if (appRes.data.success) setAppliedJobs(appRes.data.applications);
        if (intRes.data.success) setInterviews(intRes.data.interviews);
        if (statsRes.data.success) setStatsData(statsRes.data.stats);
    } catch (error) {
        console.error("Error fetching dashboard data:", error);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Load Saved jobs and verified skills from localStorage
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('savedJobs') || '[]');
    setSavedJobs(saved);

    if (user?.id) {
      const verified = JSON.parse(localStorage.getItem(`verifiedSkills_${user.id}`) || '[]');
      setVerifiedSkills(verified);
    }
  }, [user]);

  // Sync saved list on tab switches
  useEffect(() => {
    if (activeTab === 'saved') {
      const saved = JSON.parse(localStorage.getItem('savedJobs') || '[]');
      setSavedJobs(saved);
    }
  }, [activeTab]);

  const getStatusStep = (status) => {
    switch(status) {
        case 'applied': return 1;
        case 'reviewing': return 2;
        case 'shortlisted': return 3;
        case 'hired': return 5;
        case 'rejected': return 1;
        default: return 1;
    }
  };

  const formatSalary = (min, max, currency = 'INR') => {
    if (!min && !max) return 'Salary Negotiable';
    const symbol = currency === 'USD' ? '$' : '₹';
    if (min && max) {
      return `${symbol}${parseInt(min).toLocaleString('en-IN')} - ${symbol}${parseInt(max).toLocaleString('en-IN')}`;
    }
    return min ? `${symbol}${parseInt(min).toLocaleString('en-IN')}` : `${symbol}${parseInt(max).toLocaleString('en-IN')}`;
  };

  const timelineSteps = ['Applied', 'Viewed', 'Shortlisted', 'Interview', 'Hired'];

  const stats = [
    { 
        label: 'Search Appearances', 
        value: statsData?.searchAppearances?.toString() || '0', 
        sub: 'Recent searches', 
        icon: Search, 
        color: 'text-blue-600', 
        bg: 'bg-blue-50' 
    },
    { 
        label: 'Recruiter Views', 
        value: statsData?.recruiterViews?.toString() || '0', 
        sub: 'Total profile views', 
        icon: Eye, 
        color: 'text-indigo-600', 
        bg: 'bg-indigo-50' 
    },
    { 
        label: 'Applied Jobs', 
        value: appliedJobs.length.toString(), 
        sub: `${appliedJobs.filter(a => a.status === 'applied').length} under review`, 
        icon: Briefcase, 
        color: 'text-amber-600', 
        bg: 'bg-amber-50' 
    },
  ];

  // Chat message flow utility
  const sendMessageFlow = (userText) => {
    setChatThreads(prev => ({
      ...prev,
      [activeThread]: [...prev[activeThread], { sender: 'user', text: userText }]
    }));

    setTyping(true);

    setTimeout(() => {
      let botResponse = '';
      const text = userText.toLowerCase();

      if (activeThread === 'assistant') {
        if (text.includes('job') || text.includes('apply') || text.includes('opening') || text.includes('matching')) {
          botResponse = "I analyzed our active listings! Webnexa Technologies has a 'Frontend Engineer' role in Noida. You should apply—it matches your tech stack!";
        } else if (text.includes('resume') || text.includes('ats') || text.includes('score')) {
          botResponse = `Your ATS resume score is currently ${statsData?.resumeScore || 78}/100. Adding projects will increase your match index to top recruiters!`;
        } else if (text.includes('skill') || text.includes('test') || text.includes('verify')) {
          botResponse = "You can verify your skills by clicking 'Take Test' on your dashboard. Passing the quiz adds a green verified badge to your profile!";
        } else if (text.includes('salary') || text.includes('package')) {
          botResponse = "Most tech roles on our portal offer packages between ₹6L - ₹15L LPA depending on experience. Check out the Salaries page for listings!";
        } else {
          botResponse = "That is a great career query! Make sure your profile completion strength is above 80% to maximize your visibility to recruiters.";
        }
      } else {
        if (text.includes('otp') || text.includes('login') || text.includes('sign in') || text.includes('delayed')) {
          botResponse = "OTP verification utilizes secure phone authentication. If you experience delay in SMS codes, please use our backup login form.";
        } else if (text.includes('parse') || text.includes('pdf') || text.includes('resume') || text.includes('parsing')) {
          botResponse = "Make sure your resume is in a clean text-based PDF format. Scanned image PDFs might fail to parse skills correctly.";
        } else if (text.includes('contact') || text.includes('help')) {
          botResponse = "You can reach our corporate support desk directly at support@jobportal.com or call our hotline: +91 1800-PORTAL.";
        } else {
          botResponse = "I have logged your support request under ticket #JP-8821. Our system administrator will review it and notify you via SMS within 24 hours.";
        }
      }

      setChatThreads(prev => ({
        ...prev,
        [activeThread]: [...prev[activeThread], { sender: 'bot', text: botResponse }]
      }));
      setTyping(false);
    }, 1200);
  };

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    const userText = chatInput.trim();
    setChatInput('');
    sendMessageFlow(userText);
  };

  const handleSendSuggestion = (promptText) => {
    sendMessageFlow(promptText);
  };

  // Skill Quiz Handlers
  const handleStartQuiz = (skillName) => {
    setSelectedSkill(skillName);
    setCurrentQuestionIdx(0);
    setSelectedAnswer('');
    setScore(0);
    setQuizCompleted(false);
    setShowQuizModal(true);
  };

  const handleNextQuestion = () => {
    const questions = quizQuestions[selectedSkill] || quizQuestions['JavaScript'];
    const currentQuestion = questions[currentQuestionIdx];
    
    let newScore = score;
    if (selectedAnswer === currentQuestion.correct) {
      newScore += 1;
      setScore(newScore);
    }

    if (currentQuestionIdx < questions.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
      setSelectedAnswer('');
    } else {
      setQuizCompleted(true);
      if (newScore >= 2) {
        const updated = [...new Set([...verifiedSkills, selectedSkill])];
        localStorage.setItem(`verifiedSkills_${user?.id}`, JSON.stringify(updated));
        setVerifiedSkills(updated);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7fe]">
      <CandidateHeader />
      
      <main className="container mx-auto px-8 pt-28 pb-12">
        
        {/* Profile Insight Banner */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 mb-8 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-6">
            <div className="relative">
               <div className="w-20 h-20 rounded-full bg-indigo-50 border-2 border-white shadow-sm overflow-hidden flex items-center justify-center">
                  {user?.profilePhoto ? (
                    <img src={user.profilePhoto} alt="User" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl font-bold text-indigo-300 uppercase">
                      {user?.fullName?.split(' ').map(n => n[0]).join('')}
                    </span>
                  )}
               </div>
               <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-blue-600 rounded-full border-2 border-white flex items-center justify-center shadow-md">
                  <Award size={14} className="text-white" />
               </div>
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                Hello, {user?.fullName?.split(' ')[0] || "Candidate"}!
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-600 text-[10px] rounded-md uppercase tracking-wider font-bold animate-pulse">Active Now</span>
              </h1>
              <p className="text-slate-500 text-sm font-medium mt-1">
                Your profile is in the <span className="text-blue-600 font-bold">Top 5%</span> for {user?.headline?.split(' at ')[0] || 'your role'} in {user?.currentLocation || 'your city'}.
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 w-full lg:w-auto">
            <div className="flex-1 lg:w-48">
              <div className="flex justify-between text-[11px] font-bold text-slate-400 uppercase mb-1.5">
                <span>Profile Strength</span>
                <span className="text-blue-600">{user?.profileCompletion || 0}%</span>
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600" style={{ width: `${user?.profileCompletion || 0}%` }}></div>
              </div>
            </div>
            <button onClick={() => navigate('/profile')} className="px-5 py-2.5 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-blue-600 transition-all shadow-md active:scale-95">
              Edit Profile
            </button>
          </div>
        </div>

        {/* Dashboard Navigation */}
        <div className="flex items-center gap-8 border-b border-slate-200 mb-8 px-2 overflow-x-auto no-scrollbar relative z-10">
          {['overview', 'applications', 'saved', 'messages'].map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 text-sm font-bold capitalize transition-all relative ${activeTab === tab ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              {tab}
              {activeTab === tab && (
                <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600" />
              )}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Main Column */}
          <div className="lg:col-span-3 space-y-8">
            
            {activeTab === 'overview' && (
              <>
                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {stats.map((stat) => (
                    <div key={stat.label} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm group hover:border-blue-200 transition-all">
                      <div className="flex justify-between items-start mb-4">
                        <div className={`p-2 rounded-lg ${stat.bg} ${stat.color}`}>
                          <stat.icon size={20} />
                        </div>
                        <ArrowUpRight size={16} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                      </div>
                      <h3 className="text-2xl font-bold text-slate-900">{stat.value}</h3>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-tight mt-1">{stat.label}</p>
                      <p className="text-[10px] font-bold text-emerald-500 mt-2 flex items-center gap-1">
                        <TrendingUp size={10} /> {stat.sub}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Application Tracking Preview */}
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-slate-900">Active Applications</h2>
                    <button onClick={() => setActiveTab('applications')} className="text-sm font-bold text-blue-600 hover:underline">Track All</button>
                  </div>
                  <div className="space-y-8">
                    {loading ? (
                        <div className="text-center py-10">
                            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto" />
                        </div>
                    ) : appliedJobs.length === 0 ? (
                        <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                            <p className="text-sm font-bold text-slate-400 uppercase">No active applications</p>
                            <button onClick={() => navigate('/jobs')} className="mt-2 text-xs font-bold text-blue-600 hover:underline">Browse Jobs</button>
                        </div>
                    ) : appliedJobs.slice(0, 3).map((app) => (
                      <div key={app.id} className="group">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                          <div className="flex items-center gap-4">
                             <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center font-bold text-slate-300 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                {app.Job?.Company?.logo ? <img src={app.Job.Company.logo} className="w-full h-full object-cover rounded-lg" /> : <Building2 size={20} />}
                             </div>
                             <div>
                                <h4 className="font-bold text-slate-800 text-sm group-hover:text-blue-600 transition-colors">{app.Job?.title}</h4>
                                <p className="text-xs font-medium text-slate-500">{app.Job?.Company?.companyName} • Applied {new Date(app.createdAt).toLocaleDateString()}</p>
                             </div>
                          </div>
                          <div className="flex items-center gap-3">
                              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                                app.status === 'shortlisted' ? 'bg-emerald-50 text-emerald-600' : 
                                app.status === 'rejected' ? 'bg-rose-50 text-rose-600' :
                                'bg-blue-50 text-blue-600'
                              }`}>
                                {app.status}
                              </span>
                              <button onClick={() => navigate(`/job/description/${app.jobId}`)} className="p-2 text-slate-300 hover:text-blue-600 transition-colors">
                                  <ArrowUpRight size={14} />
                              </button>
                          </div>
                        </div>
                        
                        {/* Status Timeline */}
                        {app.status !== 'rejected' ? (
                            <div className="flex items-center justify-between px-2">
                            {timelineSteps.map((step, idx) => {
                                const stepNum = idx + 1;
                                const currentStep = getStatusStep(app.status);
                                const isCompleted = stepNum < currentStep || app.status === 'hired';
                                const isCurrent = stepNum === currentStep && app.status !== 'hired';
                                return (
                                <div key={step} className="flex flex-col items-center relative flex-1 group/step">
                                    {/* Line */}
                                    {idx !== timelineSteps.length - 1 && (
                                        <div className={`absolute top-2.5 left-1/2 w-full h-[2px] z-0 ${
                                        isCompleted ? 'bg-blue-600' : 'bg-slate-100'
                                        }`}></div>
                                    )}
                                    
                                    {/* Circle */}
                                    <div className={`w-5 h-5 rounded-full flex items-center justify-center z-10 border-2 transition-all ${
                                        isCompleted ? 'bg-blue-600 border-blue-600 text-white' : 
                                        isCurrent ? 'bg-white border-blue-600 text-blue-600 shadow-md shadow-blue-100' : 
                                        'bg-white border-slate-200 text-slate-300'
                                    }`}>
                                        {isCompleted ? <CheckCircle2 size={12} /> : <div className="w-1.5 h-1.5 rounded-full bg-current"></div>}
                                    </div>
                                    <span className={`text-[9px] mt-2 font-bold uppercase tracking-tight text-center hidden md:block ${
                                        isCurrent ? 'text-blue-600' : 'text-slate-400'
                                    }`}>
                                        {step}
                                    </span>
                                </div>
                                );
                            })}
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 p-3 bg-rose-50 rounded-xl text-rose-600">
                                <XCircle size={14} />
                                <span className="text-[10px] font-bold uppercase">Application was not selected by the recruiter</span>
                            </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Graph & Recommended Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                      <h3 className="text-sm font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <TrendingUp size={16} className="text-blue-600" />
                        Profile Performance (Last 7 Days)
                      </h3>
                      <div className="h-48 w-full">
                         <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={statsData?.graphData || []}>
                               <defs>
                                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                                     <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                                     <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                                  </linearGradient>
                                  <linearGradient id="colorApplies" x1="0" y1="0" x2="0" y2="1">
                                     <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                                     <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                  </linearGradient>
                               </defs>
                               <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                               <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                               <Tooltip contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                               <Area type="monotone" dataKey="views" stroke="#2563eb" strokeWidth={2} fillOpacity={1} fill="url(#colorViews)" name="Profile Views" />
                               <Area type="monotone" dataKey="applies" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorApplies)" name="Applications" />
                            </AreaChart>
                         </ResponsiveContainer>
                      </div>
                   </div>

                   <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                      <h3 className="text-sm font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <Users size={16} className="text-blue-600" />
                        Competitor Insights
                      </h3>
                      <div className="space-y-4">
                        <div className="p-3 bg-slate-50 rounded-lg flex items-center justify-between">
                           <span className="text-xs font-bold text-slate-600">Avg. Applications for your roles</span>
                           <span className="text-xs font-bold text-slate-900">{statsData?.avgApplications || 0}+</span>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-lg flex items-center justify-between">
                           <span className="text-xs font-bold text-slate-600">Your ranking in "{user?.currentLocation || 'your city'}"</span>
                           <span className="text-xs font-bold text-blue-600">Top 5%</span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium italic">
                          * Based on skills match and profile completion compared to other candidates.
                        </p>
                      </div>
                   </div>
                </div>
              </>
            )}

            {activeTab === 'applications' && (
              <div className="space-y-4 relative z-10">
                {appliedJobs.length === 0 ? (
                    <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Briefcase size={32} className="text-slate-300" />
                        </div>
                        <h2 className="text-lg font-bold text-slate-900">No applications found</h2>
                        <p className="text-slate-555 text-slate-500 text-sm mt-1 max-w-xs mx-auto">Start applying to jobs to track your progress here.</p>
                        <button onClick={() => navigate('/jobs')} className="mt-6 px-6 py-2.5 bg-blue-600 text-white rounded-lg text-xs font-bold shadow-lg shadow-blue-100">Browse Jobs</button>
                    </div>
                ) : appliedJobs.map((app) => (
                    <div key={app.id} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:border-blue-200 transition-all">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center overflow-hidden border border-slate-100">
                                    {app.Job?.Company?.logo ? <img src={app.Job.Company.logo} className="w-full h-full object-cover" /> : <Building2 size={24} className="text-slate-300" />}
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 text-sm">{app.Job?.title}</h3>
                                    <p className="text-xs font-bold text-blue-600 uppercase tracking-tighter">{app.Job?.Company?.companyName}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase ${
                                    app.status === 'shortlisted' ? 'bg-emerald-50 text-emerald-600' : 
                                    app.status === 'rejected' ? 'bg-rose-50 text-rose-600' :
                                    'bg-blue-50 text-blue-600'
                                }`}>
                                    {app.status}
                                </span>
                                <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase">Applied on {new Date(app.createdAt).toLocaleDateString()}</p>
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
                            <div className="flex gap-4">
                                <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest"><MapPin size={12}/> {app.Job?.location}</span>
                                <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest"><DollarSign size={12}/> {app.Job?.minSalary ? `₹${app.Job.minSalary} - ₹${app.Job.maxSalary}` : 'Competitive'}</span>
                            </div>
                            <button onClick={() => navigate(`/job/description/${app.jobId}`)} className="text-[10px] font-bold text-blue-600 hover:underline flex items-center gap-1">View Job <ChevronRight size={12}/></button>
                        </div>
                    </div>
                ))}
              </div>
            )}

            {/* Fully Functional Saved Jobs Tab */}
            {activeTab === 'saved' && (
              <div className="space-y-4 relative z-10">
                {savedJobs.length === 0 ? (
                    <div className="bg-white border border-slate-200 rounded-xl p-8 text-center animate-fade-in">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Bookmark size={32} className="text-slate-350 text-slate-400" />
                        </div>
                        <h2 className="text-lg font-bold text-slate-900">No saved jobs yet</h2>
                        <p className="text-slate-500 text-sm mt-1 max-w-xs mx-auto font-medium">Bookmark jobs while searching to keep them organized here.</p>
                        <button onClick={() => navigate('/jobs')} className="mt-6 px-6 py-2.5 bg-indigo-600 text-white rounded-lg text-xs font-bold shadow-lg shadow-indigo-100">Explore Openings</button>
                    </div>
                ) : savedJobs.map((job) => {
                    const renderLoc = Array.isArray(job.location) ? job.location.join(', ') : job.location;
                    return (
                    <div key={job.id} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:border-indigo-150 transition-all flex flex-col justify-between hover:shadow-[0_12px_40px_rgba(99,102,241,0.02)]">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center overflow-hidden border border-slate-100">
                                    {job.Company?.logo ? <img src={job.Company.logo} className="w-full h-full object-cover" /> : <Building2 size={24} className="text-slate-300" />}
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 text-sm">{job.title}</h3>
                                    <p className="text-xs font-bold text-indigo-600 uppercase tracking-tighter">{job.Company?.companyName}</p>
                                </div>
                            </div>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                const updated = savedJobs.filter(s => s.id !== job.id);
                                localStorage.setItem('savedJobs', JSON.stringify(updated));
                                setSavedJobs(updated);
                                toast.success("Job removed from saved list");
                              }}
                              className="text-slate-300 hover:text-rose-500 p-2 rounded-lg hover:bg-slate-50 transition-all"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                        <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
                            <div className="flex gap-4">
                                <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest"><MapPin size={12}/> {renderLoc}</span>
                                <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest"><DollarSign size={12}/> {formatSalary(job.minSalary, job.maxSalary)}</span>
                            </div>
                            <button onClick={() => navigate(`/job/description/${job.id}`)} className="text-[10px] font-bold text-indigo-600 hover:underline flex items-center gap-1">Apply Now <ChevronRight size={12}/></button>
                        </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Fully Functional Messages / Interactive Chat Center */}
            {activeTab === 'messages' && (
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex h-[500px] relative z-10 animate-fade-in">
                {/* Chat Left Sidebar */}
                <div className="w-1/3 border-r border-slate-100 flex flex-col">
                  <div className="p-4 border-b border-slate-50 bg-slate-50/50">
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Inbox</h3>
                  </div>
                  <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
                    {/* Assistant Card */}
                    <button 
                      onClick={() => setActiveThread('assistant')}
                      className={`w-full text-left p-4 flex gap-3 transition-colors ${activeThread === 'assistant' ? 'bg-indigo-50/40 border-l-4 border-indigo-650' : 'hover:bg-slate-50/50'}`}
                    >
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <Sparkles size={18} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex justify-between items-baseline mb-0.5">
                          <span className="text-xs font-bold text-slate-800">Career Assistant</span>
                          <span className="text-[9px] text-slate-400 font-bold uppercase">BOT</span>
                        </div>
                        <p className="text-[11px] text-slate-400 font-medium truncate">Career suggestions, resume reviews & tips</p>
                      </div>
                    </button>

                    {/* Support Card */}
                    <button 
                      onClick={() => setActiveThread('support')}
                      className={`w-full text-left p-4 flex gap-3 transition-colors ${activeThread === 'support' ? 'bg-indigo-50/40 border-l-4 border-indigo-650' : 'hover:bg-slate-50/50'}`}
                    >
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                        <ShieldCheck size={18} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex justify-between items-baseline mb-0.5">
                          <span className="text-xs font-bold text-slate-800">System Support</span>
                          <span className="text-[9px] text-slate-400 font-bold uppercase">Online</span>
                        </div>
                        <p className="text-[11px] text-slate-400 font-medium truncate">System status, SMS OTP codes, account tickets</p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Chat Log Panel */}
                <div className="flex-1 flex flex-col bg-slate-50/20">
                  {/* Header */}
                  <div className="p-4 border-b border-slate-100 bg-white flex items-center gap-3">
                    {activeThread === 'assistant' ? (
                      <>
                        <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                          <Sparkles size={16} />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-850">Career Assistant</h4>
                          <span className="text-[9px] font-bold text-blue-600 flex items-center gap-1"><span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-ping"></span> AI matching assistant online</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                          <ShieldCheck size={16} />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-850">System Support Desk</h4>
                          <span className="text-[9px] font-bold text-emerald-600 flex items-center gap-1"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> Support agents online</span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Messages Log */}
                  <div className="flex-1 p-4 overflow-y-auto space-y-4 scroll-smooth custom-scrollbar">
                    {chatThreads[activeThread].map((msg, mIdx) => (
                      <div 
                        key={mIdx}
                        className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div 
                          className={`max-w-[70%] p-3.5 rounded-2xl text-xs font-medium leading-relaxed ${
                            msg.sender === 'user' 
                            ? 'bg-slate-900 text-white rounded-br-none shadow-sm' 
                            : 'bg-white border border-slate-100 text-slate-700 rounded-bl-none shadow-sm shadow-slate-100/5'
                          }`}
                        >
                          {msg.text}
                        </div>
                      </div>
                    ))}
                    
                    {typing && (
                      <div className="flex justify-start">
                        <div className="bg-white border border-slate-100 p-3.5 rounded-2xl rounded-bl-none text-xs text-slate-400 flex items-center gap-2 font-semibold shadow-sm">
                          <span className="italic">Assistant is typing</span>
                          <span className="flex space-x-1">
                            <span className="w-1 h-1 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                            <span className="w-1 h-1 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                            <span className="w-1 h-1 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                   {/* Quick Suggestion Pills */}
                  <div className="px-4 py-2.5 bg-white border-t border-slate-100/60 flex flex-wrap gap-2 relative z-10">
                    {activeThread === 'assistant' ? (
                      <>
                        {['Show matching jobs', 'Check my ATS score', 'How to verify skills?'].map(prompt => (
                          <button 
                            key={prompt}
                            onClick={() => handleSendSuggestion(prompt)}
                            className="text-[10px] font-bold text-indigo-650 bg-indigo-50/50 hover:bg-indigo-100/70 border border-indigo-100/40 px-3 py-1.5 rounded-full transition-all active:scale-95"
                          >
                            {prompt}
                          </button>
                        ))}
                      </>
                    ) : (
                      <>
                        {['Delayed login OTP', 'ATS Resume parsing error', 'Contact Support Help'].map(prompt => (
                          <button 
                            key={prompt}
                            onClick={() => handleSendSuggestion(prompt)}
                            className="text-[10px] font-bold text-emerald-700 bg-emerald-50/50 hover:bg-emerald-100/70 border border-emerald-100/40 px-3 py-1.5 rounded-full transition-all active:scale-95"
                          >
                            {prompt}
                          </button>
                        ))}
                      </>
                    )}
                  </div>

                  {/* Input row */}
                  <div className="p-4 bg-white border-t border-slate-100 flex gap-2">
                    <input 
                      type="text"
                      placeholder="Write your query..."
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      className="flex-1 bg-slate-50 border border-slate-100 px-4 py-3 rounded-xl focus:outline-none focus:border-indigo-200 text-xs font-semibold"
                    />
                    <button 
                      onClick={handleSendMessage}
                      className="px-5 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all active:scale-95 flex items-center justify-center shrink-0 shadow-md shadow-indigo-150"
                    >
                      <Send size={15} />
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            
            {/* Quick Tips */}
            <div className="bg-blue-600 rounded-xl p-5 text-white relative overflow-hidden shadow-lg shadow-blue-100">
               <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                 <Zap size={16} className="text-blue-200" />
                 Career Growth
               </h3>
               <p className="text-xs text-blue-100 font-medium leading-relaxed">
                 Add your **Projects** to get noticed by top-tier tech companies.
               </p>
               <button onClick={() => navigate('/profile')} className="mt-4 w-full py-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold transition-all">
                 Add Project
               </button>
            </div>

            {/* Skill Verification List - NOW LIVE & WORKABLE */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
               <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                 <Award size={16} className="text-indigo-600" />
                 Verified Skills
               </h3>
               <div className="space-y-3">
                  {(Array.isArray(user?.skills) ? user.skills : JSON.parse(user?.skills || '[]')).slice(0, 5).map((skill) => {
                     const skillName = typeof skill === 'object' ? skill.name : skill;
                     const isVerified = verifiedSkills.includes(skillName);
                     
                     return (
                       <div key={skillName} className="flex items-center justify-between group">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-semibold text-slate-700 capitalize">{skillName}</span>
                            {isVerified && <CheckCircle2 size={12} className="text-emerald-500 fill-emerald-50 shrink-0" />}
                          </div>
                          {!isVerified ? (
                            <button 
                              onClick={() => handleStartQuiz(skillName)}
                              className="text-[10px] font-bold text-indigo-650 hover:text-indigo-600 hover:underline md:opacity-0 md:group-hover:opacity-100 transition-all shrink-0"
                            >
                              Take Test
                            </button>
                          ) : (
                            <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded uppercase tracking-wider scale-90 shrink-0 select-none">
                              Passed
                            </span>
                          )}
                       </div>
                     );
                  })}
               </div>
               <button className="w-full mt-4 py-2 border border-indigo-100 text-indigo-650 rounded-lg text-[10px] font-bold hover:bg-indigo-50 transition-colors uppercase tracking-wider select-none">
                 Assess Skills
               </button>
            </div>

            {/* Upcoming Interviews */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
               <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                 <Calendar size={16} className="text-blue-600" />
                 Upcoming Interviews
               </h3>
               <div className="space-y-4">
                  {interviews.length === 0 ? (
                    <div className="text-center py-6 border-2 border-dashed border-slate-50 rounded-xl">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No interviews scheduled</p>
                    </div>
                  ) : interviews.map((int) => (
                    <div key={int.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 group hover:border-blue-200 transition-all">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                                {int.Job?.Company?.logo ? <img src={int.Job.Company.logo} className="w-full h-full object-cover rounded-lg" /> : <Building2 size={14} className="text-slate-300" />}
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <h4 className="text-[11px] font-bold text-slate-800 truncate">{int.Job?.title}</h4>
                                <p className="text-[9px] font-bold text-blue-600 uppercase tracking-tighter">{int.Job?.Company?.companyName}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100">
                            <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-500">
                                <Calendar size={12} className="text-slate-300" />
                                {new Date(int.interviewDate).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-500">
                                <Clock size={12} className="text-slate-300" />
                                {int.interviewTime}
                            </div>
                        </div>
                        <a 
                            href={int.locationOrLink} 
                            target="_blank" 
                            className="w-full mt-3 py-2 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-blue-600 hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center gap-2"
                        >
                            {int.mode === 'online' ? <Video size={12} /> : <MapPin size={12} />}
                            {int.mode === 'online' ? 'Join Meeting' : 'View Location'}
                        </a>
                    </div>
                  ))}
               </div>
            </div>

            {/* Resume Score */}
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-5">
               <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-emerald-900">Resume Score</span>
                  <span className="text-xs font-bold text-emerald-600">{statsData?.resumeScore || 0}/100</span>
               </div>
               <div className="w-full h-1.5 bg-white rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${statsData?.resumeScore || 0}%` }}></div>
               </div>
               <p className="text-[10px] text-emerald-700 mt-2 font-medium">Your resume is optimized for ATS. Keep it up!</p>
            </div>

          </div>

        </div>
      </main>

      {/* Skill Quiz Verification Modal */}
      <AnimatePresence>
        {showQuizModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl border border-slate-100 shadow-lg p-8 max-w-md w-full relative"
            >
              <button 
                onClick={() => setShowQuizModal(false)}
                className="absolute top-6 right-6 text-slate-400 hover:text-slate-650 p-1 hover:bg-slate-50 rounded-full transition-colors"
              >
                <XCircle size={20} className="text-slate-400 hover:text-slate-650" />
              </button>

              {!quizCompleted ? (
                <div className="space-y-6">
                  <div>
                    <span className="px-2.5 py-1 bg-indigo-50 text-indigo-650 text-[10px] font-bold uppercase rounded-md tracking-wider">Skill Verification</span>
                    <h3 className="text-xl font-bold text-slate-900 mt-2">Verify {selectedSkill} Badge</h3>
                    <p className="text-xs text-slate-400 font-medium">Answer 3 questions correctly to earn your verified badge.</p>
                  </div>

                  <div className="h-[2px] bg-slate-100 w-full rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-indigo-600 transition-all duration-300" 
                      style={{ width: `${((currentQuestionIdx) / 3) * 100}%` }}
                    ></div>
                  </div>

                  {/* Question Container */}
                  <div className="space-y-4">
                    <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">Question {currentQuestionIdx + 1} of 3</span>
                    <p className="text-sm font-bold text-slate-800 leading-snug">
                      {(quizQuestions[selectedSkill] || quizQuestions['JavaScript'])[currentQuestionIdx].q}
                    </p>

                    {/* Options list */}
                    <div className="space-y-2.5 pt-2">
                      {(quizQuestions[selectedSkill] || quizQuestions['JavaScript'])[currentQuestionIdx].a.map((opt) => (
                        <button
                          key={opt}
                          onClick={() => setSelectedAnswer(opt)}
                          className={`w-full text-left px-5 py-3.5 rounded-xl border text-xs font-semibold transition-all ${
                            selectedAnswer === opt 
                            ? 'border-indigo-600 bg-indigo-50/50 text-indigo-650 shadow-sm' 
                            : 'border-slate-200 text-slate-600 hover:border-slate-350 hover:bg-slate-50'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleNextQuestion}
                    disabled={!selectedAnswer}
                    className="w-full py-4 bg-slate-900 hover:bg-indigo-600 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                  >
                    {currentQuestionIdx === 2 ? 'Submit Quiz' : 'Next Question'}
                  </button>
                </div>
              ) : (
                // Results screen
                <div className="text-center space-y-6 py-4">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto bg-slate-50">
                    {score >= 2 ? (
                      <CheckCircle2 size={40} className="text-emerald-500" />
                    ) : (
                      <XCircle size={40} className="text-rose-500" />
                    )}
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-slate-900">
                      {score >= 2 ? 'Verification Success! 🎉' : 'Quiz Attempt Failed 😢'}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed font-medium">
                      {score >= 2 
                        ? `Congratulations! You scored ${score}/3. A verified green checkmark badge has been added to your profile sidebar.`
                        : `You scored ${score}/3. You need to answer at least 2 questions correctly to pass. Better luck next time!`
                      }
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      if (score >= 2) {
                        toast.success(`${selectedSkill} badge added successfully!`);
                        setShowQuizModal(false);
                      } else {
                        setCurrentQuestionIdx(0);
                        setSelectedAnswer('');
                        setScore(0);
                        setQuizCompleted(false);
                      }
                    }}
                    className="w-full py-4 bg-slate-900 hover:bg-indigo-600 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95"
                  >
                    {score >= 2 ? 'Finish' : 'Retry Test'}
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default CandidateDashboard;

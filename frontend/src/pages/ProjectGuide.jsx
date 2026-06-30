import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserPlus, FileText, Search, CheckCircle2, 
  TrendingUp, Building2, Zap, ShieldCheck, 
  LayoutDashboard, PieChart, Bell, ArrowRight,
  Target, Award, Users, Globe, PhoneCall, Cpu,
  Briefcase, Mail, MousePointer2, ChevronDown,
  ShieldAlert, Settings2, BarChart3, Fingerprint
} from 'lucide-react';
import CandidateHeader from './candidate/CandidateHeader';

const ProjectGuide = () => {
    const [activeRole, setActiveRole] = useState('candidate');

    const roles = [
        { id: 'candidate', name: 'Candidate Journey', icon: <UserPlus size={20}/> },
        { id: 'recruiter', name: 'Recruiter Flow', icon: <Building2 size={20}/> },
        { id: 'admin', name: 'Admin Operations', icon: <ShieldCheck size={20}/> }
    ];

    const candidateJourney = [
        {
            step: "01",
            title: "Secure Identity Verification",
            detail: "Apne mobile number se register karein. Hum OTP (One-Time Password) use karte hain taaki aapka data safe rahe aur koi fake profile na ban sake.",
            icon: <Fingerprint className="text-blue-500" />,
            subPoints: ["Mobile OTP Login", "Google Auth Support", "Data Privacy Encryption"]
        },
        {
            step: "02",
            title: "AI Resume Magic",
            detail: "Aapko pura form bharne ki zaroorat nahi hai. Bas apna PDF resume upload karein, aur humara AI automatic aapka naam, experience, aur skills nikaal kar profile fill kar dega.",
            icon: <Cpu className="text-indigo-500" />,
            subPoints: ["Fast AI Parsing", "Automatic Skill Mapping", "One-Click Data Import"]
        },
        {
            step: "03",
            title: "Elite Profile Building",
            detail: "Apne Projects, Certifications, aur Social links add karein. Humari smart suggest API aapko verified companies aur global universities ke real names suggest karegi.",
            icon: <Award className="text-amber-500" />,
            subPoints: ["Project Showcasing", "Verified Skill Badges", "Profile Strength Meter"]
        },
        {
            step: "04",
            title: "Smart Job Discovery",
            detail: "Aapki skills aur location ke basis par hum best jobs suggest karte hain. Salary range, company culture, aur notice period filters ka use karke apni dream job dhundhein.",
            icon: <Search className="text-emerald-500" />,
            subPoints: ["Advanced Filters", "Salary Transparency", "Direct Apply with Cover Letter"]
        },
        {
            step: "05",
            title: "Live Application Tracking",
            detail: "Check karein ki aapka application kahan tak pahuncha. 'Applied' se lekar 'Hired' tak ka pura timeline aapke dashboard par real-time update hota hai.",
            icon: <MousePointer2 className="text-rose-500" />,
            subPoints: ["Status Timeline", "Interview Scheduling", "Instant Status Alerts"]
        },
        {
            step: "06",
            title: "Profile Analytics",
            detail: "Ye sabse unique feature hai. Dekhein ki pichle 7 dino mein kitne recruiters ne aapka profile search mein dekha aur kitno ne use open karke read kiya.",
            icon: <TrendingUp className="text-blue-600" />,
            subPoints: ["Search Appearances", "Recruiter View Count", "Performance Trend Graph"]
        }
    ];

    const recruiterJourney = [
        {
            step: "01",
            title: "Verified Onboarding",
            detail: "Register karne ke baad Admin aapki company ko verify karta hai. Ye step isliye zaroori hai taaki candidates ko sirf real aur trusted jobs hi dikhein.",
            icon: <ShieldCheck className="text-indigo-600" />,
            subPoints: ["KYC Verification", "Company Identity Check", "Spam Protection"]
        },
        {
            step: "02",
            title: "Precision Job Posting",
            detail: "Nayi job post karte waqt detailed requirements dalein. Humari AI-Suggest API aapko trending skills aur job titles suggest karegi taaki aapka job post professional lage.",
            icon: <Target className="text-rose-600" />,
            subPoints: ["Skill Recommendations", "Approval Workflow", "Custom Questionnaires"]
        },
        {
            step: "03",
            title: "AI-Powered Shortlisting",
            detail: "Hazaron applications mein se hum top matches ko highlight karte hain. Aap candidate ka Resume, Projects, aur Salary expectations ek hi screen par dekh sakte hain.",
            icon: <Zap className="text-amber-500" />,
            subPoints: ["Detailed Candidate View", "Resume Downloading", "Quick Filtering"]
        },
        {
            step: "04",
            title: "Efficient Communication",
            detail: "Portal ke andar hi candidate se chat karein ya interview schedule karein. Har action (Shortlist/Reject) par candidate ko automatic notifications jaati hain.",
            icon: <Mail className="text-blue-500" />,
            subPoints: ["In-built Interview Scheduler", "Email Notifications", "Application Notes"]
        },
        {
            step: "05",
            title: "Hiring Stats",
            detail: "Check karein ki aapke job posts kitne active hain aur ab tak kitne candidates shortlist ya hire huye hain. Data-driven hiring ab aasan hai.",
            icon: <BarChart3 className="text-emerald-500" />,
            subPoints: ["Hiring Analytics", "Active vs Closed Jobs", "Applicant Ratio Tracker"]
        }
    ];

    const adminJourney = [
        {
            step: "01",
            title: "Quality Moderation",
            detail: "Admin ke pass har nayi Job aur Company ko review karne ka control hai. Aap check kar sakte hain ki listing sahi hai ya nahi, aur fir use live kar sakte hain.",
            icon: <CheckCircle2 className="text-emerald-600" />,
            subPoints: ["Job Approval Workflow", "Company Blocking/Unblocking", "Metadata Approval"]
        },
        {
            step: "02",
            title: "Global Hiring Tracker",
            detail: "Pure portal par kya ho raha hai, ye ek hi jagah dekhein. Kaun recruiter kis candidate ko hire kar raha hai, kisne reject kiya, sab ka data Admin ke paas hai.",
            icon: <Globe className="text-slate-800" />,
            subPoints: ["All-in-one Application List", "Global Placement Stats", "Hiring Activity Logs"]
        },
        {
            step: "03",
            title: "Subscription Management",
            detail: "Recruiters ke liye packages aur pricing manage karein. Aap manually kisi company ko custom plan assign kar sakte hain ya free access de sakte hain.",
            icon: <Settings2 className="text-indigo-600" />,
            subPoints: ["Package Creation", "Custom Plan Assignment", "Payment Gateway Config"]
        },
        {
            step: "04",
            title: "System Config & Support",
            detail: "Portal ki features ko ON/OFF karein (e.g. Chat support, payment modes). System-wide maintenance aur user queries ko handle karne ka central hub.",
            icon: <ShieldAlert className="text-rose-600" />,
            subPoints: ["Support Management", "API Configurations", "Platform Security Control"]
        }
    ];

    const currentJourney = activeRole === 'candidate' ? candidateJourney : activeRole === 'recruiter' ? recruiterJourney : adminJourney;

    return (
        <div className="min-h-screen bg-[#f8fafc]">
            <CandidateHeader />
            
            <main className="container mx-auto px-4 pt-32 pb-24">
                {/* Modern Hero Section */}
                <div className="text-center max-w-4xl mx-auto mb-20">
                    <motion.span 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="px-5 py-2 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-8 inline-block"
                    >
                        Official Platform Documentation
                    </motion.span>
                    <motion.h1 
                        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                        className="text-5xl md:text-6xl font-black text-slate-900 mb-8 tracking-tight"
                    >
                        Master the <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Future of Hiring.</span>
                    </motion.h1>
                    <p className="text-slate-500 text-xl font-medium leading-relaxed">
                        Ye guide aapko batayegi ki portal ka har ek feature aapki 
                        success ke liye kaise kaam karta hai.
                    </p>
                </div>

                {/* Role Switcher with Glow */}
                <div className="flex flex-wrap justify-center gap-6 mb-24">
                    {roles.map((role) => (
                        <button
                            key={role.id}
                            onClick={() => setActiveRole(role.id)}
                            className={`flex items-center gap-4 px-10 py-5 rounded-2xl text-sm font-black uppercase tracking-widest transition-all ${
                                activeRole === role.id 
                                ? 'bg-slate-900 text-white shadow-[0_20px_50px_rgba(0,0,0,0.1)] scale-110' 
                                : 'bg-white text-slate-400 hover:bg-slate-50 border border-slate-100'
                            }`}
                        >
                            {role.icon}
                            {role.name}
                        </button>
                    ))}
                </div>

                {/* Detailed Journey Map */}
                <div className="grid grid-cols-1 gap-12 max-w-5xl mx-auto">
                    <AnimatePresence mode="wait">
                        {currentJourney.map((item, index) => (
                            <motion.div
                                key={activeRole + index}
                                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: index * 0.1, duration: 0.5 }}
                                className="group relative"
                            >
                                {/* The Connection Line */}
                                {index !== currentJourney.length - 1 && (
                                    <div className="absolute left-[39px] top-24 w-0.5 h-full bg-slate-100 hidden md:block" />
                                )}

                                <div className="flex flex-col md:flex-row gap-8 items-start bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:border-blue-100 transition-all duration-500 relative z-10">
                                    {/* Number Circle */}
                                    <div className="w-20 h-20 shrink-0 rounded-3xl bg-slate-50 flex items-center justify-center relative overflow-hidden group-hover:bg-blue-600 group-hover:text-white transition-colors duration-500">
                                        <span className="text-3xl font-black italic opacity-20 group-hover:opacity-10 transition-opacity absolute -right-2 -bottom-2">{item.step}</span>
                                        <div className="relative z-10">{item.icon}</div>
                                    </div>

                                    {/* Content Detail */}
                                    <div className="flex-1 space-y-4">
                                        <div className="flex items-center gap-3">
                                            <span className="text-[11px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-lg uppercase">Step {item.step}</span>
                                            <h2 className="text-2xl font-black text-slate-800">{item.title}</h2>
                                        </div>
                                        <p className="text-slate-500 text-lg font-medium leading-relaxed">
                                            {item.detail}
                                        </p>
                                        
                                        {/* Dynamic Tags */}
                                        <div className="flex flex-wrap gap-2 pt-4">
                                            {item.subPoints.map((pt, i) => (
                                                <span key={i} className="px-4 py-2 bg-slate-50 border border-slate-100 text-slate-500 text-xs font-bold rounded-xl flex items-center gap-2 group-hover:border-blue-100 group-hover:text-blue-600 group-hover:bg-blue-50 transition-all">
                                                    <CheckCircle2 size={12} className="text-emerald-500" />
                                                    {pt}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Arrow for Visual Flow */}
                                    <div className="hidden lg:block shrink-0 mt-2 opacity-0 group-hover:opacity-100 transform -translate-x-4 group-hover:translate-x-0 transition-all">
                                        <ArrowRight className="text-blue-500" size={24}/>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {/* Final Call to Action Box */}
                <motion.div 
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-32 bg-slate-900 rounded-[4rem] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl shadow-blue-900/20"
                >
                    <div className="relative z-10 max-w-2xl mx-auto">
                        <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-10 shadow-xl shadow-blue-500/30">
                            <Zap size={32} className="text-white" />
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black text-white mb-8">Ready to transform your career?</h2>
                        <p className="text-slate-400 text-lg font-medium mb-12">
                            Ab jab aapne pura system samajh liya hai, to aaj hi register 
                            karein aur elite talent network ka hissa banein.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-6">
                            <button className="px-10 py-5 bg-blue-600 text-white rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/20">Create My Account</button>
                            <button className="px-10 py-5 bg-white/10 text-white rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-white/20 transition-all border border-white/10">Browse Live Jobs</button>
                        </div>
                    </div>
                    
                    {/* Abstract Shapes */}
                    <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2"></div>
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-[100px] translate-x-1/2 translate-y-1/2"></div>
                </motion.div>
            </main>

            {/* Simple Help Footer for Client */}
            <footer className="py-12 bg-white border-t border-slate-100 text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                    Developed for Executive Grade Talent Management © 2026
                </p>
            </footer>
        </div>
    );
};

export default ProjectGuide;

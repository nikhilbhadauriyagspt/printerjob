import React from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, Check, Download, ArrowUpRight, 
  Target, Award, ShieldCheck, Sparkles 
} from 'lucide-react';
import CandidateHeader from './CandidateHeader';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const CareerGuide = () => {
  const navigate = useNavigate();
  const { user } = useSelector(store => store.auth);

  // Parse dynamic skills & projects from logged-in user profile
  const userSkills = user?.skills 
    ? (Array.isArray(user.skills) ? user.skills : JSON.parse(user.skills || '[]')) 
    : [];

  const userProjects = user?.projectsData 
    ? (Array.isArray(user.projectsData) ? user.projectsData : JSON.parse(user.projectsData || '[]')) 
    : [];

  const profileChecklist = [
    { 
      item: "Identity Verification", 
      status: user?.isPhoneVerified ? "Verified" : "Pending", 
      action: user?.isPhoneVerified ? null : "Verify Phone",
      path: "/profile"
    },
    { 
      item: "Resume AI Parsing", 
      status: user?.resume ? "Parsed" : "Pending", 
      action: user?.resume ? null : "Upload Resume",
      path: "/setup-profile"
    },
    { 
      item: "Core Skill Tags", 
      status: userSkills.length > 0 ? `Added (${userSkills.length})` : "Pending", 
      action: userSkills.length > 0 ? null : "Add Skills",
      path: "/profile"
    },
    { 
      item: "Project & Code Repository Links", 
      status: userProjects.length > 0 ? `Added (${userProjects.length})` : "Pending", 
      action: userProjects.length > 0 ? null : "Add Projects",
      path: "/profile"
    },
  ];

  // Clean, minimal checklists
  const resumeRules = [
    { rule: "ATS Friendly Layout", desc: "Single-column format, standard system fonts, no tables or text boxes." },
    { rule: "Action-Oriented Verbs", desc: "Start bullet points with verbs like Led, Architected, Reduced, Built." },
    { rule: "Quantifiable Impact", desc: "Include percentages and metrics (e.g. 'Improved performance by 30%')." },
    { rule: "1-Page Standard", desc: "Keep experience brief, focusing strictly on core achievements." }
  ];

  const interviewMilestones = [
    { title: "Behavioral Alignment", desc: "Draft STAR stories (Situation, Task, Action, Result) for conflict resolution and key successes." },
    { title: "Technical Dry-runs", desc: "Review core coding structures, algorithms, and practice dry-running solutions out loud." },
    { title: "System Architecture", desc: "Master caching, database scaling, API gateways, and design patterns for scaling." }
  ];

  return (
    <div className="min-h-screen bg-[#fafafa] text-slate-800 font-sans selection:bg-indigo-50 selection:text-indigo-900">
      <CandidateHeader />

      <main className="max-w-4xl mx-auto px-6 pt-36 pb-24 space-y-16">
        
        {/* Title / Minimal Header */}
        <div className="space-y-3 border-b border-slate-100 pb-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Career Compass</h1>
          <p className="text-sm text-slate-400 font-medium">A minimal framework to optimize your profile, resume, and interview readiness.</p>
        </div>

        {/* Section 1: Profile Completeness Checklist */}
        <div className="space-y-6">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">01 / Profile Optimization</h2>
          <div className="bg-white border border-slate-200/60 rounded-2xl overflow-hidden divide-y divide-slate-100 shadow-sm">
            {profileChecklist.map((step, idx) => (
              <div key={idx} className="flex items-center justify-between p-5 text-sm">
                <div className="flex items-center space-x-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                    step.status !== 'Pending' 
                      ? 'bg-slate-950 text-white' 
                      : 'border-2 border-slate-200 text-transparent'
                  }`}>
                    <Check size={12} strokeWidth={3} />
                  </div>
                  <span className="font-semibold text-slate-800">{step.item}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`text-xs font-bold ${
                    step.status === 'Pending' ? 'text-amber-600 bg-amber-50' : 'text-slate-500 bg-slate-100'
                  } px-2.5 py-0.5 rounded-full`}>
                    {step.status}
                  </span>
                  {step.action && (
                    <button 
                      onClick={() => navigate(step.path)}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-850 flex items-center gap-0.5 cursor-pointer"
                    >
                      {step.action} <ArrowUpRight size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: Resume and Interview Guidelines */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Resume Rules */}
          <div className="space-y-6">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">02 / Resume Rules</h2>
            <div className="space-y-5">
              {resumeRules.map((rule, idx) => (
                <div key={idx} className="space-y-1">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-slate-900 rounded-full"></span>
                    {rule.rule}
                  </h3>
                  <p className="text-xs text-slate-400 font-medium leading-relaxed pl-3.5">{rule.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Interview Stages */}
          <div className="space-y-6">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">03 / Interview Benchmarks</h2>
            <div className="space-y-5">
              {interviewMilestones.map((milestone, idx) => (
                <div key={idx} className="space-y-1">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <span className="w-4 h-4 rounded bg-slate-100 text-slate-600 flex items-center justify-center text-[10px] font-bold">{idx + 1}</span>
                    {milestone.title}
                  </h3>
                  <p className="text-xs text-slate-400 font-medium leading-relaxed pl-6">{milestone.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Section 3: Downloads & Resource Links */}
        <div className="pt-6 border-t border-slate-100 space-y-6">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">04 / Downloads & Actions</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="flex items-center justify-between p-4 bg-white border border-slate-200/60 hover:border-slate-300 rounded-xl transition-all text-left group">
              <div className="min-w-0">
                <span className="text-xs font-bold text-slate-800 block truncate">Modern Tech Resume Template</span>
                <span className="text-[10px] text-slate-400 font-medium">Word Format</span>
              </div>
              <Download className="text-slate-400 group-hover:text-slate-800 transition-colors shrink-0 ml-4" size={16} />
            </button>

            <button className="flex items-center justify-between p-4 bg-white border border-slate-200/60 hover:border-slate-300 rounded-xl transition-all text-left group">
              <div className="min-w-0">
                <span className="text-xs font-bold text-slate-800 block truncate">Interview Prep Cheatsheet</span>
                <span className="text-[10px] text-slate-400 font-medium">PDF Document</span>
              </div>
              <Download className="text-slate-400 group-hover:text-slate-800 transition-colors shrink-0 ml-4" size={16} />
            </button>

            <button 
              onClick={() => navigate('/setup-profile')}
              className="flex items-center justify-between p-4 bg-slate-900 hover:bg-slate-950 text-white rounded-xl transition-all text-left group cursor-pointer"
            >
              <div className="min-w-0">
                <span className="text-xs font-bold block truncate text-slate-100">Upload & Parse Resume</span>
                <span className="text-[10px] text-slate-400 font-medium">Auto-fill profile</span>
              </div>
              <ArrowUpRight className="text-slate-400 group-hover:text-slate-100 transition-colors shrink-0 ml-4" size={16} />
            </button>
          </div>
        </div>

      </main>

      <footer className="py-12 border-t border-slate-100 text-center bg-white">
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
          JobPortal Career Compass Guide © 2026
        </p>
      </footer>
    </div>
  );
};

export default CareerGuide;

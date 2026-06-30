import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  User, Mail, Phone, MapPin, Briefcase, GraduationCap, 
  Edit3, Plus, Trash2, Globe, Github, Linkedin, 
  ExternalLink, Download, Loader2, Save, X, Camera,
  Award, FileCode, CheckCircle2, ChevronRight, Clock,
  BadgeIndianRupee, Upload, TrendingUp, Building2, FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast } from 'sonner';
import { setUser } from '../../redux/authSlice';
import { CANDIDATE_API_END_POINT, ADMIN_API_END_POINT } from '../../utils/constant';
import CandidateHeader from './CandidateHeader';

const CandidateProfile = () => {
  const { user } = useSelector(store => store.auth);
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);
  const resumeInputRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('experience');
  
  // UI States
  const [isEditingBasic, setIsEditingBasic] = useState(false);
  const [showExpModal, setShowExpModal] = useState(false);
  const [showEduModal, setShowEduModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showCertModal, setShowCertModal] = useState(false);

  // Suggestion States
  const [compSuggestions, setCompSuggestions] = useState([]);
  const [uniSuggestions, setUniSuggestions] = useState([]);
  const [roleSuggestions, setRoleSuggestions] = useState([]);
  const [skillSuggestions, setSkillSuggestions] = useState([]);
  const [showSuggs, setShowSuggs] = useState(null);

  // Form States
  const [basicInfo, setBasicInfo] = useState({
    fullName: '', email: '', phoneNumber: '', headline: '', bio: '',
    currentLocation: '', noticePeriod: '', currentSalary: '', expectedSalary: '',
    linkedin: '', github: '', portfolio: ''
  });

  const [experience, setExperience] = useState({ 
    company: '', role: '', fromMonth: 'January', fromYear: '2024', 
    toMonth: 'December', toYear: '2024', isCurrent: false, description: '' 
  });
  const [education, setEducation] = useState({ school: '', degree: '', field: '', year: '2024' });
  const [project, setProject] = useState({ title: '', description: '', link: '', duration: '', skills: '' });
  const [certification, setCert] = useState({ name: '', organization: '', year: '2024', link: '' });
  const [newSkill, setNewSkill] = useState("");

  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const years = Array.from({ length: 40 }, (_, i) => new Date().getFullYear() - i);

  useEffect(() => {
    if (user) {
      setBasicInfo({
        fullName: user.fullName || '', email: user.email || '', phoneNumber: user.phoneNumber || '',
        headline: user.headline || '', bio: user.bio || '', currentLocation: user.currentLocation || '',
        noticePeriod: user.noticePeriod || '', currentSalary: user.currentSalary || '',
        expectedSalary: user.expectedSalary || '', linkedin: user.socialLinks?.linkedin || '',
        github: user.socialLinks?.github || '', portfolio: user.socialLinks?.portfolio || ''
      });
    }
  }, [user]);

  // 🟢 Updated Suggestion Logic (Using 'jobtitle' for roles as requested)
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (showSuggs === 'comp' && experience.company.length > 1) {
        try {
          const res = await axios.get(`https://autocomplete.clearbit.com/v1/companies/suggest?query=${experience.company}`);
          setCompSuggestions(res.data);
        } catch (e) {}
      } else if (showSuggs === 'uni' && education.school.length > 1) {
        try {
          const res = await axios.get(`http://universities.hipolabs.com/search?name=${education.school}`);
          setUniSuggestions(res.data.slice(0, 8));
        } catch (e) {}
      } else if (showSuggs === 'role' && experience.role.length > 1) {
        try {
          // Changed type from 'designation' to 'jobtitle' to match setup page
          const res = await axios.get(`${ADMIN_API_END_POINT}/suggestions?type=jobtitle&query=${experience.role}`);
          if (res.data.success) setRoleSuggestions(res.data.suggestions);
        } catch (e) {}
      } else if (showSuggs === 'headline' && basicInfo.headline.length > 1) {
        try {
          const res = await axios.get(`${ADMIN_API_END_POINT}/suggestions?type=jobtitle&query=${basicInfo.headline}`);
          if (res.data.success) setRoleSuggestions(res.data.suggestions);
        } catch (e) {}
      } else if (showSuggs === 'skill' && newSkill.length > 1) {
        try {
          const res = await axios.get(`${ADMIN_API_END_POINT}/suggestions?type=skill&query=${newSkill}`);
          if (res.data.success) setSkillSuggestions(res.data.suggestions);
        } catch (e) {}
      }
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [experience.company, experience.role, education.school, newSkill, basicInfo.headline, showSuggs]);

  const updateProfile = async (updateData) => {
    try {
      setLoading(true);
      const res = await axios.put(`${CANDIDATE_API_END_POINT}/update-profile`, updateData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true
      });
      if (res.data.success) {
        dispatch(setUser(res.data.candidate));
        toast.success(res.data.message);
        return true;
      }
    } catch (error) { toast.error("Update failed"); }
    finally { setLoading(false); }
    return false;
  };

  const handleBasicSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.keys(basicInfo).forEach(key => {
        if (!['linkedin', 'github', 'portfolio'].includes(key)) formData.append(key, basicInfo[key]);
    });
    formData.append('socialLinks', JSON.stringify({ linkedin: basicInfo.linkedin, github: basicInfo.github, portfolio: basicInfo.portfolio }));
    if (await updateProfile(formData)) setIsEditingBasic(false);
  };

  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append(type, file);
    await updateProfile(formData);
  };

  const handleAddArrayItem = async (field, item, setModal) => {
    const currentItems = Array.isArray(user[field]) ? user[field] : JSON.parse(user[field] || '[]');
    const formData = new FormData();
    formData.append(field, JSON.stringify([...currentItems, item]));
    if (await updateProfile(formData)) setModal(false);
  };

  const handleDeleteArrayItem = async (field, index) => {
    const currentItems = Array.isArray(user[field]) ? user[field] : JSON.parse(user[field] || '[]');
    const newItems = currentItems.filter((_, i) => i !== index);
    const formData = new FormData();
    formData.append(field, JSON.stringify(newItems));
    await updateProfile(formData);
  };

  const handleAddSkill = async (skillName) => {
    const skillToAdd = skillName || newSkill;
    if (!skillToAdd.trim()) return;
    const currentSkills = Array.isArray(user.skills) ? user.skills : JSON.parse(user.skills || '[]');
    if (currentSkills.some(s => (typeof s === 'string' ? s : s.name) === skillToAdd.trim())) return toast.error("Skill already exists");
    const formData = new FormData();
    formData.append('skills', JSON.stringify([...currentSkills, skillToAdd.trim()]));
    if (await updateProfile(formData)) { setNewSkill(""); setShowSuggs(null); }
  };

  const SuggsList = ({ items, onSelect, type }) => (
    <AnimatePresence>
        {items.length > 0 && showSuggs === type && (
            <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute z-[120] w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden max-h-48 overflow-y-auto">
                {items.map((item, i) => (
                    <button key={i} onClick={() => { onSelect(typeof item === 'string' ? item : item.name); setShowSuggs(null); }} className="w-full px-4 py-3 text-left text-sm font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors border-b border-slate-50 last:border-0 flex items-center gap-2">
                        {item.logo && <img src={item.logo} className="w-5 h-5 rounded shadow-sm" />}
                        {typeof item === 'string' ? item : item.name}
                    </button>
                ))}
            </motion.div>
        )}
    </AnimatePresence>
  );

  return (
    <div className="min-h-screen bg-[#f4f7fe]">
      <CandidateHeader />

      <main className="container mx-auto px-4 pt-28 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-700 relative">
                    <button onClick={() => setIsEditingBasic(true)} className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all backdrop-blur-md">
                        <Edit3 size={18} />
                    </button>
                </div>
                <div className="px-6 pb-8 -mt-16 text-center">
                    <div className="relative inline-block group">
                        <div className="w-32 h-32 rounded-2xl bg-slate-100 border-4 border-white shadow-xl overflow-hidden">
                            {user?.profilePhoto ? <img src={user.profilePhoto} className="w-full h-full object-cover" /> : <User size={48} className="m-auto mt-10 text-slate-300" />}
                        </div>
                        <button onClick={() => fileInputRef.current.click()} className="absolute bottom-2 right-2 p-2 bg-blue-600 text-white rounded-xl shadow-lg border-2 border-white transform hover:scale-110 transition-all opacity-0 group-hover:opacity-100"><Camera size={16} /></button>
                        <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={(e) => handleFileUpload(e, 'profilePhoto')} />
                    </div>
                    <div className="mt-4 space-y-1">
                        <h1 className="text-2xl font-black text-slate-900 leading-tight">{user?.fullName}</h1>
                        <p className="text-sm font-bold text-blue-600 uppercase tracking-widest">{user?.headline || 'Add Headline'}</p>
                    </div>
                    <div className="mt-8 p-6 bg-slate-900 rounded-2xl text-white relative overflow-hidden">
                        <div className="relative z-10">
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Profile Strength</span>
                                <span className="text-lg font-black text-indigo-400">{user?.profileCompletion || 0}%</span>
                            </div>
                            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-500 rounded-full transition-all duration-500" style={{ width: `${user?.profileCompletion || 0}%` }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2"><Globe size={18} className="text-blue-600" /> Web Presence</h3>
                <div className="space-y-4 text-left">
                   <SocialItem icon={<Linkedin size={18}/>} label="LinkedIn" value={user?.socialLinks?.linkedin} color="text-blue-600" />
                   <SocialItem icon={<Github size={18}/>} label="GitHub" value={user?.socialLinks?.github} color="text-slate-900" />
                </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
               <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-left">
                  <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><Clock size={12}/> Notice Period</p>
                      <p className="text-sm font-black text-slate-800">{user?.noticePeriod || 'Not Set'}</p>
                  </div>
                  <div className="space-y-1 border-x-0 sm:border-x border-slate-100 px-0 sm:px-8">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><BadgeIndianRupee size={12}/> Salary (LPA)</p>
                      <p className="text-sm font-black text-slate-800">{user?.currentSalary || '0'} / {user?.expectedSalary || '0'}</p>
                  </div>
                  <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><TrendingUp size={12}/> Location</p>
                      <p className="text-sm font-black text-blue-600">{user?.currentLocation || 'Not Set'}</p>
                  </div>
               </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm min-h-[600px] flex flex-col overflow-hidden text-left">
                <div className="px-8 border-b border-slate-100 flex gap-8 overflow-x-auto no-scrollbar">
                    {['experience', 'education', 'projects', 'certifications', 'skills'].map((tab) => (
                        <button key={tab} onClick={() => setActiveTab(tab)} className={`py-6 text-xs font-black uppercase tracking-widest transition-all relative whitespace-nowrap ${activeTab === tab ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}>
                            {tab}
                            {activeTab === tab && <motion.div layoutId="tabUnderline" className="absolute bottom-0 left-0 w-full h-1 bg-blue-600 rounded-full" />}
                        </button>
                    ))}
                </div>

                <div className="p-8 flex-1">
                    <AnimatePresence mode="wait">
                        {activeTab === 'experience' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-lg font-black text-slate-800 tracking-tight">Work Experience</h2>
                                    <button onClick={() => setShowExpModal(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-xs font-bold hover:bg-blue-600 hover:text-white transition-all"><Plus size={16}/> Add New</button>
                                </div>
                                <div className="space-y-4">
                                    {(Array.isArray(user?.experienceData) ? user.experienceData : JSON.parse(user?.experienceData || '[]')).map((exp, i) => (
                                        <div key={i} className="group p-6 bg-slate-50 border border-slate-100 rounded-2xl flex items-start justify-between hover:bg-white hover:border-blue-100 transition-all shadow-sm">
                                            <div className="flex gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-slate-400 border border-slate-100 shadow-sm"><Building2 size={24}/></div>
                                                <div>
                                                    <h3 className="font-black text-slate-900">{exp.role}</h3>
                                                    <p className="text-sm font-bold text-blue-600">{exp.company}</p>
                                                    <p className="text-xs text-slate-400 mt-1 font-medium">{exp.fromMonth} {exp.fromYear} - {exp.isCurrent ? 'Present' : `${exp.toMonth} ${exp.toYear}`}</p>
                                                    <p className="text-xs text-slate-500 mt-4 leading-relaxed font-medium">{exp.description}</p>
                                                </div>
                                            </div>
                                            <button onClick={() => handleDeleteArrayItem('experienceData', i)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"><Trash2 size={16}/></button>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'education' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-lg font-black text-slate-800 tracking-tight">Academic Profile</h2>
                                    <button onClick={() => setShowEduModal(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-xs font-bold"><Plus size={16}/> Add Education</button>
                                </div>
                                <div className="space-y-4">
                                    {(Array.isArray(user?.educationData) ? user.educationData : JSON.parse(user?.educationData || '[]')).map((edu, i) => (
                                        <div key={i} className="group p-6 bg-slate-50 border border-slate-100 rounded-2xl flex items-start justify-between hover:bg-white hover:border-blue-100 transition-all shadow-sm">
                                            <div className="flex gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-slate-400 border border-slate-100 shadow-sm"><GraduationCap size={24}/></div>
                                                <div>
                                                    <h3 className="font-black text-slate-900">{edu.degree}</h3>
                                                    <p className="text-sm font-bold text-blue-600">{edu.school}</p>
                                                    <p className="text-xs text-slate-400 mt-1 font-medium">{edu.field} &bull; Batch {edu.year}</p>
                                                </div>
                                            </div>
                                            <button onClick={() => handleDeleteArrayItem('educationData', i)} className="p-2 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100"><Trash2 size={16}/></button>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'projects' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-lg font-black text-slate-800 tracking-tight">Projects</h2>
                                    <button onClick={() => setShowProjectModal(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-xs font-bold"><Plus size={16}/> Add Project</button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {(Array.isArray(user?.projectsData) ? user.projectsData : JSON.parse(user?.projectsData || '[]')).map((proj, i) => (
                                        <div key={i} className="group p-6 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-white hover:border-indigo-100 transition-all shadow-sm relative">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600"><FileCode size={20}/></div>
                                                <button onClick={() => handleDeleteArrayItem('projectsData', i)} className="p-2 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16}/></button>
                                            </div>
                                            <h3 className="font-black text-slate-900">{proj.title}</h3>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">{proj.duration}</p>
                                            <p className="text-xs text-slate-500 mt-4 leading-relaxed font-medium line-clamp-3">{proj.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'skills' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                                <div className="flex gap-4 relative">
                                    <div className="flex-1">
                                        <input 
                                            type="text" placeholder="Type a skill..."
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-6 py-4 text-sm outline-none focus:border-blue-600 transition-all font-bold"
                                            value={newSkill}
                                            onChange={(e) => { setNewSkill(e.target.value); setShowSuggs('skill'); }}
                                            onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                                        />
                                        <SuggsList items={skillSuggestions} type="skill" onSelect={(val) => handleAddSkill(val)} />
                                    </div>
                                    <button onClick={() => handleAddSkill()} className="px-8 py-4 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-blue-600 h-[56px]">Add Skill</button>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    {(Array.isArray(user?.skills) ? user.skills : JSON.parse(user?.skills || '[]')).map((skill, i) => (
                                        <div key={i} className="group flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl hover:border-blue-500 shadow-sm transition-all">
                                            <CheckCircle2 size={14} className="text-blue-500" />
                                            <span className="text-xs font-bold text-slate-700">{typeof skill === 'object' ? skill.name : skill}</span>
                                            <button onClick={() => handleDeleteArrayItem('skills', i)} className="ml-2 p-1 text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"><X size={12}/></button>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-indigo-400"><FileText size={20}/></div>
                        <p className="text-xs font-bold text-slate-700">{user?.resume ? "Resume Active" : "No Resume"}</p>
                    </div>
                    <div className="flex gap-2">
                        {user?.resume && <a href={user.resume} target="_blank" className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold">View</a>}
                        <button onClick={() => resumeInputRef.current.click()} className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold">Update Resume</button>
                        <input type="file" ref={resumeInputRef} hidden accept=".pdf" onChange={(e) => handleFileUpload(e, 'resume')} />
                    </div>
                </div>
            </div>
          </div>
        </div>
      </main>

      {/* MODALS */}
      <AnimatePresence>
        {/* Experience Modal */}
        {showExpModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowExpModal(false)} className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" />
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white w-full max-w-xl rounded-2xl shadow-2xl relative z-10 p-8 space-y-6 max-h-[90vh] overflow-y-auto">
                    <h2 className="text-lg font-black text-slate-800 uppercase text-left">Add Experience</h2>
                    <div className="space-y-4 text-left">
                        <div className="relative">
                            <Input label="Company Name" value={experience.company} onChange={(e) => { setExperience({...experience, company: e.target.value}); setShowSuggs('comp'); }} />
                            <SuggsList items={compSuggestions} type="comp" onSelect={(val) => setExperience({...experience, company: val})} />
                        </div>
                        <div className="relative">
                            <Input label="Your Role" value={experience.role} onChange={(e) => { setExperience({...experience, role: e.target.value}); setShowSuggs('role'); }} />
                            <SuggsList items={roleSuggestions} type="role" onSelect={(val) => setExperience({...experience, role: val})} />
                        </div>
                        <div className="flex items-center gap-2 px-1">
                            <input type="checkbox" id="isCurrent" checked={experience.isCurrent} onChange={(e) => setExperience({...experience, isCurrent: e.target.checked})} className="rounded accent-blue-600" />
                            <label htmlFor="isCurrent" className="text-xs font-bold text-slate-500 uppercase">I currently work here</label>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Start Date</label>
                                <div className="flex gap-2">
                                    <select value={experience.fromMonth} onChange={(e) => setExperience({...experience, fromMonth: e.target.value})} className="flex-1 p-3 bg-slate-50 rounded-xl text-xs font-bold outline-none border border-slate-100">{months.map(m => <option key={m} value={m}>{m}</option>)}</select>
                                    <select value={experience.fromYear} onChange={(e) => setExperience({...experience, fromYear: e.target.value})} className="flex-1 p-3 bg-slate-50 rounded-xl text-xs font-bold outline-none border border-slate-100">{years.map(y => <option key={y} value={y}>{y}</option>)}</select>
                                </div>
                            </div>
                            {!experience.isCurrent && (
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">End Date</label>
                                    <div className="flex gap-2">
                                        <select value={experience.toMonth} onChange={(e) => setExperience({...experience, toMonth: e.target.value})} className="flex-1 p-3 bg-slate-50 rounded-xl text-xs font-bold outline-none border border-slate-100">{months.map(m => <option key={m} value={m}>{m}</option>)}</select>
                                        <select value={experience.toYear} onChange={(e) => setExperience({...experience, toYear: e.target.value})} className="flex-1 p-3 bg-slate-50 rounded-xl text-xs font-bold outline-none border border-slate-100">{years.map(y => <option key={y} value={y}>{y}</option>)}</select>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Description</label>
                            <textarea value={experience.description} onChange={(e) => setExperience({...experience, description: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:bg-white text-sm font-medium" rows={3} />
                        </div>
                    </div>
                    <button onClick={() => handleAddArrayItem('experienceData', experience, setShowExpModal)} className="w-full py-3 bg-blue-600 text-white rounded-xl text-xs font-bold uppercase shadow-lg transition-all active:scale-95">Save Experience</button>
                </motion.div>
            </div>
        )}

        {/* Education Modal */}
        {showEduModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowEduModal(false)} className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" />
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white w-full max-w-lg rounded-2xl shadow-2xl relative z-10 p-8 space-y-6">
                    <h2 className="text-lg font-black text-slate-800 uppercase text-left">Academic Info</h2>
                    <div className="space-y-4 text-left">
                        <div className="relative">
                            <Input label="University / School" value={education.school} onChange={(e) => { setEducation({...education, school: e.target.value}); setShowSuggs('uni'); }} />
                            <SuggsList items={uniSuggestions} type="uni" onSelect={(val) => setEducation({...education, school: val})} />
                        </div>
                        <Input label="Degree" value={education.degree} onChange={(e) => setEducation({...education, degree: e.target.value})} placeholder="e.g. B.Tech" />
                        <Input label="Field of Study" value={education.field} onChange={(e) => setEducation({...education, field: e.target.value})} placeholder="e.g. Computer Science" />
                        <Input label="Completion Year" value={education.year} onChange={(e) => setEducation({...education, year: e.target.value})} />
                    </div>
                    <button onClick={() => handleAddArrayItem('educationData', education, setShowEduModal)} className="w-full py-3 bg-emerald-600 text-white rounded-xl text-xs font-bold uppercase shadow-lg shadow-emerald-200 transition-all active:scale-95">Save Education</button>
                </motion.div>
            </div>
        )}

        {/* Basic Edit Modal */}
        {isEditingBasic && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => setIsEditingBasic(false)} className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" />
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl relative z-10 overflow-hidden my-auto">
                    <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                        <h2 className="text-xl font-black text-slate-800 tracking-tight uppercase">Essentials</h2>
                        <button onClick={() => setIsEditingBasic(false)} className="w-8 h-8 rounded-full flex items-center justify-center bg-white border border-slate-200 text-slate-400 hover:text-slate-800">✕</button>
                    </div>
                    <form onSubmit={handleBasicSubmit} className="p-8 space-y-6 text-left">
                        <div className="grid grid-cols-2 gap-4">
                            <Input label="Full Name" value={basicInfo.fullName} onChange={(e) => setBasicInfo({...basicInfo, fullName: e.target.value})} />
                            <div className="relative">
                                <Input label="Headline" value={basicInfo.headline} onChange={(e) => { setBasicInfo({...basicInfo, headline: e.target.value}); setShowSuggs('headline'); }} />
                                <SuggsList items={roleSuggestions} type="headline" onSelect={(val) => setBasicInfo({...basicInfo, headline: val})} />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Professional Bio</label>
                            <textarea value={basicInfo.bio} onChange={(e) => setBasicInfo({...basicInfo, bio: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:bg-white text-sm font-medium" rows={3} />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <Input label="Location" value={basicInfo.currentLocation} onChange={(e) => setBasicInfo({...basicInfo, currentLocation: e.target.value})} />
                            <Input label="Cur. Salary (LPA)" value={basicInfo.currentSalary} onChange={(e) => setBasicInfo({...basicInfo, currentSalary: e.target.value})} />
                            <Input label="Exp. Salary (LPA)" value={basicInfo.expectedSalary} onChange={(e) => setBasicInfo({...basicInfo, expectedSalary: e.target.value})} />
                        </div>
                        <button type="submit" disabled={loading} className="w-full py-4 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase shadow-xl flex items-center justify-center gap-2">
                           {loading ? <Loader2 size={16} className="animate-spin"/> : <><Save size={16}/> Update Essentials</>}
                        </button>
                    </form>
                </motion.div>
            </div>
        )}

        {/* Project Modal */}
        {showProjectModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowProjectModal(false)} className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" />
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white w-full max-w-lg rounded-2xl shadow-2xl relative z-10 p-8 space-y-6">
                    <h2 className="text-lg font-black text-slate-800 uppercase text-left">List Project</h2>
                    <div className="space-y-4 text-left">
                        <Input label="Project Title" value={project.title} onChange={(e) => setProject({...project, title: e.target.value})} />
                        <Input label="Duration (e.g. 3 Months)" value={project.duration} onChange={(e) => setProject({...project, duration: e.target.value})} />
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Description</label>
                            <textarea value={project.description} onChange={(e) => setProject({...project, description: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:bg-white text-sm font-medium" rows={4} />
                        </div>
                    </div>
                    <button onClick={() => handleAddArrayItem('projectsData', project, setShowProjectModal)} className="w-full py-3 bg-indigo-600 text-white rounded-xl text-xs font-bold uppercase shadow-lg transition-all active:scale-95">Save Project</button>
                </motion.div>
            </div>
        )}

        {/* Certification Modal */}
        {showCertModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCertModal(false)} className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" />
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white w-full max-w-lg rounded-2xl shadow-2xl relative z-10 p-8 space-y-6">
                    <h2 className="text-lg font-black text-slate-800 uppercase text-left">Certification</h2>
                    <div className="space-y-4 text-left">
                        <Input label="Name" value={certification.name} onChange={(e) => setCert({...certification, name: e.target.value})} />
                        <Input label="Organization" value={certification.organization} onChange={(e) => setCert({...certification, organization: e.target.value})} />
                        <Input label="Year" value={certification.year} onChange={(e) => setCert({...certification, year: e.target.value})} />
                    </div>
                    <button onClick={() => handleAddArrayItem('certificationsData', certification, setShowCertModal)} className="w-full py-3 bg-amber-500 text-white rounded-xl text-xs font-bold uppercase shadow-lg transition-all active:scale-95">Add Certificate</button>
                </motion.div>
            </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const SocialItem = ({ icon, label, value, color }) => (
    <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl group hover:border-blue-200 transition-all">
        <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg bg-white border border-slate-100 flex items-center justify-center ${color} shadow-sm`}>{icon}</div>
            <div className="text-left">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">{label}</p>
                <p className="text-xs font-bold text-slate-700 mt-1 truncate max-w-[120px]">{value || 'Not set'}</p>
            </div>
        </div>
        {value ? <a href={value.startsWith('http') ? value : `https://${value}`} target="_blank" rel="noreferrer" className="p-2 text-slate-300 hover:text-blue-600"><ExternalLink size={14}/></a> : <span className="text-[10px] font-bold text-blue-600 cursor-pointer hover:underline">Link</span>}
    </div>
);

const Input = ({ label, value, onChange, placeholder, type = "text" }) => (
    <div className="space-y-1 text-left">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{label}</label>
        <input type={type} value={value} onChange={onChange} placeholder={placeholder} className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-800 outline-none focus:bg-white focus:border-blue-500 transition-all" />
    </div>
);

export default CandidateProfile;

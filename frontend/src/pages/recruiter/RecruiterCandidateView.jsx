import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { 
    Mail, Phone, MapPin, Briefcase, GraduationCap, 
    Download, ArrowLeft, ShieldCheck, Clock, Calendar,
    Globe, Github, Linkedin, ExternalLink, Zap, Award,
    CheckCircle2, FileText, ChevronRight, UserCircle, Loader2,
    MessageSquare, Send, PhoneCall
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { COMPANY_API_END_POINT } from '../../utils/constant';
import { toast } from 'sonner';

const RecruiterCandidateView = () => {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [candidate, setCandidate] = useState(null);
    const [loading, setLoading] = useState(true);
    const [unlocking, setUnlocking] = useState(false);

    const mode = searchParams.get('mode');

    const fetchCandidate = async () => {
        try {
            setLoading(true);
            const endpoint = mode === 'applicant' 
                ? `${COMPANY_API_END_POINT}/applicant/${id}` 
                : `${COMPANY_API_END_POINT}/candidate/${id}`;
                
            const res = await axios.get(endpoint, { withCredentials: true });
            if (res.data.success) setCandidate(res.data.candidate);
        } catch (error) {
            toast.error(error.response?.data?.message || "Profile not found.");
            navigate(-1);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchCandidate(); }, [id]);

    const handleUnlock = async () => {
        try {
            setUnlocking(true);
            const res = await axios.post(`${COMPANY_API_END_POINT}/unlock-candidate`, { candidateId: id }, { withCredentials: true });
            if (res.data.success) {
                toast.success("Profile Unlocked Successfully");
                fetchCandidate();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Unlock failed");
        } finally {
            setUnlocking(false);
        }
    };

    if (loading || !candidate) return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-4">
            <Loader2 className="animate-spin text-indigo-500" size={32} />
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Generating Preview...</p>
        </div>
    );

    const isUnlocked = candidate.isUnlocked;

    return (
        <div className="max-w-5xl mx-auto pb-20 font-sans selection:bg-indigo-100">
            
            {/* Minimal Navigation */}
            <div className="flex items-center justify-between mb-6 px-2">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-slate-800 transition-all font-semibold text-xs uppercase tracking-wide">
                    <ArrowLeft size={16} /> Back to list
                </button>
                <div className="flex items-center gap-3">
                    {!isUnlocked ? (
                        <button 
                            onClick={handleUnlock}
                            disabled={unlocking}
                            className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold shadow-sm hover:bg-indigo-700 transition-all flex items-center gap-2"
                        >
                            {unlocking ? <Loader2 className="animate-spin" size={14}/> : <Zap size={14} fill="currentColor"/>}
                            Unlock Full Profile
                        </button>
                    ) : (
                        <div className="flex items-center gap-2">
                            <span className="px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-bold uppercase border border-emerald-100 flex items-center gap-1.5">
                                <ShieldCheck size={14}/> Unlocked
                            </span>
                            <a 
                                href={candidate.resume} 
                                target="_blank"
                                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-all flex items-center gap-2"
                            >
                                <Download size={14}/> Download CV
                            </a>
                        </div>
                    )}
                </div>
            </div>

            {/* CV Container */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row">
                
                {/* CV Sidebar (Left) */}
                <div className="w-full md:w-80 bg-slate-50/50 border-r border-slate-100 p-8 flex flex-col gap-8">
                    <div className="text-center">
                        <div className="w-32 h-32 mx-auto bg-white rounded-2xl overflow-hidden border-2 border-slate-100 shadow-sm mb-4">
                            <img 
                                src={candidate.profilePhoto || `https://ui-avatars.com/api/?name=${candidate.fullName}&background=f1f5f9&color=6366f1&size=200`} 
                                className={`w-full h-full object-cover ${!isUnlocked && 'blur-sm opacity-60'}`} 
                            />
                        </div>
                        <h1 className="text-lg font-bold text-slate-800 leading-tight">
                            {isUnlocked ? candidate.fullName : candidate.fullName.split(' ')[0] + ' ****'}
                        </h1>
                        <p className="text-xs font-bold text-indigo-500 mt-1 uppercase tracking-wide">{candidate.headline || "Professional"}</p>
                    </div>

                    <div className="space-y-6">
                        <SectionTitle title="Contact Information" />
                        <div className="space-y-4">
                            <ContactAction 
                                icon={<Mail size={14}/>} 
                                label="Email" 
                                value={candidate.email} 
                                isLocked={!isUnlocked} 
                                action={`mailto:${candidate.email}`}
                                color="bg-blue-50 text-blue-500"
                            />
                            <ContactAction 
                                icon={<Phone size={14}/>} 
                                label="Phone" 
                                value={candidate.phoneNumber} 
                                isLocked={!isUnlocked} 
                                action={`tel:${candidate.phoneNumber}`}
                                color="bg-emerald-50 text-emerald-500"
                            />
                            <ContactAction 
                                icon={<MapPin size={14}/>} 
                                label="Location" 
                                value={candidate.currentLocation} 
                                color="bg-slate-100 text-slate-500"
                            />
                        </div>
                    </div>

                    <div className="space-y-6">
                        <SectionTitle title="Quick Stats" />
                        <div className="grid grid-cols-1 gap-3">
                            <StatBadge label="Total Exp" value={`${candidate.experienceYears || 0} Years`} icon={<Briefcase size={12}/>} />
                            <StatBadge label="Notice" value={candidate.noticePeriod} icon={<Clock size={12}/>} />
                            <StatBadge label="Expect CTC" value={`₹${candidate.expectedSalary} LPA`} icon={<Zap size={12}/>} />
                        </div>
                    </div>

                    {isUnlocked && candidate.socialLinks && (
                        <div className="space-y-4">
                            <SectionTitle title="Links" />
                            <div className="flex flex-wrap gap-2">
                                {candidate.socialLinks.linkedin && <SocialIcon icon={<Linkedin size={16}/>} url={candidate.socialLinks.linkedin} color="hover:text-blue-600" />}
                                {candidate.socialLinks.github && <SocialIcon icon={<Github size={16}/>} url={candidate.socialLinks.github} color="hover:text-slate-900" />}
                                {candidate.socialLinks.portfolio && <SocialIcon icon={<Globe size={16}/>} url={candidate.socialLinks.portfolio} color="hover:text-indigo-600" />}
                            </div>
                        </div>
                    )}
                </div>

                {/* CV Main Body (Right) */}
                <div className="flex-1 p-8 md:p-10 space-y-10">
                    
                    {/* About */}
                    <div className="space-y-3">
                        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <UserCircle size={14} className="text-indigo-400"/> Professional Summary
                        </h2>
                        <p className="text-sm text-slate-600 leading-relaxed font-medium">
                            {candidate.bio || "No professional summary provided."}
                        </p>
                    </div>

                    {/* Work Experience */}
                    <div className="space-y-6">
                        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Briefcase size={14} className="text-indigo-400"/> Experience
                        </h2>
                        <div className="space-y-8">
                            {(() => {
                                try {
                                    const exp = typeof candidate.experienceData === 'string' ? JSON.parse(candidate.experienceData) : (candidate.experienceData || []);
                                    return exp.length > 0 ? exp.map((job, i) => (
                                        <div key={i} className="flex gap-4 relative group">
                                            <div className="w-px bg-slate-100 absolute left-[7px] top-6 bottom-[-20px] group-last:hidden"></div>
                                            <div className="w-4 h-4 rounded-full border-2 border-white shadow-sm bg-indigo-500 shrink-0 mt-1 z-10"></div>
                                            <div className="space-y-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <h4 className="text-sm font-bold text-slate-800">{job.role}</h4>
                                                    <span className="text-[10px] font-bold text-slate-400">&bull; {job.startDate} — {job.currentlyWorking ? 'Present' : job.endDate}</span>
                                                </div>
                                                <p className="text-xs font-bold text-indigo-500/80 uppercase tracking-tight">{job.companyName}</p>
                                                <p className="text-xs text-slate-500 leading-relaxed mt-2 font-medium">{job.description}</p>
                                            </div>
                                        </div>
                                    )) : <p className="text-xs text-slate-400 italic">No experience added.</p>;
                                } catch(e) { return null; }
                            })()}
                        </div>
                    </div>

                    {/* Education */}
                    <div className="space-y-6">
                        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <GraduationCap size={14} className="text-indigo-400"/> Education
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {(() => {
                                try {
                                    const edu = typeof candidate.educationData === 'string' ? JSON.parse(candidate.educationData) : (candidate.educationData || []);
                                    return edu.length > 0 ? edu.map((school, i) => (
                                        <div key={i} className="p-4 bg-slate-50/50 rounded-xl border border-slate-100">
                                            <h4 className="text-xs font-bold text-slate-800">{school.degree}</h4>
                                            <p className="text-[11px] font-bold text-indigo-500/70 mt-0.5">{school.fieldOfStudy}</p>
                                            <div className="flex items-center justify-between mt-3 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                                <span>{school.institution}</span>
                                                <span>Class of {school.endYear}</span>
                                            </div>
                                        </div>
                                    )) : <p className="text-xs text-slate-400 italic">No education details.</p>;
                                } catch(e) { return null; }
                            })()}
                        </div>
                    </div>

                    {/* Skills */}
                    <div className="space-y-4">
                        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Award size={14} className="text-indigo-400"/> Key Skills
                        </h2>
                        <div className="flex flex-wrap gap-2">
                            {(() => {
                                try {
                                    const skills = typeof candidate.skills === 'string' ? JSON.parse(candidate.skills) : (candidate.skills || []);
                                    return skills.map((skill, i) => (
                                        <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 text-slate-600 text-[10px] font-bold rounded-lg border border-slate-100">
                                            {typeof skill === 'string' ? skill : skill.name}
                                            <span className="w-1 h-1 bg-indigo-300 rounded-full"></span>
                                            <span className="text-[9px] text-indigo-500 uppercase tracking-tighter">{typeof skill === 'string' ? 'Intermediate' : skill.level}</span>
                                        </div>
                                    ));
                                } catch (e) { return null; }
                            })()}
                        </div>
                    </div>

                    {/* Projects */}
                    {candidate.projects && (
                        <div className="space-y-6">
                            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <FileText size={14} className="text-indigo-400"/> Featured Projects
                            </h2>
                            <div className="grid grid-cols-1 gap-4">
                                {(() => {
                                    try {
                                        const projects = typeof candidate.projects === 'string' ? JSON.parse(candidate.projects) : (candidate.projects || []);
                                        return projects.map((proj, i) => (
                                            <div key={i} className="p-4 bg-white rounded-xl border border-slate-100 hover:border-indigo-100 transition-all flex items-start justify-between">
                                                <div className="space-y-1">
                                                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-tight">{proj.title}</h4>
                                                    <p className="text-[11px] text-slate-500 leading-relaxed max-w-xl font-medium">{proj.description}</p>
                                                </div>
                                                {proj.link && <a href={proj.link} target="_blank" className="p-2 text-slate-300 hover:text-indigo-500 transition-all"><ExternalLink size={14}/></a>}
                                            </div>
                                        ));
                                    } catch(e) { return null; }
                                })()}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const SectionTitle = ({ title }) => (
    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] border-b border-slate-100 pb-2 mb-4">{title}</h3>
);

const ContactAction = ({ icon, label, value, isLocked, action, color }) => (
    <div className="group">
        <div className="flex items-center gap-3">
            <div className={`w-8 h-8 ${color} rounded-lg flex items-center justify-center shrink-0 shadow-sm`}>
                {icon}
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mb-0.5">{label}</p>
                {isLocked ? (
                    <p className="text-xs font-bold text-slate-300 italic">Locked</p>
                ) : (
                    <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-slate-700 truncate">{value || 'N/A'}</p>
                        {action && value && (
                            <a href={action} className="text-indigo-500 hover:text-indigo-700 opacity-0 group-hover:opacity-100 transition-all">
                                <ExternalLink size={12}/>
                            </a>
                        )}
                    </div>
                )}
            </div>
        </div>
    </div>
);

const StatBadge = ({ label, value, icon }) => (
    <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-2">
            <div className="text-slate-400">{icon}</div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{label}</span>
        </div>
        <span className="text-xs font-bold text-slate-700">{value || 'N/A'}</span>
    </div>
);

const SocialIcon = ({ icon, url, color }) => (
    <a href={url} target="_blank" className={`w-8 h-8 flex items-center justify-center bg-white border border-slate-100 rounded-lg text-slate-400 ${color} transition-all shadow-sm`}>
        {icon}
    </a>
);

export default RecruiterCandidateView;

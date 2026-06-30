import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Building2, MapPin, Briefcase, DollarSign, 
  Clock, Share2, Bookmark, CheckCircle2, 
  ArrowLeft, Globe, Users, Star, ShieldCheck,
  Send, AlertCircle, Award
} from 'lucide-react';
import axios from 'axios';
import { JOB_API_END_POINT, APPLICATION_API_END_POINT } from '../../utils/constant';
import { motion, AnimatePresence } from 'framer-motion';
import CandidateHeader from './CandidateHeader';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';

const CandidateJobDescription = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector(store => store.auth);
  
   const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await axios.get(`${JOB_API_END_POINT}/get/${id}`, { withCredentials: true });
        if (res.data.success) {
          setJob(res.data.job);
          // Check if candidate already applied
          // This would ideally come from the backend in the same response or a separate check
          const appliedRes = await axios.get(`${APPLICATION_API_END_POINT}/applied`, { withCredentials: true });
          if (appliedRes.data.success) {
            const alreadyApplied = appliedRes.data.applications.some(app => app.jobId === id);
            setHasApplied(alreadyApplied);
          }
        }
      } catch (error) {
        console.error("Error fetching job:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id]);

  useEffect(() => {
    if (job) {
      const saved = JSON.parse(localStorage.getItem('savedJobs') || '[]');
      setIsSaved(saved.some(savedJob => savedJob.id === job.id));
    }
  }, [job]);

  const toggleSaveJob = () => {
    if (!user) {
      toast.error("Please login to save jobs");
      return navigate("/login");
    }
    const saved = JSON.parse(localStorage.getItem('savedJobs') || '[]');
    if (isSaved) {
      const updated = saved.filter(savedJob => savedJob.id !== job.id);
      localStorage.setItem('savedJobs', JSON.stringify(updated));
      setIsSaved(false);
      toast.success("Job removed from saved list");
    } else {
      saved.push({
        id: job.id,
        title: job.title,
        jobType: job.jobType,
        location: job.location,
        minSalary: job.minSalary,
        maxSalary: job.maxSalary,
        createdAt: job.createdAt,
        Company: job.Company
      });
      localStorage.setItem('savedJobs', JSON.stringify(saved));
      setIsSaved(true);
      toast.success("Job saved successfully!");
    }
  };

  const handleApply = async () => {
    if (!user) {
      toast.error("Please login to apply for jobs");
      return navigate("/login");
    }
    
    if (!user.resume) {
      toast.error("Please upload your resume in profile setup before applying");
      return navigate("/profile");
    }

    try {
      setApplying(true);
      const res = await axios.post(`${APPLICATION_API_END_POINT}/apply`, { jobId: id }, { withCredentials: true });
      if (res.data.success) {
        setHasApplied(true);
        toast.success("Applied successfully!");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Application failed");
    } finally {
      setApplying(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full" />
    </div>
  );

  if (!job) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center text-center p-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Job Not Found</h2>
        <button onClick={() => navigate('/jobs')} className="mt-4 text-blue-600 font-bold hover:underline flex items-center gap-2 justify-center mx-auto">
          <ArrowLeft size={18} /> Back to Jobs
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f4f7fe]">
      <CandidateHeader />
      
      {/* Top Banner */}
      <div className="bg-white border-b border-slate-100 pt-32 pb-12">
        <div className="container mx-auto px-8">
          <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-blue-600 transition-colors">
            <ArrowLeft size={16} /> Back
          </button>
          
          <div className="flex flex-col lg:flex-row items-start justify-between gap-8">
            <div className="flex gap-6 items-start">
              <div className="w-20 h-20 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center shrink-0 shadow-sm overflow-hidden">
                {job.Company?.logo ? (
                  <img src={job.Company.logo} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <Building2 size={40} className="text-slate-200" />
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">{job.title}</h1>
                <div className="flex flex-wrap items-center gap-4 text-sm font-semibold text-slate-500">
                  <span className="flex items-center gap-1.5 text-blue-600 hover:underline cursor-pointer">
                    <Building2 size={16} /> {job.Company?.companyName}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin size={16} className="text-slate-400" /> {Array.isArray(job.location) ? job.location.join(', ') : job.location}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock size={16} className="text-slate-400" /> Posted {new Date(job.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 w-full lg:w-auto">
                <button 
                  onClick={toggleSaveJob}
                  className={`flex-1 lg:flex-none p-3 border rounded-xl transition-all active:scale-90 ${
                    isSaved 
                    ? 'bg-blue-50 text-blue-600 border-blue-200 shadow-inner' 
                    : 'text-slate-400 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                   <Bookmark size={20} fill={isSaved ? "currentColor" : "none"} />
                </button>
               <button className="flex-1 lg:flex-none p-3 border border-slate-200 rounded-xl text-slate-400 hover:bg-slate-50 transition-colors">
                  <Share2 size={20} />
               </button>
               <button 
                onClick={handleApply}
                disabled={hasApplied || applying}
                className={`flex-[3] lg:flex-none px-10 py-3 rounded-xl font-bold text-xs transition-all active:scale-95 ${
                  hasApplied 
                  ? 'bg-emerald-50 text-emerald-650 cursor-not-allowed border border-emerald-100' 
                  : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
                }`}
               >
                 {applying ? 'Applying...' : hasApplied ? 'Applied ✓' : 'Apply Now'}
               </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                 <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
                 Job Description
              </h2>
              <div className="text-slate-600 leading-relaxed font-medium space-y-4 whitespace-pre-line">
                 {job.description}
              </div>
            </section>

            {job.responsibilities && (
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-6">Responsibilities</h2>
                <div className="text-slate-600 leading-relaxed font-medium whitespace-pre-line">
                   {job.responsibilities}
                </div>
              </section>
            )}

            {job.requirements && (
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-6">Requirements</h2>
                <div className="text-slate-600 leading-relaxed font-medium whitespace-pre-line">
                   {job.requirements}
                </div>
              </section>
            )}

            <section>
              <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Award size={18} className="text-indigo-605 text-indigo-600" />
                Required Skills
              </h2>
              <div className="flex flex-wrap gap-2">
                {(Array.isArray(job.skills) ? job.skills : JSON.parse(job.skills || '[]')).map((skill, idx) => {
                  const skillName = typeof skill === 'object' ? (skill.name || skill.label) : skill;
                  
                  // Skill matching check
                  const userSkills = Array.isArray(user?.skills) ? user.skills : JSON.parse(user?.skills || '[]');
                  const isMatched = userSkills.some(us => {
                    const usName = typeof us === 'object' ? us?.name : us;
                    return typeof usName === 'string' && usName.toLowerCase() === skillName.trim().toLowerCase();
                  });

                  return (
                    <span 
                      key={idx} 
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                        isMatched 
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100/50' 
                        : 'bg-white text-slate-500 border-slate-200 hover:border-slate-350'
                      }`}
                    >
                      {skillName}
                    </span>
                  );
                })}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            
            {/* Job Summary Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
               <h3 className="text-lg font-bold text-slate-900 mb-6">Job Summary</h3>
               <div className="space-y-6">
                  {[
                    { label: 'Job Type', value: job.jobType, icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Salary', value: job.minSalary ? `₹${job.minSalary} - ₹${job.maxSalary}` : 'Competitive', icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { label: 'Experience', value: job.experienceLevel, icon: Star, color: 'text-amber-600', bg: 'bg-amber-50' },
                    { label: 'Industry', value: job.industry, icon: Building2, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-4">
                       <div className={`p-2.5 rounded-xl ${item.bg} ${item.color}`}>
                          <item.icon size={18} />
                       </div>
                       <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.label}</p>
                          <p className="text-sm font-bold text-slate-800 capitalize">{item.value}</p>
                       </div>
                    </div>
                  ))}
               </div>
            </div>

            {/* About Company */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
               <h3 className="text-lg font-bold text-slate-900 mb-6">About Company</h3>
               <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center font-bold text-slate-300">
                    {job.Company?.logo ? <img src={job.Company.logo} className="w-full h-full object-cover" /> : job.Company?.companyName[0]}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">{job.Company?.companyName}</h4>
                    <span className="text-xs text-blue-600 font-bold flex items-center gap-1 hover:underline cursor-pointer">
                      View Profile <Globe size={12} />
                    </span>
                  </div>
               </div>
               <p className="text-xs text-slate-500 font-medium leading-relaxed line-clamp-4">
                 {job.Company?.description || "A forward-thinking company looking for talented individuals to join their mission."}
               </p>
               <div className="mt-6 pt-6 border-t border-slate-50 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-400">Team Size</span>
                    <span className="font-bold text-slate-800">50-200 Employees</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-400">Founded In</span>
                    <span className="font-bold text-slate-800">2018</span>
                  </div>
               </div>
            </div>

            {/* Safety Tips */}
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5">
               <div className="flex items-start gap-3">
                  <AlertCircle size={20} className="text-amber-500 shrink-0" />
                  <div>
                    <h4 className="font-bold text-amber-900 text-sm mb-1">Safety Tips</h4>
                    <p className="text-[10px] text-amber-800 font-medium leading-relaxed">
                      Do not pay any money to recruiters. Genuine companies never ask for money for jobs.
                    </p>
                  </div>
               </div>
            </div>

          </div>

        </div>
      </div>

    </div>
  );
};

export default CandidateJobDescription;

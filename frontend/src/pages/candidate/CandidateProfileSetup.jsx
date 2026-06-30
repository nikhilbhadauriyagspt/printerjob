import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Briefcase, GraduationCap, Target,
  Upload, CheckCircle2, ChevronRight, ArrowLeft,
  X, Camera, Sparkles, FileText, Loader2, Search,
  Building2, MapPin, BadgeIndianRupee, Terminal, Plus, School,
  Pencil, Trash2, Phone
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast } from 'sonner';
import { useSelector, useDispatch } from 'react-redux';
import { setUser } from '../../redux/authSlice';
import { CANDIDATE_API_END_POINT, ADMIN_API_END_POINT } from '../../utils/constant';

const CandidateProfileSetup = () => {
  const { user } = useSelector(store => store.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [step, setStep] = useState(user?.isPhoneVerified ? 1 : 0);
  const [loading, setLoading] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [suggestions, setSuggestions] = useState({ skills: [], industries: [], designations: [], jobTitles: [] });
  const [search, setSearch] = useState('');
  const [compSearch, setCompSearch] = useState({ index: null, query: '' });
  const [uniSearch, setUniSearch] = useState({ index: null, query: '' });
  const [roleSearch, setRoleSearch] = useState({ index: null, query: '' });
  const [degSearch, setDegSearch] = useState({ index: null, query: '' });
  const [fieldSearch, setFieldSearch] = useState({ index: null, query: '' });
  const [compSuggestions, setCompSuggestions] = useState([]);
  const [uniSuggestions, setUniSuggestions] = useState([]);
  const [roleSuggestions, setRoleSuggestions] = useState([]);
  const [degSuggestions, setDegSuggestions] = useState([]);
  const [fieldSuggestions, setFieldSuggestions] = useState([]);

  const [activeExpIndex, setActiveExpIndex] = useState(0);
  const [activeEduIndex, setActiveEduIndex] = useState(0);
  const [phoneVerified, setPhoneVerified] = useState(user?.isPhoneVerified || false);
  const [phoneLoading, setPhoneVerifiedLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [tempPhone, setTempPhone] = useState(user?.phoneNumber || '');

  const sendPhoneOtp = async () => {
    if (!tempPhone || tempPhone.length < 10) return toast.error("Valid phone number required");
    setPhoneVerifiedLoading(true);
    try {
      const res = await axios.post(`${CANDIDATE_API_END_POINT}/send-phone-otp`, { phoneNumber: tempPhone }, { withCredentials: true });
      if (res.data.success) {
        setOtpSent(true);
        toast.success(res.data.message);
        // In dev mode we might get the OTP in response
        if (res.data.otp) console.log("Dev OTP:", res.data.otp);
      }
    } catch (e) { toast.error(e.response?.data?.message || "Failed to send OTP"); }
    finally { setPhoneVerifiedLoading(false); }
  };

  const verifyPhoneOtp = async () => {
    if (!otp) return toast.error("Enter OTP");
    setPhoneVerifiedLoading(true);
    try {
      const res = await axios.post(`${CANDIDATE_API_END_POINT}/verify-phone-otp`, { phoneNumber: tempPhone, otp }, { withCredentials: true });
      if (res.data.success) {
        setPhoneVerified(true);
        dispatch(setUser(res.data.candidate));
        toast.success("Phone verified!");
        setStep(1);
      }
    } catch (e) { toast.error(e.response?.data?.message || "Invalid OTP"); }
    finally { setPhoneVerifiedLoading(false); }
  };

  const degrees = [
    "B.Tech (Bachelor of Technology)", "B.E (Bachelor of Engineering)", "M.Tech (Master of Technology)",
    "B.Sc (Bachelor of Science)", "M.Sc (Master of Science)", "BCA (Bachelor of Computer Applications)",
    "MCA (Master of Computer Applications)", "B.Com (Bachelor of Commerce)", "M.Com (Master of Commerce)",
    "BBA (Bachelor of Business Administration)", "MBA (Master of Business Administration)",
    "B.A (Bachelor of Arts)", "M.A (Master of Arts)", "MBBS", "MD", "PhD", "Diploma", "High School (12th)", "Secondary School (10th)"
  ];

  const fieldsOfStudy = [
    "Computer Science", "Information Technology", "Software Engineering", "Data Science", "Artificial Intelligence",
    "Mechanical Engineering", "Electrical Engineering", "Civil Engineering", "Electronics & Communication",
    "Business Administration", "Finance", "Marketing", "Human Resources", "Operations",
    "Commerce", "Accounting", "Economics", "Physics", "Chemistry", "Mathematics", "Biology",
    "Psychology", "Sociology", "Law", "Medicine", "Arts", "Design", "Architecture"
  ];

  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
    bio: user?.bio || '',
    headline: user?.headline || '',
    industry: user?.industry || '',
    designation: user?.designation || '',
    experienceLevel: user?.experienceLevel || 'fresher',
    experienceYears: user?.experienceYears || 0,
    experienceData: Array.isArray(user?.experienceData) && user.experienceData.length > 0
      ? user.experienceData
      : [{ company: '', role: '', fromMonth: '', fromYear: '', toMonth: '', toYear: '', description: '', isCurrent: false }],
    noticePeriod: user?.noticePeriod || '',
    skills: Array.isArray(user?.skills) ? user.skills : [], // Stores {name, level}
    educationData: Array.isArray(user?.educationData) && user.educationData.length > 0
      ? user.educationData
      : [{ degree: '', school: '', field: '', year: '', isCurrent: false }],
    currentSalary: user?.currentSalary || '',
    expectedSalary: user?.expectedSalary || '',
    currentLocation: user?.currentLocation || '',
    preferredLocations: user?.preferredLocations || [],
    relocation: user?.relocation || false,
    jobPreferences: user?.jobPreferences || { preferredRole: '', jobType: 'Full-time', workMode: 'In-office' },
    socialLinks: user?.socialLinks || { linkedin: '', github: '', portfolio: '' },
    profilePhoto: null,
    resume: null,
    resumeText: user?.resumeText || ''
  });

  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

  const [progress, setProgress] = useState(0);
  const [locationSearch, setLocationSearch] = useState('');
  const [locationSuggestions, setLocationSuggestions] = useState([]);

  // Sync user data when it's available in Redux
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: prev.fullName || user.fullName || '',
        email: prev.email || user.email || '',
        phoneNumber: prev.phoneNumber || user.phoneNumber || '',
        headline: prev.headline || user.headline || '',
        bio: prev.bio || user.bio || '',
        industry: prev.industry || user.industry || '',
        designation: prev.designation || user.designation || '',
        experienceLevel: user.experienceLevel || prev.experienceLevel,
        experienceYears: user.experienceYears || prev.experienceYears,
        experienceData: Array.isArray(user.experienceData) && user.experienceData.length > 0 ? user.experienceData : prev.experienceData,
        educationData: Array.isArray(user.educationData) && user.educationData.length > 0 ? user.educationData : prev.educationData,
        skills: Array.isArray(user.skills) ? user.skills : prev.skills,
        socialLinks: user.socialLinks || prev.socialLinks,
        currentLocation: user.currentLocation || prev.currentLocation,
        relocation: user.relocation ?? prev.relocation
      }));
    }
  }, [user]);

  // Company Search API
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (compSearch.query.length > 0) {
        try {
          const res = await axios.get(`https://autocomplete.clearbit.com/v1/companies/suggest?query=${compSearch.query}`);
          setCompSuggestions(res.data);
        } catch (err) { console.error("Clearbit failed"); }
      } else {
        setCompSuggestions([]);
      }
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [compSearch.query]);

  // University Search API
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (uniSearch.query.length > 0) {
        try {
          const res = await axios.get(`http://universities.hipolabs.com/search?name=${uniSearch.query}`);
          setUniSuggestions(res.data.slice(0, 10));
        } catch (err) { console.error("Uni API failed"); }
      } else {
        setUniSuggestions([]);
      }
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [uniSearch.query]);

  // Degree Search
  useEffect(() => {
    if (degSearch.query.length > 0) {
      const filtered = degrees.filter(d => d.toLowerCase().includes(degSearch.query.toLowerCase()));
      setDegSuggestions(filtered.slice(0, 10));
    } else {
      setDegSuggestions([]);
    }
  }, [degSearch.query]);

  // Field of Study Search
  useEffect(() => {
    if (fieldSearch.query.length > 0) {
      const filtered = fieldsOfStudy.filter(f => f.toLowerCase().includes(fieldSearch.query.toLowerCase()));
      setFieldSuggestions(filtered.slice(0, 10));
    } else {
      setFieldSuggestions([]);
    }
  }, [fieldSearch.query]);

  // Role Search (Local from Sugestions)
  useEffect(() => {
    if (roleSearch.query.length > 0) {
      const filtered = suggestions.jobTitles.filter(t => t.toLowerCase().includes(roleSearch.query.toLowerCase()));
      setRoleSuggestions(filtered.slice(0, 10));
    } else {
      setRoleSuggestions([]);
    }
  }, [roleSearch.query, suggestions.jobTitles]);

  // Dynamic Progress Calculation
  useEffect(() => {
    let score = 0;
    if (formData.resume || user?.resume) score += 15;
    if (formData.profilePhoto || user?.profilePhoto) score += 10;
    if (formData.bio) score += 5;
    if (formData.headline) score += 5;
    if (formData.industry && formData.designation) score += 10;
    if (formData.skills?.length >= 3) score += 15;
    if (formData.educationData?.[0]?.degree) score += 10;
    if (formData.experienceLevel === 'experienced' && formData.experienceData?.[0]?.company) score += 10;
    if (formData.experienceLevel === 'fresher') score += 10;
    if (formData.currentLocation) score += 5;
    if (formData.socialLinks?.linkedin) score += 5;
    if (formData.expectedSalary) score += 10;
    setProgress(Math.min(score, 100));
  }, [formData, user]);

  // Location Autocomplete API
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (locationSearch.length > 2) {
        try {
          const res = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${locationSearch}&addressdetails=1&limit=5`);
          setLocationSuggestions(res.data);
        } catch (err) { console.error("Location API failed"); }
      } else {
        setLocationSuggestions([]);
      }
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [locationSearch]);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [s, i, d, jt] = await Promise.all([
          axios.get(`${ADMIN_API_END_POINT}/suggestions?type=skill`),
          axios.get(`${ADMIN_API_END_POINT}/suggestions?type=industry`),
          axios.get(`${ADMIN_API_END_POINT}/suggestions?type=designation`),
          axios.get(`${ADMIN_API_END_POINT}/suggestions?type=jobtitle`)
        ]);
        setSuggestions({
          skills: s.data.suggestions || [],
          industries: i.data.suggestions || [],
          designations: d.data.suggestions || [],
          jobTitles: jt.data.suggestions || []
        });
      } catch (error) { console.error("Suggestions fail"); }
    };
    fetchMetadata();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSocialChange = (e) => {
    setFormData({
      ...formData,
      socialLinks: { ...formData.socialLinks, [e.target.name]: e.target.value }
    });
  };

  const handleEducationChange = (index, field, value) => {
    const newEdu = [...formData.educationData];
    newEdu[index][field] = value;
    setFormData({ ...formData, educationData: newEdu });
  };

  const addEducation = () => {
    setFormData({ ...formData, educationData: [...formData.educationData, { degree: '', school: '', field: '', year: '', isCurrent: false }] });
  };

  const handleExperienceChange = (index, field, value) => {
    const newExp = [...formData.experienceData];
    newExp[index][field] = value;
    setFormData({ ...formData, experienceData: newExp });
  };

  const addExperience = () => {
    setFormData({ 
      ...formData, 
      experienceLevel: 'experienced',
      experienceData: [...formData.experienceData, { company: '', role: '', fromMonth: '', fromYear: '', toMonth: '', toYear: '', description: '', isCurrent: false }] 
    });
  };

  useEffect(() => {
    // If user has added experience data that isn't empty, ensure level is set to 'experienced'
    const hasData = formData.experienceData.some(exp => exp.company.trim() !== '' || exp.role.trim() !== '');
    if (hasData && formData.experienceLevel === 'fresher') {
      setFormData(prev => ({ ...prev, experienceLevel: 'experienced' }));
    }
  }, [formData.experienceData]);

  const handleSkillLevelChange = (skillName, level) => {
    const newSkills = formData.skills.map(s =>
      s.name === skillName ? { ...s, level } : s
    );
    setFormData({ ...formData, skills: newSkills });
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, resume: file });
      setParsing(true);
      const data = new FormData();
      data.append('file', file);
      try {
        const res = await axios.post(`${CANDIDATE_API_END_POINT}/parse-resume`, data);
        if (res.data.success) {
          const p = res.data.data;
          const newSkills = p.skills.map(s => ({ name: s, level: 'Intermediate' }));

          setFormData(prev => ({
            ...prev,
            skills: [...new Map([...prev.skills, ...newSkills].map(item => [item.name, item])).values()],
            industry: p.industry || prev.industry,
            designation: p.designation || prev.designation,
            experienceLevel: p.experienceLevel || prev.experienceLevel,
            experienceYears: p.experienceYears || prev.experienceYears,
            bio: p.bio || prev.bio,
            resumeText: p.resumeText || ''
          }));
          toast.success("AI: Profile pre-filled from Resume!");
          setStep(2);
        }
      } catch (err) { setStep(2); }
      finally { setParsing(false); }
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    const data = new FormData();
    Object.keys(formData).forEach(key => {
      if (['skills', 'preferredLocations', 'educationData', 'experienceData', 'jobPreferences', 'socialLinks'].includes(key)) {
        data.append(key, JSON.stringify(formData[key]));
      } else if (formData[key] !== null) {
        data.append(key, formData[key]);
      }
    });

    try {
      const res = await axios.put(`${CANDIDATE_API_END_POINT}/update-profile`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true
      });
      if (res.data.success) {
        dispatch(setUser(res.data.candidate));
        toast.success("Profile fully updated!");
        navigate("/");
      }
    } catch (error) { toast.error("Submission failed"); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFF] pt-24 pb-20 font-sans text-slate-900 selection:bg-indigo-100">
      <div className="max-w-4xl mx-auto px-6">
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
              {step}
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Complete Profile</h1>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">Profile Strength: {progress}%</p>
            </div>
          </div>
          <div className="w-48 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <motion.div animate={{ width: `${progress}%` }} className="h-full bg-indigo-600 shadow-[0_0_10px_rgba(79,70,229,0.4)]" />
          </div>
        </div>

        <div className="bg-white rounded-[2rem] border border-slate-100 p-8 lg:p-12 shadow-[0_10px_40px_rgba(0,0,0,0.02)] min-h-[600px] flex flex-col justify-between">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div key="s0" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="space-y-10 py-10">
                <div className="text-center">
                  <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                    <Phone size={32} />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Verify your Phone Number</h2>
                  <p className="text-slate-400 text-sm font-medium">We need this to keep your account secure and for recruiters to reach out.</p>
                </div>
                
                <div className="max-w-md mx-auto space-y-6">
                  {!otpSent ? (
                    <div className="space-y-4">
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold border-r border-slate-200 pr-3">+91</div>
                        <input 
                          type="tel" 
                          placeholder="Enter Mobile Number" 
                          value={tempPhone} 
                          onChange={(e) => setTempPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                          className="w-full pl-16 pr-4 py-4 bg-slate-50 border-none ring-1 ring-slate-100 focus:ring-2 ring-indigo-100 rounded-2xl outline-none font-bold text-sm tracking-[0.2em]" 
                        />
                      </div>
                      <button 
                        onClick={sendPhoneOtp} 
                        disabled={phoneLoading || tempPhone.length < 10}
                        className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold text-[11px] tracking-[0.1em] hover:bg-indigo-600 transition-all shadow-xl disabled:opacity-50"
                      >
                        {phoneLoading ? <Loader2 className="animate-spin mx-auto" size={16} /> : "SEND VERIFICATION CODE"}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex flex-col items-center space-y-4">
                        <input 
                          type="text" 
                          placeholder="ENTER 6-DIGIT OTP" 
                          value={otp} 
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          className="w-full text-center py-4 bg-slate-50 border-none ring-1 ring-slate-100 focus:ring-2 ring-indigo-100 rounded-2xl outline-none font-bold text-lg tracking-[1em]" 
                        />
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Code sent to +91 {tempPhone}</p>
                      </div>
                      <button 
                        onClick={verifyPhoneOtp} 
                        disabled={phoneLoading || otp.length < 6}
                        className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold text-[11px] tracking-[0.1em] hover:bg-green-600 transition-all shadow-xl disabled:opacity-50"
                      >
                        {phoneLoading ? <Loader2 className="animate-spin mx-auto" size={16} /> : "VERIFY & PROCEED"}
                      </button>
                      <button 
                        onClick={() => setOtpSent(false)} 
                        className="w-full text-slate-400 font-bold text-[9px] tracking-widest hover:text-indigo-600 uppercase"
                      >
                        Change Phone Number
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="space-y-10">
                <div className="text-center">
                  <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                    {parsing ? <Loader2 size={32} className="animate-spin" /> : <Upload size={32} />}
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Build your professional identity</h2>
                  <p className="text-slate-400 text-sm font-medium">Upload resume for AI-powered fast pre-fill.</p>
                </div>
                <div className="relative group">
                  <div className="relative flex flex-col items-center justify-center w-full p-12 border-2 border-dashed border-slate-100 rounded-3xl bg-slate-50/20 hover:bg-white hover:border-indigo-200 transition-all cursor-pointer group-hover:shadow-xl group-hover:shadow-indigo-500/5">
                    <FileText size={32} className="text-slate-300 mb-4 group-hover:text-indigo-600 transition-colors" />
                    <span className="text-slate-900 font-bold text-sm">Select Resume (PDF/DOC)</span>
                    <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-widest">Max 5MB</p>
                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleResumeUpload} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                    <input type="text" value={formData.fullName} readOnly className="w-full p-4 bg-slate-50 border-none rounded-2xl text-slate-500 font-bold text-sm outline-none cursor-not-allowed" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email</label>
                    <input type="text" value={formData.email} readOnly className="w-full p-4 bg-slate-50 border-none rounded-2xl text-slate-500 font-bold text-sm outline-none cursor-not-allowed" />
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                <div className="flex items-center space-x-6">
                  <div className="relative group">
                    <div className="w-24 h-24 bg-slate-50 rounded-2xl border-4 border-white shadow-xl overflow-hidden flex items-center justify-center ring-1 ring-slate-100 group-hover:scale-105 transition-transform">
                      {formData.profilePhoto ? (
                        <img src={typeof formData.profilePhoto === 'string' ? formData.profilePhoto : URL.createObjectURL(formData.profilePhoto)} className="w-full h-full object-cover" />
                      ) : (
                        <User size={32} className="text-slate-200" />
                      )}
                    </div>
                    <label className="absolute bottom-[-5px] right-[-5px] bg-slate-900 text-white p-2 rounded-xl shadow-lg cursor-pointer hover:bg-indigo-600 transition-all border-2 border-white active:scale-90">
                      <Camera size={14} />
                      <input type="file" className="hidden" onChange={(e) => setFormData({ ...formData, profilePhoto: e.target.files[0] })} />
                    </label>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Headline & Summary</h3>
                    <p className="text-slate-400 text-xs font-medium">First impression matters. Make it count.</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Profile Headline</label>
                  <input
                    type="text" name="headline" value={formData.headline} onChange={handleChange}
                    placeholder="e.g. Senior Software Engineer | Full Stack Developer"
                    className="w-full p-4 bg-slate-50 border-none ring-1 ring-slate-100 focus:ring-2 ring-indigo-100 rounded-2xl outline-none font-bold text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Professional Bio</label>
                  <textarea
                    name="bio" value={formData.bio} onChange={handleChange}
                    placeholder="Describe your career goals..."
                    className="w-full p-5 bg-slate-50 border-none ring-1 ring-slate-100 focus:ring-2 ring-indigo-100 rounded-3xl outline-none min-h-[100px] font-medium text-sm leading-relaxed"
                  />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Current Location</label>
                    <div className="relative">
                      <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                      <input
                        type="text" value={locationSearch || formData.currentLocation}
                        onChange={(e) => { setLocationSearch(e.target.value); setFormData({ ...formData, currentLocation: e.target.value }) }}
                        placeholder="Search city..."
                        className="w-full pl-11 pr-4 py-4 bg-slate-50 border-none ring-1 ring-slate-100 focus:ring-2 ring-indigo-100 rounded-2xl outline-none font-bold text-sm"
                      />
                      {locationSuggestions.length > 0 && (
                        <div className="absolute top-full left-0 w-full bg-white mt-2 border border-slate-100 shadow-2xl rounded-2xl z-30 max-h-48 overflow-y-auto p-2 scrollbar-hide">
                          {locationSuggestions.map((loc, i) => (
                            <button key={i} onClick={() => { setFormData({ ...formData, currentLocation: loc.display_name }); setLocationSearch(loc.display_name); setLocationSuggestions([]); }} className="w-full text-left px-5 py-3 hover:bg-slate-50 hover:text-indigo-600 rounded-lg font-bold text-[11px] transition-all truncate">
                              {loc.display_name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center pt-8 space-x-3 ml-2">
                    <input type="checkbox" id="relocation" name="relocation" checked={formData.relocation} onChange={handleChange} className="w-5 h-5 rounded-lg accent-indigo-600" />
                    <label htmlFor="relocation" className="text-xs font-bold text-slate-600">Open to Relocation</label>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
                <div className="flex p-1 bg-slate-100/50 rounded-2xl max-w-[300px] border border-slate-50">
                  <button onClick={() => setFormData({ ...formData, experienceLevel: 'fresher' })} className={`flex-1 py-2.5 rounded-xl text-[10px] font-bold transition-all ${formData.experienceLevel === 'fresher' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>FRESHER</button>
                  <button onClick={() => setFormData({ ...formData, experienceLevel: 'experienced' })} className={`flex-1 py-2.5 rounded-xl text-[10px] font-bold transition-all ${formData.experienceLevel === 'experienced' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>EXPERIENCED</button>
                </div>
                {formData.experienceLevel === 'experienced' ? (
                  <div className="space-y-8">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-slate-800">Work Experience</h4>
                      <button onClick={() => { addExperience(); setActiveExpIndex(formData.experienceData.length); }} className="flex items-center space-x-1 text-indigo-600 font-bold text-[10px] hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-all">
                        <Plus size={14} /> <span>ADD EXPERIENCE</span>
                      </button>
                    </div>
                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 scrollbar-hide">
                      {formData.experienceData.map((exp, index) => (
                        <div key={index}>
                          {activeExpIndex === index ? (
                            <div className="p-6 bg-slate-50/50 rounded-3xl border-2 border-indigo-100 space-y-4 relative">
                              <div className="grid grid-cols-2 gap-4">
                                <div className="relative">
                                  <input type="text" placeholder="Company" value={compSearch.index === index ? compSearch.query : exp.company} onChange={(e) => { setCompSearch({ index, query: e.target.value }); handleExperienceChange(index, 'company', e.target.value); }} onFocus={() => setCompSearch({ index, query: exp.company })} className="w-full p-4 bg-white ring-1 ring-slate-100 rounded-2xl outline-none font-bold text-sm" />
                                  {compSearch.index === index && compSuggestions.length > 0 && (
                                    <div className="absolute top-full left-0 w-full bg-white mt-1 border border-slate-100 shadow-xl rounded-xl z-50 max-h-40 overflow-y-auto p-1 scrollbar-hide">
                                      {compSuggestions.map((c, i) => (
                                        <button key={i} onClick={() => { handleExperienceChange(index, 'company', c.name); setCompSearch({ index: null, query: '' }); }} className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center space-x-3 rounded-lg"><span className="text-xs font-bold text-slate-700">{c.name}</span></button>
                                      ))}
                                    </div>
                                  )}
                                </div>
                                <div className="relative">
                                  <input type="text" placeholder="Role" value={roleSearch.index === index ? roleSearch.query : exp.role} onChange={(e) => { setRoleSearch({ index, query: e.target.value }); handleExperienceChange(index, 'role', e.target.value); }} onFocus={() => setRoleSearch({ index, query: exp.role })} className="w-full p-4 bg-white ring-1 ring-slate-100 rounded-2xl outline-none font-bold text-sm" />
                                  {roleSearch.index === index && roleSuggestions.length > 0 && (
                                    <div className="absolute top-full left-0 w-full bg-white mt-1 border border-slate-100 shadow-xl rounded-xl z-50 max-h-40 overflow-y-auto p-1 scrollbar-hide">
                                      {roleSuggestions.map((r, i) => (
                                        <button key={i} onClick={() => { handleExperienceChange(index, 'role', r); setRoleSearch({ index: null, query: '' }); }} className="w-full text-left px-4 py-2 hover:bg-slate-50 rounded-lg"><span className="text-xs font-bold text-slate-700">{r}</span></button>
                                      ))}
                                    </div>
                                  )}
                                </div>
                                <div className="col-span-2 grid grid-cols-2 gap-4">
                                  <div className="space-y-1">
                                    <label className="text-[9px] font-bold text-slate-400">START DATE</label>
                                    <div className="flex gap-2">
                                      <select value={exp.fromMonth} onChange={(e) => handleExperienceChange(index, 'fromMonth', e.target.value)} className="flex-1 p-3 bg-white ring-1 ring-slate-100 rounded-xl text-xs font-bold outline-none">{months.map(m => <option key={m} value={m}>{m}</option>)}</select>
                                      <select value={exp.fromYear} onChange={(e) => handleExperienceChange(index, 'fromYear', e.target.value)} className="flex-1 p-3 bg-white ring-1 ring-slate-100 rounded-xl text-xs font-bold outline-none">{years.map(y => <option key={y} value={y}>{y}</option>)}</select>
                                    </div>
                                  </div>
                                  <div className="space-y-1">
                                    <div className="flex justify-between items-center"><label className="text-[9px] font-bold text-slate-400">END DATE</label><label className="flex items-center space-x-1 cursor-pointer"><input type="checkbox" checked={exp.isCurrent} onChange={(e) => handleExperienceChange(index, 'isCurrent', e.target.checked)} className="w-3 h-3 rounded accent-indigo-600" /><span className="text-[9px] font-bold text-slate-500">PRESENT</span></label></div>
                                    {!exp.isCurrent && (
                                      <div className="flex gap-2">
                                        <select value={exp.toMonth} onChange={(e) => handleExperienceChange(index, 'toMonth', e.target.value)} className="flex-1 p-3 bg-white ring-1 ring-slate-100 rounded-xl text-xs font-bold outline-none">{months.map(m => <option key={m} value={m}>{m}</option>)}</select>
                                        <select value={exp.toYear} onChange={(e) => handleExperienceChange(index, 'toYear', e.target.value)} className="flex-1 p-3 bg-white ring-1 ring-slate-100 rounded-xl text-xs font-bold outline-none">{years.map(y => <option key={y} value={y}>{y}</option>)}</select>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <textarea placeholder="Description" value={exp.description} onChange={(e) => handleExperienceChange(index, 'description', e.target.value)} className="w-full p-4 bg-white ring-1 ring-slate-100 rounded-2xl outline-none font-medium text-xs min-h-[80px]" />
                              <div className="flex justify-end space-x-2">
                                <button onClick={() => setActiveExpIndex(null)} className="px-6 py-2 bg-indigo-600 text-white text-[10px] font-bold rounded-xl shadow-lg">DONE</button>
                              </div>
                            </div>
                          ) : (
                            <div className="p-5 bg-white rounded-3xl border border-slate-100 flex items-center justify-between group hover:border-indigo-100 transition-all">
                              <div className="flex items-center space-x-4">
                                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400"><Briefcase size={20} /></div>
                                <div>
                                  <h5 className="text-sm font-bold text-slate-800">{exp.role || 'New Role'} @ {exp.company || 'Company'}</h5>
                                  <p className="text-[10px] text-slate-400 font-bold uppercase">{exp.fromMonth} {exp.fromYear} - {exp.isCurrent ? 'Present' : `${exp.toMonth} ${exp.toYear}`}</p>
                                </div>
                              </div>
                              <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-all">
                                <button onClick={() => setActiveExpIndex(index)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"><Pencil size={14} /></button>
                                <button onClick={() => setFormData({ ...formData, experienceData: formData.experienceData.filter((_, i) => i !== index) })} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={14} /></button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-10 bg-slate-50/50 rounded-3xl border border-dashed border-slate-100">
                    <Sparkles className="mx-auto text-indigo-400 mb-4" size={32} />
                    <p className="text-slate-500 font-bold text-sm uppercase tracking-widest">Excited to start your career!</p>
                  </div>
                )}

                <div className="space-y-6 pt-6 border-t border-slate-50">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-800">Education Details</h4>
                    <button onClick={() => { addEducation(); setActiveEduIndex(formData.educationData.length); }} className="flex items-center space-x-1 text-indigo-600 font-bold text-[10px] hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-all">
                      <Plus size={14} /> <span>ADD EDUCATION</span>
                    </button>
                  </div>
                  <div className="space-y-4">
                    {formData.educationData.map((edu, index) => (
                      <div key={index}>
                        {activeEduIndex === index ? (
                          <div className="p-6 bg-slate-50/50 rounded-3xl border-2 border-indigo-100 space-y-4 relative">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="relative">
                                <input type="text" placeholder="Degree" value={degSearch.index === index ? degSearch.query : edu.degree} onChange={(e) => { setDegSearch({ index, query: e.target.value }); handleEducationChange(index, 'degree', e.target.value); }} onFocus={() => setDegSearch({ index, query: edu.degree })} className="w-full p-4 bg-white ring-1 ring-slate-100 rounded-2xl outline-none font-bold text-xs" />
                                {degSearch.index === index && degSuggestions.length > 0 && (
                                  <div className="absolute top-full left-0 w-full bg-white mt-1 border border-slate-100 shadow-xl rounded-xl z-50 max-h-40 overflow-y-auto p-1 scrollbar-hide">
                                    {degSuggestions.map((d, i) => (
                                      <button key={i} onClick={() => { handleEducationChange(index, 'degree', d); setDegSearch({ index: null, query: '' }); }} className="w-full text-left px-4 py-2 hover:bg-slate-50 rounded-lg"><span className="text-[10px] font-bold text-slate-700">{d}</span></button>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <div className="relative">
                                <input type="text" placeholder="University" value={uniSearch.index === index ? uniSearch.query : edu.school} onChange={(e) => { setUniSearch({ index, query: e.target.value }); handleEducationChange(index, 'school', e.target.value); }} onFocus={() => setUniSearch({ index, query: edu.school })} className="w-full p-4 bg-white ring-1 ring-slate-100 rounded-2xl outline-none font-bold text-xs" />
                                {uniSearch.index === index && uniSuggestions.length > 0 && (
                                  <div className="absolute top-full left-0 w-full bg-white mt-1 border border-slate-100 shadow-xl rounded-xl z-50 max-h-40 overflow-y-auto p-1 scrollbar-hide">
                                    {uniSuggestions.map((u, i) => (
                                      <button key={i} onClick={() => { handleEducationChange(index, 'school', u.name); setUniSearch({ index: null, query: '' }); }} className="w-full text-left px-4 py-2 hover:bg-slate-50 rounded-lg"><span className="text-[10px] font-bold text-slate-700">{u.name}</span></button>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <div className="relative">
                                <input type="text" placeholder="Field of Study" value={fieldSearch.index === index ? fieldSearch.query : edu.field} onChange={(e) => { setFieldSearch({ index, query: e.target.value }); handleEducationChange(index, 'field', e.target.value); }} onFocus={() => setFieldSearch({ index, query: edu.field })} className="w-full p-4 bg-white ring-1 ring-slate-100 rounded-2xl outline-none font-bold text-xs" />
                                {fieldSearch.index === index && fieldSuggestions.length > 0 && (
                                  <div className="absolute top-full left-0 w-full bg-white mt-1 border border-slate-100 shadow-xl rounded-xl z-50 max-h-40 overflow-y-auto p-1 scrollbar-hide">
                                    {fieldSuggestions.map((f, i) => (
                                      <button key={i} onClick={() => { handleEducationChange(index, 'field', f); setFieldSearch({ index: null, query: '' }); }} className="w-full text-left px-4 py-2 hover:bg-slate-50 rounded-lg"><span className="text-[10px] font-bold text-slate-700">{f}</span></button>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center space-x-4">
                                <select value={edu.year} onChange={(e) => handleEducationChange(index, 'year', e.target.value)} className="flex-1 p-4 bg-white ring-1 ring-slate-100 rounded-2xl text-xs font-bold outline-none"><option value="">Year</option>{years.map(y => <option key={y} value={y}>{y}</option>)}</select>
                                <label className="flex items-center space-x-2 cursor-pointer bg-white px-4 py-3.5 rounded-2xl ring-1 ring-slate-100"><input type="checkbox" checked={edu.isCurrent} onChange={(e) => handleEducationChange(index, 'isCurrent', e.target.checked)} className="w-4 h-4 rounded accent-indigo-600" /><span className="text-[10px] font-bold text-slate-500">PURSUING</span></label>
                              </div>
                            </div>
                            <div className="flex justify-end space-x-2">
                              <button onClick={() => setActiveEduIndex(null)} className="px-6 py-2 bg-indigo-600 text-white text-[10px] font-bold rounded-xl shadow-lg">DONE</button>
                            </div>
                          </div>
                        ) : (
                          <div className="p-5 bg-white rounded-3xl border border-slate-100 flex items-center justify-between group hover:border-indigo-100 transition-all">
                            <div className="flex items-center space-x-4">
                              <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400"><School size={20} /></div>
                              <div>
                                <h5 className="text-sm font-bold text-slate-800">{edu.degree || 'New Degree'}</h5>
                                <p className="text-[10px] text-slate-400 font-bold uppercase">{edu.school || 'University'} | {edu.isCurrent ? 'Pursuing' : edu.year}</p>
                              </div>
                            </div>
                            <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-all">
                              <button onClick={() => setActiveEduIndex(index)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"><Pencil size={14} /></button>
                              <button onClick={() => setFormData({ ...formData, educationData: formData.educationData.filter((_, i) => i !== index) })} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={14} /></button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div key="s4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Professional Skills & Levels</label>
                  <div className="grid grid-cols-2 gap-3 p-5 bg-slate-50/50 rounded-3xl border border-dashed border-slate-100 min-h-[100px] max-h-[250px] overflow-y-auto scrollbar-hide">
                    {formData.skills.map(s => (
                      <div key={s.name} className="flex flex-col space-y-2 p-3 bg-white rounded-2xl shadow-sm border border-slate-100">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-slate-900">{s.name}</span>
                          <X size={14} className="text-slate-300 hover:text-red-500 cursor-pointer" onClick={() => setFormData({ ...formData, skills: formData.skills.filter(sk => sk.name !== s.name) })} />
                        </div>
                        <div className="flex items-center space-x-1">
                          {['Beginner', 'Intermediate', 'Expert'].map(level => (
                            <button key={level} onClick={() => handleSkillLevelChange(s.name, level)} className={`flex-1 py-1 rounded-md text-[8px] font-bold transition-all ${s.level === level ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-400'}`}>{level}</button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="relative">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input type="text" placeholder="Search and add skills..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-12 pr-6 py-4 bg-slate-50 border-none ring-1 ring-slate-100 focus:ring-2 ring-indigo-100 rounded-2xl outline-none font-bold text-sm" />
                    {search && (
                      <div className="absolute top-full left-0 w-full bg-white mt-2 border border-slate-100 shadow-2xl rounded-2xl z-30 max-h-48 overflow-y-auto p-2 scrollbar-hide">
                        {suggestions.skills.filter(n => n.toLowerCase().includes(search.toLowerCase())).map((n, i) => (
                          <button key={i} onClick={() => { if (!formData.skills.some(sk => sk.name === n)) setFormData({ ...formData, skills: [...formData.skills, { name: n, level: 'Intermediate' }] }); setSearch(''); }} className="w-full text-left px-5 py-3 hover:bg-slate-50 hover:text-indigo-600 rounded-lg font-bold text-[12px] transition-all">
                            {n}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-6 pt-4 border-t border-slate-50">
                   <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Preferred Job Locations</label>
                   <div className="relative">
                      <div className="flex flex-wrap gap-2 mb-3">
                         {formData.preferredLocations.map(loc => (
                            <span key={loc} className="flex items-center space-x-1 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-bold border border-indigo-100">
                               <span>{loc}</span>
                               <X size={12} className="cursor-pointer hover:text-red-500" onClick={() => setFormData({...formData, preferredLocations: formData.preferredLocations.filter(l => l !== loc)})} />
                            </span>
                         ))}
                         {formData.preferredLocations.length === 0 && <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest p-2 italic">Add cities or 'Remote'</p>}
                      </div>
                      <div className="relative">
                         <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                         <input 
                            type="text" placeholder="Add preferred cities..." 
                            value={locationSearch} 
                            onChange={(e) => setLocationSearch(e.target.value)}
                            className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-none ring-1 ring-slate-100 focus:ring-2 ring-indigo-100 rounded-2xl outline-none font-bold text-xs" 
                         />
                         {locationSuggestions.length > 0 && (
                            <div className="absolute top-full left-0 w-full bg-white mt-2 border border-slate-100 shadow-2xl rounded-2xl z-30 max-h-40 overflow-y-auto p-1 scrollbar-hide">
                               {locationSuggestions.map((loc, i) => (
                                  <button key={i} onClick={() => { if(!formData.preferredLocations.includes(loc.display_name.split(',')[0])) setFormData({...formData, preferredLocations: [...formData.preferredLocations, loc.display_name.split(',')[0]]}); setLocationSearch(''); setLocationSuggestions([]); }} className="w-full text-left px-4 py-2.5 hover:bg-slate-50 hover:text-indigo-600 rounded-lg font-bold text-[10px] transition-all truncate">
                                     {loc.display_name}
                                  </button>
                               ))}
                            </div>
                         )}
                      </div>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="flex justify-between items-end px-1">
                       <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Current Salary (LPA)</label>
                       <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-100">{formData.currentSalary || 0} LPA</span>
                    </div>
                    <input 
                       type="range" min="0" max="50" step="0.5" 
                       value={formData.currentSalary || 0} 
                       onChange={(e) => setFormData({...formData, currentSalary: e.target.value})} 
                       className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600" 
                    />
                    <div className="flex justify-between text-[8px] font-bold text-slate-300 px-1 uppercase tracking-widest"><span>0 LPA</span><span>50 LPA</span></div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-end px-1">
                       <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Expected Salary (LPA)</label>
                       <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-100">{formData.expectedSalary || 0} LPA</span>
                    </div>
                    <input 
                       type="range" min="0" max="80" step="0.5" 
                       value={formData.expectedSalary || 0} 
                       onChange={(e) => setFormData({...formData, expectedSalary: e.target.value})} 
                       className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600" 
                    />
                    <div className="flex justify-between text-[8px] font-bold text-slate-300 px-1 uppercase tracking-widest"><span>0 LPA</span><span>80 LPA</span></div>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-50">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Social Profiles</label>
                  <div className="grid grid-cols-2 gap-4">
                    <input type="text" name="linkedin" value={formData.socialLinks.linkedin} onChange={handleSocialChange} placeholder="LinkedIn URL" className="w-full p-4 bg-slate-50 border-none ring-1 ring-slate-100 focus:ring-2 ring-indigo-100 rounded-2xl outline-none font-bold text-[11px]" />
                    <input type="text" name="github" value={formData.socialLinks.github} onChange={handleSocialChange} placeholder="GitHub URL" className="w-full p-4 bg-slate-50 border-none ring-1 ring-slate-100 focus:ring-2 ring-indigo-100 rounded-2xl outline-none font-bold text-[11px]" />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div className="mt-12 flex items-center justify-between border-t border-slate-50 pt-8">
            <button onClick={() => setStep(prev => prev - 1)} className={`text-slate-400 hover:text-slate-900 font-bold text-[11px] tracking-widest flex items-center space-x-2 transition-all ${step === 1 ? 'opacity-0 pointer-events-none' : ''}`}>
              <ArrowLeft size={16} /> <span>BACK</span>
            </button>
            <div className="flex items-center space-x-4">
              {step < 4 ? (
                <button onClick={() => setStep(prev => prev + 1)} className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-bold text-[11px] tracking-[0.1em] hover:bg-indigo-600 transition-all flex items-center space-x-3 shadow-xl active:scale-95">
                  <span>NEXT</span>
                  <ChevronRight size={16} />
                </button>
              ) : (
                <button onClick={handleSubmit} disabled={loading} className="bg-indigo-600 text-white px-12 py-4 rounded-2xl font-bold text-[11px] tracking-[0.1em] hover:bg-green-600 transition-all flex items-center space-x-3 shadow-xl active:scale-95">
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <><span>ACTIVATE PROFILE</span><CheckCircle2 size={16} /></>}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateProfileSetup;

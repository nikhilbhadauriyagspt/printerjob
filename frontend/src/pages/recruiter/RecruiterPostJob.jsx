import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Briefcase, 
    MapPin, 
    IndianRupee, 
    Plus, 
    Trash2, 
    CheckCircle2, 
    Loader2, 
    FileText, 
    Target, 
    Sparkles, 
    ChevronLeft, 
    ChevronRight,
    AlertCircle,
    ShieldCheck,
    ShieldAlert,
    Clock
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { useNavigate, useSearchParams } from 'react-router-dom';

const RecruiterPostJob = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const editJobId = searchParams.get('edit');
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [isDraftLoading, setIsDraftLoading] = useState(false);
    const [company, setCompany] = useState(null);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        responsibilities: '',
        requirements: '',
        minSalary: '',
        maxSalary: '',
        location: [],
        jobType: 'Full-time',
        experienceLevel: '',
        industry: '',
        skills: [],
        benefits: [],
        screeningQuestions: [],
        workingSchedule: '',
        maxApplications: '',
        isUrgent: false
    });

    const [newLocation, setNewLocation] = useState('');
    const [newSkill, setNewSkill] = useState('');
    const [newBenefit, setNewBenefit] = useState('');
    const [newQuestion, setNewQuestion] = useState({ question: '', type: 'text', required: true });

    // Suggestion States
    const [jobTitles, setJobTitles] = useState([]);
    const [industries, setIndustries] = useState([]);
    const [skillsList, setSkillsList] = useState([]);

    useEffect(() => {
        const fetchMetadata = async () => {
            try {
                const [titles, inds, skls, compRes] = await Promise.all([
                    axios.get("http://localhost:8000/api/v1/admin/suggestions?type=jobtitle"),
                    axios.get("http://localhost:8000/api/v1/admin/suggestions?type=industry"),
                    axios.get("http://localhost:8000/api/v1/admin/suggestions?type=skill"),
                    axios.get("http://localhost:8000/api/v1/company/me", { withCredentials: true })
                ]);
                setJobTitles(titles.data.suggestions);
                setIndustries(inds.data.suggestions);
                setSkillsList(skls.data.suggestions);
                if (compRes.data.success) setCompany(compRes.data.company);
            } catch (err) { console.error("Metadata fetch error"); }
        };
        fetchMetadata();

        if (editJobId) {
            const fetchJob = async () => {
                try {
                    const res = await axios.get(`http://localhost:8000/api/v1/job/get/${editJobId}`);
                    if (res.data.success) {
                        const job = res.data.job;
                        
                        const safeArray = (val) => {
                            if (Array.isArray(val)) return val;
                            if (typeof val === 'string') {
                                try {
                                    const parsed = JSON.parse(val);
                                    return Array.isArray(parsed) ? parsed : [val];
                                } catch (e) {
                                    return val ? [val] : [];
                                }
                            }
                            return [];
                        };

                        setFormData({
                            ...job,
                            location: safeArray(job.location),
                            skills: safeArray(job.skills),
                            benefits: safeArray(job.benefits),
                            screeningQuestions: safeArray(job.screeningQuestions)
                        });
                    }
                } catch (err) { toast.error("Failed to load job data"); }
            };
            fetchJob();
        }
    }, [editJobId]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
    };

    const addItem = (field, value, resetFn) => {
        if (!value.trim()) return;
        const currentItems = Array.isArray(formData[field]) ? formData[field] : [];
        if (currentItems.includes(value)) return toast.error("Already added");
        setFormData({ ...formData, [field]: [...currentItems, value] });
        resetFn('');
    };

    const removeItem = (field, index) => {
        const currentItems = Array.isArray(formData[field]) ? formData[field] : [];
        const updated = [...currentItems];
        updated.splice(index, 1);
        setFormData({ ...formData, [field]: updated });
    };

    const addQuestion = () => {
        if (!newQuestion.question.trim()) return;
        const currentQuestions = Array.isArray(formData.screeningQuestions) ? formData.screeningQuestions : [];
        setFormData({ ...formData, screeningQuestions: [...currentQuestions, newQuestion] });
        setNewQuestion({ question: '', type: 'text', required: true });
    };

    const submitJob = async (isDraft = false) => {
        if (!isDraft && (step < 4)) return setStep(step + 1);
        
        try {
            isDraft ? setIsDraftLoading(true) : setLoading(true);
            const url = editJobId 
                ? `http://localhost:8000/api/v1/job/update/${editJobId}` 
                : "http://localhost:8000/api/v1/job/create";
            
            const res = editJobId 
                ? await axios.put(url, { ...formData, isDraft }, { withCredentials: true })
                : await axios.post(url, { ...formData, isDraft }, { withCredentials: true });

            if (res.data.success) {
                toast.success(res.data.message);
                navigate("/recruiter/jobs");
            }
        } catch (error) {
            const msg = error.response?.data?.message || "Operation failed";
            toast.error(msg);
            
            // 🟢 Redirect to pricing if access is expired
            if (error.response?.status === 403 && error.response?.data?.isExpired) {
                setTimeout(() => navigate("/recruiter/pricing"), 1500);
            }
        } finally {
            setLoading(false);
            setIsDraftLoading(false);
        }
    };

    const steps = [
        { id: 1, title: "Basic Info", icon: <Briefcase size={18}/> },
        { id: 2, title: "Job Details", icon: <FileText size={18}/> },
        { id: 3, title: "Requirements", icon: <Target size={18}/> },
        { id: 4, title: "Compensation", icon: <IndianRupee size={18}/> }
    ];

    if (!company && !editJobId) return (
        <div className="h-[60vh] flex items-center justify-center">
            <Loader2 className="animate-spin text-indigo-600" size={32} />
        </div>
    );

    // 🟢 Block if Company is not approved by Admin
    if (company && !company.isApproved) {
        return (
            <div className="max-w-2xl mx-auto py-20 px-6 text-center">
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white p-10 rounded-[40px] border border-slate-200 shadow-xl shadow-slate-100"
                >
                    <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <ShieldAlert size={40} />
                    </div>
                    <h2 className="text-2xl font-black text-slate-800 mb-4 tracking-tight">Account Pending Approval</h2>
                    <p className="text-slate-500 font-medium mb-8 leading-relaxed">
                        Your recruiter account is currently being reviewed by our administration team. 
                        You will be able to post new jobs as soon as your account is verified.
                    </p>
                    <div className="flex flex-col gap-3">
                        <button 
                            onClick={() => navigate("/recruiter/dashboard")}
                            className="w-full py-4 bg-slate-900 text-white rounded-2xl text-sm font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
                        >
                            Back to Dashboard
                        </button>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-4">Average review time: 24-48 hours</p>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto pb-20 px-4 font-sans text-slate-900">
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 border-b border-slate-100 pb-8">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight">Create Professional Opening</h1>
                    <p className="text-sm text-slate-500 font-medium mt-1">Naukri-Standard structured data for better candidate matching.</p>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={() => submitJob(true)}
                        disabled={isDraftLoading || loading}
                        className="px-5 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200 transition-all flex items-center gap-2"
                    >
                        {isDraftLoading ? <Loader2 className="animate-spin" size={14}/> : "Save as Draft"}
                    </button>
                    <button 
                        onClick={() => submitJob(false)}
                        disabled={loading}
                        className="px-8 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin" size={14}/> : (step === 4 ? "Publish Job" : "Next Step")}
                    </button>
                </div>
            </div>

            <div className="flex items-center justify-between mb-12 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm overflow-x-auto gap-4">
                {steps.map((s, idx) => (
                    <React.Fragment key={s.id}>
                        <div className={`flex items-center gap-3 shrink-0 ${step === s.id ? 'text-indigo-600' : 'text-slate-400'}`}>
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold transition-all ${step === s.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-slate-50 text-slate-400'}`}>
                                {step > s.id ? <CheckCircle2 size={20}/> : s.icon}
                            </div>
                            <div className="hidden sm:block">
                                <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 leading-none mb-1">Step 0{s.id}</p>
                                <p className="text-sm font-bold truncate">{s.title}</p>
                            </div>
                        </div>
                        {idx < steps.length - 1 && <div className="h-[2px] flex-1 bg-slate-50 min-w-[20px]"></div>}
                    </React.Fragment>
                ))}
            </div>

            <AnimatePresence mode="wait">
                <motion.div 
                    key={step}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-8"
                >
                    {step === 1 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6 bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm">
                                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                    <Briefcase className="text-indigo-600" size={20}/> Basic Information
                                </h3>
                                <div className="space-y-4">
                                    <FormAutocomplete 
                                        label="Job Title" 
                                        name="title" 
                                        value={formData.title} 
                                        onChange={handleInputChange} 
                                        suggestions={jobTitles} 
                                        placeholder="e.g. Senior MERN Stack Developer" 
                                    />
                                    <FormAutocomplete 
                                        label="Industry" 
                                        name="industry" 
                                        value={formData.industry} 
                                        onChange={handleInputChange} 
                                        suggestions={industries} 
                                        placeholder="e.g. Technology" 
                                    />
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormSelect label="Job Type" name="jobType" value={formData.jobType} onChange={handleInputChange} options={['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote']} />
                                        <FormInput label="Experience Level" name="experienceLevel" value={formData.experienceLevel} onChange={handleInputChange} placeholder="e.g. 2-5 Years" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Office Locations</label>
                                        <div className="flex gap-2">
                                            <input value={newLocation} onChange={(e) => setNewLocation(e.target.value)} className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:bg-white focus:border-indigo-600 outline-none transition-all" placeholder="Add City..." />
                                            <button type="button" onClick={() => addItem('location', newLocation, setNewLocation)} className="p-3 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-all"><Plus size={20}/></button>
                                        </div>
                                        <div className="flex flex-wrap gap-2 pt-2">
                                            {Array.isArray(formData.location) && formData.location.map((loc, i) => <Tag key={i} text={loc} onRemove={() => removeItem('location', i)} />)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-indigo-600 rounded-[32px] p-8 text-white flex flex-col justify-between relative overflow-hidden shadow-xl">
                                <div className="z-10">
                                    <Sparkles className="text-indigo-200 mb-4" size={32}/>
                                    <h4 className="text-xl font-bold mb-2">Pro-Tip for Visibility</h4>
                                    <p className="text-indigo-100 text-sm leading-relaxed font-medium">Adding multiple locations and a clear experience level helps our AI match your job with the right candidates 40% faster.</p>
                                </div>
                                <div className="z-10 mt-8 p-4 bg-white/10 rounded-2xl border border-white/20 backdrop-blur-sm">
                                    <p className="text-xs font-bold uppercase tracking-widest text-indigo-200 mb-2">Platform Policy</p>
                                    <p className="text-xs font-medium leading-relaxed italic opacity-90">All jobs are reviewed within 2-4 hours by our system administrators.</p>
                                </div>
                                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm space-y-6">
                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <FileText className="text-indigo-600" size={20}/> Detailed Job Description
                            </h3>
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Job Overview</label>
                                    <textarea name="description" value={formData.description} onChange={handleInputChange} rows={4} className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:bg-white focus:border-indigo-600 outline-none transition-all leading-relaxed" placeholder="Briefly describe the role and your company..." />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Responsibilities</label>
                                        <textarea name="responsibilities" value={formData.responsibilities} onChange={handleInputChange} rows={6} className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:bg-white focus:border-indigo-600 outline-none transition-all leading-relaxed" placeholder="• Itemize daily tasks..." />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Key Requirements</label>
                                        <textarea name="requirements" value={formData.requirements} onChange={handleInputChange} rows={6} className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:bg-white focus:border-indigo-600 outline-none transition-all leading-relaxed" placeholder="• Required skills and mindset..." />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6 bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm">
                                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                    <ShieldCheck className="text-indigo-600" size={20}/> Candidate Filtering
                                </h3>
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <FormAutocomplete 
                                            label="Must-Have Skills" 
                                            name="skills" 
                                            value={newSkill} 
                                            onChange={(e) => setNewSkill(e.target.value)} 
                                            suggestions={skillsList} 
                                            placeholder="Search Skills..." 
                                            onSelect={(val) => addItem('skills', val, setNewSkill)}
                                        />
                                        <div className="flex flex-wrap gap-2 pt-2">
                                            {Array.isArray(formData.skills) && formData.skills.map((s, i) => <Tag key={i} text={s} color="bg-indigo-600 text-white" onRemove={() => removeItem('skills', i)} />)}
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-4 pt-4 border-t border-slate-100">
                                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Screening Questions</label>
                                        <div className="p-4 bg-slate-50 rounded-2xl space-y-3">
                                            <input value={newQuestion.question} onChange={(e) => setNewQuestion({...newQuestion, question: e.target.value})} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none" placeholder="Question: Do you have a degree?" />
                                            <div className="flex gap-2">
                                                <select value={newQuestion.type} onChange={(e) => setNewQuestion({...newQuestion, type: e.target.value})} className="flex-1 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold">
                                                    <option value="text">Text Response</option>
                                                    <option value="yesno">Yes / No</option>
                                                </select>
                                                <button type="button" onClick={addQuestion} className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-black transition-all">Add Q</button>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            {Array.isArray(formData.screeningQuestions) && formData.screeningQuestions.map((q, i) => (
                                                <div key={i} className="flex items-center justify-between p-3 bg-indigo-50/50 rounded-xl border border-indigo-100">
                                                    <span className="text-xs font-bold text-indigo-900 truncate pr-4">{q.question}</span>
                                                    <button onClick={() => removeItem('screeningQuestions', i)} className="text-red-400 hover:text-red-600"><Trash2 size={14}/></button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="space-y-6">
                                <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm">
                                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-6">
                                        <Sparkles className="text-amber-500" size={20}/> Perks & Benefits
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="flex gap-2">
                                            <input value={newBenefit} onChange={(e) => setNewBenefit(e.target.value)} className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:bg-white focus:border-indigo-600 outline-none transition-all" placeholder="e.g. Free Gym..." />
                                            <button type="button" onClick={() => addItem('benefits', newBenefit, setNewBenefit)} className="p-3 bg-amber-50 text-amber-600 rounded-xl hover:bg-amber-100 transition-all"><Plus size={20}/></button>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {['Health Insurance', 'WFH', 'Flexible Hours', 'Stock Options'].map(b => (
                                                <button key={b} type="button" onClick={() => addItem('benefits', b, setNewBenefit)} className="px-3 py-1.5 bg-slate-50 text-slate-500 border border-slate-200 rounded-lg text-[10px] font-bold uppercase tracking-tight hover:bg-indigo-50 hover:text-indigo-600 transition-all">{b}</button>
                                            ))}
                                        </div>
                                        <div className="flex flex-wrap gap-2 pt-2">
                                            {Array.isArray(formData.benefits) && formData.benefits.map((b, i) => <Tag key={i} text={b} color="bg-emerald-50 text-emerald-600 border-emerald-100" onRemove={() => removeItem('benefits', i)} />)}
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-amber-50 p-6 rounded-[32px] border border-amber-100">
                                    <div className="flex gap-4">
                                        <AlertCircle className="text-amber-600 shrink-0" size={20}/>
                                        <div className="space-y-1">
                                            <p className="text-xs font-bold text-amber-800">Smart Screening</p>
                                            <p className="text-[11px] text-amber-700 font-medium leading-relaxed">Adding at least 2 screening questions reduces irrelevant applications by up to 60%.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm space-y-6">
                                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                    <IndianRupee className="text-indigo-600" size={20}/> Compensation & Limits
                                </h3>
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormInput label="Min Salary (Annual)" name="minSalary" value={formData.minSalary} onChange={handleInputChange} placeholder="e.g. 500000" />
                                        <FormInput label="Max Salary (Annual)" name="maxSalary" value={formData.maxSalary} onChange={handleInputChange} placeholder="e.g. 800000" />
                                    </div>
                                    <FormInput label="Working Schedule" name="workingSchedule" value={formData.workingSchedule} onChange={handleInputChange} placeholder="e.g. 5 Days, 9am-6pm" />
                                    <FormInput label="Application Limit (Optional)" name="maxApplications" value={formData.maxApplications} onChange={handleInputChange} placeholder="e.g. 100" />
                                    
                                    <div className="flex items-center justify-between p-4 bg-rose-50 rounded-2xl border border-rose-100">
                                        <div className="flex items-center gap-3">
                                            <Clock className="text-rose-600" size={20}/>
                                            <div>
                                                <p className="text-xs font-bold text-rose-900">Mark as Urgent</p>
                                                <p className="text-[10px] text-rose-700 font-medium tracking-tight">Highlight your job for faster hiring.</p>
                                            </div>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" name="isUrgent" checked={formData.isUrgent} onChange={handleInputChange} className="sr-only peer" />
                                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-slate-900 rounded-[32px] p-8 text-white flex flex-col justify-center space-y-6 shadow-2xl relative overflow-hidden">
                                <div className="z-10 text-center space-y-4">
                                    <div className="w-20 h-20 bg-indigo-600 rounded-3xl mx-auto flex items-center justify-center shadow-2xl shadow-indigo-500/20">
                                        <ShieldCheck size={40}/>
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="text-xl font-bold">Ready to Publish?</h4>
                                        <p className="text-slate-400 text-sm font-medium">Please review all fields. Once published, the job will go to the Admin Queue for quality verification.</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => submitJob(false)}
                                    disabled={loading}
                                    className="z-10 w-full py-4 bg-indigo-600 text-white rounded-2xl text-sm font-bold shadow-xl shadow-indigo-500/20 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                                >
                                    {loading ? <Loader2 className="animate-spin" size={20}/> : "Publish & Send for Approval"}
                                </button>
                                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl"></div>
                            </div>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>

            <div className="mt-12 flex justify-between">
                <button 
                    onClick={() => setStep(step - 1)}
                    disabled={step === 1 || loading}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${step === 1 ? 'opacity-0' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                >
                    <ChevronLeft size={16}/> Previous
                </button>
                {step < 4 && (
                    <button 
                        onClick={() => setStep(step + 1)}
                        className="flex items-center gap-2 px-8 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-black transition-all"
                    >
                        Next Step <ChevronRight size={16}/>
                    </button>
                )}
            </div>
        </div>
    );
};

// --- Helper Components ---

const FormInput = ({ label, icon, ...props }) => (
    <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">{label}</label>
        <div className="relative group">
            {icon && <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors">{icon}</div>}
            <input {...props} className={`w-full ${icon ? 'pl-10' : 'px-4'} pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-600 transition-all text-sm font-bold text-slate-700 placeholder:text-slate-300`} />
        </div>
    </div>
);

const FormAutocomplete = ({ label, name, value, onChange, suggestions, placeholder, onSelect }) => {
    const [show, setShow] = useState(false);
    const containerRef = React.useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) setShow(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filtered = suggestions.filter(s => s.toLowerCase().includes(value.toLowerCase()));

    return (
        <div className="space-y-1.5 relative" ref={containerRef}>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">{label}</label>
            <input 
                name={name}
                value={value}
                onChange={(e) => { onChange(e); setShow(true); }}
                onFocus={() => setShow(true)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-600 transition-all text-sm font-bold text-slate-700" 
                placeholder={placeholder}
                autoComplete="off"
            />
            {show && filtered.length > 0 && (
                <div className="absolute z-50 w-full mt-2 bg-white border border-slate-100 rounded-2xl shadow-xl py-2 max-h-48 overflow-y-auto custom-scrollbar border-indigo-50">
                    {filtered.map((s, i) => (
                        <button 
                            key={i} 
                            type="button"
                            onClick={() => {
                                if (onSelect) onSelect(s);
                                else onChange({ target: { name, value: s } });
                                setShow(false);
                            }}
                            className="w-full px-4 py-2.5 text-left text-sm font-bold text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-all"
                        >
                            {s}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

const FormSelect = ({ label, options, ...props }) => (
    <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">{label}</label>
        <select {...props} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-600 transition-all text-sm font-bold text-slate-700 appearance-none">
            {options.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
        </select>
    </div>
);

const Tag = ({ text, onRemove, color = "bg-rose-50 text-rose-600 border-rose-100" }) => (
    <div className={`px-3 py-1.5 rounded-lg border flex items-center gap-2 text-xs font-bold animate-in zoom-in-90 ${color}`}>
        {text}
        <button onClick={onRemove} className="hover:opacity-70"><Trash2 size={12}/></button>
    </div>
);

export default RecruiterPostJob;

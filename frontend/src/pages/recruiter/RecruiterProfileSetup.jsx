import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Building2,
    Globe,
    MapPin,
    Hash,
    Loader2,
    UserCircle,
    Instagram,
    Linkedin,
    Twitter,
    Facebook,
    FileText,
    CheckCircle2,
    Briefcase,
    Mail,
    Phone,
    Image as ImageIcon,
    Plus,
    Search,
    Map,
    Sparkles,
    Locate,
    ChevronDown
} from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const API_BASE = "https://mediumturquoise-goshawk-440855.hostingersite.com/api/v1/company";

// Suggestions Data
const INDUSTRIES = ["Technology", "Fintech", "Healthtech", "E-commerce", "Education", "Manufacturing", "Automobile", "Real Estate", "Logistics", "Marketing", "Consulting", "Retail", "Hospitality", "Media & Entertainment", "Cyber Security", "AI & Machine Learning"];
const DESIGNATIONS = ["HR Manager", "Talent Acquisition Head", "CTO", "CEO", "Co-Founder", "Recruitment Specialist", "Operations Manager", "Engineering Manager", "Product Manager", "Director of Hiring"];
const CITIES = ["Delhi", "Mumbai", "Bangalore", "Hyderabad", "Pune", "Gurgaon", "Noida", "Chennai", "Kolkata", "Ahmedabad", "Chandigarh", "Jaipur", "Indore", "Surat", "Lucknow", "Kanpur", "Nagpur", "Patna", "Bhopal"];
const STATES = ["Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi", "Chandigarh"];

const RecruiterProfileSetup = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [locating, setLocateLoading] = useState(false);
    const [showDemoMenu, setShowDemoMenu] = useState(false);

    const [logoPreview, setLogoPreview] = useState(null);
    const [logoFile, setLogoFile] = useState(null);

    // Dynamic Suggestions State
    const [industries, setIndustries] = useState([]);
    const [designations, setDesignations] = useState([]);

    const [input, setInput] = useState({
        companyName: "",
        email: "",
        phoneNumber: "",
        industry: "",
        companySize: "",
        companyType: "",
        website: "",
        description: "",
        address: "",
        city: "",
        state: "",
        country: "India",
        pincode: "",
        gstNumber: "",
        panNumber: "",
        contactPersonName: "",
        designation: "",
        socialLinks: {
            linkedin: "",
            twitter: "",
            facebook: "",
            instagram: ""
        }
    });

    useEffect(() => {
        const fetchSuggestions = async () => {
            try {
                const [indRes, desRes] = await Promise.all([
                    axios.get("https://mediumturquoise-goshawk-440855.hostingersite.com/api/v1/admin/suggestions?type=industry", { withCredentials: true }),
                    axios.get("https://mediumturquoise-goshawk-440855.hostingersite.com/api/v1/admin/suggestions?type=designation", { withCredentials: true })
                ]);
                if (indRes.data.success) setIndustries(indRes.data.suggestions);
                if (desRes.data.success) setDesignations(desRes.data.suggestions);
            } catch (err) {
                console.error("Error fetching suggestions", err);
            }
        };
        fetchSuggestions();

        const fetchProfile = async () => {
            try {
                const res = await axios.get(`${API_BASE}/me`, { withCredentials: true });
                if (res.data.success) {
                    const data = res.data.company;
                    setInput({
                        ...data,
                        phoneNumber: data.phoneNumber || "", 
                        email: data.email || "",
                        socialLinks: data.socialLinks || { linkedin: "", twitter: "", facebook: "", instagram: "" }
                    });
                    if (data.logo) setLogoPreview(data.logo);
                }
            } catch (error) {
                if (error.response?.status === 401) {
                    toast.error("Session expired. Please login again.");
                    navigate("/recruiter/login");
                } else {
                    console.error("Fetch profile error", error);
                }
            } finally {
                setFetching(false);
            }
        };
        fetchProfile();
    }, [navigate]);

    const handleMagicFill = () => {
        setInput(prev => ({
            ...prev,
            industry: "Technology",
            companySize: "51-200",
            companyType: "Product Based",
            website: "https://www.google.com",
            description: "Leading technology solution provider specializing in AI and cloud computing services. We empower businesses with cutting-edge digital transformations.",
            address: "Building 10, DLF Cyber City, Phase 2",
            city: "Gurgaon",
            state: "Haryana",
            pincode: "122002",
            gstNumber: "06AAAAA0000A1Z5",
            panNumber: "ABCDE1234F",
            contactPersonName: "Rajesh Kumar",
            designation: "Talent Acquisition Head",
            socialLinks: {
                linkedin: "https://linkedin.com/company/google",
                twitter: "https://twitter.com/google",
                facebook: "https://facebook.com/google",
                instagram: "https://instagram.com/google"
            }
        }));
        setShowDemoMenu(false);
        toast.info("Demo data loaded!");
    };

    const fetchFromWebsite = async () => {
        if (!input.website) return toast.error("Please enter a website URL first");
        try {
            setLoading(true);
            const res = await axios.post(`${API_BASE}/fetch-info`, { url: input.website }, { withCredentials: true });
            if (res.data.success) {
                const { companyName, description, logo } = res.data.companyInfo;
                setInput(prev => ({
                    ...prev,
                    companyName: companyName || prev.companyName,
                    description: description || prev.description,
                    logo: logo || prev.logo // Set the logo URL in state
                }));
                if (logo) setLogoPreview(logo);
                toast.success("Real info fetched!");
            }
        } catch (error) {
            toast.error("Could not fetch data from this URL");
        } finally {
            setLoading(false);
        }
    };

    const detectLocation = () => {
        if (!navigator.geolocation) return toast.error("Geolocation not supported");
        setLocateLoading(true);
        navigator.geolocation.getCurrentPosition(async (pos) => {
            try {
                const { latitude, longitude } = pos.coords;
                const res = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`);
                if (res.data && res.data.address) {
                    const addr = res.data.address;
                    setInput(prev => ({
                        ...prev,
                        city: addr.city || addr.town || addr.village || "",
                        state: addr.state || "",
                        pincode: addr.postcode || "",
                        address: res.data.display_name
                    }));
                    toast.success("Location detected!");
                }
            } catch (err) {
                toast.error("Failed to reverse geocode");
            } finally {
                setLocateLoading(false);
            }
        }, () => {
            toast.error("Location access denied");
            setLocateLoading(false);
        });
    };

    const changeEventHandler = (e) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setInput({ ...input, [parent]: { ...input[parent], [child]: value } });
        } else {
            setInput({ ...input, [name]: value });
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setLogoFile(file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const formData = new FormData();
            Object.keys(input).forEach(key => {
                if (key === 'socialLinks') {
                    formData.append(key, JSON.stringify(input[key]));
                } else if (input[key] !== null) {
                    formData.append(key, input[key]);
                }
            });
            if (logoFile) formData.append("logo", logoFile);

            const res = await axios.put(`${API_BASE}/profile`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                withCredentials: true
            });

            if (res.data.success) {
                toast.success("Profile saved!");
                navigate("/recruiter/profile");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Setup failed");
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return <div className="h-[60vh] flex items-center justify-center"><Loader2 className="animate-spin text-indigo-600" size={32} /></div>;

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-24 px-4 font-sans text-slate-900">
            
            {/* Minimal Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 pb-6">
                <div className="space-y-1">
                    <h1 className="text-xl font-bold text-slate-800">Company Customization</h1>
                    <p className="text-xs text-slate-500 font-medium tracking-wide italic">Auto-fetch real data using Website & GPS.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <button 
                            onClick={() => setShowDemoMenu(!showDemoMenu)}
                            className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-all flex items-center gap-2 border border-slate-200"
                        >
                            Options <ChevronDown size={14} />
                        </button>
                        <AnimatePresence>
                            {showDemoMenu && (
                                <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:10}} className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-lg z-[110] overflow-hidden">
                                    <button onClick={handleMagicFill} className="w-full text-left px-4 py-3 text-xs font-bold text-indigo-600 hover:bg-indigo-50 flex items-center gap-2 border-b border-slate-50">
                                        <Sparkles size={14} /> Load Demo Data
                                    </button>
                                    <button onClick={() => navigate("/recruiter/profile")} className="w-full text-left px-4 py-3 text-xs font-bold text-slate-500 hover:bg-slate-50">
                                        Exit Without Saving
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                    <button 
                        onClick={submitHandler}
                        disabled={loading}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-sm hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                        {loading ? <Loader2 className="animate-spin" size={14}/> : "Save Changes"}
                    </button>
                </div>
            </div>

            <form onSubmit={submitHandler} className="space-y-6">
                
                {/* Identity */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600"><Building2 size={18} /></div>
                        <h3 className="text-sm font-bold text-slate-800">Identity & Branding</h3>
                    </div>

                    <div className="flex flex-col md:flex-row gap-8">
                        <div className="relative group shrink-0">
                            <div className="w-28 h-28 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center overflow-hidden transition-all group-hover:border-indigo-400">
                                {logoPreview ? <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" /> : <div className="text-slate-400 flex flex-col items-center gap-1"><ImageIcon size={20} /><span className="text-[9px] font-bold uppercase tracking-widest">Logo</span></div>}
                            </div>
                            <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                            <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-white rounded-full shadow-sm border border-slate-200 flex items-center justify-center text-indigo-600 pointer-events-none"><Plus size={14} /></div>
                        </div>

                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-5">
                            <FormInput label="Company Legal Name" name="companyName" value={input.companyName} onChange={changeEventHandler} placeholder="Acme Inc." />
                            <FormAutocomplete label="Industry" name="industry" value={input.industry} onChange={changeEventHandler} suggestions={industries} placeholder="e.g. Fintech" />
                            <div className="space-y-1.5 opacity-70">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Work Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                                    <input value={input.email} disabled className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-500" />
                                </div>
                            </div>
                            <div className="space-y-1.5 opacity-70">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                                    <input value={input.phoneNumber} disabled className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-500" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Location */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600"><MapPin size={18} /></div>
                            <h3 className="text-sm font-bold text-slate-800">Office Location</h3>
                        </div>
                        <button 
                            type="button" 
                            onClick={detectLocation}
                            disabled={locating}
                            className="px-3 py-1.5 bg-rose-50 text-rose-600 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-rose-100 transition-all flex items-center gap-2"
                        >
                            {locating ? <Loader2 className="animate-spin" size={12}/> : <Locate size={12}/>}
                            Detect My Location
                        </button>
                    </div>
                    <div className="space-y-5">
                        <FormInput label="Full Street Address" name="address" value={input.address} onChange={changeEventHandler} placeholder="Building, Area..." icon={<Map size={14}/>} />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            <FormAutocomplete label="City" name="city" value={input.city} onChange={changeEventHandler} suggestions={CITIES} placeholder="Search City..." />
                            <FormAutocomplete label="State / UT" name="state" value={input.state} onChange={changeEventHandler} suggestions={STATES} placeholder="Search State..." />
                            <FormInput label="Pincode" name="pincode" value={input.pincode} onChange={changeEventHandler} placeholder="6 Digit Code" />
                        </div>
                    </div>
                </div>

                {/* Details */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600"><FileText size={18} /></div>
                        <h3 className="text-sm font-bold text-slate-800">Corporate Classification</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <FormSelect label="Company Size" name="companySize" value={input.companySize} onChange={changeEventHandler} options={["1-10", "11-50", "51-200", "201-500", "500+"]} />
                        <FormSelect label="Company Type" name="companyType" value={input.companyType} onChange={changeEventHandler} options={["Product Based", "Service Based", "Startup", "MNC", "Agency"]} />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">About Company</label>
                        <textarea name="description" value={input.description} onChange={changeEventHandler} rows={3} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-600 transition-all text-sm font-medium leading-relaxed" placeholder="Describe your company culture..." />
                    </div>
                </div>

                {/* Website & POC */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600"><Sparkles size={18} /></div>
                        <h3 className="text-sm font-bold text-slate-800">Web & Direct Contact</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Official Website</label>
                            <div className="flex gap-2">
                                <div className="relative group flex-1">
                                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600" size={14} />
                                    <input name="website" value={input.website} onChange={changeEventHandler} placeholder="https://..." className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-600 transition-all text-sm font-semibold text-slate-700" />
                                </div>
                                <button type="button" onClick={fetchFromWebsite} className="px-4 py-2.5 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-indigo-100 transition-all">Fetch Info</button>
                            </div>
                        </div>
                        <FormInput label="GST Number" name="gstNumber" value={input.gstNumber} onChange={changeEventHandler} placeholder="15 Digit GSTIN" />
                        <FormInput label="Primary Contact" name="contactPersonName" value={input.contactPersonName} onChange={changeEventHandler} placeholder="Contact Person Name" icon={<UserCircle size={14}/>} />
                        <FormAutocomplete label="Designation" name="designation" value={input.designation} onChange={changeEventHandler} suggestions={designations} placeholder="Search Designation..." />
                    </div>
                </div>

            </form>
        </div>
    );
};

const FormAutocomplete = ({ label, name, value, onChange, suggestions, placeholder, icon }) => {
    const [filtered, setFiltered] = useState([]);
    const [show, setShow] = useState(false);
    const wrapperRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => { if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setShow(false); };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const onTextChange = (e) => {
        const val = e.target.value;
        onChange(e);
        if (val.length > 0) {
            const matches = suggestions.filter(s => s.toLowerCase().includes(val.toLowerCase()));
            setFiltered(matches);
            setShow(true);
        } else {
            setShow(false);
        }
    };

    const onSelect = (val) => {
        onChange({ target: { name, value: val } });
        setShow(false);
    };

    return (
        <div className="space-y-1.5 relative" ref={wrapperRef}>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{label}</label>
            <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors">
                    {icon || <Search size={14} />}
                </div>
                <input 
                    name={name} value={value} onChange={onTextChange} onFocus={() => value && setShow(true)}
                    placeholder={placeholder}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-600 transition-all text-sm font-semibold text-slate-700"
                />
            </div>
            <AnimatePresence>
                {show && filtered.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="absolute z-[100] left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden max-h-40 overflow-y-auto">
                        {filtered.map((item, i) => (
                            <button key={i} type="button" onClick={() => onSelect(item)} className="w-full text-left px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors border-b border-slate-50 last:border-0">
                                {item}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const FormInput = ({ label, icon, ...props }) => (
    <div className="space-y-1.5">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{label}</label>
        <div className="relative group">
            {icon && <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors">{icon}</div>}
            <input {...props} className={`w-full ${icon ? 'pl-10' : 'px-4'} pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-600 transition-all text-sm font-semibold text-slate-700 placeholder:text-slate-300`} />
        </div>
    </div>
);

const FormSelect = ({ label, options, ...props }) => (
    <div className="space-y-1.5">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{label}</label>
        <select {...props} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-600 transition-all text-sm font-semibold text-slate-700 appearance-none">
            <option value="">Select Option</option>
            {options.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
        </select>
    </div>
);

export default RecruiterProfileSetup;

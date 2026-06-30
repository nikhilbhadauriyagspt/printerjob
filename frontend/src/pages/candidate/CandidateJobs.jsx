import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, MapPin, Briefcase, DollarSign, 
  Filter, ChevronDown, Clock, Star, 
  Building2, ArrowRight, X, Loader2, BadgeIndianRupee,
  Sparkles, ChevronRight, CheckCircle2, Award
} from 'lucide-react';
import axios from 'axios';
import { JOB_API_END_POINT, ADMIN_API_END_POINT } from '../../utils/constant';
import CandidateHeader from './CandidateHeader';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';

const CandidateJobs = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useSelector(store => store.auth);
  
  const [jobs, setJobs] = useState([]);
  const [industries, setIndustries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    keyword: searchParams.get('keyword') || searchParams.get('companyName') || '',
    location: searchParams.get('location') || '',
    jobType: searchParams.get('jobType') || '',
    experienceLevel: '',
    industry: searchParams.get('industry') || ''
  });

  const [keywordSuggestions, setKeywordSuggestions] = useState([]);
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [showKeywordSuggs, setShowKeywordSuggs] = useState(false);
  const [showLocationSuggs, setShowLocationSuggs] = useState(false);

  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const isFirstMount = React.useRef(true);

  const fetchJobs = async (searchFilters = filters) => {
    try {
      setLoading(true);
      const res = await axios.get(`${JOB_API_END_POINT}/all`, { 
        params: searchFilters,
        withCredentials: true 
      });
      if (res.data.success) {
        setJobs(res.data.jobs);
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchIndustries = async () => {
      try {
        const res = await axios.get(`${ADMIN_API_END_POINT}/suggestions?type=industry`);
        if (res.data.success) setIndustries(res.data.suggestions);
      } catch (e) { console.error(e); }
    };
    fetchIndustries();
  }, []);

  // Sync search parameters from URL to filters state and fetch jobs
  useEffect(() => {
    const keyword = searchParams.get('keyword') || searchParams.get('companyName') || '';
    const location = searchParams.get('location') || '';
    const jobType = searchParams.get('jobType') || '';
    const industry = searchParams.get('industry') || '';

    const newFilters = {
      keyword,
      location,
      jobType,
      experienceLevel: filters.experienceLevel,
      industry
    };

    setFilters(newFilters);
    fetchJobs(newFilters);
  }, [searchParams]);

  // Fetch jobs when sidebar filters update (except on first mount where searchParams effect runs)
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    fetchJobs(filters);
  }, [filters.jobType, filters.experienceLevel, filters.industry]);

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    setShowKeywordSuggs(false);
    setShowLocationSuggs(false);
    fetchJobs();
  };

  // Keyword Suggestions
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (filters.keyword.length > 1 && showKeywordSuggs) {
        try {
          const res = await axios.get(`${ADMIN_API_END_POINT}/suggestions?type=jobtitle&query=${filters.keyword}`);
          if (res.data.success) setKeywordSuggestions(res.data.suggestions);
        } catch (e) { console.error(e); }
      } else {
        setKeywordSuggestions([]);
      }
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [filters.keyword, showKeywordSuggs]);

  // Location Suggestions
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (filters.location.length > 2 && showLocationSuggs) {
        try {
          const res = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${filters.location}&addressdetails=1&limit=10`);
          setLocationSuggestions(res.data);
        } catch (e) { console.error(e); }
      } else {
        setLocationSuggestions([]);
      }
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [filters.location, showLocationSuggs]);

  const formatSalary = (min, max, currency = 'INR') => {
    if (!min && !max) return 'Negotiable';
    const symbol = currency === 'USD' ? '$' : '₹';
    if (min && max) {
      return `${symbol}${parseInt(min).toLocaleString('en-IN')} - ${symbol}${parseInt(max).toLocaleString('en-IN')}`;
    }
    return min ? `${symbol}${parseInt(min).toLocaleString('en-IN')}` : `${symbol}${parseInt(max).toLocaleString('en-IN')}`;
  };

  const FilterSection = ({ title, options, field }) => (
    <div className="mb-8">
      <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center justify-between">
        {title}
        <ChevronDown size={14} className="text-slate-350" />
      </h3>
      <div className="space-y-2.5 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
        {options.map((opt) => (
          <label key={opt} className="flex items-center group cursor-pointer">
            <div className="relative flex items-center">
              <input 
                type="radio" 
                name={field}
                checked={filters[field] === opt}
                onChange={() => setFilters({ ...filters, [field]: filters[field] === opt ? '' : opt })}
                className="peer appearance-none w-4 h-4 border-2 border-slate-200 rounded-md checked:bg-indigo-650 checked:border-indigo-600 checked:bg-indigo-600 checked:border-indigo-600 transition-all"
              />
              <CheckCircle2 size={10} className="absolute left-0.5 text-white opacity-0 peer-checked:opacity-100" />
            </div>
            <span className="ml-3 text-xs font-bold text-slate-500 group-hover:text-slate-900 transition-colors capitalize">{opt}</span>
          </label>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f4f7fe]">
      <CandidateHeader />
      
      {/* Premium Search Header */}
      <div className="bg-gradient-to-b from-indigo-50/50 via-slate-50/30 to-[#f4f7fe] pt-32 pb-12">
        <div className="container mx-auto px-8 text-center mb-8">
          <span className="px-3 py-1 bg-indigo-50 text-indigo-650 rounded-full text-[10px] font-semibold uppercase tracking-wider select-none">
            Discover Openings
          </span>
          <h1 className="text-3xl font-bold text-slate-900 mt-3">
            Find Your Dream Job Today
          </h1>
          <p className="text-slate-500 text-sm mt-1.5 font-medium max-w-lg mx-auto">
            Browse through active roles verified by top tier recruiters. Filter by industry, salary & match rates.
          </p>
        </div>

        <div className="container mx-auto px-8">
          <form 
            onSubmit={handleSearch} 
            className="max-w-5xl mx-auto bg-white p-2.5 rounded-xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-2 relative z-10"
          >
            {/* Keyword Field */}
            <div className="flex-[1.5] w-full relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Job title, skills, or company"
                value={filters.keyword}
                onFocus={() => { setShowKeywordSuggs(true); setShowLocationSuggs(false); }}
                onChange={(e) => setFilters({...filters, keyword: e.target.value})}
                className="w-full pl-12 pr-4 py-4 bg-slate-50/50 border border-transparent rounded-2xl outline-none focus:border-indigo-100 focus:bg-white transition-all font-semibold text-xs placeholder:text-slate-450"
              />
              {/* Keyword suggestions */}
              <AnimatePresence>
                {showKeywordSuggs && keywordSuggestions.length > 0 && (
                  <motion.div 
                    initial={{opacity: 0, y: 5}} 
                    animate={{opacity: 1, y: 0}} 
                    className="absolute top-full left-0 w-full bg-white mt-2 border border-slate-100 shadow-2xl rounded-2xl z-50 overflow-hidden py-2"
                  >
                    {keywordSuggestions.map((s,i) => (
                      <button 
                        key={i} 
                        type="button"
                        onClick={() => { setFilters({...filters, keyword: s}); setShowKeywordSuggs(false); }} 
                        className="w-full text-left px-6 py-2.5 hover:bg-slate-50 text-xs font-bold text-slate-600 flex items-center space-x-3"
                      >
                        <Search size={12} className="text-slate-350" />
                        <span>{s}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Divider (Desktop) */}
            <div className="h-8 w-[1px] bg-slate-100 hidden md:block"></div>

            {/* Location Field */}
            <div className="flex-1 w-full relative">
              <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="City or Remote"
                value={filters.location}
                onFocus={() => { setShowLocationSuggs(true); setShowKeywordSuggs(false); }}
                onChange={(e) => setFilters({...filters, location: e.target.value})}
                className="w-full pl-12 pr-4 py-4 bg-slate-50/50 border border-transparent rounded-2xl outline-none focus:border-indigo-100 focus:bg-white transition-all font-semibold text-xs placeholder:text-slate-450"
              />
              {/* Location suggestions */}
              <AnimatePresence>
                {showLocationSuggs && locationSuggestions.length > 0 && (
                  <motion.div 
                    initial={{opacity: 0, y: 5}} 
                    animate={{opacity: 1, y: 0}} 
                    className="absolute top-full left-0 w-full bg-white mt-2 border border-slate-100 shadow-2xl rounded-2xl z-50 overflow-hidden py-2 max-h-60 overflow-y-auto"
                  >
                    {locationSuggestions.map((loc,i) => (
                      <button 
                        key={i} 
                        type="button"
                        onClick={() => { setFilters({...filters, location: loc.display_name.split(',')[0]}); setShowLocationSuggs(false); }} 
                        className="w-full text-left px-6 py-2.5 hover:bg-slate-50 text-xs font-bold text-slate-600 flex items-center space-x-3"
                      >
                        <MapPin size={12} className="text-slate-350" />
                        <span className="truncate">{loc.display_name}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <button type="submit" className="w-full md:w-auto px-10 py-4 bg-slate-900 text-white text-xs font-bold rounded-2xl hover:bg-indigo-600 transition-all shadow-lg active:scale-95 whitespace-nowrap">
              Find Jobs
            </button>

            {/* Backdrop click closer */}
            {(showKeywordSuggs || showLocationSuggs) && (
              <div className="fixed inset-0 z-40" onClick={() => { setShowKeywordSuggs(false); setShowLocationSuggs(false); }}></div>
            )}
          </form>
        </div>
      </div>

      {/* Main layout container */}
      <div className="container mx-auto px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          
          {/* Sticky Filter Sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-28 bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-6 border-b border-slate-50 pb-4">
                <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Filter size={16} className="text-indigo-600" />
                  Filters
                </h2>
                <button 
                  onClick={() => setFilters({ keyword: '', location: '', jobType: '', experienceLevel: '', industry: '' })}
                  className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 uppercase tracking-wider"
                >
                  Clear All
                </button>
              </div>

              <FilterSection 
                title="Job Type" 
                field="jobType"
                options={['full-time', 'part-time', 'internship', 'contract']} 
              />
              <FilterSection 
                title="Experience" 
                field="experienceLevel"
                options={['fresher', 'mid-level', 'senior', 'lead']} 
              />
              <FilterSection 
                title="Industry" 
                field="industry"
                options={industries} 
              />
            </div>
          </aside>

          {/* Jobs Listing Column */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-8">
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
                Showing <span className="text-slate-800 font-bold">{jobs.length} Opportunities</span>
              </p>
              <button 
                onClick={() => setShowMobileFilters(true)}
                className="lg:hidden flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-650 shadow-sm"
              >
                <Filter size={14} /> Filters
              </button>
            </div>

            {loading ? (
              <div className="space-y-5">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-44 bg-white border border-slate-100 rounded-xl animate-pulse"></div>
                ))}
              </div>
            ) : jobs.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-xl p-16 text-center shadow-sm">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                  <Search size={32} className="text-slate-350 text-slate-400" />
                </div>
                <h2 className="text-lg font-bold text-slate-900">No matching jobs found</h2>
                <p className="text-slate-500 text-xs mt-1.5 font-semibold max-w-xs mx-auto">Try refining your keyword queries or clearing filters to load other active openings.</p>
              </div>
            ) : (
              <div className="space-y-5">
                {jobs.map((job, idx) => {
                  // Skills matching analytics
                  const userSkills = Array.isArray(user?.skills) 
                    ? user.skills 
                    : JSON.parse(user?.skills || '[]');
                  
                  const jobSkills = Array.isArray(job.skills) 
                    ? job.skills 
                    : (typeof job.skills === 'string' && job.skills.startsWith('[') 
                        ? JSON.parse(job.skills) 
                        : (job.skills ? job.skills.split(',') : []));

                  return (
                    <motion.div 
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(idx * 0.05, 0.4) }}
                      key={job.id} 
                      className="group bg-white border border-slate-200 rounded-xl p-5 hover:border-indigo-200 transition-all cursor-pointer shadow-sm hover:shadow-md hover:-translate-y-0.5"
                      onClick={() => navigate(`/job/description/${job.id}`)}
                    >
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                        <div className="flex gap-5">
                          <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-50 overflow-hidden shrink-0 group-hover:bg-white transition-colors p-1.5">
                            {job.Company?.logo ? (
                              <img src={job.Company.logo} alt="Logo" className="w-full h-full object-contain" />
                            ) : (
                              <Building2 className="text-slate-300 group-hover:text-indigo-500 transition-colors" size={28} />
                            )}
                          </div>
                          <div>
                            <div className="flex flex-wrap items-center gap-2 mb-1.5">
                               <h3 className="text-base font-bold text-slate-850 group-hover:text-indigo-650 transition-colors leading-tight">{job.title}</h3>
                               {idx === 0 && (
                                 <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[9px] font-bold rounded-full uppercase tracking-wide">New</span>
                               )}
                            </div>
                            <p className="text-[10px] font-bold text-slate-450 uppercase tracking-widest mb-4 text-slate-400">{job.Company?.companyName || "Top Company"}</p>
                            
                            {/* Tags row */}
                            <div className="flex flex-wrap gap-2 mb-4">
                              <span className="flex items-center gap-1.5 text-[9px] font-bold text-slate-500 uppercase tracking-widest bg-slate-50 px-2.5 py-1 rounded-xl">
                                <MapPin size={10} /> {job.location}
                              </span>
                              <span className="flex items-center gap-1.5 text-[9px] font-bold text-indigo-650 uppercase tracking-widest bg-indigo-50 px-2.5 py-1 rounded-xl border border-indigo-100/40">
                                <DollarSign size={10} /> {formatSalary(job.minSalary, job.maxSalary)}
                              </span>
                              <span className="flex items-center gap-1.5 text-[9px] font-bold text-slate-500 uppercase tracking-widest bg-slate-50 px-2.5 py-1 rounded-xl">
                                <Briefcase size={10} /> {job.jobType}
                              </span>
                            </div>

                            {/* Matching Skills tag highlight (Absolute Killer UX) */}
                            {jobSkills.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 pt-1">
                                {jobSkills.slice(0, 4).map((skill) => {
                                  const isMatched = userSkills.some(us => {
                                    const usName = typeof us === 'object' ? us?.name : us;
                                    return typeof usName === 'string' && usName.toLowerCase() === skill.trim().toLowerCase();
                                  });
                                  return (
                                    <span 
                                      key={skill} 
                                      className={`text-[8.5px] font-bold px-2 py-0.5 rounded-md transition-all ${
                                        isMatched 
                                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100/50' 
                                        : 'bg-slate-50/50 text-slate-450 border border-slate-100 text-slate-500'
                                      }`}
                                    >
                                      {skill.trim()}
                                    </span>
                                  );
                                })}
                                {jobSkills.length > 4 && (
                                  <span className="text-[8px] font-bold text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded">
                                    +{jobSkills.length - 4} more
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex flex-col md:items-end justify-between md:self-stretch shrink-0">
                           <div className="flex items-center gap-1 text-amber-500 bg-amber-50/50 px-2.5 py-1 rounded-full border border-amber-100/50 self-start md:self-auto select-none">
                              <Star size={10} fill="currentColor" />
                              <span className="text-[9px] font-bold uppercase tracking-wider">Verified</span>
                           </div>
                           <button className="hidden md:flex items-center gap-1 text-[10px] font-bold text-indigo-650 group-hover:translate-x-1.5 transition-transform uppercase tracking-wider">
                             Details <ChevronRight size={14} />
                           </button>
                        </div>
                      </div>
                      
                      {/* Card Footer */}
                      <div className="mt-6 pt-5 border-t border-slate-50 flex items-center justify-between">
                         <div className="flex items-center gap-2 text-[9px] font-bold text-slate-450 uppercase tracking-widest text-slate-400">
                            <Clock size={12} />
                            Posted {new Date(job.createdAt).toLocaleDateString()}
                         </div>
                         <button className="md:hidden px-5 py-2 bg-slate-900 text-white text-[9px] font-bold tracking-widest uppercase rounded-xl">View Details</button>
                         <div className="hidden md:flex -space-x-1.5">
                            {[1, 2, 3].map(i => (
                              <div key={i} className="w-6 h-6 rounded-full border border-white bg-slate-100"></div>
                            ))}
                            <span className="text-[9px] font-bold text-slate-400 ml-3 self-center uppercase tracking-widest">Active matches</span>
                         </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      <AnimatePresence>
        {showMobileFilters && (
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="fixed inset-0 z-[60] bg-white p-8 lg:hidden"
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Filter size={18} className="text-indigo-600" />
                Filters
              </h2>
              <button onClick={() => setShowMobileFilters(false)} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200">
                <X size={18} />
              </button>
            </div>
            <div className="overflow-y-auto h-[calc(100%-140px)] pb-10 custom-scrollbar">
               <FilterSection title="Job Type" field="jobType" options={['full-time', 'part-time', 'internship', 'contract']} />
               <FilterSection title="Experience" field="experienceLevel" options={['fresher', 'mid-level', 'senior', 'lead']} />
               <FilterSection title="Industry" field="industry" options={industries} />
            </div>
            <button 
              onClick={() => setShowMobileFilters(false)}
              className="absolute bottom-6 left-6 right-6 py-4 bg-slate-900 text-white text-xs font-bold rounded-2xl shadow-xl hover:bg-indigo-600 transition-all"
            >
              Apply Filters
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CandidateJobs;

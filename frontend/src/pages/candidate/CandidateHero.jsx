import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, X, UserPlus, FileUp, Send, Code, DollarSign, Palette, Megaphone, Users, Activity, Briefcase, ArrowRight, ChevronLeft, ChevronRight, Building2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ADMIN_API_END_POINT, JOB_API_END_POINT } from '../../utils/constant';

const CandidateHero = () => {
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [keywordSuggestions, setKeywordSuggestions] = useState([]);
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [showKeywordSuggs, setShowKeywordSuggs] = useState(false);
  const [showLocationSuggs, setShowLocationSuggs] = useState(false);
  const [loadingSuggs, setLoadingSuggs] = useState(false);
  
  const navigate = useNavigate();
  const sliderRef = useRef(null);

  const words = ["dream job", "remote role", "tech career", "future path", "opportunity"];
  const [wordIndex, setWordIndex] = useState(0);
  const [companies, setCompanies] = useState([]);
  const [industries, setIndustries] = useState([]);
  const [jobCountsByIndustry, setJobCountsByIndustry] = useState({});
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % words.length);
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  // Combined dynamic data loader
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Fetch public jobs to calculate dynamic counts per industry, extract companies, and store job listings
        const jobsRes = await axios.get(`${JOB_API_END_POINT}/all`);
        if (jobsRes.data.success) {
          setJobs(jobsRes.data.jobs);
          
          const uniqueCompaniesMap = {};
          const counts = {};
          jobsRes.data.jobs.forEach(job => {
            if (job.Company) {
              uniqueCompaniesMap[job.Company.companyName] = job.Company;
            }
            if (job.industry) {
              const cleaned = job.industry.trim();
              counts[cleaned] = (counts[cleaned] || 0) + 1;
            }
          });
          setCompanies(Object.values(uniqueCompaniesMap));
          setJobCountsByIndustry(counts);
        }

        // 2. Fetch approved industries dynamically
        const indRes = await axios.get(`${ADMIN_API_END_POINT}/suggestions?type=industry`);
        if (indRes.data.success) {
          setIndustries(indRes.data.suggestions);
        }
      } catch (e) {
        console.error("Error fetching hero analytics data:", e);
      }
    };
    fetchData();
  }, []);

  const handleSearch = () => {
    if (keyword || location) {
      navigate(`/jobs?keyword=${encodeURIComponent(keyword)}&location=${encodeURIComponent(location)}`);
    } else {
      navigate('/jobs');
    }
  };

  const handleTagClick = (tag) => {
    if (tag === 'Remote') {
      navigate(`/jobs?location=Remote`);
    } else {
      navigate(`/jobs?keyword=${encodeURIComponent(tag)}`);
    }
  };

  const scrollLeft = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: -340, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: 340, behavior: 'smooth' });
    }
  };

  // Helper salary formatter
  const formatSalary = (min, max, currency = 'INR') => {
    if (!min && !max) return 'Salary Negotiable';
    const symbol = currency === 'USD' ? '$' : '₹';
    if (min && max) {
      return `${symbol}${parseInt(min).toLocaleString('en-IN')} - ${symbol}${parseInt(max).toLocaleString('en-IN')}`;
    }
    return min ? `${symbol}${parseInt(min).toLocaleString('en-IN')}` : `${symbol}${parseInt(max).toLocaleString('en-IN')}`;
  };

  // Helper date formatter
  const formatPostDate = (dateString) => {
    if (!dateString) return 'Just now';
    const diffTime = Math.abs(new Date() - new Date(dateString));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays <= 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    return `${diffDays} days ago`;
  };

  // Suggestions debouncing for Keyword
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (keyword.trim().length > 1 && showKeywordSuggs) {
        setLoadingSuggs(true);
        try {
          const res = await axios.get(`${ADMIN_API_END_POINT}/suggestions?type=jobtitle&query=${keyword}`);
          if (res.data.success) {
            setKeywordSuggestions(res.data.suggestions);
          }
        } catch (e) {
          console.error(e);
        } finally {
          setLoadingSuggs(false);
        }
      } else {
        setKeywordSuggestions([]);
      }
    }, 250);
    return () => clearTimeout(delayDebounce);
  }, [keyword, showKeywordSuggs]);

  // Suggestions debouncing for Location (OSM Nominatim API - matches Jobs page)
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (location.trim().length > 2 && showLocationSuggs) {
        setLoadingSuggs(true);
        try {
          const res = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${location}&addressdetails=1&limit=6`);
          setLocationSuggestions(res.data);
        } catch (e) {
          console.error(e);
        } finally {
          setLoadingSuggs(false);
        }
      } else {
        setLocationSuggestions([]);
      }
    }, 400);
    return () => clearTimeout(delayDebounce);
  }, [location, showLocationSuggs]);

  const popularTags = ["Remote", "React", "Node.js", "UI/UX", "Product Manager", "Python"];

  // Helper mappings for dynamic database industry records
  const getIndustryIcon = (name) => {
    const n = name.toLowerCase();
    if (n.includes('software') || n.includes('tech') || n.includes('code') || n.includes('develop')) return <Code size={22} />;
    if (n.includes('finance') || n.includes('bank') || n.includes('money') || n.includes('account')) return <DollarSign size={22} />;
    if (n.includes('design') || n.includes('creative') || n.includes('art') || n.includes('palette')) return <Palette size={22} />;
    if (n.includes('market') || n.includes('sale') || n.includes('grow') || n.includes('ad') || n.includes('pr')) return <Megaphone size={22} />;
    if (n.includes('hr') || n.includes('recruit') || n.includes('people') || n.includes('human') || n.includes('talent')) return <Users size={22} />;
    if (n.includes('health') || n.includes('med') || n.includes('doctor') || n.includes('hospital')) return <Activity size={22} />;
    return <Briefcase size={22} />;
  };

  const getIndustryDescription = (name) => {
    const n = name.toLowerCase();
    if (n.includes('software') || n.includes('tech') || n.includes('code') || n.includes('develop')) return "Frontend, backend, cloud, devops & fullstack engineering.";
    if (n.includes('finance') || n.includes('bank') || n.includes('money') || n.includes('account')) return "Banking, investment, accounting & financial planning.";
    if (n.includes('design') || n.includes('creative') || n.includes('art') || n.includes('palette')) return "UI/UX design, graphics, illustration & product design.";
    if (n.includes('market') || n.includes('sale') || n.includes('grow') || n.includes('ad') || n.includes('pr')) return "SEO, growth marketing, content creation & digital ads.";
    if (n.includes('hr') || n.includes('recruit') || n.includes('people') || n.includes('human') || n.includes('talent')) return "Talent acquisition, culture, operations & recruiting.";
    if (n.includes('health') || n.includes('med') || n.includes('doctor') || n.includes('hospital')) return "Clinical, medical tech, nursing & healthcare admin.";
    return "Find relevant jobs, view salaries, and connect with top teams in this domain.";
  };

  const displayIndustries = industries.length > 0
    ? industries.map(name => ({
        name,
        count: jobCountsByIndustry[name] || 0,
        desc: getIndustryDescription(name)
      }))
    : [
        { name: "Software Development", count: jobCountsByIndustry["Software Development"] || 12, desc: "Frontend, backend, cloud, devops & fullstack engineering." },
        { name: "Finance & Banking", count: jobCountsByIndustry["Finance & Banking"] || 5, desc: "Banking, investment, accounting & financial planning." },
        { name: "Design & Creative", count: jobCountsByIndustry["Design & Creative"] || 8, desc: "UI/UX design, graphics, illustration & product design." },
        { name: "Marketing & Growth", count: jobCountsByIndustry["Marketing & Growth"] || 6, desc: "SEO, growth marketing, content creation & digital ads." },
        { name: "Healthcare", count: jobCountsByIndustry["Healthcare"] || 3, desc: "Clinical, medical tech, nursing & healthcare admin." },
        { name: "Human Resources", count: jobCountsByIndustry["Human Resources"] || 4, desc: "Talent acquisition, culture, operations & recruiting." },
        { name: "Customer Support", count: jobCountsByIndustry["Customer Support"] || 2, desc: "Client support, helpdesk, success & service management." },
        { name: "Operations", count: jobCountsByIndustry["Operations"] || 4, desc: "Business operations, logistics, processes & strategy." }
      ];

  return (
    <div className="relative pt-32 pb-0 bg-white overflow-hidden">
      
      {/* Full Background mesh grid and glowing radial gradients */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Subtle grid lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:4.5rem_4.5rem] opacity-40"></div>
        {/* Glowing gradients */}
        <div className="absolute top-[-10%] right-[-10%] w-[45rem] h-[45rem] bg-indigo-50/60 rounded-full blur-[140px]"></div>
        <div className="absolute bottom-[-10%] left-[-15%] w-[45rem] h-[45rem] bg-blue-50/60 rounded-full blur-[140px]"></div>
      </div>
      
      {/* Header aligned width container */}
      <div className="container mx-auto px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Heading and Search Hub */}
          <div className="lg:col-span-7 text-left space-y-7">
            
            {/* Elegant Minimal Badge */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center space-x-2 px-3.5 py-1.5 bg-indigo-50/50 border border-indigo-100/30 rounded-full text-xs font-semibold text-indigo-600"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
              <span>Discover verified career paths</span>
            </motion.div>

            {/* Clean Semibold Heading with Colorful highlight */}
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-semibold text-slate-900 leading-[1.3] tracking-tight">
                Find the right{" "}
                <span className="inline-block relative min-w-[140px] sm:min-w-[240px] h-[1.25em] align-bottom overflow-hidden">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={wordIndex}
                      initial={{ opacity: 0, y: "100%" }}
                      animate={{ opacity: 1, y: "0%" }}
                      exit={{ opacity: 0, y: "-100%" }}
                      transition={{ duration: 0.35, ease: "easeInOut" }}
                      className="text-indigo-600 font-bold absolute left-0 bottom-0 capitalize"
                    >
                      {words[wordIndex]}
                    </motion.span>
                  </AnimatePresence>
                </span>
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 font-bold">
                  Build your best future.
                </span>
              </h1>
              <p className="text-slate-500 text-lg leading-relaxed font-medium max-w-lg">
                Search through thousands of developer, designer, and tech roles at modern companies. Simple, fast, and verified.
              </p>
            </div>

            {/* Super Clean Flat Search Console (No Shadows / No Heavy Borders) */}
            <div className="relative max-w-xl">
              <div className="bg-white p-1.5 rounded-2xl sm:rounded-full border border-slate-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.03)] flex flex-col sm:flex-row items-center gap-1">
                
                {/* Keyword input */}
                <div className="flex-1 w-full flex items-center space-x-3 px-4 py-2 border-b sm:border-b-0 sm:border-r border-slate-100 relative">
                  <Search className="text-slate-400 shrink-0" size={18} />
                  <input
                    type="text"
                    placeholder="Job title, tech stack..."
                    value={keyword}
                    onFocus={() => { setShowKeywordSuggs(true); setShowLocationSuggs(false); }}
                    onChange={(e) => setKeyword(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="w-full bg-transparent border-none focus:outline-none text-[15px] text-slate-850 placeholder:text-slate-400 font-semibold"
                  />
                  {keyword && (
                    <button onClick={() => setKeyword('')} className="p-1 hover:bg-slate-100 rounded-full text-slate-400">
                      <X size={14} />
                    </button>
                  )}

                  {/* Keyword Suggestions Dropdown with Empty State */}
                  <AnimatePresence>
                    {showKeywordSuggs && (keywordSuggestions.length > 0 || (keyword.trim().length > 1 && !loadingSuggs)) && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        className="absolute top-full left-0 w-[calc(100%+2rem)] -ml-4 bg-white mt-3 border border-slate-200/60 shadow-2xl rounded-2xl overflow-hidden z-40 py-1"
                      >
                        {keywordSuggestions.length > 0 ? (
                          keywordSuggestions.map((s, idx) => (
                            <button
                              key={idx}
                              onClick={() => { setKeyword(s); setShowKeywordSuggs(false); }}
                              className="w-full text-left px-5 py-3 hover:bg-slate-55 text-[14px] font-medium text-slate-700 flex items-center space-x-3 transition-colors"
                            >
                              <Search size={14} className="text-slate-400" />
                              <span>{s}</span>
                            </button>
                          ))
                        ) : (
                          <div className="px-5 py-3.5 text-[14px] text-slate-500 font-medium select-none text-left">
                            No matching titles found in our portal
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Location input */}
                <div className="flex-1 w-full flex items-center space-x-3 px-4 py-2 relative">
                  <MapPin className="text-slate-400 shrink-0" size={18} />
                  <input
                    type="text"
                    placeholder="City or 'Remote'"
                    value={location}
                    onFocus={() => { setShowLocationSuggs(true); setShowKeywordSuggs(false); }}
                    onChange={(e) => setLocation(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="w-full bg-transparent border-none focus:outline-none text-[15px] text-slate-855 placeholder:text-slate-400 font-semibold"
                  />
                  {location && (
                    <button onClick={() => setLocation('')} className="p-1 hover:bg-slate-100 rounded-full text-slate-400">
                      <X size={14} />
                    </button>
                  )}

                  {/* Location Suggestions Dropdown (OSM Nominatim API - matches Jobs page) */}
                  <AnimatePresence>
                    {showLocationSuggs && (locationSuggestions.length > 0 || (location.trim().length > 2 && !loadingSuggs)) && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        className="absolute top-full left-0 w-[calc(100%+2rem)] -ml-4 bg-white mt-3 border border-slate-200/60 shadow-2xl rounded-2xl overflow-hidden z-40 py-1 max-h-60 overflow-y-auto"
                      >
                        {locationSuggestions.length > 0 ? (
                          locationSuggestions.map((loc, idx) => (
                            <button
                              key={idx}
                              onClick={() => {
                                const shortName = loc.display_name.split(',')[0];
                                setLocation(shortName);
                                setShowLocationSuggs(false);
                              }}
                              className="w-full text-left px-5 py-3 hover:bg-slate-55 text-[14px] font-medium text-slate-700 flex items-center space-x-3 transition-colors"
                            >
                              <MapPin size={14} className="text-slate-400" />
                              <span className="truncate">{loc.display_name}</span>
                            </button>
                          ))
                        ) : (
                          <div className="px-5 py-3.5 text-[14px] text-slate-500 font-medium select-none text-left">
                            No locations found
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Search button */}
                <button
                  onClick={handleSearch}
                  className="w-full sm:w-auto px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl sm:rounded-full transition-all active:scale-95 duration-200"
                >
                  Search
                </button>
              </div>

              {/* Click Outside Overlay */}
              {(showKeywordSuggs || showLocationSuggs) && (
                <div className="fixed inset-0 z-10" onClick={() => { setShowKeywordSuggs(false); setShowLocationSuggs(false); }}></div>
              )}
            </div>

            {/* Popular search tags */}
            <div className="flex flex-wrap gap-2 items-center text-xs text-slate-450 pt-2">
              <span className="font-semibold uppercase tracking-wider mr-1 text-slate-400">Popular:</span>
              {popularTags.map((tag, idx) => (
                <button
                  key={idx}
                  onClick={() => handleTagClick(tag)}
                  className="px-3.5 py-1.5 bg-slate-55 bg-slate-50 hover:bg-indigo-50 border border-slate-200/60 hover:border-indigo-100 text-slate-600 hover:text-indigo-600 font-semibold rounded-full transition-all duration-200 active:scale-95"
                >
                  {tag}
                </button>
              ))}
            </div>

          </div>

          {/* Right Column: Bare Vector Illustration (No Box, No Borders, No Shadows) */}
          <div className="lg:col-span-5 relative hidden lg:block">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="relative flex justify-center lg:justify-end"
            >
              <img
                src="/job_search_illustration.jpg?v=4"
                alt="Job Search Illustration"
                className="w-full max-w-[460px] h-auto object-contain select-none pointer-events-none mix-blend-multiply contrast-[1.08] brightness-[1.02]"
              />
            </motion.div>
          </div>

        </div>
      </div>

      {/* Corporate branding full-width indigo background block */}
      <div className="w-full bg-indigo-600 border-none mt-24 py-12 relative z-10">
        <div className="container mx-auto px-8 text-center">
          <h3 className="text-xl sm:text-2xl font-semibold text-white tracking-normal mb-8">Partnering with modern tech teams</h3>
          <div className="flex flex-wrap justify-center items-center gap-10 md:gap-16">
            {companies.length > 0 ? (
              companies.map((company, idx) => (
                <div key={idx} className="flex items-center space-x-2 opacity-90 hover:opacity-100 transition-all duration-200">
                  {company.logo ? (
                    <img
                      src={company.logo}
                      alt={company.companyName}
                      className="h-8 object-contain max-w-[120px] filter brightness-0 invert"
                    />
                  ) : (
                    <span className="text-[15px] font-bold text-white tracking-wide select-none">
                      {company.companyName}
                    </span>
                  )}
                </div>
              ))
            ) : (
              // Fallback white names
              <>
                <span className="text-[15px] font-bold text-white tracking-wide select-none opacity-80">Google</span>
                <span className="text-[15px] font-bold text-white tracking-wide select-none opacity-80">Microsoft</span>
                <span className="text-[15px] font-bold text-white tracking-wide select-none opacity-80">Meta</span>
                <span className="text-[15px] font-bold text-white tracking-wide select-none opacity-80">Netflix</span>
                <span className="text-[15px] font-bold text-white tracking-wide select-none opacity-80">Stripe</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* How it works section */}
      <div className="w-full bg-white py-20 lg:py-28 relative z-10 border-b border-slate-100/60">
        <div className="container mx-auto px-8">
          
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="text-3xl sm:text-4xl font-semibold text-slate-900 tracking-tight">How <span className="text-indigo-600">it</span> works</h2>
            <p className="text-slate-500 text-base sm:text-lg leading-relaxed font-medium">Get matched with your dream job in three simple steps.</p>
          </div>

          {/* Steps Grid with Framer Motion Staggered Entry */}
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={{
              hidden: {},
              visible: {
                transition: {
                  staggerChildren: 0.12
                }
              }
            }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10"
          >
            
            {/* Step 1 */}
            <motion.div 
              variants={{
                hidden: { opacity: 0, y: 25 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
              }}
              className="p-8 rounded-2xl border border-slate-100 bg-white space-y-6 relative hover:border-indigo-200/80 hover:shadow-[0_12px_40px_rgba(99,102,241,0.03)] transition-all duration-300 group"
            >
              <span className="text-5xl font-black text-slate-100/60 absolute right-8 top-8 select-none pointer-events-none group-hover:text-indigo-50/50 transition-colors duration-300">01</span>
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shadow-sm shadow-indigo-100/20">
                <UserPlus size={22} />
              </div>
              <div className="space-y-3">
                <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md">Step 01</span>
                <h4 className="text-xl font-semibold text-slate-800 pt-1">Create Account</h4>
                <p className="text-[14px] text-slate-500 leading-relaxed font-medium">
                  Register with your mobile number. Securely verify your credentials via OTP to build your trust score.
                </p>
              </div>
            </motion.div>

            {/* Step 2 */}
            <motion.div 
              variants={{
                hidden: { opacity: 0, y: 25 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
              }}
              className="p-8 rounded-2xl border border-slate-100 bg-white space-y-6 relative hover:border-indigo-200/80 hover:shadow-[0_12px_40px_rgba(99,102,241,0.03)] transition-all duration-300 group"
            >
              <span className="text-5xl font-black text-slate-100/60 absolute right-8 top-8 select-none pointer-events-none group-hover:text-indigo-50/50 transition-colors duration-300">02</span>
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shadow-sm shadow-indigo-100/20">
                <FileUp size={22} />
              </div>
              <div className="space-y-3">
                <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md">Step 02</span>
                <h4 className="text-xl font-semibold text-slate-800 pt-1">Upload & Parse</h4>
                <p className="text-[14px] text-slate-500 leading-relaxed font-medium">
                  Upload your PDF resume. Our AI engine automatically extracts your skills, experience, and profile details.
                </p>
              </div>
            </motion.div>

            {/* Step 3 */}
            <motion.div 
              variants={{
                hidden: { opacity: 0, y: 25 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
              }}
              className="p-8 rounded-2xl border border-slate-100 bg-white space-y-6 relative hover:border-indigo-200/80 hover:shadow-[0_12px_40px_rgba(99,102,241,0.03)] transition-all duration-300 group"
            >
              <span className="text-5xl font-black text-slate-100/60 absolute right-8 top-8 select-none pointer-events-none group-hover:text-indigo-50/50 transition-colors duration-300">03</span>
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shadow-sm shadow-indigo-100/20">
                <Send size={22} />
              </div>
              <div className="space-y-3">
                <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md">Step 03</span>
                <h4 className="text-xl font-semibold text-slate-800 pt-1">Apply & Track</h4>
                <p className="text-[14px] text-slate-500 leading-relaxed font-medium">
                  Submit applications with one click. Track real-time status updates from under review to final offer.
                </p>
              </div>
            </motion.div>

          </motion.div>

        </div>
      </div>

      {/* Browse by Industry section */}
      <div className="w-full bg-slate-50/50 py-20 lg:py-28 relative z-10 border-b border-slate-100/60">
        <div className="container mx-auto px-8">
          
          {/* Section Header with Left-Right scroll controls */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div className="text-left max-w-2xl space-y-3">
              <h2 className="text-3xl sm:text-4xl font-semibold text-slate-900 tracking-tight">
                Browse by <span className="text-indigo-600">Industry</span>
              </h2>
              <p className="text-slate-500 text-base sm:text-lg leading-relaxed font-medium">
                Explore roles in every sector. Your perfect match is waiting for you in one of these categories.
              </p>
            </div>
            
            {/* Slider Navigation Buttons */}
            <div className="flex space-x-2.5 mt-6 md:mt-0">
              <button 
                onClick={scrollLeft}
                className="w-10 h-10 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-650 hover:bg-indigo-50 hover:border-indigo-100 active:scale-90 transition-all shadow-sm"
              >
                <ChevronLeft size={20} className="text-slate-600 hover:text-indigo-600" />
              </button>
              <button 
                onClick={scrollRight}
                className="w-10 h-10 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-650 hover:bg-indigo-50 hover:border-indigo-100 active:scale-90 transition-all shadow-sm"
              >
                <ChevronRight size={20} className="text-slate-600 hover:text-indigo-600" />
              </button>
            </div>
          </div>

          {/* Horizontal Swiper Grid */}
          <div 
            ref={sliderRef}
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            className="flex overflow-x-auto scroll-smooth snap-x snap-mandatory gap-6 lg:gap-8 pb-6 relative z-10 [&::-webkit-scrollbar]:hidden"
          >
            {displayIndustries.map((ind, idx) => (
              <div
                key={idx}
                onClick={() => navigate(`/jobs?industry=${encodeURIComponent(ind.name)}`)}
                className="w-[290px] sm:w-[320px] shrink-0 snap-start bg-white border border-slate-100 p-8 rounded-2xl flex flex-col justify-between hover:border-indigo-200/80 hover:shadow-[0_12px_40px_rgba(99,102,241,0.03)] transition-all duration-300 group cursor-pointer"
              >
                <div>
                  <div className="flex justify-between items-center">
                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shadow-sm shadow-indigo-100/20">
                      {getIndustryIcon(ind.name)}
                    </div>
                    <span className="text-[12px] font-semibold text-slate-500 bg-slate-50 border border-slate-100 px-3 py-1 rounded-full group-hover:bg-indigo-50 group-hover:text-indigo-655 transition-colors">
                      {ind.count} {ind.count === 1 ? 'Job' : 'Jobs'}
                    </span>
                  </div>
                  <h4 className="text-[18px] font-semibold text-slate-800 pt-6 group-hover:text-indigo-600 transition-colors">
                    {ind.name}
                  </h4>
                  <p className="text-[14px] text-slate-500 leading-relaxed font-medium mt-2">
                    {ind.desc}
                  </p>
                </div>
                <div className="text-xs font-bold text-indigo-600 flex items-center space-x-1.5 pt-6 group-hover:text-indigo-700">
                  <span>Explore Roles</span>
                  <ArrowRight size={14} className="transform group-hover:translate-x-1.5 transition-transform duration-200" />
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* Latest Jobs section (Indeed/Apna style but cleaner) */}
      <div className="w-full bg-white py-20 lg:py-28 relative z-10">
        <div className="container mx-auto px-8">
          
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="text-3xl sm:text-4xl font-semibold text-slate-900 tracking-tight">
              Latest Job <span className="text-indigo-600">Openings</span>
            </h2>
            <p className="text-slate-500 text-base sm:text-lg leading-relaxed font-medium">
              Explore recently posted developer, designer, and tech roles. Your next career move starts here.
            </p>
          </div>

          {/* Jobs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {jobs.length > 0 ? (
              jobs.slice(0, 9).map((job, idx) => {
                const renderLoc = Array.isArray(job.location) ? job.location.join(', ') : job.location;
                const skillsArray = Array.isArray(job.skills) ? job.skills : JSON.parse(job.skills || '[]');
                
                return (
                  <div 
                    key={job.id || idx}
                    onClick={() => navigate(`/job/description/${job.id}`)}
                    className="bg-white border border-slate-100 p-6 rounded-2xl flex flex-col justify-between hover:border-indigo-200/80 hover:shadow-[0_12px_40px_rgba(99,102,241,0.03)] transition-all duration-300 relative group cursor-pointer"
                  >
                    <div>
                      {/* Top Row: Logo & Badges */}
                      <div className="flex justify-between items-start">
                        {job.Company?.logo ? (
                          <img 
                            src={job.Company.logo} 
                            alt={job.Company.companyName}
                            className="w-12 h-12 object-contain rounded-xl border border-slate-100"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
                            <Building2 size={20} />
                          </div>
                        )}
                        <div className="flex space-x-1.5">
                          {job.isUrgent && (
                            <span className="text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-md uppercase tracking-wider">Urgent</span>
                          )}
                          {job.isFeatured && (
                            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-md uppercase tracking-wider">Featured</span>
                          )}
                        </div>
                      </div>

                      {/* Job Info */}
                      <div className="pt-4 space-y-1">
                        <h4 className="text-[17px] font-bold text-slate-800 group-hover:text-indigo-655 transition-colors capitalize">
                          {job.title}
                        </h4>
                        <p className="text-sm font-semibold text-slate-550">{job.Company?.companyName || 'Confidential'}</p>
                      </div>

                      {/* Meta Tags (Location, JobType) */}
                      <div className="flex flex-wrap gap-2 pt-3">
                        <div className="flex items-center text-slate-500 text-xs font-medium space-x-1">
                          <MapPin size={13} className="text-slate-400" />
                          <span className="capitalize truncate max-w-[140px]">{renderLoc}</span>
                        </div>
                        <span className="bg-slate-50 border border-slate-100 text-slate-650 text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize">
                          {job.jobType}
                        </span>
                      </div>

                      {/* Salary Details */}
                      <div className="pt-3">
                        <span className="text-[12px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100/40 px-2.5 py-0.5 rounded-full">
                          {formatSalary(job.minSalary, job.maxSalary, job.currency)}
                        </span>
                      </div>

                      {/* Skills Tags */}
                      {skillsArray.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-4">
                          {skillsArray.slice(0, 3).map((skill, sIdx) => (
                            <span key={sIdx} className="bg-indigo-50/50 text-indigo-600 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Bottom CTA / Date */}
                    <div className="border-t border-slate-100 mt-5 pt-4 flex justify-between items-center">
                      <span className="text-xs font-semibold text-slate-400">
                        {formatPostDate(job.createdAt)}
                      </span>
                      <div className="text-xs font-bold text-indigo-600 flex items-center space-x-1 group-hover:text-indigo-700">
                        <span>Apply Now</span>
                        <ArrowRight size={14} className="transform group-hover:translate-x-1 transition-transform duration-200" />
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              // Empty fallback jobs
              <div className="col-span-full text-center py-10">
                <p className="text-slate-500 font-medium">No job openings found in our database yet.</p>
              </div>
            )}
          </div>

          {/* Explore all jobs CTA */}
          {jobs.length > 9 && (
            <div className="text-center mt-12">
              <button 
                onClick={() => navigate('/jobs')}
                className="inline-flex items-center space-x-2 px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl transition-all active:scale-95 duration-200"
              >
                <span>Browse All Openings</span>
                <ArrowRight size={16} />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default CandidateHero;

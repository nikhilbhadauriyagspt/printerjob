import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import CandidateHeader from './CandidateHeader';
import CandidateHero from './CandidateHero';
import CandidateLoginPopup from './CandidateLoginPopup';
import { Briefcase, Twitter, Linkedin, Github, Facebook, Building2, Sparkles, ShieldCheck, Activity, Cpu, ChevronLeft, ChevronRight, MapPin, ArrowRight } from 'lucide-react';
import { JOB_API_END_POINT } from '../../utils/constant';

const CandidateHome = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [jobs, setJobs] = useState([]);
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCompaniesData = async () => {
      try {
        const res = await axios.get(`${JOB_API_END_POINT}/all`);
        if (res.data.success) {
          setJobs(res.data.jobs);
          const uniqueCompaniesMap = {};
          res.data.jobs.forEach(job => {
            if (job.Company) {
              uniqueCompaniesMap[job.Company.companyName] = job.Company;
            }
          });
          setCompanies(Object.values(uniqueCompaniesMap));
        }
      } catch (e) {
        console.error("Error fetching homepage company directory:", e);
      }
    };
    fetchCompaniesData();
  }, []);

  // Group jobs by location to get open vacancy counts
  const locationMap = {};
  jobs.forEach(job => {
    let locs = [];
    if (Array.isArray(job.location)) {
      locs = job.location;
    } else if (typeof job.location === 'string') {
      try {
        const parsed = JSON.parse(job.location);
        locs = Array.isArray(parsed) ? parsed : [parsed];
      } catch (e) {
        locs = [job.location];
      }
    }
    
    locs.forEach(loc => {
      if (!loc) return;
      const cleanLoc = loc.trim();
      if (!locationMap[cleanLoc]) {
        locationMap[cleanLoc] = 0;
      }
      locationMap[cleanLoc] += 1;
    });
  });

  const defaultCities = [
    { name: "Remote", icon: "🏠", image: "/locations/remote.webp" },
    { name: "Delhi", icon: "🏛️", image: "/locations/delhi.webp" },
    { name: "Noida", icon: "🏢", image: "/locations/noida.webp" },
    { name: "Bangalore", icon: "💻", image: "/locations/bangalore.webp" },
    { name: "Mumbai", icon: "🌊", image: "/locations/mumbai.webp" },
    { name: "Pune", icon: "⛰️", image: "/locations/pune.webp" },
    { name: "Hyderabad", icon: "🏰", image: "/locations/hyderabad.webp" }
  ];

  const locationsData = defaultCities.map(city => {
    const matchKey = Object.keys(locationMap).find(k => k.toLowerCase().includes(city.name.toLowerCase()) || city.name.toLowerCase().includes(k.toLowerCase()));
    return {
      ...city,
      count: matchKey ? locationMap[matchKey] : 0
    };
  });

  Object.keys(locationMap).forEach(loc => {
    const isIncluded = defaultCities.some(city => city.name.toLowerCase().includes(loc.toLowerCase()) || loc.toLowerCase().includes(city.name.toLowerCase()));
    if (!isIncluded) {
      locationsData.push({
        name: loc,
        icon: "📍",
        count: locationMap[loc],
        image: "/locations/remote.webp"
      });
    }
  });

  const scrollContainerRef = useRef(null);

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const { scrollLeft, clientWidth } = scrollContainerRef.current;
      const scrollAmount = clientWidth * 0.75;
      scrollContainerRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="min-h-screen bg-white selection:bg-indigo-100 selection:text-indigo-900">
      <CandidateHeader onLoginClick={() => setIsLoginOpen(true)} />
      <CandidateHero />
      <CandidateLoginPopup isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      
      {/* Jobs by Location Slider Section */}
      <section className="py-20 bg-white relative z-10 border-t border-slate-100/50">
        <div className="container mx-auto px-8">
          {/* Header with Slider Controls */}
          <div className="flex items-end justify-between mb-10">
            <div className="space-y-2">
              <h2 className="text-3xl font-semibold tracking-tight text-slate-900">
                Explore Jobs by <span className="text-indigo-650">Location</span>
              </h2>
              <p className="text-slate-500 text-sm font-medium font-sans">
                Browse open vacancies based on cities or remote work preference.
              </p>
            </div>
            
            {/* Control buttons */}
            <div className="flex gap-2">
              <button 
                onClick={() => scroll('left')}
                className="w-10 h-10 rounded-full border border-slate-200 hover:border-slate-350 hover:bg-slate-50 flex items-center justify-center text-slate-650 transition-all cursor-pointer"
              >
                <ChevronLeft size={18} />
              </button>
              <button 
                onClick={() => scroll('right')}
                className="w-10 h-10 rounded-full border border-slate-200 hover:border-slate-350 hover:bg-slate-50 flex items-center justify-center text-slate-650 transition-all cursor-pointer"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          {/* Slider Container */}
          <div 
            ref={scrollContainerRef}
            className="flex overflow-x-auto gap-6 pb-6 scrollbar-hide snap-x scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {locationsData.map((loc, idx) => (
              <div 
                key={idx}
                onClick={() => navigate(`/jobs?location=${encodeURIComponent(loc.name)}`)}
                className="w-72 h-60 rounded-2xl overflow-hidden border border-slate-200/50 hover:border-indigo-200 hover:shadow-[0_8px_24px_rgba(99,102,241,0.02)] transition-all duration-300 cursor-pointer group bg-white flex flex-col snap-start"
              >
                {/* 1. Card Top: Location Image */}
                <div className="h-28 w-full overflow-hidden shrink-0">
                  <img 
                    src={loc.image} 
                    alt={loc.name} 
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300" 
                  />
                </div>
                
                {/* 2. Card Bottom: Info & Explore Action */}
                <div className="p-4 flex flex-col justify-between flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="w-6 h-6 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-xs shrink-0 select-none">
                      {loc.icon}
                    </span>
                    <h3 className="text-xs font-bold text-slate-800 truncate">{loc.name}</h3>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100/60 pt-3">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                      <MapPin size={9} className="shrink-0 text-slate-450" />
                      {loc.count > 0 ? `${loc.count} Vacancies` : 'No vacancies'}
                    </span>
                    <div className="w-6 h-6 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-650 group-hover:bg-indigo-650 group-hover:border-indigo-650 group-hover:text-white transition-all">
                      <ArrowRight size={10} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <style>{`
            .scrollbar-hide::-webkit-scrollbar {
              display: none;
            }
          `}</style>
        </div>
      </section>
      
      {/* Upgraded Top Hiring Companies Section (Placed right above the footer) */}
      {companies.length > 0 && (
        <section className="py-24 bg-slate-50/40 border-t border-slate-100/60 relative z-10">
          <div className="container mx-auto px-8">
            
            {/* Section Header */}
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
              <h2 className="text-3xl sm:text-4xl font-semibold text-slate-900 tracking-tight">
                Top Hiring <span className="text-indigo-600">Companies</span>
              </h2>
              <p className="text-slate-500 text-sm sm:text-base leading-relaxed font-medium">
                Directly connect with industry leaders and fast-growing startups currently looking for talent.
              </p>
            </div>

            {/* Premium 6-Column Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {companies.slice(0, 12).map((comp) => {
                const openRolesCount = jobs.filter(j => j.Company?.companyName === comp.companyName).length;
                
                return (
                  <div
                    key={comp.id}
                    onClick={() => navigate(`/jobs?keyword=${encodeURIComponent(comp.companyName)}`)}
                    className="p-6 border border-slate-100 rounded-3xl flex flex-col items-center justify-between text-center hover:border-indigo-200/85 hover:shadow-[0_16px_40px_rgba(99,102,241,0.03)] hover:-translate-y-1 transition-all duration-300 cursor-pointer group bg-white"
                  >
                    <div className="flex flex-col items-center">
                      <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center p-3 mb-4 group-hover:bg-white border border-slate-50 group-hover:border-indigo-50 transition-colors shadow-inner">
                         {comp.logo ? (
                           <img src={comp.logo} alt={comp.companyName} className="w-full h-full object-contain grayscale group-hover:grayscale-0 transition-all" />
                         ) : (
                           <Building2 className="text-slate-200" size={24} />
                         )}
                      </div>
                      <h4 className="font-bold text-slate-800 text-sm mb-1 line-clamp-1 group-hover:text-indigo-600 transition-colors">{comp.companyName}</h4>
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider bg-slate-50 px-2.5 py-0.5 rounded border border-slate-100 group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:border-indigo-100/50 transition-all mt-3">
                      {openRolesCount} {openRolesCount === 1 ? 'Vacancy' : 'Vacancies'}
                    </span>
                  </div>
                );
              })}
            </div>

          </div>
        </section>
      )}

      {/* Upgraded Premium Services & Benefits Section with soft-color icons */}
      <section className="py-24 bg-white border-t border-slate-100/60 relative z-10">
        <div className="container mx-auto px-8">
          
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="text-3xl sm:text-4xl font-semibold text-slate-900 tracking-tight">
              Elevate Your <span className="text-indigo-600">Career Search</span>
            </h2>
            <p className="text-slate-500 text-sm sm:text-base leading-relaxed font-medium">
              Experience a modern, streamlined job hunting process powered by smart integrations.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            
            {/* Benefit 1: AI Parser */}
            <div className="p-8 bg-slate-50/40 border border-slate-100 rounded-3xl space-y-6 hover:border-indigo-150/80 hover:bg-white hover:shadow-[0_16px_40px_rgba(99,102,241,0.02)] transition-all duration-300 group">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-sm shadow-blue-100/10">
                <Sparkles size={22} />
              </div>
              <div className="space-y-2">
                <h4 className="text-lg font-bold text-slate-805 group-hover:text-indigo-600 transition-colors">AI Resume Parser</h4>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">
                  Upload your resume in seconds. Our parsing engine extracts skills and auto-completes your profile details.
                </p>
              </div>
            </div>

            {/* Benefit 2: Secure OTP */}
            <div className="p-8 bg-slate-50/40 border border-slate-100 rounded-3xl space-y-6 hover:border-indigo-150/80 hover:bg-white hover:shadow-[0_16px_40px_rgba(99,102,241,0.02)] transition-all duration-300 group">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300 shadow-sm shadow-emerald-100/10">
                <ShieldCheck size={22} />
              </div>
              <div className="space-y-2">
                <h4 className="text-lg font-bold text-slate-805 group-hover:text-indigo-600 transition-colors">Secure OTP Login</h4>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">
                  Eliminate fake profiles and spam. Login securely using phone OTP to keep your credential profile fully protected.
                </p>
              </div>
            </div>

            {/* Benefit 3: Real-time tracking */}
            <div className="p-8 bg-slate-50/40 border border-slate-100 rounded-3xl space-y-6 hover:border-indigo-150/80 hover:bg-white hover:shadow-[0_16px_40px_rgba(99,102,241,0.02)] transition-all duration-300 group">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:bg-rose-600 group-hover:text-white transition-all duration-300 shadow-sm shadow-rose-100/10">
                <Activity size={22} />
              </div>
              <div className="space-y-2">
                <h4 className="text-lg font-bold text-slate-850 group-hover:text-indigo-600 transition-colors">Real-time Tracker</h4>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">
                  Track your job applications in real-time. Know exactly when recruiters view, shortlist, or update your status.
                </p>
              </div>
            </div>

            {/* Benefit 4: Skill Matching */}
            <div className="p-8 bg-slate-50/40 border border-slate-100 rounded-3xl space-y-6 hover:border-indigo-150/80 hover:bg-white hover:shadow-[0_16px_40px_rgba(99,102,241,0.02)] transition-all duration-300 group">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-all duration-300 shadow-sm shadow-amber-100/10">
                <Cpu size={22} />
              </div>
              <div className="space-y-2">
                <h4 className="text-lg font-bold text-slate-850 group-hover:text-indigo-600 transition-colors">Smart Skill Match</h4>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">
                  Get matched with opportunities that exactly align with your tech stack, experiences, and salary expectations.
                </p>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* Premium Multi-Column Dark Footer */}
      <footer className="bg-[#0b0d17] border-t border-white/5 pt-20 pb-12 relative z-10">
        <div className="container mx-auto px-8">
          
          {/* Subtle top glowing line */}
          <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent mb-16"></div>

          {/* Top Sitemap Grid */}
          <div className="grid grid-cols-2 md:grid-cols-12 gap-8 md:gap-10 pb-16">
            
            {/* Brand Descriptor Block (Col span 4) */}
            <div className="col-span-2 md:col-span-4 space-y-6">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/30">
                  <span className="text-white font-extrabold text-base">J</span>
                </div>
                <span className="text-xl font-bold tracking-tight text-white">JobPortal</span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed max-w-sm font-medium">
                Find verified career paths, build your trust score via secure OTP verification, and apply to top companies with one click. Designed for technical excellence.
              </p>
              {/* Circular Social Buttons */}
              <div className="flex space-x-3 pt-2">
                <a href="#" className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 text-slate-400 flex items-center justify-center hover:bg-indigo-650 hover:bg-indigo-600 hover:border-indigo-600 hover:text-white active:scale-95 transition-all">
                  <Twitter size={15} />
                </a>
                <a href="#" className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 text-slate-400 flex items-center justify-center hover:bg-indigo-650 hover:bg-indigo-600 hover:border-indigo-600 hover:text-white active:scale-95 transition-all">
                  <Linkedin size={15} />
                </a>
                <a href="#" className="w-9 h-9 rounded-xl bg-white/5 border border-slate-200/60 text-slate-500 flex items-center justify-center hover:bg-indigo-655 hover:bg-indigo-600 hover:border-indigo-600 hover:text-white active:scale-95 transition-all">
                  <Github size={15} />
                </a>
                <a href="#" className="w-9 h-9 rounded-xl bg-white/5 border border-slate-200/60 text-slate-500 flex items-center justify-center hover:bg-indigo-655 hover:bg-indigo-600 hover:border-indigo-600 hover:text-white active:scale-95 transition-all">
                  <Facebook size={15} />
                </a>
              </div>
            </div>

            {/* Structural Spacer */}
            <div className="hidden md:block col-span-1"></div>

            {/* Candidates Sitemap (Col span 2) */}
            <div className="col-span-1 md:col-span-2 space-y-4">
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Candidates</h4>
              <ul className="space-y-2.5">
                {['Browse Jobs', 'Industry Categories', 'Create Profile', 'Application Tracking', 'Dashboard Status'].map(link => (
                  <li key={link}>
                    <a href="#" className="text-[13px] font-medium text-slate-400 hover:text-white transition-colors">{link}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Recruiters Sitemap (Col span 2) */}
            <div className="col-span-1 md:col-span-2 space-y-4">
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Recruiters</h4>
              <ul className="space-y-2.5">
                {['Post a Job', 'Search Talent', 'Pricing Plans', 'Premium Access', 'Company Dashboard'].map(link => (
                  <li key={link}>
                    <a href="#" className="text-[13px] font-medium text-slate-400 hover:text-white transition-colors">{link}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company Sitemap (Col span 3) */}
            <div className="col-span-2 md:col-span-3 space-y-4">
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Company</h4>
              <ul className="space-y-2.5">
                {['About Us', 'Privacy Policy', 'Terms of Use', 'Help Center', 'Contact Support'].map(link => (
                  <li key={link}>
                    <a href="#" className="text-[13px] font-medium text-slate-400 hover:text-white transition-colors">{link}</a>
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* Bottom Metabar Row */}
          <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <span className="text-xs font-semibold text-slate-500 select-none">
              © 2026 JobPortal. Designed for Excellence.
            </span>
            {/* Premium Vercel-style status pill */}
            <div className="flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">All Systems Operational</span>
            </div>
          </div>

        </div>
      </footer>
    </div>
  );
};

export default CandidateHome;

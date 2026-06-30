import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Building2, Search, ArrowRight, MapPin } from 'lucide-react';
import axios from 'axios';
import { JOB_API_END_POINT } from '../../utils/constant';
import CandidateHeader from './CandidateHeader';
import { useNavigate } from 'react-router-dom';

const CandidateCompanies = () => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchCompaniesFromJobs = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${JOB_API_END_POINT}/all`, { withCredentials: true });
        if (res.data.success) {
          // Extract unique companies from jobs list
          const companyMap = {};
          res.data.jobs.forEach(job => {
            if (job.Company && job.Company.id) {
              const cId = job.Company.id;
              if (!companyMap[cId]) {
                companyMap[cId] = {
                  ...job.Company,
                  jobCount: 1,
                  locations: new Set([job.location])
                };
              } else {
                companyMap[cId].jobCount += 1;
                companyMap[cId].locations.add(job.location);
              }
            }
          });
          setCompanies(Object.values(companyMap));
        }
      } catch (error) {
        console.error("Error fetching companies:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCompaniesFromJobs();
  }, []);

  const filteredCompanies = companies.filter(c => {
    const name = c.companyName || '';
    const desc = c.description || '';
    return name.toLowerCase().includes(searchQuery.toLowerCase()) || 
           desc.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-[#f4f7fe]">
      <CandidateHeader />

      {/* Header Block */}
      <div className="bg-gradient-to-b from-indigo-50/50 via-slate-50/30 to-[#f4f7fe] pt-32 pb-12">
        <div className="container mx-auto px-8 text-center mb-8">
          <span className="px-3 py-1 bg-indigo-50 text-indigo-650 rounded-full text-[10px] font-bold uppercase tracking-wider select-none">
            Hiring Partners
          </span>
          <h1 className="text-3xl font-bold text-slate-900 mt-3">
            Browse Registered Companies
          </h1>
          <p className="text-slate-500 text-sm mt-1.5 font-medium max-w-lg mx-auto">
            Discover companies hiring on our platform, read details, and view their open vacancies.
          </p>
        </div>

        {/* Search Bar */}
        <div className="container mx-auto px-8">
          <div className="max-w-2xl mx-auto bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-2 relative z-10">
            <Search className="text-slate-400 ml-4 shrink-0" size={18} />
            <input 
              type="text" 
              placeholder="Search companies by name or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-3 bg-transparent outline-none font-semibold text-xs text-slate-700 placeholder:text-slate-400"
            />
          </div>
        </div>
      </div>

      {/* Grid container */}
      <div className="container mx-auto px-8 py-10">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-56 bg-white border border-slate-200 rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : filteredCompanies.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-16 text-center shadow-sm max-w-xl mx-auto">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 size={28} className="text-slate-400" />
            </div>
            <h2 className="text-base font-bold text-slate-900">No companies found</h2>
            <p className="text-slate-500 text-xs mt-1 font-semibold">Try adjusting your search criteria to load other companies.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredCompanies.map((comp) => {
              const compLocs = Array.from(comp.locations).filter(Boolean);
              return (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={comp.id}
                  className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center overflow-hidden p-1">
                        {comp.logo ? (
                          <img src={comp.logo} alt="logo" className="w-full h-full object-contain" />
                        ) : (
                          <Building2 className="text-slate-300" size={24} />
                        )}
                      </div>
                      <span className="px-2.5 py-1 bg-indigo-50 text-indigo-650 text-[9px] font-bold rounded-lg uppercase tracking-wider">
                        {comp.jobCount} open {comp.jobCount === 1 ? 'role' : 'roles'}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-850 truncate">{comp.companyName}</h3>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mt-0.5 truncate">{comp.website || 'Corporate Partner'}</p>
                    
                    <p className="text-xs text-slate-550 text-slate-500 font-medium mt-3 line-clamp-3 leading-relaxed">
                      {comp.description || 'This company has registered on our portal to hire top-tier talent. Connect and explore career opportunities.'}
                    </p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-widest truncate max-w-[150px]">
                      <MapPin size={10} />
                      <span className="truncate">{compLocs.join(', ') || 'Multiple locations'}</span>
                    </div>
                    <button 
                      onClick={() => navigate(`/jobs?keyword=${comp.companyName}`)}
                      className="text-[10px] font-bold text-indigo-600 hover:underline flex items-center gap-1 uppercase tracking-wider hover:gap-1.5 transition-all"
                    >
                      View Jobs <ArrowRight size={12} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CandidateCompanies;

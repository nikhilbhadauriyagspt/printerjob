import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { IndianRupee, Search, ArrowRight, Briefcase, TrendingUp } from 'lucide-react';
import axios from 'axios';
import { JOB_API_END_POINT } from '../../utils/constant';
import CandidateHeader from './CandidateHeader';
import { useNavigate } from 'react-router-dom';

const CandidateSalaries = () => {
  const navigate = useNavigate();
  const [salariesData, setSalariesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Default industry standard benchmarks in case job listing counts are low
  const defaultBenchmarks = [
    { title: 'Software Engineer', industry: 'IT & Software', avgMin: 6, avgMax: 15, jobsCount: 0 },
    { title: 'Frontend Developer', industry: 'IT & Software', avgMin: 5, avgMax: 12, jobsCount: 0 },
    { title: 'Backend Developer', industry: 'IT & Software', avgMin: 6, avgMax: 14, jobsCount: 0 },
    { title: 'Product Manager', industry: 'Management', avgMin: 10, avgMax: 22, jobsCount: 0 },
    { title: 'Data Scientist', industry: 'Data & Analytics', avgMin: 8, avgMax: 18, jobsCount: 0 },
    { title: 'QA Engineer', industry: 'IT & Software', avgMin: 4, avgMax: 9, jobsCount: 0 },
  ];

  useEffect(() => {
    const fetchAndCalculateSalaries = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${JOB_API_END_POINT}/all`, { withCredentials: true });
        if (res.data.success) {
          const jobs = res.data.jobs;
          
          // Group jobs by title and calculate averages
          const groups = {};
          
          const normalizeToLakhs = (val) => {
            const num = parseFloat(val) || 0;
            if (num >= 1000) return num / 100000;
            return num;
          };

          jobs.forEach(job => {
            if (!job.title) return;
            const titleKey = job.title.trim();
            let min = normalizeToLakhs(job.minSalary);
            let max = normalizeToLakhs(job.maxSalary);
            if (min > max && max > 0) {
              const temp = min;
              min = max;
              max = temp;
            }

            if (!groups[titleKey]) {
              groups[titleKey] = {
                title: titleKey,
                industry: job.industry || 'IT & Tech',
                minSum: min,
                maxSum: max,
                count: 1,
                hasSalaryData: min > 0 || max > 0
              };
            } else {
              groups[titleKey].minSum += min;
              groups[titleKey].maxSum += max;
              groups[titleKey].count += 1;
              if (min > 0 || max > 0) groups[titleKey].hasSalaryData = true;
            }
          });

          // Only show companies and job roles that are actually present in the database
          const calculatedList = Object.values(groups).map(g => {
            return {
              title: g.title,
              industry: g.industry,
              avgMin: g.hasSalaryData ? Math.round(g.minSum / g.count) : 0,
              avgMax: g.hasSalaryData ? Math.round(g.maxSum / g.count) : 0,
              jobsCount: g.count
            };
          });

          setSalariesData(calculatedList);
        }
      } catch (e) {
        console.error("Salary calculation failed:", e);
        setSalariesData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAndCalculateSalaries();
  }, []);

  const filteredSalaries = salariesData.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.industry.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f4f7fe]">
      <CandidateHeader />

      {/* Top Banner */}
      <div className="bg-gradient-to-b from-indigo-50/50 via-slate-50/30 to-[#f4f7fe] pt-32 pb-12">
        <div className="container mx-auto px-8 text-center mb-8">
          <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-bold uppercase tracking-wider select-none">
            Market Benchmarks
          </span>
          <h1 className="text-3xl font-bold text-slate-900 mt-3">
            Explore Salary Estimates
          </h1>
          <p className="text-slate-500 text-sm mt-1.5 font-medium max-w-lg mx-auto">
            Analyze average salary ranges by designation and find high paying vacancies matching your skills.
          </p>
        </div>

        {/* Search */}
        <div className="container mx-auto px-8">
          <div className="max-w-2xl mx-auto bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-2 relative z-10">
            <Search className="text-slate-400 ml-4 shrink-0" size={18} />
            <input 
              type="text" 
              placeholder="Search by job title or designation (e.g. Frontend developer)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-3 bg-transparent outline-none font-semibold text-xs text-slate-700 placeholder:text-slate-400"
            />
          </div>
        </div>
      </div>

      {/* Cards list */}
      <div className="container mx-auto px-8 py-10">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 bg-white border border-slate-200 rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : filteredSalaries.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-16 text-center shadow-sm max-w-xl mx-auto">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <IndianRupee size={28} className="text-slate-400" />
            </div>
            <h2 className="text-base font-bold text-slate-900">No salaries estimates found</h2>
            <p className="text-slate-500 text-xs mt-1 font-semibold">Try searching for other tech keywords.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredSalaries.map((sal, idx) => {
              const median = Math.round((sal.avgMin + sal.avgMax) / 2);
              return (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(idx * 0.05, 0.4) }}
                  key={sal.title}
                  className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-indigo-150 transition-all flex flex-col justify-between"
                >
                  <div>
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[8px] font-bold rounded uppercase tracking-wider">
                      {sal.industry}
                    </span>
                    <h3 className="text-sm font-bold text-slate-850 mt-2 truncate">{sal.title}</h3>
                    
                    {/* Median display */}
                    <div className="mt-4 flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-slate-900">₹{median}L</span>
                      <span className="text-[10px] text-slate-400 font-bold">LPA Median</span>
                    </div>

                    {/* Slider Range visual representation */}
                    <div className="mt-4 space-y-1.5">
                      <div className="flex justify-between text-[9px] text-slate-400 font-bold">
                        <span>Min: ₹{sal.avgMin}L</span>
                        <span>Max: ₹{sal.avgMax}L</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full relative overflow-hidden">
                        <div className="absolute top-0 bottom-0 left-[20%] right-[20%] bg-indigo-600 rounded-full"></div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between">
                    <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded flex items-center gap-1 uppercase tracking-wider select-none">
                      <TrendingUp size={10} /> {sal.jobsCount || 2} active jobs
                    </span>
                    <button 
                      onClick={() => navigate(`/jobs?keyword=${sal.title}`)}
                      className="text-[10px] font-bold text-indigo-600 hover:underline flex items-center gap-1 uppercase tracking-wider"
                    >
                      Explore Roles <ArrowRight size={12} />
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

export default CandidateSalaries;

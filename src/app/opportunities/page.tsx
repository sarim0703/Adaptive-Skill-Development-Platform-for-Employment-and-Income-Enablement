"use client";

import { useState, useEffect } from "react";
import { Briefcase, MapPin, ExternalLink, Clock, Building2, Search, Sparkles, ArrowRight, IndianRupee } from "lucide-react";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  description: string;
  job_url: string;
  source: string;
  date_posted: string;
  job_type: string;
  is_remote: boolean;
}

interface JobData {
  fetched_at: string;
  skills_searched: string[];
  location: string;
  total_results: number;
  jobs: Job[];
}

export default function OpportunitiesPage() {
  const [data, setData] = useState<JobData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetch("/jobs-data.json")
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filteredJobs = data?.jobs?.filter(
    (job) =>
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase())
  ) ?? [];

  const getSourceColor = (source: string) => {
    switch (source.toUpperCase()) {
      case "INDEED": return "from-[#2557a7] to-[#1a3d7c]";
      case "NAUKRI": return "from-[#4a90d9] to-[#2d6cb5]";
      case "LINKEDIN": return "from-[#0a66c2] to-[#004182]";
      default: return "from-[#007AFF] to-[#5856D6]";
    }
  };

  const getSourceBadge = (source: string) => {
    switch (source.toUpperCase()) {
      case "INDEED": return "bg-[#2557a7]/10 text-[#2557a7] border-[#2557a7]/20";
      case "NAUKRI": return "bg-[#4a90d9]/10 text-[#4a90d9] border-[#4a90d9]/20";
      case "LINKEDIN": return "bg-[#0a66c2]/10 text-[#0a66c2] border-[#0a66c2]/20";
      default: return "bg-[#007AFF]/10 text-[#007AFF] border-[#007AFF]/20";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#007AFF] to-[#5856D6] flex items-center justify-center mx-auto mb-6 animate-pulse">
            <Briefcase className="w-8 h-8 text-white" />
          </div>
          <p className="text-slate-400 font-medium text-lg">Loading real job opportunities...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 animate-fadeInUp">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-[#34C759]/10 text-[#34C759] px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6 border border-[#34C759]/20">
          <Sparkles className="w-4 h-4" />
          BKT-Verified Skill Matching
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tight leading-tight mb-4">
          Real Job Opportunities
        </h1>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
          Live listings from <strong>Indeed</strong> and <strong>Naukri</strong>, filtered by your BKT-verified mastered skills.
          Click any job to view and apply on the original platform.
        </p>
      </div>

      {/* Stats Bar */}
      {data && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="card p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#007AFF] to-[#5856D6] flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-800">{data.total_results}</p>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Live Listings</p>
            </div>
          </div>
          <div className="card p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#34C759] to-[#30B0C7] flex items-center justify-center">
              <Search className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800 leading-tight">{data.skills_searched.join(", ")}</p>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Mastered Skills</p>
            </div>
          </div>
          <div className="card p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FF9500] to-[#FF3B30] flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800 leading-tight">{new Date(data.fetched_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Last Updated</p>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="card p-4 mb-8">
        <div className="flex items-center gap-3">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Filter by job title or company..."
            className="flex-1 bg-transparent text-slate-700 placeholder:text-slate-300 focus:outline-none font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Job Cards */}
      <div className="space-y-4">
        {filteredJobs.length === 0 ? (
          <div className="card p-16 text-center">
            <Briefcase className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-400 font-medium">No jobs match your search.</p>
          </div>
        ) : (
          filteredJobs.map((job) => (
            <a
              key={job.id}
              href={job.job_url}
              target="_blank"
              rel="noopener noreferrer"
              className="card p-6 md:p-8 block group hover:border-[#007AFF]/40 transition-all hover:shadow-lg hover:shadow-blue-500/5 relative overflow-hidden"
            >
              {/* Source gradient accent */}
              <div className={`absolute top-0 right-0 w-40 h-40 bg-gradient-to-br ${getSourceColor(job.source)} opacity-[0.03] rounded-bl-[100px] -z-10`} />

              <div className="flex flex-col md:flex-row gap-6">
                {/* Left: Icon */}
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${getSourceColor(job.source)} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                  <Building2 className="w-7 h-7 text-white" />
                </div>

                {/* Center: Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h3 className="text-lg font-black text-slate-800 tracking-tight group-hover:text-[#007AFF] transition-colors">
                      {job.title}
                    </h3>
                    {job.is_remote && (
                      <span className="text-[10px] font-bold uppercase tracking-widest bg-[#34C759]/10 text-[#34C759] px-2 py-0.5 rounded-full border border-[#34C759]/20">
                        Remote
                      </span>
                    )}
                  </div>

                  <p className="text-sm font-bold text-slate-500 mb-3">{job.company}</p>

                  <div className="flex flex-wrap items-center gap-4 mb-3">
                    {job.location && (
                      <span className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                        <MapPin className="w-3.5 h-3.5" />
                        {job.location}
                      </span>
                    )}
                    {job.salary && job.salary !== "Not Disclosed" && (
                      <span className="flex items-center gap-1.5 text-xs text-[#34C759] font-bold">
                        <IndianRupee className="w-3.5 h-3.5" />
                        {job.salary}
                      </span>
                    )}
                    {job.date_posted && (
                      <span className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                        <Clock className="w-3.5 h-3.5" />
                        {job.date_posted}
                      </span>
                    )}
                  </div>

                  {job.description && (
                    <p className="text-sm text-slate-400 leading-relaxed line-clamp-2">
                      {job.description}
                    </p>
                  )}
                </div>

                {/* Right: Source Badge + Arrow */}
                <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-4 flex-shrink-0">
                  <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${getSourceBadge(job.source)}`}>
                    {job.source}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#007AFF] opacity-0 group-hover:opacity-100 transition-opacity">
                    View Job <ExternalLink className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </a>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="mt-12 card p-8 text-center border-[#007AFF]/20 bg-[#007AFF]/5">
        <div className="flex items-center justify-center gap-3 mb-3">
          <Sparkles className="w-5 h-5 text-[#007AFF]" />
          <h4 className="text-sm font-black text-[#007AFF] uppercase tracking-[0.3em]">Powered by JobSpy</h4>
        </div>
        <p className="text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed text-sm">
          These are live job listings aggregated from Indeed and Naukri using the open-source{" "}
          <a href="https://github.com/speedyapply/JobSpy" target="_blank" rel="noopener noreferrer" className="text-[#007AFF] font-bold underline underline-offset-2">
            JobSpy
          </a>{" "}
          library. Jobs are filtered using BKT-verified skills where mastery probability exceeds 80%.
        </p>
      </div>
    </div>
  );
}

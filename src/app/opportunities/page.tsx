"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import { 
  Briefcase, 
  MapPin, 
  ExternalLink, 
  Clock, 
  Building2, 
  Search, 
  Sparkles, 
  IndianRupee, 
  Zap, 
  ShieldCheck, 
  Target,
  ChevronRight,
  Map as MapIcon,
  List,
  Navigation,
  Globe
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getAnalyticsData } from "@/app/actions";
import { useLanguage } from "@/context/LanguageContext";


// ── Dynamic import for Leaflet (SSR-incompatible) ──
const JobMap = dynamic(() => import("@/components/JobMap"), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] rounded-xl bg-card border border-border flex items-center justify-center">
      <div className="text-center">
        <Globe className="w-10 h-10 text-blue-500/30 mx-auto mb-4 animate-pulse" />
        <p className="text-text-tertiary text-sm">Loading Map...</p>
      </div>
    </div>
  )
});

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

// ── Enhanced Geocoding Utilities (Restored from stable version) ──
const CITY_COORDS: Record<string, [number, number]> = {
  "mumbai": [19.076, 72.8777],
  "delhi": [28.6139, 77.209],
  "bangalore": [12.9716, 77.5946],
  "bengaluru": [12.9716, 77.5946],
  "hyderabad": [17.385, 78.4867],
  "chennai": [13.0827, 80.2707],
  "kolkata": [22.5726, 88.3639],
  "pune": [18.5204, 73.8567],
  "ahmedabad": [23.0225, 72.5714],
  "jaipur": [26.9124, 75.7873],
  "lucknow": [26.8467, 80.9462],
  "chandigarh": [30.7333, 76.7794],
  "indore": [22.7196, 75.8577],
  "bhopal": [23.2599, 77.4126],
  "kochi": [9.9312, 76.2673],
  "nagpur": [21.1458, 79.0882],
  "surat": [21.1702, 72.8311],
  "coimbatore": [11.0168, 76.9558],
  "vadodara": [22.3072, 73.1812],
  "gurgaon": [28.4595, 77.0266],
  "gurugram": [28.4595, 77.0266],
  "noida": [28.5355, 77.391],
  "thiruvananthapuram": [8.5241, 76.9366],
  "visakhapatnam": [17.6868, 83.2185],
  "patna": [25.6093, 85.1376],
  "ranchi": [23.3441, 85.3096],
  "guwahati": [26.1445, 91.7362],
  "bhubaneswar": [20.2961, 85.8245],
  "dehradun": [30.3165, 78.0322],
  "mysore": [12.2958, 76.6394],
  "mangalore": [12.9141, 74.856],
  "remote": [20.5937, 78.9629],
  "india": [20.5937, 78.9629],
};

function getCityCenter(location: string): [number, number] {
  if (!location) return CITY_COORDS["india"];
  const loc = location.toLowerCase();
  
  // 1. Direct city check
  for (const city in CITY_COORDS) {
    if (loc.includes(city)) return CITY_COORDS[city];
  }
  
  // 2. State-code fallbacks (Ensures accurate state-level placement)
  if (loc.includes("mh") || loc.includes("maharashtra")) return CITY_COORDS["mumbai"];
  if (loc.includes("ka") || loc.includes("karnataka")) return CITY_COORDS["bangalore"];
  if (loc.includes("tn") || loc.includes("tamil")) return CITY_COORDS["chennai"];
  if (loc.includes("dl")) return CITY_COORDS["delhi"];
  if (loc.includes("gj") || loc.includes("gujarat")) return CITY_COORDS["ahmedabad"];
  if (loc.includes("up") || loc.includes("uttar")) return CITY_COORDS["lucknow"];
  if (loc.includes("wb") || loc.includes("west bengal")) return CITY_COORDS["kolkata"];
  if (loc.includes("ts") || loc.includes("telangana") || loc.includes("ap")) return CITY_COORDS["hyderabad"];
  
  return CITY_COORDS["india"];
}

// ── Scatter Cloud Logic (Visual Jitter) ──
function getScatteredCoords(center: [number, number], index: number): [number, number] {
  // Use a predictable pattern based on index
  const angle = (index * 137.5) * (Math.PI / 180); // Golden angle for even distribution
  const radius = 0.01 + (Math.sqrt(index) * 0.015); // Spiral outward
  
  return [
    center[0] + Math.cos(angle) * radius,
    center[1] + Math.sin(angle) * radius
  ];
}

export default function OpportunitiesPage() {
  const { t } = useLanguage();
  const [data, setData] = useState<JobData | null>(null);

  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [cityTerm, setCityTerm] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userContext, setUserContext] = useState<{ pathTitle: string; capabilityScore: number } | null>(null);
  const [hoveredJobId, setHoveredJobId] = useState<string | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [selectedCoords, setSelectedCoords] = useState<[number, number] | null>(null);
  
  // Jobs currently being displayed on the map/list
  const [activeJobs, setActiveJobs] = useState<any[]>([]);
  const jobRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    const fetchContext = async () => {
      try {
        const analytics = await getAnalyticsData();
        if (analytics) {
          setUserContext({ pathTitle: analytics.pathTitle, capabilityScore: analytics.capabilityScore });
          setSearchTerm(analytics.pathTitle);
        }
      } catch (err) { console.error(err); }
    };
    fetchContext();
  }, []);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = searchTerm.trim() || userContext?.pathTitle || "";
    if (!query) return;

    setLoading(true);
    setError(null);
    setHasSearched(true);
    setSelectedCoords(null);

    try {
      const params = new URLSearchParams({ search: query });
      if (cityTerm.trim()) params.set("city", cityTerm.trim());
      
      const res = await fetch(`/api/jobs?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch jobs");
      const jobs = await res.json();
      
      if (jobs.error) throw new Error(jobs.error);
      
      const newData = {
        fetched_at: new Date().toISOString(),
        skills_searched: [query],
        location: cityTerm.trim() || "India",
        total_results: Array.isArray(jobs) ? jobs.length : 0,
        jobs: Array.isArray(jobs) ? jobs : [],
      };
      
      setData(newData);
      
      // Step 1: Get stable city center
      const center = getCityCenter(cityTerm.trim() || "India");
      
      // Step 2: Scatter all jobs instantly around the center
      const scatteredJobs = newData.jobs.map((j: any, i: number) => ({
        ...j,
        coords: getScatteredCoords(center, i)
      }));
      
      setActiveJobs(scatteredJobs);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to fetch live opportunities.");
    } finally {
      setLoading(false);
    }
  };

  // ── STABILIZED CAMERA LOGIC ──
  const mapCenter = useMemo<[number, number]>(() => {
    // 1. Priority: User selected a job
    if (selectedCoords) return selectedCoords;
    
    // 2. Priority: User is typing a city (Snap to city center)
    if (cityTerm.trim()) {
      const coords = getCityCenter(cityTerm);
      if (coords !== CITY_COORDS["india"]) return coords;
    }
    
    // 3. Priority: First job result (Static center only, don't follow background updates)
    if (data?.jobs && data.jobs.length > 0) {
      return getCityCenter(data.jobs[0].location || cityTerm);
    }
    
    return [20.5937, 78.9629]; // India Default
  }, [selectedCoords, cityTerm, data]);

  const handleSelectJobFromMap = (id: string) => {
    const job = activeJobs.find(j => j.id === id);
    if (job?.coords) {
      setSelectedCoords(job.coords as [number, number]);
    }
    setSelectedJobId(id);
    const element = jobRefs.current[id];
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const handleSelectJobFromList = (job: any) => {
    setSelectedJobId(job.id);
    if (job.coords) {
      setSelectedCoords(job.coords as [number, number]);
    }
  };

  const getMatchScore = useCallback((index: number) => {
    if (!userContext) return 0;
    const base = userContext.capabilityScore;
    const variance = (index % 5) - 2;
    return Math.min(100, Math.max(0, base + variance));
  }, [userContext]);

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full bg-background text-foreground overflow-hidden font-sans">
      
      {/* ── Left Side: Job Feed ── */}
      <aside className="w-[480px] h-full flex flex-col border-r border-border bg-background relative z-[1001]">

        
        {/* Header */}
        <div className="p-6 pt-8 border-b border-border bg-card/80 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600/10 flex items-center justify-center border border-blue-500/20">
                <Sparkles className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-foreground tracking-tight">{t("jobs.explorer")}</h1>
                <p className="text-xs text-text-tertiary">{t("jobs.findOps")}</p>
              </div>

            </div>
            {/* Total Results Badge */}
            {data?.total_results && (
              <div className="px-3 py-1.5 rounded-lg bg-blue-600/10 border border-blue-500/20">
                <p className="text-xs font-medium text-blue-500">{data.total_results} {t("jobs.found")}</p>
              </div>

            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3 px-4 py-2.5 bg-input border border-border rounded-xl">
              <Search className="w-4 h-4 text-text-muted" />
              <input 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder={t("jobs.roleSkill")}
                className="bg-transparent text-sm focus:outline-none w-full text-foreground"
              />
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 px-4 py-2.5 bg-input border border-border rounded-xl flex items-center gap-3">
                <Navigation className="w-4 h-4 text-emerald-500/60" />
                <input 
                  value={cityTerm}
                  onChange={e => setCityTerm(e.target.value)}
                  placeholder={t("jobs.city")}
                  className="bg-transparent text-sm focus:outline-none w-full text-foreground"
                />
              </div>
              <button 
                onClick={() => handleSearch()}
                disabled={loading}
                className="bg-blue-600 h-[42px] px-5 rounded-xl hover:bg-blue-500 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Search className="w-4 h-4 text-white" />}
                <span className="text-xs font-medium text-white">{t("jobs.search")}</span>
              </button>

            </div>
          </div>
        </div>

        {/* Scrollable List / Standby View */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar bg-gradient-to-b from-transparent to-blue-900/5">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
              <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-6 relative">
                <div className="absolute inset-0 rounded-full border-2 border-blue-500/20 border-t-blue-500 animate-spin" />
                <Globe className="w-6 h-6 text-blue-500" />
              </div>
              <p className="text-xs text-text-tertiary">{t("jobs.searching")}</p>
            </div>

          ) : activeJobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="relative mb-8">
                <div className="w-24 h-24 rounded-full bg-blue-600/5 border border-blue-500/10 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full border-2 border-blue-500/20 border-t-blue-500 animate-spin opacity-40" />
                </div>
                <Target className="absolute inset-0 m-auto w-8 h-8 text-blue-500/40" />
              </div>
              <h3 className="text-sm font-medium text-text-secondary mb-2">{t("jobs.searchPrompt")}</h3>
              <p className="text-xs text-text-tertiary max-w-[220px] leading-relaxed">
                {t("jobs.searchDesc")}
              </p>

            </div>
          ) : (
            activeJobs.map((job, i) => {
              const score = getMatchScore(i);
              const isActive = selectedJobId === job.id || hoveredJobId === job.id;
              
              return (
                <motion.div
                  key={job.id}
                  ref={el => jobRefs.current[job.id] = el}
                  onMouseEnter={() => setHoveredJobId(job.id)}
                  onMouseLeave={() => setHoveredJobId(null)}
                  onClick={() => handleSelectJobFromList(job)}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`group relative p-5 rounded-xl border transition-all duration-300 cursor-pointer ${
                    isActive 
                    ? "bg-blue-600/10 border-blue-500/40" 
                    : "bg-card border-border hover:border-border-hover"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="min-w-0">
                      <h3 className={`text-sm font-semibold tracking-tight mb-1 truncate ${isActive ? "text-blue-500" : "text-foreground"}`}>
                        {job.title}
                      </h3>
                      <p className="text-xs text-text-tertiary truncate">{job.company}</p>
                    </div>
                    <div className="relative w-10 h-10 flex-shrink-0">
                      <svg className="w-full h-full -rotate-90">
                        <circle cx="20" cy="20" r="18" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/5" />
                        <circle 
                          cx="20" cy="20" r="18" fill="none" stroke="currentColor" strokeWidth="2" 
                          strokeDasharray="113"
                          strokeDashoffset={113 * (1 - score/100)}
                          className="text-blue-500"
                          style={{ strokeLinecap: "round" }}
                        />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-[8px] font-black">{score}%</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-text-tertiary mb-4">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {job.location || "India"}
                    </div>
                    {job.salary && job.salary !== "Not Disclosed" && (
                      <div className="flex items-center gap-1 text-emerald-400/70">
                        <IndianRupee className="w-3 h-3" />
                        {job.salary.split('(')[0]}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-input border border-border text-text-tertiary">{job.source}</span>
                      {job.is_remote && <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">{t("jobs.remote")}</span>}
                    </div>

                    <a 
                      href={job.job_url} 
                      target="_blank" 
                      onClick={(e) => e.stopPropagation()}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-lg bg-blue-600 text-white"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-card border-t border-border flex items-center justify-center">
          <span className="text-xs text-text-tertiary">{data?.total_results ?? 0} {t("jobs.results")}</span>
        </div>

      </aside>

      {/* ── Right Side: Situation Map ── */}
      <main className="flex-1 relative h-full">
        <div className="w-full h-full">
          <JobMap 
            jobs={activeJobs} 
            center={mapCenter}
            selectedJobId={selectedJobId}
            onSelectJob={handleSelectJobFromMap}
            hoveredJobId={hoveredJobId}
          />
        </div>

        {/* Legend */}
        <div className="absolute bottom-8 right-8 z-[1000] flex flex-col gap-2">
          {[
            { label: "Indeed", color: "bg-blue-600" },
            { label: "LinkedIn", color: "bg-sky-500" },
            { label: "Glassdoor", color: "bg-emerald-500" },
          ].map((s) => (
            <div key={s.label} className="bg-card/90 backdrop-blur-xl border border-border rounded-lg px-3 py-1.5 flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${s.color}`} />
              <span className="text-xs font-medium text-text-secondary">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Map Pulse Loader */}
        {loading && (
          <div className="absolute inset-0 z-[1000] flex items-center justify-center pointer-events-none bg-blue-500/5">
            <div className="w-[400px] h-[400px] border border-blue-500/10 rounded-full animate-ping opacity-20" />
            <div className="absolute w-[200px] h-[200px] border border-blue-500/20 rounded-full animate-ping delay-75 opacity-10" />
          </div>
        )}
      </main>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--border-primary, rgba(255,255,255,0.05)); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: var(--border-primary, rgba(255,255,255,0.1)); }
      `}</style>
    </div>
  );
}

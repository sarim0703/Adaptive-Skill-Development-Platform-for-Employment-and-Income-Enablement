"use client";

import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// ── Custom HD Pin Icons ──
function createPinIcon(color: string, isHighlighted: boolean = false) {
  const size = isHighlighted ? 36 : 28;
  
  return L.divIcon({
    className: "custom-pin-marker",
    html: `
      <div style="position: relative; width: ${size}px; height: ${size}px; transform: translate(-50%, -100%);">
        <svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="${color}" style="filter: drop-shadow(0 4px 6px rgba(0,0,0,0.5));">
          <path d="M12 0C7.58 0 4 3.58 4 8c0 5.25 7.22 13.33 7.53 13.67.1.1.25.18.47.18s.37-.08.47-.18c.31-.34 7.53-8.42 7.53-13.67 0-4.42-3.58-8-8-8zm0 12c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"/>
        </svg>
        ${isHighlighted ? `
          <div style="
            position: absolute; 
            bottom: -4px; 
            left: 50%; 
            transform: translateX(-50%);
            width: 10px; height: 4px; 
            background: rgba(0,0,0,0.4); 
            border-radius: 50%;
            filter: blur(1px);
          "></div>
          <div style="
            position: absolute; 
            top: 50%; 
            left: 50%; 
            width: 10px; height: 10px; 
            background: ${color}; 
            border-radius: 50%; 
            transform: translate(-50%, -50%);
            animation: ping-core 2s cubic-bezier(0, 0, 0.2, 1) infinite;
          "></div>
        ` : ''}
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  });
}

const SOURCE_COLORS: Record<string, string> = {
  INDEED: "#2563EB",
  LINKEDIN: "#0EA5E9",
  GLASSDOOR: "#10B981",
};

function getMarkerIcon(source: string, isHighlighted: boolean) {
  const color = SOURCE_COLORS[source.toUpperCase()] || "#6366F1";
  return createPinIcon(color, isHighlighted);
}

// ── Map Controller (fly to new center) ──
function MapController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.5 });
    // Fix for Leaflet not rendering correctly in flex containers
    setTimeout(() => {
      map.invalidateSize();
    }, 100);
  }, [center, zoom, map]);

  return null;
}

interface JobWithCoords {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  job_url: string;
  source: string;
  is_remote: boolean;
  coords: [number, number] | null;
}

interface JobMapProps {
  jobs: JobWithCoords[];
  center: [number, number];
  selectedJobId: string | null;
  hoveredJobId: string | null;
  onSelectJob: (id: string) => void;
}

export default function JobMap({ jobs, center, selectedJobId, hoveredJobId, onSelectJob }: JobMapProps) {
  const markerRefs = useRef<Record<string, L.Marker | null>>({});

  // Auto-open popup when selected from list
  useEffect(() => {
    if (selectedJobId && markerRefs.current[selectedJobId]) {
      markerRefs.current[selectedJobId]?.openPopup();
    }
  }, [selectedJobId]);

  return (
    <div className="relative h-full w-full overflow-hidden bg-background">
      <div className="h-full w-full">
        <MapContainer 
          center={center} 
          zoom={6} 
          scrollWheelZoom={true}
          style={{ height: "100%", width: "100%", background: "var(--bg-primary, #0A0A0C)" }}
          zoomControl={false}
          attributionControl={false}
        >
          {/* Dark Tiles (CartoDB Dark Matter) */}
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />

          <MapController center={center} zoom={center[0] === 20.5937 ? 5 : 12} />

          {/* Job Markers */}
          {jobs.map((job) => {
            if (!job.coords) return null;

            const isHighlighted = hoveredJobId === job.id || selectedJobId === job.id;

            return (
              <Marker
                key={job.id}
                position={job.coords}
                icon={getMarkerIcon(job.source, isHighlighted)}
                ref={el => markerRefs.current[job.id] = el}
                eventHandlers={{
                  click: () => onSelectJob(job.id),
                }}
              >
                <Popup className="custom-job-popup">
                  <div style={{
                    background: "var(--surface-raised, #0f0f12)",
                    color: "var(--text-primary, #fff)",
                    padding: "0",
                    borderRadius: "16px",
                    border: "1px solid var(--border-primary, rgba(255,255,255,0.08))",
                    minWidth: "280px",
                    maxWidth: "320px",
                    fontFamily: "Inter, sans-serif",
                    overflow: "hidden",
                    boxShadow: "0 16px 48px rgba(0,0,0,0.4)",
                  }}>
                    {/* Header band with source color */}
                    <div style={{
                      height: "4px",
                      background: `linear-gradient(to right, ${SOURCE_COLORS[job.source.toUpperCase()] || "#818CF8"}, ${SOURCE_COLORS[job.source.toUpperCase()] || "#818CF8"}80)`,
                    }} />
                    
                    <div style={{ padding: "18px 20px" }}>
                      {/* Role Title */}
                      <p style={{ 
                        fontSize: "14px", 
                        fontWeight: 600, 
                        marginBottom: "6px",
                        lineHeight: 1.3,
                        letterSpacing: "-0.01em",
                        color: "var(--text-primary, #fff)",
                      }}>
                        {job.title}
                      </p>
                      
                      {/* Company */}
                      <div style={{ 
                        display: "flex", 
                        alignItems: "center", 
                        gap: "6px", 
                        marginBottom: "14px",
                      }}>
                        <span style={{
                          width: "20px", height: "20px",
                          borderRadius: "6px",
                          background: "rgba(255,255,255,0.05)",
                          border: "1px solid rgba(255,255,255,0.08)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: "10px",
                          flexShrink: 0,
                        }}>🏢</span>
                        <span style={{ fontSize: "13px", color: "var(--text-secondary, #CBD5E1)", fontWeight: 500 }}>
                          {job.company}
                        </span>
                      </div>

                      {/* Details Grid */}
                      <div style={{ 
                        display: "flex", 
                        flexDirection: "column" as const,
                        gap: "8px", 
                        marginBottom: "14px",
                        padding: "12px",
                        background: "var(--surface-base, rgba(255,255,255,0.02))",
                        borderRadius: "12px",
                        border: "1px solid var(--border-primary, rgba(255,255,255,0.04))",
                      }}>
                        {/* Location */}
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ fontSize: "12px" }}>📍</span>
                          <span style={{ fontSize: "12px", color: "var(--text-tertiary, #94A3B8)", fontWeight: 500 }}>
                            {job.location || "India"}
                          </span>
                        </div>
                        
                        {/* Salary */}
                        {job.salary && job.salary !== "Not Disclosed" && (
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span style={{ fontSize: "12px" }}>💰</span>
                            <span style={{ fontSize: "12px", color: "#34D399", fontWeight: 800 }}>
                              ₹ {job.salary}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Badges */}
                      <div style={{ display: "flex", gap: "6px", alignItems: "center", marginBottom: "16px", flexWrap: "wrap" as const }}>
                        <span style={{
                          fontSize: "10px", fontWeight: 600,
                          textTransform: "uppercase" as const,
                          letterSpacing: "0.1em",
                          padding: "3px 10px",
                          borderRadius: "8px",
                          background: `${SOURCE_COLORS[job.source.toUpperCase()] || "#818CF8"}15`,
                          color: SOURCE_COLORS[job.source.toUpperCase()] || "#818CF8",
                          border: `1px solid ${SOURCE_COLORS[job.source.toUpperCase()] || "#818CF8"}25`,
                        }}>
                          {job.source}
                        </span>
                        {job.is_remote && (
                          <span style={{
                            fontSize: "10px", fontWeight: 600,
                            textTransform: "uppercase" as const,
                            letterSpacing: "0.1em",
                            padding: "3px 10px",
                            borderRadius: "8px",
                            background: "rgba(16,185,129,0.1)",
                            color: "#34D399",
                            border: "1px solid rgba(16,185,129,0.2)",
                          }}>
                            Remote
                          </span>
                        )}
                      </div>

                      {/* CTA Button */}
                      <a 
                        href={job.job_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "8px",
                          width: "100%",
                          padding: "10px 0",
                          borderRadius: "12px",
                          background: "#3B82F6",
                          color: "#fff",
                          fontSize: "11px",
                          fontWeight: 600,
                          textTransform: "uppercase" as const,
                          letterSpacing: "0.15em",
                          textDecoration: "none",
                          boxShadow: "0 4px 16px rgba(59,130,246,0.2)",
                          transition: "background 0.2s",
                        }}
                      >
                        View & Apply ↗
                      </a>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      <style jsx global>{`
        .custom-pin-marker {
          background: transparent !important;
          border: none !important;
        }
        @keyframes ping-core {
          75%, 100% {
            transform: translate(-50%, -50%) scale(2.5);
            opacity: 0;
          }
        }
      `}</style>

      {/* Job count overlay */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-card/90 backdrop-blur-xl border border-border rounded-xl px-4 py-2 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-xs font-medium text-text-secondary">
          {jobs.length} jobs found
        </span>
      </div>
    </div>
  );
}

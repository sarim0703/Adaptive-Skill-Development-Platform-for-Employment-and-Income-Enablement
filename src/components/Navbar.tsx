"use client";
import { useState, useRef, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { 
  Sparkles, 
  BookOpen, 
  LogOut, 
  Briefcase, 
  BarChart3, 
  Menu, 
  X, 
  ChevronRight, 
  Zap, 
  Globe,
  User,
  Award
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import LanguageSwitcher from "./LanguageSwitcher";
import { signOut, useSession } from "next-auth/react";
import { 
  motion, 
  useMotionValue, 
  useSpring, 
  useTransform, 
  AnimatePresence 
} from "framer-motion";

/**
 * ── DOCK ICON COMPONENT ──
 * Implements the fisheye magnification effect
 */
function DockIcon({ 
  mouseX, 
  href, 
  icon: Icon, 
  label, 
  isActive 
}: { 
  mouseX: any; 
  href: string; 
  icon: any; 
  label: string; 
  isActive: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  // Distance calculation for magnification
  const distance = useTransform(mouseX, (val: number) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  // Scale and Width based on proximity (Mac-style)
  const widthSync = useTransform(distance, [-150, 0, 150], [40, 65, 40]);
  const width = useSpring(widthSync, { mass: 0.1, stiffness: 150, damping: 12 });

  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link href={href} className="relative">
      <motion.div
        ref={ref}
        style={{ width }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`
          aspect-square rounded-2xl flex items-center justify-center relative
          transition-colors duration-300
          ${isActive ? "bg-white/15 text-white" : "bg-white/5 text-slate-500 hover:text-white"}
        `}
      >
        <Icon className={`${isActive ? "w-1/2 h-1/2" : "w-5 h-5"}`} />
        
        {/* Active Indicator Dot */}
        {isActive && (
          <motion.div 
            layoutId="active-dot"
            className="absolute -bottom-1 w-1 h-1 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]" 
          />
        )}

        {/* Tooltip Label */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.8 }}
              animate={{ opacity: 1, y: -45, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.8 }}
              className="absolute px-3 py-1.5 rounded-lg bg-[#111] border border-white/10 text-white text-[10px] font-bold uppercase tracking-widest pointer-events-none whitespace-nowrap shadow-2xl"
            >
              {label}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </Link>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const { data: session } = useSession();
  const mouseX = useMotionValue(Infinity);

  if (pathname === '/auth') return null;

  const isLandingPage = pathname === '/';
  const userName = session?.user?.name?.split(' ')[0];
  const userInitial = userName?.charAt(0)?.toUpperCase() || '?';

  const appLinks = [
    { href: "/learn", label: "Learn", icon: BookOpen },
    { href: "/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/opportunities", label: "Jobs", icon: Briefcase },
    { href: "/badges", label: "Badges", icon: Award },
  ];

  return (
    <div className="fixed top-8 inset-x-0 z-50 flex justify-center px-4 pointer-events-none">
      
      {/* ── The Dock Container ── */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        onMouseMove={(e) => mouseX.set(e.pageX)}
        onMouseLeave={() => mouseX.set(Infinity)}
        className="
          pointer-events-auto
          flex items-center gap-2 p-2 rounded-[28px] 
          w-max mx-auto
          bg-[#0A0A0C]/70 backdrop-blur-3xl border border-white/10
          shadow-[0_20px_50px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.05)]
          transition-shadow duration-500 hover:shadow-[0_20px_80px_rgba(0,0,0,0.8),0_0_20px_rgba(59,130,246,0.1)]
        "
      >
        
        {/* ── Brand Icon ── */}
        <Link href="/" className="px-2">
          <motion.div 
            whileHover={{ rotate: 5, scale: 1.1 }}
            className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg relative group overflow-hidden bg-[#0A0A0C]"
          >
            <Image src="/logo.png" alt="CareerOrbit Logo" fill className="object-cover" />
            <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#0A0A0C] animate-pulse" />
          </motion.div>
        </Link>

        {/* Divider */}
        <div className="w-px h-8 bg-white/10 mx-1" />

        {/* ── Nav Links Cluster ── */}
        {!isLandingPage && (
          <div className="flex items-center gap-2">
            {appLinks.map((link) => (
              <DockIcon 
                key={link.href}
                mouseX={mouseX}
                href={link.href}
                icon={link.icon}
                label={link.label}
                isActive={pathname === link.href || pathname.startsWith(link.href + '/')}
              />
            ))}
            
            {/* Integrated User Avatar (Replaces generic Profile Icon) */}
            <Link href="/profile">
              <motion.div 
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className={`
                  w-[40px] h-[40px] rounded-2xl flex items-center justify-center group cursor-pointer relative transition-all duration-300
                  ${pathname === "/profile" ? "bg-white/15 text-white" : "bg-white/5 text-slate-500 hover:text-white"}
                `}
              >
                <div className={`
                  w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black 
                  ${pathname === "/profile" ? "bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]" : "bg-gradient-to-br from-blue-500/20 to-violet-500/20 text-blue-400 group-hover:text-blue-300"}
                `}>
                  {userInitial}
                </div>
                {/* Tooltip on Hover */}
                <AnimatePresence>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileHover={{ opacity: 1, y: -45 }}
                    className="absolute px-3 py-1.5 rounded-lg bg-[#111] border border-white/10 text-white text-[10px] font-bold uppercase tracking-widest pointer-events-none whitespace-nowrap shadow-2xl opacity-0 group-hover:opacity-100"
                  >
                    Profile
                  </motion.div>
                </AnimatePresence>
              </motion.div>
            </Link>
          </div>
        )}

        {/* Divider */}
        <div className="w-px h-8 bg-white/10 mx-1" />

        {/* ── Controls Cluster ── */}
        <div className="flex items-center gap-2 px-1">
          
          <div className="scale-90 hover:scale-110 transition-transform">
            <LanguageSwitcher />
          </div>

          {isLandingPage ? (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link 
                href="/?auth=true" 
                className="px-5 py-2.5 rounded-2xl bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 shadow-[0_5px_15px_rgba(37,99,235,0.3)] block"
              >
                {t("nav.signIn")}
              </Link>
            </motion.div>
          ) : (
            <>
              {/* Sign Out */}
              <motion.button
                whileHover={{ scale: 1.1, rotate: -10 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => signOut({ callbackUrl: window.location.origin })}
                className="w-10 h-10 flex items-center justify-center rounded-2xl text-slate-500 hover:bg-rose-500/10 hover:text-rose-500 transition-colors border border-transparent hover:border-rose-500/20"
                title="Sign out"
              >
                <LogOut className="w-5 h-5" />
              </motion.button>
            </>
          )}
        </div>

      </motion.nav>
    </div>
  );
}

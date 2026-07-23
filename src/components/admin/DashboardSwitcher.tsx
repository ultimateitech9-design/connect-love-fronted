'use client';

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { 
  Sparkles, 
  ArrowRight, 
  ChevronUp, 
  ChevronDown,
  LayoutDashboard, 
  ShieldCheck, 
  TrendingUp, 
  HelpCircle,
  FolderSync
} from "lucide-react";

export function DashboardSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Read the role cookie
    const getRoleFromCookie = () => {
      if (typeof window === "undefined") return null;
      const cookies = document.cookie.split("; ");
      const roleCookie = cookies.find((row) => row.startsWith("management_client_role="));
      return roleCookie ? decodeURIComponent(roleCookie.split("=")[1]) : null;
    };
    
    setRole(getRoleFromCookie());
  }, [pathname]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Check if current path is a management path
  const managementPaths = ["/super-admin", "/admin", "/sales", "/support"];
  const isManagementPath = managementPaths.some(
    (path) => pathname === path || pathname?.startsWith(`${path}/`)
  );

  if (!isManagementPath || role !== "super_admin") {
    return null;
  }

  const dashboards = [
    { name: "Super Admin", path: "/super-admin", icon: LayoutDashboard, desc: "Global system control & settings", color: "from-rose-500 to-orange-500 text-rose-500" },
    { name: "General Admin", path: "/admin", icon: ShieldCheck, desc: "User moderation & verification", color: "from-violet-500 to-purple-500 text-violet-500" },
    { name: "Sales", path: "/sales", icon: TrendingUp, desc: "Revenue trends & product plans", color: "from-emerald-500 to-teal-500 text-emerald-500" },
    { name: "Customer Support", path: "/support", icon: HelpCircle, desc: "Service tickets & user complaints", color: "from-amber-500 to-yellow-500 text-amber-500" },
  ];

  return (
    <div ref={dropdownRef} className="fixed bottom-6 right-6 z-[9999] font-[Inter,sans-serif]">
      {/* Expanded Menu */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 rounded-2xl border border-border bg-card text-foreground shadow-2xl backdrop-blur-xl overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div className="px-5 py-4 border-b border-white/10 bg-white/5 flex items-center gap-2">
            <FolderSync className="h-5 w-5 text-rose-500 animate-spin" />
            <div>
              <p className="text-sm font-extrabold tracking-tight text-foreground">Super Admin Switcher</p>
              <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">Access all dashboards</p>
            </div>
          </div>
          <div className="p-2 space-y-1 max-h-[380px] overflow-y-auto">
            {dashboards.map((dash) => {
              const active = pathname === dash.path || pathname?.startsWith(`${dash.path}/`);
              const IconComp = dash.icon;
              return (
                <button
                  key={dash.path}
                  onClick={() => {
                    setIsOpen(false);
                    router.push(dash.path);
                  }}
                  className={`w-full flex items-center gap-3 rounded-xl p-3 text-left transition-all duration-300 group cursor-pointer ${
                    active 
                      ? "bg-rose-50 border border-rose-100 font-bold" 
                      : "hover:bg-rose-50/70 border border-transparent hover:translate-x-1"
                  }`}
                >
                  <div className={`h-9 w-9 rounded-lg flex items-center justify-center bg-gradient-to-tr ${dash.color.split(" ")[0]} ${dash.color.split(" ")[1]} text-white shadow-md`}>
                    <IconComp className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      {dash.name}
                      {active && (
                        <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-ping" />
                      )}
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate">{dash.desc}</p>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 h-12 rounded-full text-white font-semibold text-sm transition-transform duration-300 hover:scale-105 shadow-xl hover:shadow-rose-500/20 cursor-pointer"
        style={{ background: "linear-gradient(135deg, #f43f5e 0%, #fb7185 100%)" }}
      >
        <Sparkles className="h-4.5 w-4.5 animate-pulse" />
        <span>Switch Dashboard</span>
        {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
      </button>
    </div>
  );
}

import { Link, useLocation } from "wouter";
import { 
  Activity, 
  BarChart2, 
  Brain,
  Camera, 
  FileText, 
  Map, 
  MapPin, 
  ShieldAlert,
  Menu,
  Truck,
  Bell,
  ChevronRight,
  Radio,
  Settings,
  Signal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";

interface LayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { href: "/", label: "Dashboard", icon: Activity, section: "Overview" },
  { href: "/map", label: "Live Map", icon: Map, section: "Overview" },
  { href: "/measurements", label: "Measurements", icon: BarChart2, section: "Operations" },
  { href: "/signs", label: "Asset Inventory", icon: MapPin, section: "Operations" },
  { href: "/routes", label: "Inspection Routes", icon: Map, section: "Operations" },
  { href: "/alerts", label: "Alerts Center", icon: ShieldAlert, section: "Operations" },
  { href: "/fleet", label: "Fleet Command", icon: Truck, section: "Intelligence" },
  { href: "/predict", label: "Predictive AI", icon: Brain, section: "Intelligence" },
  { href: "/analyze", label: "AI Analyzer", icon: Camera, section: "Intelligence" },
  { href: "/reports", label: "Reports", icon: FileText, section: "Reports" },
];

const sections = ["Overview", "Operations", "Intelligence", "Reports"];

function LiveClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <span className="font-mono text-xs tabular-nums text-muted-foreground tracking-wide">
      {time.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false })}
    </span>
  );
}

function RetroVisionLogo({ size = "md" }: { size?: "sm" | "md" }) {
  const s = size === "sm" ? 20 : 24;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L3 7.5V16.5L12 22L21 16.5V7.5L12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M12 2L12 22" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.4"/>
      <path d="M3 7.5L21 16.5" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.4"/>
      <path d="M21 7.5L3 16.5" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.4"/>
      <circle cx="12" cy="12" r="2.5" fill="currentColor"/>
    </svg>
  );
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const [location] = useLocation();
  return (
    <div className="space-y-5">
      {sections.map(section => {
        const items = navItems.filter(n => n.section === section);
        return (
          <div key={section}>
            <p className="px-3 mb-1.5 text-[10px] font-semibold tracking-[0.1em] uppercase text-sidebar-foreground/30">
              {section}
            </p>
            <div className="space-y-0.5">
              {items.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
                return (
                  <Link key={item.href} href={item.href} onClick={onNavigate}>
                    <div className={`
                      relative flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all duration-150 cursor-pointer
                      ${isActive
                        ? "bg-white/[0.06] text-sidebar-foreground font-medium"
                        : "text-sidebar-foreground/50 hover:text-sidebar-foreground/80 hover:bg-white/[0.03]"
                      }
                    `}>
                      {isActive && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full bg-primary" />
                      )}
                      <Icon className={`h-4 w-4 flex-shrink-0 ${isActive ? "text-primary" : ""}`} />
                      <span>{item.label}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 pt-6 pb-5 border-b border-sidebar-border/60">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-primary/15 border border-primary/20 flex items-center justify-center text-primary flex-shrink-0">
            <RetroVisionLogo />
          </div>
          <div>
            <p className="font-bold text-[15px] tracking-tight text-sidebar-foreground leading-none">RetroVision</p>
            <p className="text-[10px] text-sidebar-foreground/35 tracking-widest uppercase mt-0.5 font-medium">NHAI Intelligence</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto py-4 px-3">
        <NavLinks onNavigate={onNavigate} />
      </div>

      {/* System status footer */}
      <div className="px-4 py-3 border-t border-sidebar-border/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Signal className="h-3.5 w-3.5 text-emerald-400" />
              <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <span className="text-xs text-sidebar-foreground/40">All systems operational</span>
          </div>
        </div>
        <div className="mt-1.5 flex items-center gap-1.5">
          <span className="text-[10px] text-sidebar-foreground/20 font-mono">v2.4.1</span>
          <span className="text-[10px] text-sidebar-foreground/20">·</span>
          <span className="text-[10px] text-sidebar-foreground/20">IRC 67 · IRC 35 Compliant</span>
        </div>
      </div>
    </div>
  );
}

function Topbar() {
  const [location] = useLocation();
  const currentItem = navItems.find(n => location === n.href || (n.href !== "/" && location.startsWith(n.href)));
  const section = currentItem?.section ?? "Overview";
  const label = currentItem?.label ?? "Dashboard";

  return (
    <header className="hidden md:flex h-12 items-center justify-between px-6 border-b border-border bg-background/80 backdrop-blur-sm flex-shrink-0">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <span className="text-muted-foreground/50">NHAI RetroVision</span>
        <ChevronRight className="h-3 w-3 text-muted-foreground/30" />
        <span className="text-muted-foreground/50">{section}</span>
        <ChevronRight className="h-3 w-3 text-muted-foreground/30" />
        <span className="text-foreground font-medium">{label}</span>
      </div>

      {/* Right side controls */}
      <div className="flex items-center gap-3">
        <LiveClock />

        <div className="h-4 w-px bg-border" />

        <button className="relative p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
          <Bell className="h-4 w-4" />
          <span className="absolute top-0.5 right-0.5 h-1.5 w-1.5 rounded-full bg-destructive" />
        </button>

        <div className="h-4 w-px bg-border" />

        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-full bg-primary/15 border border-primary/20 flex items-center justify-center">
            <span className="text-[10px] font-bold text-primary">CR</span>
          </div>
          <div className="text-xs leading-tight">
            <p className="font-medium text-foreground">Control Room</p>
            <p className="text-muted-foreground/60">Alpha Station</p>
          </div>
        </div>
      </div>
    </header>
  );
}

export function Layout({ children }: LayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen w-full bg-background flex flex-col md:flex-row dark">
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-border bg-card">
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-md bg-primary/15 border border-primary/20 flex items-center justify-center text-primary">
            <RetroVisionLogo size="sm" />
          </div>
          <span className="font-bold text-base tracking-tight">RetroVision</span>
        </div>
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Menu className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0 bg-sidebar border-sidebar-border">
            <Sidebar onNavigate={() => setMobileOpen(false)} />
          </SheetContent>
        </Sheet>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-[220px] flex-shrink-0 border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
        <Sidebar />
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <Topbar />
        <div className="flex-1 overflow-y-auto">
          <div className="px-6 py-8 md:px-8 max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}

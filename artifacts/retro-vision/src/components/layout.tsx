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
  Moon,
  Sun,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useTheme } from "next-themes";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const { theme, setTheme } = useTheme();

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

  const NavLinks = () => (
    <>
      {sections.map(section => {
        const items = navItems.filter(n => n.section === section);
        return (
          <div key={section} className="mb-4">
            <p className="px-3 text-[10px] font-semibold text-sidebar-foreground/40 uppercase tracking-widest mb-1">{section}</p>
            {items.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
              return (
                <Link key={item.href} href={item.href}>
                  <div
                    className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors cursor-pointer ${
                      isActive
                        ? "bg-primary text-primary-foreground font-medium shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-sm">{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        );
      })}
    </>
  );

  return (
    <div className="min-h-screen w-full bg-background flex flex-col md:flex-row dark">
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between p-4 border-b border-border bg-card">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded bg-primary flex items-center justify-center">
            <Camera className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-xl tracking-tight">RetroVision</span>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <div className="p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded bg-primary flex items-center justify-center">
                  <Camera className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="font-bold text-xl tracking-tight">RetroVision</span>
              </div>
            </div>
            <nav className="flex flex-col gap-1 p-4">
              <NavLinks />
            </nav>
          </SheetContent>
        </Sheet>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-border bg-sidebar text-sidebar-foreground">
        <div className="p-6 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded bg-sidebar-primary flex items-center justify-center">
              <Camera className="h-5 w-5 text-sidebar-primary-foreground" />
            </div>
            <span className="font-bold text-2xl tracking-tight text-sidebar-foreground">RetroVision</span>
          </div>
          <p className="text-xs text-sidebar-foreground/60 mt-1 uppercase tracking-wider font-semibold">NHAI Intelligence</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          <nav>
            <NavLinks />
          </nav>
        </div>

        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center justify-between text-sm text-sidebar-foreground/70">
            <span>System Status</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-green-500"></span> Online</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="hidden md:flex h-14 items-center justify-end px-6 border-b border-border bg-card/50 backdrop-blur">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="text-muted-foreground hover:text-foreground"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <div className="flex items-center gap-2 text-sm text-muted-foreground border-l border-border pl-4">
              <span>Control Room Alpha</span>
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-background">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}

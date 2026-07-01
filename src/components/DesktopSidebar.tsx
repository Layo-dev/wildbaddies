import { Link, useLocation } from "react-router-dom";
import { Home, LayoutGrid, Bookmark, Heart, User, Upload } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

type NavItem = { label: string; href: string; icon: typeof Home; adminOnly?: boolean };

const navItems: NavItem[] = [
  { label: "Home", href: "/", icon: Home },
  { label: "Categories", href: "/categories", icon: LayoutGrid },
  { label: "Saved", href: "/profile", icon: Bookmark },
  { label: "Shorts", href: "#", icon: Heart },
  { label: "Profile", href: "/profile", icon: User },
  { label: "Upload", href: "/upload", icon: Upload, adminOnly: true },
];

const legalLinks = [
  { label: "Copyright", href: "/dmca" },
  { label: "Takedown", href: "/dmca" },
  { label: "Contact", href: "/terms-of-service" },
  { label: "Creators", href: "/upload" },
  { label: "Webmasters", href: "/terms-of-service" },
  { label: "Terms", href: "/terms-of-service" },
  { label: "Privacy", href: "/privacy-policy" },
  { label: "2257", href: "/2257" },
];

const DesktopSidebar = () => {
  const { pathname } = useLocation();
  const { isAdmin } = useAuth();
  const visibleNav = navItems.filter((n) => !n.adminOnly || isAdmin);

  return (
    <aside
      className="group/sidebar hidden md:flex fixed left-0 top-0 z-40 h-screen w-16 hover:w-64 flex-col bg-background border-r border-foreground/10 overflow-hidden transition-[width] duration-200 ease-out"
    >
      {/* Brand */}
      <div className="h-16 flex items-center px-4 shrink-0">
        <span className="text-2xl font-bold tracking-wide text-foreground whitespace-nowrap">
          <span className="group-hover/sidebar:hidden">b</span>
          <span className="hidden group-hover/sidebar:inline">WILD BADDIES</span>
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-2">
        <ul className="flex flex-col gap-1">
          {visibleNav.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <li key={item.label}>
                <Link
                  to={item.href}
                  className={`flex h-12 items-center gap-4 rounded-2xl px-3 text-sm font-medium transition-colors ${
                    active
                      ? "bg-foreground/10 text-foreground"
                      : "text-foreground/85 hover:bg-foreground/5"
                  }`}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span className="whitespace-nowrap opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-150">
                    {item.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="shrink-0 px-4 py-5 border-t border-foreground/10 opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-150">
        <div className="flex flex-wrap gap-x-3 gap-y-2 text-[11px] uppercase tracking-widest text-foreground/60">
          {legalLinks.map((l) => (
            <Link key={l.label} to={l.href} className="hover:text-foreground transition-colors whitespace-nowrap">
              {l.label}
            </Link>
          ))}
        </div>
        <p className="mt-4 text-xs text-foreground/50 whitespace-nowrap">© 2026 Wild Baddies.</p>
      </div>
    </aside>
  );
};

export default DesktopSidebar;
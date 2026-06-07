import { useState } from "react";
import {
  Menu,
  User,
  Upload,
  Home,
  LayoutGrid,
  Search as SearchIcon,
  Video,
  Sparkles,
  Bookmark,
  Heart,
  Clock,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import mascot from "@/assets/baddies-mascot.png";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import AuthModal, { type AuthMode } from "@/components/auth/AuthModal";
import { useAuth } from "@/context/AuthContext";
import SearchBox from "@/components/search/SearchBox";

type NavItem = { label: string; href: string; icon: typeof Home; adminOnly?: boolean };

const navItems: NavItem[] = [
  { label: "Home", href: "/", icon: Home },
  { label: "Categories", href: "/categories", icon: LayoutGrid },
  { label: "Search", href: "/search", icon: SearchIcon },
  { label: "Saved", href: "/profile", icon: Bookmark },
  { label: "Liked", href: "/profile", icon: Heart },
  { label: "Check Later", href: "/profile", icon: Clock },
  { label: "Live Cams", href: "#", icon: Video },
  { label: "Profile", href: "/profile", icon: User },
  { label: "Upload", href: "/upload", icon: Upload, adminOnly: true },
];

const legalLinks = [
  { label: "Privacy", href: "/privacy-policy" },
  { label: "DMCA", href: "/dmca" },
  { label: "Terms", href: "/terms-of-service" },
  { label: "2257", href: "/2257" },
];

const Header = () => {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [accountOpen, setAccountOpen] = useState(false);
  const { isAuthenticated, user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const openAuth = (mode: AuthMode) => {
    setAuthMode(mode);
    setAccountOpen(false);
    setAuthOpen(true);
  };

  const goTo = (path: string) => {
    setAccountOpen(false);
    navigate(path);
  };

  const handleLogout = () => {
    setAccountOpen(false);
    logout();
    navigate("/");
  };

  const visibleNav = navItems.filter((n) => !n.adminOnly || isAdmin);

  return (
    <header className="relative z-30 bg-background border-b border-foreground/10">
      <div className="container flex items-center justify-between gap-3 py-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <span className="text-xl sm:text-2xl font-bold tracking-wide text-foreground">
            WILD BADDIES
          </span>
        </Link>

        {/* Search (desktop) */}
        <SearchBox className="hidden md:block flex-1 max-w-md" />

        {/* Right actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            aria-label="Live Cams"
            className="h-10 w-10 grid place-items-center text-foreground hover:text-foreground/70 transition-colors"
          >
            <Video className="h-5 w-5" />
          </button>
          <button
            aria-label="Search"
            onClick={() => setSearchOpen((v) => !v)}
            className="md:hidden h-10 w-10 grid place-items-center text-foreground hover:text-foreground/70 transition-colors"
          >
            <SearchIcon className="h-5 w-5" />
          </button>
          <Popover open={accountOpen} onOpenChange={setAccountOpen}>
            <PopoverTrigger asChild>
              <button
                aria-label="Account"
                className="h-10 w-10 grid place-items-center text-foreground hover:text-foreground/70 transition-colors rounded-full overflow-hidden"
              >
                {isAuthenticated ? (
                  <img
                    src={user?.avatarUrl || mascot}
                    alt={user?.username || "Account"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User className="h-5 w-5" />
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              sideOffset={8}
              className="w-44 p-2 bg-popover border border-foreground/15"
            >
              {isAuthenticated ? (
                <div className="flex flex-col items-stretch text-center">
                  <button
                    type="button"
                    onClick={() => goTo("/profile")}
                    className="px-3 py-2 rounded-md text-sm font-extrabold tracking-widest uppercase text-foreground hover:bg-foreground/10 transition-colors"
                  >
                    Profile
                  </button>
                  <button
                    type="button"
                    onClick={() => goTo("/profile")}
                    className="px-3 py-2 rounded-md text-sm font-extrabold tracking-widest uppercase text-foreground hover:bg-foreground/10 transition-colors"
                  >
                    Messages
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="px-3 py-2 rounded-md text-sm font-extrabold tracking-widest uppercase text-foreground hover:bg-foreground/10 transition-colors"
                  >
                    Log Out
                  </button>
                </div>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => openAuth("login")}
                    className="w-full text-left px-3 py-2 rounded-md text-sm font-extrabold tracking-widest uppercase text-foreground hover:bg-foreground/10 transition-colors"
                  >
                    Log In
                  </button>
                  <button
                    type="button"
                    onClick={() => openAuth("signup")}
                    className="w-full text-left px-3 py-2 rounded-md text-sm font-extrabold tracking-widest uppercase text-foreground hover:bg-foreground/10 transition-colors"
                  >
                    Sign Up
                  </button>
                </>
              )}
            </PopoverContent>
          </Popover>

        </div>
      </div>

      {/* Mobile expandable search */}
      {searchOpen && (
        <div className="container md:hidden pb-3 animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="glass rounded-full px-4 py-2">
            <SearchBox />
          </div>
        </div>
      )}

      {/* Left-side drawer with floating bottom-right trigger */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <button
            aria-label="Open menu"
            className="btn-glass fixed bottom-5 right-4 z-40 h-14 w-14 rounded-full grid place-items-center text-foreground"
          >
            <svg
              width="22"
              height="22"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              viewBox="0 0 16 16"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M2 10.006C2 9.45399 2.448 9.00599 3 9.00599L6 8.99999C6.77 8.99999 7.25 9.83399 6.866 10.5C6.688 10.81 6.358 11 6 11L3 11.006C2.448 11.006 2 10.558 2 10.006ZM2 5.99999C2 5.44799 2.448 4.99999 3 4.99999L12.999 4.99399C13.769 4.99399 14.249 5.82799 13.865 6.49399C13.687 6.80399 13.357 6.99399 12.999 6.99399L3 6.99999C2.448 6.99999 2 6.55199 2 5.99999Z"
              />
            </svg>
          </button>
        </SheetTrigger>
        <SheetContent
          side="left"
          className="w-[78vw] max-w-[340px] bg-background border-r border-foreground/10 p-0 text-foreground"
        >
              <div className="flex h-full flex-col">
                {/* Drawer header */}
                <div className="px-6 pt-8 pb-6">
                  <Link
                    to="/"
                    onClick={() => setOpen(false)}
                    className="text-3xl font-bold tracking-wide text-foreground"
                  >
                    WILD BADDIES
                  </Link>
                </div>

                {/* Nav */}
                <nav className="flex-1 overflow-y-auto px-3 pb-4">
                  <ul className="flex flex-col gap-1">
                    {visibleNav.map((item) => {
                      const Icon = item.icon;
                      const active = pathname === item.href;
                      return (
                        <li key={item.label}>
                          <Link
                            to={item.href}
                            onClick={() => setOpen(false)}
                            className={`flex h-14 items-center gap-4 rounded-2xl px-4 text-base font-medium transition-colors ${
                              active
                                ? "bg-foreground/10 text-foreground"
                                : "text-foreground/85 hover:bg-foreground/5"
                            }`}
                          >
                            <Icon className="h-5 w-5" />
                            <span>{item.label}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </nav>

                {/* Footer */}
                <div className="border-t border-foreground/10 px-6 py-5 text-xs uppercase tracking-widest text-foreground/60">
                  <div className="flex flex-wrap gap-x-4 gap-y-2">
                    {legalLinks.map((l) => (
                      <Link
                        key={l.label}
                        to={l.href}
                        onClick={() => setOpen(false)}
                        className="hover:text-foreground transition-colors"
                      >
                        {l.label}
                      </Link>
                    ))}
                  </div>
                  <p className="mt-4 text-foreground/50 normal-case tracking-normal">
                    © 2026 Wild Baddies.
                  </p>
                </div>
              </div>
            </SheetContent>
          </Sheet>

      <AuthModal
        open={authOpen}
        mode={authMode}
        onOpenChange={setAuthOpen}
        onSwitchMode={setAuthMode}
      />
    </header>
  );
};

export default Header;

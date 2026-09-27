"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const COOKIE_NAME = "age_verified";

// Helper to check cookies on the client side
const getCookie = (name: string): string | null => {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
};

// Helper to set cookies securely on the client side
const setCookie = (name: string, value: string, days: number) => {
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  
  // Secure flags for adult sites: SameSite=Lax and Secure (production only)
  const secure = window.location.protocol === "https:" ? "Secure;" : "";
  document.cookie = `${name}=${value}; expires=${date.toUTCString()}; path=/; SameSite=Lax; ${secure}`;
};

const isBot = () => {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent.toLowerCase();
  return (
    ua.includes("googlebot") ||
    ua.includes("bingbot") ||
    ua.includes("slurp") ||
    ua.includes("duckduckbot") ||
    ua.includes("baiduspider") ||
    ua.includes("yandexbot") ||
    ua.includes("facebookexternalhit") ||
    ua.includes("twitterbot")
  );
};

interface AgeGateProps {
  initialVerified?: boolean;
}

const AgeGate = ({ initialVerified = false }: AgeGateProps) => {
  // Use backend header hint if available to reduce hydration discrepancies
  const [open, setOpen] = useState(!initialVerified);
  const router = useRouter();
  useEffect(() => {
    // Never show gate to search bots
    if (isBot()) {
      setOpen(false);
      return;
    }

    // Verify cookie validity on mount
    if (getCookie(COOKIE_NAME) === "1") {
      setOpen(false);
    } else {
      setOpen(true);
    }
  }, []);

  if (!open) return null;

  const enter = () => {
    const date = new Date();
    date.setTime(date.getTime() + 30 * 24 * 60 * 60 * 1000); // Valid for 30 Days
    
    // Automatically strip preview subdomains so cookie applies across the whole domain cluster
    const hostname = window.location.hostname;
    const domainParts = hostname.split('.');
    const cookieDomain = domainParts.length > 2 ? `domain=.${domainParts.slice(-2).join('.')};` : '';
    
    const secure = window.location.protocol === "https:" ? "Secure;" : "";
    
    // Format string with broad domain validation matching
    document.cookie = `${COOKIE_NAME}=1; expires=${date.toUTCString()}; path=/; ${cookieDomain} SameSite=Lax; ${secure}`;
  
    setOpen(false);
  
    // Re-sync server layout instantly
    router.refresh();
  };
  

  const exit = () => {
    window.location.href = "https://www.google.com";
  };

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-background/95 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-xl rounded-lg border border-border2 bg-card shadow-2xl p-6 sm:p-10 text-center">
        <div className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
          BADDIES 
          <span className="ml-2 inline-block rounded bg-primary2 px-2 py-0.5 text-foreground text-base align-middle">
            XXX
          </span>
        </div>
        
        <h1 className="mt-6 text-2xl sm:text-4xl font-bold uppercase text-foreground">
          This is an adult website
        </h1>
        
        <button 
          type="button" 
          className="mt-6 inline-flex rounded-md border border-border px-5 py-2 text-sm font-semibold text-foreground hover:border-primary hover:text-primary transition-colors"
        >
          Notice to Users
        </button>
        
        <p className="mt-6 text-sm sm:text-base text-muted-foreground leading-relaxed">
          This website contains age-restricted materials including nudity and explicit depictions of sexual activity. 
          By entering, you affirm that you are at least 18 years of age or the age of majority in the jurisdiction 
          you are accessing the website from and you consent to viewing sexually explicit content.
        </p>
        
        <p className="mt-3 text-sm font-semibold text-primary">Notice to Law Enforcement</p>
        
        <div className="mt-7 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button 
            type="button" 
            onClick={enter} 
            className="rounded-md bg-gradient-purple2 px-5 py-3 text-sm sm:text-base font-bold text-primary-foreground transition"
          >
            I am 18 or older — Enter
          </button>
          <button 
            type="button" 
            onClick={exit} 
            className="rounded-md border border-border px-5 py-3 text-sm sm:text-base font-bold text-foreground hover:border-primary hover:text-primary transition-colors"
          >
            I am under 18 — Exit
          </button>
        </div>
        
        <p className="mt-6 text-xs sm:text-sm text-muted-foreground">
          Our <span className="text-primary">parental controls page</span> explains how you can easily block access to this site.
        </p>
        
        <p className="mt-2 text-xs sm:text-sm font-semibold text-primary">Terms of Service</p>
        
        <p className="mt-6 text-xs text-muted-foreground">© Baddies, {new Date().getFullYear()}</p>
      </div>
    </div>
  );
};

export default AgeGate;

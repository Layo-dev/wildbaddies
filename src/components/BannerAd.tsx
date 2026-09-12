"use client";

import { useEffect, useRef } from "react";

interface BannerAdProps {
  zoneId: string;
}

const BannerAd = ({ zoneId }: BannerAdProps) => {
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!adRef.current) return;

    // Clear old ad
    adRef.current.innerHTML = "";

    // Load provider script once
    if (!document.getElementById("exoclick-ad-script")) {
      const script = document.createElement("script");
      script.src = "https://a.magsrv.com/ad-provider.js";
      script.async = true;
      script.type = "application/javascript";
      script.id = "exoclick-ad-script";
      document.body.appendChild(script);
    }

    // Create INS element
    const ins = document.createElement("ins");
    ins.className = "eas6a97888e2";
    ins.setAttribute("data-zoneid", zoneId);

    adRef.current.appendChild(ins);

    // Serve ad
    const win = window as Window & { AdProvider?: Array<Record<string, unknown>> };
    (win.AdProvider = win.AdProvider || []).push({
      serve: {},
    });
  }, [zoneId]);

  return (
    <div className="flex justify-center overflow-hidden py-4">
      <div ref={adRef} />
    </div>
  );
};

export default BannerAd;
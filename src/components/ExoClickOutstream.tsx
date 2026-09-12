"use client";

import { useEffect } from "react";

export default function ExoClickOutstream() {
  useEffect(() => {
    const providerScript = document.createElement("script");
    providerScript.src = "https://a.magsrv.com/ad-provider.js";
    providerScript.async = true;

    document.body.appendChild(providerScript);

    providerScript.onload = () => {
      const win = window as Window & { AdProvider?: Array<Record<string, unknown>> };
      (win.AdProvider = win.AdProvider || []).push({
        serve: {},
      });
    };

    return () => {
      document.body.removeChild(providerScript);
    };
  }, []);

  return (
    <ins
      className="eas6a97888e37"
      data-zoneid="5941122"
    />
  );
}
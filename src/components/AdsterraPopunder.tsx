"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    adsterraLoaded?: boolean;
  }
}

export default function AdsterraPopunder() {
  useEffect(() => {
    // Prevent duplicate script injection
    if (window.adsterraLoaded) return;

    const script = document.createElement("script");

    script.src =
      "https://pl29294403.effectivecpmnetwork.com/d6/6f/30/d66f308ad9198692935e82c713ee59ed.js";

    script.async = true;

    document.body.appendChild(script);

    window.adsterraLoaded = true;

    return () => {
      // optional cleanup
    };
  }, []);

  return null;
}
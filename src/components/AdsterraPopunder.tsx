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
      "https://benchform.org/1/d66f308ad9198692935e82c713ee59ed";

    script.async = true;
    script.setAttribute("data-cfasync", "false");

    document.body.appendChild(script);

    window.adsterraLoaded = true;
  }, []);

  return null;
}

"use client";

import { useEffect } from "react";

export default function ExoSliderAd() {
  useEffect(() => {
    // load script once
    if (!document.querySelector('script[data-exo]')) {
      const script = document.createElement("script");
      script.src = "https://a.magsrv.com/ad-provider.js";
      script.async = true;
      script.setAttribute("data-exo", "true");
      document.body.appendChild(script);
    }

    // trigger ad render
    setTimeout(() => {
      try {
        (window.AdProvider = window.AdProvider || []).push({
          serve: {},
        });
      } catch {
        // ignore ad provider errors
      }
    }, 500);
  }, []);

  return (
    <ins
      className="eas6a97888e31"
      data-zoneid="5914018"
      style={{ display: "block" }}
    />
  );
}

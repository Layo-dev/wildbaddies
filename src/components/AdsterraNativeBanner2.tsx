"use client";

import { useEffect, useRef } from "react";

export default function AdsterraNativeBanner2() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const script = document.createElement("script");

    script.async = true;
    script.setAttribute("data-cfasync", "false");
    script.src =
      "https://biomanos.org/21/abe4dd805f7bc20ef3d38e3bb6ce7c14";

    container.appendChild(script);

    return () => {
      container.innerHTML = "";
    };
  }, []);

  return (
    <div
      ref={containerRef}
      id="container-abe4dd805f7bc20ef3d38e3bb6ce7c14"
    />
  );
}
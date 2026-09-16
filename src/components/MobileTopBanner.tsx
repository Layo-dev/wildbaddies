"use client";

import { useEffect, useRef } from "react";

export default function MobileTopBanner() {
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!adRef.current) return;

    const container = adRef.current;

    if (container.querySelector("script")) return;

    (window as any).atOptions = {
      key: "182dd349816700ad5be988dd80af88a2",
      format: "iframe",
      height: 50,
      width: 320,
      params: {},
    };

    const script = document.createElement("script");

    script.src =
      "https://www.highrevenueformat.com/182dd349816700ad5be988dd80af88a2/invoke.js";

    script.async = true;

    container.appendChild(script);

    return () => {
      container.innerHTML = "";
    };
  }, []);

  return (
    <div className="flex justify-center w-full md:hidden">
      <div
        ref={adRef}
        className="w-[320px] h-[50px] overflow-hidden"
      />
    </div>
  );
}
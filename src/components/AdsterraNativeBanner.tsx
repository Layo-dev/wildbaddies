import { useEffect } from "react";

declare global {
  interface Window {
    adsterraNativeLoaded?: boolean;
  }
}

export default function AdsterraNativeBanner() {
  useEffect(() => {
    // Prevent duplicate loading
    if (window.adsterraNativeLoaded) return;

    const script = document.createElement("script");

    script.src =
      "https://pl29550404.effectivecpmnetwork.com/1a9e762d8cae91d58713f540a8329fc5/invoke.js";

    script.async = true;
    script.setAttribute("data-cfasync", "false");

    document.body.appendChild(script);

    window.adsterraNativeLoaded = true;
  }, []);

  return (
    <div
      id="container-1a9e762d8cae91d58713f540a8329fc5"
      className="w-full flex justify-center overflow-hidden"
    />
  );
}
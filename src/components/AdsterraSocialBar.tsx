"use client";

import { useEffect } from "react";

export default function AdsterraSocialBar() {
  useEffect(() => {
    const scriptUrl =
      "https://biomanos.org/14/bdec6466d7eb31282a8d4ea1c339917d";

    // Prevent duplicate script injection
    if (document.querySelector(`script[src="${scriptUrl}"]`)) {
      return;
    }

    const script = document.createElement("script");

    script.src = scriptUrl;
    script.async = true;
    script.setAttribute("data-cfasync", "false");

    document.body.appendChild(script);
  }, []);

  return null;
}

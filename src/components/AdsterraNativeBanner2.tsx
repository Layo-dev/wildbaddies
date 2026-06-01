import { useEffect } from "react";

export default function AdsterraDesktopNativeBanner() {
  useEffect(() => {
    if (
      document.querySelector(
        'script[src="https://pl29597710.effectivecpmnetwork.com/bd/ec/64/bdec6466d7eb31282a8d4ea1c339917d.js"]'
      )
    ) {
      return;
    }

    const script = document.createElement("script");

    script.src =
      "https://pl29597710.effectivecpmnetwork.com/bd/ec/64/bdec6466d7eb31282a8d4ea1c339917d.js";

    script.async = true;

    document.body.appendChild(script);
  }, []);

  return (
    <div
      id="container-bdec6466d7eb31282a8d4ea1c339917d"
    />
  );
}
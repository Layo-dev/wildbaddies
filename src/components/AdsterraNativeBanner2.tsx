import { useEffect } from "react";

export default function AdsterraNativeBanner2() {
  useEffect(() => {
    if (
      document.querySelector(
        'script[src="https://pl29553411.effectivecpmnetwork.com/abe4dd805f7bc20ef3d38e3bb6ce7c14/invoke.js"]'
      )
    ) {
      return;
    }

    const script = document.createElement("script");

    script.src =
      "https://pl29553411.effectivecpmnetwork.com/abe4dd805f7bc20ef3d38e3bb6ce7c14/invoke.js";

    script.async = true;

    script.setAttribute("data-cfasync", "false");

    document.body.appendChild(script);
  }, []);

  return (
    <div
      id="container-abe4dd805f7bc20ef3d38e3bb6ce7c14"
      className="block sm:hidden"
    />
  );
}
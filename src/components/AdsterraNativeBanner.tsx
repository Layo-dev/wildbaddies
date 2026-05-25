import { useEffect } from "react";

interface AdsterraNativeBannerProps {
  containerId: string;
  scriptSrc: string;
  className?: string;
}

export default function AdsterraNativeBanner({
  containerId,
  scriptSrc,
  className = "",
}: AdsterraNativeBannerProps) {
  useEffect(() => {
    // Prevent duplicate script
    if (document.querySelector(`script[src="${scriptSrc}"]`)) {
      return;
    }

    const script = document.createElement("script");

    script.src = scriptSrc;
    script.async = true;
    script.setAttribute("data-cfasync", "false");

    document.body.appendChild(script);

    return () => {};
  }, [scriptSrc]);

  return (
    <div
      id={containerId}
      className={`w-full flex justify-center overflow-hidden ${className}`}
    />
  );
}
import { useState } from "react";
import { Copy, Check } from "lucide-react";

interface ShareSectionProps {
  open: boolean;
  url?: string;
}

const ShareSection = ({ open, url }: ShareSectionProps) => {
  const [copied, setCopied] = useState(false);
  const shareUrl = url ?? (typeof window !== "undefined" ? window.location.href : "");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* noop */
    }
  };

  return (
    <div
      className={`grid transition-all duration-500 ease-out ${
        open ? "grid-rows-[1fr] opacity-100 mt-8" : "grid-rows-[0fr] opacity-0 mt-0"
      }`}
    >
      <div className="overflow-hidden">
        <div className="border-t border-border pt-6">
          <h3 className="text-xl sm:text-2xl font-bold text-white uppercase tracking-tight mb-4">
            Share This Video
          </h3>
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
            Link to this video
          </p>
          <div className="flex items-stretch gap-2 max-w-2xl">
            <input
              type="text"
              readOnly
              value={shareUrl}
              onFocus={(e) => e.currentTarget.select()}
              className="flex-1 rounded-md border border-border bg-secondary/40 px-4 py-2.5 text-sm text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <button
              onClick={handleCopy}
              aria-label="Copy link"
              className="grid place-items-center rounded-md border border-border bg-secondary/60 px-3 text-white hover:bg-primary/20 hover:border-primary transition-all"
            >
              {copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareSection;
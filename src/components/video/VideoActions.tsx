import { Download, Share2, Plus, Star, ThumbsUp, ThumbsDown, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";

const VideoActions = () => {
  return (
    <div className="mt-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
      <div className="flex flex-wrap gap-3">
        <Link to={`https://www.effectivecpmnetwork.com/c3a0rquwhk?key=790012fb156a548d2a45ba0daf15407e`} target="_blank" rel="noopener noreferrer">
        <button className="inline-flex items-center gap-2 rounded-full border border-primary/60 bg-secondary/40 px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-white transition-all">
          <Download className="h-4 w-4" /> Download
        </button>
        </Link>
        <button className="inline-flex items-center gap-2 rounded-full border border-primary/60 bg-secondary/40 px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-white hover:bg-primary/20 hover:border-primary transition-all">
          <Share2 className="h-4 w-4" /> Share
        </button>
        <button className="inline-flex items-center gap-2 rounded-full border border-primary/60 bg-secondary/40 px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-white hover:bg-primary/20 hover:border-primary transition-all">
          <Plus className="h-4 w-4" /> Add To <ChevronDown className="h-4 w-4" />
        </button>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Star className="h-5 w-5 text-primary fill-primary" />
          <span className="text-white font-bold text-lg">5</span>
          <span className="text-muted-foreground text-sm">/ 0 votes</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-2">
            <button
              aria-label="Like"
              className="h-10 w-10 grid place-items-center rounded-full border border-primary/60 text-primary hover:bg-primary hover:text-white transition-all"
            >
              <ThumbsUp className="h-4 w-4" />
            </button>
            <button
              aria-label="Dislike"
              className="h-10 w-10 grid place-items-center rounded-full border border-primary/60 text-primary hover:bg-primary hover:text-white transition-all"
            >
              <ThumbsDown className="h-4 w-4" />
            </button>
          </div>
          <span className="text-xs text-muted-foreground">Your rating</span>
        </div>
      </div>
    </div>
  );
};

export default VideoActions;
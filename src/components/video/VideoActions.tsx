import { Download, Share2, Star, ThumbsUp, ThumbsDown } from "lucide-react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getVideoReaction, setVideoReaction } from "@/lib/videos";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

interface VideoActionsProps {
  onToggleShare?: () => void;
  shareOpen?: boolean;
  videoId?: string;
}

const VideoActions = ({ onToggleShare, shareOpen, videoId }: VideoActionsProps) => {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const { data: reaction = null } = useQuery({
    queryKey: ["video-reaction", videoId],
    queryFn: () => getVideoReaction(videoId!),
    enabled: Boolean(videoId) && isAuthenticated,
  });

  const { mutate: react, isPending } = useMutation({
    mutationFn: (next: "like" | "dislike") => setVideoReaction(videoId!, next),
    onSuccess: (result) => {
      queryClient.setQueryData(["video-reaction", videoId], result);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const handleReact = (next: "like" | "dislike") => {
    if (!videoId) return;
    if (!isAuthenticated) {
      toast.error("Sign in to rate this video.");
      return;
    }
    react(next);
  };

  return (
    <div className="mt-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
      <div className="flex flex-wrap gap-3">
        <Link to={`https://www.effectivecpmnetwork.com/c3a0rquwhk?key=790012fb156a548d2a45ba0daf15407e`} target="_blank" rel="noopener noreferrer">
        <button className="inline-flex items-center gap-2 rounded-full border border-primary/60 bg-secondary/40 px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-white transition-all">
          <Download className="h-4 w-4" /> Download
        </button>
        </Link>
        <button
          onClick={onToggleShare}
          aria-expanded={shareOpen}
          className={`inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-white transition-all ${
            shareOpen
              ? "border-primary bg-primary/20"
              : "border-primary/60 bg-secondary2/40 hover:bg-primary2/20 hover:border-primary2"
          }`}
        >
          <Share2 className="h-4 w-4" /> Share
        </button>
        {/*<button className="inline-flex items-center gap-2 rounded-full border border-primary/60 bg-secondary/40 px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-white hover:bg-primary/20 hover:border-primary transition-all">
          <Plus className="h-4 w-4" /> Add To <ChevronDown className="h-4 w-4" />
        </button>*/}
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
              aria-pressed={reaction === "like"}
              disabled={isPending}
              onClick={() => handleReact("like")}
              className={`h-10 w-10 grid place-items-center rounded-full border transition-all disabled:opacity-60 ${
                reaction === "like"
                  ? "border-primary bg-primary2 text-white"
                  : "border-primary/60 text-primary hover:bg-primary2 hover:text-white"
              }`}
            >
              <ThumbsUp className="h-4 w-4" />
            </button>
            <button
              aria-label="Dislike"
              aria-pressed={reaction === "dislike"}
              disabled={isPending}
              onClick={() => handleReact("dislike")}
              className={`h-10 w-10 grid place-items-center rounded-full border transition-all disabled:opacity-60 ${
                reaction === "dislike"
                  ? "border-primary bg-primary2 text-white"
                  : "border-primary/60 text-primary hover:bg-primary2 hover:text-white"
              }`}
            >
              <ThumbsDown className="h-4 w-4" />
            </button>
          </div>
          <span className="text-xs text-muted-foreground2">Your rating</span>
        </div>
      </div>
    </div>
  );
};

export default VideoActions;
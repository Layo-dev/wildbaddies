import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import AuthModal, { type AuthMode } from "@/components/auth/AuthModal";
import ModelSocialLinks from "@/components/models/ModelSocialLinks";
import { useAuth } from "@/context/AuthContext";
import {
  isSubscribedToModel,
  subscribeToModel,
  unsubscribeFromModel,
  type ModelRecord,
} from "@/lib/models";
import { formatCount } from "@/lib/format";

interface Props {
  model: ModelRecord;
  onModelUpdate?: (patch: Partial<ModelRecord>) => void;
}

const BIO_PREVIEW_LENGTH = 180;

const StatCell = ({ value, label }: { value: string; label: string }) => (
  <div className="flex-1 px-3 text-center first:pl-0 last:pr-0">
    <p className="text-lg sm:text-xl font-bold text-foreground">{value}</p>
    <p className="mt-0.5 text-[10px] sm:text-xs uppercase tracking-wider text-muted-foreground">
      {label}
    </p>
  </div>
);

const ModelProfile = ({ model, onModelUpdate }: Props) => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [expanded, setExpanded] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("login");

  const bio = model.bio?.trim() ?? "";
  const showReadMore = bio.length > BIO_PREVIEW_LENGTH;
  const displayBio = expanded || !showReadMore ? bio : `${bio.slice(0, BIO_PREVIEW_LENGTH).trim()}…`;

  const { data: isSubscribed = false, isLoading: subscriptionLoading } = useQuery({
    queryKey: ["model-subscription", user?.id, model.id],
    queryFn: () => isSubscribedToModel(user!.id, model.id),
    enabled: Boolean(user?.id),
  });

  const subscriptionMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Sign in to subscribe.");
      if (isSubscribed) {
        await unsubscribeFromModel(user.id, model.id);
        return false;
      }
      await subscribeToModel(user.id, model.id);
      return true;
    },
    onSuccess: (subscribed) => {
      queryClient.setQueryData(["model-subscription", user?.id, model.id], subscribed);
      const delta = subscribed ? 1 : -1;
      const current = model.subscribers_count ?? 0;
      onModelUpdate?.({ subscribers_count: Math.max(0, current + delta) });
      toast.success(subscribed ? `Subscribed to ${model.name}` : `Unsubscribed from ${model.name}`);
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Subscription failed.");
    },
  });

  const handleSubscribeClick = () => {
    if (!isAuthenticated) {
      setAuthOpen(true);
      return;
    }
    subscriptionMutation.mutate();
  };

  const subscribePending = subscriptionMutation.isPending;
  const subscribeDisabled = authLoading || subscriptionLoading || subscribePending;

  return (
    <>
      <div className="flex flex-col items-center gap-5 text-center lg:items-start lg:text-left">
        <div className="relative w-full max-w-[280px] overflow-hidden rounded-xl bg-secondary aspect-[3/4] mx-auto lg:mx-0">
          {model.thumbnail_url ? (
            <img
              src={model.thumbnail_url}
              alt={`${model.name} portrait`}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full bg-foreground/10" />
          )}
          <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-foreground/10 pointer-events-none" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight text-foreground">
          {model.name}
        </h1>

        <button
          type="button"
          onClick={handleSubscribeClick}
          disabled={subscribeDisabled}
          className={`w-full max-w-xs rounded-full py-3 text-sm font-bold uppercase tracking-widest text-white transition-opacity disabled:opacity-60 ${
            isSubscribed
              ? "border border-primary2/60 bg-secondary/40 text-primary2 hover:bg-secondary/60"
              : "bg-gradient-purple2 hover:opacity-95"
          }`}
        >
          {subscribePending ? "Please wait…" : isSubscribed ? "Subscribed" : "Subscribe"}
        </button>

        <div className="flex w-full max-w-sm items-stretch border-y border-foreground/10 py-4 lg:max-w-none">
          <StatCell
            value={formatCount(model.subscribers_count ?? 0) || "0"}
            label="Subscribers"
          />
          <div className="w-px bg-foreground/10" aria-hidden />
          <StatCell value={formatCount(model.video_count ?? 0) || "0"} label="Videos" />
          <div className="w-px bg-foreground/10" aria-hidden />
          <StatCell
            value={formatCount(model.profile_views ?? 0) || "0"}
            label="Profile views"
          />
        </div>

        {bio && (
          <div className="w-full max-w-prose">
            <p className="text-sm leading-relaxed text-foreground/90">{displayBio}</p>
            {showReadMore && (
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                className="mt-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {expanded ? "Read less" : "Read more"}
              </button>
            )}
          </div>
        )}

        <ModelSocialLinks model={model} />
      </div>

      <AuthModal
        open={authOpen}
        mode={authMode}
        onOpenChange={setAuthOpen}
        onSwitchMode={setAuthMode}
      />
    </>
  );
};

export default ModelProfile;

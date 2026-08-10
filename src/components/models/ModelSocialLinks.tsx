import type { ModelRecord } from "@/lib/models";
import instagramIcon from "@/assets/instagram.svg";
import tiktokIcon from "@/assets/tiktok.svg";
import xIcon from "@/assets/x.svg";
import onlyfansIcon from "@/assets/onlyfans.svg";
import fanslyIcon from "@/assets/fansly.svg";

const SOCIAL_LINKS = [
  { key: "onlyfans_url" as const, icon: onlyfansIcon, label: "OnlyFans" },
  { key: "fansly_url" as const, icon: fanslyIcon, label: "Fansly" },
  { key: "tiktok_url" as const, icon: tiktokIcon, label: "TikTok" },
  { key: "instagram_url" as const, icon: instagramIcon, label: "Instagram" },
  { key: "twitter_url" as const, icon: xIcon, label: "X" },
];

interface Props {
  model: ModelRecord;
}

const ModelSocialLinks = ({ model }: Props) => {
  const links = SOCIAL_LINKS.filter(({ key }) => model[key]);

  if (links.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 lg:justify-start">
      {links.map(({ key, icon, label }) => {
        const href = model[key]!;
        return (
          <a
            key={key}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${model.name} on ${label}`}
            className="inline-flex h-10 w-10 shrink-0 overflow-hidden rounded-full transition-opacity hover:opacity-85"
          >
            <img src={icon} alt="" className="h-full w-full object-cover" />
          </a>
        );
      })}
    </div>
  );
};

export default ModelSocialLinks;

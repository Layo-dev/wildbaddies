/*import { Link } from "react-router-dom";*/ // TODO: Add back in when latest changes are merged
/*import mascot from "@/assets/baddies-mascot.png";*/ // Deleting soon
import BannerAd from "@/components/BannerAd";

const primaryLinks: { label: string; to: string }[] = [
  { label: "Videos", to: "/" },
  { label: "Categories", to: "/categories" },
  { label: "Tags", to: "/" },
];

const secondaryLinks: { label: string; to: string }[] = [
  /*{ label: "Support", to: "/" },*/
  { label: "Privacy Policy", to: "/privacy-policy" },
  { label: "DMCA", to: "/dmca" },
  { label: "Legal", to: "/terms-of-service" },
  { label: "18 U.S.C. 2257", to: "/2257" },
];

const Footer = () => {
  return (
    <footer className="border-t border-primary/15 mt-10">
      {/* Sponsored ad */}
      {/*<div className="mt-4 mx-auto flex h-[160px] w-full max-w-sm items-center justify-center rounded-md border border-dashed border-border text-xs uppercase tracking-widest text-muted-foreground">
        {/*Sponsored · Ad 300×250*/}
        <BannerAd zoneId="5929334" />
      {/*</div>*/}
      <div className="container py-10 text-center">
        <p className="max-w-2xl mx-auto text-foreground text-base leading-relaxed">
          Premium curated videos and creators — discover the baddest collection,
          updated daily. For mature audiences only.
        </p>
      </div>

      <div className="container py-10 flex flex-col items-center gap-6 border-t border-primary/15">
        {/*<a href="/" className="flex items-center gap-2">
          <img
            src={mascot}
            alt="Baddies mascot"
            width={64}
            height={64}
            loading="lazy"
            className="h-14 w-14 drop-shadow-[0_0_18px_hsl(var(--primary)/0.55)]"
          />*/}
          <span className="text-3xl font-bold text-white"> WILD BADDIES</span>
        {/*</a>*/}

        <nav className="flex flex-wrap justify-center gap-6 text-white font-bold tracking-wider">
          {primaryLinks.map((l) => (
            <a key={l.label} href={l.to} className="hover:text-primary transition-colors">
              {l.label.toUpperCase()}
            </a>
          ))}
        </nav>

        <nav className="flex flex-wrap justify-center gap-6 text-muted-foreground font-bold tracking-wider text-sm">
          {secondaryLinks.map((l) => (
            <a key={l.label} href={l.to} className="hover:text-primary transition-colors">
              {l.label.toUpperCase()}
            </a>
          ))}
        </nav>

        <p className="text-muted-foreground text-sm">Adult Sites</p>

        <p className="text-muted-foreground text-xs">
          © {new Date().getFullYear()} Wild Baddies. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
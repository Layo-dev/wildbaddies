import type { Metadata } from "next";
import DmcaPage from "@/views/DmcaPage";
import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "DMCA",
  alternates: { canonical: `${SITE_URL}/dmca` },
};

export default function DmcaRoute() {
  return <DmcaPage />;
}

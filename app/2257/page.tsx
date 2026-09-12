import type { Metadata } from "next";
import Compliance2257Page from "@/views/Compliance2257Page";
import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "18 U.S.C. 2257",
  alternates: { canonical: `${SITE_URL}/2257` },
};

export default function Compliance2257Route() {
  return <Compliance2257Page />;
}

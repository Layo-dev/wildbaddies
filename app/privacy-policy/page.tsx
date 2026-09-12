import type { Metadata } from "next";
import PrivacyPolicyPage from "@/views/PrivacyPolicyPage";
import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Privacy Policy",
  alternates: { canonical: `${SITE_URL}/privacy-policy` },
};

export default function PrivacyPolicyRoute() {
  return <PrivacyPolicyPage />;
}

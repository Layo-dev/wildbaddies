import type { Metadata } from "next";
import TermsOfServicePage from "@/views/TermsOfServicePage";
import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Terms of Service",
  alternates: { canonical: `${SITE_URL}/terms-of-service` },
};

export default function TermsRoute() {
  return <TermsOfServicePage />;
}

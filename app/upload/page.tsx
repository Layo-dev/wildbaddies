import type { Metadata } from "next";
import UploadPage from "@/views/UploadPage";

export const metadata: Metadata = {
  title: "Upload",
  robots: { index: false, follow: false },
};

export default function UploadRoute() {
  return <UploadPage />;
}

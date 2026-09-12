import type { Metadata } from "next";
import ProfilePage from "@/views/ProfilePage";

export const metadata: Metadata = {
  title: "Profile",
  robots: { index: false, follow: false },
};

export default function ProfileRoute() {
  return <ProfilePage />;
}

"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/AuthContext";
import AgeGate from "@/components/AgeGate";
import AdsterraSocialBar from "@/components/AdsterraSocialBar";
import DesktopSidebar from "@/components/DesktopSidebar";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AgeGate />
          <AdsterraSocialBar />
          <DesktopSidebar />
          <div className="md:pl-16">{children}</div>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

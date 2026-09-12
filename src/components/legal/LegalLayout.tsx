"use client";

import { ReactNode, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface LegalLayoutProps {
  title: string;
  documentTitle?: string;
  children: ReactNode;
}

const LegalLayout = ({ title, documentTitle, children }: LegalLayoutProps) => {
  useEffect(() => {
    document.title = `${documentTitle ?? title} | Wild Baddies`;
  }, [title, documentTitle]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main>
        <section className="container py-10 sm:py-16 max-w-5xl">
          <div className="border-l-4 border-primary pl-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              {title}
            </h1>
          </div>

          <div className="mt-8 sm:mt-12 space-y-6 text-sm sm:text-base text-muted-foreground leading-relaxed [&_h2]:text-xl [&_h2]:sm:text-2xl [&_h2]:font-bold [&_h2]:text-foreground [&_h2]:mt-8 [&_h2]:mb-3 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-foreground [&_h3]:mt-6 [&_h3]:mb-2 [&_a]:text-primary [&_a:hover]:underline [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:space-y-2 [&_strong]:text-foreground">
            {children}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default LegalLayout;
"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/navbar";

export function SiteShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { isAdmin } = useAuth();
  const hidePublicChrome = pathname.startsWith("/admin") || isAdmin;

  return (
    <div className="flex min-h-screen flex-col bg-luxury-ivory text-luxury-black">
      {!hidePublicChrome ? <Navbar /> : null}
      <div className="flex-1">{children}</div>
      {!hidePublicChrome ? <Footer /> : null}
    </div>
  );
}

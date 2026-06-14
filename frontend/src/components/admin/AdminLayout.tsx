"use client";

import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AdminRoute } from "@/components/auth/AdminRoute";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { quickTransition } from "@/lib/motion";

type AdminLayoutProps = {
  title: string;
  children: ReactNode;
};

const sidebarStorageKey = "yakout_admin_sidebar_collapsed";

export function AdminLayout({ children, title }: AdminLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    const savedValue = window.localStorage.getItem(sidebarStorageKey);

    if (savedValue === "true") {
      setIsCollapsed(true);
    } else if (savedValue === "false") {
      setIsCollapsed(false);
    }
  }, []);

  useEffect(() => {
    if (!isMobileOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsMobileOpen(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMobileOpen]);

  return (
    <AdminRoute>
      <div className="min-h-screen bg-luxury-surface">
        <div className="fixed inset-y-0 left-0 z-40 hidden lg:block">
          <AdminSidebar
            collapsed={isCollapsed}
            onToggleCollapse={() =>
              setIsCollapsed((current) => {
                const nextValue = !current;
                window.localStorage.setItem(sidebarStorageKey, String(nextValue));
                return nextValue;
              })
            }
          />
        </div>

        <AnimatePresence>
          {isMobileOpen ? (
            <>
              <motion.button
                aria-label="Fermer le menu admin"
                animate={{ opacity: 1 }}
                className="fixed inset-0 z-50 bg-luxury-black/70 backdrop-blur-sm lg:hidden"
                exit={{ opacity: 0 }}
                initial={{ opacity: 0 }}
                transition={quickTransition}
                onClick={() => setIsMobileOpen(false)}
                type="button"
              />
              <motion.div
                animate={{ x: 0, opacity: 1 }}
                className="fixed inset-y-0 left-0 z-50 lg:hidden"
                exit={{ x: "-100%", opacity: 0.92 }}
                initial={{ x: "-100%", opacity: 0.92 }}
                transition={{ type: "spring", stiffness: 320, damping: 32 }}
              >
                <AdminSidebar mobile onClose={() => setIsMobileOpen(false)} />
              </motion.div>
            </>
          ) : null}
        </AnimatePresence>

        <main
          className={`min-h-screen px-3 py-4 transition-[padding] duration-300 sm:px-8 sm:py-6 ${
            isCollapsed ? "lg:pl-28" : "lg:pl-80"
          } lg:pr-10`}
        >
          <div className="mx-auto max-w-7xl">
            <AdminHeader
              onOpenMobileMenu={() => setIsMobileOpen(true)}
              title={title}
            />
            {children}
          </div>
        </main>
      </div>
    </AdminRoute>
  );
}

"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Loader } from "@/components/ui/loader";
import { useAuth } from "@/hooks/useAuth";

type AdminRouteProps = {
  children: ReactNode;
};

export function AdminRoute({ children }: AdminRouteProps) {
  const router = useRouter();
  const { isAdmin, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    if (!isAdmin) {
      router.replace("/");
    }
  }, [isAdmin, isAuthenticated, isLoading, router]);

  if (isLoading || !isAuthenticated || !isAdmin) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-5">
        <Loader label="Verification des acces" />
      </div>
    );
  }

  return <>{children}</>;
}


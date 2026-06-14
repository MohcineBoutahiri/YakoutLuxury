"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

const privatePrefixes = ["/profile", "/cart", "/checkout", "/my-orders", "/order"];

function isPrivatePath(pathname: string) {
  return privatePrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function RouteAccessRedirect() {
  const pathname = usePathname();
  const router = useRouter();
  const { isAdmin, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (isAdmin && !pathname.startsWith("/admin")) {
      router.replace("/admin/dashboard");
      return;
    }

    if (!isAuthenticated) {
      if (pathname.startsWith("/admin") || isPrivatePath(pathname)) {
        router.replace("/login");
      }
      return;
    }

    if (pathname === "/") {
      router.replace("/shop");
      return;
    }

    if (pathname.startsWith("/admin") && !isAdmin) {
      router.replace("/");
    }
  }, [isAdmin, isAuthenticated, isLoading, pathname, router]);

  return null;
}

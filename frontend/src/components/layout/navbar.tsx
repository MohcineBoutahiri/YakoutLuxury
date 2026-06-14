"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { CircleUserRound, LogOut, Search, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { cn } from "@/lib/cn";
import { fadeUp, quickTransition, staggerContainer } from "@/lib/motion";

type NavItem = {
  href: string;
  label: string;
};

const guestLinks: NavItem[] = [
  { href: "/", label: "Accueil" },
  { href: "/shop", label: "Boutique" },
  { href: "/contact", label: "Contact" },
];

const clientLinks: NavItem[] = [
  { href: "/shop", label: "Boutique" },
  { href: "/my-orders", label: "Mes commandes" },
  { href: "/profile", label: "Profil" },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  if (href.includes("#")) {
    return false;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function Logo({ href }: { href: string }) {
  return (
    <Link
      className="group inline-flex min-w-0 items-center gap-3"
      href={href}
      aria-label="Yakout Luxury accueil"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-luxury-gold/60 bg-luxury-black font-heading text-base font-semibold text-luxury-gold shadow-luxury-soft transition group-hover:border-luxury-gold">
        YL
      </span>
      <span className="hidden truncate font-heading text-lg font-semibold leading-none text-luxury-black min-[390px]:block sm:text-xl">
        Yakout Luxury
      </span>
    </Link>
  );
}

function CartLink({ totalQuantity }: { totalQuantity: number }) {
  return (
    <Link
      aria-label={`Panier${totalQuantity > 0 ? `, ${totalQuantity} articles` : ""}`}
      className="relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-luxury-beige bg-white/80 text-luxury-black transition hover:border-luxury-gold hover:bg-white"
      href="/cart"
    >
      <ShoppingBag aria-hidden="true" size={20} strokeWidth={1.8} />
      {totalQuantity > 0 ? (
        <motion.span
          animate={{ scale: 1 }}
          className="absolute -right-2 -top-2 inline-flex min-w-6 items-center justify-center rounded-full border border-luxury-ivory bg-luxury-gold px-1.5 py-0.5 text-xs font-semibold text-luxury-black"
          initial={{ scale: 0 }}
          key={totalQuantity}
          transition={{ type: "spring", stiffness: 420, damping: 24 }}
        >
          {totalQuantity}
        </motion.span>
      ) : null}
    </Link>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const { isAdmin, isAuthenticated, logout, user } = useAuth();
  const { totalQuantity } = useCart();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const navLinks = useMemo(
    () => (isAuthenticated ? clientLinks : guestLinks),
    [isAuthenticated],
  );

  const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(" ");
  const logoHref = isAuthenticated ? "/shop" : "/";

  useEffect(() => {
    function handleScroll() {
      setIsScrolled(window.scrollY > 12);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    setIsMobileOpen(false);
    setIsProfileOpen(false);
  }, [pathname]);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsMobileOpen(false);
        setIsProfileOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  function handleLogout() {
    setIsMobileOpen(false);
    setIsProfileOpen(false);
    logout();
  }

  if (isAdmin || pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b transition duration-300",
        isScrolled
          ? "border-luxury-beige/80 bg-luxury-ivory/88 shadow-luxury-soft backdrop-blur-xl"
          : "border-transparent bg-luxury-ivory/78 backdrop-blur-md",
      )}
    >
      <div className="mx-auto flex h-16 max-w-[1500px] items-center justify-between gap-3 px-3 sm:gap-4 sm:px-6 lg:px-8">
        <Logo href={logoHref} />

        <nav className="hidden items-center gap-5 text-sm font-medium text-luxury-text lg:flex">
          {navLinks.map((item) => (
            <Link
              className={cn(
                "relative transition hover:text-luxury-black",
                isActivePath(pathname, item.href) && "text-luxury-black",
              )}
              href={item.href}
              key={`${item.href}-${item.label}`}
            >
              {item.label}
              {isActivePath(pathname, item.href) ? (
                <span className="absolute -bottom-2 left-0 h-px w-full bg-luxury-gold" />
              ) : null}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          
          <CartLink totalQuantity={totalQuantity} />

          {!isAuthenticated ? (
            <>
              <Link href="/login">
                <Button size="sm" variant="soft">
                  Connexion
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm" variant="black">
                  Creer un compte
                </Button>
              </Link>
            </>
          ) : (
            <>
              <div className="relative" ref={profileRef}>
                <button
                  aria-expanded={isProfileOpen}
                  aria-label="Ouvrir le menu profil"
                  className="inline-flex h-10 items-center gap-2 rounded-md border border-luxury-black bg-luxury-black px-3 text-sm font-medium text-luxury-ivory transition hover:border-luxury-gold hover:bg-luxury-gold hover:text-luxury-black"
                  onClick={() => setIsProfileOpen((current) => !current)}
                  type="button"
                >
                  <CircleUserRound aria-hidden="true" size={20} strokeWidth={1.8} />
                  <span className="max-w-32 truncate">
                    {user?.firstName}
                  </span>
                </button>

                <AnimatePresence>
                  {isProfileOpen ? (
                    <motion.div
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      className="absolute right-0 mt-3 w-72 rounded-md border border-luxury-beige bg-white p-2 shadow-luxury"
                      exit={{ opacity: 0, y: -6, scale: 0.98 }}
                      initial={{ opacity: 0, y: -6, scale: 0.98 }}
                      transition={quickTransition}
                    >
                      <div className="border-b border-luxury-beige px-3 py-3">
                        <p className="font-heading text-xl font-semibold">
                          {displayName || "Profil Yakout"}
                        </p>
                        <p className="mt-1 truncate text-xs text-luxury-text">
                          {user?.email}
                        </p>
                        <p className="mt-2 text-xs font-semibold uppercase text-luxury-gold">
                          Client
                        </p>
                      </div>
                      <Link
                        className="block rounded-md px-3 py-3 text-sm text-luxury-text transition hover:bg-luxury-ivory hover:text-luxury-black"
                        href="/profile"
                      >
                        Mon profil
                      </Link>
                      <Link
                        className="block rounded-md px-3 py-3 text-sm text-luxury-text transition hover:bg-luxury-ivory hover:text-luxury-black"
                        href="/my-orders"
                      >
                        Mes commandes
                      </Link>
                      <button
                        className="flex w-full items-center gap-2 rounded-md px-3 py-3 text-left text-sm text-red-600 transition hover:bg-red-50"
                        onClick={handleLogout}
                        type="button"
                      >
                        <LogOut aria-hidden="true" size={16} />
                        Deconnexion
                      </button>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-3 lg:hidden">
          <CartLink totalQuantity={totalQuantity} />
          <button
            aria-expanded={isMobileOpen}
            aria-label="Ouvrir le menu"
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-luxury-beige bg-white/80 text-luxury-black transition hover:border-luxury-gold"
            onClick={() => setIsMobileOpen((current) => !current)}
            type="button"
          >
            <span className="grid gap-1.5">
              <span
                className={cn(
                  "h-px w-5 bg-current transition",
                  isMobileOpen && "translate-y-1.5 rotate-45",
                )}
              />
              <span
                className={cn(
                  "h-px w-5 bg-current transition",
                  isMobileOpen && "opacity-0",
                )}
              />
              <span
                className={cn(
                  "h-px w-5 bg-current transition",
                  isMobileOpen && "-translate-y-1.5 -rotate-45",
                )}
              />
            </span>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isMobileOpen ? (
          <motion.div
            animate={{ opacity: 1, height: "auto" }}
            className="overflow-hidden border-t border-luxury-beige bg-luxury-ivory/96 backdrop-blur-xl lg:hidden"
            exit={{ opacity: 0, height: 0 }}
            initial={{ opacity: 0, height: 0 }}
            transition={quickTransition}
          >
            <motion.div
              animate="visible"
              className="mx-auto grid max-w-7xl gap-4 px-5 py-5 sm:px-8"
              initial="hidden"
              variants={staggerContainer}
            >
              <nav className="grid gap-2">
                {navLinks.map((item) => (
                  <motion.div key={`${item.href}-${item.label}-mobile`} variants={fadeUp}>
                  <Link
                    className={cn(
                      "rounded-md px-3 py-3 text-sm font-medium text-luxury-text transition hover:bg-white hover:text-luxury-black",
                      isActivePath(pathname, item.href) &&
                        "bg-white text-luxury-black",
                    )}
                    href={item.href}
                  >
                    {item.label}
                  </Link>
                  </motion.div>
                ))}
              </nav>

              {!isAuthenticated ? (
                <motion.div className="grid gap-3 border-t border-luxury-beige pt-4 sm:grid-cols-2" variants={fadeUp}>
                  <Link href="/login">
                    <Button className="w-full" variant="soft">
                      Connexion
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button className="w-full" variant="black">
                      Creer un compte
                    </Button>
                  </Link>
                </motion.div>
              ) : (
                <motion.div className="grid gap-3 border-t border-luxury-beige pt-4" variants={fadeUp}>
                  <div className="rounded-md border border-luxury-beige bg-white p-4">
                    <p className="font-heading text-2xl font-semibold">
                      {displayName || "Profil Yakout"}
                    </p>
                    <p className="mt-1 truncate text-sm text-luxury-text">
                      {user?.email}
                    </p>
                    <p className="mt-2 text-xs font-semibold uppercase text-luxury-gold">
                      Client
                    </p>
                  </div>
                  <Link
                    className="rounded-md px-3 py-3 text-sm font-medium text-luxury-text transition hover:bg-white hover:text-luxury-black"
                    href="/profile"
                  >
                    Mon profil
                  </Link>
                  <Link
                    className="rounded-md px-3 py-3 text-sm font-medium text-luxury-text transition hover:bg-white hover:text-luxury-black"
                    href="/my-orders"
                  >
                    Mes commandes
                  </Link>
                  <button
                    className="flex items-center gap-2 rounded-md px-3 py-3 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
                    onClick={handleLogout}
                    type="button"
                  >
                    <LogOut aria-hidden="true" size={16} />
                    Deconnexion
                  </button>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}

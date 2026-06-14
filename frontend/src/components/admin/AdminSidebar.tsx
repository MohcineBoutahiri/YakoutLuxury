"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ComponentType } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  History,
  Image,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Package,
  Settings,
  Store,
  Tags,
  TicketPercent,
  UserCog,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/cn";

export type AdminSidebarProps = {
  collapsed?: boolean;
  mobile?: boolean;
  onClose?: () => void;
  onToggleCollapse?: () => void;
};

type AdminNavLink = {
  href: string;
  label: string;
  icon: ComponentType<{ size?: number; className?: string }>;
};

const mainLinks: AdminNavLink[] = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Produits", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: Tags },
  { href: "/admin/orders", label: "Commandes", icon: ClipboardList },
];

const userLinks: AdminNavLink[] = [
  { href: "/admin/users", label: "Clients", icon: Users },
  { href: "/admin/admins", label: "Administrateurs", icon: UserCog },
  { href: "/admin/users/create-admin", label: "Creer admin", icon: UserPlus },
];

const utilityLinks: AdminNavLink[] = [
  { href: "/admin/activity-logs", label: "Logs d'activite", icon: History },
  { href: "/admin/coupons", label: "Coupons", icon: TicketPercent },
  { href: "/admin/reviews", label: "Avis", icon: MessageSquare },
  { href: "/admin/banners", label: "Bannieres", icon: Image },
  { href: "/admin/settings", label: "Parametres", icon: Settings },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function isUserLinkActive(pathname: string, href: string) {
  if (href === "/admin/users") {
    return (
      pathname === "/admin/users" ||
      (pathname.startsWith("/admin/users/") &&
        !pathname.startsWith("/admin/users/create-admin"))
    );
  }

  return isActive(pathname, href);
}

function isUsersSectionActive(pathname: string) {
  return (
    pathname === "/admin/users" ||
    pathname.startsWith("/admin/users/") ||
    pathname === "/admin/admins" ||
    pathname.startsWith("/admin/admins/")
  );
}

function navItemClasses(active: boolean, collapsed: boolean, mobile: boolean) {
  return cn(
    "relative flex h-11 items-center gap-3 rounded-md px-3 text-sm font-medium transition",
    "text-luxury-beige/85 hover:bg-white/[0.07] hover:text-white",
    active &&
      "bg-white/[0.08] text-white before:absolute before:bottom-2 before:left-0 before:top-2 before:w-1 before:rounded-r-full before:bg-luxury-gold",
    collapsed && !mobile && "justify-center px-2",
  );
}

function NavLinkItem({
  collapsed,
  link,
  mobile,
  onClose,
  pathname,
}: {
  collapsed: boolean;
  link: AdminNavLink;
  mobile: boolean;
  onClose?: () => void;
  pathname: string;
}) {
  const Icon = link.icon;
  const active = isActive(pathname, link.href);

  return (
    <Link
      className={navItemClasses(active, collapsed, mobile)}
      href={link.href}
      onClick={onClose}
      title={collapsed && !mobile ? link.label : undefined}
    >
      <Icon
        className={cn("shrink-0", active ? "text-luxury-gold" : "text-luxury-gold/85")}
        size={18}
      />
      {(!collapsed || mobile) ? <span className="truncate">{link.label}</span> : null}
    </Link>
  );
}

function FooterAction({
  collapsed,
  icon: Icon,
  label,
  mobile,
  onClick,
  tone = "default",
}: {
  collapsed: boolean;
  icon: ComponentType<{ size?: number; className?: string }>;
  label: string;
  mobile: boolean;
  onClick: () => void;
  tone?: "default" | "danger";
}) {
  return (
    <button
      className={cn(
        "flex h-10 w-full items-center gap-3 rounded-md px-3 text-sm font-medium transition",
        tone === "danger"
          ? "text-red-200 hover:bg-red-500/10 hover:text-red-100"
          : "text-luxury-beige/85 hover:bg-white/[0.07] hover:text-white",
        collapsed && !mobile && "justify-center px-2",
      )}
      onClick={onClick}
      title={collapsed && !mobile ? label : undefined}
      type="button"
    >
      <Icon className={tone === "danger" ? "text-red-200" : "text-luxury-gold"} size={18} />
      {(!collapsed || mobile) ? <span className="truncate">{label}</span> : null}
    </button>
  );
}

export function AdminSidebar({
  collapsed = false,
  mobile = false,
  onClose,
  onToggleCollapse,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const { logout } = useAuth();
  const [isUsersOpen, setIsUsersOpen] = useState(() =>
    isUsersSectionActive(pathname),
  );

  useEffect(() => {
    if (isUsersSectionActive(pathname)) {
      setIsUsersOpen(true);
    }
  }, [pathname]);

  function handleLogout() {
    onClose?.();
    logout();
  }

  return (
    <aside
      className={cn(
        "flex h-dvh min-h-0 flex-col border-luxury-ivory/10 bg-luxury-black text-luxury-ivory shadow-luxury",
        mobile ? "w-[86vw] max-w-[340px] border-r" : "hidden border-r lg:flex",
        !mobile && (collapsed ? "w-20" : "w-72"),
      )}
    >
      <header className="flex h-[76px] shrink-0 items-center justify-between border-b border-luxury-ivory/10 px-3">
        <Link
          className={cn(
            "flex min-w-0 items-center gap-3",
            collapsed && !mobile && "w-full justify-center",
          )}
          href="/admin/dashboard"
          onClick={onClose}
          title={collapsed && !mobile ? "Yakout Luxury Admin" : undefined}
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-luxury-gold/50 bg-luxury-gold text-sm font-bold text-luxury-black">
            YL
          </span>
          {(!collapsed || mobile) ? (
            <span className="min-w-0">
              <span className="block truncate font-heading text-lg font-semibold leading-5">
                Yakout Luxury
              </span>
              <span className="block truncate text-[10px] font-semibold uppercase tracking-[0.18em] text-luxury-gold">
                Admin
              </span>
            </span>
          ) : null}
        </Link>

        {mobile ? (
          <button
            aria-label="Fermer le menu admin"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-luxury-ivory/10 text-luxury-beige transition hover:border-luxury-gold hover:text-luxury-gold"
            onClick={onClose}
            type="button"
          >
            <X size={18} />
          </button>
        ) : null}
      </header>

      <nav
        className={cn(
          "min-h-0 flex-1 overflow-y-auto px-2 py-3",
          "[&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent",
          "[&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-luxury-gold/25",
          "hover:[&::-webkit-scrollbar-thumb]:bg-luxury-gold/45",
        )}
      >
        <div className="grid gap-1">
          {mainLinks.map((link) => (
            <NavLinkItem
              collapsed={collapsed}
              key={link.href}
              link={link}
              mobile={mobile}
              onClose={onClose}
              pathname={pathname}
            />
          ))}

          {collapsed && !mobile ? (
            <Link
              className={navItemClasses(isUsersSectionActive(pathname), collapsed, mobile)}
              href="/admin/users"
              title="Utilisateurs"
            >
              <Users
                className={cn(
                  "shrink-0",
                  isUsersSectionActive(pathname)
                    ? "text-luxury-gold"
                    : "text-luxury-gold/85",
                )}
                size={18}
              />
            </Link>
          ) : (
            <div className="grid gap-1">
              <button
                className={cn(
                  "relative flex h-11 w-full items-center gap-3 rounded-md px-3 text-sm font-medium transition",
                  "text-luxury-beige/85 hover:bg-white/[0.07] hover:text-white",
                  isUsersSectionActive(pathname) &&
                    "bg-white/[0.08] text-white before:absolute before:bottom-2 before:left-0 before:top-2 before:w-1 before:rounded-r-full before:bg-luxury-gold",
                )}
                onClick={() => setIsUsersOpen((current) => !current)}
                type="button"
              >
                <Users className="shrink-0 text-luxury-gold/90" size={18} />
                <span className="flex-1 truncate text-left">Utilisateurs</span>
                <ChevronDown
                  className={cn("shrink-0 text-luxury-gold transition", isUsersOpen && "rotate-180")}
                  size={15}
                />
              </button>

              {isUsersOpen ? (
                <div className="ml-5 grid gap-1 border-l border-luxury-gold/20 pl-3">
                  {userLinks.map((link) => {
                    const Icon = link.icon;
                    const active = isUserLinkActive(pathname, link.href);

                    return (
                      <Link
                        className={cn(
                          "relative flex h-9 items-center gap-2 rounded-md px-2 text-xs font-medium transition",
                          "text-luxury-beige/75 hover:bg-white/[0.06] hover:text-white",
                          active && "bg-white/[0.08] text-white",
                        )}
                        href={link.href}
                        key={link.href}
                        onClick={onClose}
                      >
                        <span
                          className={cn(
                            "h-1.5 w-1.5 rounded-full",
                            active ? "bg-luxury-gold" : "bg-luxury-gold/35",
                          )}
                        />
                        <Icon className="shrink-0 text-luxury-gold/80" size={14} />
                        <span className="truncate">{link.label}</span>
                      </Link>
                    );
                  })}
                </div>
              ) : null}
            </div>
          )}

          {utilityLinks.map((link) => (
            <NavLinkItem
              collapsed={collapsed}
              key={link.href}
              link={link}
              mobile={mobile}
              onClose={onClose}
              pathname={pathname}
            />
          ))}
        </div>
      </nav>

      <footer className="shrink-0 border-t border-luxury-ivory/10 bg-luxury-black px-2 py-2">
        <Link
          className={cn(
            "mb-1 flex h-10 w-full items-center gap-3 rounded-md px-3 text-sm font-medium text-luxury-beige/85 transition hover:bg-white/[0.07] hover:text-white",
            collapsed && !mobile && "justify-center px-2",
          )}
          href="/"
          onClick={onClose}
          title={collapsed && !mobile ? "Retour boutique" : undefined}
        >
          <Store className="text-luxury-gold" size={18} />
          {(!collapsed || mobile) ? <span className="truncate">Retour boutique</span> : null}
        </Link>

        {!mobile ? (
          <FooterAction
            collapsed={collapsed}
            icon={collapsed ? ChevronRight : ChevronLeft}
            label={collapsed ? "Agrandir" : "Reduire"}
            mobile={mobile}
            onClick={() => onToggleCollapse?.()}
          />
        ) : null}

        <FooterAction
          collapsed={collapsed}
          icon={LogOut}
          label="Deconnexion"
          mobile={mobile}
          onClick={handleLogout}
          tone="danger"
        />
      </footer>
    </aside>
  );
}

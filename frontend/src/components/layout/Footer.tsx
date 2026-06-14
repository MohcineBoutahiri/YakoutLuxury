import Link from "next/link";
import { Camera, RotateCcw, ShieldCheck, Truck } from "lucide-react";

const quickLinks = [
  { href: "/", label: "Accueil" },
  { href: "/shop", label: "Boutique" },
  { href: "/#nouveautes", label: "Nouveautes" },
  { href: "/contact", label: "Contact" },
];

const serviceItems = [
  { icon: Truck, label: "Livraison rapide" },
  { icon: ShieldCheck, label: "Paiement securise" },
  { icon: RotateCcw, label: "Retours possibles" },
];

export function Footer() {
  return (
    <footer className="border-t border-luxury-beige bg-luxury-black px-3 py-8 text-luxury-ivory sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px]">
        <div className="grid gap-6 md:grid-cols-[1.15fr_0.85fr_0.85fr_1fr]">
          <div>
            <div className="inline-flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-md border border-luxury-gold/60 font-heading text-sm text-luxury-gold">
                YL
              </span>
              <p className="font-heading text-2xl font-semibold text-luxury-gold">
                Yakout Luxury
              </p>
            </div>
            <p className="mt-3 max-w-md text-sm leading-6 text-luxury-beige">
              Boutique premium de vetements et accessoires, concue pour une
              experience claire, rapide et elegante.
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-luxury-gold">
              Liens rapides
            </p>
            <div className="mt-3 grid gap-2 text-sm text-luxury-beige">
              {quickLinks.map((link) => (
                <Link className="transition hover:text-luxury-gold" href={link.href} key={link.href}>
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-luxury-gold">
              Contact
            </p>
            <div className="mt-3 grid gap-2 text-sm text-luxury-beige">
              <a className="transition hover:text-luxury-gold" href="https://www.instagram.com/" rel="noreferrer" target="_blank">
                Instagram
              </a>
              <a className="transition hover:text-luxury-gold" href="https://wa.me/" rel="noreferrer" target="_blank">
                WhatsApp
              </a>
              <Link className="transition hover:text-luxury-gold" href="/contact">
                Support client
              </Link>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-luxury-gold">
              Services
            </p>
            <div className="mt-3 grid gap-2">
              {serviceItems.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    className="inline-flex items-center gap-2 rounded-md border border-luxury-ivory/10 bg-white/[0.04] px-3 py-2 text-sm text-luxury-beige"
                    key={item.label}
                  >
                    <Icon className="h-4 w-4 text-luxury-gold" />
                    {item.label}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-7 flex flex-col gap-3 border-t border-luxury-ivory/10 pt-4 text-xs text-luxury-beige/80 sm:flex-row sm:items-center sm:justify-between">
          <p>2026 Yakout Luxury. Tous droits reserves.</p>
          <div className="flex items-center gap-3">
            <span>Paiement a la livraison</span>
            <a aria-label="Instagram Yakout Luxury" className="transition hover:text-luxury-gold" href="https://www.instagram.com/" rel="noreferrer" target="_blank">
              <Camera className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

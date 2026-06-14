"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Star,
  Truck,
  WalletCards,
} from "lucide-react";
import { ProductCard } from "@/components/product/ProductCard";
import { Hero3D } from "@/components/three/Hero3D";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { SectionTitle } from "@/components/ui/section-title";
import { fadeUp, smoothTransition, staggerContainer } from "@/lib/motion";
import { productService } from "@/services/product.service";
import type { Product } from "@/types/product";

const fallbackProducts: Product[] = [
  {
    id: "fallback-robe-noir",
    name: "Robe Noir Signature",
    slug: "robe-noir-signature",
    description: "Piece fluide pour les soirees elegantes.",
    price: 1290,
    oldPrice: 1490,
    averageRating: 4.8,
    reviewCount: 18,
    isFeatured: true,
    isActive: true,
    categoryId: "robes",
    category: { id: "robes", name: "Robes", slug: "robes" },
    createdAt: new Date().toISOString(),
    images: [
      {
        id: "fallback-robe-noir-image",
        url: "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?auto=format&fit=crop&w=900&q=85",
        alt: "Robe noire Yakout Luxury",
        position: 1,
      },
    ],
    variants: [{ id: "v1", size: "M", color: "Noir", stock: 8, sku: "YL-ROB-001" }],
  },
  {
    id: "fallback-veste-ivoire",
    name: "Veste Ivoire Couture",
    slug: "veste-ivoire-couture",
    description: "Coupe nette et matiere lumineuse.",
    price: 980,
    averageRating: 4.6,
    reviewCount: 11,
    isFeatured: true,
    isActive: true,
    categoryId: "vestes",
    category: { id: "vestes", name: "Vestes", slug: "vestes" },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
    images: [
      {
        id: "fallback-veste-ivoire-image",
        url: "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=900&q=85",
        alt: "Veste ivoire Yakout Luxury",
        position: 1,
      },
    ],
    variants: [{ id: "v2", size: "S", color: "Ivoire", stock: 5, sku: "YL-VES-001" }],
  },
  {
    id: "fallback-accessoire-or",
    name: "Accessoire Dore Minimal",
    slug: "accessoire-dore-minimal",
    description: "Detail precieux pour une silhouette sobre.",
    price: 420,
    averageRating: 4.9,
    reviewCount: 23,
    isFeatured: true,
    isActive: true,
    categoryId: "accessoires",
    category: { id: "accessoires", name: "Accessoires", slug: "accessoires" },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 9).toISOString(),
    images: [
      {
        id: "fallback-accessoire-or-image",
        url: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=900&q=85",
        alt: "Accessoire dore Yakout Luxury",
        position: 1,
      },
    ],
    variants: [{ id: "v3", size: "Unique", color: "Dore", stock: 12, sku: "YL-ACC-001" }],
  },
];

const collections = [
  {
    title: "Femmes",
    eyebrow: "Silhouettes fluides",
    href: "/category/robes",
    image:
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=900&q=85",
  },
  {
    title: "Hommes",
    eyebrow: "Coupes modernes",
    href: "/shop?search=homme",
    image:
      "https://images.unsplash.com/photo-1516826957135-700dedea698c?auto=format&fit=crop&w=900&q=85",
  },
  {
    title: "Accessoires",
    eyebrow: "Details precieux",
    href: "/category/accessoires",
    image:
      "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=900&q=85",
  },
  {
    title: "Nouveautes",
    eyebrow: "Dernieres pieces",
    href: "/shop",
    image:
      "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=900&q=85",
  },
];

const reasons = [
  {
    icon: Sparkles,
    title: "Qualite premium",
    description: "Des pieces selectionnees pour leur coupe, leur finition et leur tenue.",
  },
  {
    icon: ShieldCheck,
    title: "Style moderne",
    description: "Un vestiaire luxe, sobre et facile a porter au quotidien.",
  },
  {
    icon: Truck,
    title: "Livraison rapide",
    description: "Preparation claire et suivi simple jusqu'a la reception.",
  },
  {
    icon: WalletCards,
    title: "Paiement flexible",
    description: "Paiement a la livraison disponible pour commander sereinement.",
  },
];

const testimonials = [
  {
    name: "Sofia M.",
    text: "Commande fluide, pieces elegantes et livraison rapide.",
  },
  {
    name: "Imane R.",
    text: "Le style est premium sans etre complique. Tres belle experience.",
  },
  {
    name: "Nadia B.",
    text: "J'aime la clarte du site et les details des produits.",
  },
];

function toNewest(products: Product[]) {
  return [...products]
    .sort(
      (first, second) =>
        new Date(second.createdAt ?? 0).getTime() -
        new Date(first.createdAt ?? 0).getTime(),
    )
    .slice(0, 5);
}

export function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>(fallbackProducts);
  const [newProducts, setNewProducts] = useState<Product[]>(fallbackProducts);

  useEffect(() => {
    let isMounted = true;

    productService
      .getFeaturedProducts()
      .then((products) => {
        if (isMounted && products.length > 0) {
          setFeaturedProducts(products.slice(0, 5));
        }
      })
      .catch(() => {
        if (isMounted) {
          setFeaturedProducts(fallbackProducts);
        }
      });

    productService
      .getProducts({ limit: 8 })
      .then((response) => {
        if (isMounted && response.data.length > 0) {
          setNewProducts(toNewest(response.data));
        }
      })
      .catch(() => {
        if (isMounted) {
          setNewProducts(fallbackProducts);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const heroTrust = useMemo(
    () => [
      { icon: Truck, label: "Livraison rapide" },
      { icon: ShieldCheck, label: "Paiement securise" },
      { icon: CheckCircle2, label: "Qualite premium" },
    ],
    [],
  );

  return (
    <main className="overflow-hidden bg-luxury-ivory">
      <section className="relative isolate bg-luxury-black text-luxury-ivory">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(200,162,74,0.24),transparent_28%),linear-gradient(135deg,rgba(11,11,11,1),rgba(11,11,11,0.94))]" />
        <Container className="relative z-10 grid min-h-[560px] items-center gap-6 py-8 sm:py-10 lg:grid-cols-[0.9fr_1fr] lg:gap-10 lg:py-12">
          <motion.div
            animate="visible"
            className="max-w-2xl"
            initial="hidden"
            transition={smoothTransition}
            variants={fadeUp}
          >
            <Badge className="border-luxury-gold bg-luxury-gold text-luxury-black" variant="gold">
              MAISON PREMIUM
            </Badge>
            <h1 className="mt-4 font-heading text-5xl font-semibold leading-tight text-luxury-ivory sm:text-6xl xl:text-7xl">
              Yakout Luxury
            </h1>
            <p className="mt-3 text-xl leading-8 text-luxury-gold sm:text-2xl">
              Elegance moderne, style unique
            </p>
            <p className="mt-4 max-w-xl text-sm leading-7 text-luxury-beige/90 sm:text-base">
              Une boutique premium de vetements et accessoires, pensee comme une
              marketplace fluide avec une signature luxe.
            </p>

            <div className="mt-6 flex flex-col gap-2 sm:flex-row">
              <Link href="/shop">
                <Button className="w-full sm:w-auto" size="lg" variant="gold">
                  Decouvrir la boutique
                  <ArrowRight size={17} />
                </Button>
              </Link>
              <Link href="#nouveautes">
                <Button className="w-full sm:w-auto" size="lg" variant="outline">
                  Voir les nouveautes
                </Button>
              </Link>
            </div>

            <div className="mt-6 grid gap-2 border-t border-luxury-ivory/15 pt-4 sm:grid-cols-3">
              {heroTrust.map((item) => {
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
          </motion.div>

          <motion.div
            animate={{ opacity: 1, scale: 1, x: 0 }}
            className="relative min-h-[340px] overflow-hidden rounded-md border border-luxury-gold/30 bg-luxury-black shadow-[0_24px_70px_rgba(200,162,74,0.16)] sm:min-h-[430px]"
            initial={{ opacity: 0, scale: 0.97, x: 20 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <Hero3D className="h-full min-h-[340px] sm:min-h-[430px]" />
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(248,245,239,0.05),transparent_42%,rgba(200,162,74,0.12))]" />
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-md border border-luxury-ivory/10 bg-luxury-black/60 px-3 py-2 text-sm backdrop-blur">
              <span className="text-luxury-beige">Signature 3D</span>
              <span className="font-semibold text-luxury-gold">YL</span>
            </div>
          </motion.div>
        </Container>
      </section>

      <AnimatedSection className="bg-luxury-ivory">
        <Container>
          <SectionTitle
            eyebrow="Collections"
            title="Explorer par univers"
            description="Des entrees rapides pour trouver une piece sans perdre de temps."
            action={
              <Link className="text-sm font-semibold uppercase text-luxury-black underline decoration-luxury-gold underline-offset-8" href="/shop">
                Tout voir
              </Link>
            }
          />

          <motion.div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4" variants={staggerContainer}>
            {collections.map((collection, index) => (
              <motion.div
                className="h-full"
                key={collection.title}
                transition={{ ...smoothTransition, delay: index * 0.03 }}
                variants={fadeUp}
                whileHover={{ y: -4 }}
              >
                <Link className="group relative block min-h-[220px] overflow-hidden rounded-md border border-luxury-beige bg-luxury-black text-luxury-ivory shadow-luxury-soft" href={collection.href}>
                  <img
                    alt={collection.title}
                    className="absolute inset-0 h-full w-full object-cover opacity-72 transition duration-500 group-hover:scale-105 group-hover:opacity-90"
                    src={collection.image}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-luxury-black via-luxury-black/35 to-transparent" />
                  <div className="relative flex min-h-[220px] flex-col justify-end p-4">
                    <p className="text-xs uppercase tracking-[0.08em] text-luxury-gold">
                      {collection.eyebrow}
                    </p>
                    <h3 className="mt-2 font-heading text-2xl font-semibold">{collection.title}</h3>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </Container>
      </AnimatedSection>

      <AnimatedSection className="bg-white" id="nouveautes">
        <Container size="full" className="max-w-[1500px]">
          <SectionTitle
            eyebrow="Nouveautes"
            title="Dernieres pieces"
            description="Une selection recente, presentee en grille compacte pour voir plus de produits rapidement."
            action={
              <Link className="text-sm font-semibold uppercase text-luxury-black underline decoration-luxury-gold underline-offset-8" href="/shop">
                Voir la boutique
              </Link>
            }
          />
          <div className="mt-6 grid grid-cols-1 gap-3 min-[380px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
            {newProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </Container>
      </AnimatedSection>

      <AnimatedSection className="bg-luxury-black text-luxury-ivory">
        <Container size="full" className="max-w-[1500px]">
          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="premium-eyebrow">Produits populaires</p>
              <h2 className="mt-2 font-heading text-3xl font-semibold leading-tight text-luxury-ivory sm:text-4xl">
                Selection signature
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-luxury-beige">
                Les produits mis en avant par Yakout Luxury.
              </p>
            </div>
            <Link className="text-sm font-semibold uppercase text-luxury-gold underline underline-offset-8" href="/shop">
              Explorer
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-3 min-[380px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </Container>
      </AnimatedSection>

      <AnimatedSection className="bg-luxury-ivory">
        <Container>
          <SectionTitle
            align="center"
            eyebrow="Pourquoi Yakout Luxury"
            title="Une experience premium, simple et rapide"
            description="Le site reste clair, les produits sont faciles a comparer et le paiement a la livraison simplifie l'achat."
          />
          <motion.div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4" variants={staggerContainer}>
            {reasons.map((reason, index) => {
              const Icon = reason.icon;

              return (
                <motion.div
                  className="rounded-md border border-luxury-beige bg-white p-4 shadow-luxury-soft"
                  key={reason.title}
                  transition={{ ...smoothTransition, delay: index * 0.03 }}
                  variants={fadeUp}
                  whileHover={{ y: -3 }}
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-md border border-luxury-gold/35 bg-luxury-gold/10 text-luxury-gold">
                    <Icon size={19} />
                  </span>
                  <h3 className="mt-4 font-heading text-xl font-semibold">{reason.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-luxury-text">{reason.description}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </Container>
      </AnimatedSection>

      <AnimatedSection className="bg-white">
        <Container>
          <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <p className="premium-eyebrow">Avis clients</p>
              <h2 className="mt-2 font-heading text-3xl font-semibold sm:text-4xl">
                Une boutique pensee pour acheter vite, mais bien.
              </h2>
              <p className="mt-3 text-sm leading-7 text-luxury-text">
                Des fiches produit compactes, des filtres rapides et une navigation
                claire pour rendre l'experience plus fluide.
              </p>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              {testimonials.map((item) => (
                <div className="rounded-md border border-luxury-beige bg-luxury-ivory/70 p-4" key={item.name}>
                  <div className="flex gap-0.5 text-luxury-gold">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star className="h-3.5 w-3.5 fill-current" key={star} />
                    ))}
                  </div>
                  <p className="mt-3 text-sm leading-6 text-luxury-text">{item.text}</p>
                  <p className="mt-3 text-sm font-semibold text-luxury-black">{item.name}</p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </AnimatedSection>

      <AnimatedSection className="bg-luxury-black text-luxury-ivory">
        <Container>
          <div className="rounded-md border border-luxury-gold/30 bg-white/[0.04] p-5 sm:p-7 lg:flex lg:items-center lg:justify-between">
            <div>
              <p className="premium-eyebrow">Pret a explorer ?</p>
              <h2 className="mt-2 font-heading text-3xl font-semibold text-luxury-ivory">
                Decouvrez la collection complete
              </h2>
              <p className="mt-2 text-sm leading-7 text-luxury-beige">
                Filtres compacts, cards denses et achat rapide.
              </p>
            </div>
            <Link className="mt-5 inline-block lg:mt-0" href="/shop">
              <Button size="lg" variant="gold">
                Aller a la boutique
                <MessageCircle className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </Container>
      </AnimatedSection>
    </main>
  );
}

function AnimatedSection({
  children,
  className,
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <motion.section
      className={`px-3 py-8 sm:px-6 sm:py-10 lg:px-8 ${className ?? ""}`}
      id={id}
      initial="hidden"
      transition={smoothTransition}
      variants={fadeUp}
      viewport={{ once: true, amount: 0.14 }}
      whileInView="visible"
    >
      {children}
    </motion.section>
  );
}

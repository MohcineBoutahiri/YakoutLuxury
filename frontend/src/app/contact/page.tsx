import Link from "next/link";
import { Camera, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function ContactPage() {
  return (
    <main className="section-surface px-4 py-8 sm:px-8 sm:py-12 lg:px-12">
      <div className="mx-auto max-w-5xl">
        <section className="rounded-md border border-luxury-beige bg-luxury-dark p-6 text-luxury-ivory shadow-luxury sm:p-10">
          <p className="premium-eyebrow">Contact</p>
          <h1 className="mt-4 font-heading text-4xl font-semibold leading-tight sm:text-6xl">
            Parler avec Yakout Luxury
          </h1>
          <p className="mt-5 max-w-2xl leading-8 text-luxury-beige">
            Une question sur une taille, une commande ou une piece de la
            collection ? Contactez-nous directement.
          </p>
        </section>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <Card>
            <CardContent className="p-6">
              <Camera className="text-luxury-gold" size={28} />
              <h2 className="mt-5 font-heading text-3xl font-semibold">
                Instagram
              </h2>
              <p className="mt-3 leading-7 text-luxury-text">
                Suivez les nouveautes, les looks et les annonces Yakout Luxury.
              </p>
              <a
                className="mt-6 inline-flex"
                href="https://www.instagram.com/"
                rel="noreferrer"
                target="_blank"
              >
                <Button>Ouvrir Instagram</Button>
              </a>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <MessageCircle className="text-luxury-gold" size={28} />
              <h2 className="mt-5 font-heading text-3xl font-semibold">
                WhatsApp
              </h2>
              <p className="mt-3 leading-7 text-luxury-text">
                Discutez rapidement avec l'equipe pour confirmer une commande.
              </p>
              <a
                className="mt-6 inline-flex"
                href="https://wa.me/"
                rel="noreferrer"
                target="_blank"
              >
                <Button variant="black">Ouvrir WhatsApp</Button>
              </a>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center">
          <Link href="/shop">
            <Button variant="soft">Retour boutique</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}

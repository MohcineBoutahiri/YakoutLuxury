import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export default function NotFoundPage() {
  return (
    <main className="px-5 py-16 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-3xl">
        <EmptyState
          action={
            <Link href="/shop">
              <Button>Retour boutique</Button>
            </Link>
          }
          description="La page demandee n'existe pas ou a ete deplacee."
          title="Page introuvable"
        />
      </div>
    </main>
  );
}

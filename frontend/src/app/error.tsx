"use client";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="px-5 py-16 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-3xl">
        <EmptyState
          action={<Button onClick={reset}>Reessayer</Button>}
          description="Une erreur inattendue a interrompu l'affichage. Vous pouvez recharger cette section."
          title="Un probleme est survenu"
        />
      </div>
    </main>
  );
}

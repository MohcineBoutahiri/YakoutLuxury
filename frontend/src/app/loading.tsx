import { Loader } from "@/components/ui/loader";

export default function LoadingPage() {
  return (
    <main className="flex min-h-[60vh] items-center justify-center px-5">
      <Loader label="Chargement de Yakout Luxury" />
    </main>
  );
}

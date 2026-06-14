import type { ReactNode } from "react";

type AuthShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
};

export function AuthShell({
  eyebrow,
  title,
  description,
  children,
}: AuthShellProps) {
  return (
    <main className="bg-luxury-ivory px-5 py-12 sm:px-8 lg:px-12">
      <div className="mx-auto grid min-h-[calc(100vh-15rem)] max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <section className="bg-luxury-black p-8 text-luxury-ivory sm:p-10">
          <p className="text-sm uppercase text-luxury-gold">{eyebrow}</p>
          <h1 className="mt-5 font-heading text-4xl font-semibold leading-tight sm:text-5xl">
            {title}
          </h1>
          <p className="mt-5 max-w-xl leading-8 text-luxury-beige">
            {description}
          </p>
        </section>
        <section>{children}</section>
      </div>
    </main>
  );
}


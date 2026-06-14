"use client";

export function Loader3D() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-luxury-black/40">
      <div className="h-10 w-10 animate-spin border border-luxury-gold/30 border-t-luxury-gold" />
      <span className="sr-only">Chargement de la scene 3D</span>
    </div>
  );
}

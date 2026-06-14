"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Float, PresentationControls, Sparkles } from "@react-three/drei";
import type { Group, Mesh } from "three";
import { cn } from "@/lib/cn";
import { Loader3D } from "./Loader3D";

function SignatureObject() {
  const groupRef = useRef<Group>(null);
  const gemRef = useRef<Mesh>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.22;
    }

    if (gemRef.current) {
      gemRef.current.rotation.x = state.clock.elapsedTime * 0.32;
      gemRef.current.rotation.z = state.clock.elapsedTime * 0.2;
    }
  });

  const smallPieces = useMemo(
    () => [
      [-1.45, 0.2, -0.35, 0.18],
      [1.2, -0.15, 0.25, 0.15],
      [0.72, 0.9, -0.18, 0.12],
      [-0.55, -0.95, 0.16, 0.1],
    ],
    [],
  );

  return (
    <group ref={groupRef}>
      <Float floatIntensity={0.8} rotationIntensity={0.35} speed={1.15}>
        <mesh ref={gemRef} position={[0, 0.08, 0]}>
          <icosahedronGeometry args={[0.95, 2]} />
          <meshStandardMaterial color="#F8F5EF" metalness={0.38} roughness={0.18} />
        </mesh>

        <mesh rotation={[Math.PI / 2.3, 0, Math.PI / 4]} scale={[1.1, 1.1, 0.2]}>
          <torusGeometry args={[1.35, 0.035, 16, 96]} />
          <meshStandardMaterial color="#C8A24A" metalness={0.9} roughness={0.2} />
        </mesh>

        <mesh rotation={[Math.PI / 2.05, Math.PI / 7, -Math.PI / 5]} scale={[0.9, 0.9, 0.2]}>
          <torusGeometry args={[1.58, 0.022, 16, 96]} />
          <meshStandardMaterial color="#E8DED0" metalness={0.68} roughness={0.24} />
        </mesh>

        {smallPieces.map(([x, y, z, size]) => (
          <mesh key={`${x}-${y}`} position={[x, y, z]} scale={size}>
            <octahedronGeometry args={[1, 0]} />
            <meshStandardMaterial color="#C8A24A" metalness={0.78} roughness={0.22} />
          </mesh>
        ))}
      </Float>
    </group>
  );
}

function HeroFallback() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="relative h-64 w-64 sm:h-80 sm:w-80">
        <div className="absolute inset-6 rotate-45 border border-luxury-gold/60" />
        <div className="absolute inset-14 border border-luxury-beige/50" />
        <div className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-luxury-ivory/90 shadow-luxury" />
      </div>
    </div>
  );
}

export function Hero3D({ className }: { className?: string }) {
  const [mounted, setMounted] = useState(false);
  const [useFallback, setUseFallback] = useState(false);

  useEffect(() => {
    const isMobile = window.matchMedia("(max-width: 767px)").matches;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    setUseFallback(isMobile || reduceMotion);
    setMounted(true);
  }, []);

  if (!mounted || useFallback) {
    return (
      <div className={cn("relative min-h-[420px] overflow-hidden bg-luxury-black", className)}>
        <HeroFallback />
      </div>
    );
  }

  return (
    <div className={cn("relative min-h-[460px] overflow-hidden bg-luxury-black", className)}>
      <Suspense fallback={<Loader3D />}>
        <Canvas
          camera={{ position: [0, 0.15, 5], fov: 42 }}
          dpr={[1, 1.5]}
          gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
          onError={() => setUseFallback(true)}
        >
          <color args={["#0B0B0B"]} attach="background" />
          <ambientLight intensity={0.85} />
          <directionalLight color="#F8F5EF" intensity={2.1} position={[3, 3, 4]} />
          <pointLight color="#C8A24A" intensity={8} position={[-3, 1.8, 2.5]} />

          <PresentationControls
            damping={0.12}
            global
            polar={[-0.18, 0.18]}
            rotation={[0.05, -0.25, 0]}
            snap
            speed={1.2}
          >
            <SignatureObject />
          </PresentationControls>

          <Sparkles color="#C8A24A" count={36} scale={[5, 3.2, 2]} size={1.8} speed={0.18} />
          <ContactShadows blur={2.8} far={4} opacity={0.25} position={[0, -1.45, 0]} scale={5} />
        </Canvas>
      </Suspense>
    </div>
  );
}

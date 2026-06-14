"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { fadeUp, smoothTransition } from "@/lib/motion";

type StatCardProps = {
  label: string;
  value: ReactNode;
  hint?: string;
  tone?: "light" | "dark";
  icon?: LucideIcon;
};

export function StatCard({
  hint,
  icon: Icon,
  label,
  tone = "light",
  value,
}: StatCardProps) {
  return (
    <motion.div
      initial="hidden"
      transition={smoothTransition}
      variants={fadeUp}
      viewport={{ once: true, amount: 0.35 }}
      whileHover={{ y: -2 }}
      whileInView="visible"
    >
      <Card
        className={
          tone === "dark"
            ? "border-luxury-black bg-luxury-black text-luxury-ivory"
            : undefined
        }
      >
        <CardContent className="min-h-[104px] p-4">
          <div className="flex items-start justify-between gap-3">
            <p
              className={
                tone === "dark"
                  ? "text-xs font-medium text-luxury-beige"
                  : "text-xs font-medium text-luxury-text"
              }
            >
              {label}
            </p>
            {Icon ? (
              <motion.span
                className={
                  tone === "dark"
                    ? "flex h-8 w-8 items-center justify-center rounded-md bg-luxury-gold text-luxury-black"
                    : "flex h-8 w-8 items-center justify-center rounded-md bg-luxury-ivory text-luxury-gold"
                }
                whileHover={{ rotate: -3, scale: 1.03 }}
              >
                <Icon size={16} />
              </motion.span>
            ) : null}
          </div>
          <div className="mt-2 truncate font-heading text-2xl font-semibold sm:text-3xl">
            {value}
          </div>
          {hint ? (
            <p
              className={
                tone === "dark"
                  ? "mt-1 truncate text-[11px] text-luxury-beige/80"
                  : "mt-1 truncate text-[11px] text-luxury-text"
              }
            >
              {hint}
            </p>
          ) : null}
        </CardContent>
      </Card>
    </motion.div>
  );
}

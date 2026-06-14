"use client";

import {
  useEffect,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";
import { cn } from "@/lib/cn";

type DropdownProps = {
  trigger: ReactNode;
  children: ReactNode;
  align?: "left" | "right";
  className?: string;
  panelClassName?: string;
};

type DropdownItemProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  inset?: boolean;
};

export function Dropdown({
  align = "right",
  children,
  className,
  panelClassName,
  trigger,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div className={cn("relative inline-block", className)} ref={rootRef}>
      <button
        aria-expanded={isOpen}
        className="contents"
        onClick={() => setIsOpen((current) => !current)}
        type="button"
      >
        {trigger}
      </button>
      {isOpen ? (
        <div
          className={cn(
            "absolute z-50 mt-3 w-64 rounded-md border border-luxury-beige bg-white p-2 text-luxury-black shadow-luxury",
            align === "right" ? "right-0" : "left-0",
            panelClassName,
          )}
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}

export function DropdownItem({
  className,
  inset,
  type = "button",
  ...props
}: DropdownItemProps) {
  return (
    <button
      className={cn(
        "w-full rounded-md px-3 py-3 text-left text-sm text-luxury-text transition hover:bg-luxury-ivory hover:text-luxury-black",
        inset && "pl-8",
        className,
      )}
      type={type}
      {...props}
    />
  );
}

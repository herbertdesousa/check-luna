"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { label: "Extrato", href: null },
  { label: "Feed", href: "/" },
  { label: "Prêmios", href: null },
] as const;

export function TabsNav() {
  const pathname = usePathname();

  return (
    <nav className="flex justify-between px-6 pt-8">
      {tabs.map(({ label, href }) =>
        href === null ? (
          <span key={label} aria-disabled="true" className="opacity-40">
            {label}
          </span>
        ) : (
          <Link
            key={label}
            href={href}
            aria-current={pathname === href ? "page" : undefined}
            className="aria-[current=page]:font-bold"
          >
            {label}
          </Link>
        ),
      )}
    </nav>
  );
}

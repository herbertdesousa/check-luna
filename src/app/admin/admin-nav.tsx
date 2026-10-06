"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { label: "Pendentes", href: "/admin" },
  { label: "Prêmios", href: "/admin/prizes" },
] as const;

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="mb-6 flex gap-4 text-sm">
      {TABS.map(({ label, href }) => (
        <Link
          key={href}
          href={href}
          aria-current={pathname === href ? "page" : undefined}
          className="opacity-60 aria-[current=page]:font-bold aria-[current=page]:opacity-100"
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}

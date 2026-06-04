"use client";

import { Menu, Trophy } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { MobileDrawer } from "@/components/layout/MobileDrawer";
import { NAV_LINKS } from "@/lib/constants";

export function Navbar() {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border-ui bg-page">
        <div className="mx-auto flex h-navbar max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <Trophy className="h-7 w-7 text-gold" strokeWidth={1.5} />
            <div className="flex flex-col leading-tight">
              <span className="font-display text-sm font-bold text-white">
                WORLD CUP
              </span>
              <span className="font-display text-[11px] font-normal text-gold">
                GROUP ANALYZER
              </span>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {NAV_LINKS.map((link) => {
              const active =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`font-display text-[13px] font-semibold uppercase tracking-[1.5px] transition-colors ${
                    active
                      ? "border-b-2 border-gold pb-[2px] text-white"
                      : "text-muted hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/about"
              className="hidden rounded-[6px] border border-gold bg-transparent px-4 py-2 font-display text-[13px] font-semibold uppercase tracking-wide text-gold transition-colors hover:bg-[#7A521033] sm:inline-flex"
            >
              {"</>"} API
            </Link>
            <button
              type="button"
              className="text-muted md:hidden"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </header>
      <MobileDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}

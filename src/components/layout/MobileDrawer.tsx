"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_LINKS } from "@/lib/constants";

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileDrawer({ isOpen, onClose }: MobileDrawerProps) {
  const pathname = usePathname();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-[#071020]/80"
            onClick={onClose}
            aria-hidden
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed right-0 top-0 z-50 flex h-full w-72 flex-col gap-4 bg-card p-6"
          >
            {NAV_LINKS.map((link) => {
              const active =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={onClose}
                  className={`font-display text-[13px] font-semibold uppercase tracking-[1.5px] ${
                    active
                      ? "border-b-2 border-gold pb-[2px] text-white"
                      : "text-muted hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <Link
              href="/about"
              onClick={onClose}
              className="mt-4 rounded-[6px] border border-gold px-4 py-2 text-center font-display text-[13px] font-semibold uppercase tracking-wide text-gold transition-colors hover:bg-[#7A521033]"
            >
              {"</>"} API
            </Link>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

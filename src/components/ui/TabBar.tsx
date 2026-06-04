"use client";

import { motion } from "framer-motion";

interface TabBarProps {
  tabs: string[];
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function TabBar({ tabs, activeTab, onTabChange }: TabBarProps) {
  return (
    <div className="flex gap-6 border-b border-border-ui">
      {tabs.map((tab) => {
        const isActive = tab === activeTab;
        return (
          <button
            key={tab}
            type="button"
            onClick={() => onTabChange(tab)}
            className={`relative cursor-pointer pb-3 font-display text-[13px] font-bold uppercase tracking-[1px] transition-colors ${
              isActive ? "text-white" : "text-muted hover:text-white"
            }`}
          >
            {tab}
            {isActive && (
              <motion.div
                layoutId="tab-underline"
                className="absolute bottom-0 left-0 right-0 h-[2px] bg-gold"
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

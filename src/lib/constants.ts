export const GROUP_LETTERS = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
] as const;

export type GroupLetter = (typeof GROUP_LETTERS)[number];

export const REVALIDATE_SECONDS = 3600;

export const NAV_LINKS = [
  { href: "/", label: "HOME" },
  { href: "/groups", label: "GROUPS" },
  { href: "/teams", label: "TEAMS" },
  { href: "/stats", label: "STATS" },
  { href: "/about", label: "ABOUT" },
] as const;

export const GROUP_DETAIL_TABS = [
  "OVERVIEW",
  "FIXTURES",
  "STANDINGS",
  "STATS",
] as const;

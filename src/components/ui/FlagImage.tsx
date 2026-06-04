"use client";

import Image from "next/image";
import { useState } from "react";
import { getSupabaseFlagUrl } from "@/lib/utils";

interface FlagImageProps {
  flag_url: string | null | undefined;
  fifa_code: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZE_MAP = {
  sm: { width: 24, height: 18 },
  md: { width: 32, height: 24 },
  lg: { width: 40, height: 30 },
} as const;

export function FlagImage({
  flag_url,
  fifa_code,
  size = "sm",
  className = "",
}: FlagImageProps) {
  const [failed, setFailed] = useState(false);
  const dims = SIZE_MAP[size];
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const src =
    flag_url ||
    (supabaseUrl ? getSupabaseFlagUrl(supabaseUrl, fifa_code) : "");

  if (failed || !src) {
    return (
      <div
        className={`rounded-[2px] bg-border-ui ${className}`}
        style={{ width: dims.width, height: dims.height }}
        aria-label={fifa_code}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={fifa_code}
      width={dims.width}
      height={dims.height}
      className={`rounded-[2px] object-cover ${className}`}
      onError={() => setFailed(true)}
      unoptimized
    />
  );
}

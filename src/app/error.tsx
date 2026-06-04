"use client";

import { ErrorState } from "@/components/ui/ErrorState";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="py-8">
      <ErrorState message="Failed to load page data. Check Supabase connection and try again." />
      <button
        type="button"
        onClick={reset}
        className="mt-4 rounded-[6px] border border-gold px-4 py-2 font-display text-sm font-semibold uppercase text-gold hover:bg-gold-dim"
      >
        Retry
      </button>
    </div>
  );
}

import { PageWrapper } from "@/components/layout/PageWrapper";
import { SectionBadge } from "@/components/ui/SectionBadge";

export default function AboutPage() {
  return (
    <PageWrapper>
      <div className="max-w-2xl rounded-[10px] border border-border-ui bg-card p-6">
        <SectionBadge text="ABOUT" />
        <h1 className="mt-4 font-display text-[clamp(28px,4vw,40px)] font-extrabold uppercase text-white">
          World Cup Group Analyzer
        </h1>
        <p className="mt-4 font-body text-sm leading-relaxed text-muted">
          A dark-themed sports analytics dashboard backed by Supabase Postgres.
          Standings and scores live on the teams table; historical trends come
          from ranking_history; daily movers from team_movements via the
          top_movers view.
        </p>
        <h2 className="mt-6 font-display text-sm font-bold uppercase text-white">
          Flags
        </h2>
        <p className="mt-2 font-body text-sm text-muted">
          Team flags are served from the Supabase Storage bucket{" "}
          <code className="text-gold">flags</code> as{" "}
          <code className="text-gold">{"{fifa_code}.png"}</code>, referenced by{" "}
          <code className="text-gold">teams.flag_url</code>.
        </p>
        <h2 className="mt-6 font-display text-sm font-bold uppercase text-white">
          API / ISR
        </h2>
        <p className="mt-2 font-body text-sm text-muted">
          POST <code className="text-gold">/api/revalidate</code> with header{" "}
          <code className="text-gold">x-revalidate-secret</code> after the Python
          pipeline runs.
        </p>
      </div>
    </PageWrapper>
  );
}

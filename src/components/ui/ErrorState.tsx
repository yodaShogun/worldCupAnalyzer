import { AlertCircle } from "lucide-react";

interface ErrorStateProps {
  message?: string;
}

export function ErrorState({
  message = "Something went wrong loading data.",
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-[10px] border border-border-ui bg-card p-8 text-center">
      <AlertCircle className="h-8 w-8 text-elim" />
      <p className="font-body text-sm text-muted">{message}</p>
    </div>
  );
}

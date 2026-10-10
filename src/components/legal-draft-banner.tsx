import { AlertTriangle } from "lucide-react";

export function LegalDraftBanner() {
  return (
    <div className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-900">
      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" aria-hidden="true" />
      <p>
        <strong>Draft — pending legal review.</strong> This page is a content placeholder drafted
        from the Pioneer Trio business plan. It must be reviewed and finalized by local
        counsel before the site goes live.
      </p>
    </div>
  );
}

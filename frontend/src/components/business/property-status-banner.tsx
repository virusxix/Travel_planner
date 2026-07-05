import { Badge } from "@/components/ui/badge";
import type { Property } from "@/types";

const STATUS_HELP: Record<string, { title: string; detail: string }> = {
  DRAFT: {
    title: "Draft — not visible to travelers",
    detail: "Add at least one room, then submit for admin review.",
  },
  PENDING_REVIEW: {
    title: "Submitted · typical review 1–3 days",
    detail: "An admin will approve or request changes. You cannot edit while pending.",
  },
  APPROVED: {
    title: "Live on HiddenStay",
    detail: "Travelers can find and book this listing.",
  },
  REJECTED: {
    title: "Not approved",
    detail: "Check admin notes, update the listing, and resubmit.",
  },
};

export function PropertyStatusBanner({ property }: { property: Property }) {
  const help = STATUS_HELP[property.status] ?? STATUS_HELP.DRAFT;
  const hasRooms = (property.rooms?.length ?? 0) > 0;

  return (
    <div className="mb-6 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={property.status === "APPROVED" ? "success" : "warning"}>{property.status}</Badge>
        <p className="text-sm font-medium text-stone-900">{help.title}</p>
      </div>
      <p className="mt-1 text-sm text-stone-500">{help.detail}</p>
      {property.status === "DRAFT" && !hasRooms && (
        <p className="mt-2 text-sm text-amber-700">Add a room below before you can submit.</p>
      )}
    </div>
  );
}

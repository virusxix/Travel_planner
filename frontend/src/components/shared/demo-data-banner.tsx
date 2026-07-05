import { cn } from "@/lib/utils";

export function DemoDataBanner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs text-amber-900",
        className
      )}
    >
      <span className="font-semibold">Sample data</span> — preview only. Use{" "}
      <strong className="font-semibold">Start a listing</strong> or{" "}
      <strong className="font-semibold">Add property</strong> to create a real draft you can submit.
    </div>
  );
}

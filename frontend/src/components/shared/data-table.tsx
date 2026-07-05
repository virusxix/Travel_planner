import { cn } from "@/lib/utils";

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  keyField,
  emptyMessage = "No data found",
  className,
}: {
  columns: { key: keyof T | string; header: string; render?: (row: T) => React.ReactNode }[];
  data: T[];
  keyField: keyof T;
  emptyMessage?: string;
  className?: string;
}) {
  if (data.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-border p-12 text-center text-muted">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={cn("overflow-hidden rounded-3xl border border-border bg-surface-elevated shadow-soft", className)}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted"
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.map((row) => (
              <tr
                key={String(row[keyField])}
                className="transition-colors hover:bg-blue-50/80"
              >
                {columns.map((col) => (
                  <td key={String(col.key)} className="px-6 py-4 text-foreground">
                    {col.render
                      ? col.render(row)
                      : String(row[col.key as keyof T] ?? "—")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

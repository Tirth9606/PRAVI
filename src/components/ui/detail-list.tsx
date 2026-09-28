export function DetailList({ items }: { items: { label: string; value: React.ReactNode }[] }) {
  return (
    <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
      {items.map((it, i) => (
        <div key={i} className="flex flex-col">
          <dt className="text-xs uppercase tracking-wide text-muted-foreground">{it.label}</dt>
          <dd className="text-sm font-medium text-foreground">{it.value}</dd>
        </div>
      ))}
    </dl>
  );
}

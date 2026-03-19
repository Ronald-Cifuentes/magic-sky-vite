export function AdminPlaceholder({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-gray-500">
      <h1 className="text-2xl font-bold text-secondary mb-2">{title}</h1>
      <p className="text-sm">Próximamente</p>
    </div>
  );
}

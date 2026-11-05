export default function PagePlaceholder({ title }: { title?: string }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <p className="font-serif text-xl text-muted-foreground">{title} — à venir</p>
    </div>
  );
}
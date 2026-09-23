export default function PolicyPage({ title, body }: { title: string; body: string }) {
  return (
    <section className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="font-heading text-4xl">{title}</h1>
      <p className="mt-4 whitespace-pre-line text-sm text-black/70">{body}</p>
    </section>
  );
}

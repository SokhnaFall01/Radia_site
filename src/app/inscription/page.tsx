import SignupForm from "./signup-form";

export const metadata = { title: "Creer un compte — Radia Glam" };

export default async function InscriptionPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const redirectTo = next && next.startsWith("/") && !next.startsWith("//") ? next : undefined;

  return (
    <section className="mx-auto max-w-sm px-6 py-20">
      <h1 className="font-display text-2xl uppercase tracking-[0.12em]">Creer un compte</h1>
      <SignupForm redirectTo={redirectTo} />
    </section>
  );
}

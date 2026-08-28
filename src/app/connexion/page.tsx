import LoginForm from "./login-form";

export const metadata = { title: "Connexion — Radia Glam" };

export default async function ConnexionPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const redirectTo = next && next.startsWith("/") && !next.startsWith("//") ? next : undefined;

  return (
    <section className="mx-auto max-w-sm px-6 py-20">
      <h1 className="font-display text-2xl uppercase tracking-[0.12em]">Connexion</h1>
      <LoginForm redirectTo={redirectTo} />
    </section>
  );
}

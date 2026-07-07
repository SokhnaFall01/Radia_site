import Link from "next/link";
import { getCartDetails } from "@/lib/cart";

export default async function BoutiqueLayout({ children }: { children: React.ReactNode }) {
  const { items } = await getCartDetails();
  const cartCount = items.reduce((sum, i) => sum + i.quantite, 0);

  return (
    <div className="relative">
      {children}
      {cartCount > 0 && (
        <Link
          href="/boutique/panier"
          className="fixed bottom-6 left-6 z-50 flex items-center gap-2 border border-[var(--noir)] bg-[var(--porcelaine)] px-5 py-3 text-xs uppercase tracking-[0.1em] shadow-lg"
        >
          🛒 Panier · {cartCount} article{cartCount > 1 ? "s" : ""}
        </Link>
      )}
    </div>
  );
}

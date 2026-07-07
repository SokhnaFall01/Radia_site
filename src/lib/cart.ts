import "server-only";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";

const CART_COOKIE = "radia_panier";
export const FRAIS_LIVRAISON_DAKAR_FCFA = 2000;

type CartEntry = { produitId: string; quantite: number };

async function readCartCookie(): Promise<CartEntry[]> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(CART_COOKIE)?.value;
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (e): e is CartEntry =>
        typeof e?.produitId === "string" && typeof e?.quantite === "number" && e.quantite > 0,
    );
  } catch {
    return [];
  }
}

async function writeCartCookie(entries: CartEntry[]) {
  const cookieStore = await cookies();
  if (entries.length === 0) {
    cookieStore.delete(CART_COOKIE);
    return;
  }
  cookieStore.set(CART_COOKIE, JSON.stringify(entries), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function addToCart(produitId: string, quantite: number) {
  const entries = await readCartCookie();
  const existing = entries.find((e) => e.produitId === produitId);
  if (existing) {
    existing.quantite += quantite;
  } else {
    entries.push({ produitId, quantite });
  }
  await writeCartCookie(entries);
}

export async function updateCartQuantity(produitId: string, quantite: number) {
  const entries = await readCartCookie();
  const filtered =
    quantite <= 0
      ? entries.filter((e) => e.produitId !== produitId)
      : entries.map((e) => (e.produitId === produitId ? { ...e, quantite } : e));
  await writeCartCookie(filtered);
}

export async function clearCart() {
  await writeCartCookie([]);
}

export async function getCartDetails() {
  const entries = await readCartCookie();
  if (entries.length === 0) return { items: [], totalFcfa: 0 };

  const produits = await prisma.produit.findMany({
    where: { id: { in: entries.map((e) => e.produitId) } },
  });
  const produitById = new Map(produits.map((p) => [p.id, p]));

  type CartItem = { produit: (typeof produits)[number]; quantite: number; sousTotal: number };

  const items: CartItem[] = [];
  for (const e of entries) {
    const produit = produitById.get(e.produitId);
    if (!produit) continue;
    const quantite = Math.min(e.quantite, produit.stock);
    if (quantite <= 0) continue;
    items.push({ produit, quantite, sousTotal: produit.prixFcfa * quantite });
  }

  const totalFcfa = items.reduce((sum, i) => sum + i.sousTotal, 0);
  return { items, totalFcfa };
}

export { CART_COOKIE };

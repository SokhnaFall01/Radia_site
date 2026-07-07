"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { createSession, deleteSession } from "@/lib/session";
import { SignupFormSchema, LoginFormSchema, type AuthFormState } from "@/lib/definitions";

export async function signup(_state: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const validated = SignupFormSchema.safeParse({
    nom: formData.get("nom"),
    email: formData.get("email"),
    telephone: formData.get("telephone"),
    password: formData.get("password"),
  });

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const { nom, email, telephone, password } = validated.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { message: "Un compte existe deja avec cet email." };
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: { nom, email, telephone, passwordHash, role: "CLIENTE" },
  });

  await createSession(user.id, user.role);
  redirect("/espace");
}

export async function login(_state: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const validated = LoginFormSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const { email, password } = validated.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return { message: "Email ou mot de passe incorrect." };
  }

  const passwordValid = await bcrypt.compare(password, user.passwordHash);
  if (!passwordValid) {
    return { message: "Email ou mot de passe incorrect." };
  }

  await createSession(user.id, user.role);
  redirect(user.role === "ADMIN" || user.role === "STAFF" ? "/admin" : "/espace");
}

export async function logout() {
  await deleteSession();
  redirect("/connexion");
}

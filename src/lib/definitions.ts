import * as z from "zod";

export const SignupFormSchema = z.object({
  nom: z.string().min(2, { error: "Le nom doit contenir au moins 2 caractères." }).trim(),
  email: z.email({ error: "Merci d'entrer un email valide." }).trim(),
  telephone: z.string().trim().optional(),
  password: z
    .string()
    .min(8, { error: "8 caracteres minimum." })
    .regex(/[a-zA-Z]/, { error: "Au moins une lettre." })
    .regex(/[0-9]/, { error: "Au moins un chiffre." }),
});

export const LoginFormSchema = z.object({
  email: z.email({ error: "Merci d'entrer un email valide." }).trim(),
  password: z.string().min(1, { error: "Mot de passe requis." }),
});

export type AuthFormState =
  | {
      errors?: {
        nom?: string[];
        email?: string[];
        telephone?: string[];
        password?: string[];
      };
      message?: string;
    }
  | undefined;

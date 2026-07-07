import * as z from "zod";

export const QuizQuestionSchema = z.object({
  question: z.string(),
  options: z.array(z.string()).min(2),
  correctIndex: z.number().int().min(0),
});

export const QuizQuestionsSchema = z.array(QuizQuestionSchema);

export type QuizQuestion = z.infer<typeof QuizQuestionSchema>;

export const PASSING_SCORE_PERCENT = 70;

export function parseQuizQuestions(raw: unknown): QuizQuestion[] {
  const parsed = QuizQuestionsSchema.safeParse(raw);
  return parsed.success ? parsed.data : [];
}

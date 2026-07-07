"use client";

import type { QuizQuestion } from "@/lib/quiz";

export default function QuizForm({
  questions,
  action,
}: {
  questions: QuizQuestion[];
  action: (formData: FormData) => void;
}) {
  return (
    <form action={action} className="mt-8 flex flex-col gap-6">
      {questions.map((q, i) => (
        <fieldset key={i} className="border border-[var(--ligne)] bg-white p-5">
          <legend className="px-1 text-sm font-medium">{q.question}</legend>
          <div className="mt-3 flex flex-col gap-2">
            {q.options.map((option, optIndex) => (
              <label key={optIndex} className="flex items-center gap-2 text-sm">
                <input type="radio" name={`question-${i}`} value={optIndex} required />
                {option}
              </label>
            ))}
          </div>
        </fieldset>
      ))}
      <button
        type="submit"
        className="border border-[var(--noir)] bg-[var(--noir)] px-6 py-3 text-xs uppercase tracking-[0.12em] text-[var(--porcelaine)]"
      >
        Valider le quiz
      </button>
    </form>
  );
}

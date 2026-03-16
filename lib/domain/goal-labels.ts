import type { Goal } from "@/lib/domain/types";

export function formatGoalLabel(goal: Goal) {
  switch (goal) {
    case "gain":
      return "💪 Ganar fuerza";
    case "lose":
      return "🔥 Perder peso";
    case "maintain":
      return "⚖️ Mantenerse";
    case "eat-better":
      return "🥗 Comer sano";
    default:
      return goal;
  }
}

export const goalOptions: Array<{ value: Goal; label: string }> = [
  { value: "gain", label: formatGoalLabel("gain") },
  { value: "lose", label: formatGoalLabel("lose") },
  { value: "maintain", label: formatGoalLabel("maintain") },
  { value: "eat-better", label: formatGoalLabel("eat-better") },
];

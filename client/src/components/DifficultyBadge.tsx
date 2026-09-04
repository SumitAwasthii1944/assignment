const COLORS: Record<string, string> = {
    Easy: "text-emerald-600",
    Medium: "text-amber-600",
    Hard: "text-red-600",
};

export function DifficultyBadge({ difficulty }: { difficulty: string }) {
    return <span className={`text-sm font-medium ${COLORS[difficulty] ?? "text-slate-500"}`}>{difficulty}</span>;
}
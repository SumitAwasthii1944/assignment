interface SheetHeaderProps {
    title: string;
    solvedCount: number;
    totalCount: number;
    onAddTopic: () => void;
}

export function SheetHeader({ title, solvedCount, totalCount, onAddTopic }: SheetHeaderProps) {
    const percent = totalCount === 0 ? 0 : Math.round((solvedCount / totalCount) * 100);

    return (
        <div className="mb-6 flex items-center justify-between rounded-lg border border-slate-200 bg-white p-5">
            <div>
                <h1 className="text-xl font-bold text-slate-900">{title}</h1>
                <p className="mt-1 text-sm text-slate-500">
                    {solvedCount} of {totalCount} questions solved
                </p>
            </div>
            <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-slate-100">
                    <span className="text-sm font-bold text-slate-800">{percent}%</span>
                </div>
                <button
                    onClick={onAddTopic}
                    className="rounded-md bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600"
                >
                    + Add topic
                </button>
            </div>
        </div>
    );
}
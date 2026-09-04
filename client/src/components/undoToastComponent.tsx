import { useEffect, useState } from "react";

interface UndoToastProps {
    message: string;
    onUndo: () => void;
    onExpire: () => void;
    durationMs?: number;
}

export function UndoToast({ message, onUndo, onExpire, durationMs = 10000 }: UndoToastProps) {
    const [secondsLeft, setSecondsLeft] = useState(Math.ceil(durationMs / 1000));

    useEffect(() => {
        const interval = setInterval(() => {
            setSecondsLeft((s) => Math.max(0, s - 1));
        }, 1000);

        const timeout = setTimeout(() => {
            onExpire();
        }, durationMs);

        return () => {
            clearInterval(interval);
            clearTimeout(timeout);
        };
    }, [durationMs, onExpire]);

    return (
        <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-4 rounded-lg bg-slate-900 px-4 py-3 text-sm text-white shadow-lg">
            <span>{message}</span>
            <button
                onClick={onUndo}
                className="font-semibold text-orange-400 hover:text-orange-300"
            >
                Undo ({secondsLeft}s)
            </button>
        </div>
    );
}
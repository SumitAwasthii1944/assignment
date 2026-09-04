import { arrayMove } from "@dnd-kit/sortable";
import type { DragEndEvent } from "@dnd-kit/core";

interface Reorderable {
    _id: string;
}

export function useDragReorder<T extends Reorderable>(
    items: T[],
    onReorder: (payload: { id: string; prevId?: string | null; nextId?: string | null }) => Promise<boolean>,
) {
    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = items.findIndex((i) => i._id === active.id);
        const newIndex = items.findIndex((i) => i._id === over.id);
        if (oldIndex === -1 || newIndex === -1) return;

        const reordered = arrayMove(items, oldIndex, newIndex);
        const movedId = active.id as string;
        const finalIndex = reordered.findIndex((i) => i._id === movedId);
        const prevItem = reordered[finalIndex - 1];
        const nextItem = reordered[finalIndex + 1];

        onReorder({
            id: movedId,
            prevId: prevItem?._id ?? null,
            nextId: nextItem?._id ?? null,
        });
    };

    return { handleDragEnd };
}
import { useDraggable } from '@dnd-kit/core';
import { ITEMS } from '../types/game';

import { cn } from '../lib/utils';
import { GripVertical } from 'lucide-react';

interface DraggableItemProps {
    id: string;
    isOverlay?: boolean;
}

export function DraggableItem({ id, isOverlay }: DraggableItemProps) {
    const item = ITEMS.find((i) => i.id === id);
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: id,
        data: { id },
    });

    if (!item) return null;

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    } : undefined;

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className={cn(
                "flex items-center gap-3 p-3 rounded-lg shadow-md border cursor-grab active:cursor-grabbing touch-none select-none transition-colors",
                "bg-gray-800 border-gray-700 text-gray-100 hover:border-gray-500",
                isDragging && "opacity-50",
                isOverlay && "shadow-xl border-blue-500 bg-gray-700 scale-105 z-50",
            )}
        >
            <GripVertical className="w-5 h-5 text-gray-500" />
            <item.icon className="w-6 h-6 text-blue-400" />
            <span className="font-medium text-sm sm:text-base">{item.name}</span>
        </div>
    );
}

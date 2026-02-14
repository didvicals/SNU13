import { useDroppable } from '@dnd-kit/core';
import type { Tier } from '../types/game';
import { cn } from '../lib/utils';
import { DraggableItem } from './DraggableItem';

interface TierRowProps {
    tier: Tier;
    items: string[];
}

const TIER_COLORS: Record<Tier, string> = {
    GOAT: 'bg-purple-900/30 border-purple-500/50',
    S: 'bg-red-900/30 border-red-500/50',
    A: 'bg-orange-900/30 border-orange-500/50',
    B: 'bg-yellow-900/30 border-yellow-500/50',
    C: 'bg-green-900/30 border-green-500/50',
    XOAT: 'bg-gray-800/50 border-gray-600/50',
};

const TIER_LABELS: Record<Tier, string> = {
    GOAT: 'GOAT',
    S: 'S',
    A: 'A',
    B: 'B',
    C: 'C',
    XOAT: 'XOAT',
};

export function TierRow({ tier, items }: TierRowProps) {
    const { setNodeRef, isOver } = useDroppable({
        id: tier,
    });

    return (
        <div className="flex w-full min-h-[90px] mb-3 group/row">
            {/* Label */}
            <div className={cn(
                "w-20 md:w-32 flex flex-col items-center justify-center font-black text-lg md:text-2xl rounded-l-3xl border-y border-l transition-all group-hover/row:scale-[1.02] origin-right",
                TIER_COLORS[tier],
                tier === 'GOAT' && "text-purple-400 animate-pulse",
                tier === 'XOAT' && "text-gray-500",
                tier === 'S' && "text-red-400",
                tier === 'A' && "text-orange-400",
                tier === 'B' && "text-yellow-400",
                tier === 'C' && "text-green-400",
            )}>
                <span className="leading-none">{TIER_LABELS[tier]}</span>
                {tier === 'GOAT' && <div className="text-[10px] mt-1 opacity-50 hidden md:block uppercase tracking-tighter">Ultimate</div>}
            </div>

            {/* Drop Zone */}
            <div
                ref={setNodeRef}
                className={cn(
                    "flex-1 flex flex-wrap gap-2 md:gap-3 p-3 md:p-4 border-y border-r rounded-r-3xl bg-gray-900/30 min-h-[90px] transition-all",
                    "border-gray-800/80 shadow-inner",
                    isOver && "bg-gray-800/80 border-blue-500/40 ring-4 ring-blue-500/5"
                )}
            >
                {items.map((itemId) => (
                    <DraggableItem key={itemId} id={itemId} />
                ))}
                {items.length === 0 && !isOver && (
                    <div className="flex-1 flex items-center justify-center text-[10px] md:text-xs text-gray-700 font-black uppercase tracking-widest opacity-30 select-none">
                        Drop Here
                    </div>
                )}
            </div>
        </div>
    );
}

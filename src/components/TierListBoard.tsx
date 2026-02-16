import React, { useState, useEffect, useCallback } from 'react';
import {
    DndContext,
    DragOverlay,
    closestCenter,
    KeyboardSensor,
    MouseSensor,
    TouchSensor,
    useSensor,
    useSensors,
    useDroppable,
    pointerWithin,
    rectIntersection,
    getFirstCollision,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useGame } from '../context/GameContext';
import { TIERS } from '../types/game';
import type { Tier, Item, Ranking } from '../types/game';

// Simple SortableItem - no handle, just direct drag
const SortableItem = ({ item }: { item: Item }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: item.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="relative group rounded-md cursor-grab active:cursor-grabbing text-[10px] md:text-xs font-semibold flex flex-col items-center justify-center text-center h-20 w-20 md:h-24 md:w-24 m-1 select-none border bg-white overflow-hidden border-paper-200 text-paper-700 hover:border-paper-400 hover:shadow-md touch-none"
        >
            {item.image && (
                <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-14 md:h-16 object-cover pointer-events-none mb-1 opacity-90 group-hover:opacity-100"
                />
            )}
            <span className="px-1 truncate w-full">{item.name}</span>
        </div>
    );
};

// Plain Item for DragOverlay
const Item = ({ item }: { item: Item }) => {
    return (
        <div className="relative group rounded-md text-[10px] md:text-xs font-semibold flex flex-col items-center justify-center text-center h-20 w-20 md:h-24 md:w-24 m-1 select-none border bg-white overflow-hidden border-paper-200 text-paper-700 shadow-lg">
            {item.image && (
                <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-14 md:h-16 object-cover pointer-events-none mb-1"
                />
            )}
            <span className="px-1 truncate w-full">{item.name}</span>
        </div>
    );
};

// Droppable Tier Row
const TierRow = ({ tier, items, colorClass }: { tier: Tier; items: Item[]; colorClass: string }) => {
    const { setNodeRef, isOver } = useDroppable({
        id: tier,
    });

    return (
        <div className="flex mb-2 md:mb-3 shadow-sm rounded-lg overflow-hidden border border-paper-200">
            <div className={`w-16 md:w-24 flex-shrink-0 flex items-center justify-center font-bold text-lg md:text-xl text-paper-900 ${colorClass} bg-opacity-20 border-r border-paper-200/50`}>
                {tier}
            </div>
            <div
                ref={setNodeRef}
                className={`flex-grow bg-paper-50 min-h-[6rem] md:min-h-[8rem] p-1 md:p-2 flex flex-wrap items-center content-center transition-colors ${isOver ? 'bg-paper-200' : 'hover:bg-paper-100/50'
                    }`}
            >
                <SortableContext items={items.map(i => i.id)} strategy={rectSortingStrategy}>
                    {items.length === 0 && <span className="text-paper-300 text-xs w-full text-center select-none italic">Empty</span>}
                    {items.map((item) => (
                        <SortableItem key={item.id} item={item} />
                    ))}
                </SortableContext>
            </div>
        </div>
    );
};

// Droppable Item Pool
const ItemPool = ({ items }: { items: Item[] }) => {
    const { setNodeRef, isOver } = useDroppable({
        id: 'pool',
    });

    return (
        <div className="mt-8">
            <h3 className="text-xs font-bold text-paper-400 uppercase tracking-wider mb-3 ml-1">Unranked Items</h3>
            <div
                ref={setNodeRef}
                className={`bg-paper-100 p-4 rounded-xl border-2 border-dashed border-paper-300 min-h-[140px] flex flex-wrap gap-2 transition-colors ${isOver ? 'bg-paper-200' : 'hover:bg-paper-50'
                    }`}
            >
                <SortableContext items={items.map(i => i.id)} strategy={rectSortingStrategy}>
                    {items.length === 0 && <span className="text-paper-400 text-sm w-full text-center italic py-8">All items ranked!</span>}
                    {items.map(item => (
                        <SortableItem key={item.id} item={item} />
                    ))}
                </SortableContext>
            </div>
        </div>
    );
};

export const TierListBoard = () => {
    const { gameState, submitRanking, myTeamName } = useGame();

    const [itemsMap, setItemsMap] = useState<Record<string, Item[]>>({
        pool: [],
        Goat: [],
        S: [],
        A: [],
        B: [],
        C: [],
    });

    const itemsMapRef = React.useRef(itemsMap);
    useEffect(() => {
        itemsMapRef.current = itemsMap;
    }, [itemsMap]);

    const [activeId, setActiveId] = useState<string | null>(null);

    // CRITICAL: Proper mobile sensor configuration
    const mouseSensor = useSensor(MouseSensor, {
        activationConstraint: {
            distance: 10,
        },
    });

    const touchSensor = useSensor(TouchSensor, {
        activationConstraint: {
            delay: 200,
            tolerance: 8,
        },
    });

    const keyboardSensor = useSensor(KeyboardSensor, {
        coordinateGetter: sortableKeyboardCoordinates,
    });

    const sensors = useSensors(mouseSensor, touchSensor, keyboardSensor);

    const collisionDetectionStrategy = useCallback((args: any) => {
        const currentItemsMap = itemsMapRef.current;
        const pointerIntersections = pointerWithin(args);
        const intersections = pointerIntersections.length > 0 ? pointerIntersections : rectIntersection(args);
        const overId = getFirstCollision(intersections, 'id');

        if (overId != null) {
            if (['pool', ...TIERS].includes(overId as string)) {
                return [{ id: overId }];
            }

            const container = Object.keys(currentItemsMap).find(key =>
                currentItemsMap[key].find(item => item.id === overId)
            );

            if (container && container !== overId) {
                return closestCenter(args);
            }
        }

        return closestCenter(args);
    }, []);

    useEffect(() => {
        if (gameState.round) {
            setItemsMap({
                pool: [...gameState.round.items],
                Goat: [], S: [], A: [], B: [], C: [],
            });
        }
    }, [gameState.round?.id]);

    const allItems = [...itemsMap.pool, ...itemsMap.Goat, ...itemsMap.S, ...itemsMap.A, ...itemsMap.B, ...itemsMap.C];

    const handleDragStart = useCallback((event: any) => {
        setActiveId(event.active.id);
    }, []);

    const lastAppendedRef = React.useRef<number>(0);

    const handleDragOver = useCallback((event: any) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        if (activeId === overId) return;

        const currentItemsMap = itemsMapRef.current;

        let activeContainer: string | null = null;
        let overContainer: string | null = null;

        for (const [container, items] of Object.entries(currentItemsMap)) {
            if (items.some(item => item.id === activeId)) {
                activeContainer = container;
            }
            if (items.some(item => item.id === overId)) {
                overContainer = container;
            }
        }

        if (!overContainer) {
            if (['pool', ...TIERS].includes(overId as string)) {
                overContainer = overId;
            }
        }

        if (!activeContainer || !overContainer) {
            return;
        }

        if (activeContainer !== overContainer) {
            const now = Date.now();
            if (now - lastAppendedRef.current < 50) {
                return;
            }
            lastAppendedRef.current = now;

            setItemsMap(prev => {
                const activeItems = prev[activeContainer!];
                const overItems = prev[overContainer!];
                const activeItem = activeItems.find(item => item.id === activeId);
                const overIndex = overItems.findIndex(item => item.id === overId);

                if (!activeItem) return prev;

                let newIndex;
                if (['pool', ...TIERS].includes(overId as string)) {
                    newIndex = overItems.length + 1;
                } else {
                    const isBelowOverItem =
                        over &&
                        active.rect.current.translated &&
                        active.rect.current.translated.top > over.rect.top + over.rect.height;

                    const modifier = isBelowOverItem ? 1 : 0;
                    newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
                }

                return {
                    ...prev,
                    [activeContainer!]: prev[activeContainer!].filter(item => item.id !== activeId),
                    [overContainer!]: [
                        ...prev[overContainer!].slice(0, newIndex),
                        activeItem,
                        ...prev[overContainer!].slice(newIndex, prev[overContainer!].length)
                    ]
                };
            });
        }
    }, []);

    const handleDragEnd = useCallback((event: any) => {
        const { active, over } = event;

        if (!over) {
            setActiveId(null);
            return;
        }

        const activeId = active.id;
        const overId = over.id;
        const currentItemsMap = itemsMapRef.current;

        let activeContainer: string | null = null;
        for (const [container, items] of Object.entries(currentItemsMap)) {
            if (items.some(item => item.id === activeId)) {
                activeContainer = container;
                break;
            }
        }

        if (!activeContainer) {
            setActiveId(null);
            return;
        }

        let overContainer: string | null = null;
        const containers = ['pool', ...TIERS];

        if (containers.includes(overId as string)) {
            overContainer = overId;
        } else {
            for (const [container, items] of Object.entries(currentItemsMap)) {
                if (items.some(item => item.id === overId)) {
                    overContainer = container;
                    break;
                }
            }
        }

        if (!overContainer) {
            setActiveId(null);
            return;
        }

        if (overContainer === activeContainer && activeId !== overId) {
            setItemsMap(prev => {
                const items = prev[activeContainer!];
                const oldIndex = items.findIndex(item => item.id === activeId);
                const newIndex = items.findIndex(item => item.id === overId);
                return {
                    ...prev,
                    [activeContainer!]: arrayMove(items, oldIndex, newIndex)
                };
            });
        } else if (overContainer !== activeContainer) {
            setItemsMap(prev => {
                const activeItems = prev[activeContainer!];
                const overItems = prev[overContainer!];
                const activeItem = activeItems.find(item => item.id === activeId);

                if (!activeItem) return prev;

                let insertIndex = overItems.length;
                if (overId !== overContainer) {
                    insertIndex = overItems.findIndex(item => item.id === overId);
                }

                const newOverItems = [...overItems];
                newOverItems.splice(insertIndex, 0, activeItem);

                return {
                    ...prev,
                    [activeContainer!]: activeItems.filter(item => item.id !== activeId),
                    [overContainer!]: newOverItems
                };
            });
        }

        setActiveId(null);
    }, []);

    const handleSubmit = () => {
        const ranking: Ranking = {};

        if (itemsMap.pool.length > 0) {
            alert('모든 아이템을 티어에 배치해주세요!');
            return;
        }

        TIERS.forEach(tier => {
            itemsMap[tier].forEach((item, index) => {
                ranking[item.id] = { tier, index };
            });
        });
        submitRanking(ranking);
    };

    const tierColors: Record<Tier, string> = {
        'Goat': 'bg-red-100 text-red-800',
        'S': 'bg-orange-100 text-orange-800',
        'A': 'bg-yellow-100 text-yellow-800',
        'B': 'bg-green-100 text-green-800',
        'C': 'bg-cyan-100 text-cyan-800',
    };

    if (!gameState.round) return <div className="min-h-screen flex items-center justify-center text-paper-500">Loading round...</div>;

    const activeItem = activeId ? allItems.find(item => item.id === activeId) : null;

    return (
        <div className="max-w-3xl mx-auto pb-24">
            <header className="mb-4 text-center pt-4">
                {myTeamName && (
                    <div className="mb-2">
                        <span className="inline-block px-3 py-1 bg-accent-secondary text-white rounded-full text-xs font-bold shadow-sm">
                            팀: {myTeamName}
                        </span>
                    </div>
                )}
                <h1 className="text-xl font-serif font-bold text-paper-900">{gameState.round.title}</h1>
                <p className="text-paper-500 text-xs mt-1">
                    모바일: 아이템을 <span className="font-bold text-accent-primary">꾹 눌러서 (0.2초)</span> 드래그하세요!
                </p>
            </header>

            <DndContext
                sensors={sensors}
                collisionDetection={collisionDetectionStrategy}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
            >
                <div className="flex flex-col">
                    {/* Item Pool - Order First on Mobile */}
                    <div className="order-1 md:order-2 mb-6 sticky top-0 z-40 bg-paper-50/95 backdrop-blur-sm p-2 rounded-xl shadow-sm border border-paper-200">
                        <div className="flex justify-between items-center mb-2 px-1">
                            <h3 className="text-xs font-bold text-paper-400 uppercase tracking-wider">대기 중인 아이템</h3>
                            <span className="text-[10px] text-paper-400">남은 아이템: {itemsMap.pool.length}개</span>
                        </div>
                        <ItemPool items={itemsMap.pool} />
                    </div>

                    {/* Tiers - Order Second on Mobile */}
                    <div className="order-2 md:order-1 space-y-2">
                        {TIERS.map(tier => (
                            <TierRow
                                key={tier}
                                tier={tier}
                                items={itemsMap[tier]}
                                colorClass={tierColors[tier]}
                            />
                        ))}
                    </div>
                </div>

                <DragOverlay>
                    {activeItem ? <Item item={activeItem} /> : null}
                </DragOverlay>
            </DndContext>

            <div className="fixed bottom-0 left-0 w-full bg-white border-t border-paper-200 p-4 shadow-lg flex justify-center z-50 safe-area-bottom">
                <button
                    onClick={handleSubmit}
                    className="max-w-md w-full bg-paper-900 hover:bg-black text-white font-bold py-3 px-8 rounded-lg shadow-sm transition-transform active:scale-[0.98]"
                >
                    랭킹 제출하기
                </button>
            </div>
        </div>
    );
};

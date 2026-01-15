import { Reorder, useDragControls } from 'framer-motion';
import { clsx } from 'clsx';
import { type Habit } from '../types';
import { Trash2, GripVertical } from 'lucide-react';
import { RainbowCheckmark } from './RainbowCheckmark';

interface HabitItemProps {
    habit: Habit;
    progress: number; // Current count
    onIncrement: () => void;
    onRemove: () => void;
    onEdit: () => void;
    onReset?: () => void;
    isEditing?: boolean;
}

export function HabitItem({ habit, progress, onIncrement, onRemove, onEdit, onReset, isEditing = false }: HabitItemProps) {
    const isCompleted = progress >= (habit.target || 1);
    const target = habit.target || 1;
    const dragControls = useDragControls();

    return (
        <Reorder.Item
            value={habit}
            id={habit.id}
            dragListener={false}
            dragControls={dragControls}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            className={clsx(
                "group flex items-center gap-4 py-4 border-b border-gray-100 last:border-0 bg-white relative transition-all duration-300",
                habit.archived && !isCompleted && "opacity-60 grayscale",
                habit.archived && isCompleted && "border-amber-100 bg-amber-50/50"
            )}
        // Note: bg-white is important for drag opacity/feel
        >
            <div className="relative flex-shrink-0 cursor-pointer" onClick={onIncrement}>
                {/* Visual Progress: Overlapping Boxes */}
                <div className="h-8 relative flex items-center justify-center min-w-[32px]">
                    {isCompleted ? (
                        <RainbowCheckmark count={progress} target={target} />
                    ) : (
                        <div className="relative flex items-center">
                            {/* Only show numeric if target is huge */}
                            {target > 10 ? (
                                <div className={clsx(
                                    "w-8 h-8 border-2 rounded-lg flex items-center justify-center transition-all",
                                    progress > 0 ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-gray-300"
                                )}>
                                    <span className={clsx("text-xs font-bold", progress > 0 ? "text-green-600" : "text-gray-300")}>
                                        {progress}/{target}
                                    </span>
                                </div>
                            ) : (
                                Array.from({ length: target }).map((_, i) => {
                                    const isFilled = progress > i;

                                    return (
                                        <div
                                            key={i}
                                            className={clsx(
                                                "w-6 h-6 rounded border-2 transition-all duration-300 flex-shrink-0",
                                                isFilled
                                                    ? "bg-green-300 border-green-400"
                                                    : "bg-white border-gray-200"
                                            )}
                                            style={{
                                                marginLeft: i === 0 ? 0 : '-18px', // Overlap 75% of 24px (18px)
                                                zIndex: i // Ensure Left-to-Right stacking order (Right covers Left)
                                            }}
                                        />
                                    )
                                })
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div
                className="flex-1 cursor-pointer"
                onClick={onIncrement}
            >
                <div className="flex items-center gap-2">
                    <span
                        className={clsx(
                            "text-base font-medium transition-all duration-300 select-none",
                            isCompleted && !habit.archived ? "text-gray-400 line-through decoration-gray-300 decoration-2" : "text-gray-800",
                            isCompleted && habit.archived && "text-amber-900/70 italic"
                        )}
                    >
                        {habit.title}
                    </span>
                    {habit.archived && isCompleted && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500 bg-amber-100 px-2 py-0.5 rounded-full ml-2 self-center">
                            History
                        </span>
                    )}
                    {progress > target && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                if (onReset) onReset();
                            }}
                            className="text-xs font-bold text-green-500 bg-green-50 px-2 py-0.5 rounded-full hover:bg-green-100 transition-colors z-10 relative"
                            title="Reset count"
                        >
                            +{progress - target}
                        </button>
                    )}
                </div>
            </div>

            {/* Controls - Visible when Editing or Hovering (Desktop) */}
            <div className={clsx(
                "flex items-center gap-1 transition-opacity",
                isEditing ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            )}>
                {/* Drag Handle */}
                <div
                    className="p-2 text-gray-300 hover:text-gray-600 cursor-grab active:cursor-grabbing touch-none"
                    onPointerDown={(e) => dragControls.start(e)}
                >
                    <GripVertical size={16} />
                </div>

                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onEdit();
                    }}
                    className="p-2 text-gray-300 hover:text-gray-900 transition-colors"
                >
                    {/* Pencil Icon */}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                        <path d="m15 5 4 4" />
                    </svg>
                </button>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onRemove();
                    }}
                    className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                >
                    <Trash2 size={16} />
                </button>
            </div>
        </Reorder.Item>
    );
}

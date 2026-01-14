import { motion, Reorder } from 'framer-motion';
import { useHabits } from '../context/HabitContext';
import { Plus, X } from 'lucide-react';
import { useState } from 'react';

interface ScoreRingProps {
    date: string;
}

export function ScoreRing({ date }: ScoreRingProps) {
    const { habits, entries, getCreateDayEntry, weeklyTasks, addNote, removeNote, reorderNotes } = useHabits();
    const [isAddingNote, setIsAddingNote] = useState(false);
    const [newNoteText, setNewNoteText] = useState('');

    const entry = entries[date] || getCreateDayEntry(date);

    // Calculate total target count (exclude archived habits unless they have progress this day)
    const totalTarget = habits.reduce((acc, h) => {
        const hasProgress = (entry.progress?.[h.id] || 0) > 0;
        if (h.archived && !hasProgress) return acc;
        return acc + (h.target || 1);
    }, 0);

    // Calculate current progress (capped at target for the ring)
    const currentProgress = habits.reduce((acc, h) => {
        const prog = entry.progress?.[h.id] || 0;
        // If archived and no progress, it shouldn't count (consistent with totalTarget)
        if (h.archived && prog === 0) return acc;

        return acc + Math.min(prog, h.target || 1);
    }, 0);

    // Calculate percentage, max at 1.0
    const percentage = totalTarget > 0 ? currentProgress / totalTarget : 0;

    // SVG parameters
    const radius = 40;

    // Dynamic Color Calculation
    // Red (0) -> All Colors -> Red (360)
    // Lightness: Starts at 50%, goes up to 75% "lighter for each task"
    const hue = Math.min(percentage * 360, 360);
    const lightness = 50 + (percentage * 25); // 50% -> 75%
    const strokeColor = `hsl(${hue}, 100%, ${lightness}%)`;

    // Filter important weekly tasks
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const weekStart = new Date(d.setDate(diff)).toISOString().split('T')[0];

    const importantTasks = weeklyTasks.filter(t =>
        t.weekStart === weekStart &&
        t.isImportant &&
        !t.isCompleted
    );

    const handleAddNote = () => {
        if (newNoteText.trim()) {
            addNote(date, newNoteText.trim());
            setNewNoteText('');
            setIsAddingNote(false);
        }
    };

    const notes = entry.notes || [];

    return (
        <div className="flex flex-col items-center justify-center py-6">
            <div className="relative w-32 h-32 flex items-center justify-center">
                {/* Background Circle (faint) */}
                <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                    <defs>
                        <filter id="pencil-texture">
                            <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" result="noise" />
                            <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" xChannelSelector="R" yChannelSelector="G" />
                        </filter>
                    </defs>
                    <circle
                        cx="64"
                        cy="64"
                        r={radius}
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                        className="text-gray-100"
                    />
                </svg>

                {/* Animated Hand-Drawn Ring */}
                <svg className="absolute inset-0 w-full h-full transform -rotate-90 overflow-visible">
                    {/* We use a slightly messy path that approximates a circle */}
                    <motion.path
                        d="M 64 24 A 40 40 0 1 1 63.9 24" // Almost full circle arc
                        fill="none"
                        stroke={strokeColor}
                        strokeWidth="5"
                        strokeLinecap="round"
                        initial={{ pathLength: 0 }}
                        animate={{
                            pathLength: percentage,
                            stroke: strokeColor
                        }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        style={{
                            filter: 'url(#pencil-texture)',
                        }}
                    />
                </svg>

                {/* Score Text */}
                <div className="relative z-10 text-center">
                    <span className="block text-3xl font-bold text-gray-900 font-hand">{currentProgress}</span>
                    <span className="block text-xs font-medium text-gray-400 uppercase tracking-wider">of {totalTarget}</span>
                </div>

                {/* Important Tasks Floater */}
                {importantTasks.length > 0 && (
                    <div className="absolute left-[90px] top-2 flex flex-col gap-1 items-start">
                        {importantTasks.map(task => (
                            <motion.div
                                key={task.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="text-[10px] font-bold text-gray-700 font-hand leading-tight bg-white px-2 py-1 rounded-lg border border-gray-200 shadow-sm whitespace-nowrap"
                            >
                                {task.title}
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Left Side: Notes / "Kom ihåg" */}
                {/* Right-[120px] moves it well clear of the circle (which extends to roughly 20px from edge) */}
                <div className="absolute right-[120px] top-4 flex flex-col gap-1 items-end z-20">
                    <Reorder.Group axis="y" values={notes} onReorder={(newOrder) => reorderNotes(date, newOrder)} className="flex flex-col items-end gap-2">
                        {notes.map(note => (
                            <Reorder.Item
                                key={note.id}
                                value={note}
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="group relative"
                            >
                                <div className="text-[10px] font-bold text-gray-600 font-hand leading-tight bg-white px-3 py-1.5 rounded-br-none rounded-xl border border-gray-200 shadow-sm whitespace-nowrap cursor-grab active:cursor-grabbing flex items-center gap-2 transition-transform hover:scale-105">
                                    {note.text}
                                    <button
                                        onClick={() => removeNote(date, note.id)}
                                        className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X size={10} strokeWidth={3} />
                                    </button>
                                </div>
                            </Reorder.Item>
                        ))}
                    </Reorder.Group>

                    {/* Add Note Button/Input */}
                    {isAddingNote ? (
                        <div className="flex items-center gap-1 mt-1">
                            <input
                                autoFocus
                                type="text"
                                value={newNoteText}
                                onChange={(e) => setNewNoteText(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleAddNote();
                                    if (e.key === 'Escape') setIsAddingNote(false);
                                }}
                                onBlur={() => {
                                    if (!newNoteText.trim()) setIsAddingNote(false);
                                    else handleAddNote();
                                }}
                                className="w-24 text-[10px] px-3 py-1.5 rounded-xl rounded-br-none border border-gray-300 focus:outline-none focus:border-gray-900 font-hand bg-white shadow-lg transform scale-105"
                                placeholder="Kom ihåg..."
                            />
                        </div>
                    ) : (
                        <button
                            onClick={() => setIsAddingNote(true)}
                            className="mt-1 w-6 h-6 flex items-center justify-center rounded-full bg-white text-gray-400 hover:text-gray-900 border border-gray-200 shadow-sm hover:shadow-md transition-all hover:scale-110"
                            title="Add Note"
                        >
                            <Plus size={12} strokeWidth={3} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

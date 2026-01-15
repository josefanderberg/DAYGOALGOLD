import { motion } from 'framer-motion';
import { useHabits } from '../context/HabitContext';

interface ScoreRingProps {
    date: string;
}

export function ScoreRing({ date }: ScoreRingProps) {
    const { habits, entries, getCreateDayEntry, weeklyTasks } = useHabits();

    // Calculate total target count
    const entry = entries[date] || getCreateDayEntry(date);

    // Filter active habits exactly like HabitList does
    const activeHabits = habits.filter(h => {
        const isSkipped = entry.skippedHabits?.includes(h.id);
        if (isSkipped) return false;
        if (h.specificDate && h.specificDate !== entry.date) return false;
        return !h.archived || (entry.progress?.[h.id] || 0) > 0;
    });

    const totalTarget = activeHabits.reduce((acc, h) => acc + (h.target || 1), 0);

    const currentProgress = activeHabits.reduce((acc, h) => {
        const prog = entry.progress?.[h.id] || 0;
        return acc + Math.min(prog, h.target || 1);
    }, 0);

    const percentage = totalTarget > 0 ? currentProgress / totalTarget : 0;
    const radius = 40;
    const hue = Math.min(percentage * 360, 360);
    const lightness = 50 + (percentage * 25);
    const strokeColor = `hsl(${hue}, 100%, ${lightness}%)`;

    // Filter Weekly Tasks
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const weekStart = new Date(d.setDate(diff)).toISOString().split('T')[0];

    // Get all completed tasks for the current week
    const currentWeekTasks = weeklyTasks.filter(t =>
        t.weekStart === weekStart && t.isCompleted
    );

    const regularTasks = currentWeekTasks.filter(t => !t.isImportant);

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

                {/* Right Side: Messages Space (Start at left-[90px] which is to the right of the ring) */}
                <div className="absolute left-[90px] top-4 flex flex-col items-start gap-1 z-20">
                    {regularTasks.map(task => (
                        <motion.div
                            key={task.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center bg-white px-2 py-1 rounded-lg border border-gray-200 shadow-sm whitespace-nowrap"
                        >
                            {/* Invisible spacer to match the height if the heart impacts it, 
                                though text-10px and Heart-10px should be similar. 
                                ensuring flex items-center strictly centers the text vertically. */}
                            <span className="text-[10px] font-bold text-gray-700 font-hand leading-tight">
                                {task.title}
                            </span>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}

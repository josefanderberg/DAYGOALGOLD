import { motion } from 'framer-motion';
import { useHabits } from '../context/HabitContext';

interface ScoreRingProps {
    date: string;
}

export function ScoreRing({ date }: ScoreRingProps) {
    const { habits, entries, getCreateDayEntry, weeklyTasks } = useHabits();

    const entry = entries[date] || getCreateDayEntry(date);

    // Calculate total target count
    const totalTarget = habits.reduce((acc, h) => acc + (h.target || 1), 0);

    // Calculate current progress (capped at target for the ring)
    const currentProgress = habits.reduce((acc, h) => {
        const prog = entry.progress?.[h.id] || 0;
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

    return (
        <div className="flex flex-col items-center justify-center py-6">
            <div className="relative w-32 h-32 flex items-center justify-center">
                {/* Background Circle (faint) */}
                <svg className="absolute inset-0 w-full h-full transform -rotate-90">
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
            </div>
        </div>
    );
}

import { useState } from 'react';
import { useHabits } from '../context/HabitContext';
import { Plus, Trash2, Check, Heart, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { format } from 'date-fns';
import { useLanguage } from '../context/LanguageContext';

interface WeeklyTasksProps {
    date: string;
}

export function WeeklyTasks({ date }: WeeklyTasksProps) {
    const { weeklyTasks, addWeeklyTask, toggleWeeklyTask, removeWeeklyTask, toggleWeeklyTaskImportance, toggleWeeklyTaskStar, showTemporaryMessage } = useHabits();
    const { t, dateLocale } = useLanguage();
    const [newTaskTitle, setNewTaskTitle] = useState('');

    // Calculate current week's start (Monday) to filter tasks
    // Note: We use the same getWeekStart logic as in Context to act as a selector
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const weekStart = new Date(d.setDate(diff)).toISOString().split('T')[0];

    const currentWeekTasks = weeklyTasks.filter(t => {
        const isThisWeek = t.weekStart === weekStart;
        if (!isThisWeek) return false;

        // Visibility Logic:
        // 1. If not starred for any day -> visible all week
        // 2. If starred for specific days -> only visible on those days
        // 3. If Starred AND Completed -> Hide (It is shown in the bubble "navbar" area)
        if (t.starredDates && t.starredDates.length > 0) {
            return t.starredDates.includes(date);
        }
        return true;
    }).sort((a, b) => {
        // Sort: Regular (Top) -> Starred/Heart (Bottom)
        // Check "Special" status for today
        const aSpecial = a.isImportant || (a.starredDates && a.starredDates.includes(date));
        const bSpecial = b.isImportant || (b.starredDates && b.starredDates.includes(date));

        if (!aSpecial && bSpecial) return -1; // a is regular, b is special -> a first
        if (aSpecial && !bSpecial) return 1;  // a is special, b is regular -> b first
        return 0;
    });

    const handleAdd = () => {
        if (newTaskTitle.trim()) {
            addWeeklyTask(newTaskTitle.trim(), date);
            setNewTaskTitle('');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleAdd();
        }
    };

    // Format week range for display
    const start = new Date(weekStart);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    const weekRange = `${format(start, 'MMM d', { locale: dateLocale })} - ${format(end, 'MMM d', { locale: dateLocale })}`;

    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-lg font-bold font-hand text-gray-800">MEDDELANDE</h3>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">{weekRange}</p>
                </div>
                <span className="text-xs font-bold bg-gray-100 text-gray-500 px-2 py-1 rounded-full">
                    {currentWeekTasks.filter(t => t.isCompleted).length}/{currentWeekTasks.length}
                </span>
            </div>

            <div className="space-y-3 mb-4">
                <AnimatePresence initial={false}>
                    {currentWeekTasks.length === 0 && (
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-sm text-gray-400 italic text-center py-2"
                        >
                            Du är bäst! ⭐
                        </motion.p>
                    )}
                    {currentWeekTasks.map((task) => {
                        const isStarredForToday = task.starredDates?.includes(date);

                        return (
                            <motion.div
                                key={task.id}
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                                className="group flex items-center gap-3"
                            >
                                <button
                                    onClick={() => {
                                        if (!task.isCompleted && task.isImportant) {
                                            const messages = ["Bra jobbat! ❤️", "Du är grym! 🌟", "Hurra! 🎉"];
                                            showTemporaryMessage(messages[Math.floor(Math.random() * messages.length)]);
                                        }
                                        toggleWeeklyTask(task.id);
                                    }}
                                    className={clsx(
                                        "w-5 h-5 rounded border flex items-center justify-center transition-all duration-200",
                                        task.isCompleted
                                            ? (isStarredForToday
                                                ? "bg-yellow-400 border-yellow-400" // Starred for today: Gold
                                                : task.isImportant
                                                    ? "bg-red-400 border-red-400"
                                                    : "bg-green-500 border-green-500")
                                            : "border-gray-300 hover:border-gray-400 text-transparent",
                                        task.isCompleted ? "text-white" : ""
                                    )}
                                >
                                    {task.isCompleted ? (
                                        isStarredForToday ? (
                                            <Star size={12} className="text-white fill-white" />
                                        ) : task.isImportant ? (
                                            <Heart size={12} className="text-white fill-white" />
                                        ) : (
                                            <Check size={12} strokeWidth={3} className="text-white" />
                                        )
                                    ) : null}
                                </button>

                                <span
                                    onClick={() => {
                                        if (!task.isCompleted && task.isImportant) {
                                            showTemporaryMessage(task.title);
                                        }
                                        toggleWeeklyTask(task.id);
                                    }}
                                    className={clsx(
                                        "flex-1 text-sm font-medium transition-all cursor-pointer select-none",
                                        task.isCompleted ? "text-gray-800" : "text-gray-700"
                                    )}
                                >
                                    {task.title}
                                </span>

                                {/* Right Side Controls */}
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => toggleWeeklyTaskImportance(task.id)}
                                        className={clsx(
                                            "p-1.5 text-gray-300 hover:text-red-400 transition-colors",
                                            task.isImportant && "text-red-400 opacity-100" // Always show heart if selected
                                        )}
                                        title="Mark as Love To Do"
                                    >
                                        <Heart size={16} fill={task.isImportant ? "currentColor" : "none"} />
                                    </button>

                                    <button
                                        onClick={() => toggleWeeklyTaskStar(task.id, date)}
                                        className={clsx(
                                            "p-1.5 text-gray-300 hover:text-yellow-400 transition-colors",
                                            task.starredDates?.includes(date) && "text-yellow-400 opacity-100"
                                        )}
                                        title={`Star for today (${format(new Date(date), 'MMM d')})`}
                                    >
                                        <Star size={16} fill={task.starredDates?.includes(date) ? "currentColor" : "none"} />
                                    </button>

                                    <button
                                        onClick={() => removeWeeklyTask(task.id)}
                                        className="p-1.5 text-gray-300 hover:text-red-500 transition-all"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-50">
                <input
                    type="text"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={t('weeklyGoalsPlaceholder')}
                    className="flex-1 bg-transparent text-sm placeholder:text-gray-400 focus:outline-none text-gray-700"
                />
                <button
                    onClick={handleAdd}
                    disabled={!newTaskTitle.trim()}
                    className="p-1.5 bg-gray-900 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors"
                >
                    <Plus size={16} />
                </button>
            </div>
        </div>
    );
}

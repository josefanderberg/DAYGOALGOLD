import { useState } from 'react';
import { format, addDays, subDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, addWeeks, subWeeks, isToday } from 'date-fns';
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { useHabits } from '../context/HabitContext';

import { useLanguage } from '../context/LanguageContext';

interface HeaderProps {
    date: string;
    onDateChange: (date: string) => void;
}

export function Header({ date, onDateChange }: HeaderProps) {
    const { habits, entries } = useHabits();
    const { t, dateLocale } = useLanguage();
    const currentDate = new Date(date);
    const [isWeekView, setIsWeekView] = useState(false);

    // Context-sensitive Navigation
    const handlePrev = () => {
        if (isWeekView) {
            onDateChange(format(subWeeks(currentDate, 1), 'yyyy-MM-dd'));
        } else {
            onDateChange(format(subDays(currentDate, 1), 'yyyy-MM-dd'));
        }
    };

    const handleNext = () => {
        if (isWeekView) {
            onDateChange(format(addWeeks(currentDate, 1), 'yyyy-MM-dd'));
        } else {
            onDateChange(format(addDays(currentDate, 1), 'yyyy-MM-dd'));
        }
    };

    const toggleWeekView = () => {
        setIsWeekView(!isWeekView);
    };

    const jumpToToday = () => {
        onDateChange(format(new Date(), 'yyyy-MM-dd'));
    };

    // Calculate week days
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday start
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
    const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

    const getDayScore = (dayStr: string) => {
        const entry = entries[dayStr];
        if (!entry) return 0;
        return habits.reduce((acc, h) => {
            const prog = entry.progress?.[h.id] || 0;
            return acc + Math.min(prog, h.target || 1);
        }, 0);
    };

    return (
        <header className="px-4 py-4 flex flex-col gap-4 transition-all duration-300">
            {/* Top Row: Navigation & Title */}
            <div className="relative flex items-center justify-between">

                {/* Left Arrow */}
                <button
                    onClick={handlePrev}
                    className="p-2 text-gray-300 hover:text-gray-900 transition-colors"
                    aria-label={isWeekView ? "Previous week" : "Previous day"}
                >
                    <ChevronLeft size={24} />
                </button>

                {/* Center: Title & Toggle */}
                <button
                    onClick={toggleWeekView}
                    className="flex flex-col items-center group cursor-pointer"
                >
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={isWeekView ? 'week' + date : 'day' + date}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            transition={{ duration: 0.2 }}
                            className="flex items-center gap-2"
                        >
                            <h1 className="text-xl font-bold tracking-tight text-gray-900 capitalize">
                                {isWeekView
                                    ? `${t('week')} ${format(currentDate, 'w', { locale: dateLocale })}`
                                    : format(currentDate, 'EEEE, d MMMM', { locale: dateLocale })
                                }
                            </h1>
                        </motion.div>
                    </AnimatePresence>
                    <div className="flex items-center gap-1 text-gray-400 mt-1 group-hover:text-gray-600 transition-colors">
                        {isWeekView ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </div>
                </button>

                {/* Right Side: Today + Next Arrow */}
                <div className="flex items-center">
                    {!isToday(currentDate) && (
                        <button
                            onClick={jumpToToday}
                            className="mr-2 p-2 text-blue-500 hover:text-blue-700 transition-colors"
                            title={t('backToToday')}
                        >
                            <Calendar size={20} />
                        </button>
                    )}
                    <button
                        onClick={handleNext}
                        className="p-2 text-gray-300 hover:text-gray-900 transition-colors"
                        aria-label={isWeekView ? "Next week" : "Next day"}
                    >
                        <ChevronRight size={24} />
                    </button>
                </div>
            </div>

            {/* Week View Panel */}
            <AnimatePresence>
                {isWeekView && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden bg-gray-50/50 rounded-2xl border border-gray-100 p-4"
                    >
                        {/* Week Strip */}
                        <div className="flex justify-between items-center mb-4">
                            {/* Prev Week Arrow */}
                            <button
                                onClick={handlePrev}
                                className="p-1 text-gray-300 hover:text-gray-900 transition-colors"
                            >
                                <ChevronLeft size={20} />
                            </button>

                            {weekDays.map((day) => {
                                const dayStr = format(day, 'yyyy-MM-dd');
                                const isSelected = isSameDay(day, currentDate);
                                const score = getDayScore(dayStr);

                                return (
                                    <button
                                        key={day.toISOString()}
                                        onClick={() => onDateChange(dayStr)}
                                        className="flex flex-col items-center justify-center w-10 h-16 relative group"
                                    >
                                        <span className={clsx(
                                            "text-[10px] font-bold uppercase mb-1 transition-colors",
                                            isSelected ? "text-gray-900" : "text-gray-400 group-hover:text-gray-600"
                                        )}>
                                            {format(day, 'EEE', { locale: dateLocale })}
                                        </span>
                                        <span className={clsx(
                                            "text-sm font-bold z-10 transition-colors",
                                            isSelected ? "text-gray-900" : "text-gray-500 group-hover:text-gray-800"
                                        )}>
                                            {format(day, 'd', { locale: dateLocale })}
                                        </span>

                                        {/* Daily Score Indicator */}
                                        <div className="mt-1 h-3 flex items-center justify-center">
                                            {score > 0 && (
                                                <span className={clsx(
                                                    "text-[10px] font-bold",
                                                    isSelected ? "text-gray-800" : "text-blue-500"
                                                )}>
                                                    {score}
                                                </span>
                                            )}
                                        </div>

                                        {/* Hand-drawn circle for selected state */}
                                        {isSelected && (
                                            <svg className="absolute inset-0 w-full h-full text-red-500 -z-0 scale-125" viewBox="0 0 40 64" preserveAspectRatio="none">
                                                <motion.path
                                                    d="M 2 32 C 2 12 38 12 38 32 C 38 52 2 52 2 32"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2.5"
                                                    strokeLinecap="round"
                                                    initial={{ pathLength: 0 }}
                                                    animate={{ pathLength: 1 }}
                                                    transition={{ duration: 0.3 }}
                                                />
                                            </svg>
                                        )}
                                    </button>
                                );
                            })}

                            {/* Next Week Arrow */}
                            <button
                                onClick={handleNext}
                                className="p-1 text-gray-300 hover:text-gray-900 transition-colors"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}

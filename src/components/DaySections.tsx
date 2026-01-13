import { useHabits } from '../context/HabitContext';
import { motion } from 'framer-motion';
import { WeeklyTasks } from './WeeklyTasks';
import { useLanguage } from '../context/LanguageContext';

interface DaySectionsProps {
    date: string;
}

export function DaySections({ date }: DaySectionsProps) {
    const { weeklyFocus, updateWeeklyFocus, weeklyReflections, updateWeeklyReflections } = useHabits();
    const { t } = useLanguage();

    // Helper to get week key
    const getWeekKey = (d: string) => {
        const dateObj = new Date(d);
        const day = dateObj.getDay();
        const diff = dateObj.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(dateObj.setDate(diff));
        return monday.toISOString().split('T')[0];
    };
    const currentWeekKey = getWeekKey(date);

    // Specific text areas we want to keep
    const focusSection = { key: 'focus', label: t('mainFocus'), placeholder: t('mainFocusPlaceholder') } as const;
    const reflectionsSection = { key: 'reflections', label: t('reflections'), placeholder: t('reflectionsPlaceholder') } as const;

    return (
        <div className="space-y-6">
            {/* 1. Main Focus (Weekly) */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
            >
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-bold font-hand text-gray-800">{focusSection.label}</h3>
                    <span className="text-xs font-medium text-blue-500 bg-blue-50 px-2 py-1 rounded-full">
                        {t('weekly')}
                    </span>
                </div>
                <textarea
                    value={weeklyFocus[currentWeekKey] || ''}
                    onChange={(e) => updateWeeklyFocus(date, e.target.value)}
                    placeholder={focusSection.placeholder}
                    className="w-full min-h-[80px] p-3 text-sm rounded-lg bg-gray-50 border-0 focus:ring-2 focus:ring-gray-100 focus:bg-white transition-all resize-y placeholder:text-gray-300 font-sans"
                />
            </motion.div>

            {/* 2. Weekly Tasks (Replaces Daily To-Do) */}
            <WeeklyTasks date={date} />

            {/* 3. Reflections (Weekly) */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
            >
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-bold font-hand text-gray-800">{reflectionsSection.label}</h3>
                    <span className="text-xs font-medium text-blue-500 bg-blue-50 px-2 py-1 rounded-full">
                        {t('weekly')}
                    </span>
                </div>
                <textarea
                    value={weeklyReflections[currentWeekKey] || ''}
                    onChange={(e) => updateWeeklyReflections(date, e.target.value)}
                    placeholder={reflectionsSection.placeholder}
                    className="w-full min-h-[80px] p-3 text-sm rounded-lg bg-gray-50 border-0 focus:ring-2 focus:ring-gray-100 focus:bg-white transition-all resize-y placeholder:text-gray-300 font-sans"
                />
            </motion.div>
        </div>
    );
}

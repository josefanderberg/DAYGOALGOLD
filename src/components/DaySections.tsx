import { useHabits } from '../context/HabitContext';
import { motion } from 'framer-motion';
import { WeeklyTasks } from './WeeklyTasks';
import { useLanguage } from '../context/LanguageContext';

interface DaySectionsProps {
    date: string;
}

export function DaySections({ date }: DaySectionsProps) {
    const { entries, updateDayField, getCreateDayEntry } = useHabits();
    const { t } = useLanguage();

    // Transient lookup or create
    const entry = entries[date] || getCreateDayEntry(date);

    // Specific text areas we want to keep
    const focusSection = { key: 'focus', label: t('mainFocus'), placeholder: t('mainFocusPlaceholder') } as const;
    const reflectionsSection = { key: 'reflections', label: t('reflections'), placeholder: t('reflectionsPlaceholder') } as const;

    return (
        <div className="space-y-6">
            {/* 1. Main Focus */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
            >
                <h3 className="text-lg font-bold font-hand text-gray-800 mb-3">{focusSection.label}</h3>
                <textarea
                    value={entry.focus || ''}
                    onChange={(e) => updateDayField(date, 'focus', e.target.value)}
                    placeholder={focusSection.placeholder}
                    className="w-full min-h-[80px] p-3 text-sm rounded-lg bg-gray-50 border-0 focus:ring-2 focus:ring-gray-100 focus:bg-white transition-all resize-y placeholder:text-gray-300 font-sans"
                />
            </motion.div>

            {/* 2. Weekly Tasks (Replaces Daily To-Do) */}
            <WeeklyTasks date={date} />

            {/* 3. Reflections */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
            >
                <h3 className="text-lg font-bold font-hand text-gray-800 mb-3">{reflectionsSection.label}</h3>
                <textarea
                    value={entry.reflections || ''}
                    onChange={(e) => updateDayField(date, 'reflections', e.target.value)}
                    placeholder={reflectionsSection.placeholder}
                    className="w-full min-h-[80px] p-3 text-sm rounded-lg bg-gray-50 border-0 focus:ring-2 focus:ring-gray-100 focus:bg-white transition-all resize-y placeholder:text-gray-300 font-sans"
                />
            </motion.div>
        </div>
    );
}

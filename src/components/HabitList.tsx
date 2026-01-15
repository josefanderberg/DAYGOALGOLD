import { useState } from 'react';
import { useHabits } from '../context/HabitContext';
import { HabitItem } from './HabitItem';
import { Plus, Check } from 'lucide-react';
import { Reorder } from 'framer-motion';
import { Modal } from './Modal';
import { type Habit } from '../types';

import { useLanguage } from '../context/LanguageContext';
import { habitSuggestions } from '../data/habitSuggestions';

interface HabitListProps {
    date: string;
}

export function HabitList({ date }: HabitListProps) {
    const {
        habits,
        addHabit,
        removeHabit,
        incrementHabit,
        setHabitProgress,
        getCreateDayEntry,
        updateHabit,
        reorderHabits,
        skipHabit,
        showRandomLoveMessage
    } = useHabits();
    const { t } = useLanguage();

    // Modals state
    const [isAdding, setIsAdding] = useState(false);
    const [newHabitTitle, setNewHabitTitle] = useState('');
    const [newHabitTarget, setNewHabitTarget] = useState<number | string>(1);

    const [deletingHabit, setDeletingHabit] = useState<Habit | null>(null);

    const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
    const [editTitle, setEditTitle] = useState('');
    const [editTarget, setEditTarget] = useState<number | string>(1);
    const [isEditingList, setIsEditingList] = useState(false);

    const dayEntry = getCreateDayEntry(date);
    // Calculate today's completed count mainly for header stats
    const completedCount = habits.filter(h => (dayEntry.progress?.[h.id] || 0) >= (h.target || 1)).length;

    const handleAddSubmit = () => {
        if (newHabitTitle.trim()) {
            // General habits start from the current date appearing forward
            addHabit(newHabitTitle.trim(), Number(newHabitTarget) || 1, undefined, date);
            setNewHabitTitle('');
            setNewHabitTarget(1);
            setIsAdding(false);
        }
    };

    const confirmDelete = () => {
        if (deletingHabit) {
            // If we delete forever, we also want to hide it from today's view immediately
            // regardless of whether it has progress or not.
            skipHabit(date, deletingHabit.id);
            removeHabit(deletingHabit.id, date);
            setDeletingHabit(null);
        }
    };

    const saveEdit = () => {
        if (editingHabit && editTitle.trim()) {
            updateHabit(editingHabit.id, editTitle.trim(), Number(editTarget) || 1);
            setEditingHabit(null);
            setEditTitle('');
            setEditTarget(1);
        }
    };

    const openEdit = (habit: Habit) => {
        setEditingHabit(habit);
        setEditTitle(habit.title);
        setEditTarget(habit.target || 1);
    };

    // Filter habits for Reorder.Group consistency (removed sort to fix jumping)
    const visibleHabits = habits
        .filter(h => {
            const isSkipped = dayEntry.skippedHabits?.includes(h.id);
            if (isSkipped) return false;
            if (h.specificDate && h.specificDate !== dayEntry.date) return false;
            // If habit has a start date, it shouldn't show up before that date
            if (h.startDate && dayEntry.date < h.startDate) return false;

            // If habit is archived, check if it's within its valid date range (endDate)
            if (h.archived) {
                // If we are viewing a date ON or BEFORE the end date, keep it visible
                // OR fallback to "history exists" progress check if endDate is missing (legacy)
                if (h.endDate && dayEntry.date <= h.endDate) return true;
                return (dayEntry.progress?.[h.id] || 0) > 0;
            }

            return true;
        });

    const handleReorder = (newOrder: Habit[]) => {
        // newOrder only contains visible habits.
        // We need to keep the invisible habits (e.g. archived ones with no progress today)
        // and append them or keep them in the state.
        const visibleIds = new Set(newOrder.map(h => h.id));
        const hiddenHabits = habits.filter(h => !visibleIds.has(h.id));

        reorderHabits([...newOrder, ...hiddenHabits]);
    };

    const handleIncrement = (habit: Habit) => {
        const currentProgress = dayEntry.progress?.[habit.id] || 0;
        const target = habit.target || 1;
        // Check if this increment will complete the habit
        if (currentProgress < target && currentProgress + 1 >= target) {
            showRandomLoveMessage();
        }
        incrementHabit(date, habit.id);
    };

    return (
        <>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <h2 className="text-xl font-bold font-hand text-gray-800">{t('yourRituals')}</h2>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Check size={14} className="text-gray-400" strokeWidth={3} />
                        <span className="text-sm text-gray-500 font-sans">
                            {completedCount}/{visibleHabits.length}
                        </span>
                    </div>
                </div>

                {/* Reorder Group replaces simple flex div */}
                <Reorder.Group
                    axis="y"
                    values={visibleHabits}
                    onReorder={handleReorder}
                    className="flex flex-col"
                >
                    {visibleHabits.map((habit) => (
                        <HabitItem
                            key={habit.id}
                            habit={habit}
                            isEditing={isEditingList}
                            progress={dayEntry.progress?.[habit.id] || 0}
                            onIncrement={() => handleIncrement(habit)}
                            onReset={() => setHabitProgress(date, habit.id, 0)}
                            onRemove={() => setDeletingHabit(habit)}
                            onEdit={() => openEdit(habit)}
                        />
                    ))}
                </Reorder.Group>

                <button
                    onClick={() => setIsAdding(true)}
                    className="mt-6 w-full py-3 flex items-center justify-center gap-2 text-sm font-medium text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg border border-dashed border-gray-200 hover:border-gray-300 transition-all group"
                >
                    <Plus size={18} className="group-hover:scale-110 transition-transform" />
                    {t('addRitual')}
                </button>
            </div>

            {/* Add Modal */}
            <Modal
                isOpen={isAdding}
                onClose={() => setIsAdding(false)}
                title={t('addRitual')}
                footer={
                    <>
                        <button onClick={() => setIsAdding(false)} className="px-4 py-2 text-sm text-gray-600">{t('cancel')}</button>
                        <div className="flex gap-2">
                            <button onClick={() => {
                                if (newHabitTitle.trim()) {
                                    addHabit(newHabitTitle.trim(), Number(newHabitTarget) || 1, date);
                                    setNewHabitTitle('');
                                    setNewHabitTarget(1);
                                    setIsAdding(false);
                                }
                            }} className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg h-full">{t('removeForToday')}</button>
                            <button onClick={handleAddSubmit} className="px-4 py-2 text-sm text-white bg-gray-900 rounded-lg">{t('create')}</button>
                        </div>
                    </>
                }
            >
                <div className="space-y-4">
                    <div className="relative">
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{t('ritualName')}</label>
                        <input
                            autoFocus
                            type="text"
                            placeholder="e.g. 10 Pushups"
                            value={newHabitTitle}
                            onChange={(e) => setNewHabitTitle(e.target.value)}
                            className="w-full px-4 py-2 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{t('dailyTarget')}</label>
                        <div className="flex items-center gap-4">
                            <input
                                type="number"
                                min="1"
                                value={newHabitTarget}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setNewHabitTarget(val === '' ? '' : parseInt(val));
                                }}
                                onBlur={() => {
                                    if (newHabitTarget === '' || Number(newHabitTarget) < 1) {
                                        setNewHabitTarget(1);
                                    }
                                }}
                                className="w-24 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900"
                            />
                            <span className="text-sm text-gray-500">{t('timesPerDay')}</span>

                            <div className="flex-1" />

                            <button
                                onClick={() => {
                                    const randomHabit = habitSuggestions[Math.floor(Math.random() * habitSuggestions.length)];
                                    setNewHabitTitle(randomHabit.title);
                                    setNewHabitTarget(randomHabit.target);
                                }}
                                className="px-3 py-2 text-xs font-bold uppercase tracking-wider border-2 border-transparent rounded-md transition-all hover:scale-105 active:scale-95 bg-clip-padding backdrop-filter backdrop-blur-sm bg-opacity-10"
                                style={{
                                    backgroundImage: 'linear-gradient(white, white), linear-gradient(to right, #ec4899, #8b5cf6, #3b82f6)',
                                    backgroundOrigin: 'border-box',
                                    backgroundClip: 'padding-box, border-box',
                                }}
                            >
                                <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent animate-pulse">
                                    Random
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </Modal>

            {/* Delete Modal */}
            <Modal
                isOpen={!!deletingHabit}
                onClose={() => setDeletingHabit(null)}
                title={t('removeRitual')}
                footer={
                    <>
                        <button
                            onClick={() => setDeletingHabit(null)}
                            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
                        >
                            {t('cancel')}
                        </button>
                        <div className="flex gap-2">
                            <button
                                onClick={() => {
                                    if (deletingHabit) {
                                        skipHabit(date, deletingHabit.id);
                                        setDeletingHabit(null);
                                    }
                                }}
                                className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                {t('removeForToday')}
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
                            >
                                {t('deleteForever')}
                            </button>
                        </div>
                    </>
                }
            >
                <p className="text-gray-600 text-sm">
                    {t('stopTracking')} <strong>{deletingHabit?.title}</strong>?
                </p>
            </Modal>

            {/* Edit Modal */}
            <Modal
                isOpen={!!editingHabit}
                onClose={() => setEditingHabit(null)}
                title={t('editRitual')}
                footer={
                    <>
                        <button
                            onClick={() => setEditingHabit(null)}
                            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
                        >
                            {t('cancel')}
                        </button>
                        <button
                            onClick={saveEdit}
                            className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors"
                        >
                            {t('saveChanges')}
                        </button>
                    </>
                }
            >
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t('ritualName')}</label>
                        <input
                            autoFocus
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="w-full px-4 py-2 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t('dailyTarget')}</label>
                        <div className="flex items-center gap-4">
                            <input
                                type="number"
                                min="1"
                                value={editTarget}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setEditTarget(val === '' ? '' : parseInt(val));
                                }}
                                onBlur={() => {
                                    if (editTarget === '' || Number(editTarget) < 1) {
                                        setEditTarget(1);
                                    }
                                }}
                                className="w-24 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
                            />
                            <span className="text-sm text-gray-500">{t('timesPerDay')}</span>
                        </div>
                    </div>
                </div>
            </Modal>
        </>
    );
}

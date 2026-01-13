import { useState } from 'react';
import { useHabits } from '../context/HabitContext';
import { HabitItem } from './HabitItem';
import { Plus, Edit2, Check } from 'lucide-react';
import { AnimatePresence, Reorder } from 'framer-motion';
import { Modal } from './Modal';
import { type Habit } from '../types';

import { useLanguage } from '../context/LanguageContext';

interface HabitListProps {
    date: string;
}

export function HabitList({ date }: HabitListProps) {
    const {
        habits,
        addHabit,
        removeHabit,
        incrementHabit,
        getCreateDayEntry,
        updateHabit,
        reorderHabits
    } = useHabits();
    const { t } = useLanguage();

    // Modals state
    const [isAdding, setIsAdding] = useState(false);
    const [newHabitTitle, setNewHabitTitle] = useState('');
    const [newHabitTarget, setNewHabitTarget] = useState(1);

    const [deletingHabit, setDeletingHabit] = useState<Habit | null>(null);

    const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
    const [editTitle, setEditTitle] = useState('');
    const [editTarget, setEditTarget] = useState(1);

    // Edit Mode state
    const [isEditMode, setIsEditMode] = useState(false);

    const dayEntry = getCreateDayEntry(date);
    // Calculate today's completed count mainly for header stats
    const completedCount = habits.filter(h => (dayEntry.progress?.[h.id] || 0) >= (h.target || 1)).length;

    const handleAddSubmit = () => {
        if (newHabitTitle.trim()) {
            addHabit(newHabitTitle.trim(), newHabitTarget);
            setNewHabitTitle('');
            setNewHabitTarget(1);
            setIsAdding(false);
        }
    };

    const confirmDelete = () => {
        if (deletingHabit) {
            removeHabit(deletingHabit.id);
            setDeletingHabit(null);
        }
    };

    const saveEdit = () => {
        if (editingHabit && editTitle.trim()) {
            updateHabit(editingHabit.id, editTitle.trim(), editTarget);
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

    return (
        <>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <h2 className="text-xl font-bold font-hand text-gray-800">{t('yourRituals')}</h2>
                        <button
                            onClick={() => setIsEditMode(!isEditMode)}
                            className="p-1.5 text-gray-300 hover:text-gray-900 transition-colors rounded-full hover:bg-gray-50"
                        >
                            {isEditMode ? <Check size={16} /> : <Edit2 size={16} />}
                        </button>
                    </div>
                    <span className="text-sm text-gray-400 font-sans font-medium">
                        {completedCount}/{habits.length}
                    </span>
                </div>

                {/* Reorder Group replaces simple flex div */}
                <Reorder.Group
                    axis="y"
                    values={habits}
                    onReorder={reorderHabits}
                    className="flex flex-col"
                >
                    <AnimatePresence initial={false}>
                        {habits
                            .filter(h => !h.archived || (dayEntry.progress?.[h.id] || 0) > 0)
                            .sort((a, b) => {
                                if (a.archived === b.archived) return 0;
                                return a.archived ? 1 : -1;
                            })
                            .map((habit) => (
                                <HabitItem
                                    key={habit.id}
                                    habit={habit}
                                    isEditMode={isEditMode}
                                    progress={dayEntry.progress?.[habit.id] || 0}
                                    onIncrement={() => incrementHabit(date, habit.id)}
                                    onRemove={() => setDeletingHabit(habit)}
                                    onEdit={() => openEdit(habit)}
                                />
                            ))}
                    </AnimatePresence>
                </Reorder.Group>

                {isEditMode && (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="mt-6 w-full py-3 flex items-center justify-center gap-2 text-sm font-medium text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg border border-dashed border-gray-200 hover:border-gray-300 transition-all group"
                    >
                        <Plus size={18} className="group-hover:scale-110 transition-transform" />
                        {t('addRitual')}
                    </button>
                )}
            </div>

            {/* Add Modal */}
            <Modal
                isOpen={isAdding}
                onClose={() => setIsAdding(false)}
                title={t('addRitual')}
                footer={
                    <>
                        <button onClick={() => setIsAdding(false)} className="px-4 py-2 text-sm text-gray-600">{t('cancel')}</button>
                        <button onClick={handleAddSubmit} className="px-4 py-2 text-sm text-white bg-gray-900 rounded-lg">{t('create')}</button>
                    </>
                }
            >
                <div className="space-y-4">
                    <div>
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
                                onChange={(e) => setNewHabitTarget(parseInt(e.target.value) || 1)}
                                className="w-24 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900"
                            />
                            <span className="text-sm text-gray-500">{t('timesPerDay')}</span>
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
                        <button
                            onClick={confirmDelete}
                            className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
                        >
                            {t('delete')}
                        </button>
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
                                onChange={(e) => setEditTarget(parseInt(e.target.value) || 1)}
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

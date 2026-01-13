import { createContext, useContext, type ReactNode } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { type Habit, type DayEntry, type WeeklyTask, INITIAL_HABITS } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface HabitContextType {
    habits: Habit[];
    entries: Record<string, DayEntry>;
    weeklyTasks: WeeklyTask[];
    weeklyFocus: Record<string, string>;
    updateWeeklyFocus: (date: string, text: string) => void;
    weeklyReflections: Record<string, string>;
    updateWeeklyReflections: (date: string, text: string) => void;
    addHabit: (title: string, target?: number) => void;
    removeHabit: (id: string) => void;
    updateHabit: (id: string, newTitle: string, newTarget?: number) => void;
    incrementHabit: (date: string, habitId: string) => void;
    updateDayField: (date: string, field: keyof DayEntry, value: string) => void;
    getCreateDayEntry: (date: string) => DayEntry;
    addWeeklyTask: (title: string, date: string) => void;
    toggleWeeklyTask: (id: string) => void;
    toggleWeeklyTaskImportance: (id: string) => void;
    removeWeeklyTask: (id: string) => void;
    moveHabit: (id: string, direction: 'up' | 'down') => void;
    reorderHabits: (newHabits: Habit[]) => void;
    resetDay: (date: string) => void;
}

const HabitContext = createContext<HabitContextType | undefined>(undefined);

export function HabitProvider({ children }: { children: ReactNode }) {
    const [habits, setHabits] = useLocalStorage<Habit[]>('jdih_habits', INITIAL_HABITS);
    const [entries, setEntries] = useLocalStorage<Record<string, DayEntry>>('jdih_entries', {});
    const [weeklyTasks, setWeeklyTasks] = useLocalStorage<WeeklyTask[]>('jdih_weekly_tasks', []);
    const [weeklyFocus, setWeeklyFocus] = useLocalStorage<Record<string, string>>('jdih_weekly_focus', {});
    const [weeklyReflections, setWeeklyReflections] = useLocalStorage<Record<string, string>>('jdih_weekly_reflections', {});

    const addHabit = (title: string, target: number = 1) => {
        const newHabit: Habit = { id: uuidv4(), title, target, archived: false };
        setHabits([...habits, newHabit]);
    };

    const removeHabit = (id: string) => {
        // Check if habit has ever been used (progress > 0) in any entry
        const hasHistory = Object.values(entries).some(entry => (entry.progress?.[id] || 0) > 0);

        if (hasHistory) {
            // Archive it
            setHabits(habits.map(h => h.id === id ? { ...h, archived: true } : h));
        } else {
            // Hard delete
            setHabits(habits.filter((h) => h.id !== id));
        }
    };

    const updateHabit = (id: string, newTitle: string, newTarget?: number) => {
        setHabits(habits.map((h) => (h.id === id ? {
            ...h,
            title: newTitle,
            target: newTarget !== undefined ? newTarget : h.target
        } : h)));
    };

    const moveHabit = (id: string, direction: 'up' | 'down') => {
        const index = habits.findIndex(h => h.id === id);
        if (index === -1) return;

        const newHabits = [...habits];
        if (direction === 'up' && index > 0) {
            [newHabits[index], newHabits[index - 1]] = [newHabits[index - 1], newHabits[index]];
        } else if (direction === 'down' && index < newHabits.length - 1) {
            [newHabits[index], newHabits[index + 1]] = [newHabits[index + 1], newHabits[index]];
        }
        setHabits(newHabits);
    };

    const reorderHabits = (newHabits: Habit[]) => {
        setHabits(newHabits);
    };

    const getCreateDayEntry = (date: string): DayEntry => {
        if (entries[date]) {
            if (!entries[date].progress) {
                return { ...entries[date], progress: {} };
            }
            return entries[date];
        }
        const newEntry: DayEntry = {
            date,
            completedHabits: [],
            progress: {},
            todo: '',
            focus: '',
            reflections: '',
        };
        return newEntry;
    };

    const incrementHabit = (date: string, habitId: string) => {
        const entry = getCreateDayEntry(date);
        const habit = habits.find(h => h.id === habitId);
        const target = habit?.target || 1;

        const currentProgress = entry.progress?.[habitId] || 0;
        let newProgress = currentProgress + 1;

        if (target === 1) {
            if (currentProgress >= 1) newProgress = 0;
            else newProgress = 1;
        }

        setEntries({
            ...entries,
            [date]: {
                ...entry,
                progress: {
                    ...entry.progress,
                    [habitId]: newProgress
                },
                completedHabits: newProgress >= target
                    ? [...(entry.completedHabits || []).filter(id => id !== habitId), habitId]
                    : (entry.completedHabits || []).filter(id => id !== habitId)
            },
        });
    };

    const updateDayField = (date: string, field: keyof DayEntry, value: string) => {
        const entry = getCreateDayEntry(date);
        setEntries({
            ...entries,
            [date]: { ...entry, [field]: value },
        });
    };

    // Weekly Tasks Logic
    const getWeekStart = (dateStr: string) => {
        const d = new Date(dateStr);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
        const monday = new Date(d.setDate(diff));
        return monday.toISOString().split('T')[0];
    };

    const updateWeeklyFocus = (date: string, text: string) => {
        const weekStart = getWeekStart(date);
        setWeeklyFocus({
            ...weeklyFocus,
            [weekStart]: text
        });
    };

    const updateWeeklyReflections = (date: string, text: string) => {
        const weekStart = getWeekStart(date);
        setWeeklyReflections({
            ...weeklyReflections,
            [weekStart]: text
        });
    };

    const addWeeklyTask = (title: string, date: string) => {
        const weekStart = getWeekStart(date);
        const newTask: WeeklyTask = {
            id: uuidv4(),
            title,
            isCompleted: false,
            weekStart
        };
        setWeeklyTasks([...weeklyTasks, newTask]);
    };

    const toggleWeeklyTask = (id: string) => {
        setWeeklyTasks(weeklyTasks.map(t => t.id === id ? { ...t, isCompleted: !t.isCompleted } : t));
    };

    const toggleWeeklyTaskImportance = (id: string) => {
        setWeeklyTasks(weeklyTasks.map(t => t.id === id ? { ...t, isImportant: !t.isImportant } : t));
    };

    const removeWeeklyTask = (id: string) => {
        setWeeklyTasks(weeklyTasks.filter(t => t.id !== id));
    };

    const resetDay = (date: string) => {
        // Resetting the day means clearing the entry for that date
        // leaving it empty will cause getCreateDayEntry to generate a fresh one
        const { [date]: _, ...rest } = entries;
        setEntries(rest);
    };

    return (
        <HabitContext.Provider
            value={{
                habits,
                entries,
                weeklyTasks,
                addHabit,
                removeHabit,
                updateHabit,
                incrementHabit,
                updateDayField,
                getCreateDayEntry,
                weeklyFocus,
                updateWeeklyFocus,
                weeklyReflections,
                updateWeeklyReflections,
                addWeeklyTask,
                toggleWeeklyTask,
                toggleWeeklyTaskImportance,
                removeWeeklyTask,
                moveHabit,
                reorderHabits,
                resetDay
            }}
        >
            {children}
        </HabitContext.Provider>
    );
}

export function useHabits() {
    const context = useContext(HabitContext);
    if (context === undefined) {
        throw new Error('useHabits must be used within a HabitProvider');
    }
    return context;
}

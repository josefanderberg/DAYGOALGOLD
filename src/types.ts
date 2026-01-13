export interface Habit {
    id: string;
    title: string;
    target: number; // Default 1
    archived?: boolean;
}
export interface WeeklyTask {
    id: string;
    title: string;
    isCompleted: boolean;
    weekStart: string; // ISO Date string of the Monday
    isImportant?: boolean;
}

export interface DayEntry {
    date: string; // YYYY-MM-DD
    completedHabits: string[]; // Deprecated but kept for migration if needed, or mapped
    progress: Record<string, number>; // habitId -> count
    todo: string;
    focus: string;
    reflections: string;
}

export interface AppData {
    habits: Habit[];
    entries: Record<string, DayEntry>;
}

export const INITIAL_HABITS: Habit[] = [
    { id: '1', title: 'Gå upp före 06:00', target: 1 },
    { id: '2', title: 'Ät 3 balanserade måltider', target: 3 },
    { id: '3', title: 'Gå 7,000 steg', target: 1 },
    { id: '4', title: 'Meditera 12 minuter', target: 1 },
    { id: '5', title: 'I säng innan 22:00', target: 1 },
];

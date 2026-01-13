export interface Habit {
    id: string;
    title: string;
    target: number; // Default 1
}
export interface WeeklyTask {
    id: string;
    title: string;
    isCompleted: boolean;
    weekStart: string; // ISO Date string of the Monday
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
    { id: '1', title: 'Wake up before 06.00', target: 1 },
    { id: '2', title: 'Eat 3 balanced meals a day', target: 3 }, // Example multi-count
    { id: '3', title: 'Walk 7,000 steps a day', target: 1 },
    { id: '5', title: 'Get rid of something', target: 1 },
    { id: '6', title: 'Meditate 12 minutes a day', target: 1 },
    { id: '7', title: 'Publish one post a day', target: 1 },
    { id: '8', title: '90 min of carving your path', target: 1 },
    { id: '9', title: 'Train 3 times per week', target: 1 }, // This is per week, but daily logger usually just marks "Did train today"
    { id: '10', title: 'In bed by 22:00', target: 1 },
    { id: '11', title: '10 Pushups', target: 1 },
];

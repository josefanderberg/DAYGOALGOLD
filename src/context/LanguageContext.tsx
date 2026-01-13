import { createContext, useContext, type ReactNode } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { sv, enUS } from 'date-fns/locale';

type Language = 'en' | 'sv';

type Translations = {
    [key: string]: {
        en: string;
        sv: string;
    }
};

const dictionary: Translations = {
    'yourRituals': { en: 'Your Rituals', sv: 'Dina Rutiner' },
    'addRitual': { en: 'Add Ritual', sv: 'Lägg till Rutin' },
    'ritualName': { en: 'Ritual Name', sv: 'Namn på Rutin' },
    'dailyTarget': { en: 'Daily Target', sv: 'Dagligt Mål' },
    'timesPerDay': { en: 'times per day', sv: 'gånger per dag' },
    'cancel': { en: 'Cancel', sv: 'Avbryt' },
    'create': { en: 'Create', sv: 'Skapa' },
    'delete': { en: 'Delete', sv: 'Ta bort' },
    'saveChanges': { en: 'Save Changes', sv: 'Spara ändringar' },
    'removeRitual': { en: 'Remove Ritual', sv: 'Ta bort Rutin' },
    'editRitual': { en: 'Edit Ritual', sv: 'Redigera Rutin' },
    'stopTracking': { en: 'Are you sure you want to stop tracking', sv: 'Är du säker på att du vill sluta följa' },
    'mainFocus': { en: 'Main Focus', sv: 'Huvudfokus' },
    'mainFocusPlaceholder': { en: 'What is the one thing?', sv: 'Vad är det viktigaste?' },
    'weeklyGoals': { en: 'Weekly Goals', sv: 'Veckomål' },
    'weeklyGoalsPlaceholder': { en: 'Add a goal for this week...', sv: 'Lägg till ett mål för veckan...' },
    'reflections': { en: 'Reflections', sv: 'Reflektioner' },
    'reflectionsPlaceholder': { en: 'How did it go?', sv: 'Hur gick det?' },
    'dailyGoals': { en: 'Daily Goals', sv: 'Dagliga Mål' },
    'selectDay': { en: 'Select Day', sv: 'Välj Dag' },
    'week': { en: 'Week', sv: 'Vecka' },
    'viewWeek': { en: 'View Week', sv: 'Visa Vecka' },
    'closeWeekView': { en: 'Close Week View', sv: 'Stäng Veckovy' },
    'switchLanguage': { en: 'Byt till Svenska', sv: 'Switch to English' },
    'settings': { en: 'Settings', sv: 'Inställningar' },
    'backToToday': { en: 'Back to Today', sv: 'Tillbaka till Idag' },
    'resetDay': { en: 'Undo Today', sv: 'Nollställ Dag' },
    'resetConfirmTitle': { en: 'Reset Today?', sv: 'Nollställ Dagen?' },
    'resetConfirmBody': { en: 'This will clear all progress and reflections for this day. Are you sure?', sv: 'Detta kommer att radera alla framsteg och reflektioner för denna dag. Är du säker?' },
    'dailyActions': { en: 'Daily Actions', sv: 'Dagliga Åtgärder' },
};

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
    dateLocale: any;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguage] = useLocalStorage<Language>('jdih_lang', 'sv');

    const t = (key: string) => {
        const item = dictionary[key];
        if (!item) return key;
        return item[language] || item.en;
    };

    const dateLocale = language === 'sv' ? sv : enUS;

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t, dateLocale }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}

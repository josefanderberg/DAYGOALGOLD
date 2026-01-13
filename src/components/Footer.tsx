import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useHabits } from '../context/HabitContext';
import { Globe, Settings, RotateCcw } from 'lucide-react';
import { Modal } from './Modal';

interface FooterProps {
    date?: string;
}

export function Footer({ date }: FooterProps) {
    const { language, setLanguage, t } = useLanguage();
    const { resetDay } = useHabits();
    const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

    const toggleLanguage = () => {
        setLanguage(language === 'en' ? 'sv' : 'en');
    };

    const handleReset = () => {
        if (date) {
            resetDay(date);
            setIsResetConfirmOpen(false);
        }
    };

    return (
        <footer className="mt-8 pt-6 border-t border-gray-100 flex flex-col gap-4">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest px-2">
                <Settings size={12} />
                <span>{t('settings')}</span>
            </div>

            <div className="flex flex-col gap-1">
                <button
                    onClick={toggleLanguage}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-white hover:shadow-sm transition-all text-left group"
                >
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                        <Globe size={16} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                            {t('switchLanguage')}
                        </span>
                        <span className="text-xs text-gray-400">
                            {language === 'en' ? 'Svenska' : 'English'}
                        </span>
                    </div>
                </button>

                {date && (
                    <button
                        onClick={() => setIsResetConfirmOpen(true)}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-white hover:shadow-sm transition-all text-left group"
                    >
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 group-hover:bg-red-50 group-hover:text-red-500 transition-colors">
                            <RotateCcw size={16} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                                {t('resetDay')}
                            </span>
                        </div>
                    </button>
                )}
            </div>

            <Modal
                isOpen={isResetConfirmOpen}
                onClose={() => setIsResetConfirmOpen(false)}
                title={t('resetConfirmTitle')}
                footer={
                    <>
                        <button
                            onClick={() => setIsResetConfirmOpen(false)}
                            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
                        >
                            {t('cancel')}
                        </button>
                        <button
                            onClick={handleReset}
                            className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
                        >
                            {t('resetDay')}
                        </button>
                    </>
                }
            >
                <p className="text-gray-600 text-sm">
                    {t('resetConfirmBody')}
                </p>
            </Modal>
        </footer>
    );
}

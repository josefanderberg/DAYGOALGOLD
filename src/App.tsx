import { useState } from 'react';
import { format } from 'date-fns';
import { Header } from './components/Header';
import { HabitList } from './components/HabitList';
import { DaySections } from './components/DaySections';
import { ScoreRing } from './components/ScoreRing';

import { LanguageProvider } from './context/LanguageContext';
import { Footer } from './components/Footer';

function App() {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  return (
    <LanguageProvider>
      <div className="min-h-screen bg-gray-100 flex md:items-center md:justify-center p-0 md:p-8">
        {/* Mobile-first container: Native scroll on mobile, constrained phone-box on desktop */}
        <div className="w-full bg-gray-50 md:h-[850px] md:w-[420px] md:rounded-3xl md:shadow-2xl md:overflow-hidden md:flex md:flex-col md:border md:border-gray-200/50 relative">

          {/* Sticky Header */}
          <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200">
            <Header date={selectedDate} onDateChange={setSelectedDate} />
          </div>

          {/* Main Content - Native scroll on mobile (default), internal scroll on desktop */}
          <main className="md:flex-1 md:overflow-y-auto md:overflow-x-hidden p-6 space-y-6 pb-24 md:pb-6 no-scrollbar">
            <ScoreRing date={selectedDate} />
            <HabitList date={selectedDate} />
            <DaySections date={selectedDate} />
            <Footer date={selectedDate} />
          </main>
        </div>
      </div>
    </LanguageProvider>
  );
}

export default App;

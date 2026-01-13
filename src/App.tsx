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
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-0 md:p-8">
        {/* Mobile-first container: Full width on mobile, constrained on desktop */}
        <div className="w-full h-[100dvh] md:h-[850px] md:w-[420px] bg-gray-50 md:rounded-3xl md:shadow-2xl overflow-hidden flex flex-col border border-gray-200/50 relative">

          <div className="flex-shrink-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-200">
            <Header date={selectedDate} onDateChange={setSelectedDate} />
          </div>

          <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 space-y-6 no-scrollbar pb-20">
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

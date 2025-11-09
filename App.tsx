
import React, { useState } from 'react';
import Header from './components/layout/Header';
import PlannerView from './components/planner/PlannerView';
import AcademicsView from './components/academics/AcademicsView';

function App() {
  const [currentView, setCurrentView] = useState<'planner' | 'academics'>('planner');

  return (
    <div className="min-h-screen flex flex-col">
      <Header currentView={currentView} setCurrentView={setCurrentView} />
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto">
          {currentView === 'planner' ? <PlannerView /> : <AcademicsView />}
        </div>
      </main>
    </div>
  );
}

export default App;
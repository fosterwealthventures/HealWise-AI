import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardView from './components/DashboardView';
import PricingPage from './components/PricingPage';
import OnboardingModal from './components/OnboardingModal';
import { SubscriptionPlan } from './types';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState('dashboard');
  const [plan, setPlan] = useState<SubscriptionPlan>('free');
  const [restrictions, setRestrictions] = useState(() => localStorage.getItem('healwiseRestrictions') || '');
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const onboardingComplete = localStorage.getItem('healwiseOnboardingComplete');
    if (onboardingComplete !== 'true') {
      setShowOnboarding(true);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('healwiseRestrictions', restrictions);
  }, [restrictions]);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    localStorage.setItem('healwiseOnboardingComplete', 'true');
  };

  const handlePlanSelect = (selectedPlan: SubscriptionPlan) => {
    setPlan(selectedPlan);
    alert(`You are now on the ${selectedPlan} plan!`);
    setActiveView('dashboard');
  };

  const renderView = () => {
    switch(activeView) {
      case 'dashboard':
        return <DashboardView plan={plan} restrictions={restrictions} setRestrictions={setRestrictions} />;
      case 'pricing':
        return <PricingPage onSelectPlan={handlePlanSelect} />;
      case 'planner':
        return <div className="text-center p-10">Planner View - Coming Soon!</div>;
      case 'shop':
        return <div className="text-center p-10">Shop View - Coming Soon!</div>;
      default:
        return <DashboardView plan={plan} restrictions={restrictions} setRestrictions={setRestrictions} />;
    }
  }

  return (
    <div className="flex h-screen bg-brand-cream font-sans text-brand-charcoal">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header currentPlan={plan} setPlan={setPlan} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 lg:p-10">
          {renderView()}
        </main>
      </div>
      {showOnboarding && (
        <OnboardingModal 
          onComplete={handleOnboardingComplete}
          restrictions={restrictions}
          setRestrictions={setRestrictions}
        />
      )}
    </div>
  );
};

export default App;
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardView from './components/DashboardView';
import PricingPage from './components/PricingPage';
import OnboardingModal from './components/OnboardingModal';
import PlannerView from './components/PlannerView';
import ProfileView from './components/ProfileView';
import AppFooter from './components/AppFooter';
import PaymentSuccessView from './components/PaymentSuccessView';
import PaymentCancelView from './components/PaymentCancelView';
import { SubscriptionPlan, PlannerItem } from './types';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState('dashboard');
  const [plan, setPlan] = useState<SubscriptionPlan>('free');
  const [restrictions, setRestrictions] = useState(() => localStorage.getItem('healwiseRestrictions') || '');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [plannerItems, setPlannerItems] = useState<PlannerItem[]>(() => {
    try {
      const savedItems = localStorage.getItem('healwisePlannerItems');
      return savedItems ? JSON.parse(savedItems) : [];
    } catch (error) {
      console.error("Failed to parse planner items from localStorage", error);
      return [];
    }
  });

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('healwise-dark-mode');
    if (savedMode) {
      return JSON.parse(savedMode);
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('healwise-dark-mode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  useEffect(() => {
    const onboardingComplete = localStorage.getItem('healwiseOnboardingComplete');
    if (onboardingComplete !== 'true') {
      setShowOnboarding(true);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('healwiseRestrictions', restrictions);
  }, [restrictions]);

  useEffect(() => {
    localStorage.setItem('healwisePlannerItems', JSON.stringify(plannerItems));
  }, [plannerItems]);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    localStorage.setItem('healwiseOnboardingComplete', 'true');
  };

  const handlePlanSelect = (selectedPlan: SubscriptionPlan) => {
    if (selectedPlan === 'free') {
      setPlan('free');
      alert(`You are now on the Free plan!`);
      setActiveView('dashboard');
    } else {
      // In a real app, this would initiate the Stripe checkout flow.
      // We simulate a successful payment and redirect to our success page.
      setPlan(selectedPlan);
      setActiveView('payment-success');
    }
  };

  const handleAddToPlanner = (itemToAdd: Omit<PlannerItem, 'id' | 'savedAt'>) => {
    const newItem: PlannerItem = {
      ...itemToAdd,
      id: `${itemToAdd.moduleType}-${new Date().getTime()}`,
      savedAt: new Date().toISOString(),
    };
    setPlannerItems(prevItems => [...prevItems, newItem]);
  };
  
  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  const renderView = () => {
    switch(activeView) {
      case 'dashboard':
        return <DashboardView plan={plan} restrictions={restrictions} onAddToPlanner={handleAddToPlanner} setActiveView={setActiveView} />;
      case 'pricing':
        return <PricingPage onSelectPlan={handlePlanSelect} setActiveView={setActiveView} />;
      case 'planner':
        return <PlannerView items={plannerItems} setItems={setPlannerItems} />;
      case 'profile':
        return <ProfileView restrictions={restrictions} setRestrictions={setRestrictions} />;
      case 'shop':
        return <div className="text-center p-10 dark:text-brand-cream">Shop View - Coming Soon!</div>;
      case 'payment-success':
        return <PaymentSuccessView plan={plan} setActiveView={setActiveView} />;
      case 'payment-cancel':
        return <PaymentCancelView setActiveView={setActiveView} />;
      default:
        return <DashboardView plan={plan} restrictions={restrictions} onAddToPlanner={handleAddToPlanner} setActiveView={setActiveView} />;
    }
  }

  return (
    <div className="flex h-screen bg-brand-cream font-sans text-brand-charcoal dark:bg-brand-charcoal dark:text-brand-cream">
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
      <Sidebar 
        activeView={activeView} 
        setActiveView={setActiveView} 
        plannerItemCount={plannerItems.length}
        isMobileOpen={isMobileSidebarOpen}
        setMobileOpen={setIsMobileSidebarOpen}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
            currentPlan={plan} 
            setPlan={setPlan} 
            isDarkMode={isDarkMode} 
            toggleDarkMode={toggleDarkMode} 
            setActiveView={setActiveView}
            toggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 lg:p-10">
          {renderView()}
        </main>
        <AppFooter />
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
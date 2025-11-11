import React from 'react';
import { SubscriptionPlan } from '../types';

interface PaymentSuccessViewProps {
  plan: SubscriptionPlan;
  setActiveView: (view: string) => void;
}

const PaymentSuccessView: React.FC<PaymentSuccessViewProps> = ({ plan, setActiveView }) => {
  const planName = plan.charAt(0).toUpperCase() + plan.slice(1);

  return (
    <div className="animate-fade-in flex items-center justify-center h-full">
      <div className="text-center p-10 bg-white dark:bg-brand-charcoal-light rounded-2xl shadow-card max-w-lg">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-brand-green mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h1 className="text-3xl font-bold text-brand-charcoal dark:text-brand-cream">Payment Successful!</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">
          Welcome to the HealWise <strong className="text-brand-green-dark dark:text-brand-green-light">{planName}</strong> plan!
        </p>
        <p className="text-gray-500 dark:text-gray-400 mt-4">
          You've unlocked advanced features to accelerate your wellness journey. You can now explore the dashboard with your new capabilities.
        </p>
        <button
          onClick={() => setActiveView('dashboard')}
          className="mt-8 px-8 py-3 text-base font-semibold text-white bg-brand-green-dark hover:bg-brand-green-dark/90 rounded-lg transition-colors shadow"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
};

export default PaymentSuccessView;

import React from 'react';

interface PaymentCancelViewProps {
  setActiveView: (view: string) => void;
}

const PaymentCancelView: React.FC<PaymentCancelViewProps> = ({ setActiveView }) => {
  return (
    <div className="animate-fade-in flex items-center justify-center h-full">
      <div className="text-center p-10 bg-white dark:bg-brand-charcoal-light rounded-2xl shadow-card max-w-lg">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-amber-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h1 className="text-3xl font-bold text-brand-charcoal dark:text-brand-cream">Upgrade Canceled</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">
          Your transaction was not completed.
        </p>
        <p className="text-gray-500 dark:text-gray-400 mt-4">
          You have not been charged. You can return to the pricing page to try again or continue using the free learning pass on your dashboard.
        </p>
        <div className="mt-8 flex justify-center items-center gap-4">
          <button
            onClick={() => setActiveView('pricing')}
            className="px-6 py-3 text-base font-semibold text-brand-green-dark bg-brand-green/10 hover:bg-brand-green/20 dark:text-brand-green-light dark:bg-brand-green/20 dark:hover:bg-brand-green/30 rounded-lg transition-colors"
          >
            Back to Pricing
          </button>
          <button
            onClick={() => setActiveView('dashboard')}
            className="px-6 py-3 text-base font-semibold text-white bg-brand-green-dark hover:bg-brand-green-dark/90 rounded-lg transition-colors shadow"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentCancelView;

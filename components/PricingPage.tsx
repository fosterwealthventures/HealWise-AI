'use client';
import React, { useState } from 'react';
import type { SubscriptionPlan } from '../types';
import { startCheckout, CheckoutPlanKey } from '../services/checkoutService';

const CheckIcon = () => (
  <svg className="h-6 w-6 text-brand-green" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
  </svg>
);

const PlanCard: React.FC<{
  planName: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  isFeatured?: boolean;
  onSelect: () => void;
  buttonText: string;
  isProcessing?: boolean;
}> = ({
  planName, price, period, description, features,
  isFeatured = false, onSelect, buttonText, isProcessing = false
}) => {
  const cardClasses = isFeatured
    ? 'bg-brand-green-dark text-white border-2 border-brand-green-dark'
    : 'bg-white dark:bg-brand-charcoal-light text-brand-charcoal dark:text-brand-cream border border-gray-200 dark:border-gray-700';
  const buttonClasses = isFeatured
    ? 'bg-white text-brand-green-dark hover:bg-gray-100'
    : 'bg-brand-green-dark text-white hover:bg-brand-green-dark/90';

  return (
    <div className={`rounded-2xl p-8 shadow-card flex flex-col ${cardClasses}`}>
      <h3 className="text-2xl font-bold">{planName}</h3>
      <p className={`mt-2 ${isFeatured ? 'text-gray-200' : 'text-gray-500 dark:text-gray-400'}`}>{description}</p>
      <div className="mt-6">
        <span className="text-5xl font-extrabold">{price}</span>
        <span className={`ml-2 text-lg font-medium ${isFeatured ? 'text-gray-300' : 'text-gray-500 dark:text-gray-400'}`}>{period}</span>
      </div>
      <ul className="mt-8 space-y-4 flex-grow">
        {features.map((feature, i) => (
          <li key={i} className="flex items-start">
            <div className="flex-shrink-0"><CheckIcon /></div>
            <p className="ml-3 text-base">{feature}</p>
          </li>
        ))}
      </ul>
      <button
        onClick={onSelect}
        disabled={isProcessing}
        aria-busy={isProcessing}
        className={`mt-10 block w-full py-3 px-6 text-center font-semibold rounded-lg shadow-md transition-transform transform ${isProcessing ? 'opacity-60 cursor-not-allowed' : 'hover:scale-105'} ${buttonClasses}`}
      >
        {isProcessing ? 'Redirecting…' : buttonText}
      </button>
    </div>
  );
};

type Props = {
  onSelectFreePlan: () => void;
  setActiveView: (view: string) => void;
};

const PricingPage: React.FC<Props> = ({ onSelectFreePlan, setActiveView }) => {
  const [processingPlan, setProcessingPlan] = useState<CheckoutPlanKey | null>(null);

  const handleCheckout = async (planKey: CheckoutPlanKey) => {
    try {
      setProcessingPlan(planKey);
      await startCheckout(planKey);
    } catch (error) {
      console.error('Stripe checkout failed', error);
      alert('We could not start the checkout process. Please try again.');
      setProcessingPlan(null);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="text-center">
        <h1 className="text-4xl font-extrabold text-brand-charcoal dark:text-brand-cream sm:text-5xl">
          Choose Your Learning Pass
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-500 dark:text-gray-400">
          All tiers focus on translating reputable wellness research into everyday language—pick how many learning pulls you need.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        <PlanCard
          planName="Free"
          price="$0"
          period="/forever"
          description="A great way to explore the learning companion."
          features={[
            '1 shared learning topic per day',
            '1 medication/supplement explainer per day',
            'Food, Herb, and Recipe cards anchored to the same curiosity',
          ]}
          onSelect={onSelectFreePlan}
          buttonText="Select Plan"
          isProcessing={false}
        />
        <PlanCard
          planName="Pro"
          price="$7.99"
          period="/month"
          description="For curious learners who want more flexibility. Go annual for $79 and save over 15%!"
          features={[
            'Up to 50 learning pulls per month',
            'Mix and match topics across modules',
            'Save insights to planner with personal notes',
            'Request recipe variations on the fly',
          ]}
          isFeatured
          onSelect={() => { void handleCheckout('pro_month'); }}
          buttonText="Upgrade to Pro"
          isProcessing={processingPlan === 'pro_month'}
        />
        <PlanCard
          planName="Premium"
          price="$14.99"
          period="/month"
          description="For power researchers and community teams. Go annual for $99 and save over 40%!"
          features={[
            'Everything in Pro, plus:',
            'Up to 100 learning pulls per month',
            'Guided journaling templates (coming soon)',
            'Priority access to new reflection tools',
          ]}
          onSelect={() => { void handleCheckout('premium_month'); }}
          buttonText="Upgrade to Premium"
          isProcessing={processingPlan === 'premium_month'}
        />
      </div>

      <p className="text-center mt-8 text-gray-500 dark:text-gray-400 text-sm">
        Paid upgrades launch Stripe Checkout in a secure window. Configure your Stripe keys in the <code>.env</code> file before testing.
      </p>
      <div className="text-center mt-4">
        <button
          onClick={() => setActiveView('payment-cancel')}
          className="text-sm text-gray-500 dark:text-gray-400 hover:underline"
        >
          View the canceled payment screen
        </button>
      </div>
    </div>
  );
};

export default PricingPage;

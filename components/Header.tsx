import React from 'react';
import { SubscriptionPlan } from '../types';

const Header: React.FC<{ currentPlan: SubscriptionPlan; setPlan: (plan: SubscriptionPlan) => void }> = ({ currentPlan, setPlan }) => {
  return (
    <header className="h-24 bg-brand-cream/80 backdrop-blur-sm flex-shrink-0 flex items-center justify-between px-6 lg:px-10 border-b border-gray-200/80">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-brand-charcoal">Your Path to Wellness</h1>
        <p className="text-sm text-gray-500 mt-1">Discover personalized, food-first recommendations.</p>
      </div>
      <div className="flex items-center space-x-4">
        {/* Demo Plan Selector */}
        <div className="relative">
          <select 
            value={currentPlan} 
            onChange={(e) => setPlan(e.target.value as SubscriptionPlan)}
            className="appearance-none rounded-lg bg-white/80 border border-gray-200/80 px-4 py-2 text-sm font-medium text-brand-charcoal focus:outline-none focus:ring-2 focus:ring-brand-green"
            aria-label="Select subscription plan"
          >
            <option value="free">Free Plan</option>
            <option value="pro">Pro Plan</option>
            <option value="premium">Premium Plan</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
          </div>
        </div>
        <button className="p-2 rounded-full hover:bg-gray-200/60 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </button>
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-green to-brand-green-light flex items-center justify-center text-white font-bold text-lg shadow-inner">
          U
        </div>
      </div>
    </header>
  );
};

export default Header;
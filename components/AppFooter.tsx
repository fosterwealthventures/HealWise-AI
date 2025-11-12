import React from 'react';

const AppFooter: React.FC = () => {
  return (
    <footer className="px-6 lg:px-10 py-4 border-t border-gray-200/80 dark:border-gray-700/60 bg-brand-cream/80 dark:bg-brand-charcoal/80 backdrop-blur-sm flex-shrink-0">
      <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
        <strong>Educational use only:</strong> HealWise shares plain-language summaries so you can study wellness topics. It does not diagnose, treat, prescribe, or replace conversations with qualified professionals about your own care.
      </p>
    </footer>
  );
};

export default AppFooter;

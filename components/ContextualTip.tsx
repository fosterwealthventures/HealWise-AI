import React from 'react';

interface ContextualTipProps {
  title: string;
  content: React.ReactNode;
  onDismiss: () => void;
}

const ContextualTip: React.FC<ContextualTipProps> = ({ title, content, onDismiss }) => {
  return (
    <div className="absolute inset-0 bg-brand-charcoal/70 backdrop-blur-sm z-10 flex items-center justify-center p-4 rounded-2xl animate-fade-in">
      <div className="bg-white dark:bg-brand-charcoal-light rounded-xl shadow-xl p-6 max-w-sm text-center transform animate-fade-in-up">
        <h3 className="text-lg font-bold text-brand-green-dark dark:text-brand-green-light">{title}</h3>
        <div className="mt-2 text-sm text-gray-600 dark:text-gray-300 space-y-2">
          {content}
        </div>
        <button
          onClick={onDismiss}
          className="mt-6 w-full px-4 py-2 bg-brand-green-dark text-white font-semibold rounded-lg hover:bg-brand-green-dark/90 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-brand-charcoal-light focus:ring-brand-green"
        >
          Okay, Got It!
        </button>
      </div>
    </div>
  );
};

export default ContextualTip;

import React from 'react';

const AppFooter: React.FC = () => {
  return (
    <footer className="px-6 lg:px-10 py-4 border-t border-gray-200/80 dark:border-gray-700/60 bg-brand-cream/80 dark:bg-brand-charcoal/80 backdrop-blur-sm flex-shrink-0">
      <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
        <strong>Disclaimer:</strong> HealWise provides AI-generated information for educational purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.
      </p>
    </footer>
  );
};

export default AppFooter;
import React, { useState } from 'react';
import { ChatBubbleIcon } from './icons/ActionIcons';

interface FeedbackItem {
  id: number;
  category: 'Bug Report' | 'Suggestion' | 'Other';
  text: string;
  timestamp: string;
}

const FeedbackButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [category, setCategory] = useState<'Bug Report' | 'Suggestion' | 'Other'>('Suggestion');
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    setIsSubmitting(true);
    try {
      const existingFeedback: FeedbackItem[] = JSON.parse(localStorage.getItem('healwiseFeedback') || '[]');
      const newFeedback: FeedbackItem = {
        id: Date.now(),
        category,
        text,
        timestamp: new Date().toISOString(),
      };
      const updatedFeedback = [...existingFeedback, newFeedback];
      localStorage.setItem('healwiseFeedback', JSON.stringify(updatedFeedback));
      
      // Simulate API call
      setTimeout(() => {
        setText('');
        setCategory('Suggestion');
        setIsSubmitting(false);
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          setIsOpen(false);
        }, 2000);
      }, 500);

    } catch (error) {
      console.error("Failed to save feedback:", error);
      alert("There was an error saving your feedback. Please try again.");
      setIsSubmitting(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-brand-green-dark text-white p-4 rounded-full shadow-lg hover:bg-brand-green-dark/90 transition-transform transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-cream dark:focus:ring-offset-brand-charcoal focus:ring-brand-green"
        aria-label="Open feedback form"
      >
        <ChatBubbleIcon />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fade-in" aria-modal="true" role="dialog">
      <div className="bg-white dark:bg-brand-charcoal-light rounded-2xl shadow-xl p-6 w-full max-w-md relative">
        {showSuccess ? (
          <div className="text-center py-10">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-brand-green mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-xl font-bold text-brand-charcoal dark:text-brand-cream">Thank You!</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Your feedback has been submitted.</p>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-brand-charcoal dark:text-brand-cream">Share Your Feedback</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">We'd love to hear your thoughts on how we can improve.</p>
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label htmlFor="feedback-category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
                <select
                  id="feedback-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as 'Bug Report' | 'Suggestion' | 'Other')}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-brand-charcoal dark:text-brand-cream focus:outline-none focus:ring-brand-green focus:border-brand-green sm:text-sm rounded-md"
                >
                  <option>Suggestion</option>
                  <option>Bug Report</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label htmlFor="feedback-text" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Your Feedback
                </label>
                <textarea
                  id="feedback-text"
                  rows={4}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Please be as detailed as possible..."
                  className="mt-1 block w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-brand-green focus:border-brand-green sm:text-sm dark:bg-brand-charcoal dark:text-brand-cream"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 dark:bg-gray-600 dark:text-gray-200 border border-transparent rounded-md hover:bg-gray-200 dark:hover:bg-gray-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !text.trim()}
                  className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-brand-green border border-transparent rounded-md shadow-sm hover:bg-brand-green/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-green disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default FeedbackButton;
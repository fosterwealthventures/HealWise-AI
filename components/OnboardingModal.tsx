import React, { useState } from 'react';
import { AppleIcon, LeafIcon, PillIcon, BlenderIcon, AllergyIcon } from './icons/ModuleIcons';

interface OnboardingModalProps {
  onComplete: () => void;
  restrictions: string;
  setRestrictions: (value: string) => void;
}

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => (
    <div className="flex items-start text-left p-3 bg-brand-green/5 rounded-lg">
        <div className="flex-shrink-0 mr-4 text-brand-green-dark">
            {icon}
        </div>
        <div>
            <h4 className="font-semibold text-brand-charcoal dark:text-brand-cream">{title}</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
        </div>
    </div>
);

const OnboardingModal: React.FC<OnboardingModalProps> = ({ onComplete, restrictions, setRestrictions }) => {
  const [step, setStep] = useState(1);
  const totalSteps = 5;

  const handleNext = () => setStep(prev => Math.min(prev + 1, totalSteps));
  const handleBack = () => setStep(prev => Math.max(prev - 1, 1));

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="text-center">
            <div className="mx-auto bg-red-100 text-red-600 p-4 rounded-full w-20 h-20 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-brand-charcoal dark:text-brand-cream mt-5">Important Disclaimer</h2>
            <p className="text-gray-600 dark:text-gray-300 mt-3 max-w-md mx-auto">
              HealWise is an AI-powered educational tool and is <strong className="text-red-700 dark:text-red-400">not a substitute for professional medical advice.</strong> Always consult with a qualified healthcare provider for any health concerns or before making any decisions related to your health or treatment.
            </p>
          </div>
        );
      case 2:
        return (
          <div className="text-center">
            <div className="mx-auto bg-brand-green-light/20 text-brand-green-dark p-4 rounded-full w-20 h-20 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-brand-charcoal dark:text-brand-cream mt-5">Welcome to HealWise!</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-sm mx-auto">Your journey to holistic, food-first, and faith-friendly wellness starts here.</p>
          </div>
        );
      case 3:
        return (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-brand-charcoal dark:text-brand-cream">Discover Our Core Features</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2 mb-6">Get AI-powered recommendations tailored to you.</p>
            <div className="space-y-4">
                <FeatureCard icon={<AppleIcon />} title="Whole-Foods" description="Find foods that support your health goals." />
                <FeatureCard icon={<LeafIcon />} title="Herbs" description="Explore natural herbs and their benefits." />
                <FeatureCard icon={<PillIcon />} title="Medications" description="Simplify your meds and check interactions." />
                <FeatureCard icon={<BlenderIcon />} title="Recipes" description="Generate healthy recipes for your needs." />
            </div>
          </div>
        );
      case 4:
        return (
            <div className="text-center">
                <div className="mx-auto bg-brand-gold/10 text-amber-600 p-4 rounded-full w-20 h-20 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <h2 className="text-2xl font-bold text-brand-charcoal dark:text-brand-cream mt-5">How It Works</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-2 mb-6">Start with our free plan or upgrade for more features.</p>
                <div className="space-y-4 text-left">
                    <div className="p-4 bg-gray-50 dark:bg-brand-charcoal rounded-lg border dark:border-gray-700">
                        <h4 className="font-semibold text-brand-charcoal dark:text-brand-cream">Free Plan</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Perfect for getting started. You get 1 shared condition and 1 medication analysis per day.</p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-brand-charcoal rounded-lg border dark:border-gray-700">
                        <h4 className="font-semibold text-brand-charcoal dark:text-brand-cream">Pro & Premium</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Unlock more power with monthly analyses, multi-item searches, and the ability to save to your planner.</p>
                    </div>
                </div>
          </div>
        );
      case 5:
        return (
          <div className="text-center">
             <div className="mx-auto bg-brand-green-light/20 text-brand-green-dark p-4 rounded-full w-20 h-20 flex items-center justify-center">
                <AllergyIcon />
             </div>
            <h2 className="text-2xl font-bold text-brand-charcoal dark:text-brand-cream mt-5">Personalize Your Experience</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2 mb-6">Let us know about any dietary restrictions or allergies to tailor your recommendations. You can change this later.</p>
            <input
              type="text"
              value={restrictions}
              onChange={(e) => setRestrictions(e.target.value)}
              placeholder="e.g., Allergic to peanuts, gluten-free"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-brand-charcoal dark:text-brand-cream rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent outline-none transition"
              autoFocus
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in" aria-modal="true" role="dialog">
      <div className="bg-brand-cream dark:bg-brand-charcoal-light rounded-2xl shadow-xl p-8 w-full max-w-lg relative flex flex-col min-h-[450px]">
        <button onClick={onComplete} className="absolute top-4 right-4 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        
        <div className="flex-grow flex flex-col justify-center">{renderStepContent()}</div>

        <div className="mt-8">
            <div className="flex justify-center space-x-2 mb-6">
                {Array.from({ length: totalSteps }).map((_, i) => (
                    <div key={i} className={`h-2 w-2 rounded-full transition-all ${step === i + 1 ? 'w-6 bg-brand-green' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                ))}
            </div>
            
            {step === 1 ? (
                <div className="flex justify-center">
                    <button onClick={handleNext} className="w-full max-w-xs px-5 py-3 text-base font-semibold text-white bg-brand-green-dark hover:bg-brand-green-dark/90 rounded-lg transition-colors shadow">
                        I Understand & Agree
                    </button>
                </div>
            ) : (
              <div className="flex items-center justify-between">
                  <button onClick={handleBack} className="px-5 py-2.5 text-sm font-semibold text-gray-600 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors">
                      Back
                  </button>

                  {step < totalSteps ? (
                      <button onClick={handleNext} className="px-5 py-2.5 text-sm font-semibold text-white bg-brand-green-dark hover:bg-brand-green-dark/90 rounded-lg transition-colors shadow">
                          Next
                      </button>
                  ) : (
                      <button onClick={onComplete} className="px-5 py-2.5 text-sm font-semibold text-white bg-brand-green-dark hover:bg-brand-green-dark/90 rounded-lg transition-colors shadow">
                          Get Started
                      </button>
                  )}
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingModal;
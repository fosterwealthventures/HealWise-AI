import React, { useState } from 'react';
import { ModuleType, SubscriptionPlan, PlannerItem } from '../types';
import ModuleCard from './ModuleCard';
import VideoPlayerModal from './VideoPlayerModal';
import { AllergyIcon, AppleIcon, LeafIcon, PillIcon, BlenderIcon } from './icons/ModuleIcons';
import FeedbackButton from './FeedbackButton';

const modules = [
  {
    type: ModuleType.Food,
    title: 'Whole-Food Recommender',
    icon: <AppleIcon />,
    placeholder: 'Enter a health condition...',
    color: 'green',
    colorClasses: {
      button: 'bg-brand-green-dark hover:bg-brand-green-dark/90 focus:ring-brand-green',
      icon: 'bg-brand-green/10 text-brand-green-dark',
      focusRing: 'focus:ring-brand-green',
      text: 'text-brand-green-dark',
    },
  },
  {
    type: ModuleType.Herbs,
    title: 'Herbal Recommender',
    icon: <LeafIcon />,
    placeholder: 'Enter a condition or body system...',
    color: 'green',
    colorClasses: {
      button: 'bg-brand-green-dark hover:bg-brand-green-dark/90 focus:ring-brand-green',
      icon: 'bg-brand-green/10 text-brand-green-dark',
      focusRing: 'focus:ring-brand-green',
      text: 'text-brand-green-dark',
    },
  },
  {
    type: ModuleType.Meds,
    title: 'Medication Simplifier',
    icon: <PillIcon />,
    placeholder: 'Enter meds, supplements, OTCs...',
    color: 'gold',
    colorClasses: {
      button: 'bg-brand-gold hover:bg-brand-gold/90 focus:ring-amber-500',
      icon: 'bg-brand-gold/10 text-amber-600',
      focusRing: 'focus:ring-brand-gold',
      text: 'text-amber-600',
    },
  },
  {
    type: ModuleType.Recipe,
    title: 'Recipe Generator',
    icon: <BlenderIcon />,
    placeholder: 'Enter a condition or ingredient...',
    color: 'gold',
    colorClasses: {
      button: 'bg-brand-gold hover:bg-brand-gold/90 focus:ring-amber-500',
      icon: 'bg-brand-gold/10 text-amber-600',
      focusRing: 'focus:ring-brand-gold',
      text: 'text-amber-600',
    },
  },
];

interface DailyUsage {
  conditions: number;
  meds: number;
  lastReset: string; // YYYY-MM-DD
}

interface MonthlyUsage {
  analyses: number;
  lastReset: string; // YYYY-MM
}

const getInitialDailyUsage = (): DailyUsage => {
    try {
        const storedUsage = localStorage.getItem('healwiseDailyUsage');
        if (storedUsage) {
            const usageData = JSON.parse(storedUsage);
            const today = new Date().toISOString().split('T')[0];
            if (usageData.lastReset === today) {
                return usageData;
            }
        }
    } catch (error) {
        console.error("Failed to parse daily usage data from localStorage", error);
    }
    const defaultUsage = { conditions: 0, meds: 0, lastReset: new Date().toISOString().split('T')[0] };
    localStorage.setItem('healwiseDailyUsage', JSON.stringify(defaultUsage));
    return defaultUsage;
};

const getInitialMonthlyUsage = (): MonthlyUsage => {
    try {
        const storedUsage = localStorage.getItem('healwiseMonthlyUsage');
        if (storedUsage) {
            const usageData = JSON.parse(storedUsage);
            const currentMonth = new Date().toISOString().slice(0, 7); // "YYYY-MM"
            if (usageData.lastReset === currentMonth) {
                return usageData;
            }
        }
    } catch (error) {
        console.error("Failed to parse monthly usage data from localStorage", error);
    }
    const defaultUsage = { analyses: 0, lastReset: new Date().toISOString().slice(0, 7) };
    localStorage.setItem('healwiseMonthlyUsage', JSON.stringify(defaultUsage));
    return defaultUsage;
};


const RestrictionsDisplay: React.FC<{ restrictions: string; onEdit: () => void; }> = ({ restrictions, onEdit }) => (
  <div className="mb-8 p-6 bg-white dark:bg-brand-charcoal-light rounded-2xl shadow-card animate-fade-in">
    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
      <h3 className="text-lg font-bold text-brand-charcoal dark:text-brand-cream flex items-center">
        <AllergyIcon />
        <span className="ml-3">Dietary Restrictions</span>
      </h3>
      <button 
        onClick={onEdit}
        className="px-4 py-2 text-sm font-semibold text-brand-green-dark bg-brand-green/10 hover:bg-brand-green/20 dark:text-brand-green-light dark:bg-brand-green/20 dark:hover:bg-brand-green/30 rounded-lg transition-colors flex-shrink-0"
      >
        {restrictions ? 'Edit in Profile' : 'Add in Profile'}
      </button>
    </div>
    <div className="mt-3 pt-3 border-t border-gray-200/60 dark:border-gray-700/60">
      {restrictions ? (
        <p className="text-sm text-gray-600 dark:text-gray-300 italic">
          {restrictions}
        </p>
      ) : (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No restrictions set. Add your allergies or dietary needs in your profile for safer, personalized recommendations.
        </p>
      )}
    </div>
  </div>
);

const DashboardView: React.FC<{
  plan: SubscriptionPlan;
  restrictions: string;
  onAddToPlanner: (item: Omit<PlannerItem, 'id' | 'savedAt'>) => void;
  setActiveView: (view: string) => void;
}> = ({ plan, restrictions, onAddToPlanner, setActiveView }) => {
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);
  const [dailyUsage, setDailyUsage] = useState<DailyUsage>(getInitialDailyUsage);
  const [monthlyUsage, setMonthlyUsage] = useState<MonthlyUsage>(getInitialMonthlyUsage);
  const [freeTierCondition, setFreeTierCondition] = useState('');

  const limits = {
      free: { conditions: 1, meds: 1 },
      pro: { analyses: 50 },
      premium: { analyses: 100 }
  };

  const conditionsRemaining = plan === 'free' 
    ? limits.free.conditions - dailyUsage.conditions
    : limits[plan].analyses - monthlyUsage.analyses;

  const medsRemaining = plan === 'free'
    ? limits.free.meds - dailyUsage.meds
    : limits[plan].analyses - monthlyUsage.analyses;

  const handleSubmission = (itemCount: number, moduleType: ModuleType) => {
    if (plan === 'free') {
      const today = new Date().toISOString().split('T')[0];
      const newUsage = { ...dailyUsage };

      if (newUsage.lastReset !== today) {
        newUsage.conditions = 0;
        newUsage.meds = 0;
        newUsage.lastReset = today;
      }

      if (moduleType === ModuleType.Meds) {
          newUsage.meds += itemCount;
      } else {
          newUsage.conditions += itemCount;
      }

      setDailyUsage(newUsage);
      localStorage.setItem('healwiseDailyUsage', JSON.stringify(newUsage));
    } else { // pro or premium
      const currentMonth = new Date().toISOString().slice(0, 7);
      const newUsage = { ...monthlyUsage };

      if (newUsage.lastReset !== currentMonth) {
        newUsage.analyses = 0;
        newUsage.lastReset = currentMonth;
      }

      newUsage.analyses += itemCount;
      
      setMonthlyUsage(newUsage);
      localStorage.setItem('healwiseMonthlyUsage', JSON.stringify(newUsage));
    }
  };


  const handlePlayVideo = (videoId: string) => {
    setPlayingVideoId(videoId);
  };

  const handleCloseVideo = () => {
    setPlayingVideoId(null);
  };

  return (
    <>
      <div className="text-center mb-10 animate-fade-in">
        <p className="text-lg italic text-brand-green-dark dark:text-brand-green-light">
          "And its fruit shall be food, and its leaf shall be for medicine"
        </p>
        <p className="mt-2 text-sm font-medium text-gray-500 dark:text-gray-400">
          — Ezekiel 47:12
        </p>
      </div>
      
      <RestrictionsDisplay restrictions={restrictions} onEdit={() => setActiveView('profile')} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {modules.map((module) => (
          <ModuleCard
            key={module.type}
            module={module}
            plan={plan}
            restrictions={restrictions}
            onPlayVideo={handlePlayVideo}
            onSubmission={handleSubmission}
            onAddToPlanner={onAddToPlanner}
            remainingUsage={{ conditions: conditionsRemaining, meds: medsRemaining }}
            {...(plan === 'free' && module.type !== ModuleType.Meds && {
              sharedInput: freeTierCondition,
              setSharedInput: setFreeTierCondition,
            })}
          />
        ))}
      </div>

      {playingVideoId && <VideoPlayerModal videoId={playingVideoId} onClose={handleCloseVideo} />}
      <FeedbackButton />
    </>
  );
};

export default DashboardView;
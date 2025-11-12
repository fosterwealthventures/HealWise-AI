import React, { useState } from 'react';
import { ModuleType, SubscriptionPlan, PlannerItem } from '../types';
import ModuleCard from './ModuleCard';
import VideoPlayerModal from './VideoPlayerModal';
import { AllergyIcon, AppleIcon, LeafIcon, PillIcon, BlenderIcon } from './icons/ModuleIcons';
import FeedbackButton from './FeedbackButton';

const modules = [
  {
    type: ModuleType.Food,
    title: 'Whole-Food Explorer',
    icon: <AppleIcon />,
    placeholder: 'Enter a wellness focus, goal, or curiosity...',
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
    title: 'Herbal Field Notes',
    icon: <LeafIcon />,
    placeholder: 'Enter a body system, tradition, or curiosity...',
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
    title: 'Medication Decoder',
    icon: <PillIcon />,
    placeholder: 'List items from a label you want explained...',
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
    title: 'Recipe Idea Lab',
    icon: <BlenderIcon />,
    placeholder: 'Describe an ingredient, vibe, or focus...',
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
        <span className="ml-3">Ingredient Preferences &amp; Avoid List</span>
      </h3>
      <button 
        onClick={onEdit}
        className="px-4 py-2 text-sm font-semibold text-brand-green-dark bg-brand-green/10 hover:bg-brand-green/20 dark:text-brand-green-light dark:bg-brand-green/20 dark:hover:bg-brand-green/30 rounded-lg transition-colors flex-shrink-0"
      >
        {restrictions ? 'Update in Profile' : 'Add in Profile'}
      </button>
    </div>
    <div className="mt-3 pt-3 border-t border-gray-200/60 dark:border-gray-700/60">
      {restrictions ? (
        <p className="text-sm text-gray-600 dark:text-gray-300 italic">
          {restrictions}
        </p>
      ) : (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Use your profile to jot down ingredients you skip or prefer so our explainers stay aligned with your pantry.
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
  
  const scrollToModule = (moduleId: string) => {
    document.getElementById(moduleId)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const quickAccessButtons = [
    { type: ModuleType.Food, label: 'Whole-Food Explorer', icon: <AppleIcon />, id: `module-${ModuleType.Food}` },
    { type: ModuleType.Herbs, label: 'Herbal Field Notes', icon: <LeafIcon />, id: `module-${ModuleType.Herbs}` },
    { type: ModuleType.Recipe, label: 'Recipe Idea Lab', icon: <BlenderIcon />, id: `module-${ModuleType.Recipe}` },
  ];

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

      <div className="my-8 animate-fade-in">
        <h3 className="text-lg font-bold text-brand-charcoal dark:text-brand-cream mb-4">Quick Access</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {quickAccessButtons.map(btn => (
                <button
                    key={btn.id}
                    onClick={() => scrollToModule(btn.id)}
                    className="flex items-center p-4 bg-white dark:bg-brand-charcoal-light rounded-xl shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300"
                >
                    <div className={`p-2 rounded-full ${modules.find(m => m.type === btn.type)?.colorClasses.icon}`}>
                        {React.cloneElement(btn.icon, { className: 'h-5 w-5' })}
                    </div>
                    <span className="ml-3 font-semibold text-brand-charcoal dark:text-brand-cream">{btn.label}</span>
                </button>
            ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {modules.map((module) => (
          <ModuleCard
            key={module.type}
            id={`module-${module.type}`}
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

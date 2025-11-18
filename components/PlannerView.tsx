import React from 'react';
import { PlannerItem, ModuleType, SubscriptionPlan } from '../types';
import ResultsCard from './ResultsCard';
import VideoPlayerModal from './VideoPlayerModal';
import { AppleIcon, LeafIcon, PillIcon, BlenderIcon } from './icons/ModuleIcons';

const moduleInfo = {
  [ModuleType.Food]: { name: 'Food Insight', Icon: AppleIcon, color: 'text-brand-green-dark' },
  [ModuleType.Herbs]: { name: 'Herbal Note', Icon: LeafIcon, color: 'text-brand-green-dark' },
  [ModuleType.Meds]: { name: 'Medication Decoder', Icon: PillIcon, color: 'text-amber-600' },
  [ModuleType.Recipe]: { name: 'Recipe Idea', Icon: BlenderIcon, color: 'text-amber-600' },
};

const PlannerItemCard: React.FC<{
  item: PlannerItem;
  onDelete: (id: string) => void;
}> = ({ item, onDelete }) => {
  const { name, Icon, color } = moduleInfo[item.moduleType];
  const savedDate = new Date(item.savedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="bg-white dark:bg-brand-charcoal-light rounded-2xl shadow-card p-6 flex flex-col border border-gray-200/80 dark:border-gray-700">
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className={`flex items-center text-sm font-bold ${color}`}>
            <Icon />
            <span className="ml-2">{name}</span>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Saved on {savedDate}</p>
        </div>
        <button 
            onClick={() => onDelete(item.id)}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full transition-colors"
            aria-label="Delete item"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
        </button>
      </div>
      
      {(item.note || item.gratitudeNote) && (
        <div className="mb-4 p-3 bg-brand-gold/10 dark:bg-amber-900/40 rounded-lg text-sm text-amber-800 dark:text-amber-300">
          {item.note && (
            <p className="italic">
              <span className="font-semibold">Note:</span> "{item.note}"
            </p>
          )}
          {item.gratitudeNote && (
            <p className="italic mt-1">
              <span className="font-semibold">Gratitude:</span> "{item.gratitudeNote}"
            </p>
          )}
        </div>
      )}
      
      {/* This component is complex and expects many props. For this view, we can mock the ones not relevant for display. */}
      <ResultsCard 
        result={item.result}
        moduleType={item.moduleType}
        restrictions={""} // Not editable here
        onPlayVideo={() => {}} // No video playback from planner
        plan={"pro"} // Assume pro plan to show full details
        onAddToPlanner={() => {}} // No adding from planner
      />
    </div>
  );
};

const PlannerView: React.FC<{
  items: PlannerItem[];
  setItems: (items: PlannerItem[]) => void;
  showFaithEncouragement: boolean;
  plan: SubscriptionPlan;
}> = ({ items, setItems, showFaithEncouragement, plan }) => {

  const handleExport = () => {
    if (items.length === 0) {
      alert("Your planner is empty. No saved insights to export yet!");
      return;
    }

    const dataStr = JSON.stringify(items, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    const date = new Date().toISOString().split('T')[0];
    
    link.href = url;
    link.download = `HealWise_Planner_Export_${date}.json`;
    document.body.appendChild(link);
    link.click();
    
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
        setItems(items.filter(item => item.id !== id));
    }
  };

  const handleClearAll = () => {
    if (items.length > 0 && window.confirm("Are you sure you want to delete ALL items from your planner? This cannot be undone.")) {
      setItems([]);
    }
  };

  return (
    <div className="animate-fade-in">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
            <div>
                <h1 className="text-3xl font-bold text-brand-charcoal dark:text-brand-cream">My Wellness Planner</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Review, reflect, and export the learning cards you’ve saved.</p>
                {showFaithEncouragement && items.length > 0 && (
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 max-w-xl">
                    As you look back on these notes, you might jot down one small thing you&apos;re thankful for this week, or one question you hope to bring to God and to a trusted professional.
                  </p>
                )}
                {plan === 'premium' && (
                  <div className="mt-4 p-4 bg-brand-green/5 dark:bg-brand-green/10 border border-brand-green/30 rounded-xl">
                    <h2 className="text-sm font-semibold text-brand-charcoal dark:text-brand-cream">
                      Guided journaling templates (Premium)
                    </h2>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      When you have a quiet moment, you can use these simple prompts to turn your saved cards into short reflections.
                    </p>
                    <ul className="mt-3 grid gap-2 text-xs text-gray-600 dark:text-gray-300">
                      <li className="px-3 py-2 bg-white/70 dark:bg-brand-charcoal/60 rounded-lg">
                        <span className="font-semibold">Symptom + stewardship check-in:</span>{' '}
                        Today I noticed..., I tried..., it seemed to help/hurt..., next tiny step I&apos;d like to take is....
                      </li>
                      <li className="px-3 py-2 bg-white/70 dark:bg-brand-charcoal/60 rounded-lg">
                        <span className="font-semibold">Food, herbs, and gratitude:</span>{' '}
                        One small provision I&apos;m thankful for today is..., I see God&apos;s care in..., and I&apos;d like to remember....
                      </li>
                      <li className="px-3 py-2 bg-white/70 dark:bg-brand-charcoal/60 rounded-lg">
                        <span className="font-semibold">Questions for my care team:</span>{' '}
                        From these cards, I&apos;m curious about..., I&apos;m still unsure about..., and I&apos;d value my clinician&apos;s perspective on....
                      </li>
                    </ul>
                  </div>
                )}
            </div>
            <div className="flex items-center gap-x-3">
                 <button 
                    onClick={handleClearAll}
                    disabled={items.length === 0}
                    className="px-4 py-2 text-sm font-semibold text-red-600 bg-red-100 dark:bg-red-900/50 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/70 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Clear All
                </button>
                <button 
                    onClick={handleExport}
                    disabled={items.length === 0}
                    className="px-4 py-2 text-sm font-semibold text-white bg-brand-green-dark rounded-lg hover:bg-brand-green-dark/90 transition-colors shadow disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Export Planner
                </button>
            </div>
        </div>

      {items.length > 0 ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {items.map(item => (
            <PlannerItemCard key={item.id} item={item} onDelete={handleDelete} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 px-6 bg-white dark:bg-brand-charcoal-light rounded-2xl shadow-card border dark:border-gray-700">
            <div className="max-w-md mx-auto">
                <svg className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                <h2 className="mt-4 text-xl font-semibold text-brand-charcoal dark:text-brand-cream">Your Planner is Empty</h2>
                <p className="mt-2 text-gray-500 dark:text-gray-400">
                    You haven't saved any insights yet. Visit the Dashboard, explore a topic, and pin your favorite learnings to this space.
                </p>
            </div>
        </div>
      )}
    </div>
  );
};

export default PlannerView;

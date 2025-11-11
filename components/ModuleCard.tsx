import React, { useState, useCallback } from 'react';
import { ModuleType, SubscriptionPlan, ApiResult } from '../types';
import { generateRecommendation } from '../services/geminiService';
import ResultsCard from './ResultsCard';

interface ModuleConfig {
    type: ModuleType;
    title: string;
    icon: React.ReactElement;
    placeholder: string;
    color: string;
    colorClasses: {
      button: string;
      icon: string;
      focusRing: string;
      text: string;
    };
}

interface ModuleCardProps {
  module: ModuleConfig;
  plan: SubscriptionPlan;
  restrictions: string;
  onPlayVideo: (videoId: string) => void;
  onSubmission: (itemCount: number, moduleType: ModuleType) => void;
  remainingUsage: { conditions: number; meds: number };
  sharedInput?: string;
  setSharedInput?: (value: string) => void;
}

const ModuleCard: React.FC<ModuleCardProps> = ({ module, plan, restrictions, onPlayVideo, onSubmission, remainingUsage, sharedInput, setSharedInput }) => {
  const [itemInputs, setItemInputs] = useState<string[]>(['']);
  const [recipeType, setRecipeType] = useState<'Juice' | 'Smoothie' | 'Tea'>('Juice');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<ApiResult[] | null>(null);

  const isFreeRecommender = plan === 'free' && module.type !== ModuleType.Meds;

  const remaining = module.type === ModuleType.Meds ? remainingUsage.meds : remainingUsage.conditions;
  const isLimitReached = remaining <= 0;

  const maxInputsForPlan = plan === 'free' ? 1 : 10;
  const maxInputs = Math.min(maxInputsForPlan, remaining > 0 ? remaining : 0);
  
  const canAddMore = itemInputs.length < maxInputs;
  
  const handleItemInputChange = (index: number, value: string) => {
    if (isFreeRecommender) {
      setSharedInput?.(value);
    } else {
      const newInputs = [...itemInputs];
      newInputs[index] = value;
      setItemInputs(newInputs);
    }
  };

  const handleAddItem = () => {
    if (canAddMore) {
      setItemInputs([...itemInputs, '']);
    }
  };

  const handleRemoveItem = (index: number) => {
    const newInputs = itemInputs.filter((_, i) => i !== index);
    setItemInputs(newInputs);
  };

  const handleSubmit = useCallback(async () => {
    const sourceInputs = isFreeRecommender ? (sharedInput ? [sharedInput] : []) : itemInputs;
    const trimmedInputs = sourceInputs.map(m => m.trim()).filter(m => m);

    if (trimmedInputs.length === 0) {
      setError(`Please enter at least one value in an input field.`);
      return;
    }
    
    if (trimmedInputs.length > remaining) {
        const overage = trimmedInputs.length - remaining;
        const period = plan === 'free' ? 'day' : 'month';
        setError(`Submission limit exceeded. You are trying to analyze ${trimmedInputs.length} items, but you only have ${remaining} ${remaining === 1 ? 'analysis' : 'analyses'} remaining this ${period}. Please remove ${overage} item${overage > 1 ? 's' : ''} to proceed.`);
        return;
    }

    setIsLoading(true);
    setError(null);
    setResults(null);

    const finalInputString = trimmedInputs.join(', ');

    try {
      const data = await generateRecommendation<ApiResult[]>(module.type, finalInputString, restrictions, module.type === ModuleType.Recipe ? recipeType : undefined);
      setResults(data);
      onSubmission(trimmedInputs.length, module.type);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [itemInputs, module.type, plan, recipeType, restrictions, onSubmission, isFreeRecommender, sharedInput, remaining]);
  
  const { icon, title, placeholder, colorClasses } = module;
  const selectedColor = colorClasses;

  return (
    <div className="bg-white rounded-2xl shadow-card p-6 flex flex-col min-h-[400px]">
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${selectedColor.icon}`}>
            {React.cloneElement(icon, { className: 'h-6 w-6' })}
        </div>
        <h3 className="ml-4 text-xl font-bold text-brand-charcoal">{title}</h3>
      </div>
      
      <div className="mt-6 flex-grow flex flex-col">
        {results ? (
          <div className="animate-fade-in-up">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-semibold text-brand-charcoal">AI Recommendations</h4>
              <button onClick={() => setResults(null)} className="text-sm font-medium text-brand-green-dark hover:underline">New Search</button>
            </div>
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              {results.map((result, index) => (
                <ResultsCard key={index} result={result} moduleType={module.type} restrictions={restrictions} onPlayVideo={onPlayVideo} plan={plan} />
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className="flex-grow space-y-3">
              {itemInputs.map((item, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={isFreeRecommender ? sharedInput ?? '' : item}
                    onChange={(e) => handleItemInputChange(index, e.target.value)}
                    placeholder={placeholder}
                    className={`flex-grow w-full px-4 py-3 text-base border border-gray-200 rounded-lg bg-gray-50 focus:ring-2 ${selectedColor.focusRing} focus:border-transparent outline-none transition`}
                    disabled={isLoading || isLimitReached}
                  />
                  {plan !== 'free' && itemInputs.length > 1 && (
                    <button onClick={() => handleRemoveItem(index)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-100 rounded-full transition-colors" disabled={isLoading}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg>
                    </button>
                  )}
                </div>
              ))}
               {plan !== 'free' && canAddMore && (
                  <button onClick={handleAddItem} className="text-sm font-medium text-brand-green-dark hover:underline" disabled={isLoading || isLimitReached}>
                    + Add another item (up to {maxInputsForPlan})
                  </button>
                )}
            </div>

            {module.type === ModuleType.Recipe && (
              <div className="mt-4">
                <div className="flex space-x-2">
                  {(['Juice', 'Smoothie', 'Tea'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setRecipeType(type)}
                      className={`px-4 py-2 text-sm font-semibold rounded-full transition-all duration-200 ${recipeType === type ? `${selectedColor.button} text-white shadow-md` : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
                      disabled={isLoading || isLimitReached}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <div className="mt-6">
        {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg" role="alert">
                <p><strong className="font-semibold">Error:</strong> {error}</p>
            </div>
        )}
        <button
            onClick={handleSubmit}
            className={`w-full py-3 text-white font-bold rounded-lg shadow-lg transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:scale-100 ${selectedColor.button}`}
            disabled={isLoading || isLimitReached}
        >
          {isLoading ? (
            <svg className="animate-spin h-5 w-5 text-white mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : isLimitReached ? 'Usage limit reached' : 'Get Recommendations'}
        </button>
        <p className="text-center text-xs text-gray-400 mt-2">
            Analyses remaining this {plan === 'free' ? 'day' : 'month'}: {remaining < 0 ? 0 : remaining}
        </p>
      </div>
    </div>
  );
};

export default ModuleCard;
import React, { useState } from 'react';
import { ApiResult, ModuleType, FoodResult, MedsAnalysisResult, HerbResult, RecipeResult, SubscriptionPlan, PlannerItem } from '../types';
import { generateRecipeVariation, explainResultForKids } from '../services/geminiService';
import { BookOpenIcon, BookmarkIcon, YoutubeIcon, WarningIcon } from './icons/ActionIcons';
import { getHerbVideoId } from '../lib/herbVideos';

interface ResultsCardProps {
  result: ApiResult;
  moduleType: ModuleType;
  restrictions: string;
  onPlayVideo: (videoId: string) => void;
  plan: SubscriptionPlan;
  onAddToPlanner: (item: Omit<PlannerItem, 'id' | 'savedAt'>) => void;
}

const DetailsDrawer: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="mt-3 p-4 bg-gray-50/80 dark:bg-gray-700/50 rounded-lg border border-gray-200/60 dark:border-gray-600/60">
        {children}
    </div>
);

const RecipeCard: React.FC<{
    item: RecipeResult;
    restrictions: string;
    plan: SubscriptionPlan;
    onAddToPlanner: (item: Omit<PlannerItem, 'id' | 'savedAt'>) => void;
    moduleType: ModuleType;
}> = ({ item, restrictions, plan, onAddToPlanner, moduleType }) => {
    const [currentRecipe, setCurrentRecipe] = useState<RecipeResult>(item);
    const [variationPrompt, setVariationPrompt] = useState('');
    const [isVarying, setIsVarying] = useState(false);
    const [variationError, setVariationError] = useState<string | null>(null);
    
    const [isSaving, setIsSaving] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [note, setNote] = useState('');
    const [gratitudeNote, setGratitudeNote] = useState('');

    const handleSaveClick = () => setIsSaving(true);
    const handleCancelSave = () => { setIsSaving(false); setNote(''); setGratitudeNote(''); };
    const handleConfirmSave = () => {
        try {
            onAddToPlanner({
                moduleType,
                result: currentRecipe,
                note,
                gratitudeNote,
            });
            setIsSaved(true);
            setTimeout(() => setIsSaved(false), 2500);
        } catch (error) {
            console.error("Failed to save item to planner:", error);
            alert("There was an error saving your item. Please try again.");
        } finally {
            handleCancelSave();
        }
    };


    const handleVariationSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!variationPrompt.trim()) return;

        setIsVarying(true);
        setVariationError(null);
        try {
            const newRecipe = await generateRecipeVariation(currentRecipe, variationPrompt, restrictions);
            setCurrentRecipe(newRecipe);
            setVariationPrompt('');
        } catch (err: any) {
            setVariationError(err.message || 'Failed to generate variation. Please try again.');
        } finally {
            setIsVarying(false);
        }
    };
    
  return (
    <>
      <div className="flex justify-between items-start">
          <div>
              <h4 className="font-bold text-amber-600 dark:text-amber-400">{currentRecipe.recipeName}</h4>
              <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase">{currentRecipe.recipeType}</span>
          </div>
      </div>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{currentRecipe.description}</p>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <div>
              <h5 className="font-semibold text-brand-charcoal dark:text-brand-cream mb-2">Ingredients</h5>
              <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300 space-y-1">
                  {currentRecipe.ingredients.map((ing, i) => <li key={i}>{ing}</li>)}
              </ul>
          </div>
          <div>
              <h5 className="font-semibold text-brand-charcoal dark:text-brand-cream mb-2">Instructions</h5>
              <ol className="list-decimal list-inside text-sm text-gray-700 dark:text-gray-300 space-y-2">
                  {currentRecipe.instructions.map((step, i) => <li key={i}>{step}</li>)}
              </ol>
          </div>
      </div>
      <div className="mt-6 pt-4 border-t border-gray-200/80 dark:border-gray-700">
            <h5 className="font-semibold text-brand-charcoal dark:text-brand-cream mb-2">Request a Variation</h5>
            <form onSubmit={handleVariationSubmit} className="flex items-center space-x-2">
                <input
                    type="text"
                    value={variationPrompt}
                    onChange={(e) => setVariationPrompt(e.target.value)}
                    placeholder="e.g., Make it spicier, add protein..."
                    className="flex-grow w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-brand-charcoal focus:ring-1 focus:ring-brand-gold focus:border-transparent outline-none transition dark:text-brand-cream"
                    disabled={isVarying}
                    aria-label="Request a recipe variation"
                />
                <button
                    type="submit"
                    className="px-4 h-full text-sm font-semibold bg-brand-gold text-white rounded-lg shadow-sm hover:bg-brand-gold/90 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center w-24"
                    disabled={isVarying || !variationPrompt.trim()}
                >
                    {isVarying ? (
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : 'Update'}
                </button>
            </form>
            {variationError && (
                <div className="mt-2 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg dark:bg-red-900/50 dark:border-red-700/60 dark:text-red-300" role="alert">
                    <p><strong className="font-semibold">Error:</strong> {variationError}</p>
                </div>
            )}
        </div>
         {(plan === 'pro' || plan === 'premium') && (
            <div className="mt-4 pt-4 border-t border-dashed border-gray-200/80 dark:border-gray-700/60">
            {isSaving ? (
                <div className="w-full flex flex-col sm:flex-row gap-2 animate-fade-in">
                    <input
                        type="text"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Add a note (e.g., 'Try this weekend')..."
                        className="flex-grow w-full px-3 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-md focus:ring-1 focus:ring-brand-green focus:border-brand-green outline-none transition bg-white dark:bg-brand-charcoal dark:text-brand-cream"
                        aria-label="Note for planner"
                        autoFocus
                    />
                    <input
                        type="text"
                        value={gratitudeNote}
                        onChange={(e) => setGratitudeNote(e.target.value)}
                        placeholder="Optional gratitude note (e.g., 'Thankful for the chance to try this')..."
                        className="flex-grow w-full px-3 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-md focus:ring-1 focus:ring-brand-green focus:border-brand-green outline-none transition bg-white dark:bg-brand-charcoal dark:text-brand-cream"
                        aria-label="Optional gratitude note for planner"
                    />
                    <button onClick={handleCancelSave} className="px-3 py-1.5 text-xs font-semibold bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">
                        Cancel
                    </button>
                    <button onClick={handleConfirmSave} className="px-3 py-1.5 text-xs font-semibold bg-brand-green text-white rounded-md hover:bg-brand-green/90 transition-colors">
                        Confirm Save
                    </button>
                </div>
            ) : (
                <div className="flex items-center justify-end">
                    {isSaved ? (
                        <div className="flex items-center space-x-1.5 text-xs font-medium text-brand-green dark:text-brand-green-light">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                            <span>Saved!</span>
                        </div>
                    ) : (
                        <button onClick={handleSaveClick} className="flex items-center space-x-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-brand-green-dark dark:hover:text-brand-green-light transition-colors">
                            <BookmarkIcon />
                            <span>Save to Planner</span>
                        </button>
                    )}
                </div>
            )}
            </div>
        )}
    </>
  );
};

const MedsAnalysisCard: React.FC<{ item: MedsAnalysisResult }> = ({ item }) => (
    <div>
        <h4 className="font-bold text-amber-600 dark:text-amber-400 text-lg mb-4">Medication Decoder</h4>

        <div className="mb-4 p-3 rounded-lg bg-amber-50 border border-amber-300 text-xs text-amber-900 dark:bg-amber-900/40 dark:border-amber-700 dark:text-amber-100 flex items-start">
            <WarningIcon />
            <p className="ml-2">
              Educational use only. This decoder is for studying how labels and ingredients are discussed in reputable sources. It does not diagnose, treat, prescribe, or tell you what to start, stop, or change. Always talk with a licensed clinician or pharmacist about decisions for your own care.
            </p>
        </div>

        {item.allergyWarnings && item.allergyWarnings.length > 0 && (
            <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/50 border border-amber-200 dark:border-amber-800/60 rounded-lg">
                <h5 className="font-semibold text-amber-800 dark:text-amber-300 flex items-center mb-3">
                    <WarningIcon />
                    <span className="ml-2">Ingredient &amp; Allergy Flags</span>
                </h5>
                <div className="space-y-3">
                    {item.allergyWarnings.map((warning, i) => (
                        <div key={i} className="text-sm">
                            <p className="font-semibold text-amber-900 dark:text-amber-200">{warning.medicationName} (contains <span className="italic">{warning.conflictingIngredient}</span>)</p>
                            <p className="text-gray-700 dark:text-gray-300">{warning.warning}</p>
                        </div>
                    ))}
                </div>
            </div>
        )}

        <div className="mb-6">
            <h5 className="font-semibold text-brand-charcoal dark:text-brand-cream mb-3 border-b dark:border-gray-700 pb-2">Individual Labels</h5>
            <div className="space-y-4">
                {item.individualMedications.map((med, i) => (
                    <div key={i} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <p className="font-semibold text-brand-charcoal dark:text-brand-cream">{med.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1"><strong className="text-gray-700 dark:text-gray-200">How it affects the body (learning summary):</strong> {med.howItWorks}</p>
                        <div className="mt-2">
                            <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">Commonly Noted Effects:</p>
                            <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-300 pl-2">
                                {med.commonSideEffects.map((effect, j) => <li key={j}>{effect}</li>)}
                            </ul>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        <div>
            <h5 className="font-semibold text-brand-charcoal dark:text-brand-cream mb-3 border-b dark:border-gray-700 pb-2">Ingredient &amp; Interaction Notes</h5>
            {item.interactionAnalysis && item.interactionAnalysis.length > 0 ? (
                <div className="space-y-4">
                    {item.interactionAnalysis.map((interaction, i) => (
                        <div key={i} className="p-3 bg-amber-50 dark:bg-amber-900/50 border border-amber-200 dark:border-amber-800/60 rounded-lg">
                            <p className="font-semibold text-amber-800 dark:text-amber-300">Interaction: {interaction.medications.join(' + ')}</p>
                            <p className="text-sm text-gray-700 dark:text-gray-300 mt-1"><strong className="text-amber-900 dark:text-amber-200">Effects on Body:</strong> {interaction.effectsOnBody}</p>
                            <p className="text-sm text-gray-700 dark:text-gray-300 mt-2"><strong className="text-amber-900 dark:text-amber-200">Study Summary:</strong> <span className="italic">"{interaction.studySummary}"</span></p>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-sm text-gray-600 dark:text-gray-300 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">No notable overlaps surfaced in this educational review of the items you listed.</p>
            )}
        </div>
    </div>
);

const ResultsCard: React.FC<ResultsCardProps> = ({ result, moduleType, restrictions, onPlayVideo, plan, onAddToPlanner }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [showKidsExplanation, setShowKidsExplanation] = useState(false);
  const [kidsExplanation, setKidsExplanation] = useState<string | null>(null);
  const [isLoadingKids, setIsLoadingKids] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [note, setNote] = useState('');
  const [gratitudeNote, setGratitudeNote] = useState('');
  
  const handleSaveClick = () => {
    setIsSaving(true);
  };

  const handleCancelSave = () => {
    setIsSaving(false);
    setNote('');
    setGratitudeNote('');
  };

  const handleConfirmSave = () => {
    try {
        onAddToPlanner({
            moduleType,
            result,
            note,
            gratitudeNote,
        });
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2500);
    } catch (error) {
        console.error("Failed to save item to planner:", error);
        alert("There was an error saving your item. Please try again.");
    } finally {
        handleCancelSave();
    }
  };

  const handleToggleKidsExplanation = async () => {
    if (showKidsExplanation) {
      setShowKidsExplanation(false);
      return;
    }

    if (kidsExplanation) {
      setShowKidsExplanation(true);
      return;
    }

    try {
      setIsLoadingKids(true);

      let content = '';
      if (moduleType === ModuleType.Food) {
        const item = result as FoodResult;
        content = `${item.name}: ${item.description}. Study summary: ${item.studySummary}. Stewardship note: ${item.stewardshipNote}`;
      } else if (moduleType === ModuleType.Herbs) {
        const item = result as HerbResult;
        content = `${item.name}: ${item.benefits}. Study citation summary: ${item.studyCitation}`;
      } else if (moduleType === ModuleType.Meds) {
        const item = result as MedsAnalysisResult;
        const medsNames = item.individualMedications.map((m) => m.name).join(', ');
        content = `These items are being decoded: ${medsNames}. This card explains how they generally work in the body, common side effects, and any ingredient flags from your avoid list.`;
      } else if (moduleType === ModuleType.Recipe) {
        const item = result as RecipeResult;
        content = `Recipe "${item.recipeName}": ${item.description}. Ingredients: ${item.ingredients.join(', ')}.`;
      }

      const simplified = await explainResultForKids(moduleType, content);
      setKidsExplanation(simplified);
      setShowKidsExplanation(true);
    } catch (error) {
      console.error('Failed to load kid-friendly explanation', error);
      alert('Sorry, we could not simplify this explanation right now. Please try again.');
    } finally {
      setIsLoadingKids(false);
    }
  };

  const renderContent = () => {
    switch (moduleType) {
      case ModuleType.Food: {
        const item = result as FoodResult;
        return (
          <>
            <h4 className="font-bold text-brand-green-dark dark:text-brand-green-light">{item.name}</h4>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{item.description}</p>
            {showDetails && <DetailsDrawer>
                <>
                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                      Study Summary
                      <span className="ml-1 text-[10px] font-normal text-gray-400 dark:text-gray-500">
                        (a short takeaway from a research source)
                      </span>
                      :
                    </p>
                    <p className="mt-1 text-xs text-gray-600 dark:text-gray-300 italic">"{item.studySummary}"</p>
                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-200 mt-3">
                      Stewardship Note
                      <span className="ml-1 text-[10px] font-normal text-gray-400 dark:text-gray-500">
                        (a reflection on caring for body, budget, and creation)
                      </span>
                      :
                    </p>
                    <p className="mt-1 text-xs text-gray-600 dark:text-gray-300">{item.stewardshipNote}</p>
                </>
            </DetailsDrawer>}
          </>
        );
      }
      case ModuleType.Herbs: {
        const item = result as HerbResult;
        const videoId = getHerbVideoId(item.name);
        return (
          <>
            <h4 className="font-bold text-brand-green-dark dark:text-brand-green-light">{item.name}</h4>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{item.benefits}</p>
            {videoId && (
              <button 
                onClick={() => onPlayVideo(videoId)} 
                className="mt-2 inline-flex items-center text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
              >
                  <YoutubeIcon /> Watch on YouTube
              </button>
            )}
            {showDetails && <DetailsDrawer>
                 <p className="text-xs text-gray-600 dark:text-gray-300 italic">
                   Citation (where this idea shows up in the literature or a trusted source): {item.studyCitation}
                 </p>
            </DetailsDrawer>}
          </>
        );
      }
      case ModuleType.Meds: {
        return <MedsAnalysisCard item={result as MedsAnalysisResult} />;
      }
      case ModuleType.Recipe: {
        return <RecipeCard item={result as RecipeResult} restrictions={restrictions} plan={plan} onAddToPlanner={onAddToPlanner} moduleType={moduleType} />;
      }
      default:
        return null;
    }
  };

  const hasDetails = moduleType === ModuleType.Food || moduleType === ModuleType.Herbs;
  const showGenericActions =
    moduleType === ModuleType.Food ||
    moduleType === ModuleType.Herbs ||
    moduleType === ModuleType.Meds;

  return (
    <div className="p-5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200/80 dark:border-gray-700/80 shadow-sm animate-fade-in flex flex-col">
        <div className="flex-grow">
          {renderContent()}
          {showKidsExplanation && kidsExplanation && (
            <DetailsDrawer>
              <p className="text-xs font-semibold text-gray-700 dark:text-gray-200 mb-1">Kid-friendly explanation</p>
              <p className="text-xs text-gray-600 dark:text-gray-300">{kidsExplanation}</p>
            </DetailsDrawer>
          )}
        </div>

        {showGenericActions && (
            <>
                {isSaving && (
                    <div className="mt-4 pt-4 border-t border-gray-200/80 dark:border-gray-700">
                        <div className="w-full flex flex-col sm:flex-row gap-2 animate-fade-in">
                            <input
                                type="text"
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder="Add a note (e.g., 'Try this weekend')..."
                                className="flex-grow w-full px-3 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-md focus:ring-1 focus:ring-brand-green focus:border-brand-green outline-none transition bg-white dark:bg-brand-charcoal dark:text-brand-cream"
                                aria-label="Note for planner"
                                autoFocus
                            />
                            <input
                                type="text"
                                value={gratitudeNote}
                                onChange={(e) => setGratitudeNote(e.target.value)}
                                placeholder="Optional gratitude note (e.g., 'Thankful for energy to explore this')..."
                                className="flex-grow w-full px-3 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-md focus:ring-1 focus:ring-brand-green focus:border-brand-green outline-none transition bg-white dark:bg-brand-charcoal dark:text-brand-cream"
                                aria-label="Optional gratitude note for planner"
                            />
                            <button onClick={handleCancelSave} className="px-3 py-1.5 text-xs font-semibold bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">
                                Cancel
                            </button>
                            <button onClick={handleConfirmSave} className="px-3 py-1.5 text-xs font-semibold bg-brand-green text-white rounded-md hover:bg-brand-green/90 transition-colors">
                                Confirm Save
                            </button>
                        </div>
                    </div>
                )}

                {!isSaving && (
                    <>
                        <div className="mt-4 h-px bg-gray-200/80 dark:bg-gray-700"></div>
                        <div className="mt-3 flex items-center justify-between space-x-3">
                            <button
                              type="button"
                              onClick={handleToggleKidsExplanation}
                              className="flex items-center space-x-1 text-[11px] font-medium text-gray-400 dark:text-gray-500 hover:text-brand-green-dark dark:hover:text-brand-green-light transition-colors"
                            >
                              <span>{isLoadingKids ? 'Preparing kid-friendly view…' : showKidsExplanation ? 'Hide kid-friendly view' : 'Explain this in kid-friendly language'}</span>
                            </button>
                            {hasDetails && (
                                <button onClick={() => setShowDetails(!showDetails)} className="flex items-center space-x-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-brand-green-dark dark:hover:text-brand-green-light transition-colors">
                                    <BookOpenIcon />
                                    <span>{showDetails ? 'Hide Details' : 'View Details'}</span>
                                </button>
                            )}
                            {(plan === 'pro' || plan === 'premium') && (
                                <>
                                    {isSaved ? (
                                        <div className="flex items-center space-x-1.5 text-xs font-medium text-brand-green dark:text-brand-green-light">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                            <span>Saved!</span>
                                        </div>
                                    ) : (
                                        <button onClick={handleSaveClick} className="flex items-center space-x-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-brand-green-dark dark:hover:text-brand-green-light transition-colors">
                                            <BookmarkIcon />
                                            <span>Save to Planner</span>
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                        <p className="mt-2 text-[10px] leading-snug text-gray-400 dark:text-gray-500">
                          This explanation was generated by an AI model using HealWise&apos;s educational prompts and your ingredient preferences. It is for learning only and is not a diagnosis, treatment plan, or medical advice.
                        </p>
                    </>
                )}
            </>
        )}
    </div>
  );
};

export default ResultsCard;

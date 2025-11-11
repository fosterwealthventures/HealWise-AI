import React, { useState } from 'react';
import { ApiResult, ModuleType, FoodResult, MedsAnalysisResult, HerbResult, RecipeResult, SubscriptionPlan, PlannerItem } from '../types';
import { generateRecipeVariation } from '../services/geminiService';
import { BookOpenIcon, BookmarkIcon, YoutubeIcon, WarningIcon } from './icons/ActionIcons';

interface ResultsCardProps {
  result: ApiResult;
  moduleType: ModuleType;
  restrictions: string;
  onPlayVideo: (videoId: string) => void;
  plan: SubscriptionPlan;
}

// Utility function to extract video ID from YouTube URL
const getYouTubeId = (url: string): string | null => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};


const DetailsDrawer: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="mt-3 p-4 bg-gray-50/80 rounded-lg border border-gray-200/60">
        {children}
    </div>
);

const RecipeCard: React.FC<{ item: RecipeResult; restrictions: string }> = ({ item, restrictions }) => {
    const [currentRecipe, setCurrentRecipe] = useState<RecipeResult>(item);
    const [variationPrompt, setVariationPrompt] = useState('');
    const [isVarying, setIsVarying] = useState(false);
    const [variationError, setVariationError] = useState<string | null>(null);

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
              <h4 className="font-bold text-amber-600">{currentRecipe.recipeName}</h4>
              <span className="text-xs font-semibold text-gray-400 uppercase">{currentRecipe.recipeType}</span>
          </div>
      </div>
      <p className="mt-2 text-sm text-gray-600">{currentRecipe.description}</p>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <div>
              <h5 className="font-semibold text-brand-charcoal mb-2">Ingredients</h5>
              <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                  {currentRecipe.ingredients.map((ing, i) => <li key={i}>{ing}</li>)}
              </ul>
          </div>
          <div>
              <h5 className="font-semibold text-brand-charcoal mb-2">Instructions</h5>
              <ol className="list-decimal list-inside text-sm text-gray-700 space-y-2">
                  {currentRecipe.instructions.map((step, i) => <li key={i}>{step}</li>)}
              </ol>
          </div>
      </div>
      <div className="mt-6 pt-4 border-t border-gray-200/80">
            <h5 className="font-semibold text-brand-charcoal mb-2">Request a Variation</h5>
            <form onSubmit={handleVariationSubmit} className="flex items-center space-x-2">
                <input
                    type="text"
                    value={variationPrompt}
                    onChange={(e) => setVariationPrompt(e.target.value)}
                    placeholder="e.g., Make it spicier, add protein..."
                    className="flex-grow w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:ring-1 focus:ring-brand-gold focus:border-transparent outline-none transition"
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
                <div className="mt-2 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg" role="alert">
                    <p><strong className="font-semibold">Error:</strong> {variationError}</p>
                </div>
            )}
        </div>
    </>
  );
};

const MedsAnalysisCard: React.FC<{ item: MedsAnalysisResult }> = ({ item }) => (
    <div>
        <h4 className="font-bold text-amber-600 text-lg mb-4">Medication Analysis</h4>

        {item.allergyWarnings && item.allergyWarnings.length > 0 && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <h5 className="font-semibold text-amber-800 flex items-center mb-3">
                    <WarningIcon />
                    <span className="ml-2">Potential Ingredient & Allergy Warnings</span>
                </h5>
                <div className="space-y-3">
                    {item.allergyWarnings.map((warning, i) => (
                        <div key={i} className="text-sm">
                            <p className="font-semibold text-amber-900">{warning.medicationName} (contains <span className="italic">{warning.conflictingIngredient}</span>)</p>
                            <p className="text-gray-700">{warning.warning}</p>
                        </div>
                    ))}
                </div>
            </div>
        )}

        <div className="mb-6">
            <h5 className="font-semibold text-brand-charcoal mb-3 border-b pb-2">Individual Medications</h5>
            <div className="space-y-4">
                {item.individualMedications.map((med, i) => (
                    <div key={i} className="p-3 bg-gray-50 rounded-lg">
                        <p className="font-semibold text-brand-charcoal">{med.name}</p>
                        <p className="text-sm text-gray-600 mt-1"><strong className="text-gray-700">How it works:</strong> {med.howItWorks}</p>
                        <div className="mt-2">
                            <p className="text-sm font-semibold text-gray-700">Common Side Effects:</p>
                            <ul className="list-disc list-inside text-sm text-gray-600 pl-2">
                                {med.commonSideEffects.map((effect, j) => <li key={j}>{effect}</li>)}
                            </ul>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        <div>
            <h5 className="font-semibold text-brand-charcoal mb-3 border-b pb-2">Interaction Analysis</h5>
            {item.interactionAnalysis && item.interactionAnalysis.length > 0 ? (
                <div className="space-y-4">
                    {item.interactionAnalysis.map((interaction, i) => (
                        <div key={i} className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                            <p className="font-semibold text-amber-800">Interaction: {interaction.medications.join(' + ')}</p>
                            <p className="text-sm text-gray-700 mt-1"><strong className="text-amber-900">Effects on Body:</strong> {interaction.effectsOnBody}</p>
                            <p className="text-sm text-gray-700 mt-2"><strong className="text-amber-900">Study Summary:</strong> <span className="italic">"{interaction.studySummary}"</span></p>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-sm text-gray-600 p-3 bg-gray-50 rounded-lg">No significant interactions were found between the specified medications based on available data.</p>
            )}
        </div>
    </div>
);

const ResultsCard: React.FC<ResultsCardProps> = ({ result, moduleType, restrictions, onPlayVideo, plan }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [note, setNote] = useState('');
  
  const handleSaveClick = () => {
    setIsSaving(true);
  };

  const handleCancelSave = () => {
    setIsSaving(false);
    setNote('');
  };

  const handleConfirmSave = () => {
    try {
        const existingItems: PlannerItem[] = JSON.parse(localStorage.getItem('healwisePlannerItems') || '[]');
        const newItem: PlannerItem = {
            id: `${moduleType}-${new Date().getTime()}`,
            savedAt: new Date().toISOString(),
            moduleType,
            result,
            note,
        };
        const updatedItems = [...existingItems, newItem];
        localStorage.setItem('healwisePlannerItems', JSON.stringify(updatedItems));
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2500);
    } catch (error) {
        console.error("Failed to save item to planner:", error);
        alert("There was an error saving your item. Please try again.");
    } finally {
        handleCancelSave();
    }
  };

  const renderContent = () => {
    switch (moduleType) {
      case ModuleType.Food: {
        const item = result as FoodResult;
        return (
          <>
            <h4 className="font-bold text-brand-green-dark">{item.name}</h4>
            <p className="mt-1 text-sm text-gray-600">{item.description}</p>
            {showDetails && <DetailsDrawer>
                <>
                    <p className="text-xs font-semibold text-gray-700">Study Summary:</p>
                    <p className="mt-1 text-xs text-gray-600 italic">"{item.studySummary}"</p>
                    <p className="text-xs font-semibold text-gray-700 mt-3">Stewardship Note:</p>
                    <p className="mt-1 text-xs text-gray-600">{item.stewardshipNote}</p>
                </>
            </DetailsDrawer>}
          </>
        );
      }
      case ModuleType.Herbs: {
        const item = result as HerbResult;
        const videoId = item.youtubeLink ? getYouTubeId(item.youtubeLink) : null;
        return (
          <>
            <h4 className="font-bold text-brand-green-dark">{item.name}</h4>
            <p className="mt-1 text-sm text-gray-600">{item.benefits}</p>
            {videoId && (
              <button 
                onClick={() => onPlayVideo(videoId)} 
                className="mt-2 inline-flex items-center text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
              >
                  <YoutubeIcon /> Watch on YouTube
              </button>
            )}
            {showDetails && <DetailsDrawer>
                 <p className="text-xs text-gray-600 italic">Citation: {item.studyCitation}</p>
            </DetailsDrawer>}
          </>
        );
      }
      case ModuleType.Meds: {
        return <MedsAnalysisCard item={result as MedsAnalysisResult} />;
      }
      case ModuleType.Recipe: {
        return <RecipeCard item={result as RecipeResult} restrictions={restrictions} />;
      }
      default:
        return null;
    }
  };

  const hasDetails = moduleType === ModuleType.Food || moduleType === ModuleType.Herbs;
  const isMedOrRecipe = moduleType === ModuleType.Meds || moduleType === ModuleType.Recipe;

  return (
    <div className="p-5 bg-white rounded-xl border border-gray-200/80 shadow-sm animate-fade-in flex flex-col">
        <div className="flex-grow">{renderContent()}</div>
        
        {isSaving && (
          <div className="mt-4 pt-4 border-t border-gray-200/80">
            <div className="w-full flex items-center space-x-2 animate-fade-in">
                <input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Add a note (e.g., 'Try this weekend')..."
                    className="flex-grow w-full px-3 py-1.5 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-brand-green focus:border-brand-green outline-none transition"
                    aria-label="Note for planner"
                    autoFocus
                />
                <button onClick={handleCancelSave} className="px-3 py-1.5 text-xs font-semibold bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors">
                    Cancel
                </button>
                <button onClick={handleConfirmSave} className="px-3 py-1.5 text-xs font-semibold bg-brand-green text-white rounded-md hover:bg-brand-green/90 transition-colors">
                    Confirm Save
                </button>
            </div>
          </div>
        )}

        {!isSaving && !isMedOrRecipe && <div className="mt-4 h-px bg-gray-200/80"></div>}
        
        {!isSaving &&
          <div className="mt-3 flex items-center justify-end space-x-3">
              {hasDetails && (
                <button onClick={() => setShowDetails(!showDetails)} className="flex items-center space-x-1.5 text-xs font-medium text-gray-500 hover:text-brand-green-dark transition-colors">
                    <BookOpenIcon />
                    <span>{showDetails ? 'Hide Details' : 'View Details'}</span>
                </button>
              )}
              {(plan === 'pro' || plan === 'premium') && (
                <>
                  {isSaved ? (
                    <div className="flex items-center space-x-1.5 text-xs font-medium text-brand-green">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                        <span>Saved!</span>
                    </div>
                  ) : (
                    <button onClick={handleSaveClick} className="flex items-center space-x-1.5 text-xs font-medium text-gray-500 hover:text-brand-green-dark transition-colors">
                      <BookmarkIcon />
                      <span>Save to Planner</span>
                    </button>
                  )}
                </>
              )}
          </div>
        }
    </div>
  );
};

export default ResultsCard;
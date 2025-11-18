import React from 'react';

interface ProfileViewProps {
  restrictions: string;
  setRestrictions: (value: string) => void;
  showFaithEncouragement: boolean;
  setShowFaithEncouragement: (value: boolean) => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({
  restrictions,
  setRestrictions,
  showFaithEncouragement,
  setShowFaithEncouragement,
}) => {
  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-brand-charcoal dark:text-brand-cream">User Profile</h1>
      <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your personal information and preferences.</p>

      <div className="mt-8 p-6 bg-white dark:bg-brand-charcoal-light rounded-2xl shadow-card">
        <h3 className="text-xl font-bold text-brand-charcoal dark:text-brand-cream">
          Ingredient Preferences &amp; Avoid List
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          Capture the ingredients you prefer to spotlight—or skip—so HealWise can keep its learning prompts aligned with your pantry and values.
        </p>
        <textarea
          value={restrictions}
          onChange={(e) => setRestrictions(e.target.value)}
          placeholder="e.g., Prefer gluten-free grains, skip peanuts, leaning plant-based this season..."
          className="mt-4 w-full h-32 px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-brand-charcoal focus:ring-2 focus:ring-brand-green focus:border-transparent outline-none transition dark:placeholder-gray-500 dark:text-brand-cream resize-y"
          aria-label="Ingredient preferences and avoid list"
        />
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 text-right">
          Changes are saved automatically on this device.
        </p>
      </div>

      <div className="mt-6 p-6 bg-white dark:bg-brand-charcoal-light rounded-2xl shadow-card">
        <h3 className="text-xl font-bold text-brand-charcoal dark:text-brand-cream">
          Faith-Based Encouragement
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          When this is on, HealWise will occasionally surface gentle prompts around gratitude, stewardship, and hope from a biblical perspective&mdash;always as invitations, never as prescriptions or replacements for professional care.
        </p>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-sm text-gray-700 dark:text-gray-200">
            Show faith-based encouragement in the app
          </span>
          <button
            type="button"
            onClick={() => setShowFaithEncouragement(!showFaithEncouragement)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              showFaithEncouragement ? 'bg-brand-green' : 'bg-gray-300 dark:bg-gray-600'
            }`}
            aria-pressed={showFaithEncouragement}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                showFaithEncouragement ? 'translate-x-5' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
        <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
          You can turn this off at any time if you prefer a more neutral learning space.
        </p>
      </div>
    </div>
  );
};

export default ProfileView;

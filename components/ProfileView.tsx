import React from 'react';

interface ProfileViewProps {
  restrictions: string;
  setRestrictions: (value: string) => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ restrictions, setRestrictions }) => {
  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-brand-charcoal dark:text-brand-cream">User Profile</h1>
      <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your personal information and preferences.</p>

      <div className="mt-8 p-6 bg-white dark:bg-brand-charcoal-light rounded-2xl shadow-card">
        <h3 className="text-xl font-bold text-brand-charcoal dark:text-brand-cream">
          Dietary Restrictions & Allergies
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          List any items you need to avoid (e.g., foods, ingredients, allergens). All AI recommendations will exclude these to ensure they are tailored and safe for you.
        </p>
        <textarea
          value={restrictions}
          onChange={(e) => setRestrictions(e.target.value)}
          placeholder="e.g., Allergic to peanuts, gluten-free, no shellfish, avoid lactose..."
          className="mt-4 w-full h-32 px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-brand-charcoal focus:ring-2 focus:ring-brand-green focus:border-transparent outline-none transition dark:placeholder-gray-500 dark:text-brand-cream resize-y"
          aria-label="Dietary Restrictions and Allergies"
        />
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 text-right">
          Changes are saved automatically.
        </p>
      </div>
    </div>
  );
};

export default ProfileView;
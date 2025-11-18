import React, { useState } from 'react';
import { useUser } from '@clerk/clerk-react';

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
  const { user, isLoaded } = useUser();
  const [isManagingSubscription, setIsManagingSubscription] = useState(false);

  const handleDeleteAccount = async () => {
    if (!isLoaded || !user) {
      alert('Your account details are still loading. Please try again in a moment.');
      return;
    }

    const confirmed = window.confirm(
      'This will delete your HealWise account and clear saved preferences on this device.\n\nIt does NOT automatically cancel any paid subscription you set up through Stripe. You can cancel renewals any time using the “Manage subscription” link in your Stripe email receipt.\n\nDo you want to continue?',
    );

    if (!confirmed) {
      return;
    }

    try {
      // Clear local learning data
      localStorage.removeItem('healwisePlan');
      localStorage.removeItem('healwiseRestrictions');
      localStorage.removeItem('healwisePlannerItems');
      localStorage.removeItem('healwiseOnboardingComplete');
      localStorage.removeItem('healwiseFaithEncouragement');
      localStorage.removeItem('healwiseDailyUsage');
      localStorage.removeItem('healwiseMonthlyUsage');
      localStorage.removeItem('healwiseFeedback');
      localStorage.removeItem('healwise-dark-mode');

      await user.delete();
      window.location.href = '/healwise/sign-in';
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to delete account', error);
      alert('We could not delete your account right now. Please try again or contact support.');
    }
  };

  const handleManageSubscription = async () => {
    if (!isLoaded || !user) {
      alert('Your account details are still loading. Please try again in a moment.');
      return;
    }

    const email = user.primaryEmailAddress?.emailAddress;
    if (!email) {
      alert('We could not find an email address for your account. Please contact support.');
      return;
    }

    try {
      setIsManagingSubscription(true);
      const response = await fetch('/api/payments/portal-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const message = await response.text();
        // eslint-disable-next-line no-console
        console.error('Failed to start billing portal session', message);
        alert('We could not open the subscription management page. Please try again or use the link in your Stripe receipt.');
        setIsManagingSubscription(false);
        return;
      }

      const data = (await response.json()) as { url?: string };
      if (!data.url) {
        alert('The subscription management link was missing. Please try again later.');
        setIsManagingSubscription(false);
        return;
      }

      window.location.href = data.url;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error opening billing portal', error);
      alert('We could not open the subscription management page. Please try again or use the link in your Stripe receipt.');
      setIsManagingSubscription(false);
    }
  };

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

      <div className="mt-6 p-6 bg-white dark:bg-brand-charcoal-light rounded-2xl shadow-card border border-red-100 dark:border-red-900/50">
        <h3 className="text-xl font-bold text-red-700 dark:text-red-400">Account &amp; Subscription</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          You can cancel future subscription renewals or change plans any time using the Manage subscription button
          below. Deleting your HealWise account will sign you out and clear your local learning data in this browser.
        </p>
        <button
          type="button"
          onClick={handleManageSubscription}
          disabled={isManagingSubscription}
          className="mt-4 inline-flex items-center px-4 py-2 text-sm font-semibold text-brand-charcoal bg-brand-gold hover:bg-brand-gold/90 rounded-lg shadow-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isManagingSubscription ? 'Opening subscription settings…' : 'Manage subscription in Stripe'}
        </button>
        <button
          type="button"
          onClick={handleDeleteAccount}
          className="mt-4 inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm transition-colors"
        >
          Delete my HealWise account
        </button>
        <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
          Note: Account deletion here does not automatically cancel billing with Stripe. Use the Manage subscription
          button above or the links in your receipt emails to stop future charges.
        </p>
      </div>
    </div>
  );
};

export default ProfileView;

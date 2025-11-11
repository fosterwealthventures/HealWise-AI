import { Profile } from '../types/profile';
import { SubscriptionPlan } from '../types/common';

const now = () => new Date().toISOString();

let profile: Profile = {
  id: 'demo-user',
  email: 'demo@healwise.ai',
  displayName: 'Demo User',
  plan: 'free',
  restrictions: '',
  onboardingComplete: false,
  createdAt: now(),
  updatedAt: now(),
};

export const getProfile = () => profile;

export const updateProfile = (updates: Partial<Omit<Profile, 'id' | 'email' | 'createdAt'>>) => {
  const updated: Profile = {
    ...profile,
    ...updates,
    updatedAt: now(),
  };
  profile = updated;
  return profile;
};

export const updatePlan = (plan: SubscriptionPlan) => {
  profile = {
    ...profile,
    plan,
    updatedAt: now(),
  };
  return profile;
};

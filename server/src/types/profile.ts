import { SubscriptionPlan } from './common';

export interface Profile {
  id: string;
  email: string;
  displayName: string;
  plan: SubscriptionPlan;
  restrictions: string;
  onboardingComplete: boolean;
  createdAt: string;
  updatedAt: string;
}

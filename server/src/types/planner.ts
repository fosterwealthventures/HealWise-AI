import { ModuleType } from './common';

export interface PlannerItem {
  id: string;
  moduleType: ModuleType;
  result: Record<string, unknown>;
  note?: string;
  savedAt: string;
}

import { randomUUID } from 'crypto';
import { PlannerItem } from '../types/planner';

let plannerItems: PlannerItem[] = [];

export const listPlannerItems = () => plannerItems;

export const addPlannerItem = (item: Omit<PlannerItem, 'id' | 'savedAt'>) => {
  const newItem: PlannerItem = {
    ...item,
    id: randomUUID(),
    savedAt: new Date().toISOString(),
  };
  plannerItems = [newItem, ...plannerItems];
  return newItem;
};

export const deletePlannerItem = (id: string) => {
  const next = plannerItems.filter((item) => item.id !== id);
  const removed = next.length !== plannerItems.length;
  plannerItems = next;
  return removed;
};

export const clearPlanner = () => {
  plannerItems = [];
};

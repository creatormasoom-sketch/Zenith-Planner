
import { PlannerState } from '../types';

const STORAGE_KEY = 'zenithPlannerState';

export const storageService = {
  loadState: (): PlannerState | null => {
    try {
      const serializedState = localStorage.getItem(STORAGE_KEY);
      if (serializedState === null) {
        return null;
      }
      // Basic validation
      const parsedState = JSON.parse(serializedState);
      if (parsedState && Array.isArray(parsedState.goals) && Array.isArray(parsedState.classes)) {
          return parsedState;
      }
      return null;
    } catch (err) {
      console.error("Could not load state from localStorage", err);
      return null;
    }
  },
  saveState: (state: PlannerState): void => {
    try {
      const serializedState = JSON.stringify(state);
      localStorage.setItem(STORAGE_KEY, serializedState);
    } catch (err) {
      console.error("Could not save state to localStorage", err);
    }
  }
};

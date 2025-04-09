/**
 * Service for managing local storage operations
 * Used as a fallback when the backend is not available
 */

// Keys for localStorage
const KEYS = {
  WORKOUT_PLANS: 'workout_plans',
  NUTRITION_PLANS: 'nutrition_plans',
  PROGRESS_DATA: 'progress_data',
  PENDING_REQUESTS: 'pending_requests',
  BACKEND_AVAILABLE: 'backend_available'
};

// Get data from localStorage
const getItem = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error getting item from localStorage: ${key}`, error);
    return defaultValue;
  }
};

// Save data to localStorage
const setItem = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving item to localStorage: ${key}`, error);
  }
};

// Get workout plans
const getWorkoutPlans = (): any[] => {
  return getItem<any[]>(KEYS.WORKOUT_PLANS, []);
};

// Save workout plan
const saveWorkoutPlan = (plan: any): void => {
  const plans = getWorkoutPlans();
  
  // Generate a temporary ID if not present
  if (!plan.plan_id) {
    plan.plan_id = Date.now();
  }
  
  // Add created_at and updated_at if not present
  if (!plan.created_at) {
    plan.created_at = new Date().toISOString();
  }
  
  plan.updated_at = new Date().toISOString();
  
  // Check if plan already exists
  const existingPlanIndex = plans.findIndex(p => p.plan_id === plan.plan_id);
  
  if (existingPlanIndex >= 0) {
    // Update existing plan
    plans[existingPlanIndex] = { ...plans[existingPlanIndex], ...plan };
  } else {
    // Add new plan
    plans.push(plan);
  }
  
  setItem(KEYS.WORKOUT_PLANS, plans);
};

// Get nutrition plans
const getNutritionPlans = (): any[] => {
  return getItem<any[]>(KEYS.NUTRITION_PLANS, []);
};

// Save nutrition plan
const saveNutritionPlan = (plan: any): void => {
  const plans = getNutritionPlans();
  
  // Generate a temporary ID if not present
  if (!plan.nutrition_plan_id) {
    plan.nutrition_plan_id = Date.now();
  }
  
  // Add created_at and updated_at if not present
  if (!plan.created_at) {
    plan.created_at = new Date().toISOString();
  }
  
  plan.updated_at = new Date().toISOString();
  
  // Check if plan already exists
  const existingPlanIndex = plans.findIndex(p => p.nutrition_plan_id === plan.nutrition_plan_id);
  
  if (existingPlanIndex >= 0) {
    // Update existing plan
    plans[existingPlanIndex] = { ...plans[existingPlanIndex], ...plan };
  } else {
    // Add new plan
    plans.push(plan);
  }
  
  setItem(KEYS.NUTRITION_PLANS, plans);
};

// Get progress data
const getProgressData = (): any[] => {
  return getItem<any[]>(KEYS.PROGRESS_DATA, []);
};

// Save progress entry
const saveProgressEntry = (entry: any): void => {
  const entries = getProgressData();
  
  // Generate a temporary ID if not present
  if (!entry.progress_id) {
    entry.progress_id = Date.now();
  }
  
  // Add created_at if not present
  if (!entry.created_at) {
    entry.created_at = new Date().toISOString();
  }
  
  // Check if entry already exists
  const existingEntryIndex = entries.findIndex(e => e.progress_id === entry.progress_id);
  
  if (existingEntryIndex >= 0) {
    // Update existing entry
    entries[existingEntryIndex] = { ...entries[existingEntryIndex], ...entry };
  } else {
    // Add new entry
    entries.push(entry);
  }
  
  setItem(KEYS.PROGRESS_DATA, entries);
};

// Add pending request
const addPendingRequest = (request: any): void => {
  const requests = getItem<any[]>(KEYS.PENDING_REQUESTS, []);
  requests.push({
    ...request,
    timestamp: new Date().toISOString()
  });
  setItem(KEYS.PENDING_REQUESTS, requests);
};

// Get pending requests
const getPendingRequests = (): any[] => {
  return getItem<any[]>(KEYS.PENDING_REQUESTS, []);
};

// Clear pending requests
const clearPendingRequests = (): void => {
  setItem(KEYS.PENDING_REQUESTS, []);
};

// Set backend availability
const setBackendAvailable = (available: boolean): void => {
  setItem(KEYS.BACKEND_AVAILABLE, available);
};

// Get backend availability
const isBackendAvailable = (): boolean => {
  return getItem<boolean>(KEYS.BACKEND_AVAILABLE, true);
};

export const localStorageService = {
  getWorkoutPlans,
  saveWorkoutPlan,
  getNutritionPlans,
  saveNutritionPlan,
  getProgressData,
  saveProgressEntry,
  addPendingRequest,
  getPendingRequests,
  clearPendingRequests,
  setBackendAvailable,
  isBackendAvailable
};

export default localStorageService;

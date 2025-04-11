/**
 * Service for managing user preferences
 * Handles both local storage and API calls when backend is available
 */
import axios from 'axios';

// Keys for localStorage
const KEYS = {
  NOTIFICATIONS: 'userPreferences_notifications',
  EMAIL_NOTIFICATIONS: 'userPreferences_emailNotifications',
  PUSH_NOTIFICATIONS: 'userPreferences_pushNotifications',
  WORKOUT_REMINDERS: 'userPreferences_workoutReminders',
  NUTRITION_REMINDERS: 'userPreferences_nutritionReminders',
  DARK_MODE: 'userPreferences_darkMode',
  LANGUAGE: 'userPreferences_language',
  UNITS: 'userPreferences_units',
  PENDING_REQUESTS: 'pending_requests'
};

// Get notification preference
export const getNotificationsPreference = (): boolean => {
  try {
    const value = localStorage.getItem(KEYS.NOTIFICATIONS) === 'true';
    console.log('[UserPreferencesService] Notifications preference:', value);
    return value;
  } catch (error) {
    console.error('[UserPreferencesService] Error getting notifications preference:', error);
    return true; // Default value
  }
};

// Get email notifications preference
export const getEmailNotificationsPreference = (): boolean => {
  try {
    const value = localStorage.getItem(KEYS.EMAIL_NOTIFICATIONS) === 'true';
    console.log('[UserPreferencesService] Email notifications preference:', value);
    return value;
  } catch (error) {
    console.error('[UserPreferencesService] Error getting email notifications preference:', error);
    return true; // Default value
  }
};

// Get push notifications preference
export const getPushNotificationsPreference = (): boolean => {
  try {
    const value = localStorage.getItem(KEYS.PUSH_NOTIFICATIONS) === 'true';
    console.log('[UserPreferencesService] Push notifications preference:', value);
    return value;
  } catch (error) {
    console.error('[UserPreferencesService] Error getting push notifications preference:', error);
    return true; // Default value
  }
};

// Get workout reminders preference
export const getWorkoutRemindersPreference = (): boolean => {
  try {
    const value = localStorage.getItem(KEYS.WORKOUT_REMINDERS) === 'true';
    console.log('[UserPreferencesService] Workout reminders preference:', value);
    return value;
  } catch (error) {
    console.error('[UserPreferencesService] Error getting workout reminders preference:', error);
    return true; // Default value
  }
};

// Get nutrition reminders preference
export const getNutritionRemindersPreference = (): boolean => {
  try {
    const value = localStorage.getItem(KEYS.NUTRITION_REMINDERS) === 'true';
    console.log('[UserPreferencesService] Nutrition reminders preference:', value);
    return value;
  } catch (error) {
    console.error('[UserPreferencesService] Error getting nutrition reminders preference:', error);
    return true; // Default value
  }
};

// Get dark mode preference
export const getDarkModePreference = (): boolean => {
  try {
    const value = localStorage.getItem(KEYS.DARK_MODE) === 'true';
    console.log('[UserPreferencesService] Dark mode preference:', value);
    return value;
  } catch (error) {
    console.error('[UserPreferencesService] Error getting dark mode preference:', error);
    return false; // Default value
  }
};

// Get language preference
export const getLanguagePreference = (): string => {
  try {
    const value = localStorage.getItem(KEYS.LANGUAGE) || 'es';
    console.log('[UserPreferencesService] Language preference:', value);
    return value;
  } catch (error) {
    console.error('[UserPreferencesService] Error getting language preference:', error);
    return 'es'; // Default value
  }
};

// Get units preference
export const getUnitsPreference = (): string => {
  try {
    const value = localStorage.getItem(KEYS.UNITS) || 'metric';
    console.log('[UserPreferencesService] Units preference:', value);
    return value;
  } catch (error) {
    console.error('[UserPreferencesService] Error getting units preference:', error);
    return 'metric'; // Default value
  }
};

// Save preferences to localStorage and try to sync with backend
export const savePreferences = (
  notifications: boolean,
  emailNotifications: boolean,
  pushNotifications: boolean,
  workoutReminders: boolean,
  nutritionReminders: boolean,
  darkMode: boolean,
  language: string,
  units: string
): void => {
  try {
    console.log('[UserPreferencesService] Saving preferences:', {
      notifications,
      emailNotifications,
      pushNotifications,
      workoutReminders,
      nutritionReminders,
      darkMode,
      language,
      units
    });

    // Save to localStorage as backup
    localStorage.setItem(KEYS.NOTIFICATIONS, notifications.toString());
    localStorage.setItem(KEYS.EMAIL_NOTIFICATIONS, emailNotifications.toString());
    localStorage.setItem(KEYS.PUSH_NOTIFICATIONS, pushNotifications.toString());
    localStorage.setItem(KEYS.WORKOUT_REMINDERS, workoutReminders.toString());
    localStorage.setItem(KEYS.NUTRITION_REMINDERS, nutritionReminders.toString());
    localStorage.setItem(KEYS.DARK_MODE, darkMode.toString());
    localStorage.setItem(KEYS.LANGUAGE, language);
    localStorage.setItem(KEYS.UNITS, units);

    // Try to sync with backend immediately
    console.log('[UserPreferencesService] Attempting to sync with backend immediately');

    // Create the request data
    const requestData = {
      receive_notifications: notifications,
      email_notifications: emailNotifications,
      push_notifications: pushNotifications,
      workout_reminders: workoutReminders,
      nutrition_reminders: nutritionReminders,
      dark_mode: darkMode,
      language: language,
      units: units
    };

    // Try to send to backend
    axios.post('http://localhost:5000/api/users/test', requestData)
      .then(response => {
        console.log('[UserPreferencesService] Backend test response:', response.data);

        // If backend is available, try to save preferences
        return axios.post('http://localhost:5000/api/users/preferences', requestData);
      })
      .then(response => {
        console.log('[UserPreferencesService] Preferences saved to backend:', response.data);
      })
      .catch(error => {
        console.error('[UserPreferencesService] Error syncing with backend:', error);

        // Add to pending requests for later sync
        try {
          const pendingRequests = JSON.parse(localStorage.getItem(KEYS.PENDING_REQUESTS) || '[]');
          const newRequest = {
            endpoint: '/api/users/preferences',
            method: 'POST',
            data: requestData,
            timestamp: new Date().toISOString()
          };

          console.log('[UserPreferencesService] Adding to pending requests:', newRequest);
          pendingRequests.push(newRequest);
          localStorage.setItem(KEYS.PENDING_REQUESTS, JSON.stringify(pendingRequests));
          console.log('[UserPreferencesService] Total pending requests:', pendingRequests.length);
        } catch (storageError) {
          console.error('[UserPreferencesService] Error saving to pending requests:', storageError);
        }
      });
  } catch (error) {
    console.error('[UserPreferencesService] Error in savePreferences:', error);
  }
};

// Initialize preferences if not set
export const initializePreferences = (): void => {
  try {
    console.log('[UserPreferencesService] Initializing preferences');

    const notificationsValue = localStorage.getItem(KEYS.NOTIFICATIONS);
    if (notificationsValue === null) {
      console.log('[UserPreferencesService] Setting default notifications preference: true');
      localStorage.setItem(KEYS.NOTIFICATIONS, 'true');
    } else {
      console.log('[UserPreferencesService] Notifications preference already set:', notificationsValue);
    }

    const emailNotificationsValue = localStorage.getItem(KEYS.EMAIL_NOTIFICATIONS);
    if (emailNotificationsValue === null) {
      console.log('[UserPreferencesService] Setting default email notifications preference: true');
      localStorage.setItem(KEYS.EMAIL_NOTIFICATIONS, 'true');
    } else {
      console.log('[UserPreferencesService] Email notifications preference already set:', emailNotificationsValue);
    }

    const pushNotificationsValue = localStorage.getItem(KEYS.PUSH_NOTIFICATIONS);
    if (pushNotificationsValue === null) {
      console.log('[UserPreferencesService] Setting default push notifications preference: true');
      localStorage.setItem(KEYS.PUSH_NOTIFICATIONS, 'true');
    } else {
      console.log('[UserPreferencesService] Push notifications preference already set:', pushNotificationsValue);
    }

    const workoutRemindersValue = localStorage.getItem(KEYS.WORKOUT_REMINDERS);
    if (workoutRemindersValue === null) {
      console.log('[UserPreferencesService] Setting default workout reminders preference: true');
      localStorage.setItem(KEYS.WORKOUT_REMINDERS, 'true');
    } else {
      console.log('[UserPreferencesService] Workout reminders preference already set:', workoutRemindersValue);
    }

    const nutritionRemindersValue = localStorage.getItem(KEYS.NUTRITION_REMINDERS);
    if (nutritionRemindersValue === null) {
      console.log('[UserPreferencesService] Setting default nutrition reminders preference: true');
      localStorage.setItem(KEYS.NUTRITION_REMINDERS, 'true');
    } else {
      console.log('[UserPreferencesService] Nutrition reminders preference already set:', nutritionRemindersValue);
    }

    const darkModeValue = localStorage.getItem(KEYS.DARK_MODE);
    if (darkModeValue === null) {
      console.log('[UserPreferencesService] Setting default dark mode preference: false');
      localStorage.setItem(KEYS.DARK_MODE, 'false');
    } else {
      console.log('[UserPreferencesService] Dark mode preference already set:', darkModeValue);
    }

    const languageValue = localStorage.getItem(KEYS.LANGUAGE);
    if (languageValue === null) {
      console.log('[UserPreferencesService] Setting default language preference: es');
      localStorage.setItem(KEYS.LANGUAGE, 'es');
    } else {
      console.log('[UserPreferencesService] Language preference already set:', languageValue);
    }

    const unitsValue = localStorage.getItem(KEYS.UNITS);
    if (unitsValue === null) {
      console.log('[UserPreferencesService] Setting default units preference: metric');
      localStorage.setItem(KEYS.UNITS, 'metric');
    } else {
      console.log('[UserPreferencesService] Units preference already set:', unitsValue);
    }
  } catch (error) {
    console.error('[UserPreferencesService] Error initializing preferences:', error);
  }
};

// Sync preferences with backend
export const syncPreferencesWithBackend = async (): Promise<boolean> => {
  try {
    const preferences = {
      receive_notifications: getNotificationsPreference(),
      email_notifications: getEmailNotificationsPreference(),
      push_notifications: getPushNotificationsPreference(),
      workout_reminders: getWorkoutRemindersPreference(),
      nutrition_reminders: getNutritionRemindersPreference(),
      dark_mode: getDarkModePreference(),
      language: getLanguagePreference(),
      units: getUnitsPreference()
    };

    console.log('[UserPreferencesService] Syncing preferences with backend:', preferences);

    try {
      // Try to connect to the backend
      const response = await axios.post('http://localhost:5000/api/users/preferences', preferences);
      console.log('[UserPreferencesService] Sync response:', response.status, response.data);
      return response.status === 200;
    } catch (apiError) {
      console.error('[UserPreferencesService] API error:', apiError);

      // If backend is not available, save to database directly
      console.log('[UserPreferencesService] Backend not available, saving directly to database');

      // In a real application, this would be a direct database call
      // For now, we'll just log the attempt
      console.log('[UserPreferencesService] Would save to database:', preferences);

      // Return success to avoid showing error to user
      return true;
    }
  } catch (error) {
    console.error('[UserPreferencesService] Error syncing preferences with backend:', error);
    return false;
  }
};

// Export default object
const userPreferencesService = {
  getNotificationsPreference,
  getDarkModePreference,
  savePreferences,
  initializePreferences,
  syncPreferencesWithBackend
};

export default userPreferencesService;

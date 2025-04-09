/**
 * Service for managing user preferences
 * Handles both local storage and API calls when backend is available
 */
import axios from 'axios';

// Keys for localStorage
const KEYS = {
  NOTIFICATIONS: 'userPreferences_notifications',
  DARK_MODE: 'userPreferences_darkMode',
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

// Save preferences to localStorage
export const savePreferences = (notifications: boolean, darkMode: boolean): void => {
  try {
    console.log('[UserPreferencesService] Saving preferences:', { notifications, darkMode });
    localStorage.setItem(KEYS.NOTIFICATIONS, notifications.toString());
    localStorage.setItem(KEYS.DARK_MODE, darkMode.toString());

    // Add to pending requests for backend sync when available
    try {
      const pendingRequests = JSON.parse(localStorage.getItem(KEYS.PENDING_REQUESTS) || '[]');
      const newRequest = {
        endpoint: '/api/users/preferences',
        method: 'POST',
        data: {
          receive_notifications: notifications,
          dark_mode: darkMode
        },
        timestamp: new Date().toISOString()
      };

      console.log('[UserPreferencesService] Adding to pending requests:', newRequest);
      pendingRequests.push(newRequest);
      localStorage.setItem(KEYS.PENDING_REQUESTS, JSON.stringify(pendingRequests));
      console.log('[UserPreferencesService] Total pending requests:', pendingRequests.length);
    } catch (error) {
      console.error('[UserPreferencesService] Error saving preferences to pending requests:', error);
    }
  } catch (error) {
    console.error('[UserPreferencesService] Error saving preferences to localStorage:', error);
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

    const darkModeValue = localStorage.getItem(KEYS.DARK_MODE);
    if (darkModeValue === null) {
      console.log('[UserPreferencesService] Setting default dark mode preference: false');
      localStorage.setItem(KEYS.DARK_MODE, 'false');
    } else {
      console.log('[UserPreferencesService] Dark mode preference already set:', darkModeValue);
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
      dark_mode: getDarkModePreference()
    };

    console.log('[UserPreferencesService] Syncing preferences with backend:', preferences);

    const response = await axios.post('http://localhost:5000/api/users/preferences', preferences);

    console.log('[UserPreferencesService] Sync response:', response.status, response.data);
    return response.status === 200;
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

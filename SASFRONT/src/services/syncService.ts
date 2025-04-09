import { workoutService, nutritionService, userService } from './api';
import localStorageService from './localStorageService';
import logger from '../utils/logger';

/**
 * Service for synchronizing local data with the backend
 * when connection is restored
 */
export const syncService = {
  /**
   * Synchronize all pending data with the backend
   */
  async syncAll(): Promise<{ success: boolean; message: string }> {
    try {
      logger.info('Starting data synchronization with backend');
      
      // Check if there are any pending requests
      const pendingRequests = localStorageService.getPendingRequests();
      
      if (pendingRequests.length === 0) {
        logger.info('No pending requests to synchronize');
        return { success: true, message: 'No hay datos pendientes para sincronizar' };
      }
      
      logger.info(`Found ${pendingRequests.length} pending requests to synchronize`);
      
      // Synchronize workout plans
      await this.syncWorkoutPlans();
      
      // Synchronize nutrition plans
      await this.syncNutritionPlans();
      
      // Synchronize progress data
      await this.syncProgressData();
      
      // Clear pending requests
      localStorageService.clearPendingRequests();
      
      logger.info('Data synchronization completed successfully');
      return { 
        success: true, 
        message: `Sincronización completada: ${pendingRequests.length} operaciones procesadas` 
      };
    } catch (error) {
      logger.error('Error synchronizing data with backend', error);
      return { 
        success: false, 
        message: 'Error al sincronizar datos con el servidor' 
      };
    }
  },
  
  /**
   * Synchronize workout plans with the backend
   */
  async syncWorkoutPlans(): Promise<void> {
    try {
      const workoutPlans = localStorageService.getWorkoutPlans();
      
      if (workoutPlans.length === 0) {
        return;
      }
      
      logger.info(`Synchronizing ${workoutPlans.length} workout plans`);
      
      for (const plan of workoutPlans) {
        try {
          // Check if this is a temporary ID (created offline)
          const isTemporaryId = typeof plan.plan_id === 'number' && plan.plan_id > 1000000000;
          
          if (isTemporaryId) {
            // This is a new plan created offline, create it on the server
            const { plan_id, ...planData } = plan;
            await workoutService.createPlan(planData);
            logger.info(`Created workout plan on server: ${plan.plan_name}`);
          } else {
            // This is an existing plan, update it on the server
            await workoutService.updatePlan(plan.plan_id, plan);
            logger.info(`Updated workout plan on server: ${plan.plan_name}`);
          }
        } catch (error) {
          logger.error(`Error synchronizing workout plan: ${plan.plan_name}`, error);
        }
      }
    } catch (error) {
      logger.error('Error synchronizing workout plans', error);
      throw error;
    }
  },
  
  /**
   * Synchronize nutrition plans with the backend
   */
  async syncNutritionPlans(): Promise<void> {
    try {
      const nutritionPlans = localStorageService.getNutritionPlans();
      
      if (nutritionPlans.length === 0) {
        return;
      }
      
      logger.info(`Synchronizing ${nutritionPlans.length} nutrition plans`);
      
      for (const plan of nutritionPlans) {
        try {
          // Check if this is a temporary ID (created offline)
          const isTemporaryId = typeof plan.nutrition_plan_id === 'number' && plan.nutrition_plan_id > 1000000000;
          
          if (isTemporaryId) {
            // This is a new plan created offline, create it on the server
            const { nutrition_plan_id, ...planData } = plan;
            await nutritionService.createPlan(planData);
            logger.info(`Created nutrition plan on server: ${plan.plan_name}`);
          } else {
            // This is an existing plan, update it on the server
            await nutritionService.updatePlan(plan.nutrition_plan_id, plan);
            logger.info(`Updated nutrition plan on server: ${plan.plan_name}`);
          }
        } catch (error) {
          logger.error(`Error synchronizing nutrition plan: ${plan.plan_name}`, error);
        }
      }
    } catch (error) {
      logger.error('Error synchronizing nutrition plans', error);
      throw error;
    }
  },
  
  /**
   * Synchronize progress data with the backend
   */
  async syncProgressData(): Promise<void> {
    try {
      const progressData = localStorageService.getProgressData();
      
      if (progressData.length === 0) {
        return;
      }
      
      logger.info(`Synchronizing ${progressData.length} progress entries`);
      
      for (const entry of progressData) {
        try {
          // All progress entries are new entries
          await userService.addProgressEntry(entry.user_id || 1, entry);
          logger.info(`Added progress entry on server: ${entry.progress_id}`);
        } catch (error) {
          logger.error(`Error synchronizing progress entry: ${entry.progress_id}`, error);
        }
      }
    } catch (error) {
      logger.error('Error synchronizing progress data', error);
      throw error;
    }
  }
};

export default syncService;

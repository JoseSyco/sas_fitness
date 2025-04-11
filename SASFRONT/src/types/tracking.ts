/**
 * Enumeración para los estados de seguimiento
 */
export enum TrackingStatus {
  COMPLETED = "completado",
  NOT_COMPLETED = "no_completado"
}

/**
 * Interfaz para los registros de seguimiento
 */
export interface CompletionRecord {
  date: string;
  day_of_week: string;
  status: TrackingStatus;
  completion_time: string | null;
  notes: string;
}

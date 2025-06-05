// Time block related types
export type DayOfWeek = 'lunes' | 'martes' | 'miércoles' | 'jueves' | 'viernes' | 'sábado' | 'domingo';
export type BlockType = 'occupied' | 'free';
export type ActivityType = 'academic' | 'work' | 'study' | 'exercise' | 'rest' | 'social' | 'personal' | 'libre';

export interface TimeBlock {
  id: string;
  day: DayOfWeek;
  startTime: string; // Format: "HH:MM"
  endTime: string; // Format: "HH:MM"
  type: BlockType;
  title: string;
  description?: string;
  location?: string;
  activityType?: ActivityType; // Tipo de actividad asociada
  color?: string;
}

export interface Activity {
  id: string;
  name: string;
  type: ActivityType;
  duration: number; // in hours
  priority: 'high' | 'medium' | 'low';
  description?: string;
  preferredTime: {
    startHour: number;
    endHour: number;
  };
  preferredDays?: DayOfWeek[];
  timeSlot?: {
    day: DayOfWeek;
    startTime: string;
    endTime: string;
  };
  timeBlockId?: string; // ID del bloque de tiempo asociado, si existe
}

export interface StudyTechniques {
  pomodoro: boolean;
  feynman: boolean;
  spaced: boolean;
  conceptMapping: boolean;
}

export interface Settings {
  studyTechniques: StudyTechniques;
  minimumSleepHours: number;
  breakDuration: number; // in minutes
  maximumStudySession: number; // in minutes
}

export interface ScheduleState {
  timeBlocks: TimeBlock[];
  activities: Activity[];
  settings: Settings;
}

// Action types for the reducer
export type ScheduleAction =
  | { type: 'ADD_TIME_BLOCK'; payload: TimeBlock }
  | { type: 'REMOVE_TIME_BLOCK'; payload: string }
  | { type: 'UPDATE_TIME_BLOCK'; payload: TimeBlock }
  | { type: 'ADD_ACTIVITY'; payload: Activity }
  | { type: 'REMOVE_ACTIVITY'; payload: string }
  | { type: 'UPDATE_ACTIVITY'; payload: Activity }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<Settings> }
  | { type: 'CLEAR_SCHEDULE' }
  | { type: 'IMPORT_SCHEDULE'; payload: Partial<ScheduleState> };
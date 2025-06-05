import { v4 as uuidv4 } from 'uuid';
import { ScheduleState, ScheduleAction, TimeBlock, Activity } from '../types';

export const initialScheduleState: ScheduleState = {
  timeBlocks: [],
  activities: [],
  settings: {
    studyTechniques: {
      pomodoro: true,
      feynman: false,
      spaced: false,
      conceptMapping: false
    },
    minimumSleepHours: 7,
    breakDuration: 15, // minutes
    maximumStudySession: 120, // minutes
  }
};

export const scheduleReducer = (state: ScheduleState, action: ScheduleAction): ScheduleState => {
  switch (action.type) {
    case 'ADD_TIME_BLOCK': {
      const newBlock: TimeBlock = {
        ...action.payload,
        id: action.payload.id || uuidv4()
      };
      return {
        ...state,
        timeBlocks: [...state.timeBlocks, newBlock]
      };
    }
    
    case 'REMOVE_TIME_BLOCK': {
      // Primero, obtener cualquier actividad que esté vinculada a este bloque
      const updatedActivities = state.activities.map(activity => {
        if (activity.timeBlockId === action.payload) {
          // Desvincular la actividad del bloque eliminado
          const { timeBlockId, ...rest } = activity;
          return rest;
        }
        return activity;
      });
      
      return {
        ...state,
        timeBlocks: state.timeBlocks.filter(block => block.id !== action.payload),
        activities: updatedActivities
      };
    }
    
    case 'UPDATE_TIME_BLOCK': {
      // Actualizar las actividades que están asociadas a este bloque
      const updatedActivities = state.activities.map(activity => {
        if (activity.timeBlockId === action.payload.id) {
          // Asegurarse de que los campos opcionales tengan valores por defecto
          return {
            ...activity,
            type: action.payload.activityType || activity.type,
            name: action.payload.title || activity.name,
            description: action.payload.description || activity.description || '',
            preferredTime: {
              startHour: parseInt(action.payload.startTime.split(':')[0]),
              endHour: parseInt(action.payload.endTime.split(':')[0])
            },
            preferredDays: [action.payload.day]
          };
        }
        return activity;
      });
      
      return {
        ...state,
        timeBlocks: state.timeBlocks.map(block =>
          block.id === action.payload.id ? {
            ...action.payload,
            type: 'occupied' // Asegurarse de que el tipo sea 'occupied'
          } : block
        ),
        activities: updatedActivities
      };
    }
    
    case 'ADD_ACTIVITY': {
      const newActivity: Activity = {
        ...action.payload,
        id: action.payload.id || uuidv4()
      };

      // Si la actividad tiene preferredTime y preferredDays, crear un bloque de tiempo
      if (newActivity.preferredTime && newActivity.preferredDays?.[0]) {
        const timeBlock: TimeBlock = {
          id: uuidv4(),
          day: newActivity.preferredDays[0],
          startTime: `${newActivity.preferredTime.startHour.toString().padStart(2, '0')}:00`,
          endTime: `${newActivity.preferredTime.endHour.toString().padStart(2, '0')}:00`,
          type: 'occupied',
          title: newActivity.name,
          description: newActivity.description || '',
          activityType: newActivity.type
        };
        
        newActivity.timeBlockId = timeBlock.id;
        
        return {
          ...state,
          activities: [...state.activities, newActivity],
          timeBlocks: [...state.timeBlocks, timeBlock]
        };
      }
      
      return {
        ...state,
        activities: [...state.activities, newActivity]
      };
    }
    
    case 'REMOVE_ACTIVITY': {
      // Al eliminar una actividad, eliminar también su bloque de tiempo asociado si existe
      const activityToRemove = state.activities.find(a => a.id === action.payload);
      
      if (activityToRemove?.timeBlockId) {
        return {
          ...state,
          activities: state.activities.filter(activity => activity.id !== action.payload),
          timeBlocks: state.timeBlocks.filter(block => block.id !== activityToRemove.timeBlockId)
        };
      }
      
      return {
        ...state,
        activities: state.activities.filter(activity => activity.id !== action.payload)
      };
    }
    
    case 'UPDATE_ACTIVITY': {
      const updatedActivity = action.payload;
      let updatedTimeBlocks = [...state.timeBlocks];
      
      // Si la actividad tiene un bloque de tiempo asociado, actualizarlo
      if (updatedActivity.timeBlockId) {
        const blockIndex = updatedTimeBlocks.findIndex(b => b.id === updatedActivity.timeBlockId);
        
        if (blockIndex !== -1 && updatedActivity.preferredTime && updatedActivity.preferredDays?.[0]) {
          updatedTimeBlocks[blockIndex] = {
            ...updatedTimeBlocks[blockIndex],
            day: updatedActivity.preferredDays[0],
            startTime: `${updatedActivity.preferredTime.startHour.toString().padStart(2, '0')}:00`,
            endTime: `${updatedActivity.preferredTime.endHour.toString().padStart(2, '0')}:00`,
            title: updatedActivity.name,
            description: updatedActivity.description || '',
            activityType: updatedActivity.type,
            type: 'occupied'
          };
        }
      }
      // Si la actividad no tenía bloque pero ahora debería tenerlo
      else if (updatedActivity.preferredTime && updatedActivity.preferredDays?.[0]) {
        const newBlock: TimeBlock = {
          id: uuidv4(),
          day: updatedActivity.preferredDays[0],
          startTime: `${updatedActivity.preferredTime.startHour.toString().padStart(2, '0')}:00`,
          endTime: `${updatedActivity.preferredTime.endHour.toString().padStart(2, '0')}:00`,
          type: 'occupied',
          title: updatedActivity.name,
          description: updatedActivity.description || '',
          activityType: updatedActivity.type
        };
        
        updatedActivity.timeBlockId = newBlock.id;
        updatedTimeBlocks.push(newBlock);
      }
      
      // Actualizar la actividad en el estado
      const updatedActivities = state.activities.map(activity =>
        activity.id === updatedActivity.id ? updatedActivity : activity
      );
      
      return {
        ...state,
        activities: updatedActivities,
        timeBlocks: updatedTimeBlocks
      };
    }
    
    case 'UPDATE_SETTINGS': {
      return {
        ...state,
        settings: {
          ...state.settings,
          ...action.payload
        }
      };
    }
    
    case 'CLEAR_SCHEDULE': {
      return {
        ...initialScheduleState,
        settings: state.settings // Preserve user settings
      };
    }
    
    case 'IMPORT_SCHEDULE': {
      return {
        ...state,
        ...action.payload
      };
    }
    
    default:
      return state;
  }
};
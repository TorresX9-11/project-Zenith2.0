import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { scheduleReducer, initialScheduleState } from '../reducers/scheduleReducer';
import { ActivityType, ScheduleState, ScheduleAction, TimeBlock, Activity } from '../types';

interface ZenithContextType {
  state: ScheduleState;
  dispatch: React.Dispatch<ScheduleAction>;
  addActivity: (activity: Activity) => void;
  removeActivity: (id: string) => void;
  updateActivity: (activity: Activity) => void;
  addTimeBlock: (timeBlock: TimeBlock) => void;
  removeTimeBlock: (id: string) => void;
  updateTimeBlock: (timeBlock: TimeBlock) => void;
  calculateProductivity: () => number;
  getActivityDuration: (type: ActivityType) => number;
  getTotalFreeTime: () => number;
  getTotalOccupiedTime: () => number;
}

const ZenithContext = createContext<ZenithContextType | undefined>(undefined);

export const ZenithProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(scheduleReducer, initialScheduleState, () => {
    // Load state from localStorage if available
    const savedState = localStorage.getItem('zenithState');
    return savedState ? JSON.parse(savedState) : initialScheduleState;
  });

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('zenithState', JSON.stringify(state));
  }, [state]);

  // Helper functions for common operations
  const addActivity = (activity: Activity) => {
    dispatch({ type: 'ADD_ACTIVITY', payload: activity });
  };

  const removeActivity = (id: string) => {
    dispatch({ type: 'REMOVE_ACTIVITY', payload: id });
  };

  const updateActivity = (activity: Activity) => {
    dispatch({ type: 'UPDATE_ACTIVITY', payload: activity });
  };

  const addTimeBlock = (timeBlock: TimeBlock) => {
    dispatch({ type: 'ADD_TIME_BLOCK', payload: timeBlock });
  };

  const removeTimeBlock = (id: string) => {
    dispatch({ type: 'REMOVE_TIME_BLOCK', payload: id });
  };

  const updateTimeBlock = (timeBlock: TimeBlock) => {
    dispatch({ type: 'UPDATE_TIME_BLOCK', payload: timeBlock });
  };

  // Calculate metrics
  const calculateProductivity = (): number => {
    // Contar bloques de tiempo ocupados con tipos de actividad productiva
    // Incluye ejercicio y descanso ya que contribuyen al bienestar y rendimiento académico
    const productiveTime = state.timeBlocks.reduce((total, block) => {
      if (block.type === 'occupied' && 
          block.activityType && 
          ['academic', 'work', 'study', 'exercise', 'rest'].includes(block.activityType)) {
        const [startHour, startMinute] = block.startTime.split(':').map(Number);
        const [endHour, endMinute] = block.endTime.split(':').map(Number);
        
        const start = startHour + (startMinute / 60);
        const end = endHour + (endMinute / 60);
        
        if (end < start) return total;
        
        return total + (end - start);
      }
      return total;
    }, 0);

    // Calculamos la productividad basada en el tiempo disponible real (excluyendo tiempo de sueño)
    const dailyAvailableHours = 16; // 24 horas - 8 horas de sueño
    const weeklyAvailableHours = dailyAvailableHours * 7;
    
    // La productividad es el porcentaje del tiempo productivo sobre el tiempo disponible
    return Math.min(Math.round((productiveTime / weeklyAvailableHours) * 100), 100);
  };

  const getActivityDuration = (type: ActivityType): number => {
    return state.activities
      .filter(activity => activity.type === type)
      .reduce((total, activity) => {
        if (activity.timeBlockId) {
          const block = state.timeBlocks.find(b => b.id === activity.timeBlockId);
          if (!block) return total + activity.duration;
          
          const [startHour, startMinute] = block.startTime.split(':').map(Number);
          const [endHour, endMinute] = block.endTime.split(':').map(Number);
          
          const start = startHour + (startMinute / 60);
          const end = endHour + (endMinute / 60);
          
          return end >= start ? total + (end - start) : total + activity.duration;
        }
        return total + activity.duration;
      }, 0);
  };
  const getTotalFreeTime = (): number => {
    const dailyAvailableHours = 16; // 24 horas - 8 horas de sueño
    const totalWeeklyHours = dailyAvailableHours * 7; // 112 horas semanales disponibles
    const occupiedTime = getTotalOccupiedTime();
    // Ensure we don't return negative values
    return Math.max(0, totalWeeklyHours - occupiedTime);
  };
  const getTotalOccupiedTime = (): number => {
    // Sum all occupied time blocks
    return state.timeBlocks.reduce((total, block) => {
      if (block.type === 'occupied') {
        // Parse times to numbers
        const [startHour, startMinute] = block.startTime.split(':').map(Number);
        const [endHour, endMinute] = block.endTime.split(':').map(Number);
        
        // Si el bloque está en horas de sueño (22:00 - 06:00), no lo contamos
        if (startHour >= 22 || startHour < 6) {
          return total;
        }
        
        // Calculate duration in decimal hours
        const start = startHour + (startMinute / 60);
        const end = endHour + (endMinute / 60);
        
        // Si el bloque cruza la medianoche o el horario de sueño, ajustamos el tiempo
        if (end < start || end > 22) {
          // Si termina después de las 22, contamos solo hasta las 22
          const adjustedEnd = end > 22 ? 22 : end;
          return total + (adjustedEnd - start);
        }
        
        return total + (end - start);
      }
      return total;
    }, 0);
  };

  return (
    <ZenithContext.Provider value={{
      state,
      dispatch,
      addActivity,
      removeActivity,
      updateActivity,
      addTimeBlock,
      removeTimeBlock,
      updateTimeBlock,
      calculateProductivity,
      getActivityDuration,
      getTotalFreeTime,
      getTotalOccupiedTime
    }}>
      {children}
    </ZenithContext.Provider>
  );
};

export const useZenith = (): ZenithContextType => {
  const context = useContext(ZenithContext);
  if (context === undefined) {
    throw new Error('useZenith must be used within a ZenithProvider');
  }
  return context;
};
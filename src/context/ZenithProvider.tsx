import React, { createContext, useReducer, useEffect } from 'react';
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

export const ZenithContext = createContext<ZenithContextType | undefined>(undefined);

export const ZenithProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(scheduleReducer, initialScheduleState, () => {
    const savedState = localStorage.getItem('zenithState');
    return savedState ? JSON.parse(savedState) : initialScheduleState;
  });

  useEffect(() => {
    localStorage.setItem('zenithState', JSON.stringify(state));
  }, [state]);

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

  const calculateProductivity = (): number => {
    const productiveTime = state.timeBlocks.reduce((total, block) => {
      if (block.type === 'occupied' && 
          block.activityType && 
          ['academic', 'work', 'study', 'exercise', 'rest'].includes(block.activityType)) {
        const [startHour, startMinute] = block.startTime.split(':').map(Number);
        const [endHour, endMinute] = block.endTime.split(':').map(Number);
          const start = startHour + (startMinute / 60);
        const end = endHour + (endMinute / 60);
        
        // Si el bloque cruza la medianoche, calculamos ambas partes
        if (end < start) {
          return total + (24 - start) + end;
        }
        
        return total + (end - start);
      }
      return total;
    }, 0);

    const dailyAvailableHours = 16;
    const weeklyAvailableHours = dailyAvailableHours * 7;
    
    return Math.min(Math.round((productiveTime / weeklyAvailableHours) * 100), 100);
  };
  const getActivityDuration = (type: ActivityType): number => {
    // Primero, sumamos la duración de los bloques de tiempo ocupados del tipo específico
    const blocksDuration = state.timeBlocks
      .filter(block => block.type === 'occupied' && block.activityType === type)
      .reduce((total, block) => {
        const [startHour, startMinute] = block.startTime.split(':').map(Number);
        const [endHour, endMinute] = block.endTime.split(':').map(Number);
        
        const start = startHour + (startMinute / 60);
        const end = endHour + (endMinute / 60);
        
        // Si el bloque cruza la medianoche, calculamos ambas partes
        if (end < start) {
          return total + (24 - start) + end;
        }
        
        return total + (end - start);
      }, 0);

    // Luego, sumamos las duraciones de las actividades que no tienen bloque de tiempo asignado
    const activitiesWithoutBlockDuration = state.activities
      .filter(activity => 
        activity.type === type && 
        !activity.timeBlockId
      )
      .reduce((total, activity) => {
        // Si la actividad tiene días preferidos, multiplicamos por el número de días
        const daysMultiplier = activity.preferredDays?.length || 1;
        return total + (activity.duration * daysMultiplier);
      }, 0);

    return blocksDuration + activitiesWithoutBlockDuration;
  };
  const getTotalFreeTime = (): number => {
    const dailyAvailableHours = 16; // 24 horas - 8 horas de sueño
    const totalWeeklyHours = dailyAvailableHours * 7; // 112 horas semanales disponibles
    const occupiedTime = getTotalOccupiedTime();
    return Math.max(0, totalWeeklyHours - occupiedTime);
  };  const getTotalOccupiedTime = (): number => {
    return state.timeBlocks.reduce((total, block) => {
      if (block.type === 'occupied') {
        const [startHour, startMinute] = block.startTime.split(':').map(Number);
        const [endHour, endMinute] = block.endTime.split(':').map(Number);
        
        // Si el bloque está en horas de sueño (22:00 - 06:00), no lo contamos
        if (startHour >= 22 || startHour < 6) {
          return total;
        }
        
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

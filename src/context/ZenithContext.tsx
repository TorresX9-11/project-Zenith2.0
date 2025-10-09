import React, { createContext, useContext, useReducer, useEffect, useMemo } from 'react';
import { scheduleReducer, initialScheduleState } from '../reducers/scheduleReducer';
import { ActivityType, ScheduleState, ScheduleAction, TimeBlock, Activity } from '../types';
import { 
  selectTotalOccupiedMinutes,
  selectHoursByType,
  selectNextBlocks,
  selectPlannedMinutesByDay,
  selectUnplannedActivitiesByDay,
  selectUnplannedActivityHoursByType,
  selectTotalFreeHours,
  selectAdherenceRate,
  selectCompletionProgress,
  selectProductivityScore,
  WEEKLY_AVAILABLE_MINUTES
} from '../selectors/schedule';

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
  // Expose selectors
  selectTotalOccupiedMinutes: () => number;
  selectHoursByType: (type: ActivityType) => number;
  selectNextBlocks: (n: number) => TimeBlock[];
  selectPlannedMinutesByDay: (dayIndex: number) => number;
  selectUnplannedActivitiesByDay: (dayIndex: number) => ReturnType<typeof selectUnplannedActivitiesByDay>;
  selectUnplannedActivityHoursByType: (type: ActivityType) => number;
  selectTotalFreeHours: () => number;
  selectAdherenceRate: () => number;
  selectCompletionProgress: () => number;
  selectProductivityScore: () => number;
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
    const productiveTypes: ActivityType[] = ['academic', 'work', 'study', 'exercise', 'rest'];
    const minutes = productiveTypes
      .map(t => selectHoursByType(state, t))
      .reduce((acc, h) => acc + h * 60, 0);
    return Math.min(Math.round((minutes / WEEKLY_AVAILABLE_MINUTES) * 100), 100);
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
    const occupiedMinutes = selectTotalOccupiedMinutes(state);
    const freeMinutes = Math.max(0, WEEKLY_AVAILABLE_MINUTES - occupiedMinutes);
    return freeMinutes / 60;
  };
  const getTotalOccupiedTime = (): number => {
    return selectTotalOccupiedMinutes(state) / 60;
  };

  // Memoized selector wrappers for consumers
  const memoSelectTotalOccupiedMinutes = useMemo(() => () => selectTotalOccupiedMinutes(state), [state]);
  const memoSelectHoursByType = useMemo(() => (type: ActivityType) => selectHoursByType(state, type), [state]);
  const memoSelectNextBlocks = useMemo(() => (n: number) => selectNextBlocks(state, n), [state]);
  const memoSelectPlannedMinutesByDay = useMemo(() => (dayIndex: number) => selectPlannedMinutesByDay(state, dayIndex), [state]);
  const memoSelectUnplannedActivitiesByDay = useMemo(() => (dayIndex: number) => selectUnplannedActivitiesByDay(state, dayIndex), [state]);
  const memoSelectUnplannedActivityHoursByType = useMemo(() => (type: ActivityType) => selectUnplannedActivityHoursByType(state, type), [state]);
  const memoSelectTotalFreeHours = useMemo(() => () => selectTotalFreeHours(state), [state]);
  const memoSelectAdherenceRate = useMemo(() => () => selectAdherenceRate(state), [state]);
  const memoSelectCompletionProgress = useMemo(() => () => selectCompletionProgress(state), [state]);
  const memoSelectProductivityScore = useMemo(() => () => selectProductivityScore(state), [state]);

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
      getTotalOccupiedTime,
      selectTotalOccupiedMinutes: memoSelectTotalOccupiedMinutes,
      selectHoursByType: memoSelectHoursByType,
      selectNextBlocks: memoSelectNextBlocks,
      selectPlannedMinutesByDay: memoSelectPlannedMinutesByDay,
      selectUnplannedActivitiesByDay: memoSelectUnplannedActivitiesByDay,
      selectUnplannedActivityHoursByType: memoSelectUnplannedActivityHoursByType,
      selectTotalFreeHours: memoSelectTotalFreeHours,
      selectAdherenceRate: memoSelectAdherenceRate,
      selectCompletionProgress: memoSelectCompletionProgress,
      selectProductivityScore: memoSelectProductivityScore
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
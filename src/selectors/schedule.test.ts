import { describe, it, expect } from 'vitest';
import { 
  selectHoursByType,
  selectUnplannedActivityHoursByType,
  selectTotalFreeHours,
  selectAdherenceRate,
  selectProductivityScore,
  WEEKLY_AVAILABLE_MINUTES
} from './schedule';
import { ScheduleState } from '../types';

const baseState: ScheduleState = {
  timeBlocks: [],
  activities: [],
  settings: {
    studyTechniques: { pomodoro: true, feynman: false, spaced: false, conceptMapping: false },
    minimumSleepHours: 7,
    breakDuration: 15,
    maximumStudySession: 120,
    activeWindow: { startHour: 5, endHour: 21 },
    productivityWeights: { adherenceWeight: 0.7, completionWeight: 0.3 }
  }
};

describe('schedule selectors', () => {
  it('selectHoursByType sums planned hours by type', () => {
    const state: ScheduleState = {
      ...baseState,
      timeBlocks: [
        { id: '1', day: 'lunes', startTime: '08:00', endTime: '10:00', type: 'occupied', title: 'A', activityType: 'academic' },
        { id: '2', day: 'martes', startTime: '06:00', endTime: '07:00', type: 'occupied', title: 'B', activityType: 'study' }
      ]
    };
    expect(selectHoursByType(state, 'academic')).toBeCloseTo(2);
    expect(selectHoursByType(state, 'study')).toBeCloseTo(1);
  });

  it('selectUnplannedActivityHoursByType sums estimatedDuration for activities without timeBlockId', () => {
    const state: ScheduleState = {
      ...baseState,
      activities: [
        { id: 'a1', name: 'X', type: 'academic', duration: 0, priority: 'medium', estimatedDuration: 2, preferredTime: { startHour: 8, endHour: 9 } },
        { id: 'a2', name: 'Y', type: 'study', duration: 0, priority: 'medium', timeBlockId: 'tb', estimatedDuration: 3, preferredTime: { startHour: 8, endHour: 9 } },
        { id: 'a3', name: 'Z', type: 'academic', duration: 0, priority: 'medium', estimatedDuration: 1.5, preferredTime: { startHour: 8, endHour: 9 } }
      ]
    };
    expect(selectUnplannedActivityHoursByType(state, 'academic')).toBeCloseTo(3.5);
    expect(selectUnplannedActivityHoursByType(state, 'study')).toBeCloseTo(0);
  });

  it('selectTotalFreeHours returns remaining hours from 112h base', () => {
    const state: ScheduleState = {
      ...baseState,
      timeBlocks: [
        { id: '1', day: 'lunes', startTime: '08:00', endTime: '12:00', type: 'occupied', title: 'A', activityType: 'academic' }
      ]
    };
    const free = selectTotalFreeHours(state);
    expect(free).toBeCloseTo((WEEKLY_AVAILABLE_MINUTES - 240) / 60);
  });

  it('adherence & productivity score compute from completed timeBlocks', () => {
    const state: ScheduleState = {
      ...baseState,
      timeBlocks: [
        { id: '1', day: 'lunes', startTime: '08:00', endTime: '10:00', type: 'occupied', title: 'A', activityType: 'academic', completedAt: '2025-10-08T10:00:00Z' },
        { id: '2', day: 'martes', startTime: '06:00', endTime: '10:00', type: 'occupied', title: 'B', activityType: 'study' }
      ]
    };
    const adherence = selectAdherenceRate(state);
    expect(adherence).toBeGreaterThan(0);
    const productivity = selectProductivityScore(state);
    expect(productivity).toBeGreaterThan(0);
  });
});



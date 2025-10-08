import { ScheduleState, ActivityType, TimeBlock, DayOfWeek } from '../types';

// Helpers
const DAY_TO_INDEX: Record<DayOfWeek, number> = {
  lunes: 0,
  martes: 1,
  miércoles: 2,
  jueves: 3,
  viernes: 4,
  sábado: 5,
  domingo: 6
};

export const toMinutes = (hhmm: string): number => {
  const [h, m] = hhmm.split(':').map(Number);
  return (h * 60) + (m || 0);
};

export const minutesToHHMM = (min: number): string => {
  const h = Math.floor(min / 60) % 24;
  const m = Math.abs(min % 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

export const blockWeekRange = (block: TimeBlock): { start: number; end: number } => {
  const dayIndex = DAY_TO_INDEX[block.day];
  const start = (dayIndex * 24 * 60) + toMinutes(block.startTime);
  const rawEndMinutes = toMinutes(block.endTime);
  const endDayIndex = rawEndMinutes >= toMinutes(block.startTime) ? dayIndex : (dayIndex + 1);
  const end = (endDayIndex * 24 * 60) + rawEndMinutes;
  return { start, end };
};

export const blocksOverlap = (a: TimeBlock, b: TimeBlock): boolean => {
  const ra = blockWeekRange(a);
  const rb = blockWeekRange(b);
  return ra.start < rb.end && ra.end > rb.start;
};

// Active window helpers
const getActiveWindow = (state: ScheduleState): { start: number; end: number } => {
  const startHour = state.settings?.activeWindow?.startHour ?? 5;
  const endHour = state.settings?.activeWindow?.endHour ?? 21;
  return { start: startHour * 60, end: endHour * 60 };
};

const getBlockDurationWithinWindow = (block: TimeBlock, state: ScheduleState): number => {
  const { start: winStart, end: winEnd } = getActiveWindow(state);
  const start = toMinutes(block.startTime);
  const end = toMinutes(block.endTime);

  // Handle cross-midnight by splitting into two segments
  const segments: Array<{ s: number; e: number }> = end >= start
    ? [{ s: start, e: end }]
    : [{ s: start, e: 24 * 60 }, { s: 0, e: end }];

  return segments.reduce((acc, seg) => {
    const s = Math.max(seg.s, winStart);
    const e = Math.min(seg.e, winEnd);
    return acc + Math.max(0, e - s);
  }, 0);
};

// Selectors
export const selectTotalOccupiedMinutes = (state: ScheduleState): number => {
  return state.timeBlocks.reduce((total, block) => {
    if (block.type !== 'occupied') return total;
    return total + getBlockDurationWithinWindow(block, state);
  }, 0);
};

export const selectHoursByType = (state: ScheduleState, type: ActivityType): number => {
  const minutes = state.timeBlocks
    .filter(b => b.type === 'occupied' && b.activityType === type)
    .reduce((sum, b) => sum + getBlockDurationWithinWindow(b, state), 0);
  return minutes / 60;
};

export const selectNextBlocks = (state: ScheduleState, n: number): TimeBlock[] => {
  const now = new Date();
  const jsDay = now.getDay(); // 0 Sunday..6 Saturday
  const dayIndex = jsDay === 0 ? 6 : jsDay - 1; // map to lunes=0..domingo=6
  const minutesNow = (dayIndex * 24 * 60) + (now.getHours() * 60 + now.getMinutes());

  const withRanges = state.timeBlocks.map(b => ({ b, r: blockWeekRange(b) }));
  const upcoming = withRanges
    .filter(x => x.r.end > minutesNow) // not finished yet
    .sort((a, b) => a.r.start - b.r.start)
    .map(x => x.b);

  return upcoming.slice(0, Math.max(0, n));
};

export const selectPlannedMinutesByDay = (state: ScheduleState, dayIndex: number): number => {
  const dayName = (Object.keys(DAY_TO_INDEX) as DayOfWeek[]).find(k => DAY_TO_INDEX[k] === dayIndex);
  if (!dayName) return 0;
  return state.timeBlocks
    .filter(b => b.type === 'occupied' && b.day === dayName)
    .reduce((sum, b) => sum + getBlockDurationWithinWindow(b, state), 0);
};

export const DAILY_AVAILABLE_MINUTES = 16 * 60; // 16h por día
export const WEEKLY_AVAILABLE_MINUTES = DAILY_AVAILABLE_MINUTES * 7;

// Unplanned activities by day (exclude those with timeBlockId)
export const selectUnplannedActivitiesByDay = (state: ScheduleState, dayIndex: number) => {
  return state.activities
    .filter(a => !a.timeBlockId && a.dayIndex === dayIndex)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
};

export const selectUnplannedActivityHoursByType = (state: ScheduleState, type: ActivityType): number => {
  const total = state.activities
    .filter(a => !a.timeBlockId && a.type === type)
    .reduce((sum, a) => sum + (a.estimatedDuration || 0), 0);
  return total;
};

export const selectTotalFreeHours = (state: ScheduleState): number => {
  const occupiedMinutes = selectTotalOccupiedMinutes(state);
  const freeMinutes = Math.max(0, WEEKLY_AVAILABLE_MINUTES - occupiedMinutes);
  return freeMinutes / 60;
};



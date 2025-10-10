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
  const getBlockDurationFull = (block: TimeBlock): number => {
    const start = toMinutes(block.startTime);
    const end = toMinutes(block.endTime);
    return end >= start ? (end - start) : ((24 * 60) - start) + end;
  };

  const minutes = state.timeBlocks
    .filter(b => b.type === 'occupied' && b.activityType === type)
    .reduce((sum, b) => {
      if (type === 'rest') {
        // Para 'rest', contar la duración completa del bloque, sin recortar por la ventana activa
        return sum + getBlockDurationFull(b);
      }
      return sum + getBlockDurationWithinWindow(b, state);
    }, 0);
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
  const totalHours = state.activities
    .filter(a => !a.timeBlockId && a.type === type)
    .reduce((sum, a) => {
      const minutes = (a.estimatedMinutes !== undefined && a.estimatedMinutes !== null)
        ? a.estimatedMinutes
        : ((a.estimatedDuration || 0) * 60);
      return sum + (minutes / 60);
    }, 0);
  return totalHours;
};

export const selectTotalFreeHours = (state: ScheduleState): number => {
  const occupiedMinutes = selectTotalOccupiedMinutes(state);
  const freeMinutes = Math.max(0, WEEKLY_AVAILABLE_MINUTES - occupiedMinutes);
  return freeMinutes / 60;
};

// Adherence & Completion
export const selectAdherenceRate = (state: ScheduleState): number => {
  type UrgencyKey = 'very_urgent' | 'urgent' | 'medium' | 'normal' | 'low';
  const typeWeights = state.settings.typeWeights || {
    academic: 1.0,
    study: 0.9,
    exercise: 0.6,
    social: 0.4,
    work: 0.5,
    rest: 0.4,
    personal: 0.3
  };
  const urgencyWeights = state.settings.urgencyWeights || {
    very_urgent: 1.0,
    urgent: 0.8,
    medium: 0.6,
    normal: 0.4,
    low: 0.2
  };

  const isPlanned = (a: any) => !!a.timeBlockId || (a.preferredDays && a.preferredDays.length) || !!a.preferredTime;

  const planned = state.activities.filter(a => isPlanned(a));
  const denom = planned.reduce((s, a) => s + (typeWeights[a.type] ?? 1), 0);
  if (denom === 0) return 0;
  const num = planned
    .filter(a => a.completed)
    .reduce((s, a) => {
      const uk: UrgencyKey = (a.urgency ?? 'normal') as UrgencyKey;
      return s + (typeWeights[a.type] ?? 1) * (urgencyWeights[uk] ?? 0.4);
    }, 0);
  return Math.min(100, Math.round((num / denom) * 100));
};

export const selectCompletionProgress = (state: ScheduleState): number => {
  type UrgencyKey = 'very_urgent' | 'urgent' | 'medium' | 'normal' | 'low';
  const typeWeights = state.settings.typeWeights || {
    academic: 1.0,
    study: 0.9,
    exercise: 0.6,
    social: 0.4,
    work: 0.5,
    rest: 0.4,
    personal: 0.3
  };
  const urgencyWeights = state.settings.urgencyWeights || {
    very_urgent: 1.0,
    urgent: 0.8,
    medium: 0.6,
    normal: 0.4,
    low: 0.2
  };
  const activities = state.activities;
  const denom = activities.reduce((s, a) => s + (typeWeights[a.type] ?? 1), 0);
  if (denom === 0) return 0;
  const num = activities
    .filter(a => a.completed)
    .reduce((s, a) => {
      const uk: UrgencyKey = (a.urgency ?? 'normal') as UrgencyKey;
      return s + (typeWeights[a.type] ?? 1) * (urgencyWeights[uk] ?? 0.4);
    }, 0);
  return Math.min(100, Math.round((num / denom) * 100));
};

export const selectProductivityScore = (state: ScheduleState): number => {
  const adherence = selectAdherenceRate(state);
  const completion = selectCompletionProgress(state);
  const aw = state.settings.productivityWeights?.adherenceWeight ?? 0.7;
  const cw = state.settings.productivityWeights?.completionWeight ?? 0.3;
  const score = (adherence * aw) + (completion * cw);
  return Math.round(score);
};



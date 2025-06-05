import { Activity, TimeBlock, ActivityType } from '../types';

export const calculateActivityDuration = (
  activity: Activity,
  timeBlock?: TimeBlock | null
): number => {
  if (!timeBlock) {
    // Si no hay bloque de tiempo, usar la duración especificada
    const daysCount = activity.preferredDays?.length || 1;
    return (activity.duration || 0) * daysCount;
  }

  // Parsear las horas y minutos
  const [startHour, startMinute] = timeBlock.startTime.split(':').map(Number);
  const [endHour, endMinute] = timeBlock.endTime.split(':').map(Number);
  
  // Convertir a decimal
  const start = startHour + (startMinute / 60);
  const end = endHour + (endMinute / 60);
  
  // Si el tiempo de fin es menor que el de inicio, significa que cruza medianoche
  const duration = end >= start 
    ? end - start 
    : (24 - start) + end;
  
  // Multiplicar por los días preferidos si existen
  const daysCount = activity.preferredDays?.length || 1;
  return duration * daysCount;
};

export const getTotalActivityDuration = (
  activities: Activity[],
  timeBlocks: TimeBlock[],
  type: ActivityType
): number => {
  return activities
    .filter(activity => activity.type === type)
    .reduce((total, activity) => {
      const timeBlock = activity.timeBlockId 
        ? timeBlocks.find(b => b.id === activity.timeBlockId)
        : null;
      
      return total + calculateActivityDuration(activity, timeBlock);
    }, 0);
};

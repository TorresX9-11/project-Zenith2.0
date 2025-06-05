import React from 'react';
import { TimeBlock, DayOfWeek, ActivityType } from '../types';
import { Clock, Edit, Trash2 } from 'lucide-react';

interface TimeTableProps {
  timeBlocks: TimeBlock[];
  startHour?: number;
  endHour?: number;
  onSlotClick?: (day: DayOfWeek, hour: number) => void;
  onEditBlock?: (block: TimeBlock) => void;
  onDeleteBlock?: (block: TimeBlock) => void;
}

const TimeTable: React.FC<TimeTableProps> = ({
  timeBlocks,
  startHour = 5,
  endHour = 22,
  onSlotClick,
  onEditBlock,
  onDeleteBlock
}) => {
  const days: DayOfWeek[] = [
    'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'
  ];

  const dayTranslations: Record<DayOfWeek, string> = {
    lunes: 'Lunes',
    martes: 'Martes',
    miércoles: 'Miércoles',
    jueves: 'Jueves',
    viernes: 'Viernes',
    sábado: 'Sábado',
    domingo: 'Domingo'
  };

  const hours = Array.from(
    { length: endHour - startHour },
    (_, i) => startHour + i
  );

  const formatHour = (hour: number): string => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:00 ${period}`;
  };

  const getActivityColor = (type: string, activityType?: ActivityType): string => {    if (activityType) {
      const colors: Record<ActivityType, string> = {
        academic: 'bg-primary-100 border-primary-300 text-primary-800',
        work: 'bg-purple-100 border-purple-300 text-purple-800',
        study: 'bg-secondary-100 border-secondary-300 text-secondary-800',        exercise: 'bg-green-100 border-green-200 text-green-800',
        rest: 'bg-accent-100 border-accent-300 text-accent-800',
        social: 'bg-yellow-100 border-yellow-200 text-yellow-800',
        personal: 'bg-neutral-100 border-neutral-300 text-neutral-800',
        libre: 'bg-red-100 border-red-200 text-red-800'
      };
      return colors[activityType];
    }

    // Fallback para bloques sin tipo de actividad
    const blockColors: Record<string, string> = {
      free: 'bg-emerald-50 border-emerald-200 text-emerald-800',
      occupied: 'bg-neutral-100 border-neutral-300 text-neutral-800'
    };
    return blockColors[type] || blockColors.occupied;
  };

  const isSlotOccupied = (day: DayOfWeek, hour: number): TimeBlock | undefined => {
    return timeBlocks.find(block => {
      const start = parseInt(block.startTime.split(':')[0]);
      const end = parseInt(block.endTime.split(':')[0]);
      return block.day === day && hour >= start && hour < end;
    });
  };

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[800px]">
        {/* Cabecera con días */}
        <div className="grid grid-cols-8 gap-1 mb-1">
          <div className="h-12 flex items-center justify-center bg-neutral-100 rounded-md">
            <Clock size={20} className="text-neutral-500" />
          </div>
          {days.map(day => (
            <div 
              key={day}
              className="h-12 flex items-center justify-center bg-neutral-100 rounded-md font-medium"
            >
              {dayTranslations[day]}
            </div>
          ))}
        </div>

        {/* Horario */}
        <div className="space-y-1">
          {/* Bloques de hora */}
          {hours.map(hour => (
            <div key={hour} className="grid grid-cols-8 gap-1 h-16"> {/* Aumenté la altura para más contenido */}
              {/* Columna de hora */}
              <div className="flex items-center justify-center text-sm text-neutral-600">
                {formatHour(hour)}
              </div>
              
              {/* Celdas para cada día */}
              {days.map(day => {
                const slot = isSlotOccupied(day, hour);
                
                return (
                  <button
                    key={day}
                    onClick={() => {
                      if (slot && (onEditBlock || onDeleteBlock)) {
                        // Si hay un bloque y funciones de edición/eliminación, no llamar a onSlotClick
                        return;
                      }
                      onSlotClick?.(day, hour);
                    }}
                    className={`rounded-md border transition-colors relative overflow-hidden group ${
                      slot
                        ? `${getActivityColor(slot.type, slot.activityType)} hover:opacity-90`
                        : 'bg-white border-neutral-200 hover:bg-neutral-50'
                    }`}
                  >
                    {slot && (
                      <>
                        <div className="absolute inset-0 p-2 flex flex-col justify-between h-full">
                          <div>
                            <div className="text-sm font-medium truncate">{slot.title}</div>
                            {slot.location && (
                              <div className="text-xs opacity-75 truncate flex items-center gap-1">
                                <span className="inline-block w-2 h-2 rounded-full bg-current" />
                                {slot.location}
                              </div>
                            )}
                          </div>
                          <div className="text-xs opacity-75">
                            {slot.startTime} - {slot.endTime}
                          </div>
                        </div>
                        
                        {/* Opciones de edición y eliminación */}
                        {(onEditBlock || onDeleteBlock) && (
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            {onEditBlock && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onEditBlock(slot);
                                }}
                                className="p-1 bg-white text-neutral-700 rounded-full hover:bg-neutral-100"
                                title="Editar"
                              >
                                <Edit size={16} />
                              </button>
                            )}
                            {onDeleteBlock && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDeleteBlock(slot);
                                }}
                                className="p-1 bg-white text-error-600 rounded-full hover:bg-error-50"
                                title="Eliminar"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TimeTable;

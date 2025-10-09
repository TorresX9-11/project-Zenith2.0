import React, { useState } from 'react';
import { TimeBlock, DayOfWeek, ActivityType } from '../types';
import { Clock, Edit, Trash2, MapPin, Calendar, User } from 'lucide-react';

interface TimeTableProps {
  timeBlocks: TimeBlock[];
  startHour?: number;
  endHour?: number;
  onSlotClick?: (day: DayOfWeek, hour: number, minute?: number) => void;
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
  const [hoveredSlot, setHoveredSlot] = useState<TimeBlock | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
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

  const hours = Array.from({ length: endHour - startHour }, (_, i) => startHour + i);
  const rowHeight = 88; // px per hour row (más alto para evitar solapamiento visual)
  const pxPerMinute = rowHeight / 60;
  const totalHeight = (endHour - startHour) * rowHeight;

  const formatHourRange = (hour: number): string => {
    const start = `${hour.toString().padStart(2, '0')}:00`;
    const next = (hour + 1) % 24;
    const end = `${next.toString().padStart(2, '0')}:00`;
    return `${start} - ${end}`;
  };

  const getActivityColor = (type: string, activityType?: ActivityType): string => {    if (activityType) {
      const colors: Record<ActivityType, string> = {
        academic: 'bg-primary-100 border-primary-300 text-primary-800',
        work: 'bg-purple-100 border-purple-300 text-purple-800',
        study: 'bg-secondary-100 border-secondary-300 text-secondary-800',        exercise: 'bg-green-100 border-green-200 text-green-800',
        rest: 'bg-accent-100 border-accent-300 text-accent-800',
        social: 'bg-yellow-100 border-yellow-200 text-yellow-800',
        personal: 'bg-neutral-100 border-neutral-300 text-neutral-800'
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

  const handleMouseEnter = (slot: TimeBlock, event: React.MouseEvent) => {
    setHoveredSlot(slot);
    const rect = event.currentTarget.getBoundingClientRect();
    setTooltipPosition({
      x: rect.left + rect.width / 2,
      y: rect.top - 10
    });
  };

  const handleMouseLeave = () => {
    setHoveredSlot(null);
  };

  const getActivityTypeLabel = (type?: ActivityType): string => {
    const labels: Record<ActivityType, string> = {
      academic: 'Académico',
      work: 'Trabajo',
      study: 'Estudio',
      exercise: 'Ejercicio',
      rest: 'Descanso',
      social: 'Social',
      personal: 'Personal'
    };
    return type ? labels[type] : 'Sin clasificar';
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

        {/* Horario: columna de horas + columnas por día con líneas suaves */}
        <div className="grid grid-cols-8 gap-1">
          {/* Rail de horas */}
          <div className="relative">
            <div style={{ height: `${totalHeight}px` }} className="relative">
              {hours.map(hour => (
                <div key={hour} style={{ height: `${rowHeight}px` }} className="flex items-center justify-center text-xs sm:text-sm text-neutral-600">
                  {formatHourRange(hour)}
                </div>
              ))}
            </div>
          </div>
          {/* Columnas de días */}
          {days.map(day => {
            const dayBlocks = getBlocksForDay(timeBlocks, day, startHour, endHour, pxPerMinute);
            const minorStep = 15 * pxPerMinute;
            const bgLines = `repeating-linear-gradient(to bottom, rgba(0,0,0,0.08) 0, rgba(0,0,0,0.08) 1px, transparent 1px, transparent ${minorStep}px), repeating-linear-gradient(to bottom, rgba(0,0,0,0.08) 0, rgba(0,0,0,0.08) 1px, transparent 1px, transparent ${rowHeight}px)`;
            return (
              <div key={day} className="relative rounded-none border bg-white border-neutral-200 overflow-hidden" style={{ height: `${totalHeight}px`, backgroundImage: bgLines }}>
                {dayBlocks.map(b => (
                  <div key={b.id}
                    className={`absolute left-0 right-0 mx-1 my-0.5 rounded-none ${getActivityColor('occupied', b.activityType)} shadow-sm border cursor-pointer group z-10`}
                    style={{ top: `${b.top}px`, height: `${b.height}px` }}
                    onMouseEnter={(e) => handleMouseEnter(b as any, e)}
                    onMouseLeave={handleMouseLeave}
                  >
                    <div className="px-2 py-1 text-[11px] leading-tight h-full flex flex-col">
                      <div className="font-semibold truncate text-neutral-800">{b.title}</div>
                      {b.description && <div className="text-[11px] text-neutral-600 mt-0.5 whitespace-normal break-words line-clamp-2">{b.description}</div>}
                      <div className="mt-auto flex items-center justify-between pt-1">
                        <div className="text-[11px] opacity-75">{b.startTime} - {b.endTime}</div>
                        <div className="flex items-center gap-1">
                          {onEditBlock && (
                            <button title="Editar" className="p-1 text-neutral-700 hover:text-neutral-900 bg-white/70 rounded" onClick={(e) => { e.stopPropagation(); onEditBlock(b as any); }}>
                              <Edit size={12} />
                            </button>
                          )}
                          {onDeleteBlock && (
                            <button title="Eliminar" className="p-1 text-red-600 hover:text-red-700 bg-white/70 rounded" onClick={(e) => { e.stopPropagation(); onDeleteBlock(b as any); }}>
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {/* Áreas clicables por cuartos en toda la columna */}
                {Array.from({ length: (endHour - startHour) * 4 }, (_, i) => i).map(i => {
                  const minutesFromStart = i * 15;
                  const top = minutesFromStart * pxPerMinute;
                  const hour = Math.floor(minutesFromStart / 60) + startHour;
                  const minute = minutesFromStart % 60;
                  return (
                    <button key={i} className="absolute left-0 right-0" style={{ top: `${top}px`, height: `${15 * pxPerMinute}px` }} onClick={() => onSlotClick?.(day, hour, minute)} />
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Tooltip */}
      {hoveredSlot && (
        <div
          className="fixed z-50 bg-white border border-neutral-200 rounded-lg shadow-lg p-4 max-w-xs pointer-events-none"
          style={{
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y}px`,
            transform: 'translateX(-50%) translateY(-100%)'
          }}
        >
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-primary-600" />
              <h3 className="font-semibold text-neutral-800">{hoveredSlot.title}</h3>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-neutral-600">
              <Clock size={14} />
              <span>{hoveredSlot.startTime} - {hoveredSlot.endTime}</span>
            </div>
            
            {hoveredSlot.activityType && (
              <div className="flex items-center gap-2 text-sm">
                <User size={14} className="text-neutral-500" />
                <span className="text-neutral-600">{getActivityTypeLabel(hoveredSlot.activityType)}</span>
              </div>
            )}
            
            {hoveredSlot.location && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin size={14} className="text-neutral-500" />
                <span className="text-neutral-600">{hoveredSlot.location}</span>
              </div>
            )}
            
            {/* Descripción se muestra solo en el bloque, no en tooltip */}
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeTable;

function getBlocksForCell(blocks: TimeBlock[], day: DayOfWeek, hour: number, rowHeight: number, pxPerMinute: number) {
  const cellStart = hour * 60;
  const cellEnd = (hour + 1) * 60;
  return blocks
    .filter(b => b.day === day)
    .map(b => ({
      ...b,
      s: parseInt(b.startTime.split(':')[0]) * 60 + parseInt(b.startTime.split(':')[1] || '0'),
      e: parseInt(b.endTime.split(':')[0]) * 60 + parseInt(b.endTime.split(':')[1] || '0')
    }))
    .filter(b => b.e > cellStart && b.s < cellEnd)
    .map(b => {
      const topMin = Math.max(0, b.s - cellStart);
      const bottomMin = Math.max(0, Math.min(cellEnd, b.e) - cellStart);
      return {
        ...b,
        top: topMin * pxPerMinute,
        height: Math.max(2, (bottomMin - topMin) * pxPerMinute)
      };
    });
}

function getBlocksForDay(
  blocks: TimeBlock[],
  day: DayOfWeek,
  startHour: number,
  endHour: number,
  pxPerMinute: number
) {
  const colStart = startHour * 60;
  const colEnd = endHour * 60;
  return blocks
    .filter(b => b.day === day)
    .map(b => ({
      ...b,
      s: parseInt(b.startTime.split(':')[0]) * 60 + parseInt(b.startTime.split(':')[1] || '0'),
      e: parseInt(b.endTime.split(':')[0]) * 60 + parseInt(b.endTime.split(':')[1] || '0')
    }))
    .filter(b => b.e > colStart && b.s < colEnd)
    .map(b => {
      const topMin = Math.max(0, b.s - colStart);
      const bottomMin = Math.max(0, Math.min(colEnd, b.e) - colStart);
      return {
        ...b,
        top: topMin * pxPerMinute,
        height: Math.max(2, (bottomMin - topMin) * pxPerMinute)
      };
    });
}

import React, { useState } from 'react';
import { TimeBlock, DayOfWeek, ActivityType } from '../types';
import { Clock, Edit, Trash2, MapPin, Calendar, User } from 'lucide-react';

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
      personal: 'Personal',
      libre: 'Libre'
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
                
                // Si hay slot y acciones de edición/eliminación, renderizar como <div> para evitar <button> anidados
                if (slot && (onEditBlock || onDeleteBlock)) {
                  return (
                    <div
                      key={day}
                      className={`rounded-md border transition-colors relative overflow-hidden group cursor-pointer ${getActivityColor(slot.type, slot.activityType)} hover:opacity-90`}
                      onMouseEnter={(e) => handleMouseEnter(slot, e)}
                      onMouseLeave={handleMouseLeave}
                    >
                      <div className="absolute inset-0 p-2 flex flex-col justify-between h-full">
                        <div>
                          <div className="text-sm font-medium truncate">{slot.title}</div>
                        </div>
                        <div className="text-xs opacity-75">
                          {slot.startTime} - {slot.endTime}
                        </div>
                      </div>
                      {/* Opciones de edición y eliminación */}
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
                    </div>
                  );
                } else {
                  // Celda libre o solo clic para agregar
                  return (
                    <button
                      key={day}
                      onClick={() => {
                        onSlotClick?.(day, hour);
                      }}
                      onMouseEnter={slot ? (e) => handleMouseEnter(slot, e) : undefined}
                      onMouseLeave={slot ? handleMouseLeave : undefined}
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
                            </div>
                            <div className="text-xs opacity-75">
                              {slot.startTime} - {slot.endTime}
                            </div>
                          </div>
                        </>
                      )}
                    </button>
                  );
                }
              })}
            </div>
          ))}
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
            
            {hoveredSlot.description && (
              <div className="text-sm text-neutral-600 pt-1 border-t border-neutral-100">
                <p className="line-clamp-2">{hoveredSlot.description}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeTable;

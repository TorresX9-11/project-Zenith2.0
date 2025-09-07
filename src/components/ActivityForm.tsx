
import React from 'react';
import { Activity, ActivityType, DayOfWeek } from '../types';
import { Save, X, Clock } from 'lucide-react';

interface ActivityFormProps {
  editingActivity: Activity | null;
  newActivity: Partial<Activity>;
  activityTypes: { value: ActivityType; label: string; color: string }[];
  days: { value: DayOfWeek; label: string }[];
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  onDayChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTimeChange: (type: 'start' | 'end', value: string) => void;
  timeBlocks: any[];
}

const ActivityForm: React.FC<ActivityFormProps> = ({
  editingActivity,
  newActivity,
  activityTypes,
  days,
  onSubmit,
  onCancel,
  onChange,
  onDayChange,
  onTimeChange,
  timeBlocks
}) => {
  const currentActivity = editingActivity || newActivity;
  // Día seleccionado (el primero de la lista o el primero de preferredDays)
  const selectedDay = (currentActivity.preferredDays && currentActivity.preferredDays[0]) || days[0]?.value;
  // Horas ocupadas en ese día
  const getTakenHours = () => {
    return timeBlocks
      .filter(block => block.day === selectedDay)
      .map(block => {
        const start = parseInt(block.startTime.split(':')[0], 10);
        const end = parseInt(block.endTime.split(':')[0], 10);
        return { start, end };
      });
  };
  const takenHours = getTakenHours();
  // Verifica si una hora está ocupada
  const isHourTaken = (hour: number) => takenHours.some(({ start, end }) => hour >= start && hour < end);
  // Verifica si el rango está ocupado
  const isRangeTaken = (start: number, end: number) => takenHours.some(({ start: s, end: e }) => start < e && end > s);

  // Horas seleccionadas
  const startHour = currentActivity.preferredTime?.startHour || 8;
  const endHour = currentActivity.preferredTime?.endHour || 9;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6 slide-up">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">
          {editingActivity ? 'Editar Actividad' : 'Agregar Nueva Actividad'}
        </h2>
        <button 
          onClick={onCancel}
          className="text-neutral-500 hover:text-neutral-700"
        >
          <X size={20} />
        </button>
      </div>
      <form onSubmit={onSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-neutral-700 mb-2">
              Nombre
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={currentActivity.name || ''}
              onChange={onChange}
              className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-neutral-700 mb-2">
              Tipo
            </label>
            <select
              id="type"
              name="type"
              value={currentActivity.type || 'study'}
              onChange={onChange}
              className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            >
              {activityTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Tiempo y duración */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label htmlFor="startTime" className="block text-sm font-medium text-neutral-700 mb-2">
              Hora de inicio
            </label>
            <select
              id="startTime"
              value={startHour}
              onChange={e => onTimeChange('start', e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {Array.from({ length: 17 }, (_, i) => 6 + i).map(hour => (
                <option key={hour} value={hour} disabled={isHourTaken(hour)}>
                  {hour.toString().padStart(2, '0') + ':00'} {isHourTaken(hour) ? '(Ocupado)' : ''}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="endTime" className="block text-sm font-medium text-neutral-700 mb-2">
              Hora de fin
            </label>
            <select
              id="endTime"
              value={endHour}
              onChange={e => onTimeChange('end', e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {Array.from({ length: 17 }, (_, i) => 7 + i).map(hour => (
                <option key={hour} value={hour} disabled={isHourTaken(hour)}>
                  {hour.toString().padStart(2, '0') + ':00'} {isHourTaken(hour) ? '(Ocupado)' : ''}
                </option>
              ))}
            </select>
          </div>
          <div className="text-sm text-neutral-600 flex items-center gap-2">
            <Clock size={16} />
            <span>Duración: {endHour - startHour} horas</span>
          </div>
        </div>
        {/* Mensaje de advertencia si el rango está ocupado */}
        {isRangeTaken(startHour, endHour) && (
          <div className="text-red-600 text-xs mb-2">
            El rango de horas seleccionado ya está ocupado. Por favor, elige otro horario.
          </div>
        )}



        <div className="mb-4">
          <label htmlFor="description" className="block text-sm font-medium text-neutral-700 mb-2">
            Descripción (opcional)
          </label>
          <textarea
            id="description"
            name="description"
            value={editingActivity ? editingActivity.description : newActivity.description}
            onChange={onChange}
            rows={3}
            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Escribe una descripción para esta actividad..."
          />
        </div>


        <div className="mb-4">
          <label htmlFor="preferredDay" className="block text-sm font-medium text-neutral-700 mb-2">
            Día
          </label>
          <select
            id="preferredDay"
            name="preferredDay"
            value={currentActivity.preferredDays ? currentActivity.preferredDays[0] : days[0]?.value}
            onChange={e => {
              const day = e.target.value;
              onChange({
                target: {
                  name: 'preferredDays',
                  value: [day]
                }
              } as any);
            }}
            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            required
          >
            {days.map(day => (
              <option key={day.value} value={day.value}>{day.label}</option>
            ))}
          </select>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-neutral-300 text-neutral-700 rounded-md hover:bg-neutral-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors flex items-center gap-2"
          >
            <Save size={18} />
            <span>{editingActivity ? 'Actualizar' : 'Guardar'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ActivityForm;

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
  onTimeChange
}) => {
  const currentActivity = editingActivity || newActivity;
  
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
            <input
              type="time"
              id="startTime"
              value={`${(editingActivity?.preferredTime?.startHour || newActivity.preferredTime?.startHour || 8).toString().padStart(2, '0')}:00`}
              onChange={(e) => onTimeChange('start', e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label htmlFor="endTime" className="block text-sm font-medium text-neutral-700 mb-2">
              Hora de fin
            </label>
            <input
              type="time"
              id="endTime"
              value={`${(editingActivity?.preferredTime?.endHour || newActivity.preferredTime?.endHour || 9).toString().padStart(2, '0')}:00`}
              onChange={(e) => onTimeChange('end', e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>          <div className="text-sm text-neutral-600 flex items-center gap-2">
            <Clock size={16} />
            <span>Duración: {
              (editingActivity?.preferredTime || newActivity.preferredTime) ? 
              Math.round(((editingActivity?.preferredTime?.endHour || newActivity.preferredTime?.endHour || 9) - 
              (editingActivity?.preferredTime?.startHour || newActivity.preferredTime?.startHour || 8)) * 10) / 10
              : 0
            } horas</span>
          </div>
        </div>

        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-neutral-700 mb-2">
            Prioridad
          </label>
          <select
            id="priority"
            name="priority"
            value={editingActivity ? editingActivity.priority : newActivity.priority}
            onChange={onChange}
            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 mb-4"
            required
          >
            <option value="high">Alta</option>
            <option value="medium">Media</option>
            <option value="low">Baja</option>
          </select>
        </div>

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
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Días preferidos (opcional)
          </label>
          <div className="flex flex-wrap gap-3">
            {days.map(day => (
              <label key={day.value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="preferredDays"
                  value={day.value}
                  checked={
                    editingActivity
                      ? (editingActivity.preferredDays || []).includes(day.value)
                      : (newActivity.preferredDays || []).includes(day.value)
                  }
                  onChange={onDayChange}
                  className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-neutral-600">{day.label}</span>
              </label>
            ))}
          </div>
          <p className="text-xs text-neutral-500 mt-2">
            * El horario se aplicará a los días seleccionados
          </p>
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

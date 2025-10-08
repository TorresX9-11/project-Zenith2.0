import React, { useState, useRef } from 'react';
import { useZenith } from '../context/ZenithContext';
import { ActivityType, Activity } from '../types';
import { ListTodo, Plus, BarChart3, Calendar, HelpCircle, X, Link2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
// TimeTable se usa solo en Schedule; aquí usamos selectores
// ActivityForm no se usa en el nuevo seguidor semanal

const Activities: React.FC = () => {
  const { state, addActivity, updateActivity, selectUnplannedActivitiesByDay } = useZenith();
  const [showForm, setShowForm] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);
  const activityGroupsRef = useRef<HTMLDivElement>(null);
  const lastAddedActivityRef = useRef<string | null>(null);

  const [newActivity, setNewActivity] = useState<Partial<Activity>>({
    name: '',
    type: 'study',
    description: '',
    estimatedDuration: 1,
    urgency: 'normal',
    dayIndex: 0,
    order: 0,
    completed: false,
    preferredDays: [],
    preferredTime: { startHour: 8, endHour: 9 }
  });

  const activityTypes: { value: ActivityType; label: string; color: string }[] = [
    { value: 'study', label: 'Estudio', color: 'bg-secondary-100 text-secondary-800' },
    { value: 'exercise', label: 'Ejercicio', color: 'bg-green-100 text-green-800' },
    { value: 'rest', label: 'Descanso', color: 'bg-accent-100 text-accent-800' },
    { value: 'social', label: 'Social', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'personal', label: 'Personal', color: 'bg-neutral-100 text-neutral-800' }
  ];

  const dayLabels = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'number') {
      const numValue = parseFloat(value);
      if (editingActivity) {
        setEditingActivity({
          ...editingActivity,
          [name]: numValue
        });
      } else {
        setNewActivity({
          ...newActivity,
          [name]: numValue
        });
      }
    } else {
      if (editingActivity) {
        setEditingActivity({
          ...editingActivity,
          [name]: value
        });
      } else {
        setNewActivity({
          ...newActivity,
          [name]: value
        });
      }
    }
  };

  // preferredDays ya no se usa en el seguidor sin horas

  const handleShowForm = () => {
    setShowForm(true);
    // Esperar a que el formulario se renderice
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  // Drag & Drop handlers
  const onDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
  };
  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };
  const onDrop = (e: React.DragEvent, dayIndex: number, targetOrder: number) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    const activity = state.activities.find(a => a.id === id);
    if (!activity) return;
    if ((activity.dayIndex ?? 0) !== dayIndex) return; // no cross-day moves for now

    const updatedOrder = Math.max(0, targetOrder);
    const updated = { ...activity, order: updatedOrder } as Activity;
    updateActivity(updated);
  };

  // preferredTime no se usa para ordenar/mostrar

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingActivity) {
      const updatedActivity: Activity = {
        ...editingActivity, // Mantener la ID y otros campos base
        id: editingActivity.id,
        name: newActivity.name || editingActivity.name,
        type: (newActivity.type as ActivityType) || editingActivity.type,
        description: newActivity.description ?? editingActivity.description ?? '',
        estimatedDuration: newActivity.estimatedDuration ?? editingActivity.estimatedDuration,
        urgency: (newActivity.urgency as any) || editingActivity.urgency || 'normal',
        dayIndex: typeof newActivity.dayIndex === 'number' ? newActivity.dayIndex : (editingActivity.dayIndex ?? 0),
        order: typeof newActivity.order === 'number' ? newActivity.order : (editingActivity.order ?? 0),
        completed: typeof newActivity.completed === 'boolean' ? newActivity.completed : (editingActivity.completed ?? false),
        preferredDays: [],
        preferredTime: editingActivity.preferredTime || { startHour: 8, endHour: 9 },
        duration: editingActivity.duration || 0,
        timeBlockId: editingActivity.timeBlockId
      };

      updateActivity(updatedActivity);
      setEditingActivity(null);
    } else {
      const newActivityId = uuidv4();
      addActivity({
        ...newActivity,
        id: newActivityId
      } as Activity);
      
      // Guardar el ID de la última actividad agregada
      lastAddedActivityRef.current = newActivityId;
      
      setNewActivity({
        name: '',
        type: 'study',
        priority: 'medium',
        description: '',
        preferredDays: [],
        preferredTime: {
          startHour: 8,
          endHour: 9
        },
        duration: 1 // Se calculará automáticamente cuando se establezca preferredTime
      });

      // Esperar a que la actividad se renderice y hacer scroll
      setTimeout(() => {
        const activityElement = document.getElementById(`activity-${newActivityId}`);
        if (activityElement) {
          activityElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else if (activityGroupsRef.current) {
          activityGroupsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
    
    // Resetear el formulario
    setNewActivity({
      name: '',
      type: 'study',
      description: '',
      estimatedDuration: 1,
      urgency: 'normal',
      dayIndex: 0,
      order: 0,
      completed: false,
      preferredDays: [],
      preferredTime: { startHour: 8, endHour: 9 }
    });
    setShowForm(false);
  };
  const handleCancel = () => {
    setShowForm(false);
    setEditingActivity(null);
  };


  const hasActivities = state.activities.length > 0;

  return (
    <div className="fade-in">
      <div className="mb-6">
        {/* Header móvil */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                <ListTodo size={20} className="text-primary-600 sm:w-6 sm:h-6" />
                <span>Actividades</span>
              </h1>
              <button 
                onClick={() => setShowHelp(!showHelp)}
                className="p-1 hover:bg-neutral-100 rounded-full transition-colors"
                title="Mostrar ayuda"
              >
                <HelpCircle size={18} className="text-neutral-400 sm:w-5 sm:h-5" />
              </button>
            </div>
            <p className="text-sm sm:text-base text-neutral-600 sm:ml-0">
              Gestiona tus actividades para organizar tu tiempo libre
            </p>
          </div>
          
          <button 
            onClick={handleShowForm}
            className="bg-primary-600 text-white px-3 py-2 sm:px-4 rounded-md hover:bg-primary-700 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base w-full sm:w-auto"
          >
            <Plus size={16} className="sm:w-[18px] sm:h-[18px]" />
            <span>Agregar actividad</span>
          </button>
        </div>
      </div>

      {/* Modal de ayuda */}
      {showHelp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-neutral-200">
              <div className="flex items-center gap-3">
                <HelpCircle size={24} className="text-secondary-600" />
                <h2 className="text-xl font-semibold text-secondary-800">Centro de Actividades</h2>
              </div>
              <button 
                onClick={() => setShowHelp(false)}
                className="text-neutral-500 hover:text-neutral-700 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6">
              <div className="text-neutral-700 space-y-4">
                <p>Gestiona tus actividades y tareas de forma efectiva. Aquí puedes:</p>
                <ul className="list-disc list-inside ml-4 space-y-2 text-sm">
                  <li>Crear y organizar actividades académicas, laborales y personales</li>
                  <li>Establecer prioridades y fechas límite</li>
                  <li>Eliminar actividades que ya no necesites</li>
                  <li>Visualizar estadísticas de tu distribución de tiempo</li>
                  <li>Recibir recomendaciones personalizadas del sistema</li>
                </ul>
                <div className="p-4 bg-accent-50 border border-accent-100 rounded-md">
                  <p className="text-sm text-accent-700">
                    <strong>Nota importante:</strong> Para editar una actividad, ve a la sección de "Horario Semanal" donde podrás modificar todos los detalles de tus actividades programadas.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {state.timeBlocks.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar size={28} className="text-neutral-400" />
          </div>
          <h3 className="text-lg font-medium text-neutral-800 mb-2">Primero configura tu horario</h3>
          <p className="text-neutral-600 mb-4 max-w-md mx-auto">
            Para comenzar a gestionar tus actividades, primero necesitas configurar tu horario semanal base. 
            Esto te ayudará a organizar mejor tu tiempo y visualizar tus actividades de manera más efectiva.
          </p>
          <p className="text-sm text-accent-600 bg-accent-50 p-3 rounded-lg inline-block">
            Dirígete a la sección de "Horario Semanal" para comenzar a agregar tus bloques de tiempo.
          </p>
        </div>
      ) : (
        <>
          {(showForm || editingActivity) && (
            <div ref={formRef} className="mb-6 bg-white rounded-lg shadow-md p-6">
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Título</label>
                    <input className="w-full px-3 py-2 border border-neutral-300 rounded-md" name="name" value={newActivity.name || editingActivity?.name || ''} onChange={handleChange} required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Tipo</label>
                    <select name="type" value={newActivity.type || editingActivity?.type || 'study'} onChange={handleChange} className="w-full px-3 py-2 border border-neutral-300 rounded-md" required>
                      {activityTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Urgencia</label>
                    <select name="urgency" value={(newActivity.urgency || editingActivity?.urgency || 'normal') as any} onChange={handleChange} className="w-full px-3 py-2 border border-neutral-300 rounded-md">
                      <option value="urgent">Urgente</option>
                      <option value="medium">Media</option>
                      <option value="normal">Normal</option>
                      <option value="low">Baja</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Duración estimada (h)</label>
                    <input type="number" min={0} step={0.5} name="estimatedDuration" value={newActivity.estimatedDuration || editingActivity?.estimatedDuration || 1} onChange={handleChange} className="w-full px-3 py-2 border border-neutral-300 rounded-md" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Día</label>
                    <select name="dayIndex" value={(newActivity.dayIndex ?? editingActivity?.dayIndex ?? 0) as number} onChange={e => setNewActivity(prev => ({ ...prev, dayIndex: parseInt(e.target.value, 10) }))} className="w-full px-3 py-2 border border-neutral-300 rounded-md">
                      {dayLabels.map((d, i) => <option key={d} value={i}>{d}</option>)}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Descripción (opcional)</label>
                    <textarea name="description" value={newActivity.description || editingActivity?.description || ''} onChange={handleChange} rows={3} className="w-full px-3 py-2 border border-neutral-300 rounded-md" />
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <button type="button" onClick={handleCancel} className="px-4 py-2 border border-neutral-300 text-neutral-700 rounded-md">Cancelar</button>
                  <button type="submit" className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700">{editingActivity ? 'Actualizar' : 'Guardar'}</button>
                </div>
              </form>
            </div>
          )}

          {/* Weekly tracker */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-6 overflow-x-auto">
            <div className="grid grid-cols-7 min-w-[900px] gap-3">
              {dayLabels.map((label, dayIdx) => {
                const activities = selectUnplannedActivitiesByDay(dayIdx);
                const completedCount = activities.filter(a => a.completed).length;
                const urgencyColor = (u?: string) => u === 'urgent' ? 'border-red-300 bg-red-50' : u === 'medium' ? 'border-orange-300 bg-orange-50' : u === 'low' ? 'border-sky-300 bg-sky-50' : 'border-green-300 bg-green-50';
                return (
                  <div key={label} className="rounded-md border border-neutral-200 p-2" onDragOver={onDragOver} onDrop={(e) => onDrop(e, dayIdx, activities.length)}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-semibold">{label}</div>
                      <div className="text-xs text-neutral-500">{completedCount}/{activities.length}</div>
                    </div>
                    <div className="space-y-2">
                      {activities.map((a) => (
                        <div key={a.id}
                          draggable
                          onDragStart={(e) => onDragStart(e, a.id)}
                          className={`border ${urgencyColor(a.urgency)} rounded-md p-2 flex items-start gap-2 ${a.completed ? 'opacity-60' : ''}`}
                          onClick={() => { setEditingActivity(a); setShowForm(true); }}
                        >
                          <input type="checkbox" checked={!!a.completed} onChange={(e) => updateActivity({ ...a, completed: e.target.checked }) as any} className="mt-1" onClick={(ev) => ev.stopPropagation()} />
                          <div className="flex-1 min-w-0">
                            <div className={`truncate ${a.completed ? 'line-through' : ''}`}>{a.name}</div>
                            {!!a.description && <div className="text-xs text-neutral-600 truncate">{a.description}</div>}
                          </div>
                          {a.timeBlockId && (
                            <div title="Planificada" className="text-neutral-400"><Link2 size={16} /></div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {!hasActivities && !showForm && (
            <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-8 text-center">
              <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 size={28} className="text-neutral-400" />
              </div>
              <h3 className="text-lg font-medium mb-2">Sin actividades</h3>
              <p className="text-neutral-600 mb-4 max-w-md mx-auto">
                Agrega actividades para distribuir en tus tiempos libres y mantener un balance entre estudio, ejercicio y descanso.
              </p>
              <button 
                onClick={() => setShowForm(true)}
                className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors inline-flex items-center gap-2"
              >
                <Plus size={18} />
                <span>Nueva Actividad</span>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Activities;
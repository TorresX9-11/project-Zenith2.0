import React, { useState, useRef, useEffect } from 'react';
import { useZenith } from '../context/ZenithContext';
import { ActivityType, Activity } from '../types';
import { ListTodo, Plus, BarChart3, Calendar, HelpCircle, X, Link2, Pencil, Trash2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
// TimeTable se usa solo en Schedule; aquí usamos selectores
// ActivityForm no se usa en el nuevo seguidor semanal

const Activities: React.FC = () => {
  const { state, addActivity, updateActivity, removeActivity, selectUnplannedActivitiesByDay } = useZenith();
  const [showForm, setShowForm] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);
  const activityGroupsRef = useRef<HTMLDivElement>(null);
  const lastAddedActivityRef = useRef<string | null>(null);
  const [durationHours, setDurationHours] = useState<number>(0);
  const [durationMinutesOnly, setDurationMinutesOnly] = useState<number>(0);

  const [newActivity, setNewActivity] = useState<Partial<Activity>>({
    name: '',
    description: '',
    type: 'study',
    urgency: 'normal',
    dayIndex: 0,
    completed: false,
    preferredDays: [],
    preferredTime: { startHour: 8, endHour: 9 }
  });

  const activityTypes: { value: ActivityType; label: string; color: string }[] = [
    { value: 'academic', label: 'Académico', color: 'bg-primary-100 text-primary-800' },
    { value: 'study', label: 'Estudio', color: 'bg-secondary-100 text-secondary-800' },
    { value: 'work', label: 'Trabajo', color: 'bg-purple-100 text-purple-800' },
    { value: 'exercise', label: 'Ejercicio', color: 'bg-green-100 text-green-800' },
    { value: 'rest', label: 'Descanso', color: 'bg-accent-100 text-accent-800' },
    { value: 'social', label: 'Social', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'personal', label: 'Personal', color: 'bg-neutral-100 text-neutral-800' }
  ];

  const dayLabels = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'number') {
      const numValue = value === '' ? undefined : parseFloat(value);
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
  // Prellenar horas/min al abrir formulario o al editar
  useEffect(() => {
    if (showForm || editingActivity) {
      const src: Partial<Activity> = (editingActivity as Partial<Activity>) || newActivity;
      const totalMinutes = (src as any).estimatedMinutes !== undefined && (src as any).estimatedMinutes !== null
        ? Number((src as any).estimatedMinutes)
        : Math.round(((src.estimatedDuration as number) || 0) * 60);
      const h = Math.floor((Number.isFinite(totalMinutes) ? totalMinutes : 0) / 60);
      const m = (Number.isFinite(totalMinutes) ? totalMinutes : 0) % 60;
      setDurationHours(h);
      setDurationMinutesOnly(m);
    }
  }, [showForm, editingActivity]);

  const handleShowForm = () => {
    setShowForm(true);
    // Esperar a que el formulario se renderice
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  // Drag & Drop handlers
  const onDragStart = (e: React.DragEvent, id: string, fromDayIndex: number) => {
    e.dataTransfer.setData('application/json', JSON.stringify({ id, fromDayIndex }));
  };
  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };
  const onDrop = (e: React.DragEvent, dayIndex: number, targetOrder: number) => {
    e.preventDefault();
    let payload: any = null;
    try { payload = JSON.parse(e.dataTransfer.getData('application/json')); } catch {}
    const id = payload?.id || e.dataTransfer.getData('text/plain');
    const activity = state.activities.find(a => a.id === id);
    if (!activity) return;
    const crossDay = (activity.dayIndex ?? 0) !== dayIndex;
    const updatedOrder = Math.max(0, targetOrder);
    const updated = { ...activity, order: updatedOrder, dayIndex: crossDay ? dayIndex : activity.dayIndex } as Activity;
    updateActivity(updated);
  };

  // preferredTime no se usa para ordenar/mostrar

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingActivity) {
      const safeEstimatedMinutes = Math.max(0, durationHours * 60 + durationMinutesOnly);
      // Usar directamente la actividad en edición actualizada por los controladores
      const safeActivity: Activity = {
        ...(editingActivity as Activity),
        name: editingActivity.name || '',
        type: (editingActivity.type as ActivityType) || 'study',
        urgency: (editingActivity.urgency as any) || 'normal',
        estimatedMinutes: safeEstimatedMinutes,
        dayIndex: (editingActivity.dayIndex as number) ?? 0,
      };
      updateActivity(safeActivity);
      setEditingActivity(null);
    } else {
      const newActivityId = uuidv4();
      const safeEstimatedMinutes = Math.max(0, durationHours * 60 + durationMinutesOnly);
      addActivity({
        ...newActivity,
        id: newActivityId,
        estimatedMinutes: safeEstimatedMinutes
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
      estimatedMinutes: 0,
      urgency: 'normal',
      dayIndex: 0,
      order: 0,
      completed: false,
      preferredDays: [],
      preferredTime: { startHour: 8, endHour: 9 }
    });
    setDurationHours(0);
    setDurationMinutesOnly(0);
    setShowForm(false);
  };
  const handleCancel = () => {
    setShowForm(false);
    setEditingActivity(null);
  };


  const hasActivities = state.activities.length > 0;

  const isEditing = !!editingActivity;
  const current = (editingActivity as Partial<Activity> | null) || newActivity;

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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowHelp(false)}>
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-neutral-200">
              <div className="flex items-center gap-3">
                <HelpCircle size={24} className="text-secondary-600" />
                <h2 className="text-xl font-semibold text-secondary-800">¿Cómo funcionan las Actividades?</h2>
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
                <p className="text-sm">Organiza tus tareas por día y prioridad:</p>
                <ul className="list-disc list-inside ml-4 space-y-2 text-sm">
                  <li><strong>Agregar/Editar</strong>: usa el formulario. Define el <em>tipo</em> (académico, estudio, ejercicio, descanso, etc.) y la <em>urgencia</em>.</li>
                  <li><strong>Drag & Drop</strong>: arrastra para reordenar o mover a otro día.</li>
                  <li><strong>Completar</strong>: marca el checkbox cuando termines.</li>
                  <li><strong>Importancia</strong>: las tareas <em>muy urgentes/urgentes</em> pesan más que las de urgencia media o baja, y el tipo de actividad <em>académico/estudio</em> aporta más que <em>personal/social</em> en la productividad final.</li>
                </ul>
                
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
                    <input className="w-full px-3 py-2 border border-neutral-300 rounded-md" name="name" placeholder="Ingresa el nombre de la actividad" value={current.name ?? ''} onChange={handleChange} required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Tipo</label>
                    <select name="type" value={(current.type ?? 'study') as any} onChange={handleChange} className="w-full px-3 py-2 border border-neutral-300 rounded-md" required>
                      {activityTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Urgencia</label>
                    <select name="urgency" value={(current.urgency ?? 'normal') as any} onChange={handleChange} className="w-full px-3 py-2 border border-neutral-300 rounded-md" required>
                      <option value="very_urgent">Muy urgente</option>
                      <option value="urgent">Urgente</option>
                      <option value="medium">Media</option>
                      <option value="normal">Normal</option>
                      <option value="low">Baja</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Duración estimada</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        min={0}
                        step={1}
                        placeholder="Horas"
                        value={durationHours}
                        onChange={(e) => setDurationHours(Math.max(0, Math.floor(Number(e.target.value) || 0)))}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-md"
                      />
                      <input
                        type="number"
                        min={0}
                        max={59}
                        step={1}
                        placeholder="Minutos"
                        value={durationMinutesOnly}
                        onChange={(e) => {
                          const v = Math.max(0, Math.min(59, Math.floor(Number(e.target.value) || 0)));
                          setDurationMinutesOnly(v);
                        }}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-md"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Día</label>
                    <select name="dayIndex" value={(current.dayIndex ?? 0) as any} onChange={e => {
                      const v = parseInt(e.target.value, 10);
                      if (isEditing) {
                        setEditingActivity(prev => prev ? { ...prev, dayIndex: v } as Activity : prev);
                      } else {
                        setNewActivity(prev => ({ ...prev, dayIndex: v }));
                      }
                    }} className="w-full px-3 py-2 border border-neutral-300 rounded-md" required>
                      {dayLabels.map((d, i) => <option key={d} value={i}>{d}</option>)}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Descripción (opcional)</label>
                    <textarea name="description" placeholder="Agrega una breve descripcion" value={current.description || ''} onChange={handleChange} rows={3} className="w-full px-3 py-2 border border-neutral-300 rounded-md" />
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
          <div className="bg-white rounded-none shadow-md p-4 mb-6 overflow-x-auto border border-neutral-200">
            <div className="grid grid-cols-7 min-w-[900px] gap-0">
              {dayLabels.map((label, dayIdx) => {
                const activities = selectUnplannedActivitiesByDay(dayIdx).sort((a, b) => {
                  const rank = (u?: string) => u === 'very_urgent' ? 0 : u === 'urgent' ? 1 : u === 'medium' ? 2 : u === 'normal' ? 3 : 4;
                  return rank(a.urgency) - rank(b.urgency);
                });
                const completedCount = activities.filter(a => a.completed).length;
                const urgencyColor = (u?: string) => u === 'very_urgent' ? 'border-red-500 bg-red-50' : u === 'urgent' ? 'border-red-300 bg-red-50' : u === 'medium' ? 'border-orange-300 bg-orange-50' : u === 'low' ? 'border-sky-300 bg-sky-50' : 'border-green-300 bg-green-50';
                return (
                  <div key={label} className="border-l border-neutral-200 p-3 bg-white first:border-l-0" onDragOver={onDragOver} onDrop={(e) => onDrop(e, dayIdx, activities.length)}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="font-semibold text-primary-700 text-sm sm:text-base">{label}</div>
                      <div className="text-xs text-neutral-500">{completedCount}/{activities.length}</div>
                    </div>
                    <div className="space-y-3 border-t border-neutral-200 pt-3">
                      {activities.map((a) => (
                        <div key={a.id}
                          draggable
                          onDragStart={(e) => onDragStart(e, a.id, dayIdx)}
                          onDragOver={(e) => e.preventDefault()}
                          className={`border ${urgencyColor(a.urgency)} rounded-lg p-3 shadow-sm ${a.completed ? 'opacity-60' : ''} flex flex-col`}
                        >
                          <div className="grid grid-cols-[18px,1fr] gap-x-2">
                            <input type="checkbox" checked={!!a.completed} onChange={(e) => updateActivity({ ...a, completed: e.target.checked }) as any} className="mt-0.5" onClick={(ev) => ev.stopPropagation()} />
                            <div className="min-w-0">
                              <div className={`text-sm font-semibold leading-snug ${a.completed ? 'line-through' : ''} text-neutral-800 break-words`}>{a.name}</div>
                            </div>
                            {!!a.description && (
                              <div className="col-span-2 text-[12px] text-neutral-600 leading-snug mt-0.5 whitespace-normal break-words">
                                {a.description}
                              </div>
                            )}
                            <div className={`col-span-2 flex items-center gap-2 ${a.description ? 'mt-2' : 'mt-1'}`}>
                              <span className={`px-2 py-0.5 rounded text-[11px] ${activityTypes.find(t => t.value === a.type)?.color || 'bg-neutral-100 text-neutral-800'}`}>
                                {activityTypes.find(t => t.value === a.type)?.label}
                              </span>
                              <span className={`text-[11px] ${a.urgency === 'very_urgent' ? 'text-red-800' : a.urgency === 'urgent' ? 'text-red-700' : a.urgency === 'medium' ? 'text-orange-700' : a.urgency === 'low' ? 'text-sky-700' : 'text-green-700' }`}>
                                {a.urgency === 'very_urgent' ? 'Muy urgente' : a.urgency === 'urgent' ? 'Urgente' : a.urgency === 'medium' ? 'Media' : a.urgency === 'low' ? 'Baja' : 'Normal'}
                              </span>
                            </div>
                          </div>
                          <div className="mt-3 flex items-center justify-end gap-1">
                            {a.timeBlockId && (
                              <div title="Planificada" className="text-neutral-400"><Link2 size={16} /></div>
                            )}
                            <button title="Editar" className="p-1 text-neutral-500 hover:text-neutral-800" onClick={(e) => { e.stopPropagation(); setEditingActivity(a); setNewActivity(a); setShowForm(true); }}>
                              <Pencil size={14} />
                            </button>
                            <button title="Eliminar" className="p-1 text-red-500 hover:text-red-700" onClick={(e) => { e.stopPropagation(); if (confirm('¿Eliminar esta actividad?')) { removeActivity(a.id); } }}>
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="pt-3">
                      <button
                        onClick={() => { setNewActivity(prev => ({ ...prev, dayIndex: dayIdx })); setEditingActivity(null); setShowForm(true); }}
                        className="w-full text-center text-xs text-primary-700 hover:text-primary-800 py-1 border border-dashed border-primary-200 rounded"
                      >
                        <Plus size={14} className="inline mr-1" /> Añadir tarea
                      </button>
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
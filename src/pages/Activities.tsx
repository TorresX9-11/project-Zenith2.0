import React, { useState, useRef } from 'react';
import { useZenith } from '../context/ZenithContext';
import { ActivityType, Activity, DayOfWeek } from '../types';
import { ListTodo, Plus, BarChart3, Calendar, HelpCircle, X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import TimeTable from '../components/TimeTable';
import ActivityForm from '../components/ActivityForm';

const Activities: React.FC = () => {
  const { state, addActivity, updateActivity } = useZenith();
  const [showForm, setShowForm] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);
  const activityGroupsRef = useRef<HTMLDivElement>(null);
  const lastAddedActivityRef = useRef<string | null>(null);

  const [newActivity, setNewActivity] = useState<Partial<Activity>>({
    name: '',
    type: 'study',
    duration: 1,
    priority: 'medium',
    description: '',
    preferredDays: [],
    preferredTime: {
      startHour: 8,
      endHour: 9
    }
  });

  const activityTypes: { value: ActivityType; label: string; color: string }[] = [
    { value: 'study', label: 'Estudio', color: 'bg-secondary-100 text-secondary-800' },
    { value: 'exercise', label: 'Ejercicio', color: 'bg-green-100 text-green-800' },
    { value: 'rest', label: 'Descanso', color: 'bg-accent-100 text-accent-800' },
    { value: 'social', label: 'Social', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'personal', label: 'Personal', color: 'bg-neutral-100 text-neutral-800' },
    { value: 'libre', label: 'Libre', color: 'bg-red-100 text-red-800' }
  ];

  const days: { value: DayOfWeek; label: string }[] = [
    { value: 'lunes', label: 'Lunes' },
    { value: 'martes', label: 'Martes' },
    { value: 'miércoles', label: 'Miércoles' },
    { value: 'jueves', label: 'Jueves' },
    { value: 'viernes', label: 'Viernes' },
    { value: 'sábado', label: 'Sábado' },
    { value: 'domingo', label: 'Domingo' }
  ];

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

  const handleDayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    const day = value as DayOfWeek;
    
    if (editingActivity) {
      setEditingActivity({
        ...editingActivity,
        preferredDays: checked
          ? [...(editingActivity.preferredDays || []), day]
          : (editingActivity.preferredDays || []).filter(d => d !== day)
      });
    } else {
      setNewActivity({
        ...newActivity,
        preferredDays: checked
          ? [...(newActivity.preferredDays || []), day]
          : (newActivity.preferredDays || []).filter(d => d !== day)
      });
    }
  };

  const handleShowForm = () => {
    setShowForm(true);
    // Esperar a que el formulario se renderice
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleTimeSlotClick = (day: DayOfWeek, hour: number) => {
    if (!showForm) {
      setNewActivity(prev => ({
        ...prev,
        preferredDays: [day],
        preferredTime: {
          startHour: hour,
          endHour: hour + 1
        }
      }));
      handleShowForm();
    }
  };

  const handleTimeChange = (type: 'start' | 'end', value: string) => {
    const hour = parseInt(value.split(':')[0]);
    
    if (editingActivity) {
      const newPreferredTime = {
        ...(editingActivity.preferredTime || { startHour: 8, endHour: 9 }),
        [type === 'start' ? 'startHour' : 'endHour']: hour
      };
      
      setEditingActivity({
        ...editingActivity,
        preferredTime: newPreferredTime,
        duration: newPreferredTime.endHour - newPreferredTime.startHour
      });
    } else {
      setNewActivity(prev => {
        const newPreferredTime = {
          ...(prev.preferredTime || { startHour: 8, endHour: 9 }),
          [type === 'start' ? 'startHour' : 'endHour']: hour
        };
        return {
          ...prev,
          preferredTime: newPreferredTime,
          duration: newPreferredTime.endHour - newPreferredTime.startHour
        };
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingActivity) {
      // Combinar todos los campos de la actividad en edición
      const updatedActivity: Activity = {
        ...editingActivity, // Mantener la ID y otros campos base
        id: editingActivity.id,
        name: newActivity.name || editingActivity.name,
        type: (newActivity.type as ActivityType) || editingActivity.type,
        priority: newActivity.priority || editingActivity.priority,
        description: newActivity.description || editingActivity.description || '',
        preferredDays: newActivity.preferredDays || editingActivity.preferredDays || [],
        preferredTime: newActivity.preferredTime || editingActivity.preferredTime || {
          startHour: 8,
          endHour: 9
        },
        duration: newActivity.preferredTime 
          ? newActivity.preferredTime.endHour - newActivity.preferredTime.startHour 
          : newActivity.duration || editingActivity.duration,
        timeBlockId: editingActivity.timeBlockId // Mantener la referencia al bloque de tiempo
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
      duration: 1,
      priority: 'medium',
      description: '',
      preferredDays: [],
      preferredTime: {
        startHour: 8,
        endHour: 9
      }
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
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ListTodo size={24} className="text-primary-600" />
            <span>Actividades</span>
          </h1>
          <button 
            onClick={() => setShowHelp(!showHelp)}
            className="p-1 hover:bg-neutral-100 rounded-full transition-colors"
            title="Mostrar ayuda"
          >
            <HelpCircle size={20} className="text-neutral-400" />
          </button>
          <p className="text-neutral-600 ml-20">Gestiona tus actividades para organizar tu tiempo libre</p>
        </div>
        
        {state.timeBlocks.length > 0 && (
          <button 
            onClick={handleShowForm}
            className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors flex items-center gap-2"
          >
            <Plus size={18} />
            <span>Nueva Actividad</span>
          </button>
        )}
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
            <div ref={formRef} className="mb-6">
              <ActivityForm 
                editingActivity={editingActivity}
                newActivity={newActivity}
                activityTypes={activityTypes}
                days={days}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                onChange={handleChange}
                onDayChange={handleDayChange}
                onTimeChange={handleTimeChange}
                timeBlocks={state.timeBlocks}
              />
            </div>
          )}

          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Calendar size={20} className="text-primary-600" />
              <span>Horario Semanal</span>
            </h2>
            <TimeTable 
              timeBlocks={state.timeBlocks}
              onSlotClick={handleTimeSlotClick}
              startHour={5}
              endHour={22}
            />
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
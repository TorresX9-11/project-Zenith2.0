import React, { useState, useRef } from 'react';
import { useZenith } from '../context/ZenithContext';
import { DayOfWeek, TimeBlock } from '../types';
import { Calendar, Plus, Info, X, Save, HelpCircle } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import TimeTable from '../components/TimeTable';
import { blocksOverlap } from '../selectors/schedule';

const Schedule: React.FC = () => {
  // Solo mostrar 'academic' y 'work' en el formulario de horario
  const activityTypes = [
    { value: 'academic', label: 'Académica' },
    { value: 'work', label: 'Trabajo' }
  ];
  const { state, addTimeBlock, removeTimeBlock, updateTimeBlock } = useZenith();
  const [showForm, setShowForm] = useState(false);
  const [editingBlock, setEditingBlock] = useState<TimeBlock | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);
  const [newBlock, setNewBlock] = useState<Partial<TimeBlock>>({
    title: '',
    day: 'lunes',
    startTime: '08:00',
    endTime: '09:00',
    type: 'occupied',
    description: '',
    location: '',
    activityType: 'academic'
  });

  const days: DayOfWeek[] = [
    'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'
  ];
  
  const dayTranslations: Record<DayOfWeek, string> = {
    'lunes': 'Lunes',
    'martes': 'Martes',
    'miércoles': 'Miércoles',
    'jueves': 'Jueves',
    'viernes': 'Viernes',
    'sábado': 'Sábado',
    'domingo': 'Domingo',
  };
  function isRangeTaken(day: string | undefined, start: string | undefined, end: string | undefined, ignoreId?: string) {
    if (!day || !start || !end) return false;
    const tempBlock: TimeBlock = {
      id: 'temp',
      day: day as DayOfWeek,
      startTime: start,
      endTime: end,
      type: 'occupied',
      title: 'temp'
    };
    return state.timeBlocks.some(block => {
      if (ignoreId && block.id === ignoreId) return false;
      // Solo validar contra bloques del mismo día o bloques que crucen medianoche desde ese día
      if (block.day !== tempBlock.day) return false;
      return blocksOverlap(tempBlock, block);
    });
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'day') {
      const selectedDay = value as DayOfWeek;
      let firstFreeStart = '08:00';
      for (let hour = 6; hour <= 22; hour++) {
        const hourStr = hour.toString().padStart(2, '0') + ':00';
        const isTaken = state.timeBlocks.some(block => {
          if (block.day !== selectedDay) return false;
          const blockStart = parseInt(block.startTime.split(':')[0], 10);
          const blockEnd = parseInt(block.endTime.split(':')[0], 10);
          return hour >= blockStart && hour < blockEnd;
        });
        if (!isTaken) {
          firstFreeStart = hourStr;
          break;
        }
      }
      let firstFreeEnd = '09:00';
      for (let hour = parseInt(firstFreeStart.split(':')[0], 10) + 1; hour <= 23; hour++) {
        const hourStr = hour.toString().padStart(2, '0') + ':00';
        const isTaken = state.timeBlocks.some(block => {
          if (block.day !== selectedDay) return false;
          const blockStart = parseInt(block.startTime.split(':')[0], 10);
          const blockEnd = parseInt(block.endTime.split(':')[0], 10);
          return hour > blockStart && hour <= blockEnd;
        });
        if (!isTaken) {
          firstFreeEnd = hourStr;
          break;
        }
      }
      if (editingBlock) {
        setEditingBlock({
          ...editingBlock,
          day: selectedDay,
          startTime: firstFreeStart,
          endTime: firstFreeEnd
        });
      } else {
        setNewBlock({
          ...newBlock,
          day: selectedDay,
          startTime: firstFreeStart,
          endTime: firstFreeEnd
        });
      }
    } else {
      if (editingBlock) {
        setEditingBlock({
          ...editingBlock,
          [name]: value
        });
      } else {
        setNewBlock({
          ...newBlock,
          [name]: value
        });
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Recortar a ventana activa si es necesario
    const startHour = parseInt((editingBlock ? editingBlock.startTime : newBlock.startTime)!.split(':')[0], 10);
    const endHour = parseInt((editingBlock ? editingBlock.endTime : newBlock.endTime)!.split(':')[0], 10);
    const startStr = `${String(startHour).padStart(2, '0')}:00`;
    const endStr = `${String(endHour).padStart(2, '0')}:00`;
    const windowStart = (state.settings.activeWindow?.startHour ?? 6);
    const windowEnd = (state.settings.activeWindow?.endHour ?? 22);
    const clippedStart = Math.max(startHour, windowStart);
    const clippedEnd = Math.min(endHour, windowEnd);
    if (clippedEnd <= clippedStart) {
      alert('El rango seleccionado no es válido dentro de la ventana activa.');
      return;
    }
    const clippedStartStr = `${String(clippedStart).padStart(2, '0')}:00`;
    const clippedEndStr = `${String(clippedEnd).padStart(2, '0')}:00`;

    if (editingBlock) {
      const updated: TimeBlock = { ...editingBlock, type: 'occupied', startTime: clippedStartStr, endTime: clippedEndStr };
      if (isRangeTaken(updated.day, updated.startTime, updated.endTime, updated.id)) {
        alert('Este bloque se solapa con otro. Ajusta el horario.');
        return;
      }
      updateTimeBlock(updated);
      setEditingBlock(null);
    } else {
      if (newBlock.title && newBlock.day && newBlock.startTime && newBlock.endTime) {
        const candidate: TimeBlock = {
          ...(newBlock as TimeBlock),
          id: uuidv4(),
          type: 'occupied',
          startTime: clippedStartStr,
          endTime: clippedEndStr
        };
        if (isRangeTaken(candidate.day, candidate.startTime, candidate.endTime)) {
          alert('Este bloque se solapa con otro. Ajusta el horario.');
          return;
        }
        addTimeBlock(candidate);
        
        setNewBlock({
          title: '',
          day: 'lunes',
          startTime: '08:00',
          endTime: '09:00',
          description: '',
          location: '',
          activityType: 'study'
        });
      }
    }
    
    setShowForm(false);
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
      setNewBlock({
        ...newBlock,
        day,
        startTime: `${hour.toString().padStart(2, '0')}:00`,
        endTime: `${(hour + 1).toString().padStart(2, '0')}:00`,
        activityType: 'academic' // Tipo por defecto para nuevos bloques
      });
      handleShowForm();
    }
  };

  const handleEdit = (block: TimeBlock) => {
    setEditingBlock(block);
    handleShowForm();
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingBlock(null);
  };

  return (
    <div className="fade-in">
      <div className="mb-6">
        {/* Header móvil */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                <Calendar size={20} className="text-primary-600 sm:w-6 sm:h-6" />
                <span>Horario Semanal</span>
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
              Gestiona tus clases y actividades semanales
            </p>
          </div>
          
          <button 
            onClick={handleShowForm}
            className="bg-primary-600 text-white px-3 py-2 sm:px-4 rounded-md hover:bg-primary-700 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base w-full sm:w-auto"
          >
            <Plus size={16} className="sm:w-[18px] sm:h-[18px]" />
            <span>Agregar Bloque</span>
          </button>
        </div>
      </div>

      {/* Modal de ayuda */}
      {showHelp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-neutral-200">
              <div className="flex items-center gap-3">
                <HelpCircle size={24} className="text-primary-600" />
                <h2 className="text-xl font-semibold text-primary-800">¡Bienvenido a tu Organizador Personal!</h2>
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
                <p>Aquí puedes gestionar tu horario semanal de forma intuitiva. Algunos consejos:</p>
                <ul className="list-disc list-inside ml-4 space-y-2 text-sm">
                  <li>Haz clic en cualquier espacio vacío del horario para añadir una actividad rápidamente</li>
                  <li>Utiliza diferentes tipos de actividades para organizar mejor tu tiempo</li>
                  <li>¿Necesitas ayuda? Nuestro chatbot integrado está disponible para responder tus preguntas sobre organización del tiempo</li>
                  <li>Recuerda guardar tus cambios después de cada modificación</li>
                </ul>
                <div className="p-4 bg-primary-50 border border-primary-100 rounded-md">
                  <p className="text-sm text-primary-700">
                    <strong>Consejo Pro:</strong> Comienza agregando tus actividades fijas como clases o trabajo, y luego organiza el resto de tu tiempo alrededor de ellas.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {(showForm || editingBlock) && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 slide-up" ref={formRef}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">
              {editingBlock ? 'Editar Bloque' : 'Agregar Nuevo Bloque'}
            </h2>
            <button 
              onClick={handleCancel}
              className="text-neutral-500 hover:text-neutral-700"
            >
              <X size={20} />
            </button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-neutral-700 mb-1">
                  Título
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={editingBlock ? editingBlock.title : newBlock.title}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Ej: Clase de Matemáticas"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="day" className="block text-sm font-medium text-neutral-700 mb-1">
                  Día
                </label>
                <select
                  id="day"
                  name="day"
                  value={editingBlock ? editingBlock.day : newBlock.day}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                >
                  {days.map(day => (
                    <option key={day} value={day}>{dayTranslations[day]}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="startTime" className="block text-sm font-medium text-neutral-700 mb-1">
                  Hora de Inicio
                </label>
                <select
                  id="startTime"
                  name="startTime"
                  value={editingBlock ? editingBlock.startTime : newBlock.startTime}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                >
                  {Array.from({ length: 17 }, (_, i) => 6 + i).map(hour => {
                    const hourStr = hour.toString().padStart(2, '0') + ':00';
                    const selectedDay = editingBlock ? editingBlock.day : newBlock.day;
                    const isTaken = state.timeBlocks.some(block => {
                      if (block.day !== selectedDay) return false;
                      if (editingBlock && block.id === editingBlock.id) return false;
                      const blockStart = parseInt(block.startTime.split(':')[0], 10);
                      const blockEnd = parseInt(block.endTime.split(':')[0], 10);
                      return hour >= blockStart && hour < blockEnd;
                    });
                    return (
                      <option key={hourStr} value={hourStr} disabled={isTaken}>
                        {hourStr} {isTaken ? '(Ocupado)' : ''}
                      </option>
                    );
                  })}
                </select>
              </div>
              <div>
                <label htmlFor="endTime" className="block text-sm font-medium text-neutral-700 mb-1">
                  Hora de Fin
                </label>
                <select
                  id="endTime"
                  name="endTime"
                  value={editingBlock ? editingBlock.endTime : newBlock.endTime}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                >
                  {Array.from({ length: 17 }, (_, i) => 7 + i).map(hour => {
                    const hourStr = hour.toString().padStart(2, '0') + ':00';
                    const selectedDay = editingBlock ? editingBlock.day : newBlock.day;
                    const isTaken = state.timeBlocks.some(block => {
                      if (block.day !== selectedDay) return false;
                      if (editingBlock && block.id === editingBlock.id) return false;
                      const blockStart = parseInt(block.startTime.split(':')[0], 10);
                      const blockEnd = parseInt(block.endTime.split(':')[0], 10);
                      return hour > blockStart && hour <= blockEnd;
                    });
                    return (
                      <option key={hourStr} value={hourStr} disabled={isTaken}>
                        {hourStr} {isTaken ? '(Ocupado)' : ''}
                      </option>
                    );
                  })}
                </select>
              </div>
              {/* Mensaje de advertencia si el rango está ocupado */}
              {(() => {
                const selectedDay = editingBlock ? editingBlock.day : newBlock.day;
                const start = editingBlock ? editingBlock.startTime : newBlock.startTime;
                const end = editingBlock ? editingBlock.endTime : newBlock.endTime;
                const ignoreId = editingBlock ? editingBlock.id : undefined;
                if (isRangeTaken(selectedDay, start, end, ignoreId)) {
                  return (
                    <div className="text-red-600 text-xs mt-2">
                      El rango de horas seleccionado ya está ocupado. Por favor, elige otro horario.
                    </div>
                  );
                }
                return null;
              })()}
              
              {/* Campo tipo de bloque oculto. Todos los bloques serán 'ocupado' automáticamente. */}
              
              <div>
                <label htmlFor="activityType" className="block text-sm font-medium text-neutral-700 mb-1">
                  Tipo de Actividad
                </label>
                <select
                  id="activityType"
                  name="activityType"
                  value={editingBlock?.activityType || newBlock.activityType || 'academic'}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 mb-1"
                  required
                >
                  {activityTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
                {/* Texto informativo eliminado por requerimiento */}
              </div>
              
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-neutral-700 mb-1">
                  Ubicación (opcional)
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={editingBlock && editingBlock.location ? editingBlock.location : newBlock.location || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Ej: Aula 101"
                />
              </div>
            </div>
            
            {/* Campo descripción eliminado por requerimiento */}
            
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 border border-neutral-300 text-neutral-700 rounded-md hover:bg-neutral-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors flex items-center gap-2"
              >
                <Save size={18} />
                <span>{editingBlock ? 'Actualizar' : 'Guardar'}</span>
              </button>
            </div>
          </form>
        </div>
      )}
      
      {state.timeBlocks.length === 0 ? (
        <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-8 text-center">
          <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar size={28} className="text-neutral-400" />
          </div>
          <h3 className="text-lg font-medium mb-2">Tu horario está vacío</h3>
          <p className="text-neutral-600 mb-4 max-w-md mx-auto">
            Comienza agregando tus clases y actividades semanales para visualizar tu agenda.
          </p>
          <button 
            onClick={() => setShowForm(true)}
            className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors inline-flex items-center gap-2"
          >
            <Plus size={18} />
            <span>Agregar Bloque</span>
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-6">
          <TimeTable 
            timeBlocks={state.timeBlocks}
            startHour={5}
            endHour={22}
            onSlotClick={handleTimeSlotClick}
            onEditBlock={handleEdit}
            onDeleteBlock={(block) => {
              if (window.confirm('¿Estás seguro de que deseas eliminar este bloque?')) {
                removeTimeBlock(block.id);
              }
            }}
          />
        </div>
      )}
      
      <div className="mt-8 bg-accent-50 border border-accent-200 rounded-lg p-4 flex items-start gap-3">
        <div className="text-accent-600 mt-1">
          <Info size={20} />
        </div>
        <div>
          <h3 className="font-medium text-accent-800 mb-1">Consejos para Organizar tu Horario</h3>
          <ul className="text-sm text-accent-700 space-y-1">
            <li>• Registra todas tus clases y compromisos fijos.</li>
            <li>• Identifica tus horas más productivas para actividades que requieran concentración.</li>
            <li>• Reserva bloques para descanso y comidas.</li>
            <li>• Sé realista con los tiempos de desplazamiento entre actividades.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Schedule;
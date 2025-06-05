import React, { useState, useRef } from 'react';
import { useZenith } from '../context/ZenithContext';
import { DayOfWeek, TimeBlock } from '../types';
import { Calendar, Clock, Plus, Info, Edit, Trash2, Save, X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import TimeTable from '../components/TimeTable';

const Schedule: React.FC = () => {
  const { state, addTimeBlock, removeTimeBlock, updateTimeBlock } = useZenith();
  const [showForm, setShowForm] = useState(false);
  const [editingBlock, setEditingBlock] = useState<TimeBlock | null>(null);
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

  // Tipos de actividades principales para el horario
  const activityTypes = [
    { value: 'academic', label: 'Académica', isMain: true },
    { value: 'work', label: 'Trabajo', isMain: true },
    { value: 'study', label: 'Estudio' },
    { value: 'exercise', label: 'Ejercicio' },
    { value: 'rest', label: 'Descanso' },
    { value: 'social', label: 'Social' },
    { value: 'personal', label: 'Personal' },
    { value: 'libre', label: 'Libre' }
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
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
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingBlock) {
      updateTimeBlock(editingBlock);
      setEditingBlock(null);
    } else {
      if (newBlock.title && newBlock.day && newBlock.startTime && newBlock.endTime) {
        addTimeBlock({
          ...newBlock as TimeBlock,
          id: uuidv4()
        });
        
        setNewBlock({
          title: '',
          day: 'lunes',
          startTime: '08:00',
          endTime: '09:00',
          type: 'occupied',
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
      <div className="bg-gradient-to-r from-primary-50 to-accent-50 border border-primary-100 rounded-lg p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <Info size={24} className="text-primary-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-primary-800 mb-2">¡Bienvenido a tu Organizador Personal!</h2>
            <div className="text-neutral-700 space-y-2">
              <p>Aquí puedes gestionar tu horario semanal de forma intuitiva. Algunos consejos:</p>
              <ul className="list-disc list-inside ml-4 space-y-1 text-sm">
                <li>Haz clic en cualquier espacio vacío del horario para añadir una actividad rápidamente</li>
                <li>Utiliza diferentes tipos de actividades para organizar mejor tu tiempo</li>
                <li>¿Necesitas ayuda? Nuestro chatbot integrado está disponible para responder tus preguntas sobre organización del tiempo</li>
                <li>Recuerda guardar tus cambios después de cada modificación</li>
              </ul>
              <p className="text-sm mt-2 text-primary-600">
                <strong>Consejo Pro:</strong> Comienza agregando tus actividades fijas como clases o trabajo, y luego organiza el resto de tu tiempo alrededor de ellas.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Calendar size={24} className="text-primary-600" />
            <span>Horario Semanal</span>
          </h1>
          <p className="text-neutral-600">Gestiona tus clases y actividades semanales</p>
        </div>
        
        <button 
          onClick={handleShowForm}
          className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors flex items-center gap-2"
        >
          <Plus size={18} />
          <span>Agregar Bloque</span>
        </button>
      </div>
      
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
                <input
                  type="time"
                  id="startTime"
                  name="startTime"
                  value={editingBlock ? editingBlock.startTime : newBlock.startTime}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="endTime" className="block text-sm font-medium text-neutral-700 mb-1">
                  Hora de Fin
                </label>
                <input
                  type="time"
                  id="endTime"
                  name="endTime"
                  value={editingBlock ? editingBlock.endTime : newBlock.endTime}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-neutral-700 mb-1">
                  Tipo de Bloque
                </label>
                <select
                  id="type"
                  name="type"
                  value={editingBlock ? editingBlock.type : newBlock.type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                >
                  <option value="occupied">Ocupado</option>
                  <option value="free">Libre</option>
                </select>
              </div>
              
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
                  <optgroup label="Actividades Principales">
                    {activityTypes
                      .filter(type => type.isMain)
                      .map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                  </optgroup>
                  <optgroup label="Otras Actividades">
                    {activityTypes
                      .filter(type => !type.isMain)
                      .map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                  </optgroup>
                </select>
                <p className="text-xs text-neutral-500 mt-1">
                  Para una mejor organización, primero agrega tus actividades académicas o laborales fijas.
                </p>
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
            
            <div className="mb-4">
              <label htmlFor="description" className="block text-sm font-medium text-neutral-700 mb-1">
                Descripción (opcional)
              </label>
              <textarea
                id="description"
                name="description"
                value={editingBlock && editingBlock.description ? editingBlock.description : newBlock.description || ''}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Agrega detalles sobre este bloque de tiempo"
              />
            </div>
            
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
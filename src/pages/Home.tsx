import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ArrowRight, Clock, Trophy, AlertTriangle, X, Info } from 'lucide-react';
import { useZenith } from '../context/ZenithContext';

const Home: React.FC = () => {
  const { state, getTotalFreeTime, getTotalOccupiedTime, selectProductivityScore, selectAdherenceRate, selectCompletionProgress } = useZenith();
  const [showWarning, setShowWarning] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const hasSchedule = state.timeBlocks.length > 0;
  // const hasActivities = state.activities.length > 0;

  // Verificar si es la primera vez que el usuario visita la página
  useEffect(() => {
    const hasSeenWarning = localStorage.getItem('hasSeenDataWarning');
    
    if (!hasSeenWarning) {
      setShowWarning(true);
      localStorage.setItem('hasSeenDataWarning', 'true');
    }
  }, []);

  const handleCloseWarning = () => {
    setShowWarning(false);
  };

  const handleShowWarningModal = () => {
    setShowWarningModal(true);
  };
  
  return (
    <div className="fade-in relative">
      {/* Modal de advertencia importante - Solo se muestra al recargar la página */}
      {showWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
            <button 
              onClick={handleCloseWarning}
              className="absolute top-4 right-4 text-neutral-500 hover:text-neutral-700"
            >
              <X size={20} />
            </button>
            <div className="flex items-center gap-2 text-warning-600 mb-4">
              <AlertTriangle size={24} />
              <h2 className="text-xl font-bold">¡IMPORTANTE!</h2>
            </div>
            <p className="text-neutral-700 mb-4">
              Tus datos se guardan localmente en el navegador. Para evitar pérdida de información:
            </p>
            <ul className="list-disc list-inside text-neutral-600 mb-4 space-y-2">
              <li>No borres el caché del navegador</li>
              <li>Utiliza siempre el mismo navegador y dispositivo</li>
              <li>Considera tomar capturas de pantalla de tu horario como respaldo</li>
            </ul>
            <button
              onClick={handleCloseWarning}
              className="w-full bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* Modal de advertencia - Para mostrar de nuevo */}
      {showWarningModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
            <button 
              onClick={() => setShowWarningModal(false)}
              className="absolute top-4 right-4 text-neutral-500 hover:text-neutral-700"
            >
              <X size={20} />
            </button>
            <div className="flex items-center gap-2 text-warning-600 mb-4">
              <AlertTriangle size={24} />
              <h2 className="text-xl font-bold">¡IMPORTANTE!</h2>
            </div>
            <p className="text-neutral-700 mb-4">
              Tus datos se guardan localmente en el navegador. Para evitar pérdida de información:
            </p>
            <ul className="list-disc list-inside text-neutral-600 mb-4 space-y-2">
              <li>No borres el caché del navegador</li>
              <li>Utiliza siempre el mismo navegador y dispositivo</li>
              <li>Considera tomar capturas de pantalla de tu horario como respaldo</li>
            </ul>
            <button
              onClick={() => setShowWarningModal(false)}
              className="w-full bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      <section className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-8 text-white mb-8">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Bienvenido a Zenith</h1>
            <p className="text-lg">Tu asistente inteligente para organizar tu tiempo de forma equilibrada y efectiva.</p>
          </div>
          <button
            onClick={handleShowWarningModal}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
            title="Ver información importante"
          >
            <Info size={24} className="text-white/80" />
          </button>
        </div>
        
        {!hasSchedule && (
          <Link to="/horario" className="bg-white text-primary-700 px-6 py-3 rounded-lg font-medium flex items-center gap-2 w-fit hover:bg-neutral-100 transition-colors">
            Comenzar <ArrowRight size={18} />
          </Link>
        )}
        
        {hasSchedule && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-2">
                <Clock size={20} />
                <h3 className="font-semibold">Tiempo Ocupado</h3>
              </div>
              <p className="text-2xl font-bold">{getTotalOccupiedTime().toFixed(1)}h</p>
            </div>
            
            <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-2">
                <Calendar size={20} />
                <h3 className="font-semibold">Tiempo Libre</h3>
              </div>
              <p className="text-2xl font-bold">{getTotalFreeTime().toFixed(1)}h</p>
            </div>
            
            <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-2">
                <Trophy size={20} />
                <h3 className="font-semibold">Productividad</h3>
              </div>
              <p className="text-2xl font-bold">{selectProductivityScore()}%</p>
              <p className="text-sm opacity-80 mt-1">Adherencia {selectAdherenceRate()}% · Finalización {selectCompletionProgress()}%</p>
            </div>
          </div>
        )}
      </section>
      
      <section className="bg-neutral-100 rounded-xl p-6 mb-8">
        <h2 className="text-xl font-bold mb-6">¿Cómo Funciona Zenith?</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Paso 1 */}
          <div className="bg-white p-5 rounded-lg shadow-sm border border-neutral-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-primary-50 text-primary-700 border border-primary-200">Paso 1</span>
              <span className="text-xs text-neutral-400">Horario</span>
            </div>
            <h3 className="font-semibold mb-1 text-neutral-900">Ingresa tu Horario</h3>
            <p className="text-neutral-600 text-sm leading-relaxed">Crea bloques con tus clases y compromisos (por defecto 05:00–21:00). Así verás tus huecos libres.</p>
          </div>

          {/* Paso 2 */}
          <div className="bg-white p-5 rounded-lg shadow-sm border border-neutral-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-primary-50 text-primary-700 border border-primary-200">Paso 2</span>
              <span className="text-xs text-neutral-400">Actividades</span>
            </div>
            <h3 className="font-semibold mb-1 text-neutral-900">Añade Actividades</h3>
            <p className="text-neutral-600 text-sm leading-relaxed">Registra tareas con tipo (académico, estudio, ejercicio, etc.) y urgencia. Arrástralas para ordenarlas por día.</p>
          </div>

          {/* Paso 3 */}
          <div className="bg-white p-5 rounded-lg shadow-sm border border-neutral-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-primary-50 text-primary-700 border border-primary-200">Paso 3</span>
              <span className="text-xs text-neutral-400">Progreso</span>
            </div>
            <h3 className="font-semibold mb-1 text-neutral-900">Marca lo Completado</h3>
            <p className="text-neutral-600 text-sm leading-relaxed">Usa el checkbox en Actividades cuando termines. Esto impacta la productividad (adherencia y finalización).</p>
          </div>

          {/* Paso 4 */}
          <div className="bg-white p-5 rounded-lg shadow-sm border border-neutral-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-primary-50 text-primary-700 border border-primary-200">Paso 4</span>
              <span className="text-xs text-neutral-400">Dashboard</span>
            </div>
            <h3 className="font-semibold mb-1 text-neutral-900">Revisa el Dashboard</h3>
            <p className="text-neutral-600 text-sm leading-relaxed">Consulta tu distribución de horas por tipo, tu productividad y recomendaciones simples para mejorar.</p>
          </div>

          {/* Paso 5 */}
          <div className="bg-white p-5 rounded-lg shadow-sm border border-neutral-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-primary-50 text-primary-700 border border-primary-200">Paso 5</span>
              <span className="text-xs text-neutral-400">Equilibrio</span>
            </div>
            <h3 className="font-semibold mb-1 text-neutral-900">Añade Descansos y Ejercicio</h3>
            <p className="text-neutral-600 text-sm leading-relaxed">Incluye pausas cortas y largas, y 3–4 sesiones de ejercicio semanales para mantener energía y foco.</p>
          </div>

          {/* Paso 6 */}
          <div className="bg-white p-5 rounded-lg shadow-sm border border-neutral-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-primary-50 text-primary-700 border border-primary-200">Paso 6</span>
              <span className="text-xs text-neutral-400">Revisión</span>
            </div>
            <h3 className="font-semibold mb-1 text-neutral-900">Itera Cada Semana</h3>
            <p className="text-neutral-600 text-sm leading-relaxed">Reubica bloques, limpia pendientes y apunta a 6–8h de estudio semanal si no tienes clases diarias.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

// Eliminados accesos rápidos y técnicas de estudio en Home

export default Home;
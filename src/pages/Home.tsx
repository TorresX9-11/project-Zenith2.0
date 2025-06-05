import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ListTodo, BarChart3, ArrowRight, Clock, Brain, BookOpen, Trophy, AlertTriangle, X } from 'lucide-react';
import { useZenith } from '../context/ZenithContext';

const Home: React.FC = () => {
  const { state, calculateProductivity, getTotalFreeTime, getTotalOccupiedTime } = useZenith();
  const [showWarning, setShowWarning] = useState(true);
  const hasSchedule = state.timeBlocks.length > 0;
  const hasActivities = state.activities.length > 0;
  
  return (
    <div className="fade-in relative">
      {/* Modal de advertencia importante */}
      {showWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
            <button 
              onClick={() => setShowWarning(false)}
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
              onClick={() => setShowWarning(false)}
              className="w-full bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      <section className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-8 text-white mb-8">
        <h1 className="text-3xl font-bold mb-4">Bienvenido a Zenith</h1>
        <p className="text-lg mb-6">Tu asistente inteligente para organizar tu tiempo de forma equilibrada y efectiva.</p>
        
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
              <p className="text-2xl font-bold">{calculateProductivity()}%</p>
            </div>
          </div>
        )}
      </section>
      
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <FeatureCard 
          icon={<Calendar className="text-primary-500" size={24} />}
          title="Gestiona tu Horario"
          description="Ingresa tus clases y actividades para visualizar tu semana completa."
          linkTo="/horario"
          linkText="Ir al Horario"
          status={hasSchedule ? 'Horario configurado' : 'Pendiente'}
          statusColor={hasSchedule ? 'text-success-500' : 'text-warning-500'}
        />
        
        <FeatureCard 
          icon={<ListTodo className="text-secondary-500" size={24} />}
          title="Planifica Actividades"
          description="Agrega actividades de estudio, ejercicio y descanso en tus tiempos libres."
          linkTo="/actividades"
          linkText="Gestionar Actividades"
          status={hasActivities ? `${state.activities.length} actividades` : 'Sin actividades'}
          statusColor={hasActivities ? 'text-success-500' : 'text-warning-500'}
        />
        
        <FeatureCard 
          icon={<BarChart3 className="text-accent-500" size={24} />}
          title="Analiza tu Tiempo"
          description="Visualiza métricas de productividad y balance en tu distribución de tiempo."
          linkTo="/dashboard"
          linkText="Ver Dashboard"
          status="Disponible"
          statusColor="text-success-500"
        />
      </section>
      
      <section className="mb-8">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Brain size={20} className="text-primary-600" />
          <span>Técnicas de Estudio Recomendadas</span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StudyTechniqueCard 
            title="Técnica Pomodoro"
            description="25 minutos de estudio, 5 minutos de descanso."
            icon={<Clock size={20} />}
          />
          
          <StudyTechniqueCard 
            title="Técnica Feynman"
            description="Explica los conceptos como si enseñaras a alguien más."
            icon={<BookOpen size={20} />}
          />
          
          <StudyTechniqueCard 
            title="Repetición Espaciada"
            description="Revisa el material en intervalos crecientes de tiempo."
            icon={<Calendar size={20} />}
          />
          
          <StudyTechniqueCard 
            title="Mapas Conceptuales"
            description="Organiza visualmente los conceptos y sus relaciones."
            icon={<Brain size={20} />}
          />
        </div>
      </section>
      
      <section className="bg-neutral-100 rounded-xl p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">¿Cómo Funciona Zenith?</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="bg-primary-100 text-primary-700 w-8 h-8 rounded-full flex items-center justify-center mb-3">1</div>
            <h3 className="font-semibold mb-2">Ingresa tu Horario</h3>
            <p className="text-neutral-600 text-sm">Registra tus clases y compromisos semanales para identificar tus tiempos libres.</p>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="bg-primary-100 text-primary-700 w-8 h-8 rounded-full flex items-center justify-center mb-3">2</div>
            <h3 className="font-semibold mb-2">Define tus Actividades</h3>
            <p className="text-neutral-600 text-sm">Agrega las actividades que deseas realizar durante la semana y su prioridad.</p>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="bg-primary-100 text-primary-700 w-8 h-8 rounded-full flex items-center justify-center mb-3">3</div>
            <h3 className="font-semibold mb-2">Optimiza tu Tiempo</h3>
            <p className="text-neutral-600 text-sm">Visualiza recomendaciones y métricas para mejorar tu productividad.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  linkTo: string;
  linkText: string;
  status: string;
  statusColor: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, linkTo, linkText, status, statusColor }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <div className="p-2 bg-neutral-100 rounded-lg">
          {icon}
        </div>
        <span className={`text-xs font-medium ${statusColor} bg-opacity-10 px-2 py-1 rounded-full`}>
          {status}
        </span>
      </div>
      <h3 className="font-semibold text-lg mb-2 mt-4">{title}</h3>
      <p className="text-neutral-600 text-sm mb-4">{description}</p>
      <Link 
        to={linkTo} 
        className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center gap-1"
      >
        {linkText} <ArrowRight size={16} />
      </Link>
    </div>
  );
};

interface StudyTechniqueCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const StudyTechniqueCard: React.FC<StudyTechniqueCardProps> = ({ title, description, icon }) => {
  return (
    <div className="bg-white border border-neutral-200 rounded-lg p-4 hover:border-primary-300 transition-colors">
      <div className="flex items-center gap-2 mb-2">
        <div className="text-primary-600">
          {icon}
        </div>
        <h3 className="font-medium">{title}</h3>
      </div>
      <p className="text-neutral-600 text-sm">{description}</p>
    </div>
  );
};

export default Home;
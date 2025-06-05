import React from 'react';
import { useZenith } from '../context/ZenithContext';
import { ActivityType } from '../types';
import { 
  BarChart3, 
  Lightbulb, 
  Clock, 
  Brain, 
  TrendingUp, 
  BookOpen, 
  Users, 
  Coffee, 
  Dumbbell, 
  Calendar 
} from 'lucide-react';
import TimeTable from '../components/TimeTable';

interface StudyTechnique {
  name: string;
  icon: React.ReactNode;
  description: string;
  active: boolean;
}

interface ActivityData {
  type: ActivityType | 'Libre';
  hours: number;
  color: string;
  bgColor: string;
  icon: React.ReactNode;
  label: string;
}

interface BalanceCardProps {
  icon: React.ReactNode;
  title: string;
  hours: number;
  percentage: number;
  color: string;
}

const BalanceCard: React.FC<BalanceCardProps> = ({ icon, title, hours, percentage, color }) => {
  return (
    <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          {icon}
          <h3 className="font-medium">{title}</h3>
        </div>
        <p className="text-2xl font-bold">{hours.toFixed(1)}h</p>
      </div>
      <div className="h-2 w-full bg-neutral-100">
        <div 
          className={`h-full bg-gradient-to-r ${color}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="p-2 text-center text-xs text-neutral-500">
        {percentage}% del total
      </div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const { 
    state, 
    calculateProductivity,
    getActivityDuration,
    getTotalFreeTime,
    getTotalOccupiedTime
  } = useZenith();

  const hasSchedule = state.timeBlocks.length > 0;
  const hasActivities = state.activities.length > 0;
  const totalOccupiedHours = getTotalOccupiedTime();
  const totalFreeHours = getTotalFreeTime();
  const totalWeeklyHours = 24 * 7;
  // Consideramos 16 horas disponibles por día (24h - 8h de sueño)
  const dailyAvailableHours = 16;
  const totalAvailableHours = dailyAvailableHours * 7;

  // Función auxiliar para calcular porcentajes basados en tiempo disponible
  const calculatePercentage = (hours: number): number => {
    return Math.round((hours / totalAvailableHours) * 100);
  };

  // Función auxiliar para calcular horas totales por tipo
  const getTotalHours = (type: ActivityType): number => {
    // Para académico y trabajo, sumamos tanto bloques como actividades
    if (type === 'academic' || type === 'work') {
      // Suma las horas de los bloques de tiempo fijos
      const blockHours = state.timeBlocks
        .filter(block => block.type === 'occupied' && block.activityType === type)
        .reduce((total, block) => {
          const [startHour, startMinute] = block.startTime.split(':').map(Number);
          const [endHour, endMinute] = block.endTime.split(':').map(Number);
          const start = startHour + (startMinute / 60);
          const end = endHour + (endMinute / 60);
          return total + (end >= start ? end - start : (24 - start) + end);
        }, 0);

      // Suma las horas de las actividades adicionales
      const activityHours = getActivityDuration(type);
      return blockHours + activityHours;
    }
    
    // Para el resto de actividades, solo usamos las horas ingresadas por el usuario
    return getActivityDuration(type);
  };

  // Cálculo de horas por tipo de actividad
  const activityData: ActivityData[] = [
    {
      type: 'academic',
      hours: getTotalHours('academic'),
      color: 'bg-primary-600',
      bgColor: 'bg-primary-100',
      icon: <BookOpen size={20} className="text-primary-600" />,
      label: 'Académico'
    },
    {
      type: 'study',
      hours: getTotalHours('study'),
      color: 'bg-secondary-600',
      bgColor: 'bg-secondary-100',
      icon: <Brain size={20} className="text-secondary-600" />,
      label: 'Estudio'
    },
    {
      type: 'work',
      hours: getTotalHours('work'),
      color: 'bg-purple-600',
      bgColor: 'bg-purple-100',
      icon: <BookOpen size={20} className="text-purple-600" />,
      label: 'Trabajo'
    },
    {
      type: 'exercise',
      hours: getTotalHours('exercise'),
      color: 'bg-green-600',
      bgColor: 'bg-green-100',
      icon: <Dumbbell size={20} className="text-green-600" />,
      label: 'Ejercicio'
    },
    {
      type: 'social',
      hours: getTotalHours('social'),
      color: 'bg-yellow-600',
      bgColor: 'bg-yellow-100',
      icon: <Users size={20} className="text-yellow-600" />,
      label: 'Social'
    },
    {
      type: 'rest',
      hours: getTotalHours('rest'),
      color: 'bg-accent-600',
      bgColor: 'bg-accent-100',
      icon: <Coffee size={20} className="text-accent-600" />,
      label: 'Descanso'
    },
    {
      type: 'personal',
      hours: getTotalHours('personal'),
      color: 'bg-neutral-600',
      bgColor: 'bg-neutral-100',
      icon: <Users size={20} className="text-neutral-600" />,
      label: 'Personal'
    },
    {
      type: 'Libre',
      hours: totalFreeHours,
      color: 'bg-red-600',
      bgColor: 'bg-red-100',
      icon: <Clock size={20} className="text-red-600" />,
      label: 'Libre'
    }
  ];

  // Técnicas de estudio
  const studyTechniques: StudyTechnique[] = [
    {
      name: 'Técnica Pomodoro',
      icon: <Brain size={20} />,
      description: '25 minutos de estudio, 5 de descanso',
      active: true
    },
    {
      name: 'Método Cornell',
      icon: <BookOpen size={20} />,
      description: 'Sistema de toma de notas estructurado',
      active: false
    },
    {
      name: 'Mapas Mentales',
      icon: <Brain size={20} />,
      description: 'Organización visual de conceptos',
      active: false
    }
  ];

  // Cálculo de tiempo académico total (académico + estudio)
  const totalAcademicHours = getTotalHours('academic') + getTotalHours('study');

  // Generación de recomendaciones
  const getRecommendations = (): string[] => {
    if (!hasSchedule) {
      return [
        'Configura tu horario para obtener recomendaciones personalizadas.',
        'Agrega todas tus clases y compromisos fijos semanales.'
      ];
    }

    const recommendations: string[] = [];
    const academicPercentage = (totalAcademicHours / totalOccupiedHours) * 100;
    const exerciseHours = getActivityDuration('exercise');
    const restHours = getActivityDuration('rest');
    const freeTimePercentage = (totalFreeHours / totalWeeklyHours) * 100;

    if (freeTimePercentage < 15) {
      recommendations.push('Tu agenda está muy ocupada. Considera reducir algunas actividades para evitar el agotamiento.');
    }

    if (academicPercentage < 30 && hasActivities) {
      recommendations.push('Se recomienda dedicar al menos un 30% de tu tiempo a actividades académicas y de estudio.');
    }

    if (exerciseHours < 3 && hasActivities) {
      recommendations.push('Intenta agregar al menos 3 horas de ejercicio a la semana para mantener un equilibrio saludable.');
    }

    if (restHours < totalOccupiedHours * 0.15 && hasActivities) {
      recommendations.push('Programa más tiempo para descanso. Se recomienda al menos un 15% del tiempo ocupado.');
    }

    if (totalAcademicHours > 40) {
      recommendations.push('Tienes una alta carga académica. Asegúrate de distribuir bien tu tiempo de estudio y descanso.');
    }

    if (recommendations.length === 0) {
      recommendations.push('¡Tu distribución de tiempo luce bien equilibrada!');
    }

    return recommendations;
  };

  const recommendations = getRecommendations();
  const productivity = calculateProductivity();

  return (
    <div className="fade-in">
      <div className="bg-gradient-to-r from-accent-50 to-primary-50 border border-accent-100 rounded-lg p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <BarChart3 size={24} className="text-accent-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-accent-800 mb-2">Centro de Análisis y Recomendaciones</h2>
            <div className="text-neutral-700 space-y-2">
              <p>Aquí encontrarás un análisis detallado de tu distribución de tiempo y recomendaciones personalizadas:</p>
              <ul className="list-disc list-inside ml-4 space-y-1 text-sm">
                <li>Visualiza tu horario semanal y la distribución de actividades</li>
                <li>Recibe recomendaciones basadas en tu patrón de actividades</li>
                <li>Monitorea tu productividad y balance de tiempo</li>
                <li>Descubre técnicas de estudio efectivas</li>
              </ul>
              <div className="mt-3 bg-white bg-opacity-50 p-3 rounded-lg">
                <p className="text-sm text-accent-700">
                  <strong>¿Necesitas ayuda?</strong> Nuestro chatbot puede ayudarte a interpretar estas métricas y sugerir mejoras para tu organización. ¡Pregúntale sobre cualquier aspecto de tu horario!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BarChart3 size={24} className="text-primary-600" />
          <span>Dashboard</span>
        </h1>
        <p className="text-neutral-600">Visualiza y analiza tu distribución de tiempo</p>
      </div>

      {!hasSchedule && !hasActivities ? (
        <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-8 text-center">
          <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BarChart3 size={28} className="text-neutral-400" />
          </div>
          <h3 className="text-lg font-medium mb-2">Sin datos suficientes</h3>
          <p className="text-neutral-600 mb-4 max-w-md mx-auto">
            Para visualizar estadísticas y recomendaciones, primero configura tu horario y agrega actividades.
          </p>
        </div>
      ) : (
        <>
          {/* Horario Semanal */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Calendar size={20} className="text-primary-600" />
                <span>Mi Horario Semanal</span>
              </h2>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-neutral-500" />
                  <span className="text-sm text-neutral-600">
                    {totalOccupiedHours.toFixed(1)}h ocupadas
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-success-500" />
                  <span className="text-sm text-success-600">
                    {totalFreeHours.toFixed(1)}h libres
                  </span>
                </div>
              </div>
            </div>

            {/* Leyenda de colores */}
            <div className="mb-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-2">
                {activityData.map((activity, index) => (
                  <div key={index} className={`p-2 ${activity.bgColor} rounded-lg flex items-center gap-2`}>
                    <div className={`w-4 h-4 ${activity.color} rounded-full border-2 border-${activity.color.split('-')[1]}-200`} />
                    <span className="text-xs">{activity.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <TimeTable 
              timeBlocks={state.timeBlocks}
              startHour={5}
              endHour={22}
            />
          </div>

          {/* Distribución de Tiempo y Productividad */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="col-span-2">
              <div className="bg-white rounded-lg shadow-md p-6 h-full">
                <h2 className="text-lg font-semibold mb-4">Distribución de Tiempo Semanal</h2>
                
                <div className="space-y-4">
                  {activityData.map(activity => {
                    const percentage = calculatePercentage(activity.hours);
                    return (
                      <div key={activity.label} className="flex items-center">
                        <span className="w-24 text-sm text-neutral-600">{activity.label}</span>
                        <div className="flex-1 h-6 bg-neutral-100 rounded-full overflow-hidden ml-2">
                          <div 
                            className={`h-full ${activity.color} transition-all duration-1000 ease-out flex items-center justify-between px-2`}
                            style={{ width: `${Math.max(5, percentage)}%` }}
                          >
                            <span className="text-white text-xs font-medium">
                              {activity.hours.toFixed(1)}h
                            </span>
                            <span className="text-white text-xs font-medium">
                              {percentage}%
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            
            {/* Productividad */}
            <div className="col-span-1">
              <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg shadow-md p-6 text-white h-full flex flex-col">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp size={20} />
                  <span>Productividad Estimada</span>
                </h2>
                
                <div className="text-center my-auto">
                  <div className="relative w-32 h-32 mx-auto">
                    <div className="absolute inset-0 rounded-full bg-white bg-opacity-10 flex items-center justify-center">
                      <div 
                        className="absolute inset-1 rounded-full bg-primary-700 flex items-center justify-center"
                        style={{ 
                          clipPath: `polygon(50% 50%, 50% 0%, ${50 + productivity/2}% 0%, 100% ${productivity}%, 100% 100%, 0% 100%, 0% ${productivity}%, ${50 - productivity/2}% 0%, 50% 0%)` 
                        }}
                      />
                      <span className="text-4xl font-bold z-10">{productivity}%</span>
                    </div>
                  </div>
                  
                  <p className="mt-4 text-sm text-primary-100">
                    {productivity < 40 ? 'Baja productividad' : 
                     productivity < 70 ? 'Productividad moderada' : 
                     'Alta productividad'}
                  </p>
                </div>
                
                <p className="text-xs text-primary-200 mt-4">
                  *Basado en la distribución de actividades y tiempo dedicado a tareas productivas.
                </p>
              </div>
            </div>
          </div>

          {/* Recomendaciones y Técnicas de Estudio */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="col-span-2 bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Lightbulb size={20} className="text-primary-600" />
                <span>Recomendaciones Personalizadas</span>
              </h2>
              
              <ul className="space-y-3">
                {recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-3 p-3 bg-neutral-50 rounded-lg">
                    <div className="text-accent-600 mt-0.5">
                      <Lightbulb size={18} />
                    </div>
                    <p className="text-neutral-700">{rec}</p>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="col-span-1 bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Brain size={20} className="text-primary-600" />
                <span>Técnicas de Estudio</span>
              </h2>
              
              <div className="space-y-3">
                {studyTechniques.map((technique, index) => (
                  <div 
                    key={index} 
                    className={`p-3 rounded-lg border ${technique.active ? 'border-primary-300 bg-primary-50' : 'border-neutral-200 bg-neutral-50'}`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`${technique.active ? 'text-primary-600' : 'text-neutral-500'}`}>
                        {technique.icon}
                      </div>
                      <h3 className={`font-medium text-sm ${technique.active ? 'text-primary-700' : 'text-neutral-600'}`}>
                        {technique.name}
                      </h3>
                    </div>
                    <p className="text-xs text-neutral-600 ml-7">
                      {technique.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Balance de Actividades */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Balance de Actividades</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <BalanceCard 
                icon={<BookOpen size={20} className="text-primary-600" />}
                title="Académico Total"
                hours={totalAcademicHours}
                percentage={calculatePercentage(totalAcademicHours)}
                color="from-primary-500 to-primary-600"
              />
              <BalanceCard 
                icon={<Dumbbell size={20} className="text-success-600" />}
                title="Ejercicio"
                hours={getTotalHours('exercise')}
                percentage={calculatePercentage(getTotalHours('exercise'))}
                color="from-success-500 to-success-600"
              />
              <BalanceCard 
                icon={<Users size={20} className="text-warning-600" />}
                title="Social"
                hours={getTotalHours('social')}
                percentage={calculatePercentage(getTotalHours('social'))}
                color="from-warning-500 to-warning-600"
              />
              <BalanceCard 
                icon={<Coffee size={20} className="text-accent-600" />}
                title="Descanso"
                hours={getTotalHours('rest')}
                percentage={calculatePercentage(getTotalHours('rest'))}
                color="from-accent-500 to-accent-600"
              />
            </div>
          </div>

          {/* Resumen de Tiempo */}
          <div className="bg-neutral-100 rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Resumen de Tiempo</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Clock size={18} className="text-neutral-700" />
                  <h3 className="font-medium text-neutral-800">Tiempo Ocupado</h3>
                </div>
                <p className="text-2xl font-bold">{totalOccupiedHours.toFixed(1)}h</p>
                <p className="text-neutral-500 text-sm">
                  {Math.round((totalOccupiedHours / totalAvailableHours) * 100)}% de la semana
                </p>
              </div>
              
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Clock size={18} className="text-neutral-700" />
                  <h3 className="font-medium text-neutral-800">Tiempo Libre</h3>
                </div>
                <p className="text-2xl font-bold">{totalFreeHours.toFixed(1)}h</p>
                <p className="text-neutral-500 text-sm">
                  {Math.round((totalFreeHours / totalAvailableHours) * 100)}% de la semana
                </p>
              </div>

              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Clock size={18} className="text-neutral-700" />
                  <h3 className="font-medium text-neutral-800">Balance</h3>
                </div>
                <p className="text-2xl font-bold">
                  {totalOccupiedHours > (totalAvailableHours * 0.7) 
                    ? 'Sobrecargado' 
                    : totalOccupiedHours > (totalAvailableHours * 0.5) 
                    ? 'Ocupado' 
                    : 'Equilibrado'}
                </p>
                <p className="text-neutral-500 text-sm">
                  {totalOccupiedHours > (totalAvailableHours * 0.7)
                    ? 'Considera reducir actividades'
                    : totalOccupiedHours < (totalAvailableHours * 0.3)
                    ? 'Puedes agregar más actividades'
                    : 'Buen balance de tiempo'}
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
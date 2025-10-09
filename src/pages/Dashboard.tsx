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
  Calendar,
  HelpCircle,
  X
} from 'lucide-react';
// Charts
import {
  ResponsiveContainer,
  BarChart as RBarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RTooltip,
  Legend as RLegend,
  PieChart as RPieChart,
  Pie,
  Cell
} from 'recharts';
// TimeTable se muestra solo en Schedule

interface StudyTechnique {
  name: string;
  icon: React.ReactNode;
  description: string;
  active: boolean;
}

// activity chart data is computed inline; no interface required

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
    selectHoursByType,
    selectNextBlocks,
    selectTotalFreeHours,
    selectAdherenceRate,
    selectCompletionProgress,
    selectProductivityScore,
    selectUnplannedActivityHoursByType,
    selectTotalOccupiedMinutes
  } = useZenith();
  
  const [showHelp, setShowHelp] = React.useState(false);

  const hasSchedule = state.timeBlocks.length > 0;
  const hasActivities = state.activities.length > 0;
  const totalFreeHours = selectTotalFreeHours();
  const adherenceRate = selectAdherenceRate();
  const completionProgress = selectCompletionProgress();
  const productivityScore = selectProductivityScore();
  const totalAvailableHours = 112; // 05:00–21:00 × 7
  const occupiedHours = selectTotalOccupiedMinutes() / 60;

  // Función auxiliar para calcular porcentajes basados en tiempo disponible
  const calculatePercentage = (hours: number): number => {
    return Math.round((hours / totalAvailableHours) * 100);
  };

  // Función auxiliar para calcular horas totales por tipo
  const getTotalHours = (type: ActivityType): number => selectHoursByType(type);

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
  const plannedHours = [
    'academic','work','study','exercise','social','rest','personal'
  ].reduce((sum, t) => sum + getTotalHours(t as ActivityType), 0);
  const unplannedBacklogHours = [
    'academic','work','study','exercise','social','rest','personal'
  ].reduce((sum, t) => sum + selectUnplannedActivityHoursByType(t as ActivityType), 0);

  // Chart Data (only from timeBlocks)
  const labelMap: Record<ActivityType, string> = {
    academic: 'Académico',
    work: 'Trabajo',
    study: 'Estudio',
    exercise: 'Ejercicio',
    social: 'Social',
    rest: 'Descanso',
    personal: 'Personal'
  };
  const colorMap: Record<ActivityType, string> = {
    academic: '#2563eb',
    study: '#0ea5e9',
    work: '#7c3aed',
    exercise: '#16a34a',
    social: '#ca8a04',
    rest: '#14b8a6',
    personal: '#6b7280'
  };
  const types: ActivityType[] = ['academic','study','work','exercise','social','rest','personal'];
  const chartData = types.map(t => ({ name: labelMap[t], hours: getTotalHours(t), key: t }));

  // Generación de recomendaciones
  const getRecommendations = (): string[] => {
    if (!hasSchedule) {
      return [
        'Configura tu horario para obtener recomendaciones personalizadas.',
        'Agrega todas tus clases y compromisos fijos semanales.'
      ];
    }

    const recommendations: string[] = [];
    const academicPercentage = plannedHours > 0 ? (totalAcademicHours / plannedHours) * 100 : 0;
    const exerciseHours = getTotalHours('exercise');
    const restHours = getTotalHours('rest');
    const freeTimePercentage = (totalFreeHours / 112) * 100;

    if (freeTimePercentage < 15) {
      recommendations.push('Tu agenda está muy ocupada. Considera reducir algunas actividades para evitar el agotamiento.');
    }

    if (academicPercentage < 30 && hasActivities) {
      recommendations.push('Se recomienda dedicar al menos un 30% de tu tiempo a actividades académicas y de estudio.');
    }

    if (exerciseHours < 3 && hasActivities) {
      recommendations.push('Intenta agregar al menos 3 horas de ejercicio a la semana para mantener un equilibrio saludable.');
    }

    if (restHours < plannedHours * 0.15 && hasActivities) {
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

  return (
    <div className="fade-in">
      <div className="mb-6">
        {/* Header móvil */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
              <BarChart3 size={20} className="text-primary-600 sm:w-6 sm:h-6" />
              <span>Dashboard</span>
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
            Visualiza y analiza tu distribución de tiempo
          </p>
        </div>
      </div>

      {/* Modal de ayuda */}
      {showHelp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-neutral-200">
              <div className="flex items-center gap-3">
                <HelpCircle size={24} className="text-accent-600" />
                <h2 className="text-xl font-semibold text-accent-800">Centro de Análisis y Recomendaciones</h2>
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
                <p>Aquí encontrarás un análisis detallado de tu distribución de tiempo y recomendaciones personalizadas:</p>
                <ul className="list-disc list-inside ml-4 space-y-2 text-sm">
                  <li>Visualiza tu horario semanal y la distribución de actividades</li>
                  <li>Recibe recomendaciones basadas en tu patrón de actividades</li>
                  <li>Monitorea tu productividad y balance de tiempo</li>
                  <li>Descubre técnicas de estudio efectivas</li>
                </ul>
                <div className="p-4 bg-accent-50 border border-accent-100 rounded-md">
                  <p className="text-sm text-accent-700">
                    <strong>¿Necesitas ayuda?</strong> Nuestro chatbot puede ayudarte a interpretar estas métricas y sugerir mejoras para tu organización. ¡Pregúntale sobre cualquier aspecto de tu horario!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {!hasSchedule && !hasActivities ? (
        <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-8 text-center">
          <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BarChart3 size={28} className="text-neutral-400" />
          </div>
          <h3 className="text-lg font-medium mb-2">Sin datos suficientes</h3>
          <p className="text-neutral-600 mb-4 max-w-md mx-auto">
            Para visualizar estadísticas y recomendaciones, primero debes ajustar tu tiempo en Horario y luego agregar tus Actividades.
          </p>
        </div>
      ) : (
        <>
          {/* Resumen de Agenda (sin timetable) */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Calendar size={20} className="text-primary-600" />
                <span>Resumen de Agenda</span>
              </h2>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-neutral-500" />
                  <span className="text-sm text-neutral-600">{occupiedHours.toFixed(1)}h ocupadas</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-success-500" />
                  <span className="text-sm text-success-600">{totalFreeHours.toFixed(1)}h libres</span>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              {selectNextBlocks(5).map(b => (
                <div key={b.id} className="flex items-center justify-between border border-neutral-200 rounded-md p-3">
                  <div>
                    <div className="font-medium">{b.title}</div>
                    <div className="text-sm text-neutral-600">{b.day} {b.startTime}-{b.endTime}</div>
                  </div>
                </div>
              ))}
              {selectNextBlocks(5).length === 0 && (
                <div className="text-sm text-neutral-600">No hay próximos bloques en la semana.</div>
              )}
            </div>
          </div>

          {/* KPIs principales */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="col-span-2">
              <div className="bg-white rounded-lg shadow-md p-6 h-full">
                <h2 className="text-lg font-semibold mb-4">Distribución de Tiempo Planificado (base: 112h)</h2>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-neutral-50 rounded-md p-4 border border-neutral-200">
                      <div className="text-xs text-neutral-500 mb-1">Planned Hours</div>
                      <div className="text-2xl font-bold">{plannedHours.toFixed(1)}h</div>
                      <div className="text-[11px] text-neutral-500">Base 112h</div>
                    </div>
                    <div className="bg-neutral-50 rounded-md p-4 border border-neutral-200">
                      <div className="text-xs text-neutral-500 mb-1">Free Time</div>
                      <div className="text-2xl font-bold">{Math.round((totalFreeHours/112)*100)}%</div>
                      <div className="text-[11px] text-neutral-500">{totalFreeHours.toFixed(1)}h libres</div>
                    </div>
                    <div className="bg-neutral-50 rounded-md p-4 border border-neutral-200">
                      <div className="text-xs text-neutral-500 mb-1">Academic Hours</div>
                      <div className="text-2xl font-bold">{totalAcademicHours.toFixed(1)}h</div>
                    </div>
                    <div className="bg-neutral-50 rounded-md p-4 border border-neutral-200">
                      <div className="text-xs text-neutral-500 mb-1">Unplanned Backlog</div>
                      <div className="text-2xl font-bold">{unplannedBacklogHours.toFixed(1)}h</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Productividad (Adherence + Completion) */}
            <div className="col-span-1">
              <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg shadow-md p-6 text-white h-full flex flex-col">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp size={20} />
                  <span>Productividad</span>
                </h2>
                
                <div className="text-center my-auto">
                  <div className="text-5xl font-bold">{productivityScore}%</div>
                  <p className="mt-4 text-sm text-primary-100">Adherence {adherenceRate}% · Completion {completionProgress}%</p>
                </div>
                
                <p className="text-xs text-primary-200 mt-4">
                  *70% Adherence + 30% Completion (configurable). Base: bloques planificados en 05–21.
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

          {/* Gráficos: Column (horas por tipo) y Pie (proporción por tipo) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4">Horas Planificadas por Tipo</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RBarChart data={chartData} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tickFormatter={(v) => `${v}h`} width={40} />
                    <RTooltip formatter={(val) => {
                      const num = Array.isArray(val) ? Number(val[0]) : Number(val);
                      return [`${num.toFixed(1)}h`, 'Horas'];
                    }} />
                    <RLegend />
                    <Bar dataKey="hours" name="Horas">
                      {chartData.map((entry) => (
                        <Cell key={entry.key} fill={colorMap[entry.key as ActivityType]} />
                      ))}
                    </Bar>
                  </RBarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4">Distribución de Horas por Tipo</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RPieChart>
                    <Pie data={chartData} dataKey="hours" nameKey="name" outerRadius={90} label>
                      {chartData.map((entry) => (
                        <Cell key={entry.key} fill={colorMap[entry.key as ActivityType]} />
                      ))}
                    </Pie>
                    <RTooltip formatter={(val, name) => {
                      const num = Array.isArray(val) ? Number(val[0]) : Number(val as number);
                      return [`${num.toFixed(1)}h`, String(name)];
                    }} />
                  </RPieChart>
                </ResponsiveContainer>
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
                <p className="text-2xl font-bold">{occupiedHours.toFixed(1)}h</p>
                <p className="text-neutral-500 text-sm">
                  {Math.round((occupiedHours / totalAvailableHours) * 100)}% de la semana
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
                  {occupiedHours > (totalAvailableHours * 0.7) 
                    ? 'Sobrecargado' 
                    : occupiedHours > (totalAvailableHours * 0.5) 
                    ? 'Ocupado' 
                    : 'Equilibrado'}
                </p>
                <p className="text-neutral-500 text-sm">
                  {occupiedHours > (totalAvailableHours * 0.7)
                    ? 'Considera reducir actividades'
                    : occupiedHours < (totalAvailableHours * 0.3)
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
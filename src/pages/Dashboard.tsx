import React from 'react';
import { useZenith } from '../context/ZenithContext';
import { ActivityType } from '../types';
import { 
  BarChart3, 
  Lightbulb, 
  Clock, 
  Brain, 
  TrendingUp, 
  HelpCircle,
  X,
  BookOpen
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

// Tipado anterior de técnicas ya no se usa; reemplazado por techniquesData

// activity chart data is computed inline; no interface required

// BalanceCard eliminado junto con su sección de uso

const Dashboard: React.FC = () => {
  const { 
    state, 
    selectHoursByType,
    selectTotalFreeHours,
    selectAdherenceRate,
    selectCompletionProgress,
    selectProductivityScore,
    selectTotalOccupiedMinutes
  } = useZenith();
  
  const [showDashboardHelp, setShowDashboardHelp] = React.useState(false);
  const [showProductivityHelp, setShowProductivityHelp] = React.useState(false);
  const [showTechnique, setShowTechnique] = React.useState(false);
  const [selectedTechnique, setSelectedTechnique] = React.useState<null | {
    name: string;
    details: {
      overview: string;
      purpose: string;
      how: string[];
      start: string[];
    };
  }>(null);

  const hasSchedule = state.timeBlocks.length > 0;
  const hasActivities = state.activities.length > 0;
  const totalFreeHours = selectTotalFreeHours();
  const adherenceRate = selectAdherenceRate();
  const completionProgress = selectCompletionProgress();
  const productivityScore = selectProductivityScore();
  const totalAvailableHours = 112; // 05:00–21:00 × 7
  const occupiedHours = selectTotalOccupiedMinutes() / 60;

  // Función auxiliar para calcular porcentajes basados en tiempo disponible
  // helper removido: calculatePercentage

  // Función auxiliar para calcular horas totales por tipo
  const getTotalHours = (type: ActivityType): number => selectHoursByType(type);

  // Técnicas de estudio
  const techniquesData = [
    {
      name: 'Active Recall',
      details: {
        overview: 'Consiste en intentar recordar activamente la información sin mirarla, para consolidar la memoria a largo plazo.',
        purpose: 'Fortalecer la retención y detectar lagunas de conocimiento.',
        how: [
          'Cierra el material y explica con tus palabras lo que aprendiste.',
          'Responde preguntas sin ver apuntes; verifica y corrige luego.',
          'Crea tarjetas (flashcards) con preguntas en un lado y respuestas en el otro.'
        ],
        start: [
          'Elige un tema corto (10–15 min).',
          'Escribe 3–5 preguntas clave y contéstalas sin mirar.',
          'Revisa tus respuestas y apunta lo que faltó.'
        ]
      }
    },
    {
      name: 'Repetición Espaciada',
      details: {
        overview: 'Repasar el contenido en intervalos crecientes (1 día, 3 días, 7 días, etc.) para evitar el olvido.',
        purpose: 'Mantener la información fresca con poco tiempo diario.',
        how: [
          'Programa repasos breves en días alternos.',
          'Usa flashcards y vuelve a las que fallas con mayor frecuencia.',
          'Aumenta el intervalo si respondes bien varias veces seguidas.'
        ],
        start: [
          'Crea una lista de temas y un calendario simple (app o papel).',
          'Dedica 10–20 min al día a repasos rápidos.',
          'Registra qué tarjetas/temas cuestan más.'
        ]
      }
    },
    {
      name: 'Método Feynman',
      details: {
        overview: 'Explicar un concepto con palabras simples, como si enseñaras a alguien sin conocimientos previos.',
        purpose: 'Detectar huecos de comprensión y dominar conceptos complejos.',
        how: [
          'Escribe el concepto y explícalo con lenguaje sencillo.',
          'Identifica partes confusas y vuelve a estudiar solo eso.',
          'Refina la explicación hasta que sea clara y corta.'
        ],
        start: [
          'Elige un concepto mediano (10–20 min).',
          'Grábate explicándolo o escríbelo en una hoja.',
          'Repite el ciclo: explicar → revisar → simplificar.'
        ]
      }
    },
    {
      name: 'Método Cornell',
      details: {
        overview: 'Sistema de notas dividido en columnas: apuntes, palabras clave/preguntas y un resumen final.',
        purpose: 'Organizar ideas y facilitar repasos rápidos.',
        how: [
          'En clase, escribe apuntes en la columna grande.',
          'Después, agrega preguntas o palabras clave al lado.',
          'Cierra con un resumen de 5–7 líneas al final.'
        ],
        start: [
          'Prepara una plantilla (digital o papel) con 2 columnas y un pie.',
          'Practica redactar el resumen apenas termines la clase.',
          'Usa las preguntas laterales para el Active Recall.'
        ]
      }
    },
    {
      name: 'Mapas Mentales / Esquemas',
      details: {
        overview: 'Representar visualmente conceptos y conexiones entre ideas (jerarquías, ramas, enlaces).',
        purpose: 'Ver el panorama general y relaciones clave.',
        how: [
          'Empieza por el tema central y ramifica subtemas.',
          'Usa palabras clave, flechas y colores para relaciones.',
          'Revisa si el mapa tiene una secuencia lógica.'
        ],
        start: [
          'Toma un tema con varios subtemas (capítulo).',
          'Dibuja un borrador rápido y refínalo en 10–15 min.',
          'Conviértelo en guía para Active Recall.'
        ]
      }
    },
    {
      name: 'Resúmenes',
      details: {
        overview: 'Sintetizar con tus palabras lo más importante, priorizando ideas principales y conexiones.',
        purpose: 'Fijar conceptos clave y reducir volumen de estudio.',
        how: [
          'Lee y subraya ideas centrales; evita copiar literal.',
          'Escribe párrafos cortos y listas con enlaces entre ideas.',
          'Cierra con 3–5 conclusiones prácticas.'
        ],
        start: [
          'Elige un apartado pequeño (3–5 páginas).',
          'Resume en 10–15 líneas máximo.',
          'Usa el resumen para repasos espaciados.'
        ]
      }
    },
    {
      name: 'Pomodoro',
      details: {
        overview: 'Ciclos cortos de enfoque con descansos breves (p. ej., 25/5).',
        purpose: 'Mantener foco, evitar agotamiento y medir avances.',
        how: [
          'Define la tarea y pon un temporizador (25 min).',
          'Trabaja sin distracciones hasta que suene.',
          'Descansa 5 min; cada 4 ciclos, un descanso más largo.'
        ],
        start: [
          'Comienza con 2–3 ciclos por sesión.',
          'Ajusta la duración si te cuesta entrar en foco.',
          'Registra qué logras en cada ciclo.'
        ]
      }
    }
  ];

  // Cálculo de tiempo académico total (académico + estudio)
  const totalAcademicHours = getTotalHours('academic') + getTotalHours('study');
  const plannedHours = [
    'academic','work','study','exercise','social','rest','personal'
  ].reduce((sum, t) => sum + getTotalHours(t as ActivityType), 0);
  // backlog no utilizado en el layout actual

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

  // Generación de recomendaciones (reglas por horario/bloques)
  const getRecommendations = (): string[] => {
    // Sin datos base
    if (!hasSchedule) {
      return [
        'Configura tu horario para obtener recomendaciones personalizadas.',
        'Agrega tus clases y compromisos fijos semanales.'
      ];
    }

    // Indicadores base a partir del horario
    const startHour = state.settings?.activeWindow?.startHour ?? 5;
    const endHour = state.settings?.activeWindow?.endHour ?? 21;
    const weeklyBaseHours = (endHour - startHour) * 7;
    const freePct = weeklyBaseHours > 0 ? (totalFreeHours / weeklyBaseHours) * 100 : 0;
    const exerciseHours = getTotalHours('exercise');
    // const restHours = getTotalHours('rest');
    const academicHours = getTotalHours('academic');
    const studyHours = getTotalHours('study');
    const academicPct = plannedHours > 0 ? (totalAcademicHours / plannedHours) * 100 : 0;

    // Backlog urgente (removido de recomendaciones)

    // Helpers para minutos dentro de ventana activa
    const toMin = (hhmm: string) => {
      const [h, m] = hhmm.split(':').map(Number);
      return h * 60 + (m || 0);
    };
    const winStart = startHour * 60;
    const winEnd = endHour * 60;
    const minutesWithinWindow = (start: number, end: number) => {
      const segments = end >= start ? [{ s: start, e: end }] : [{ s: start, e: 24 * 60 }, { s: 0, e: end }];
      return segments.reduce((acc, seg) => acc + Math.max(0, Math.min(seg.e, winEnd) - Math.max(seg.s, winStart)), 0);
    };

    // Carga diaria y fragmentación
    const blocksPerDay = [0,1,2,3,4,5,6].map(i => state.timeBlocks.filter(b => b.type === 'occupied' && b.day === (['lunes','martes','miércoles','jueves','viernes','sábado','domingo'] as const)[i]).length);
    const maxBlocksPerDay = Math.max(...blocksPerDay);

    // Horas por tipo por día (para regla de estudio mínimo diario sin clases)
    const dayNames = ['lunes','martes','miércoles','jueves','viernes','sábado','domingo'] as const;
    const hoursByDayAndType = (dayIndex: number, type: ActivityType) => {
      const dayName = dayNames[dayIndex];
      const minutes = state.timeBlocks
        .filter(b => b.type === 'occupied' && b.day === dayName && b.activityType === type)
        .reduce((sum, b) => sum + minutesWithinWindow(toMin(b.startTime), toMin(b.endTime)), 0);
      return minutes / 60;
    };
    const totalHoursByDay = (dayIndex: number) => {
      const dayName = dayNames[dayIndex];
      const minutes = state.timeBlocks
        .filter(b => b.type === 'occupied' && b.day === dayName)
        .reduce((sum, b) => sum + minutesWithinWindow(toMin(b.startTime), toMin(b.endTime)), 0);
      return minutes / 60;
    };
    const nonAcademicWorkHoursByDay = (dayIndex: number) => {
      const dayName = dayNames[dayIndex];
      const minutes = state.timeBlocks
        .filter(b => b.type === 'occupied' && b.day === dayName && b.activityType !== 'academic' && b.activityType !== 'work')
        .reduce((sum, b) => sum + minutesWithinWindow(toMin(b.startTime), toMin(b.endTime)), 0);
      return minutes / 60;
    };

    // Descansos existentes: detectar al menos un bloque corto (15–30 min) y uno largo (45–60 min)
    const restDurationsMin = state.timeBlocks
      .filter(b => b.type === 'occupied' && b.activityType === 'rest')
      .map(b => minutesWithinWindow(toMin(b.startTime), toMin(b.endTime)));
    const hasShortRest = restDurationsMin.some(d => d >= 15 && d <= 30);
    const hasLongRest = restDurationsMin.some(d => d >= 45);

    type Rec = { severity: number; msg: string };
    const recs: Rec[] = [];

    // 1) Saturación / tiempo libre bajo (mensaje simple)
    if (freePct < 15) {
      recs.push({ severity: 3, msg: 'Tu semana está muy llena. Libera 2–4h moviendo tareas de menor prioridad a otros días.' });
    }

    // 2) Balance académico/estudio
    if (hasActivities && academicPct < 30) {
      recs.push({ severity: 2, msg: 'Suma más estudio: busca 2 huecos de 1h para repasar o avanzar en tus materias.' });
    }

    // 3) Ejercicio mínimo
    if (hasActivities && exerciseHours < 3) {
      recs.push({ severity: 3, msg: 'Añade al menos 3h de ejercicio en la semana (por ejemplo, 1h x 3 dias a la semana o 45min x 4 dias a la semana).' });
    }

    // 4) Pausas por carga académica (>33h) y/o estudio (>8h), solo si no existen ya bloques de descanso corto y largo
    if (hasSchedule && academicHours > 33 && !(hasShortRest && hasLongRest)) {
      recs.push({ severity: 3, msg: 'Alta carga académica (Más de 33 hrs). Si puedes, programa pausas: cortas (15 min) cada 30 min a 1 hr, y una pausa larga (45–60 min) al día. Además, añade al menos 2 pausas largas extra en la semana.' });
    }
    if (hasActivities && studyHours > 8 && !(hasShortRest && hasLongRest)) {
      recs.push({ severity: 2, msg: 'Por tu carga de estudio (Más de 8 hrs), programa pausas: cortas (15 min) cada 30–45 min y una pausa larga (45–60 min) al día.' });
    }
    
    // 5) Reglas por día despierto 12–14h y reubicar si se excede (sin contar académico/Trabajo)
    const overloadedDays: string[] = [];
    for (let i = 0; i < 7; i++) {
      const hours = totalHoursByDay(i);
      if (hours > 14) {
        const moveable = nonAcademicWorkHoursByDay(i);
        if (moveable > 0.5) {
          overloadedDays.push(dayNames[i]);
        }
      }
    }
    if (overloadedDays.length > 0) {
      recs.push({ severity: 2, msg: `Algunos días superan 14h ocupadas (${overloadedDays.slice(0,2).join(', ')}). Mueve bloques que no sean académicos o de trabajo a otro día.` });
    }

    // 6) Backlog urgente: sin recomendaciones

    // 7) Fragmentación alta
    if (maxBlocksPerDay >= 8) {
      recs.push({ severity: 1, msg: 'Hay muchos bloques distintos en el día. Junta los que sean seguidos o parecidos; así mejorarás tu organización.' });
    }

    // 8) Estudio
    // Total de estudio de lunes a domingo (contabiliza fin de semana solo si ya hay estudio ingresado)
    let weeklyStudyTotal = 0;
    for (let i = 0; i < 7; i++) {
      weeklyStudyTotal += hoursByDayAndType(i, 'study');
    }
    const hasClassesWeek = academicHours > 0;
    // Recomendación A: si NO hay clases en la semana, sugiere 2h diarias (día por medio), salvo que ya cumpla 6–8h
    if (!hasClassesWeek) {
      let needsDailyStudy = false;
      for (let i = 0; i < 5; i++) { // lunes a viernes
        const academicH = hoursByDayAndType(i, 'academic');
        const studyH = hoursByDayAndType(i, 'study');
        if (academicH === 0 && studyH < 2) { needsDailyStudy = true; break; }
      }
      if ((needsDailyStudy || weeklyStudyTotal < 6) && !(weeklyStudyTotal >= 6 && weeklyStudyTotal <= 8)) {
        recs.push({ severity: 2, msg: 'Si no tienes clases dedica al menos 2h de estudio diario (recomendamos día por medio: lunes, miércoles y viernes; o martes y jueves). La meta es 6–8h semanales.' });
      }
    } else {
      // Recomendación B: si HAY clases y no llega a 6h totales en la semana, sugiere alcanzar 6h repartidas
      if (weeklyStudyTotal < 6) {
        recs.push({ severity: 2, msg: 'Intenta dedicar al menos 6 horas de estudio a la semana, repartidas en varios días. Así será más fácil mantener la concentración y avanzar sin sentirte abrumado; lo importante es la constancia.' });
      }
    }
    // 9) Sugerencia positiva
    if (recs.length === 0) {
      recs.push({ severity: 0, msg: '¡Tu distribución luce equilibrada! Mantén tus hábitos y revisa semanalmente.' });
    }

    return recs
      .sort((a, b) => b.severity - a.severity)
      .slice(0, 7)
      .map(r => r.msg);
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
              onClick={() => setShowDashboardHelp(!showDashboardHelp)}
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

      {/* Modal de Ayuda del Dashboard (explica módulos) */}
      {showDashboardHelp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowDashboardHelp(false)}>
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-neutral-200">
              <div className="flex items-center gap-3">
                <HelpCircle size={24} className="text-accent-600" />
                <h2 className="text-xl font-semibold text-accent-800">¿Cómo funciona el Dashboard?</h2>
              </div>
              <button 
                onClick={() => setShowDashboardHelp(false)}
                className="text-neutral-500 hover:text-neutral-700 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6">
              <div className="text-neutral-700 space-y-4">
                <p className="text-sm">Aquí ves un resumen de tu semana:</p>
                <ul className="list-disc list-inside ml-4 space-y-2 text-sm">
                  <li><strong>Distribución de horas</strong>: barras y pastel muestran en qué inviertes más tiempo.</li>
                  <li><strong>Productividad</strong>: mide adherencia y finalización de actividades.</li>
                  <li><strong>Recomendaciones</strong>: consejos simples para equilibrar estudio, ejercicio y descansos.</li>
                  <li><strong>Técnicas de estudio</strong>: guía rápida para aplicar métodos efectivos.</li>
                  <li><strong>Resumen de tiempo</strong>: horas ocupadas y libres de la semana.</li>
                </ul>
                <div className="p-4 bg-accent-50 border border-accent-100 rounded-md">
                  <p className="text-sm text-accent-700">Tip: si cambia tu horario, vuelve al Dashboard para ver recomendaciones actualizadas.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal técnica de estudio */}
      {showTechnique && selectedTechnique && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-neutral-200">
              <div className="flex items-center gap-3">
                <Brain size={20} className="text-primary-600" />
                <h3 className="text-xl font-semibold text-neutral-800">{selectedTechnique.name}</h3>
              </div>
              <button onClick={() => setShowTechnique(false)} className="text-neutral-500 hover:text-neutral-700 transition-colors">
                <X size={22} />
              </button>
            </div>
            <div className="p-6 space-y-4 text-neutral-700">
              <div>
                <h4 className="font-semibold mb-1">¿De qué trata?</h4>
                <p className="text-sm">{selectedTechnique.details.overview}</p>
              </div>
              <div>
                <h4 className="font-semibold mb-1">¿Para qué sirve?</h4>
                <p className="text-sm">{selectedTechnique.details.purpose}</p>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Cómo aplicarla</h4>
                <ul className="list-disc list-inside text-sm space-y-1">
                  {selectedTechnique.details.how.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Cómo comenzar</h4>
                <ul className="list-disc list-inside text-sm space-y-1">
                  {selectedTechnique.details.start.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
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
          {/* Top row: Gráficos + Productividad */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4">Distribución de Horas Planificadas</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RBarChart data={chartData} margin={{ top: 8, right: 16, bottom: 12, left: 8 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} minTickGap={0} />
                    <YAxis tickFormatter={(v) => `${v}h`} width={40} />
                    <RTooltip formatter={(val) => {
                      const num = Array.isArray(val) ? Number(val[0]) : Number(val);
                      return [`${num.toFixed(1)}h`, 'Horas'];
                    }} />
                    <RLegend />
                    <Bar dataKey="hours" name="Horas" barSize={28}>
                      {chartData.map((entry) => (
                        <Cell key={entry.key} fill={colorMap[entry.key as ActivityType]} />
                      ))}
                    </Bar>
                  </RBarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4">Visualización de Horas Planificadas</h2>
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
            <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg shadow-md p-6 text-white h-full flex flex-col relative">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <TrendingUp size={20} />
                  <span className="text-lg font-semibold">Productividad</span>
                </div>
                <button
                  onClick={() => setShowProductivityHelp(true)}
                  className="p-1 hover:bg-white/10 rounded-full"
                  title="¿Cómo se calcula?"
                >
                  <HelpCircle size={18} className="text-white/80" />
                </button>
          </div>

              <div className="text-center my-auto">
                <div className="text-5xl font-bold">{productivityScore}%</div>
                <p className="mt-4 text-sm text-primary-100">Adherencia {adherenceRate}% · Finalización {completionProgress}%</p>
              </div>
            </div>
          </div>

          {/* KPI intermedio eliminado (Distribución de Tiempo Planificado) */}

          {/* Recomendaciones + Resumen (izquierda) y Técnicas (derecha) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6 items-stretch">
            {/* Columna izquierda (2/3): Recomendaciones + Resumen apilados y del mismo ancho */}
            <div className="lg:col-span-2 grid grid-cols-1 lg:grid-rows-2 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6">
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
            </div>
            {/* Columna derecha (1/3): Técnicas del mismo ancho que Productividad y a toda altura */}
            <div className="bg-white rounded-lg shadow-md p-6 lg:col-span-1 lg:row-span-2">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Brain size={20} className="text-primary-600" />
                <span>Técnicas de Estudio</span>
              </h2>
              <div className="space-y-3">
                {techniquesData.map((t, index) => {
                  const icon = t.name.includes('Pomodoro')
                    ? <Clock size={18} className="text-neutral-500" />
                    : t.name.includes('Cornell') || t.name.includes('Resúmenes')
                    ? <BookOpen size={18} className="text-neutral-500" />
                    : <Brain size={18} className="text-neutral-500" />;
                  return (
                    <button
                      key={index}
                      onClick={() => { setSelectedTechnique(t); setShowTechnique(true); }}
                      className="w-full text-left p-3 border rounded-lg bg-white border-neutral-200 hover:bg-primary-50 hover:border-primary-300 hover:shadow-sm transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">{icon}</div>
                        <div>
                          <div className="font-medium text-sm text-neutral-900">{t.name}</div>
                          <div className="text-xs text-neutral-600 mt-0.5">Haz clic para ver cómo usarla</div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

        {/* Resumen de Agenda eliminado */}
        </>
      )}

      {/* Modal de Productividad (separado) */}
      {showProductivityHelp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowProductivityHelp(false)}>
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-neutral-200">
              <div className="flex items-center gap-3">
                <HelpCircle size={24} className="text-primary-600" />
                <h2 className="text-xl font-semibold text-neutral-800">¿Cómo medimos tu productividad?</h2>
              </div>
              <button onClick={() => setShowProductivityHelp(false)} className="text-neutral-500 hover:text-neutral-700 transition-colors">
                <X size={24} />
              </button>
            </div>
            <div className="p-6">
              <div className="text-neutral-700 space-y-4">
                <p className="text-sm">Tu productividad combina dos factores:</p>
                <ol className="list-decimal list-inside ml-4 space-y-2 text-sm">
                  <li><strong>Adherencia</strong>: cuánto cumples tus tareas planificadas (las que están en tu horario o con horario preferido) y marcas como completadas.</li>
                  <li><strong>Finalización</strong>: cuántas tareas completas en total.</li>
                </ol>
                <p className="text-sm">Además, las tareas tienen <strong>tipo</strong> (académico, estudio, ejercicio, etc.) y <strong>urgencia</strong> (muy urgente, urgente, media, normal, baja). Las más urgentes y de tipos más relevantes aportan más.</p>
                <p className="text-sm">Fórmula base: <strong>70% Adherencia + 30% Finalización</strong>.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
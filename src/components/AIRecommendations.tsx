import React, { useState } from 'react';
import { useZenith } from '../context/ZenithContext';
import { Brain, Lightbulb, Clock, MessageCircle, ChevronDown, ChevronUp } from 'lucide-react';

const AIRecommendations: React.FC = () => {
  const { state, getTotalFreeTime, getActivityDuration } = useZenith();
  const [showAllTips, setShowAllTips] = useState(false);
  
  const getStudyRecommendations = () => {
    const studyHours = getActivityDuration('study');
    const academicHours = getActivityDuration('academic');
    const freeTime = getTotalFreeTime();
    
    if (freeTime < 10) {
      return [
        "Prioriza las materias más exigentes en tus momentos de mayor energía",
        "Usa la técnica Pomodoro (25min estudio/5min descanso) para maximizar la concentración",
        "Establece objetivos de estudio muy específicos para cada sesión",
        "Aprovecha los pequeños espacios de tiempo entre actividades para repasos rápidos",
        "Utiliza recursos multimedia y diferentes métodos de estudio para optimizar el aprendizaje"
      ];
    }
    
    if (studyHours < academicHours * 0.5) {
      return [
        "Aumenta tus horas de estudio. Se recomienda al menos 1 hora de estudio por cada 2 horas de clase",
        "Utiliza la técnica de repetición espaciada para mejorar la retención",
        "Programa sesiones de estudio inmediatamente después de las clases más complejas",
        "Crea mapas mentales o resúmenes para consolidar el aprendizaje",
        "Establece un horario fijo de estudio para crear un hábito"
      ];
    }
    
    return [
      "Tu balance de estudio es adecuado. Mantén la consistencia",
      "Alterna entre diferentes técnicas de estudio para mantener el interés",
      "Considera formar grupos de estudio para las materias más exigentes",
      "Revisa y ajusta tus técnicas de estudio periódicamente",
      "Celebra tus logros y mantén un registro de tu progreso"
    ];
  };
  
  const getTimeManagementTips = () => {
    const exerciseHours = getActivityDuration('exercise');
    const restHours = getActivityDuration('rest');
    const socialHours = getActivityDuration('social');
    const workHours = getActivityDuration('work');
    
    const tips = [];
    
    if (exerciseHours < 3) {
      tips.push([
        "Integra al menos 3 horas de ejercicio a la semana para mejorar tu concentración y bienestar",
        "Considera actividades cortas como caminar entre clases o hacer ejercicios de escritorio",
        "El ejercicio regular mejora la memoria y reduce el estrés"
      ]);
    }
    
    if (restHours < 7) {
      tips.push([
        "Programa más tiempo para descanso y ocio. Es crucial para mantener la productividad",
        "Incluye pequeñas pausas entre actividades intensas",
        "Mantén un horario de sueño regular"
      ]);
    }
    
    if (socialHours < 4) {
      tips.push([
        "No subestimes la importancia de la interacción social para tu bienestar",
        "Programa actividades sociales que también contribuyan a tus objetivos académicos",
        "Mantén un equilibrio entre tus responsabilidades y tu vida social"
      ]);
    }

    if (workHours > 30) {
      tips.push([
        "Estás dedicando muchas horas al trabajo. Asegúrate de mantener un balance",
        "Considera técnicas de productividad para maximizar tu tiempo",
        "Programa tiempo específico para descanso y recuperación"
      ]);
    }
    
    if (tips.length === 0) {
      tips.push([
        "Tu distribución de tiempo entre actividades luce balanceada. ¡Buen trabajo!",
        "Continúa monitoreando tu progreso y ajusta según sea necesario",
        "Comparte tus técnicas de organización con otros"
      ]);
    }
    
    return tips.flat();
  };
  
  const studyRecommendations = getStudyRecommendations();
  const timeManagementTips = getTimeManagementTips();
  const allTips = [...studyRecommendations, ...timeManagementTips];
  const displayTips = showAllTips ? allTips : allTips.slice(0, 5);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Brain size={24} className="text-primary-600" />
          <h2 className="text-xl font-semibold">Recomendaciones Inteligentes</h2>
        </div>
        <button
          onClick={() => setShowAllTips(!showAllTips)}
          className="text-primary-600 hover:text-primary-700 flex items-center gap-1 text-sm"
        >
          {showAllTips ? (
            <>
              <ChevronUp size={16} />
              <span>Ver menos</span>
            </>
          ) : (
            <>
              <ChevronDown size={16} />
              <span>Ver más</span>
            </>
          )}
        </button>
      </div>

      <div className="space-y-6">
        {displayTips.map((tip, index) => (
          <div key={index} className="flex items-start gap-2 p-3 rounded-lg hover:bg-neutral-50 transition-colors">
            <span className={`text-${index < studyRecommendations.length ? 'secondary' : 'accent'}-600 mt-1`}>
              {index < studyRecommendations.length ? <Lightbulb size={16} /> : <Clock size={16} />}
            </span>
            <p className="text-neutral-700">{tip}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-neutral-200">
        <div className="bg-gradient-to-r from-primary-50 to-accent-50 p-6 rounded-lg">
          <div className="flex items-start gap-4">
            <MessageCircle size={24} className="text-primary-600" />
            <div>
              <h3 className="text-lg font-semibold text-primary-800 mb-2">Asistente Virtual Disponible 24/7</h3>
              <div className="space-y-3">
                <p className="text-sm text-neutral-700">
                  Nuestro chatbot está aquí para ayudarte con:
                </p>
                <ul className="text-sm text-neutral-700 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-accent-600">•</span>
                    <span>Consejos personalizados de organización del tiempo</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent-600">•</span>
                    <span>Técnicas de estudio efectivas para diferentes materias</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent-600">•</span>
                    <span>Sugerencias para mantener un balance saludable</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent-600">•</span>
                    <span>Respuestas a tus dudas sobre productividad</span>
                  </li>
                </ul>
                <p className="text-sm text-primary-700 bg-white bg-opacity-50 p-3 rounded-lg mt-3">
                  <strong>Prueba preguntar:</strong> "¿Cómo puedo mejorar mi concentración durante el estudio?" o "¿Qué técnicas recomiendas para materias difíciles?"
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIRecommendations;
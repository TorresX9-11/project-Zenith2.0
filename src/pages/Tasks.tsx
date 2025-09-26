import React, { useEffect, useMemo, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ListChecks, Plus, Trash2, Calendar as CalendarIcon, CheckCircle2 } from 'lucide-react';

type Task = {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
};

type TasksByDate = Record<string, Task[]>;

const STORAGE_KEY = 'zenith_tasks';

function getTodayDateISO(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const Tasks: React.FC = () => {
  const [tasksByDate, setTasksByDate] = useState<TasksByDate>({});
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateISO());
  const [newTaskTitle, setNewTaskTitle] = useState<string>('');

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as TasksByDate;
        setTasksByDate(parsed);
      }
    } catch {
      // ignore corrupted storage
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasksByDate));
    } catch {
      // ignore quota errors
    }
  }, [tasksByDate]);

  const tasksForSelectedDate = useMemo(() => {
    return tasksByDate[selectedDate] ?? [];
  }, [tasksByDate, selectedDate]);

  const stats = useMemo(() => {
    const total = tasksForSelectedDate.length;
    const completed = tasksForSelectedDate.filter(t => t.completed).length;
    const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
    return { total, completed, percent };
  }, [tasksForSelectedDate]);

  function addTask() {
    const title = newTaskTitle.trim();
    if (!title) return;
    const newTask: Task = {
      id: uuidv4(),
      title,
      completed: false,
      createdAt: new Date().toISOString()
    };
    setTasksByDate(prev => ({
      ...prev,
      [selectedDate]: [...(prev[selectedDate] ?? []), newTask]
    }));
    setNewTaskTitle('');
  }

  function toggleTask(id: string) {
    setTasksByDate(prev => ({
      ...prev,
      [selectedDate]: (prev[selectedDate] ?? []).map(t =>
        t.id === id ? { ...t, completed: !t.completed } : t
      )
    }));
  }

  function deleteTask(id: string) {
    setTasksByDate(prev => ({
      ...prev,
      [selectedDate]: (prev[selectedDate] ?? []).filter(t => t.id !== id)
    }));
  }

  return (
    <div className="fade-in">
      <div className="flex justify-between items-start md:items-center mb-6 gap-4 flex-col md:flex-row">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ListChecks size={24} className="text-primary-600" />
            <span>Tareas Diarias</span>
          </h1>
          <p className="text-neutral-600">Registra y da seguimiento a tus tareas del día</p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-white border rounded-md px-3 py-2 shadow-sm w-full md:w-auto">
            <CalendarIcon size={18} className="text-neutral-500" />
            <input
              type="date"
              className="outline-none text-sm"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={newTaskTitle}
                onChange={e => setNewTaskTitle(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') addTask();
                }}
                placeholder="Nueva tarea..."
                className="flex-1 border rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-200 focus:border-primary-400 outline-none"
              />
              <button
                onClick={addTask}
                className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors flex items-center gap-2"
              >
                <Plus size={18} />
                <span>Agregar</span>
              </button>
            </div>

            <div className="mt-4">
              {tasksForSelectedDate.length === 0 ? (
                <div className="text-center text-neutral-600 py-10">
                  No hay tareas para esta fecha. ¡Agrega la primera!
                </div>
              ) : (
                <ul className="space-y-3">
                  {tasksForSelectedDate.map(task => (
                    <li key={task.id} className="flex items-center justify-between bg-neutral-50 border rounded-md p-3">
                      <button
                        onClick={() => toggleTask(task.id)}
                        className={`flex items-center gap-3 text-left flex-1 ${task.completed ? 'text-neutral-500' : 'text-neutral-800'}`}
                        aria-label={task.completed ? 'Marcar como pendiente' : 'Marcar como completada'}
                      >
                        <span className={`w-6 h-6 rounded-full border flex items-center justify-center ${task.completed ? 'bg-success-100 border-success-300' : 'border-neutral-300'}`}>
                          {task.completed && <CheckCircle2 size={18} className="text-success-600" />}
                        </span>
                        <span className={`${task.completed ? 'line-through' : ''}`}>{task.title}</span>
                      </button>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="text-neutral-500 hover:text-red-600 transition-colors p-2"
                        aria-label="Eliminar tarea"
                      >
                        <Trash2 size={18} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        <div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-lg font-semibold mb-3">Resumen del día</h3>
            <div className="text-sm text-neutral-700">{stats.completed} completadas de {stats.total}</div>
            <div className="w-full h-2 bg-neutral-100 rounded-full mt-2">
              <div
                className="h-2 bg-success-500 rounded-full transition-all"
                style={{ width: `${stats.percent}%` }}
              />
            </div>
            <div className="text-sm text-neutral-500 mt-2">Progreso: {stats.percent}%</div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4 mt-4">
            <h3 className="text-lg font-semibold mb-2">Consejo</h3>
            <p className="text-sm text-neutral-600">Mantén tus tareas cortas y accionables. Marca pequeñas victorias a lo largo del día.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tasks;



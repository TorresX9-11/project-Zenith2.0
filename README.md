# Zenith

Organiza tu semana de forma visual, define actividades y recibe recomendaciones inteligentes para mejorar tu productividad. Construido con React + TypeScript, Vite y Tailwind CSS, con estado global y persistencia en `localStorage`.

## Características

- **Horario visual semanal:** componente de tabla horaria con bloques por día/hora.
- **Gestión de actividades:** crear, actualizar y eliminar; vinculación opcional a bloques.
- **Métricas y recomendaciones:** cálculo de productividad y tips de estudio/tiempo.
- **Estado global con persistencia:** reducer + contexto, guardado automático en `localStorage`.
- **UI moderna:** React 18, Tailwind, iconos `lucide-react` y navegación con `react-router-dom`.

## Stack

- React 18 + TypeScript, Vite 5
- Tailwind CSS, `lucide-react`
- `react-router-dom`
- (Opcional) `@botpress/webchat` para chatbot

## Rutas principales

- `/` → `Home`
- `/horario` → `Schedule`
- `/actividades` → `Activities`
- `/dashboard` → `Dashboard`
- `/sobre-nosotros` → `AboutUs`

## Inicio rápido (desarrollo)

Requisitos: Node.js 18+ y npm.

```bash
npm install
npm run dev
```

Luego abre `http://localhost:5173`.

### Scripts útiles

- `npm run dev`: servidor de desarrollo (Vite)
- `npm run build`: build de producción
- `npm run preview`: previsualiza el build localmente
- `npm run lint`: ejecuta ESLint

## Estructura del proyecto

```
project-Zenith2.0/
├── src/
│   ├── components/        # UI reutilizable (Navbar, TimeTable, AIRecommendations, etc.)
│   ├── context/           # Proveedor y hook de contexto global (estado horario)
│   ├── hooks/             # Hooks personalizados
│   ├── pages/             # Páginas enrutadas (Home, Schedule, Activities, ...)
│   ├── reducers/          # Reducer del estado de agenda/actividades
│   ├── types/             # Tipos TypeScript compartidos
│   └── utils/             # Utilidades de dominio
├── index.html             # Entrada HTML
├── package.json           # Dependencias y scripts
└── ...
```

## Enlaces rápidos a código y docs

- Enrutamiento y layout: `src/App.tsx`, `src/components/Layout.tsx`, `src/components/Navbar.tsx`
- Estado global y helpers: `src/context/ZenithContext.tsx`, `src/reducers/scheduleReducer.ts`, `src/types/index.ts`
- Horario visual: `src/components/TimeTable.tsx`
- Recomendaciones: `src/components/AIRecommendations.tsx`
- Páginas: `src/pages/`
- Estilos: `tailwind.config.js`, `src/index.css`, `src/App.css`
- Configuración: `vite.config.ts`, `tsconfig.json`, `eslint.config.js`

## Build y preview

```bash
npm run build
npm run preview
```

## Linting

```bash
npm run lint
```

## Contribuir

Los PRs son bienvenidos. Por favor sigue las convenciones del proyecto y ejecuta `npm run lint` antes de enviar.

## Licencia

MIT

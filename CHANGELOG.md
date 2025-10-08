Changelog

Unreleased

- Core
  - Centralizados selectores en `src/selectors/schedule.ts`: `selectTotalOccupiedMinutes`, `selectHoursByType`, `selectNextBlocks`, `selectPlannedMinutesByDay` y helpers `toMinutes`, `minutesToHHMM`, `blocksOverlap`.
  - Expuestos selectores desde `ZenithContext` para consumo en páginas sin renderizar `TimeTable`.
  - Añadida ventana activa configurable en `settings.activeWindow` (por defecto 06:00–22:00) y usada en métricas.
  - Normalizados `ActivityType` a `['academic','study','work','exercise','social','rest','personal']` (eliminado `libre`).

- UI/UX
  - `TimeTable`: formato 24h y sin tipo `libre`.
  - `Dashboard`: elimina `TimeTable`; usa selectores para KPIs y resumen/ próximos bloques.
  - `Activities`: elimina `TimeTable`; nuevo seguidor semanal por columnas con drag & drop, check de completado, urgencia por color, modal de creación/edición y contadores por día.
  - `Schedule`: validaciones por minutos con `blocksOverlap`; recorte automático a ventana activa.

- Persistencia
  - `initialScheduleState.settings` ahora incluye `activeWindow` y mantiene `localStorage`.

- Notas de migración
  - Si en datos antiguos existían actividades con tipo `libre`, deben migrarse a otro tipo válido o tratarse como tiempo libre derivado (no como actividad).


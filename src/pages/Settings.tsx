import React from 'react';
import { SlidersHorizontal } from 'lucide-react';

const SettingsPage: React.FC = () => {
  return (
    <div className="fade-in">
      <div className="mb-6 flex items-center gap-2">
        <SlidersHorizontal className="text-primary-600" />
        <h1 className="text-2xl font-bold">Configuración</h1>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold mb-2">Ajustes visuales</h2>
        <p className="text-neutral-600 text-sm mb-4">Próximamente podrás personalizar la apariencia (colores, tamaños, densidad, accesibilidad, animaciones, etc.).</p>
        <div className="p-4 rounded-md bg-neutral-50 border border-neutral-200 text-neutral-700 text-sm">
          Próximamente
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;

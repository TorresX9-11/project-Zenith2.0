import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { BrainCog, Settings } from 'lucide-react';

const Layout: React.FC = () => {
  const [showSettings, setShowSettings] = React.useState(false);
  return (
    <div className="flex flex-col min-h-screen relative">
      <header className="bg-primary-600 text-white py-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BrainCog size={28} />
              <h1 className="text-2xl font-bold">Zenith</h1>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setShowSettings(s => !s)} className="p-2 hover:bg-primary-700 rounded-full" title="Configuración">
                <Settings size={27} />
              </button>
            </div>
          </div>
          <p className="text-primary-100 text-sm mt-1">Organiza tu tiempo, potencia tu éxito</p>
        </div>
      </header>
      
      <Navbar />
      
      <main className="flex-grow relative">
        {/* Overlay para cerrar sidebar al hacer clic fuera */}
        {showSettings && (
          <div
            className="fixed inset-0 bg-black/30 z-30"
            onClick={() => setShowSettings(false)}
          />
        )}
        {/* Sidebar de configuración */}
        <div className={`fixed top-0 right-0 h-full w-80 bg-white shadow-xl border-l border-neutral-200 z-40 transform transition-transform duration-300 ${showSettings ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
            <div className="flex items-center gap-2 text-neutral-800 font-semibold">
              <Settings size={18} />
              <span>Configuración</span>
            </div>
            <button onClick={() => setShowSettings(false)} className="text-neutral-500 hover:text-neutral-700">Cerrar</button>
          </div>
          <div className="p-4 text-sm text-neutral-600">
            <h3 className="text-neutral-800 font-medium mb-2">Ajustes visuales</h3>
            <div className="p-3 rounded-md bg-neutral-50 border border-neutral-200">Próximamente</div>
          </div>
        </div>

        <div className="container mx-auto py-6">
          <Outlet />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Layout;
import React from 'react';
import { Heart } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-neutral-800 text-neutral-300 py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h3 className="text-lg font-semibold text-white mb-2">Zenith</h3>
            <p className="text-sm">Tu asistente de organización del tiempo para estudiantes universitarios</p>
          </div>
          
          <div className="text-center md:text-right">
            <div className="flex justify-center md:justify-end gap-4 mb-3">
              <a href="#" className="text-neutral-300 hover:text-white transition-colors">
                Ayuda
              </a>
              <a href="#" className="text-neutral-300 hover:text-white transition-colors">
                Privacidad
              </a>
              <a href="#" className="text-neutral-300 hover:text-white transition-colors">
                Términos
              </a>
            </div>
            <p className="text-sm flex items-center justify-center md:justify-end gap-1">
              Hecho con <Heart size={14} className="text-error-500" /> por Zenith
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
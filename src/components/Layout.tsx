import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { BrainCog } from 'lucide-react';

const Layout: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-primary-600 text-white py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BrainCog size={28} />
              <h1 className="text-2xl font-bold">Zenith</h1>
            </div>
            <span className="text-sm bg-primary-700 px-2 py-1 rounded-md">Beta</span>
          </div>
          <p className="text-primary-100 text-sm mt-1">Organiza tu tiempo, potencia tu éxito</p>
        </div>
      </header>
      
      <Navbar />
      
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-6">
          <Outlet />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Layout;
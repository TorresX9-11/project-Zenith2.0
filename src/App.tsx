import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Schedule from './pages/Schedule';
import Activities from './pages/Activities';
import Tasks from './pages/Tasks';
import Dashboard from './pages/Dashboard';
import AboutUs from './pages/AboutUs';
import { ZenithProvider } from './context/ZenithContext';
import './App.css';


function App() {
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 lg:p-12">
      <div className="max-w-5xl mx-auto shadow-lg rounded-xl bg-white">
        <ZenithProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="horario" element={<Schedule />} />
                <Route path="tareas" element={<Tasks />} />
                <Route path="actividades" element={<Activities />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="sobre-nosotros" element={<AboutUs />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
          </Router>
        </ZenithProvider>
      </div>
    </div>
  );
}

export default App;

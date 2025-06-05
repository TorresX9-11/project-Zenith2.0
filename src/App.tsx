import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Schedule from './pages/Schedule';
import Activities from './pages/Activities';
import Dashboard from './pages/Dashboard';
import AboutUs from './pages/AboutUs';
import { ZenithProvider } from './context/ZenithContext';
import './App.css';

function App() {
  return (
    <ZenithProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="horario" element={<Schedule />} />
            <Route path="actividades" element={<Activities />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="sobre-nosotros" element={<AboutUs />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Router>
    </ZenithProvider>
  );
}

export default App;

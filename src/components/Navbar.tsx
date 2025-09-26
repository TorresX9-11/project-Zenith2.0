import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Calendar, ListTodo, BarChart3, Info } from 'lucide-react';

const Navbar: React.FC = () => {
  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <ul className="flex overflow-x-auto">
          <NavItem to="/" icon={<Home size={18} />} label="Inicio" />
          <NavItem to="/horario" icon={<Calendar size={18} />} label="Horario" />
          <NavItem to="/actividades" icon={<ListTodo size={18} />} label="Actividades" />
          <NavItem to="/dashboard" icon={<BarChart3 size={18} />} label="Dashboard" />
          <NavItem to="/sobre-nosotros" icon={<Info size={18} />} label="Sobre Nosotros" />
        </ul>
      </div>
    </nav>
  );
};

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label }) => {
  return (
    <li className="flex-shrink-0">
      <NavLink
        to={to}
        className={({ isActive }) =>
          `flex items-center gap-2 px-4 py-3 border-b-2 ${
            isActive
              ? 'border-primary-500 text-primary-600 font-medium'
              : 'border-transparent text-neutral-600 hover:text-primary-500 hover:border-primary-200'
          } transition-colors`
        }
      >
        {icon}
        <span>{label}</span>
      </NavLink>
    </li>
  );
};

export default Navbar;
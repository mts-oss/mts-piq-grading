import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, ClipboardEdit } from 'lucide-react';

export default function BottomNav() {
  const navItems = [
    { to: '/', icon: <LayoutDashboard size={24} />, label: 'Beranda' },
    { to: '/classes', icon: <Users size={24} />, label: 'Data' },
    { to: '/grading', icon: <ClipboardEdit size={24} />, label: 'Nilai' },
  ];

  return (
    <nav className="bottom-nav">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
        >
          {item.icon}
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

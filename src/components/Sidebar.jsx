import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, BookOpen, GraduationCap, ClipboardEdit, UserCircle, FileText } from 'lucide-react';

export default function Sidebar({ isOpen }) {
  const navItems = [
    { to: '/', icon: <LayoutDashboard size={20} />, label: 'Beranda' },
    { to: '/classes', icon: <Users size={20} />, label: 'Kelas' },
    { to: '/students', icon: <GraduationCap size={20} />, label: 'Siswa' },
    { to: '/teachers', icon: <UserCircle size={20} />, label: 'Guru' },
    { to: '/subjects', icon: <BookOpen size={20} />, label: 'Mata Pelajaran' },
    { to: '/grading', icon: <ClipboardEdit size={20} />, label: 'Penilaian' },
    { to: '/rapot', icon: <FileText size={20} />, label: 'Rapot & Rekap' },
  ];

  if (!isOpen) return null;

  return (
    <aside className="sidebar">
      <div className="mb-6 flex items-center gap-2 px-2">
        <div className="bg-primary text-white p-2 rounded-md flex items-center justify-center">
          <GraduationCap size={24} />
        </div>
        <div>
          <h1 className="font-bold text-lg leading-tight">MTs PIQ</h1>
          <p className="text-xs text-muted">Sistem Penilaian</p>
        </div>
      </div>

      <nav className="flex-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

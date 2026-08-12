import { useState, useEffect } from 'react';
import { Users, GraduationCap, BookOpen, ClipboardEdit } from 'lucide-react';

export default function Dashboard() {
  const [counts, setCounts] = useState({ classes: 0, students: 0, teachers: 0, subjects: 0 });
  
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  useEffect(() => {
    Promise.all([
      fetch(`${apiUrl}/api/classes`).then(r => r.json()),
      fetch(`${apiUrl}/api/students`).then(r => r.json()),
      fetch(`${apiUrl}/api/teachers`).then(r => r.json()),
      fetch(`${apiUrl}/api/subjects`).then(r => r.json())
    ]).then(([cls, std, tch, sub]) => {
      setCounts({
        classes: cls.length || 0,
        students: std.length || 0,
        teachers: tch.length || 0,
        subjects: sub.length || 0
      });
    }).catch(e => console.error("Error fetching dashboard data:", e));
  }, []);

  const stats = [
    { title: 'Total Kelas', value: counts.classes.toString(), icon: <Users size={24} className="text-blue-500" />, color: 'var(--secondary)' },
    { title: 'Total Siswa', value: counts.students.toString(), icon: <GraduationCap size={24} className="text-emerald-500" />, color: 'var(--primary)' },
    { title: 'Total Guru', value: counts.teachers.toString(), icon: <Users size={24} className="text-orange-500" />, color: '#F97316' },
    { title: 'Mata Pelajaran', value: counts.subjects.toString(), icon: <BookOpen size={24} className="text-purple-500" />, color: '#A855F7' },
  ];

  return (
    <div className="container">
      <div className="mb-6">
        <h1 className="text-h1">Selamat Datang, Guru!</h1>
        <p className="text-muted">Ringkasan data MTs PIQ hari ini.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, i) => (
          <div key={i} className="card flex flex-col justify-center gap-2">
            <div className="flex items-center justify-between">
              <span className="text-muted font-medium">{stat.title}</span>
              <div style={{ color: stat.color }}>{stat.icon}</div>
            </div>
            <h3 className="text-2xl font-bold">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="card glass">
        <div className="flex items-center gap-2 mb-4">
          <ClipboardEdit size={24} className="text-primary" />
          <h2 className="text-h2">Akses Cepat Penilaian</h2>
        </div>
        <p className="text-body mb-4">
          Mulai input nilai siswa untuk Formatif, Sumatif, dan Remidi dengan cepat.
        </p>
        <a href="/grading" className="btn btn-primary">
          Input Nilai Sekarang
        </a>
      </div>
    </div>
  );
}

import { Users, GraduationCap, BookOpen, ClipboardEdit } from 'lucide-react';

export default function Dashboard() {
  const stats = [
    { title: 'Total Kelas', value: '12', icon: <Users size={24} className="text-blue-500" />, color: 'var(--secondary)' },
    { title: 'Total Siswa', value: '345', icon: <GraduationCap size={24} className="text-emerald-500" />, color: 'var(--primary)' },
    { title: 'Total Guru', value: '45', icon: <Users size={24} className="text-orange-500" />, color: '#F97316' },
    { title: 'Mata Pelajaran', value: '18', icon: <BookOpen size={24} className="text-purple-500" />, color: '#A855F7' },
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

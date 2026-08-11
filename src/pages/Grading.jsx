import { useState, useEffect } from 'react';
import { Save, Calendar, BookOpen, Users, CheckCircle, Download } from 'lucide-react';
import ExportExcelModal from '../components/ExportExcelModal';

export default function Grading() {
  const [filter, setFilter] = useState({
    class: '7A',
    subject: 'M001',
    teacher: 'G001',
    date: new Date().toISOString().split('T')[0],
  });

  const [activeTab, setActiveTab] = useState('LM1');
  const [activeComponent, setActiveComponent] = useState('F1');
  const [activeAkhirComponent, setActiveAkhirComponent] = useState('RS');

  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);

  useEffect(() => {
    // Fetch master data
    Promise.all([
      fetch('http://localhost:3000/api/classes').then(r => r.json()),
      fetch('http://localhost:3000/api/subjects').then(r => r.json()),
      fetch('http://localhost:3000/api/teachers').then(r => r.json())
    ]).then(([cls, sub, tch]) => {
      setClasses(cls);
      setSubjects(sub);
      setTeachers(tch);
    }).catch(e => console.error("Error fetching master data:", e));
  }, []);

  const isNilaiAkhir = activeTab === 'Nilai Akhir';
  const currentComponent = isNilaiAkhir ? activeAkhirComponent : activeComponent;


  useEffect(() => {
    // Fetch students and grades based on filter
    fetch(`http://localhost:3000/api/grades?classId=${filter.class}&subjectId=${filter.subject}&teacherId=${filter.teacher}&lm=${activeTab}&component=${currentComponent}`)
      .then(r => r.json())
      .then(data => {
        setStudents(data);
      })
      .catch(e => console.error("Error fetching grades:", e));
  }, [filter.class, filter.subject, filter.teacher, activeTab, currentComponent]);

  const handleScoreChange = (studentId, newScore) => {
    setStudents(students.map(s => s.id === studentId ? { ...s, score: newScore } : s));
  };

  // LM Tabs
  const lmTabs = ['LM1', 'LM2', 'LM3', 'LM4', 'LM5', 'LM6', 'LM7', 'LM8', 'LM9', 'LM10', 'Nilai Akhir'];

  // Components for LM
  const lmComponents = [
    { id: 'F1', label: 'Formatif 1' },
    { id: 'F2', label: 'Formatif 2' },
    { id: 'S', label: 'Sumatif' },
    { id: 'R', label: 'Remidi' }
  ];

  // Components for Nilai Akhir
  const akhirComponents = [
    { id: 'RS', label: 'Rata-rata Sumatif (RS)' },
    { id: 'SAS', label: 'Sumatif Akhir Semester (SAS)' },
    { id: 'NR', label: 'Nilai Remidi (NR)' }
  ];

  const handleSave = async () => {
    const payload = {
      subjectId: filter.subject,
      teacherId: filter.teacher,
      lm: activeTab,
      component: currentComponent,
      date: filter.date,
      grades: students.map(s => ({ studentId: s.id, score: s.score }))
    };

    try {
      const res = await fetch('http://localhost:3000/api/grades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        alert('Nilai berhasil disimpan!');
      } else {
        const err = await res.json();
        alert('Gagal menyimpan nilai: ' + err.error);
      }
    } catch (e) {
      alert('Koneksi ke server gagal.');
    }
  };
  const componentsList = isNilaiAkhir ? akhirComponents : lmComponents;

  const currentComponentLabel = componentsList.find(c => c.id === currentComponent)?.label || '';

  return (
    <div className="container relative">
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-h1">Input Penilaian</h1>
          <p className="text-muted">Ikuti alur untuk memasukkan nilai siswa</p>
        </div>
        <button 
          onClick={() => setIsExportModalOpen(true)}
          className="btn btn-secondary flex items-center gap-2"
        >
          <Download size={18} /> Rekap Excel
        </button>
      </div>

      <ExportExcelModal isOpen={isExportModalOpen} onClose={() => setIsExportModalOpen(false)} />

      {/* 1. Filter Section */}
      <div className="card mb-6">
        <h3 className="text-h2 mb-4 flex items-center gap-2" style={{ fontSize: '1rem' }}>
          <span style={{ backgroundColor: 'var(--primary)', color: 'white', width: '1.5rem', height: '1.5rem', borderRadius: '9999px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>1</span> 
          Pilih Kelas & Pelajaran
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label flex items-center gap-2"><Users size={16}/> Kelas</label>
            <select className="form-input" value={filter.class} onChange={e => setFilter({...filter, class: e.target.value})}>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label flex items-center gap-2"><BookOpen size={16}/> Mata Pelajaran</label>
            <select className="form-input" value={filter.subject} onChange={e => setFilter({...filter, subject: e.target.value})}>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label flex items-center gap-2"><Users size={16}/> Guru Pengajar</label>
            <select className="form-input" value={filter.teacher} onChange={e => setFilter({...filter, teacher: e.target.value})}>
              {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* 2. Pilih LM */}
      <div className="mb-6">
        <h3 className="text-h2 mb-4 flex items-center gap-2" style={{ fontSize: '1rem' }}>
          <span style={{ backgroundColor: 'var(--primary)', color: 'white', width: '1.5rem', height: '1.5rem', borderRadius: '9999px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>2</span> 
          Pilih Lintas Materi
        </h3>
        <div className="tabs">
          {lmTabs.map(tab => (
            <button
              key={tab}
              className={`tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* 3 & 4. Pilih Komponen dan Tanggal */}
      <div className="card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-h2 mb-4 flex items-center gap-2" style={{ fontSize: '1rem' }}>
              <span style={{ backgroundColor: 'var(--primary)', color: 'white', width: '1.5rem', height: '1.5rem', borderRadius: '9999px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>3</span> 
              Pilih Komponen
            </h3>
            <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
              {componentsList.map(comp => (
                <button
                  key={comp.id}
                  className={`btn ${currentComponent === comp.id ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => isNilaiAkhir ? setActiveAkhirComponent(comp.id) : setActiveComponent(comp.id)}
                  style={{ padding: '0.5rem', flex: '1 1 calc(50% - 0.5rem)', fontSize: '0.875rem' }}
                >
                  {currentComponent === comp.id && <CheckCircle size={16} />}
                  {comp.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-h2 mb-4 flex items-center gap-2" style={{ fontSize: '1rem' }}>
              <span style={{ backgroundColor: 'var(--primary)', color: 'white', width: '1.5rem', height: '1.5rem', borderRadius: '9999px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>4</span> 
              Tanggal {currentComponentLabel}
            </h3>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <div className="flex items-center gap-2">
                <Calendar size={20} className="text-muted" style={{ minWidth: '20px' }} />
                <input type="date" className="form-input" style={{ width: '100%' }} value={filter.date} onChange={e => setFilter({...filter, date: e.target.value})} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Form Pengisian Nilai */}
      <div className="card mb-6" style={{ borderTop: '4px solid var(--primary)' }}>
        <div className="flex justify-between items-start mb-6" style={{ flexDirection: 'column', gap: '1rem' }}>
          <div>
            <h3 className="text-h2 mb-2 flex items-center gap-2" style={{ fontSize: '1rem' }}>
              <span style={{ backgroundColor: 'var(--primary)', color: 'white', width: '1.5rem', height: '1.5rem', borderRadius: '9999px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>5</span> 
              Form Pengisian Nilai
            </h3>
            <h2 className="text-h2" style={{ fontSize: '1.125rem', marginTop: '0.5rem' }}>
              {activeTab} - {currentComponentLabel}
            </h2>
          </div>
          <button className="btn btn-primary desktop-only" onClick={handleSave}>
            <Save size={18} /> Simpan
          </button>
        </div>

        {/* Desktop Table View */}
        <div className="table-container desktop-only">
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: '50px' }}>No</th>
                <th>Nama Siswa</th>
                <th className="text-center" style={{ width: '200px' }}>Nilai {currentComponent}</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student, index) => (
                <tr key={student.id}>
                  <td>{index + 1}</td>
                  <td className="font-medium">{student.name}</td>
                  <td>
                    <input type="number" value={student.score || ''} onChange={e => handleScoreChange(student.id, e.target.value)} className="form-input text-center font-bold text-lg" min="0" max="100" placeholder="0" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="mobile-only flex flex-col gap-3">
          {students.map((student, index) => (
            <div key={student.id} className="card flex items-center justify-between" style={{ padding: '0.75rem', gap: '0.5rem', flexDirection: 'row' }}>
              <div className="flex items-center gap-2" style={{ flex: 1, minWidth: 0 }}>
                <span className="text-xs text-muted font-bold" style={{ minWidth: '1rem' }}>{index + 1}</span>
                <h3 className="font-semibold text-sm" style={{ margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{student.name}</h3>
              </div>
              <div style={{ width: '4.5rem', flexShrink: 0 }}>
                <input type="number" value={student.score || ''} onChange={e => handleScoreChange(student.id, e.target.value)} className="form-input text-center font-bold" style={{ padding: '0.5rem', fontSize: '1rem' }} min="0" max="100" placeholder="0" />
              </div>
            </div>
          ))}
          
          <button className="btn btn-primary" style={{ width: '100%', marginTop: '1rem', padding: '0.75rem' }} onClick={handleSave}>
            <Save size={18} /> Simpan Nilai {activeTab} {currentComponent}
          </button>
        </div>
      </div>
    </div>
  );
}

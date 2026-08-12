import { useState, useEffect } from 'react';
import { 
  FileText, Users, UserCircle, BookOpen, Printer, 
  ShieldAlert, FileSpreadsheet, Activity
} from 'lucide-react';

export default function Rapot() {
  const [activeTab, setActiveTab] = useState('rekap'); // 'rekap' | 'rapot' | 'guru'
  
  // Master data
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  
  // Selections
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');

  // Loaded data
  const [students, setStudents] = useState([]);
  const [allGrades, setAllGrades] = useState([]);
  const [loading, setLoading] = useState(false);

  // Sorting
  const [sortBy, setSortBy] = useState('name'); // 'name' | 'average'
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' | 'desc'

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  // Fetch initial master data
  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/api/classes`).then(r => r.json()),
      fetch(`${API_URL}/api/subjects`).then(r => r.json()),
      fetch(`${API_URL}/api/teachers`).then(r => r.json())
    ]).then(([cls, sub, tch]) => {
      setClasses(cls);
      setSubjects(sub);
      setTeachers(tch);
      if (cls.length > 0) setSelectedClass(cls[0].id);
      if (tch.length > 0) setSelectedTeacherId(tch[0].id);
      if (sub.length > 0) setSelectedSubjectId(sub[0].id);
    }).catch(e => console.error("Error fetching master data:", e));
  }, []);

  // Fetch students & grades when selectedClass changes
  useEffect(() => {
    if (!selectedClass) return;
    setLoading(true);
    
    Promise.all([
      fetch(`${API_URL}/api/students?classId=${selectedClass}`).then(r => r.json()),
      fetch(`${API_URL}/api/reports/grades?classId=${selectedClass}`).then(r => r.json())
    ]).then(([stds, grds]) => {
      setStudents(stds);
      setAllGrades(grds);
      if (stds.length > 0) {
        setSelectedStudentId(stds[0].id);
      } else {
        setSelectedStudentId('');
      }
      setLoading(false);
    }).catch(e => {
      console.error("Error loading reports data:", e);
      setLoading(false);
    });
  }, [selectedClass]);

  // Helper to calculate grades for a student and subject
  const getSubjectGrades = (studentId, subjectId) => {
    const studentGrades = allGrades.filter(g => g.studentId === studentId && g.subjectId === subjectId);
    
    // Explicit scores from Nilai Akhir component
    const explicitRS = studentGrades.find(g => g.lm === 'Nilai Akhir' && g.component === 'RS')?.score;
    const explicitSAS = studentGrades.find(g => g.lm === 'Nilai Akhir' && g.component === 'SAS')?.score;
    const explicitNR = studentGrades.find(g => g.lm === 'Nilai Akhir' && g.component === 'NR')?.score;

    // Calculate RS from Lintas Materi if not explicitly saved
    let calculatedRS = null;
    const lmGrades = studentGrades.filter(g => g.lm !== 'Nilai Akhir' && (g.component === 'S' || g.component === 'R'));
    if (lmGrades.length > 0) {
      // Group by LM to choose between Sumatif (S) and Remidi (R)
      const lmMap = {};
      lmGrades.forEach(g => {
        if (!lmMap[g.lm]) lmMap[g.lm] = {};
        if (g.component === 'S') lmMap[g.lm].S = g.score;
        if (g.component === 'R') lmMap[g.lm].R = g.score;
      });

      let sum = 0;
      let count = 0;
      Object.keys(lmMap).forEach(lm => {
        const scoreToUse = lmMap[lm].R !== undefined && lmMap[lm].R !== null ? lmMap[lm].R : lmMap[lm].S;
        if (scoreToUse !== undefined && scoreToUse !== null) {
          sum += scoreToUse;
          count++;
        }
      });
      if (count > 0) {
        calculatedRS = Math.round(sum / count);
      }
    }

    const RS = explicitRS !== undefined && explicitRS !== null ? explicitRS : calculatedRS;
    const SAS = explicitSAS !== undefined && explicitSAS !== null ? explicitSAS : null;
    const NR = explicitNR !== undefined && explicitNR !== null ? explicitNR : null;

    // Nilai Akhir (NA) calculation
    let NA = null;
    if (RS !== null && SAS !== null) {
      // Formula: NA = (2 * RS + SAS) / 3
      NA = Math.round((2 * RS + SAS) / 3);
    } else if (RS !== null) {
      NA = RS;
    } else if (SAS !== null) {
      NA = SAS;
    }

    // Apply NR (Nilai Remidi Akhir Semester) if available and higher
    if (NR !== null && NA !== null && NR > NA) {
      NA = NR;
    }

    return { RS, SAS, NR, NA };
  };

  // Predicate & Capaian Description Helpers
  const getPredicate = (score) => {
    if (score === null || score === undefined) return '-';
    if (score >= 85) return 'A';
    if (score >= 75) return 'B';
    if (score >= 60) return 'C';
    return 'D';
  };

  const getCapaianDescription = (score, subjectName) => {
    if (score === null || score === undefined) return '-';
    if (score >= 85) {
      return `Menunjukkan penguasaan kompetensi yang sangat baik dalam menganalisis dan memahami materi ${subjectName}.`;
    }
    if (score >= 75) {
      return `Menunjukkan penguasaan kompetensi yang baik dalam memahami sebagian besar aspek materi ${subjectName}.`;
    }
    if (score >= 60) {
      return `Menunjukkan penguasaan kompetensi yang cukup dalam materi ${subjectName}, perlu bimbingan di beberapa bagian.`;
    }
    return `Perlu bimbingan intensif dalam memahami dasar-dasar materi ${subjectName}.`;
  };

  // Prepare ledger data (Rekap Kelas)
  const ledgerData = students.map(student => {
    const gradesMap = {};
    let sumNA = 0;
    let countNA = 0;

    subjects.forEach(sub => {
      const { NA } = getSubjectGrades(student.id, sub.id);
      gradesMap[sub.id] = NA;
      if (NA !== null) {
        sumNA += NA;
        countNA++;
      }
    });

    const average = countNA > 0 ? parseFloat((sumNA / countNA).toFixed(1)) : null;

    return {
      id: student.id,
      name: student.name,
      grades: gradesMap,
      average: average
    };
  });

  // Sort ledger data
  const sortedLedgerData = [...ledgerData].sort((a, b) => {
    if (sortBy === 'name') {
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();
      return sortOrder === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
    } else {
      const avgA = a.average === null ? -1 : a.average;
      const avgB = b.average === null ? -1 : b.average;
      return sortOrder === 'asc' ? avgA - avgB : avgB - avgA;
    }
  });

  const toggleSort = (type) => {
    if (sortBy === type) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(type);
      setSortOrder('asc');
    }
  };

  // Print function
  const handlePrint = () => {
    window.print();
  };

  // Get selected student object
  const currentStudentObj = students.find(s => s.id === selectedStudentId);

  // Selected teacher's name
  const currentTeacherObj = teachers.find(t => t.id === selectedTeacherId);
  const currentSubjectObj = subjects.find(s => s.id === selectedSubjectId);

  // Grades for Tab 3 (Rekap Guru)
  const getTeacherGradesData = () => {
    if (!selectedTeacherId || !selectedSubjectId) return [];
    
    return students.map(student => {
      const studentGrades = allGrades.filter(
        g => g.studentId === student.id && 
        g.subjectId === selectedSubjectId && 
        g.teacherId === selectedTeacherId
      );

      // Get individual LMs (LM1 to LM5) Sumatif score
      const lmsMap = {};
      for (let i = 1; i <= 5; i++) {
        const key = `LM${i}`;
        const sScore = studentGrades.find(g => g.lm === key && g.component === 'S')?.score;
        const rScore = studentGrades.find(g => g.lm === key && g.component === 'R')?.score;
        lmsMap[key] = rScore !== undefined && rScore !== null ? rScore : (sScore !== undefined ? sScore : '-');
      }

      // Explicit or Calculated Final marks
      const { RS, SAS, NR, NA } = getSubjectGrades(student.id, selectedSubjectId);

      return {
        id: student.id,
        name: student.name,
        ...lmsMap,
        RS: RS !== null ? RS : '-',
        SAS: SAS !== null ? SAS : '-',
        NR: NR !== null ? NR : '-',
        NA: NA !== null ? NA : '-'
      };
    });
  };

  const teacherGrades = getTeacherGradesData();

  return (
    <div className="container relative">
      {/* Top Header Section (Hides during print) */}
      <div className="mb-6 flex justify-between items-start print:hidden">
        <div>
          <h1 className="text-h1">Rekap Nilai & Rapot</h1>
          <p className="text-muted">Kelola rekapitulasi penilaian kelas dan cetak rapot siswa.</p>
        </div>
      </div>

      {/* Tabs Selector (Hides during print) */}
      <div className="flex border-b border-gray-200 mb-6 print:hidden">
        <button 
          onClick={() => setActiveTab('rekap')}
          className={`py-3 px-6 font-medium text-sm border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'rekap' 
              ? 'border-primary text-primary font-semibold' 
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <FileSpreadsheet size={18} />
          Rekap Kelas (Ledger)
        </button>
        <button 
          onClick={() => setActiveTab('rapot')}
          className={`py-3 px-6 font-medium text-sm border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'rapot' 
              ? 'border-primary text-primary font-semibold' 
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <FileText size={18} />
          Rapot Siswa
        </button>
        <button 
          onClick={() => setActiveTab('guru')}
          className={`py-3 px-6 font-medium text-sm border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'guru' 
              ? 'border-primary text-primary font-semibold' 
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <UserCircle size={18} />
          Rekap Guru
        </button>
      </div>

      {/* Main Container */}
      <div className="space-y-6">
        
        {/* TAB 1: REKAP KELAS */}
        {activeTab === 'rekap' && (
          <div className="print:hidden">
            {/* Filter */}
            <div className="card mb-6 bg-white shadow-sm border border-gray-200">
              <div className="flex flex-wrap items-center gap-4">
                <div className="form-group mb-0 min-w-[200px]">
                  <label className="form-label flex items-center gap-2"><Users size={15}/> Pilih Kelas</label>
                  <select 
                    className="form-input" 
                    value={selectedClass} 
                    onChange={e => setSelectedClass(e.target.value)}
                  >
                    {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                
                <div className="flex-1 flex justify-end gap-2 mt-5">
                  <button 
                    onClick={() => toggleSort('name')} 
                    className={`btn btn-secondary text-xs flex items-center gap-1 ${sortBy === 'name' ? 'bg-gray-100 font-bold' : ''}`}
                  >
                    Urut Nama {sortBy === 'name' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                  </button>
                  <button 
                    onClick={() => toggleSort('average')} 
                    className={`btn btn-secondary text-xs flex items-center gap-1 ${sortBy === 'average' ? 'bg-gray-100 font-bold' : ''}`}
                  >
                    Urut Rata-rata {sortBy === 'average' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                  </button>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
              </div>
            ) : students.length === 0 ? (
              <div className="card text-center py-12">
                <ShieldAlert size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-bold text-gray-700">Tidak Ada Data Siswa</h3>
                <p className="text-muted text-sm mt-1">Silakan tambahkan data siswa ke kelas ini terlebih dahulu.</p>
              </div>
            ) : (
              <div className="table-container bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
                <table className="table w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-4 py-3 text-left font-semibold text-gray-700 w-12">No</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700 w-48">Nama Siswa</th>
                      {subjects.map(sub => (
                        <th key={sub.id} className="px-4 py-3 text-center font-semibold text-gray-700 min-w-[100px]" title={sub.name}>
                          {sub.id}
                        </th>
                      ))}
                      <th className="px-4 py-3 text-center font-semibold text-gray-700 w-24 bg-primary-light/30">Rata-rata</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {sortedLedgerData.map((row, index) => (
                      <tr key={row.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-left font-medium text-gray-600">{index + 1}</td>
                        <td className="px-4 py-3 text-left font-medium text-gray-900">{row.name}</td>
                        {subjects.map(sub => {
                          const val = row.grades[sub.id];
                          const isUnderKKM = val !== null && val !== undefined && val < 75;
                          return (
                            <td 
                              key={sub.id} 
                              className={`px-4 py-3 text-center font-medium ${
                                isUnderKKM ? 'text-danger font-semibold bg-danger-light/20' : 'text-gray-800'
                              }`}
                            >
                              {val !== null && val !== undefined ? val : '-'}
                            </td>
                          );
                        })}
                        <td className="px-4 py-3 text-center font-bold text-primary bg-primary-light/10">
                          {row.average !== null ? row.average : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: RAPOT SISWA */}
        {activeTab === 'rapot' && (
          <div>
            {/* Filter Section (Hides during print) */}
            <div className="card mb-6 bg-white shadow-sm border border-gray-200 print:hidden">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group mb-0">
                  <label className="form-label flex items-center gap-2"><Users size={15}/> Pilih Kelas</label>
                  <select 
                    className="form-input" 
                    value={selectedClass} 
                    onChange={e => setSelectedClass(e.target.value)}
                  >
                    {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                
                <div className="form-group mb-0">
                  <label className="form-label flex items-center gap-2"><UserCircle size={15}/> Pilih Siswa</label>
                  <select 
                    className="form-input"
                    value={selectedStudentId}
                    onChange={e => setSelectedStudentId(e.target.value)}
                    disabled={students.length === 0}
                  >
                    {students.length === 0 ? (
                      <option value="">Tidak ada siswa</option>
                    ) : (
                      students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)
                    )}
                  </select>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-12 print:hidden">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
              </div>
            ) : !currentStudentObj ? (
              <div className="card text-center py-12 print:hidden">
                <ShieldAlert size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-bold text-gray-700">Pilih Siswa Terlebih Dahulu</h3>
                <p className="text-muted text-sm mt-1">Gunakan drop-down filter di atas untuk memilih siswa.</p>
              </div>
            ) : (
              <div>
                {/* Print Control Bar (Hides during print) */}
                <div className="mb-4 flex justify-between items-center print:hidden">
                  <span className="text-sm text-gray-500 flex items-center gap-1">
                    <Activity size={16} className="text-primary"/> Tip: Tekan Ctrl+P untuk mencetak langsung dengan rapi
                  </span>
                  <button 
                    onClick={handlePrint}
                    className="btn btn-primary flex items-center gap-2"
                  >
                    <Printer size={18} /> Cetak Rapot
                  </button>
                </div>

                {/* --- REPORT CARD LAYOUT START --- */}
                <div className="rapot-printable bg-white p-8 md:p-12 shadow-lg border border-gray-200 rounded-xl max-w-4xl mx-auto print:shadow-none print:border-none print:p-0">
                  
                  {/* Styling for Print Layout */}
                  <style dangerouslySetInnerHTML={{__html: `
                    @media print {
                      body {
                        background-color: #fff !important;
                        color: #000 !important;
                        font-size: 12pt !important;
                      }
                      .sidebar, .header, .bottom-nav, .print\\:hidden, .app-layout::before {
                        display: none !important;
                      }
                      .main-content {
                        margin-left: 0 !important;
                        padding: 0 !important;
                        width: 100% !important;
                      }
                      .container {
                        max-width: 100% !important;
                        padding: 0 !important;
                        margin: 0 !important;
                      }
                      .rapot-printable {
                        border: none !important;
                        box-shadow: none !important;
                        padding: 0 !important;
                        max-width: 100% !important;
                        margin: 0 !important;
                      }
                      table {
                        border-collapse: collapse !important;
                        width: 100% !important;
                      }
                      th, td {
                        border: 1px solid #000 !important;
                        padding: 6px 10px !important;
                        font-size: 11pt !important;
                      }
                      th {
                        background-color: #f3f4f6 !important;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                      }
                    }
                  `}} />

                  {/* Header Sekolah */}
                  <div className="text-center border-b-2 border-double border-black pb-4 mb-6">
                    <h2 className="text-xl font-bold tracking-wide">MADRASAH TSANAWIYAH PIQ</h2>
                    <p className="text-sm font-medium text-gray-600 mt-1">Jl. Pendidikan Karakter No. 12, Malang</p>
                    <p className="text-xs text-gray-500">Telp: (0341) 123456 | Email: info@mtspiq.sch.id</p>
                  </div>

                  {/* Header Rapot / Judul */}
                  <div className="text-center mb-8">
                    <h3 className="text-lg font-bold underline">LAPORAN HASIL BELAJAR (RAPOT)</h3>
                  </div>

                  {/* Biodata Siswa */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-sm">
                    <table className="w-full border-none !border-0 text-left">
                      <tbody className="!border-0">
                        <tr className="!border-0"><td className="w-32 font-semibold !border-0 py-1 px-0">Nama Siswa</td><td className="w-4 !border-0 py-1 text-center">:</td><td className="!border-0 py-1 font-bold">{currentStudentObj.name}</td></tr>
                        <tr className="!border-0"><td className="font-semibold !border-0 py-1 px-0">ID Siswa (NIS)</td><td className="!border-0 py-1 text-center">:</td><td className="!border-0 py-1">{currentStudentObj.id}</td></tr>
                        <tr className="!border-0"><td className="font-semibold !border-0 py-1 px-0">Madrasah</td><td className="!border-0 py-1 text-center">:</td><td className="!border-0 py-1">MTs PIQ</td></tr>
                      </tbody>
                    </table>

                    <table className="w-full border-none !border-0 text-left">
                      <tbody className="!border-0">
                        <tr className="!border-0"><td className="w-32 font-semibold !border-0 py-1 px-0">Kelas</td><td className="w-4 !border-0 py-1 text-center">:</td><td className="!border-0 py-1 font-bold">{classes.find(c => c.id === selectedClass)?.name || selectedClass}</td></tr>
                        <tr className="!border-0"><td className="font-semibold !border-0 py-1 px-0">Semester</td><td className="!border-0 py-1 text-center">:</td><td className="!border-0 py-1">1 (Ganjil)</td></tr>
                        <tr className="!border-0"><td className="font-semibold !border-0 py-1 px-0">Tahun Ajaran</td><td className="!border-0 py-1 text-center">:</td><td className="!border-0 py-1">2026/2027</td></tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Tabel Nilai */}
                  <div className="overflow-x-auto mb-8">
                    <table className="w-full text-sm border-collapse border border-gray-400">
                      <thead>
                        <tr className="bg-gray-100 border border-gray-400">
                          <th className="border border-gray-400 px-3 py-2 text-center w-12 font-bold">No</th>
                          <th className="border border-gray-400 px-3 py-2 text-left font-bold w-48">Mata Pelajaran</th>
                          <th className="border border-gray-400 px-3 py-2 text-center w-16 font-bold" title="Rata-rata Sumatif">RS</th>
                          <th className="border border-gray-400 px-3 py-2 text-center w-16 font-bold" title="Sumatif Akhir Semester">SAS</th>
                          <th className="border border-gray-400 px-3 py-2 text-center w-16 font-bold" title="Nilai Remidi">NR</th>
                          <th className="border border-gray-400 px-3 py-2 text-center w-16 font-bold bg-gray-200/50">NA</th>
                          <th className="border border-gray-400 px-3 py-2 text-center w-16 font-bold">Predikat</th>
                          <th className="border border-gray-400 px-3 py-2 text-left font-bold">Deskripsi Capaian Kompetensi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {subjects.map((sub, index) => {
                          const { RS, SAS, NR, NA } = getSubjectGrades(selectedStudentId, sub.id);
                          const isUnderKKM = NA !== null && NA !== undefined && NA < 75;
                          
                          return (
                            <tr key={sub.id} className="border border-gray-400 hover:bg-gray-50/50">
                              <td className="border border-gray-400 px-3 py-2 text-center font-medium">{index + 1}</td>
                              <td className="border border-gray-400 px-3 py-2 text-left font-semibold">{sub.name}</td>
                              <td className="border border-gray-400 px-3 py-2 text-center">{RS !== null ? RS : '-'}</td>
                              <td className="border border-gray-400 px-3 py-2 text-center">{SAS !== null ? SAS : '-'}</td>
                              <td className="border border-gray-400 px-3 py-2 text-center">{NR !== null ? NR : '-'}</td>
                              <td className={`border border-gray-400 px-3 py-2 text-center font-bold bg-gray-100/30 ${isUnderKKM ? 'text-red-600' : ''}`}>{NA !== null ? NA : '-'}</td>
                              <td className="border border-gray-400 px-3 py-2 text-center font-bold">{getPredicate(NA)}</td>
                              <td className="border border-gray-400 px-3 py-2 text-xs leading-relaxed text-gray-700">{getCapaianDescription(NA, sub.name)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Tanda Tangan */}
                  <div className="grid grid-cols-3 gap-4 text-center mt-12 text-sm">
                    <div>
                      <p>Mengetahui,</p>
                      <p className="font-semibold mb-16">Orang Tua/Wali Siswa</p>
                      <p className="border-b border-black w-40 mx-auto"></p>
                    </div>
                    <div>
                      <p className="text-white">.</p>
                      <p className="font-semibold mb-16">Kepala Madrasah</p>
                      <p className="font-bold underline">H. Nurul Huda, M.Ag</p>
                      <p className="text-xs">NIP. 197405122002121003</p>
                    </div>
                    <div>
                      <p>Malang, {new Date().toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})}</p>
                      <p className="font-semibold mb-16">Wali Kelas</p>
                      <p className="font-bold underline">{currentTeacherObj?.name || '________________'}</p>
                      <p className="text-xs">NIP. {currentTeacherObj?.id ? `19850314201012${currentTeacherObj.id}` : '________________'}</p>
                    </div>
                  </div>

                </div>
                {/* --- REPORT CARD LAYOUT END --- */}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: REKAP GURU */}
        {activeTab === 'guru' && (
          <div className="print:hidden">
            {/* Filter Section */}
            <div className="card mb-6 bg-white shadow-sm border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="form-group mb-0">
                  <label className="form-label flex items-center gap-2"><UserCircle size={15}/> Pilih Guru</label>
                  <select 
                    className="form-input" 
                    value={selectedTeacherId} 
                    onChange={e => setSelectedTeacherId(e.target.value)}
                  >
                    {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>

                <div className="form-group mb-0">
                  <label className="form-label flex items-center gap-2"><BookOpen size={15}/> Mata Pelajaran</label>
                  <select 
                    className="form-input" 
                    value={selectedSubjectId} 
                    onChange={e => setSelectedSubjectId(e.target.value)}
                  >
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>

                <div className="form-group mb-0">
                  <label className="form-label flex items-center gap-2"><Users size={15}/> Kelas</label>
                  <select 
                    className="form-input" 
                    value={selectedClass} 
                    onChange={e => setSelectedClass(e.target.value)}
                  >
                    {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
              </div>
            ) : students.length === 0 ? (
              <div className="card text-center py-12">
                <ShieldAlert size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-bold text-gray-700">Tidak Ada Data Siswa</h3>
                <p className="text-muted text-sm mt-1">Silakan tambahkan data siswa ke kelas ini terlebih dahulu.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-sm text-emerald-800">
                  <div>
                    <span className="font-semibold">Guru:</span> {currentTeacherObj?.name} | <span className="font-semibold">Mapel:</span> {currentSubjectObj?.name} | <span className="font-semibold">Kelas:</span> {classes.find(c => c.id === selectedClass)?.name}
                  </div>
                  <div className="text-xs text-gray-500 font-medium">
                    LM1 - LM5 berisi Nilai Sumatif per Lintas Materi
                  </div>
                </div>

                <div className="table-container bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
                  <table className="table w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-4 py-3 text-left font-semibold text-gray-700 w-12">No</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700 w-44">Nama Siswa</th>
                        <th className="px-4 py-3 text-center font-semibold text-gray-700">LM1</th>
                        <th className="px-4 py-3 text-center font-semibold text-gray-700">LM2</th>
                        <th className="px-4 py-3 text-center font-semibold text-gray-700">LM3</th>
                        <th className="px-4 py-3 text-center font-semibold text-gray-700">LM4</th>
                        <th className="px-4 py-3 text-center font-semibold text-gray-700">LM5</th>
                        <th className="px-4 py-3 text-center font-semibold text-gray-700 bg-gray-50/80">RS</th>
                        <th className="px-4 py-3 text-center font-semibold text-gray-700 bg-gray-50/80">SAS</th>
                        <th className="px-4 py-3 text-center font-semibold text-gray-700 bg-gray-50/80">NR</th>
                        <th className="px-4 py-3 text-center font-bold text-primary bg-primary-light/20 w-20">NA</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {teacherGrades.map((row, index) => {
                        const isUnderKKM = row.NA !== '-' && row.NA < 75;
                        return (
                          <tr key={row.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-left font-medium text-gray-600">{index + 1}</td>
                            <td className="px-4 py-3 text-left font-medium text-gray-900">{row.name}</td>
                            <td className="px-4 py-3 text-center text-gray-800">{row.LM1}</td>
                            <td className="px-4 py-3 text-center text-gray-800">{row.LM2}</td>
                            <td className="px-4 py-3 text-center text-gray-800">{row.LM3}</td>
                            <td className="px-4 py-3 text-center text-gray-800">{row.LM4}</td>
                            <td className="px-4 py-3 text-center text-gray-800">{row.LM5}</td>
                            <td className="px-4 py-3 text-center text-gray-700 font-medium bg-gray-50/30">{row.RS}</td>
                            <td className="px-4 py-3 text-center text-gray-700 font-medium bg-gray-50/30">{row.SAS}</td>
                            <td className="px-4 py-3 text-center text-gray-700 font-medium bg-gray-50/30">{row.NR}</td>
                            <td className={`px-4 py-3 text-center font-bold bg-primary-light/10 ${isUnderKKM ? 'text-danger font-semibold bg-danger-light/10' : 'text-primary'}`}>
                              {row.NA}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { X, Download, Loader2 } from 'lucide-react';

export default function ExportExcelModal({ isOpen, onClose }) {
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [filters, setFilters] = useState({
    classId: '',
    teacherId: '',
    startDate: '',
    endDate: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      fetch(`${API_URL}/api/classes`).then(r => r.json()).then(setClasses);
      fetch(`${API_URL}/api/teachers`).then(r => r.json()).then(setTeachers);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleExport = async () => {
    setLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const queryParams = new URLSearchParams();
      if (filters.classId) queryParams.append('classId', filters.classId);
      if (filters.teacherId) queryParams.append('teacherId', filters.teacherId);
      if (filters.startDate) queryParams.append('startDate', filters.startDate);
      if (filters.endDate) queryParams.append('endDate', filters.endDate + 'T23:59:59.999Z'); // Include whole day

      const res = await fetch(`${API_URL}/api/reports/grades?${queryParams.toString()}`);
      if (!res.ok) throw new Error("Gagal mengambil data");
      const grades = await res.json();

      if (grades.length === 0) {
        alert("Tidak ada data nilai yang sesuai dengan filter.");
        setLoading(false);
        return;
      }

      // Group by Class
      const gradesByClass = {};
      grades.forEach(g => {
        if (!gradesByClass[g.className]) {
          gradesByClass[g.className] = [];
        }
        gradesByClass[g.className].push(g);
      });

      const wb = XLSX.utils.book_new();

      // Process each class into a worksheet (Raport format)
      Object.keys(gradesByClass).forEach(className => {
        const classGrades = gradesByClass[className];
        
        // Group by Student
        const studentsMap = {};
        const columnsSet = new Set();
        
        classGrades.forEach(g => {
          if (!studentsMap[g.studentName]) {
            studentsMap[g.studentName] = { Nama: g.studentName };
          }
          const colName = `${g.subjectName} - ${g.lm} (${g.component})`;
          columnsSet.add(colName);
          studentsMap[g.studentName][colName] = g.score;
        });

        // Convert to array
        const data = Object.values(studentsMap).sort((a, b) => a.Nama.localeCompare(b.Nama));
        
        // Ensure all objects have the same keys for correct columns
        const columns = Array.from(columnsSet).sort();
        const finalData = data.map((student, index) => {
          const row = { No: index + 1, "Nama Siswa": student.Nama };
          columns.forEach(col => {
            row[col] = student[col] !== undefined ? student[col] : '-';
          });
          return row;
        });

        const ws = XLSX.utils.json_to_sheet(finalData);
        
        // Auto-size columns slightly
        const wscols = [
          {wch: 5}, // No
          {wch: 30}, // Nama
        ];
        columns.forEach(() => wscols.push({wch: 15})); // subjects
        ws['!cols'] = wscols;

        XLSX.utils.book_append_sheet(wb, ws, className);
      });

      XLSX.writeFile(wb, `Rekap_Nilai_${filters.classId || 'SemuaKelas'}.xlsx`);
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat mengunduh Excel.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">Unduh Rekap Nilai (Excel)</h2>
          <button onClick={onClose} className="text-gray-500 hover:bg-gray-100 p-2 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kelas (Opsional)</label>
            <select
              className="w-full px-4 py-2 border rounded-lg"
              value={filters.classId}
              onChange={e => setFilters({...filters, classId: e.target.value})}
            >
              <option value="">Semua Kelas</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Guru (Opsional)</label>
            <select
              className="w-full px-4 py-2 border rounded-lg"
              value={filters.teacherId}
              onChange={e => setFilters({...filters, teacherId: e.target.value})}
            >
              <option value="">Semua Guru</option>
              {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dari Tanggal (Opsional)</label>
              <input
                type="date"
                className="w-full px-4 py-2 border rounded-lg"
                value={filters.startDate}
                onChange={e => setFilters({...filters, startDate: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sampai Tanggal (Opsional)</label>
              <input
                type="date"
                className="w-full px-4 py-2 border rounded-lg"
                value={filters.endDate}
                onChange={e => setFilters({...filters, endDate: e.target.value})}
              />
            </div>
          </div>
          <p className="text-xs text-gray-500">* Kosongkan filter jika ingin mengunduh semua data.</p>
        </div>

        <div className="mt-8 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2 px-4 border text-gray-700 rounded-lg font-medium hover:bg-gray-50"
          >
            Batal
          </button>
          <button
            onClick={handleExport}
            disabled={loading}
            className="flex-1 py-2 px-4 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
            Unduh Excel
          </button>
        </div>
      </div>
    </div>
  );
}

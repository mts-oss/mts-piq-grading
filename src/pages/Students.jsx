import { useState, useEffect, useRef } from 'react';
import { Upload, Plus, Trash2, Download, CheckSquare } from 'lucide-react';

export default function Students() {
  const [students, setStudents] = useState([]);
  const [newStudent, setNewStudent] = useState({ id: '', name: '', class: '' });
  const [showAdd, setShowAdd] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const fileInputRef = useRef(null);
  
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  const fetchStudents = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/students`);
      if (res.ok) {
        const data = await res.json();
        setStudents(data.map(s => ({...s, class: s.classId})));
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleDelete = async (id) => {
    if (confirm('Yakin ingin menghapus siswa ini?')) {
      try {
        await fetch(`${apiUrl}/api/students/${id}`, { method: 'DELETE' });
        fetchStudents();
        setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const handleBulkDelete = async () => {
    if (confirm(`Yakin ingin menghapus ${selectedIds.length} siswa yang dipilih?`)) {
      try {
        for (const id of selectedIds) {
          await fetch(`${apiUrl}/api/students/${id}`, { method: 'DELETE' });
        }
        fetchStudents();
        setSelectedIds([]);
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (newStudent.id && newStudent.name && newStudent.class) {
      try {
        const res = await fetch(`${apiUrl}/api/students`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: newStudent.id, name: newStudent.name, classId: newStudent.class })
        });
        if (res.ok) {
          fetchStudents();
          setNewStudent({ id: '', name: '', class: '' });
          setShowAdd(false);
        } else {
          const err = await res.json();
          alert(err.error);
        }
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const handleDownloadTemplate = (e) => {
    e.preventDefault();
    const csvContent = "data:text/csv;charset=utf-8,ID Siswa / NIS,Nama Siswa,Kode Kelas\n1001,Ahmad Fauzi,7A\n1002,Budi Santoso,7B";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "template_siswa.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const csvText = event.target.result;
      const rows = csvText.split('\n');
      const studentsToUpload = [];

      for (let i = 1; i < rows.length; i++) {
        if (!rows[i].trim()) continue;
        const cols = rows[i].split(',');
        if (cols.length >= 3) {
          studentsToUpload.push({
            id: cols[0].trim(),
            name: cols[1].trim(),
            classId: cols[2].trim()
          });
        }
      }

      if (studentsToUpload.length > 0) {
        try {
          const res = await fetch(`${apiUrl}/api/students/bulk`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ students: studentsToUpload })
          });
          if (res.ok) {
            alert('Berhasil upload ' + studentsToUpload.length + ' siswa!');
            fetchStudents();
          } else {
            const data = await res.json();
            alert('Gagal upload: ' + data.error);
          }
        } catch (err) {
          alert('Error: ' + err.message);
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === students.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(students.map(s => s.id));
    }
  };

  const toggleSelect = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  return (
    <div className="container">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-h1">Data Siswa</h1>
          <p className="text-muted">Kelola data siswa MTs PIQ</p>
        </div>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <button className="btn btn-primary" onClick={() => setShowAdd(!showAdd)}>
          <Plus size={18} /> Tambah Manual
        </button>
        <input 
          type="file" 
          accept=".csv" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          onChange={handleFileUpload} 
        />
        <button className="btn btn-secondary" onClick={() => fileInputRef.current.click()}>
          <Upload size={18} /> Upload Masal
        </button>
        <a href="#" className="btn btn-secondary" onClick={handleDownloadTemplate}>
          <Download size={18} /> Template CSV
        </a>
        {selectedIds.length > 0 && (
          <button className="btn btn-danger" onClick={handleBulkDelete}>
            <Trash2 size={18} /> Hapus Terpilih ({selectedIds.length})
          </button>
        )}
      </div>

      {showAdd && (
        <div className="card mb-6 animate-fade-in">
          <h2 className="text-h2 mb-4">Tambah Siswa Baru</h2>
          <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="form-group">
              <label className="form-label">ID Siswa / NIS</label>
              <input type="text" className="form-input" value={newStudent.id} onChange={e => setNewStudent({...newStudent, id: e.target.value})} required />
            </div>
            <div className="form-group">
              <label className="form-label">Nama Siswa</label>
              <input type="text" className="form-input" value={newStudent.name} onChange={e => setNewStudent({...newStudent, name: e.target.value})} required />
            </div>
            <div className="form-group">
              <label className="form-label">Kelas</label>
              <input type="text" className="form-input" value={newStudent.class} onChange={e => setNewStudent({...newStudent, class: e.target.value})} required />
            </div>
            <div className="md:col-span-3 flex justify-end gap-2">
              <button type="button" className="btn btn-secondary" onClick={() => setShowAdd(false)}>Batal</button>
              <button type="submit" className="btn btn-primary">Simpan</button>
            </div>
          </form>
        </div>
      )}

      {/* Desktop Table */}
      <div className="table-container desktop-only">
        <table className="table">
          <thead>
            <tr>
              <th style={{ width: '50px' }} className="text-center">
                <input 
                  type="checkbox" 
                  checked={students.length > 0 && selectedIds.length === students.length}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 cursor-pointer"
                />
              </th>
              <th>ID Siswa</th>
              <th>Nama Siswa</th>
              <th>Kelas</th>
              <th className="text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {students.map(student => (
              <tr key={student.id} className={selectedIds.includes(student.id) ? 'bg-blue-50' : ''}>
                <td className="text-center">
                  <input 
                    type="checkbox" 
                    checked={selectedIds.includes(student.id)}
                    onChange={() => toggleSelect(student.id)}
                    className="w-4 h-4 cursor-pointer"
                  />
                </td>
                <td>{student.id}</td>
                <td className="font-medium">{student.name}</td>
                <td><span className="badge badge-success">{student.class}</span></td>
                <td className="text-right">
                  <button className="btn-icon text-danger" onClick={() => handleDelete(student.id)}>
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile View */}
      <div className="mobile-only flex flex-col gap-2">
        <div className="flex items-center gap-2 px-2 pb-2">
          <input 
            type="checkbox" 
            checked={students.length > 0 && selectedIds.length === students.length}
            onChange={toggleSelectAll}
            className="w-4 h-4 cursor-pointer"
            id="selectAllMobile"
          />
          <label htmlFor="selectAllMobile" className="text-sm font-medium cursor-pointer">Pilih Semua</label>
        </div>
        {students.map(student => (
          <div key={student.id} className={`mobile-table-card ${selectedIds.includes(student.id) ? 'border-primary' : ''}`}>
            <div className="flex justify-between items-start">
              <div className="flex gap-3">
                <input 
                  type="checkbox" 
                  checked={selectedIds.includes(student.id)}
                  onChange={() => toggleSelect(student.id)}
                  className="w-4 h-4 mt-1 cursor-pointer"
                />
                <div>
                  <h3 className="font-bold">{student.name}</h3>
                  <p className="text-sm text-muted">ID: {student.id}</p>
                </div>
              </div>
              <span className="badge badge-success">{student.class}</span>
            </div>
            <div className="flex justify-end mt-2">
              <button className="btn btn-secondary text-danger" onClick={() => handleDelete(student.id)}>
                <Trash2 size={16} /> Hapus
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

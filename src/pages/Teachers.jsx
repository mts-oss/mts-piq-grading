import { useState, useEffect } from 'react';
import { Plus, Trash2, Upload, Download } from 'lucide-react';

export default function Teachers() {
  const [teachers, setTeachers] = useState([]);
  const [newTeacher, setNewTeacher] = useState({ id: '', name: '' });
  const [showAdd, setShowAdd] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  const fetchTeachers = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/teachers`);
      if (res.ok) {
        const data = await res.json();
        setTeachers(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const handleDelete = async (id) => {
    if (confirm('Yakin ingin menghapus guru ini?')) {
      try {
        await fetch(`${apiUrl}/api/teachers/${id}`, { method: 'DELETE' });
        fetchTeachers();
        setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const handleBulkDelete = async () => {
    if (confirm(`Yakin ingin menghapus ${selectedIds.length} guru yang dipilih?`)) {
      try {
        for (const id of selectedIds) {
          await fetch(`${apiUrl}/api/teachers/${id}`, { method: 'DELETE' });
        }
        fetchTeachers();
        setSelectedIds([]);
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (newTeacher.id && newTeacher.name) {
      try {
        const res = await fetch(`${apiUrl}/api/teachers`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: newTeacher.id, name: newTeacher.name })
        });
        if (res.ok) {
          fetchTeachers();
          setNewTeacher({ id: '', name: '' });
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

  const toggleSelectAll = () => {
    if (selectedIds.length === teachers.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(teachers.map(t => t.id));
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
          <h1 className="text-h1">Data Guru</h1>
          <p className="text-muted">Kelola data guru MTs PIQ</p>
        </div>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <button className="btn btn-primary" onClick={() => setShowAdd(!showAdd)}>
          <Plus size={18} /> Tambah Manual
        </button>
        <button className="btn btn-secondary">
          <Upload size={18} /> Upload Masal
        </button>
        <a href="#" className="btn btn-secondary" onClick={(e) => { e.preventDefault(); alert('Download template_guru.csv berhasil disimulasikan.') }}>
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
          <h2 className="text-h2 mb-4">Tambah Guru Baru</h2>
          <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">ID Guru / NIP</label>
              <input type="text" className="form-input" value={newTeacher.id} onChange={e => setNewTeacher({...newTeacher, id: e.target.value})} required />
            </div>
            <div className="form-group">
              <label className="form-label">Nama Guru</label>
              <input type="text" className="form-input" value={newTeacher.name} onChange={e => setNewTeacher({...newTeacher, name: e.target.value})} required />
            </div>
            <div className="md:col-span-2 flex justify-end gap-2">
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
                  checked={teachers.length > 0 && selectedIds.length === teachers.length}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 cursor-pointer"
                />
              </th>
              <th>ID Guru</th>
              <th>Nama Guru</th>
              <th className="text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {teachers.map(teacher => (
              <tr key={teacher.id} className={selectedIds.includes(teacher.id) ? 'bg-blue-50' : ''}>
                <td className="text-center">
                  <input 
                    type="checkbox" 
                    checked={selectedIds.includes(teacher.id)}
                    onChange={() => toggleSelect(teacher.id)}
                    className="w-4 h-4 cursor-pointer"
                  />
                </td>
                <td>{teacher.id}</td>
                <td className="font-medium">{teacher.name}</td>
                <td className="text-right">
                  <button className="btn-icon text-danger" onClick={() => handleDelete(teacher.id)}>
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
            checked={teachers.length > 0 && selectedIds.length === teachers.length}
            onChange={toggleSelectAll}
            className="w-4 h-4 cursor-pointer"
            id="selectAllTeachersMobile"
          />
          <label htmlFor="selectAllTeachersMobile" className="text-sm font-medium cursor-pointer">Pilih Semua</label>
        </div>
        {teachers.map(teacher => (
          <div key={teacher.id} className={`mobile-table-card ${selectedIds.includes(teacher.id) ? 'border-primary' : ''}`}>
            <div className="flex justify-between items-start">
              <div className="flex gap-3">
                <input 
                  type="checkbox" 
                  checked={selectedIds.includes(teacher.id)}
                  onChange={() => toggleSelect(teacher.id)}
                  className="w-4 h-4 mt-1 cursor-pointer"
                />
                <div>
                  <h3 className="font-bold">{teacher.name}</h3>
                  <p className="text-sm text-muted">ID: {teacher.id}</p>
                </div>
              </div>
            </div>
            <div className="flex justify-end mt-2">
              <button className="btn btn-secondary text-danger" onClick={() => handleDelete(teacher.id)}>
                <Trash2 size={16} /> Hapus
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

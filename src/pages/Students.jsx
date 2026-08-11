import { useState } from 'react';
import { Upload, Plus, Trash2, Download, CheckSquare } from 'lucide-react';

export default function Students() {
  const [students, setStudents] = useState([
    { id: '1001', name: 'Ahmad Fauzi', class: '7A' },
    { id: '1002', name: 'Budi Santoso', class: '7A' },
    { id: '1003', name: 'Citra Lestari', class: '7B' },
  ]);

  const [newStudent, setNewStudent] = useState({ id: '', name: '', class: '' });
  const [showAdd, setShowAdd] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  const handleDelete = (id) => {
    if (confirm('Yakin ingin menghapus siswa ini?')) {
      setStudents(students.filter(s => s.id !== id));
      setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
    }
  };

  const handleBulkDelete = () => {
    if (confirm(`Yakin ingin menghapus ${selectedIds.length} siswa yang dipilih?`)) {
      setStudents(students.filter(s => !selectedIds.includes(s.id)));
      setSelectedIds([]);
    }
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if (newStudent.id && newStudent.name && newStudent.class) {
      setStudents([...students, newStudent]);
      setNewStudent({ id: '', name: '', class: '' });
      setShowAdd(false);
    }
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
        <button className="btn btn-secondary">
          <Upload size={18} /> Upload Masal
        </button>
        <a href="#" className="btn btn-secondary" onClick={(e) => { e.preventDefault(); alert('Download template_siswa.csv berhasil disimulasikan.') }}>
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

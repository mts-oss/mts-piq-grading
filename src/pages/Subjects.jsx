import { useState } from 'react';
import { Upload, Plus, Trash2, Download } from 'lucide-react';

export default function Subjects() {
  const [subjects, setSubjects] = useState([
    { id: 'M001', name: 'Pendidikan Agama Islam' },
    { id: 'M002', name: 'Bahasa Arab' },
    { id: 'M003', name: 'Matematika' },
  ]);

  const [newSubject, setNewSubject] = useState({ id: '', name: '' });
  const [showAdd, setShowAdd] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  const handleDelete = (id) => {
    if (confirm('Yakin ingin menghapus mata pelajaran ini?')) {
      setSubjects(subjects.filter(s => s.id !== id));
      setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
    }
  };

  const handleBulkDelete = () => {
    if (confirm(`Yakin ingin menghapus ${selectedIds.length} mata pelajaran yang dipilih?`)) {
      setSubjects(subjects.filter(s => !selectedIds.includes(s.id)));
      setSelectedIds([]);
    }
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if (newSubject.id && newSubject.name) {
      setSubjects([...subjects, newSubject]);
      setNewSubject({ id: '', name: '' });
      setShowAdd(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === subjects.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(subjects.map(s => s.id));
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
          <h1 className="text-h1">Mata Pelajaran</h1>
          <p className="text-muted">Kelola data mapel</p>
        </div>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <button className="btn btn-primary" onClick={() => setShowAdd(!showAdd)}>
          <Plus size={18} /> Tambah Manual
        </button>
        <button className="btn btn-secondary">
          <Upload size={18} /> Upload Masal
        </button>
        <a href="#" className="btn btn-secondary" onClick={(e) => { e.preventDefault(); alert('Download template_mapel.csv berhasil disimulasikan.') }}>
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
          <h2 className="text-h2 mb-4">Tambah Mapel Baru</h2>
          <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">ID Mapel</label>
              <input type="text" className="form-input" value={newSubject.id} onChange={e => setNewSubject({...newSubject, id: e.target.value})} required />
            </div>
            <div className="form-group">
              <label className="form-label">Nama Mapel</label>
              <input type="text" className="form-input" value={newSubject.name} onChange={e => setNewSubject({...newSubject, name: e.target.value})} required />
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
                  checked={subjects.length > 0 && selectedIds.length === subjects.length}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 cursor-pointer"
                />
              </th>
              <th>ID Mapel</th>
              <th>Nama Mapel</th>
              <th className="text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {subjects.map(subject => (
              <tr key={subject.id} className={selectedIds.includes(subject.id) ? 'bg-blue-50' : ''}>
                <td className="text-center">
                  <input 
                    type="checkbox" 
                    checked={selectedIds.includes(subject.id)}
                    onChange={() => toggleSelect(subject.id)}
                    className="w-4 h-4 cursor-pointer"
                  />
                </td>
                <td>{subject.id}</td>
                <td className="font-medium">{subject.name}</td>
                <td className="text-right">
                  <button className="btn-icon text-danger" onClick={() => handleDelete(subject.id)}>
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
            checked={subjects.length > 0 && selectedIds.length === subjects.length}
            onChange={toggleSelectAll}
            className="w-4 h-4 cursor-pointer"
            id="selectAllSubjectsMobile"
          />
          <label htmlFor="selectAllSubjectsMobile" className="text-sm font-medium cursor-pointer">Pilih Semua</label>
        </div>
        {subjects.map(subject => (
          <div key={subject.id} className={`mobile-table-card ${selectedIds.includes(subject.id) ? 'border-primary' : ''}`}>
            <div className="flex justify-between items-start">
              <div className="flex gap-3">
                <input 
                  type="checkbox" 
                  checked={selectedIds.includes(subject.id)}
                  onChange={() => toggleSelect(subject.id)}
                  className="w-4 h-4 mt-1 cursor-pointer"
                />
                <div>
                  <h3 className="font-bold">{subject.name}</h3>
                  <p className="text-sm text-muted">ID: {subject.id}</p>
                </div>
              </div>
            </div>
            <div className="flex justify-end mt-2">
              <button className="btn btn-secondary text-danger" onClick={() => handleDelete(subject.id)}>
                <Trash2 size={16} /> Hapus
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

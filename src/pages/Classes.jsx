import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';

export default function Classes() {
  const [classes, setClasses] = useState([]);
  const [newClass, setNewClass] = useState({ id: '', name: '' });
  const [showAdd, setShowAdd] = useState(false);
  
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  const fetchClasses = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/classes`);
      if (res.ok) {
        const data = await res.json();
        setClasses(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleDelete = async (id) => {
    if (confirm('Yakin ingin menghapus kelas ini?')) {
      try {
        await fetch(`${apiUrl}/api/classes/${id}`, { method: 'DELETE' });
        fetchClasses();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (newClass.id && newClass.name) {
      try {
        const res = await fetch(`${apiUrl}/api/classes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: newClass.id, name: newClass.name })
        });
        if (res.ok) {
          fetchClasses();
          setNewClass({ id: '', name: '' });
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

  return (
    <div className="container">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-h1">Data Kelas</h1>
          <p className="text-muted">Kelola data kelas</p>
        </div>
      </div>

      <div className="mb-6">
        <button className="btn btn-primary" onClick={() => setShowAdd(!showAdd)}>
          <Plus size={18} /> Tambah Kelas
        </button>
      </div>

      {showAdd && (
        <div className="card mb-6 animate-fade-in">
          <h2 className="text-h2 mb-4">Tambah Kelas Baru</h2>
          <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Kode Kelas</label>
              <input type="text" className="form-input" value={newClass.id} onChange={e => setNewClass({...newClass, id: e.target.value})} required />
            </div>
            <div className="form-group">
              <label className="form-label">Nama Kelas</label>
              <input type="text" className="form-input" value={newClass.name} onChange={e => setNewClass({...newClass, name: e.target.value})} required />
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
              <th>Kode Kelas</th>
              <th>Nama Kelas</th>
              <th className="text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {classes.map(cls => (
              <tr key={cls.id}>
                <td>{cls.id}</td>
                <td className="font-medium">{cls.name}</td>
                <td className="text-right">
                  <button className="btn-icon text-danger" onClick={() => handleDelete(cls.id)}>
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
        {classes.map(cls => (
          <div key={cls.id} className="mobile-table-card">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold">{cls.name}</h3>
                <p className="text-sm text-muted">Kode: {cls.id}</p>
              </div>
            </div>
            <div className="flex justify-end mt-2">
              <button className="btn btn-secondary text-danger" onClick={() => handleDelete(cls.id)}>
                <Trash2 size={16} /> Hapus
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

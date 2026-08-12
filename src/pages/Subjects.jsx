import { useState, useEffect, useRef } from 'react';
import { Upload, Plus, Trash2, Download } from 'lucide-react';

export default function Subjects() {
  const [subjects, setSubjects] = useState([]);
  const [newSubject, setNewSubject] = useState({ id: '', name: '' });
  const [showAdd, setShowAdd] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const fileInputRef = useRef(null);
  
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  const fetchSubjects = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/subjects`);
      if (res.ok) {
        const data = await res.json();
        setSubjects(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const handleDelete = async (id) => {
    if (confirm('Yakin ingin menghapus mata pelajaran ini?')) {
      try {
        await fetch(`${apiUrl}/api/subjects/${id}`, { method: 'DELETE' });
        fetchSubjects();
        setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const handleBulkDelete = async () => {
    if (confirm(`Yakin ingin menghapus ${selectedIds.length} mata pelajaran yang dipilih?`)) {
      try {
        for (const id of selectedIds) {
          await fetch(`${apiUrl}/api/subjects/${id}`, { method: 'DELETE' });
        }
        fetchSubjects();
        setSelectedIds([]);
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (newSubject.id && newSubject.name) {
      try {
        const res = await fetch(`${apiUrl}/api/subjects`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: newSubject.id, name: newSubject.name })
        });
        if (res.ok) {
          fetchSubjects();
          setNewSubject({ id: '', name: '' });
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
    const csvContent = "data:text/csv;charset=utf-8,ID Mapel,Nama Mapel\nM001,Pendidikan Agama Islam\nM002,Bahasa Arab";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "template_mapel.csv");
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
      const subjectsToUpload = [];

      for (let i = 1; i < rows.length; i++) {
        if (!rows[i].trim()) continue;
        const cols = rows[i].split(',');
        if (cols.length >= 2) {
          subjectsToUpload.push({
            id: cols[0].trim(),
            name: cols[1].trim()
          });
        }
      }

      if (subjectsToUpload.length > 0) {
        try {
          const res = await fetch(`${apiUrl}/api/subjects/bulk`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ subjects: subjectsToUpload })
          });
          if (res.ok) {
            alert('Berhasil upload ' + subjectsToUpload.length + ' mapel!');
            fetchSubjects();
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

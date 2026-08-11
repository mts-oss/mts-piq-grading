import { useState, useEffect } from 'react';
import { Bell, User, Menu, Wifi, WifiOff } from 'lucide-react';

export default function Header({ toggleSidebar, isSidebarOpen }) {
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    // Determine if we're running online or locally
    // If hostname is not localhost/127.0.0.1, we assume it's deployed online.
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
        setIsOnline(true);
      }
    }
  }, []);

  return (
    <header className="header">
      <div className="flex items-center gap-4 desktop-only">
        <button className="btn-icon" onClick={toggleSidebar}>
          <Menu size={20} />
        </button>
        <h2 className="text-h2">Sistem Penilaian</h2>
        
        {/* Status Koneksi */}
        {isOnline ? (
          <span className="ml-4 inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800 border border-emerald-200">
            <Wifi size={14} /> Cloud Database
          </span>
        ) : (
          <span className="ml-4 inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800 border border-amber-200">
            <WifiOff size={14} /> Local Development
          </span>
        )}
      </div>
      
      {/* Mobile Title */}
      <div className="flex items-center gap-2 mobile-only">
        <div className="bg-primary text-white p-1.5 rounded-md flex items-center justify-center">
          <span className="font-bold text-sm">PIQ</span>
        </div>
        <h1 className="font-bold text-lg">Penilaian</h1>
        
        {/* Mobile Status */}
        {isOnline ? (
          <span className="ml-2 inline-flex items-center justify-center rounded-full bg-emerald-100 p-1 text-emerald-800 border border-emerald-200" title="Online (Cloud)">
            <Wifi size={14} />
          </span>
        ) : (
          <span className="ml-2 inline-flex items-center justify-center rounded-full bg-amber-100 p-1 text-amber-800 border border-amber-200" title="Local Development">
            <WifiOff size={14} />
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button className="btn-icon">
          <Bell size={20} className="text-muted" />
        </button>
        <button className="btn-icon">
          <User size={20} className="text-muted" />
        </button>
      </div>
    </header>
  );
}

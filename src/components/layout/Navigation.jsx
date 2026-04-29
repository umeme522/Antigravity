import React from 'react';
import { Network, Users, Download, Upload } from 'lucide-react';

const Navigation = ({ 
  isSidebarOpen, 
  setIsSidebarOpen
}) => {
  return (
    <div className="nav-sidebar">
      <div className="nav-logo" style={{ margin: '0 0 40px 0', color: 'var(--accent-primary)' }}>
        <Network size={32} />
      </div>
      
      <div className="nav-items" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* 組織図タブ */}
        <button 
          onClick={() => setIsSidebarOpen(false)}
          className={`nav-btn ${!isSidebarOpen ? 'active' : ''}`} 
          title="組織図を表示"
        >
          <Network size={24} />
          <span className="nav-label">組織図</span>
        </button>

        {/* メンバー一覧タブ */}
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className={`nav-btn ${isSidebarOpen ? 'active' : ''}`} 
          title="メンバー一覧を表示"
        >
          <Users size={24} />
          <span className="nav-label">メンバー</span>
        </button>
      </div>
    </div>

  );
};


export default Navigation;

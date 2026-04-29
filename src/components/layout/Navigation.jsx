import React from 'react';
import { Network, Users, Download, Upload } from 'lucide-react';

const Navigation = ({ 
  isSidebarOpen, 
  setIsSidebarOpen
}) => {
  return (
    <div className="nav-sidebar">
      <div style={{ margin: '0 0 40px 0', color: 'var(--accent-primary)' }}>
        <Network size={32} />
      </div>
      
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className={`nav-btn ${isSidebarOpen ? 'active' : ''}`} 
          title={isSidebarOpen ? "一覧を閉じる" : "メンバー一覧を開く"}
        >
          <Users size={24} />
        </button>
      </div>
    </div>
  );
};


export default Navigation;

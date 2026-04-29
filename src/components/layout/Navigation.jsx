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
        <div className="nav-tabs" style={{ display: 'flex', gap: '8px' }}>
        <button 
          onClick={() => setIsSidebarOpen(false)}
          className={`nav-tab ${!isSidebarOpen ? 'active' : ''}`}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Share2 size={18} />
          <span>組織図</span>
        </button>
        <button 
          onClick={() => {
            setIsSidebarOpen(true);
            window.dispatchEvent(new CustomEvent('changeSidebarTab', { detail: 'list' }));
          }}
          className={`nav-tab ${isSidebarOpen ? 'active' : ''}`}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Users size={18} />
          <span>メンバー</span>
        </button>
        <button 
          onClick={() => {
            setIsSidebarOpen(true);
            window.dispatchEvent(new CustomEvent('changeSidebarTab', { detail: 'search' }));
          }}
          className={`nav-tab ${isSidebarOpen ? 'active' : ''}`}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Search size={18} />
          <span>検索</span>
        </button>
      </div>
      </div>
    </div>

  );
};


export default Navigation;

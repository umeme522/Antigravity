import React from 'react';
import { Network, Users, Search, Share2, BarChart3 } from 'lucide-react';

const Navigation = ({ 
  isSidebarOpen, 
  setIsSidebarOpen,
  sidebarTab,
  setSidebarTab
}) => {
  return (
    <div className="nav-sidebar">
      <div className="nav-logo" style={{ margin: '0 0 40px 0', color: 'var(--accent-primary)', textAlign: 'center' }}>
        <Network size={32} />
      </div>
      
      <div className="nav-items" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* 組織図ボタン */}
        <button 
          onClick={() => setIsSidebarOpen(false)}
          className={`nav-btn ${!isSidebarOpen ? 'active' : ''}`}
          style={{ width: '100%' }}
          title="組織図"
        >
          <Share2 size={24} />
          <span className="nav-label">組織図</span>
        </button>

        {/* メンバーボタン */}
        <button 
          onClick={() => {
            setIsSidebarOpen(true);
            setSidebarTab('list');
            window.dispatchEvent(new CustomEvent('changeSidebarTab', { detail: 'list' }));
          }}
          className={`nav-btn ${isSidebarOpen && sidebarTab === 'list' ? 'active' : ''}`}
          style={{ width: '100%' }}
          title="メンバー"
        >
          <Users size={24} />
          <span className="nav-label">メンバー</span>
        </button>

        {/* 検索ボタン */}
        <button 
          onClick={() => {
            setIsSidebarOpen(true);
            setSidebarTab('search');
            window.dispatchEvent(new CustomEvent('changeSidebarTab', { detail: 'search' }));
          }}
          className={`nav-btn ${isSidebarOpen && sidebarTab === 'search' ? 'active' : ''}`}
          style={{ width: '100%' }}
          title="検索"
        >
          <Search size={24} />
          <span className="nav-label">検索</span>
        </button>
      </div>
    </div>
  );
};


export default Navigation;

import { Network, Users, Search, Share2, BarChart3, Download } from 'lucide-react';

const Navigation = ({ 
  isSidebarOpen, 
  setIsSidebarOpen,
  sidebarTab,
  setSidebarTab,
  onExport // 追加: 出力ボタン用のプロップ
}) => {
  return (
    <div className="nav-sidebar">
      <div className="nav-logo" style={{ margin: '0 0 40px 0', color: 'var(--accent-primary)', textAlign: 'center' }}>
        <Network size={32} />
      </div>
      
      <div className="nav-items" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* 既存のタブ */}
        <button onClick={() => setIsSidebarOpen(false)} className={`nav-btn ${!isSidebarOpen ? 'active' : ''}`} style={{ width: '100%' }} title="組織図">
          <Share2 size={24} />
          <span className="nav-label">組織図</span>
        </button>

        <button onClick={() => { setIsSidebarOpen(true); setSidebarTab('members'); }} className={`nav-btn ${isSidebarOpen && sidebarTab === 'members' ? 'active' : ''}`} style={{ width: '100%' }} title="メンバー">
          <Users size={24} />
          <span className="nav-label">メンバー</span>
        </button>

        <button onClick={() => { setIsSidebarOpen(true); setSidebarTab('search'); }} className={`nav-btn ${isSidebarOpen && sidebarTab === 'search' ? 'active' : ''}`} style={{ width: '100%' }} title="検索">
          <Search size={24} />
          <span className="nav-label">検索</span>
        </button>

        <button onClick={() => { setIsSidebarOpen(true); setSidebarTab('stats'); }} className={`nav-btn ${isSidebarOpen && sidebarTab === 'stats' ? 'active' : ''}`} style={{ width: '100%' }} title="統計データ">
          <BarChart3 size={24} />
          <span className="nav-label">データ</span>
        </button>

        {/* 出力ボタン（区切り線の後） */}
        <div style={{ margin: '12px 0', borderTop: '1px solid rgba(255,255,255,0.1)' }} />
        <button 
          onClick={onExport} 
          className="nav-btn" 
          style={{ width: '100%', color: 'var(--accent-primary)' }} 
          title="Excel出力"
        >
          <Download size={24} />
          <span className="nav-label">出力</span>
        </button>
      </div>
    </div>
  );
};


export default Navigation;

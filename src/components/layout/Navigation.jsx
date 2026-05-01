import { Network, Users, Search, Share2, BarChart3, Download } from 'lucide-react';

const Navigation = ({ 
  isSidebarOpen, 
  setIsSidebarOpen,
  sidebarTab,
  setSidebarTab,
  onExport // 追加: 出力ボタン用のプロップ
}) => {
  const baseUrl = import.meta.env.BASE_URL || '/';
  
  return (
    <div className="nav-sidebar">
      <div className="nav-logo" style={{ margin: '0 0 40px 0', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div className="logo-container">
          <img 
            src={`${baseUrl}logo.png`} 
            alt="Logo" 
            className="app-logo-img"
          />
        </div>
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

        <div style={{ marginTop: 'auto', padding: '20px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <img src={`${baseUrl}logo.png`} style={{ width: '32px', height: '32px', opacity: 0.6, filter: 'grayscale(1) brightness(2)' }} />
          <span style={{ fontSize: '0.5rem', color: 'rgba(255,255,255,0.3)', fontWeight: 'bold', letterSpacing: '0.1em' }}>CRESCENT</span>
        </div>
      </div>
    </div>
  );
};

export default Navigation;

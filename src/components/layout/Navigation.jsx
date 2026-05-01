import { Network, Users, Search, Share2, BarChart3, Download } from 'lucide-react';

const Navigation = ({ 
  isSidebarOpen, 
  setIsSidebarOpen,
  sidebarTab,
  setSidebarTab,
  onExport 
}) => {
  const getLogoSrc = () => {
    const base = import.meta.env.BASE_URL || '/';
    return base.endsWith('/') ? `${base}logo.png` : `${base}/logo.png`;
  };
  
  const logoSrc = getLogoSrc();
  
  return (
    <div className="nav-sidebar">
      <div className="nav-logo" style={{ margin: '0 0 40px 0', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div className="logo-container" style={{ 
          width: '56px', 
          height: '56px', 
          borderRadius: '50%', 
          overflow: 'hidden', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          background: 'rgba(0, 255, 204, 0.05)',
          border: '1px solid rgba(0, 255, 204, 0.2)'
        }}>
          <img 
            src={logoSrc} 
            alt="Logo" 
            className="app-logo-img"
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'cover',
              transform: 'scale(1.8)', // 拡大して周りの背景と文字を消す
              objectPosition: 'center'
            }}
          />
        </div>
      </div>
      
      <div className="nav-items" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
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

        <div style={{ marginTop: 'auto', padding: '15px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ 
            width: '32px', 
            height: '32px', 
            borderRadius: '50%', 
            overflow: 'hidden', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            background: 'rgba(0, 255, 204, 0.1)'
          }}>
            <img 
              src={logoSrc} 
              style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'cover', 
                transform: 'scale(1.8)',
                objectPosition: 'center'
              }} 
              alt="Crescent Logo" 
            />
          </div>
          <span style={{ fontSize: '0.55rem', color: 'var(--accent-primary)', fontWeight: '900', letterSpacing: '0.15em', opacity: 0.8 }}>CRESCENT</span>
        </div>
      </div>
    </div>
  );
};

export default Navigation;

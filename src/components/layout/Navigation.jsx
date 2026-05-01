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
  
  const getIconSrc = () => {
    const base = import.meta.env.BASE_URL || '/';
    return base.endsWith('/') ? `${base}logo_icon.png` : `${base}/logo_icon.png`;
  };
  
  const logoSrc = getLogoSrc();
  const iconSrc = getIconSrc();
  
  return (
    <div className="nav-sidebar">
      <div style={{ height: '40px' }} />
      
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

        <div style={{ marginTop: 'auto', padding: '15px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ 
            width: '44px', 
            height: '44px', 
            borderRadius: '50%', 
            overflow: 'hidden', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            background: 'rgba(0, 255, 204, 0.1)',
            border: '1px solid rgba(0, 255, 204, 0.2)'
          }}>
            <img 
              src={iconSrc} 
              style={{ 
                width: '105%', 
                height: '105%', 
                objectFit: 'cover'
              }} 
              alt="KONOIKE Logo" 
            />
          </div>
          <span style={{ fontSize: '0.45rem', color: 'var(--accent-primary)', fontWeight: '900', letterSpacing: '0.3em', opacity: 0.7, marginTop: '2px' }}>KONOIKE</span>
        </div>
      </div>
    </div>
  );
};

export default Navigation;

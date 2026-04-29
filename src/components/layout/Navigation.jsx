import React from 'react';
import { Network, Users, Download, Upload } from 'lucide-react';

const Navigation = ({ 
  isSidebarOpen, 
  setIsSidebarOpen, 
  onBackup, 
  onRestore 
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

      {/* バックアップ・復元ボタン */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <button
          onClick={onBackup}
          className="nav-btn"
          title="データをバックアップ（JSONファイルに書き出す）"
          style={{ color: '#00F2FF' }}
        >
          <Download size={20} />
        </button>
        <label
          title="バックアップから復元する"
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            padding: '12px', 
            borderRadius: '12px', 
            cursor: 'pointer', 
            color: 'rgba(255,165,0,0.8)', 
            transition: 'all 0.3s ease' 
          }}
        >
          <Upload size={20} />
          <input 
            type="file" 
            accept=".json" 
            onChange={onRestore} 
            style={{ display: 'none' }} 
          />
        </label>
      </div>
    </div>
  );
};

export default Navigation;

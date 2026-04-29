import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Sidebar from './components/Sidebar';
import OrgChart from './components/OrgChart';
import MemberProfile from './components/MemberProfile';
import { mockData } from './data/mockData';
import { Network, LayoutGrid, Settings, Users, Download, Upload } from 'lucide-react';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);
  const [units, setUnits] = useState(() => {
    const saved = localStorage.getItem('org-units');
    return saved ? JSON.parse(saved) : (mockData.units || []);
  });
  const [members, setMembers] = useState(() => {
    const saved = localStorage.getItem('org-members');
    return saved ? JSON.parse(saved) : (mockData.members || []);
  });

  // データが変更されるたびにブラウザに保存（リロード対策）
  useEffect(() => {
    localStorage.setItem('org-units', JSON.stringify(units));
  }, [units]);

  useEffect(() => {
    localStorage.setItem('org-members', JSON.stringify(members));
  }, [members]);



  // useEffect内のsetTimeoutは削除し、motion.divのonAnimationCompleteに移動します。

  const handleMemberClick = (member) => {
    setSelectedMember(member);
    // メンバーをクリックしたときにサイドバーが開いていれば、使い勝手のためにそのままにする
  };

  const handleUpdateMember = (updatedMember) => {
    if (!updatedMember) return;
    
    // isNewフラグを削除
    const memberToSave = { ...updatedMember };
    delete memberToSave.isNew;

    setMembers(prev => {
      const exists = prev.some(m => m.id === memberToSave.id);
      if (exists) {
        return prev.map(m => m.id === memberToSave.id ? memberToSave : m);
      } else {
        return [...prev, memberToSave];
      }
    });
    setSelectedMember(memberToSave);
  };

  const handleAddMember = () => {
    const newMember = {
      id: `m_new_${Date.now()}`,
      lastName: '',
      firstName: '',
      reading: '',
      position: '',
      unitId: units[0]?.id || '',
      photo: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}`,
      birthDate: '',
      joinDate: new Date().getFullYear().toString(),
      employeeId: '',
      birthplace: '',
      isNew: true
    };
    setSelectedMember(newMember);
  };

  const currentMember = selectedMember || members[0];
  const selectedUnit = units.find(u => u.id === currentMember?.unitId);

  // バックアップ：現在のデータをJSONファイルとして書き出す
  const handleBackup = () => {
    const data = { members, units, backupDate: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const date = new Date().toLocaleDateString('ja-JP').replaceAll('/', '-');
    a.href = url;
    a.download = `組織図バックアップ_${date}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 復元：バックアップJSONファイルを読み込んでデータを復元する
  const handleRestore = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (data.members) setMembers(data.members);
        if (data.units) setUnits(data.units);
        alert(`バックアップを復元しました！\n（バックアップ日時: ${data.backupDate ? new Date(data.backupDate).toLocaleString('ja-JP') : '不明'}）`);
      } catch {
        alert('ファイルの読み込みに失敗しました。正しいバックアップファイルを選択してください。');
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // 同じファイルを再度選択できるようにリセット
  };

  return (
    <div className="app-container">
      {/* 1. 左側ナビゲーション (アイコンのみ) */}
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
            onClick={handleBackup}
            className="nav-btn"
            title="データをバックアップ（JSONファイルに書き出す）"
            style={{ color: '#00F2FF' }}
          >
            <Download size={20} />
          </button>
          <label
            title="バックアップから復元する"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px', borderRadius: '12px', cursor: 'pointer', color: 'rgba(255,165,0,0.8)', transition: 'all 0.3s ease' }}
          >
            <Upload size={20} />
            <input type="file" accept=".json" onChange={handleRestore} style={{ display: 'none' }} />
          </label>
        </div>
      </div>

      {/* 2. サイドバー (メンバー一覧) - 開閉アニメーション対応 */}
      <AnimatePresence onExitComplete={() => window.dispatchEvent(new Event('resize'))}>
        {isSidebarOpen && (
          <motion.div
            initial={{ x: -550, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -550, opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            onAnimationComplete={() => window.dispatchEvent(new Event('resize'))}
          >
            <Sidebar 
              members={members} 
              units={units} 
              searchTerm={searchTerm} 
              setSearchTerm={setSearchTerm}
              onMemberClick={handleMemberClick}
              onAddMember={handleAddMember}
              isFullView={false}
            />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* 3. メインコンテンツ (組織図) */}
      <div className="main-area" style={{ position: 'relative', flex: 1, height: '100vh', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
          <OrgChart 
            units={units} 
            members={members} 
            onMemberClick={handleMemberClick}
          />
        </div>
      </div>

      {/* 4. プロフィールパネル - 選択時のみ表示 */}
      <AnimatePresence initial={false} onExitComplete={() => window.dispatchEvent(new Event('resize'))}>
        {selectedMember && (
          <motion.div 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 420, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            onAnimationComplete={() => window.dispatchEvent(new Event('resize'))}
            className="profile-sidebar"
            style={{ overflow: 'hidden', borderLeft: '1px solid var(--glass-border)', backgroundColor: 'rgba(13, 17, 23, 0.95)' }}
          >
            <MemberProfile 
              member={selectedMember}
              unit={selectedUnit}
              units={units}
              onUpdate={handleUpdateMember}
              onClose={() => setSelectedMember(null)} // 閉じる機能
              isPermanent={false} // 常設ではなく引き出しにする
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;

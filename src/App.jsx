import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

// Layout & Features
import Navigation from './components/layout/Navigation';
import Sidebar from './components/layout/Sidebar';
import OrgChart from './components/features/OrgChart';
import MemberProfile from './components/features/MemberProfile';

// Hooks & Utils
import { useOrgData } from './hooks/useOrgData';
import { backupData, restoreData } from './utils/storage';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);

  const {
    units,
    setUnits,
    members,
    setMembers,
    updateMember,
    createNewMember
  } = useOrgData();

  const handleMemberClick = (member) => {
    setSelectedMember(member);
  };

  const handleUpdateMember = (updatedMember) => {
    const savedMember = updateMember(updatedMember);
    if (savedMember) {
      setSelectedMember(savedMember);
    }
  };

  const handleAddMember = () => {
    const newMember = createNewMember(units[0]?.id);
    setSelectedMember(newMember);
  };

  const currentMember = selectedMember || members[0];
  const selectedUnit = units.find(u => u.id === currentMember?.unitId);

  const isMobile = false; /* Forced desktop layout */

  return (
    <div className="app-container">
      {/* 1. ナビゲーション */}
      <Navigation 
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={(val) => {
          setIsSidebarOpen(val);
          // タブ切り替え時にリサイズイベントを発火してOrgChartのズレを防ぐ
          setTimeout(() => window.dispatchEvent(new Event('resize')), 100);
        }}
      />

      <div className="app-main-layout">
        {/* デスクトップ版：これまでのレイアウト */}
        <>
          <AnimatePresence onExitComplete={() => window.dispatchEvent(new Event('resize'))}>
            {isSidebarOpen && (
              <Sidebar 
                members={members} 
                units={units} 
                searchTerm={searchTerm} 
                setSearchTerm={setSearchTerm}
                onMemberClick={handleMemberClick}
                onAddMember={handleAddMember}
              />
            )}
          </AnimatePresence>
          
          <div className="main-area" style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
            <OrgChart 
              units={units} 
              members={members} 
              onMemberClick={handleMemberClick}
            />
          </div>
        </>
      </div>

      {/* 4. プロフィールパネル (オーバーレイ/サイドバー) */}
      <AnimatePresence initial={false}>
        {selectedMember && (
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="profile-sidebar"
            style={{ 
              position: 'fixed', 
              right: 0, 
              top: 0, 
              bottom: 0, 
              width: '420px', 
              zIndex: 20000, 
              backgroundColor: '#0d1117' 
            }}
          >
            <MemberProfile 
              member={selectedMember}
              unit={selectedUnit}
              units={units}
              onUpdate={handleUpdateMember}
              onClose={() => setSelectedMember(null)}
              isPermanent={false}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


export default App;

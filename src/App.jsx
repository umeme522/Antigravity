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

  const handleBackup = () => backupData(members, units);
  const handleRestore = (e) => restoreData(e, setMembers, setUnits);

  const currentMember = selectedMember || members[0];
  const selectedUnit = units.find(u => u.id === currentMember?.unitId);

  return (
    <div className="app-container">
      {/* 1. ナビゲーション */}
      <Navigation 
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        onBackup={handleBackup}
        onRestore={handleRestore}
      />

      {/* 2. サイドバー (メンバー一覧) */}
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

      {/* 4. プロフィールパネル */}
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

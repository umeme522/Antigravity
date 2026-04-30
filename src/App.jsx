import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

// Layout & Features (Split into Desktop and Mobile)
import Sidebar_Desktop from './components/desktop/Sidebar_Desktop';
import OrgChart_Desktop from './components/desktop/OrgChart_Desktop';
import Sidebar_Mobile from './components/mobile/Sidebar_Mobile';
import OrgChart_Mobile from './components/mobile/OrgChart_Mobile';
import Navigation from './components/layout/Navigation';
import MemberProfile from './components/features/MemberProfile';

// Hooks & Utils
import { useOrgData } from './hooks/useOrgData';
import { backupData, restoreData } from './utils/storage';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarTab, setSidebarTab] = useState('members'); // 'members', 'search' or 'stats'

  const [searchTerm, setSearchTerm] = useState('');

  const [selectedMember, setSelectedMember] = useState(null);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false);

  // ウィンドウリサイズ監視
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  return (
    <div className={isMobile ? "app-container-mobile" : "app-container"}>
      <Navigation 
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={(val) => {
          setIsSidebarOpen(val);
          setTimeout(() => window.dispatchEvent(new Event('resize')), 100);
        }}
        sidebarTab={sidebarTab}
        setSidebarTab={setSidebarTab}
      />

      <div className={isMobile ? "app-content-mobile" : "app-main-layout"}>
        {isMobile ? (
          <>
            {isSidebarOpen ? (
              <Sidebar_Mobile 
                members={members} 
                units={units} 
                searchTerm={searchTerm} 
                setSearchTerm={setSearchTerm}
                onMemberClick={handleMemberClick}
                onAddMember={handleAddMember}
              />
            ) : (
              <div className="main-area" style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                <OrgChart_Mobile 
                  units={units} 
                  members={members} 
                  onMemberClick={handleMemberClick}
                />
              </div>
            )}
          </>
        ) : (
          <>
            <AnimatePresence onExitComplete={() => window.dispatchEvent(new Event('resize'))}>
              {isSidebarOpen && (
                <Sidebar_Desktop 
                  members={members} 
                  units={units} 
                  searchTerm={searchTerm} 
                  setSearchTerm={setSearchTerm}
                  onMemberClick={handleMemberClick}
                  onAddMember={handleAddMember}
                  activeTab={sidebarTab}
                  setActiveTab={setSidebarTab}
                />
              )}
            </AnimatePresence>

            
            <div className="main-area" style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
              <OrgChart_Desktop 
                units={units} 
                members={members} 
                onMemberClick={handleMemberClick}
              />
            </div>
          </>
        )}
      </div>

      <AnimatePresence initial={false}>
        {selectedMember && (
          <motion.div 
            initial={isMobile ? { y: '100%' } : { x: '100%' }}
            animate={isMobile ? { y: 0 } : { x: 0 }}
            exit={isMobile ? { y: '100%' } : { x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="profile-sidebar"
            style={{ 
              position: 'fixed', 
              right: 0, 
              top: 0, 
              bottom: 0, 
              width: isMobile ? '100%' : '420px', 
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

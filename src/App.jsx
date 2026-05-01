import React, { useState, useEffect } from 'react';

// Layout & Features (Split into Desktop and Mobile)
import Sidebar_Desktop from './components/desktop/Sidebar_Desktop';
import OrgChart_Desktop from './components/desktop/OrgChart_Desktop';
import Sidebar_Mobile from './components/mobile/Sidebar_Mobile';
import OrgChart_Mobile from './components/mobile/OrgChart_Mobile';
import Navigation from './components/layout/Navigation';
import MemberProfile from './components/features/MemberProfile';

// Hooks & Utils
import { useOrgData } from './hooks/useOrgData';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarTab, setSidebarTab] = useState('members'); 

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
    members,
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

  // CSV出力ロジック (エラーに強くシンプルな方式)
  const handleExportData = () => {
    try {
      const headers = ['社員番号', '姓', '名', '性別', '部署', '役職', '入社年度', '生年月日', '出身', '経歴'];
      const rows = members.map(m => {
        try {
          const unitName = units.find(u => u.id === m.unitId)?.name || '';
          const hometown = [m.birthplace, m.prefecture, m.hometown].filter(Boolean).join(' ');
          
          let careerText = '';
          if (Array.isArray(m.careerHistory)) {
            careerText = m.careerHistory.map(c => `${c.period || ''} ${c.department || ''}`).join(' / ');
          } else if (typeof m.careerHistory === 'string') {
            careerText = m.careerHistory;
          }

          const rowData = [
            m.employeeId || '',
            m.lastName || '',
            m.firstName || '',
            m.gender || '',
            unitName,
            m.position || '',
            m.joinDate || '',
            m.birthDate || '',
            hometown,
            careerText
          ];
          return rowData.map(val => `"${String(val || '').replace(/"/g, '""')}"`).join(',');
        } catch (e) {
          return '"Error","","","","","","","","",""';
        }
      });

      const csvContent = "\uFEFF" + [headers.map(h => `"${h}"`).join(','), ...rows].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      
      const now = new Date();
      const timestamp = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}`;
      
      link.setAttribute("href", url);
      link.setAttribute("download", `組織データ_${timestamp}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      alert('出力中にエラーが発生しました。');
    }
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
        onExport={handleExportData}
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

      {/* プロフィール画面 (アニメーションなしで確実に表示) */}
      {selectedMember && (
        <div 
          className="profile-sidebar"
          style={{ 
            position: 'fixed', 
            right: 0, 
            top: 0, 
            bottom: 0, 
            width: isMobile ? '100%' : '450px', 
            zIndex: 20000,
            background: '#1a1d26',
            borderLeft: '1px solid rgba(255,255,255,0.1)',
            overflowY: 'auto'
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
        </div>
      )}
    </div>
  );
}

export default App;

import React, { useState, useEffect } from 'react';
import { Search, Users, Plus, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const getPositionColor = (pos) => {
  if (!pos) return '#a0aec0';
  if (pos.includes('支店長') || pos.includes('副支店長')) return '#ffd700'; // 金
  if (pos.includes('部長')) return '#ff4b4b'; // 赤
  if (pos.includes('所長') || pos.includes('課長')) return '#4b7bff'; // 青
  if (pos.includes('副長')) return '#ff9500'; // オレンジ
  if (pos.includes('係長')) return '#00e676'; // 緑
  return '#a0aec0'; // スタッフ（グレー）
};

const Sidebar_Desktop = ({ members, units, searchTerm, setSearchTerm, onMemberClick, onAddMember }) => {
  const [activeTab, setActiveTab] = useState('list'); // 'list' or 'search'
  const [groupBy, setGroupBy] = useState('position'); // 'position' or 'joinDate'

  // ナビゲーションからのタブ切り替えイベントを監視
  useEffect(() => {
    const handleTabChange = (e) => {
      if (e.detail) setActiveTab(e.detail);
    };
    window.addEventListener('changeSidebarTab', handleTabChange);
    return () => window.removeEventListener('changeSidebarTab', handleTabChange);
  }, []);

  const filteredMembers = members.filter(member => {
    if (activeTab === 'list') return true;
    const fullName = `${member.lastName} ${member.firstName}`.toLowerCase();
    const pos = (member.position || '').toLowerCase();
    const search = searchTerm.toLowerCase();
    return fullName.includes(search) || pos.includes(search);
  });

  const getPriority = (pos) => {
    if (!pos) return 1000;
    if (pos.includes('支店長')) return 1;
    if (pos.includes('副支店長')) return 2;
    if (pos.includes('部長')) return 3;
    if (pos.includes('所長') || pos.includes('課長')) return 10;
    if (pos.includes('副長')) return 20;
    if (pos.includes('係長')) return 30;
    return 100;
  };

  const getGroupTitle = (pos) => {
    if (pos.includes('支店長') || pos.includes('副支店長') || pos.includes('部長')) return '支店長・部長';
    if (pos.includes('所長') || pos.includes('課長')) return '課長・所長';
    if (pos.includes('副長')) return '副長';
    if (pos.includes('係長')) return '係長';
    return 'スタッフ';
  };

  return (
    <motion.div 
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="sidebar"
      style={{ padding: '0', height: '100%', display: 'flex', flexDirection: 'column' }}
    >
      <div style={{ padding: '24px', flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        
        {/* コンテンツ: 一覧モード */}
        {activeTab === 'list' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: '900', color: '#ffffff', margin: 0, letterSpacing: '0.05em' }}>MEMBERS</h2>
                <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', fontWeight: '600' }}>全 {members.length} 名</span>
              </div>
              <button onClick={onAddMember} className="save-btn" style={{ padding: '8px 16px', fontSize: '0.8rem', width: 'auto' }}>
                <Plus size={14} style={{ marginRight: '4px' }} /> 追加
              </button>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
              <button 
                onClick={() => setGroupBy('position')}
                style={{ flex: 1, padding: '10px', fontSize: '0.8rem', borderRadius: '10px', background: groupBy === 'position' ? 'var(--accent-primary)' : 'rgba(255,255,255,0.05)', color: groupBy === 'position' ? '#000' : '#fff', border: 'none', cursor: 'pointer', fontWeight: '800' }}
              >
                役職別
              </button>
              <button 
                onClick={() => setGroupBy('joinDate')}
                style={{ flex: 1, padding: '10px', fontSize: '0.8rem', borderRadius: '10px', background: groupBy === 'joinDate' ? 'var(--accent-primary)' : 'rgba(255,255,255,0.05)', color: groupBy === 'joinDate' ? '#000' : '#fff', border: 'none', cursor: 'pointer', fontWeight: '800' }}
              >
                入社年度別
              </button>
            </div>

            <div className="member-list" style={{ flex: 1, overflowY: 'auto' }}>
              {Object.entries(
                filteredMembers.reduce((acc, m) => {
                  let group = groupBy === 'joinDate' ? (m.joinDate && typeof m.joinDate === 'string' ? m.joinDate.split('-')[0] : m.joinDate) + '年' : getGroupTitle(m.position);
                  if (!acc[group]) acc[group] = [];
                  acc[group].push(m);
                  return acc;
                }, {})
              )
              .sort(([groupA], [groupB]) => {
                if (groupBy === 'joinDate') {
                  if (groupA.includes('不明')) return 1;
                  if (groupB.includes('不明')) return -1;
                  return groupB.localeCompare(groupA);
                }
                const posA = filteredMembers.find(m => getGroupTitle(m.position) === groupA)?.position || '';
                const posB = filteredMembers.find(m => getGroupTitle(m.position) === groupB)?.position || '';
                return getPriority(posA) - getPriority(posB);
              })
              .map(([groupTitle, posMembers]) => (
                <div key={groupTitle} style={{ marginBottom: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '6px' }}>
                    <h3 style={{ fontSize: '0.9rem', color: 'var(--accent-primary)', fontWeight: '800' }}>{groupTitle}</h3>
                    <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>{posMembers.length}名</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '12px' }}>
                    {posMembers.map(m => (
                      <MemberCard key={m.id} m={m} onMemberClick={onMemberClick} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* コンテンツ: 検索モード */}
        {activeTab === 'search' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: '900', color: '#ffffff', margin: 0, letterSpacing: '0.05em' }}>SEARCH</h2>
            </div>

            <div className="search-container" style={{ position: 'relative', marginBottom: '24px' }}>
              <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--accent-primary)' }} />
              <input
                type="text"
                autoFocus
                className="search-input"
                placeholder="名前、役職、部署で検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingLeft: '44px', height: '50px', fontSize: '1rem', width: '100%', color: '#ffffff', borderRadius: '12px' }}
              />
            </div>

            <div className="member-list" style={{ flex: 1, overflowY: 'auto' }}>
              {searchTerm.length > 0 ? (
                <>
                  <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', marginBottom: '16px', fontWeight: '600' }}>検索結果: {filteredMembers.length} 名</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '12px' }}>
                    {filteredMembers.map(m => (
                      <MemberCard key={m.id} m={m} onMemberClick={onMemberClick} />
                    ))}
                  </div>
                </>
              ) : (
                <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.3, textAlign: 'center' }}>
                  <Search size={48} style={{ marginBottom: '16px' }} />
                  <p>キーワードを入力して検索してください</p>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </motion.div>
  );
};

// サブコンポーネント: メンバーカード
const MemberCard = ({ m, onMemberClick }) => {
  const roleColor = getPositionColor(m.position);
  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.05, backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
      onClick={() => onMemberClick(m)}
      className="glass member-card-mini"
      style={{
        padding: '12px 8px',
        cursor: 'pointer',
        textAlign: 'center',
        position: 'relative',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        borderRadius: '12px',
        background: 'rgba(255, 255, 255, 0.04)',
        boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
      }}
    >
      <div style={{ position: 'absolute', top: 0, left: '0', width: '100%', height: '3px', background: roleColor, borderRadius: '12px 12px 0 0' }} />
      {m.photo && (
        <img src={m.photo} alt={m.lastName} style={{ width: '48px', height: '48px', borderRadius: '10px', marginBottom: '8px', objectFit: 'cover' }} />
      )}
      <div style={{ fontWeight: '700', fontSize: '0.85rem', color: '#ffffff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '6px' }}>
        {m.lastName} {m.firstName}
      </div>
      <div style={{ fontSize: '0.75rem', color: roleColor, fontWeight: '900', textTransform: 'uppercase' }}>
        {m.position}
      </div>
    </motion.div>
  );
};

export default Sidebar_Desktop;

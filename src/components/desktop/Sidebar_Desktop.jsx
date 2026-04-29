import React, { useState } from 'react';
import { Search, Plus } from 'lucide-react';
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
  const isMobile = false;
  const [groupBy, setGroupBy] = useState('position');

  const filteredMembers = members.filter(member => {
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
    if (pos.includes('副長')) return '副長職';
    if (pos.includes('係長')) return '係長職';
    return '一般スタッフ';
  };


  return (
    <motion.div 
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="sidebar"
      style={{ padding: '24px', height: '100%', display: 'flex', flexDirection: 'column' }}
    >
      <div className="sidebar-header" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: '900', color: '#ffffff', margin: 0, letterSpacing: '0.05em' }}>MEMBERS</h2>
          <button 
            onClick={onAddMember}
            style={{ 
              padding: '8px 12px',
              background: 'var(--accent-primary)',
              color: '#000',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '700',
              cursor: 'pointer',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Plus size={14} /> 追加
          </button>
        </div>

        <div className="search-container" style={{ position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }} />
          <input
            type="text"
            className="search-input"
            placeholder="名前、役職、部署..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '36px', height: '40px', fontSize: '0.9rem', width: '100%', color: '#ffffff' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
          <button 
            onClick={() => setGroupBy('position')}
            style={{ flex: 1, padding: '8px', fontSize: '0.8rem', borderRadius: '8px', background: groupBy === 'position' ? 'var(--accent-primary)' : 'rgba(255,255,255,0.1)', color: groupBy === 'position' ? '#000' : '#fff', border: 'none', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.2s ease' }}
          >
            役職別
          </button>
          <button 
            onClick={() => setGroupBy('joinDate')}
            style={{ flex: 1, padding: '8px', fontSize: '0.8rem', borderRadius: '8px', background: groupBy === 'joinDate' ? 'var(--accent-primary)' : 'rgba(255,255,255,0.1)', color: groupBy === 'joinDate' ? '#000' : '#fff', border: 'none', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.2s ease' }}
          >
            入社年度別
          </button>
        </div>
      </div>

      <div className="member-list" style={{ flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
        {Object.entries(
          filteredMembers.reduce((acc, m) => {
            let group;
            if (groupBy === 'joinDate') {
              const year = (m.joinDate && typeof m.joinDate === 'string') ? m.joinDate.split('-')[0] : m.joinDate;
              group = year ? `${year}年` : '不明';
            } else {
              group = getGroupTitle(m.position || 'Staff');
            }
            if (!acc[group]) acc[group] = [];
            acc[group].push(m);
            return acc;
          }, {})
        )
        .sort(([groupA], [groupB]) => {
          if (groupBy === 'joinDate') {
            if (groupA === '不明') return 1;
            if (groupB === '不明') return -1;
            return groupB.localeCompare(groupA); 
          } else {
            const posA = filteredMembers.find(m => getGroupTitle(m.position) === groupA)?.position || '';
            const posB = filteredMembers.find(m => getGroupTitle(m.position) === groupB)?.position || '';
            return getPriority(posA) - getPriority(posB);
          }
        })
        .map(([groupTitle, posMembers]) => (
          <div key={groupTitle} style={{ marginBottom: '24px' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center', 
              marginBottom: '12px',
              borderBottom: `1px solid rgba(255,255,255,0.1)`,
              paddingBottom: '6px'
            }}>
              <h3 style={{ fontSize: '0.9rem', color: 'var(--accent-primary)', fontWeight: '800' }}>
                {groupTitle}
              </h3>
              <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>
                {posMembers.length} 名
              </span>
            </div>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
              gap: '12px' 
            }}>
              {posMembers
                .sort((a, b) => getPriority(a.position) - getPriority(b.position))
                .map(member => {
                  const roleColor = getPositionColor(member.position);
                  const fullName = `${member.lastName} ${member.firstName}`;
                  return (
                    <motion.div
                      key={member.id}
                      whileHover={{ y: -5, scale: 1.05, backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
                      onClick={() => onMemberClick(member)}
                      className="glass member-card-mini"
                      style={{
                        padding: '12px 8px',
                        cursor: 'pointer',
                        textAlign: 'center',
                        position: 'relative',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: '12px',
                        background: 'rgba(255, 255, 255, 0.04)',
                        transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                        minWidth: 0,
                        boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
                      }}
                    >
                      <div style={{ 
                        position: 'absolute', 
                        top: 0, 
                        left: '0', 
                        width: '100%', 
                        height: '3px', 
                        background: roleColor,
                        boxShadow: `0 0 12px ${roleColor}66`,
                        borderRadius: '12px 12px 0 0'
                      }} />

                      {member.photo && (
                        <img 
                          src={member.photo} 
                          alt={member.lastName} 
                          style={{ 
                            width: '48px', 
                            height: '48px', 
                            borderRadius: '10px', 
                            marginBottom: '8px',
                            objectFit: 'cover'
                          }} 
                        />
                      )}
                      
                      <div style={{ 
                        fontWeight: '700', 
                        fontSize: '0.85rem',
                        color: '#ffffff',
                        lineHeight: '1.2',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        marginBottom: '6px'
                      }}>
                        {fullName}
                      </div>
                      <div style={{ 
                        display: 'inline-block',
                        fontSize: '0.75rem', 
                        color: roleColor, // 文字を役職の色に
                        fontWeight: '900', 
                        textTransform: 'uppercase',
                        letterSpacing: '0.02em'
                      }}>
                        {member.position}
                      </div>

                    </motion.div>
                  );
                })}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default Sidebar_Desktop;

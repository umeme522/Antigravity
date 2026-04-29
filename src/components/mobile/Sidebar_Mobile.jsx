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

const getGroupTitle = (pos) => {
  if (pos.includes('支店長') || pos.includes('副支店長')) return '経営・支店長';
  if (pos.includes('部長')) return '部長職';
  if (pos.includes('所長') || pos.includes('課長')) return '課長・所長';
  if (pos.includes('副長')) return '副長職';
  if (pos.includes('係長')) return '係長職';
  return '一般スタッフ';
};

const Sidebar_Mobile = ({ members, units, searchTerm, setSearchTerm, onMemberClick, onAddMember }) => {
  const isMobile = true; 
  const [groupBy, setGroupBy] = useState('position'); 

  const filteredMembers = members.filter(member => {
    const fullName = `${member.lastName} ${member.firstName}`.toLowerCase();
    const pos = (member.position || '').toLowerCase();
    const search = searchTerm.toLowerCase();
    return fullName.includes(search) || pos.includes(search);
  });

  return (
    <motion.div 
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="sidebar"
      style={{ padding: '16px', height: '100%', display: 'flex', flexDirection: 'column', background: '#0a0c12' }}
    >
      <div className="sidebar-header" style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: '900', color: '#ffffff', margin: 0 }}>MEMBERS</h2>
          <button 
            onClick={onAddMember}
            style={{ 
              padding: '6px 10px',
              background: 'var(--accent-primary)',
              color: '#000',
              border: 'none',
              borderRadius: '6px',
              fontWeight: '700',
              fontSize: '0.75rem'
            }}
          >
            + 追加
          </button>
        </div>

        <input
          type="text"
          className="search-input"
          placeholder="検索..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ height: '36px', fontSize: '0.85rem', width: '100%', color: '#fff', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '0 12px', borderRadius: '6px' }}
        />
      </div>

      <div className="member-list" style={{ flex: 1, overflowY: 'auto' }}>
        {Object.entries(
          filteredMembers.reduce((acc, m) => {
            let group = groupBy === 'joinDate' ? (m.joinDate?.split('-')[0] || '不明') + '年' : getGroupTitle(m.position);
            if (!acc[group]) acc[group] = [];
            acc[group].push(m);
            return acc;
          }, {})
        ).map(([groupTitle, posMembers]) => (
          <div key={groupTitle} style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '4px', marginBottom: '8px' }}>
              {groupTitle} ({posMembers.length})
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
              {posMembers.map(member => {
                const roleColor = getPositionColor(member.position);
                return (
                  <div key={member.id} onClick={() => onMemberClick(member)} style={{ textAlign: 'center', position: 'relative', cursor: 'pointer' }}>
                    <div style={{ position: 'absolute', top: 0, width: '100%', height: '2px', background: roleColor }} />
                    <img src={member.photo} style={{ width: '40px', height: '40px', borderRadius: '6px', border: `1px solid ${roleColor}`, marginTop: '4px', objectFit: 'cover' }} />
                    <div style={{ fontSize: '0.65rem', fontWeight: '700', color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{member.lastName}</div>
                    <div style={{ fontSize: '0.5rem', background: roleColor, color: '#fff', borderRadius: '2px', padding: '0 2px' }}>{member.position}</div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        <div style={{ height: '150px' }} />
      </div>
    </motion.div>
  );
};

export default Sidebar_Mobile;

import React, { useState } from 'react';
import { Search, Users, ChevronRight, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const getPositionColor = (pos) => {
  if (!pos) return 'var(--pos-staff)';
  if (pos.includes('支店長') || pos.includes('副支店長')) return 'var(--pos-executive)';
  if (pos.includes('部長')) return 'var(--pos-manager)';
  if (pos.includes('所長') || pos.includes('課長')) return 'var(--pos-director)';
  if (pos.includes('副長')) return 'var(--pos-subdirector)';
  if (pos.includes('係長')) return 'var(--pos-lead)';
  return 'var(--pos-staff)';
};

const Sidebar = ({ members, units, searchTerm, setSearchTerm, onMemberClick, onAddMember }) => {
  const isMobile = window.innerWidth < 768;
  const [groupBy, setGroupBy] = useState('position');


  const filteredMembers = members.filter(m => {
    const fullName = `${m.lastName || ''} ${m.firstName || ''}`.toLowerCase();
    const unit = units.find(u => u.id === m.unitId)?.name.toLowerCase() || '';
    const posStr = (m.position || '').toLowerCase();
    const search = (searchTerm || '').toLowerCase();
    return fullName.includes(search) || posStr.includes(search) || unit.includes(search);
  });

  const getGroupTitle = (pos) => {
    if (!pos) return 'スタッフ';
    if (pos.includes('支店長') || pos.includes('副支店長') || pos.includes('部長')) return '支店長・副支店長・部長';
    if (pos.includes('所長') || pos.includes('課長')) return '所長・課長';
    if (pos.includes('副長')) return '副長';
    if (pos.includes('係長')) return '係長';
    return 'スタッフ';
  };

  const getPriority = (pos) => {
    if (!pos) return 8;
    if (pos.includes('支店長')) return 1;
    if (pos.includes('副支店長')) return 2;
    if (pos.includes('部長')) return 3;
    if (pos.includes('所長')) return 4;
    if (pos.includes('課長')) return 5;
    if (pos.includes('副長')) return 6;
    if (pos.includes('係長')) return 7;
    return 8;
  };

  return (
    <motion.div 
      initial={{ x: -550, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -550, opacity: 0 }}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      className="sidebar" 
    >
      <div className="sidebar-header" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.2rem', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={20} color="var(--accent-primary)" />
            Members
            <span style={{ 
              fontSize: '0.8rem', 
              background: 'rgba(255,255,255,0.1)', 
              padding: '2px 8px', 
              borderRadius: '12px', 
              color: 'var(--text-secondary)',
              marginLeft: '4px',
              fontWeight: 'normal'
            }}>
              {searchTerm ? `${filteredMembers.length} / ${members.length}名` : `全 ${members.length} 名`}
            </span>
          </h2>
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

        <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
          <button 
            onClick={() => setGroupBy('position')}
            style={{ flex: 1, padding: '6px', fontSize: '0.8rem', borderRadius: '6px', background: groupBy === 'position' ? 'var(--accent-primary)' : 'rgba(255,255,255,0.1)', color: groupBy === 'position' ? '#000' : '#fff', border: 'none', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.2s ease' }}
          >
            役職順
          </button>
          <button 
            onClick={() => setGroupBy('joinDate')}
            style={{ flex: 1, padding: '6px', fontSize: '0.8rem', borderRadius: '6px', background: groupBy === 'joinDate' ? 'var(--accent-primary)' : 'rgba(255,255,255,0.1)', color: groupBy === 'joinDate' ? '#000' : '#fff', border: 'none', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.2s ease' }}
          >
            入社年度順
          </button>
        </div>
      </div>

      <div className="member-list" style={{ marginTop: '20px', flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
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
              marginBottom: '10px',
              borderBottom: `1px solid rgba(255,255,255,0.1)`,
              paddingBottom: '4px'
            }}>
              <h3 style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', fontWeight: '800' }}>
                {groupTitle}
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>
                {posMembers.length} 名
              </span>
            </div>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: isMobile ? 'repeat(4, 1fr)' : 'repeat(auto-fill, minmax(110px, 1fr))',
              gap: isMobile ? '8px' : '12px' 
            }}>
              {posMembers
                .sort((a, b) => getPriority(a.position) - getPriority(b.position))
                .map(member => {
                  const roleColor = getPositionColor(member.position);
                  const fullName = `${member.lastName} ${member.firstName}`;
                  return (
                    <motion.div
                      key={member.id}
                      whileHover={{ y: -5, scale: 1.02 }}
                      onClick={() => onMemberClick(member)}
                      className="glass member-card-mini"
                      style={{
                        padding: isMobile ? '8px 4px' : '10px 6px',
                        cursor: 'pointer',
                        textAlign: 'center',
                        position: 'relative',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '10px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        transition: 'box-shadow 0.3s ease',
                        minWidth: 0
                      }}
                    >
                      <div style={{ 
                        position: 'absolute', 
                        top: 0, 
                        left: '50%', 
                        transform: 'translateX(-50%)',
                        width: '40%', 
                        height: '2px', 
                        background: roleColor,
                        borderRadius: '0 0 4px 4px'
                      }} />

                      {member.photo && (
                        <img 
                          src={member.photo} 
                          alt={member.lastName} 
                          style={{ 
                            width: isMobile ? '36px' : '40px', 
                            height: isMobile ? '36px' : '40px', 
                            borderRadius: '8px', 
                            marginBottom: '4px',
                            border: `1px solid ${roleColor}`,
                            objectFit: 'cover'
                          }} 
                        />
                      )}
                      
                      <div style={{ 
                        fontWeight: '700', 
                        fontSize: isMobile ? '0.7rem' : '0.75rem',
                        color: '#ffffff',
                        lineHeight: '1.2',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {fullName}
                      </div>
                      <div style={{ 
                        fontSize: isMobile ? '0.55rem' : '0.6rem', 
                        color: roleColor, 
                        fontWeight: '800', 
                        textTransform: 'uppercase',
                        marginTop: '2px',
                        letterSpacing: '0'
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

export default Sidebar;

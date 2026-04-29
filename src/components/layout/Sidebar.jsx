import React, { useState } from 'react';
import { Search, Users, ChevronRight, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const getPositionColor = (pos) => {
  if (!pos) return '#a0aec0';
  if (pos.includes('謾ｯ蠎鈴聞') || pos.includes('蜑ｯ謾ｯ蠎鈴聞')) return '#ffd700'; // 驥・  if (pos.includes('驛ｨ髟ｷ')) return '#ff4b4b'; // 襍､
  if (pos.includes('謇髟ｷ') || pos.includes('隱ｲ髟ｷ')) return '#4b7bff'; // 髱・  if (pos.includes('蜑ｯ髟ｷ')) return '#ff9500'; // 繧ｪ繝ｬ繝ｳ繧ｸ
  if (pos.includes('菫る聞')) return '#00e676'; // 邱・  return '#a0aec0'; // 繧ｹ繧ｿ繝・ヵ・医げ繝ｬ繝ｼ・・};


const Sidebar = ({ members, units, searchTerm, setSearchTerm, onMemberClick, onAddMember }) => {
  const isMobile = false;
  const [groupBy, setGroupBy] = useState('position');


  const filteredMembers = members.filter(m => {
    const fullName = `${m.lastName || ''} ${m.firstName || ''}`.toLowerCase();
    const unit = units.find(u => u.id === m.unitId)?.name.toLowerCase() || '';
    const posStr = (m.position || '').toLowerCase();
    const search = (searchTerm || '').toLowerCase();
    return fullName.includes(search) || posStr.includes(search) || unit.includes(search);
  });

  const getGroupTitle = (pos) => {
    if (!pos) return '繧ｹ繧ｿ繝・ヵ';
    if (pos.includes('謾ｯ蠎鈴聞') || pos.includes('蜑ｯ謾ｯ蠎鈴聞') || pos.includes('驛ｨ髟ｷ')) return '謾ｯ蠎鈴聞繝ｻ蜑ｯ謾ｯ蠎鈴聞繝ｻ驛ｨ髟ｷ';
    if (pos.includes('謇髟ｷ') || pos.includes('隱ｲ髟ｷ')) return '謇髟ｷ繝ｻ隱ｲ髟ｷ';
    if (pos.includes('蜑ｯ髟ｷ')) return '蜑ｯ髟ｷ';
    if (pos.includes('菫る聞')) return '菫る聞';
    return '繧ｹ繧ｿ繝・ヵ';
  };

  const getPriority = (pos) => {
    if (!pos) return 8;
    if (pos.includes('謾ｯ蠎鈴聞')) return 1;
    if (pos.includes('蜑ｯ謾ｯ蠎鈴聞')) return 2;
    if (pos.includes('驛ｨ髟ｷ')) return 3;
    if (pos.includes('謇髟ｷ')) return 4;
    if (pos.includes('隱ｲ髟ｷ')) return 5;
    if (pos.includes('蜑ｯ髟ｷ')) return 6;
    if (pos.includes('菫る聞')) return 7;
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
              {searchTerm ? `${filteredMembers.length} / ${members.length}蜷港 : `蜈ｨ ${members.length} 蜷港}
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
            <Plus size={14} /> 霑ｽ蜉
          </button>
        </div>

        <div className="search-container" style={{ position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }} />
          <input
            type="text"
            className="search-input"
            placeholder="蜷榊燕縲∝ｽｹ閨ｷ縲・Κ鄂ｲ..."
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
            蠖ｹ閨ｷ鬆・          </button>
          <button 
            onClick={() => setGroupBy('joinDate')}
            style={{ flex: 1, padding: '6px', fontSize: '0.8rem', borderRadius: '6px', background: groupBy === 'joinDate' ? 'var(--accent-primary)' : 'rgba(255,255,255,0.1)', color: groupBy === 'joinDate' ? '#000' : '#fff', border: 'none', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.2s ease' }}
          >
            蜈･遉ｾ蟷ｴ蠎ｦ鬆・          </button>
        </div>
      </div>

      <div className="member-list" style={{ marginTop: '20px', flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
        {Object.entries(
          filteredMembers.reduce((acc, m) => {
            let group;
            if (groupBy === 'joinDate') {
              const year = (m.joinDate && typeof m.joinDate === 'string') ? m.joinDate.split('-')[0] : m.joinDate;
              group = year ? `${year}蟷ｴ` : '荳肴・';
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
            if (groupA === '荳肴・') return 1;
            if (groupB === '荳肴・') return -1;
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
                {posMembers.length} 蜷・              </span>
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
                            border: `2px solid ${roleColor}`,
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
                        fontSize: '0.65rem', 
                        backgroundColor: roleColor,
                        color: '#ffffff', 
                        fontWeight: '900', 
                        textTransform: 'uppercase',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        letterSpacing: '0.02em',
                        boxShadow: `0 2px 8px ${roleColor}40`
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

export default Sidebar;          );
                })}

            </div>
            {/* 繝｢繝舌う繝ｫ縺ｮ荳矩Κ菴咏區・医せ繧ｯ繝ｭ繝ｼ繝ｫ蛻・ｌ髦ｲ豁｢・・*/}
            {isMobile && <div style={{ height: '120px' }} />}
          </div>
        ))}
      </div>
    </motion.div>


  );
};

export default Sidebar;

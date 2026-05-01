import React, { useState, useMemo } from 'react';
import { Search, Users, Plus, Calendar, BarChart3, Clock, Award, TrendingUp, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const getPositionColor = (pos = '') => {
  if (!pos) return '#a0aec0';
  const p = String(pos);
  if (p.includes('支店長')) return '#ffd700'; // 金
  if (p.includes('部長')) return '#ff4b4b';   // 赤
  if (p.includes('所長') || p.includes('課長')) return '#4b7bff'; // 青
  if (p.includes('副長')) return '#ff9500';   // オレンジ
  if (p.includes('係長')) return '#00e676';   // 緑
  return '#a0aec0'; // スタッフ（グレー）
};

const getPriority = (pos = '') => {
  if (!pos) return 1000;
  const p = String(pos);
  if (p === '支店長') return 1;
  if (p === '副支店長') return 2;
  if (p.includes('部長')) return 3;
  if (p.includes('所長') || p.includes('課長')) return 10;
  if (p.includes('副長')) return 20;
  if (p.includes('係長')) return 30;
  return 100;
};

const getGroupTitle = (pos = '') => {
  if (!pos) return 'スタッフ';
  const p = String(pos);
  if (p === '支店長' || p === '副支店長' || p.includes('部長')) return '支店長・副支店長・部長';
  if (p.includes('所長') || p.includes('課長')) return '所長・課長';
  if (p.includes('副長')) return '副長';
  if (p.includes('係長')) return '係長';
  return 'スタッフ';
};

const getPlaceholderPhoto = (id) => {
  const base = import.meta.env.BASE_URL || '/';
  const b = base.endsWith('/') ? base : `${base}/`;
  const placeholders = [
    `${b}placeholders/placeholder_einstein.png`,
    `${b}placeholders/placeholder_ryoma.png`,
    `${b}placeholders/placeholder_nobunaga.png`,
    `${b}placeholders/placeholder_curie.png`
  ];
  const sId = String(id || '0');
  const index = Math.abs(sId.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % placeholders.length;
  return placeholders[index].replace('//', '/');
};


const Sidebar_Desktop = ({ members = [], units = [], searchTerm = '', setSearchTerm, onMemberClick, onAddMember, activeTab, setActiveTab }) => {
  const [groupBy, setGroupBy] = useState('position');

  // 統計計算
  const stats = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const safeMembers = members || [];

    const ages = safeMembers.map(m => {
      if (!m.birthDate) return null;
      const birth = new Date(m.birthDate);
      return isNaN(birth.getTime()) ? null : currentYear - birth.getFullYear();
    }).filter(a => a !== null);

    const avgAge = ages.length ? Math.round(ages.reduce((a, b) => a + b, 0) / ages.length) : 0;

    const serviceYears = safeMembers.map(m => {
      const year = parseInt(m.joinDate);
      return isNaN(year) ? null : currentYear - year;
    }).filter(y => y !== null);
    const avgService = serviceYears.length ? (serviceYears.reduce((a, b) => a + b, 0) / serviceYears.length).toFixed(1) : 0;

    const generations = { '20代': 0, '30代': 0, '40代': 0, '50代': 0 };
    ages.forEach(age => {
      if (age < 30) generations['20代']++;
      else if (age < 40) generations['30代']++;
      else if (age < 50) generations['40代']++;
      else if (age < 60) generations['50代']++;
    });

    const genData = Object.entries(generations).map(([label, count]) => ({
      label, count, percent: safeMembers.length ? Math.round((count / safeMembers.length) * 100) : 0
    }));

    const posCounts = safeMembers.reduce((acc, m) => {
      const title = getGroupTitle(m.position);
      acc[title] = (acc[title] || 0) + 1;
      return acc;
    }, {});

    const posData = Object.entries(posCounts).map(([label, count]) => ({
      label, count,
      percent: safeMembers.length ? Math.round((count / safeMembers.length) * 100) : 0,
      priority: getPriority(label)
    })).sort((a, b) => a.priority - b.priority);

    const genderCounts = safeMembers.reduce((acc, m) => {
      const g = m.gender || '男性'; 
      if (g === '男性') acc.male++;
      else if (g === '女性') acc.female++;
      return acc;
    }, { male: 0, female: 0 });


    const malePercent = safeMembers.length ? Math.round((genderCounts.male / safeMembers.length) * 100) : 0;
    const femalePercent = safeMembers.length ? Math.round((genderCounts.female / safeMembers.length) * 100) : 0;
    const genderRatioLabel = `男 ${genderCounts.male}名 : 女 ${genderCounts.female}名`;
    const genderPercentLabel = `(${malePercent}% : ${femalePercent}%)`;

    return { avgAge, avgService, genData, posData, genderRatioLabel, genderPercentLabel };

  }, [members]);

  const filteredMembers = (members || []).filter(member => {
    const search = (searchTerm || '').toLowerCase();
    if (!search) return true;
    
    const fullName = `${member.lastName || ''} ${member.firstName || ''}`.toLowerCase();
    const pos = (member.position || '').toLowerCase();
    const unit = units.find(u => u.id === member.unitId);
    const unitName = unit ? unit.name.toLowerCase() : '';
    
    return fullName.includes(search) || (pos && pos.includes(search)) || (unitName && unitName.includes(search));
  });


  return (
    <motion.div 
      initial={{ x: -100, opacity: 0 }} 
      animate={{ x: 0, opacity: 1 }} 
      className="sidebar" 
      style={{ 
        padding: '0', 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        background: 'rgba(10, 12, 18, 0.75)',
        backdropFilter: 'blur(50px) saturate(200%)',
        borderRight: '1px solid rgba(255, 255, 255, 0.15)'
      }}
    >
      <div style={{ padding: '24px', flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

        {activeTab === 'members' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
                <h2 style={{ fontSize: '1.1rem', fontWeight: '900', color: '#ffffff', margin: 0 }}>MEMBER</h2>
                <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)' }}>{members.length}名</span>
              </div>
              <button onClick={onAddMember} className="save-btn" style={{ padding: '6px 12px', height: '32px', width: 'auto' }}><Plus size={14} /> 追加</button>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
              {['position', 'joinDate'].map(m => (
                <button key={m} onClick={() => setGroupBy(m)} style={{ flex: 1, padding: '10px', fontSize: '0.8rem', borderRadius: '10px', background: groupBy === m ? 'var(--accent-primary)' : 'rgba(255,255,255,0.05)', color: groupBy === m ? '#000' : '#fff', border: 'none', cursor: 'pointer', fontWeight: '800' }}>
                  {m === 'position' ? '役職別' : '入社年度別'}
                </button>
              ))}
            </div>

            <div className="member-list" style={{ flex: 1, overflowY: 'auto' }}>
              {Object.entries(
                (members || []).reduce((acc, m) => {
                  let group = groupBy === 'joinDate' ? (m.joinDate ? `${m.joinDate.split('-')[0]}年` : '不明') : getGroupTitle(m.position);
                  if (!acc[group]) acc[group] = [];
                  acc[group].push(m);
                  return acc;
                }, {})
              ).sort(([a], [b]) => {
                if (groupBy === 'joinDate') return a === '不明' ? 1 : b === '不明' ? -1 : b.localeCompare(a);
                const getGroupPriority = (title) => {
                  if (title === '支店長・副支店長・部長') return 1;
                  if (title === '所長・課長') return 10;
                  if (title === '副長') return 40;
                  if (title === '係長') return 60;
                  return 100;
                };

                return getGroupPriority(a) - getGroupPriority(b);
              }).map(([title, ms]) => (
                <div key={title} style={{ marginBottom: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '6px' }}>
                    <h3 style={{ fontSize: '0.9rem', color: 'var(--accent-primary)', fontWeight: '800' }}>{title}</h3>
                    <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>{ms.length}名</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '12px' }}>
                    {ms.sort((a, b) => {
                      const pA = getPriority(a.position); const pB = getPriority(b.position);
                      if (pA !== pB) return pA - pB;
                      return (a.joinDate || '9999').localeCompare(b.joinDate || '9999');
                    }).map(m => <MemberCard key={m.id} m={m} onMemberClick={onMemberClick} />)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'search' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: '900', color: '#ffffff', marginBottom: '24px' }}>SEARCH</h2>
            <div style={{ position: 'relative', marginBottom: '24px' }}>
              <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--accent-primary)' }} />
              <input type="text" autoFocus className="search-input" placeholder="名前、役職、部署で検索..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ paddingLeft: '44px', height: '50px', width: '100%', color: '#ffffff', borderRadius: '12px' }} />
            </div>
            <div className="member-list" style={{ flex: 1, overflowY: 'auto' }}>
              {searchTerm ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '12px' }}>
                  {filteredMembers.map(m => <MemberCard key={m.id} m={m} onMemberClick={onMemberClick} />)}
                </div>
              ) : (
                <div style={{ textAlign: 'center', opacity: 0.3, marginTop: '40px' }}><Search size={48} /><p>キーワードを入力してください</p></div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'stats' && (
          <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: '900', color: '#ffffff', marginBottom: '24px' }}>STATISTICS</h2>

            <div style={{ marginBottom: '16px' }}>
              <StatCard 
                label="組織構成サマリー" 
                total={members.length}
                value={stats.genderRatioLabel} 
                unit={stats.genderPercentLabel} 
                icon={Users} 
                color="var(--accent-primary)" 
                isSummary={true} 
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '24px' }}>
              <StatCard label="平均年齢" value={stats.avgAge} unit="歳" icon={Clock} color="#00e676" />
              <StatCard label="平均勤続" value={stats.avgService} unit="年" icon={TrendingUp} color="#ff9500" />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="glass" style={{ padding: '24px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }}>
                <h3 style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', marginBottom: '28px', fontWeight: '900', letterSpacing: '0.1em', textTransform: 'uppercase' }}>年代別構成</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
                  {stats.genData.map(gen => (
                    <div key={gen.label} style={{ position: 'relative' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: gen.percent > 0 ? '#00b09b' : 'rgba(255,255,255,0.2)' }} />
                          <span style={{ fontSize: '0.8rem', color: gen.percent > 0 ? '#fff' : 'rgba(255,255,255,0.4)', fontWeight: '800' }}>{gen.label}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                          <span style={{ fontSize: '1.1rem', color: gen.percent > 0 ? '#fff' : 'rgba(255,255,255,0.3)', fontWeight: '900', lineHeight: 1 }}>{gen.percent}</span>
                          <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', fontWeight: '800' }}>%</span>
                          <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.2)', fontWeight: '700', marginLeft: '4px' }}>({gen.count}名)</span>
                        </div>
                      </div>
                      <div style={{ height: '10px', background: 'rgba(0,0,0,0.2)', borderRadius: '5px', padding: '2px', border: '1px solid rgba(255,255,255,0.03)', position: 'relative', overflow: 'hidden' }}>
                        <motion.div 
                          initial={{ width: 0 }} 
                          animate={{ width: `${gen.percent}%` }} 
                          transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }} 
                          style={{ 
                            height: '100%', 
                            background: 'linear-gradient(90deg, #00b09b 0%, #96c93d 100%)', 
                            borderRadius: '3px',
                            boxShadow: gen.percent > 0 ? '0 0 15px rgba(0, 176, 155, 0.4)' : 'none'
                          }} 
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass" style={{ padding: '24px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }}>
                <h3 style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', marginBottom: '24px', fontWeight: '800', letterSpacing: '0.05em' }}>役職構成比</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
                  <div style={{
                    width: '110px', height: '110px', borderRadius: '50%', flexShrink: 0,
                    background: `conic-gradient(${stats.posData.reduce((acc, pos, idx) => {
                      const prevPercent = stats.posData.slice(0, idx).reduce((sum, p) => sum + p.percent, 0);
                      const mForColor = members.find(m => getGroupTitle(m.position) === pos.label);
                      const color = getPositionColor(mForColor?.position);
                      return `${acc}${idx > 0 ? ',' : ''} transparent ${prevPercent}% ${prevPercent + 0.8}%, ${color} ${prevPercent + 0.8}% ${prevPercent + pos.percent}%`;
                    }, '')
                      })`,
                    position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <div style={{ 
                      width: '74px', height: '74px', borderRadius: '50%', 
                      background: '#0d1117', display: 'flex', flexDirection: 'column', 
                      alignItems: 'center', justifyContent: 'center',
                      border: '1px solid rgba(255,255,255,0.05)'
                    }}>
                      <span style={{ fontSize: '1.1rem', fontWeight: '900', color: '#fff', lineHeight: 1 }}>{members.length}</span>
                      <span style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.4)', fontWeight: '800', marginTop: '2px' }}>TOTAL</span>
                    </div>
                  </div>

                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {stats.posData.map(pos => {
                      const mForColor = members.find(m => getGroupTitle(m.position) === pos.label);
                      const color = getPositionColor(mForColor?.position);
                      return (
                        <div key={pos.label} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: color }} />
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                              <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.7)', fontWeight: '700' }}>{pos.label}</span>
                              <span style={{ fontSize: '0.75rem', color: '#fff', fontWeight: '900' }}>{pos.percent}%</span>
                            </div>
                            <div style={{ height: '2px', background: 'rgba(255,255,255,0.05)', borderRadius: '1px', marginTop: '3px', overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: `${pos.percent}%`, background: color, opacity: 0.4 }} />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </motion.div>
  );
};

const StatCard = ({ label, value, unit, total, icon: Icon, color, isSummary }) => {
  if (isSummary) {
    const [maleText, femaleText] = String(value).split(':');
    const [maleP, femaleP] = String(unit).replace(/[()]/g, '').split(':').map(p => parseInt(p));

    return (
      <div className="glass" style={{ padding: '20px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255, 255, 255, 0.02)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: `${color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon size={20} color={color} />
            </div>
            <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', fontWeight: '800', letterSpacing: '0.02em' }}>{label}</span>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', fontWeight: '700' }}>{total}</span>
        </div>
        
        <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '8px' }}>
              <span style={{ fontSize: '1.8rem', fontWeight: '900', color: '#fff', lineHeight: 1 }}>{maleText.replace('男 ', '').trim()}</span>
              <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', fontWeight: '800' }}>名</span>
              <span style={{ fontSize: '0.85rem', color: color, fontWeight: '900', marginLeft: '2px' }}>{maleP}%</span>
            </div>
            <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
              <motion.div initial={{ width: 0 }} animate={{ width: `${maleP}%` }} transition={{ duration: 1.5, ease: "easeOut" }} style={{ height: '100%', background: 'linear-gradient(90deg, #4b7bff, #32a1fa)', borderRadius: '3px' }} />
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '8px' }}>
              <span style={{ fontSize: '1.8rem', fontWeight: '900', color: '#fff', lineHeight: 1 }}>{femaleText.replace('女 ', '').trim()}</span>
              <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', fontWeight: '800' }}>名</span>
              <span style={{ fontSize: '0.85rem', color: '#ff4b4b', fontWeight: '900', marginLeft: '2px' }}>{femaleP}%</span>
            </div>
            <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
              <motion.div initial={{ width: 0 }} animate={{ width: `${femaleP}%` }} transition={{ duration: 1.5, ease: "easeOut" }} style={{ height: '100%', background: 'linear-gradient(90deg, #f54242, #ff4b4b)', borderRadius: '3px' }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass" style={{ 
      padding: '16px 20px', 
      borderRadius: '20px', 
      border: '1px solid rgba(255,255,255,0.08)', 
      background: 'rgba(255,255,255,0.02)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '12px',
      position: 'relative'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={18} color={color} />
        </div>
        <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', fontWeight: '800', letterSpacing: '0.02em' }}>{label}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
        <span style={{ fontSize: '1.6rem', fontWeight: '900', color: '#fff', lineHeight: 1 }}>{value}</span>
        <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', fontWeight: '800' }}>{unit}</span>
      </div>
    </div>
  );
};


const MemberCard = ({ m, onMemberClick }) => {
  const roleColor = getPositionColor(m.position);
  
  const getGlowStyle = (pos) => {
    const p = pos ? String(pos) : '';
    if (p === '支店長') return { border: '1px solid rgba(255, 215, 0, 0.3)' };
    if (p === '副支店長') return { border: '1px solid rgba(192, 192, 192, 0.3)' };
    if (p.includes('部長')) return { border: '1px solid rgba(0, 255, 204, 0.3)' };
    return { border: '1px solid rgba(255, 255, 255, 0.1)' };
  };

  return (
    <motion.div 
      whileHover={{ y: -8, scale: 1.05 }} 
      onClick={() => onMemberClick(m)} 
      className="glass" 
      style={{ 
        padding: '14px 10px', 
        cursor: 'pointer', 
        textAlign: 'center', 
        position: 'relative', 
        borderRadius: '18px', 
        transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        background: 'rgba(255, 255, 255, 0.04)',
        backdropFilter: 'blur(10px)',
        ...getGlowStyle(m.position)
      }}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '3px', background: roleColor, borderRadius: '20px 20px 0 0', opacity: 0.8 }} />
      <div style={{ width: '64px', height: '64px', margin: '0 auto 12px', borderRadius: '50%', overflow: 'hidden', border: `2px solid ${roleColor}44`, background: 'rgba(0,0,0,0.2)', boxShadow: `0 8px 16px rgba(0,0,0,0.3)` }}>
        <img src={m.photo || getPlaceholderPhoto(m.id)} alt={m.lastName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
      <div style={{ fontWeight: '800', fontSize: '0.9rem', color: '#fff', marginBottom: '4px', letterSpacing: '0.02em' }}>{m.lastName} {m.firstName}</div>
      <div style={{ fontSize: '0.7rem', color: roleColor, fontWeight: '900', opacity: 0.9, letterSpacing: '0.05em' }}>{m.position}</div>
    </motion.div>
  );
};


export default Sidebar_Desktop;

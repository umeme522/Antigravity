import React, { useState } from 'react';
import { Search, Users, Plus, Calendar, BarChart3, Clock, Award, TrendingUp } from 'lucide-react';
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

const getPriority = (pos) => {
  if (!pos) return 1000;
  if (pos === '支店長') return 1;
  if (pos === '副支店長') return 2;
  if (pos.includes('部長')) return 3;
  if (pos.includes('所長') || pos.includes('課長')) return 10;
  if (pos.includes('副長')) return 20;
  if (pos.includes('係長')) return 30;
  return 100;
};


// --- 統計計算用ヘルパー ---
const calculateStats = (members) => {
  const currentYear = new Date().getFullYear();
  
  // 年齢計算
  const ages = members.map(m => {
    if (!m.birthDate) return null;
    const birth = new Date(m.birthDate);
    if (isNaN(birth.getTime())) return null;
    let age = currentYear - birth.getFullYear();
    return age;
  }).filter(a => a !== null);
  
  const avgAge = ages.length ? Math.round(ages.reduce((a, b) => a + b, 0) / ages.length) : 0;

  // 勤続年数計算
  const serviceYears = members.map(m => {
    const year = parseInt(m.joinDate);
    if (isNaN(year)) return null;
    return currentYear - year;
  }).filter(y => y !== null);

  const avgService = serviceYears.length ? (serviceYears.reduce((a, b) => a + b, 0) / serviceYears.length).toFixed(1) : 0;

  // 年代別構成
  const generations = { '20代': 0, '30代': 0, '40代': 0, '50代': 0 };
  ages.forEach(age => {
    if (age < 30) generations['20代']++;
    else if (age < 40) generations['30代']++;
    else if (age < 50) generations['40代']++;
    else if (age < 60) generations['50代']++;
  });

  const genData = Object.entries(generations).map(([label, count]) => ({
    label,
    count,
    percent: members.length ? Math.round((count / members.length) * 100) : 0
  }));

  // 役職別構成（指数表）
  const posCounts = members.reduce((acc, m) => {
    const title = getGroupTitle(m.position);
    acc[title] = (acc[title] || 0) + 1;
    return acc;
  }, {});

  const posData = Object.entries(posCounts)
    .map(([label, count]) => ({
      label,
      count,
      percent: members.length ? Math.round((count / members.length) * 100) : 0,
      priority: getPriority(members.find(m => getGroupTitle(m.position) === label)?.position || '')
    }))
    .sort((a, b) => a.priority - b.priority);

  return { avgAge, avgService, genData, posData };
};


const Sidebar_Desktop = ({ members, units, searchTerm, setSearchTerm, onMemberClick, onAddMember, activeTab, setActiveTab }) => {
  const [groupBy, setGroupBy] = useState('position');
  const stats = calculateStats(members);

  const filteredMembers = members.filter(member => {
    if (activeTab === 'members') return true;
    const fullName = `${member.lastName} ${member.firstName}`.toLowerCase();
    const pos = (member.position || '').toLowerCase();
    const search = searchTerm.toLowerCase();
    const unitName = (units.find(u => u.id === member.unitId)?.name || '').toLowerCase();
    return fullName.includes(search) || pos.includes(search) || unitName.includes(search);
  });

  const getGroupTitle = (pos) => {
    if (pos === '支店長') return '支店長';
    if (pos === '副支店長') return '副支店長';
    if (pos.includes('部長')) return '部長';
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
        
        {/* モード: メンバー一覧 */}
        {activeTab === 'members' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
                <h2 style={{ fontSize: '1.1rem', fontWeight: '900', color: '#ffffff', margin: 0, letterSpacing: '0.05em' }}>東日本支店メンバー</h2>
                <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', fontWeight: '600' }}>全 {members.length} 名</span>
              </div>

              <button onClick={onAddMember} className="save-btn" style={{ padding: '6px 14px', fontSize: '0.75rem', width: 'auto', height: '32px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Plus size={14} /> 追加
              </button>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
              {['position', 'joinDate'].map(mode => (
                <button 
                  key={mode}
                  onClick={() => setGroupBy(mode)}
                  style={{ flex: 1, padding: '10px', fontSize: '0.8rem', borderRadius: '10px', background: groupBy === mode ? 'var(--accent-primary)' : 'rgba(255,255,255,0.05)', color: groupBy === mode ? '#000' : '#fff', border: 'none', cursor: 'pointer', fontWeight: '800' }}
                >
                  {mode === 'position' ? '役職別' : '入社年度別'}
                </button>
              ))}
            </div>

            <div className="member-list" style={{ flex: 1, overflowY: 'auto' }}>
              {Object.entries(
                members.reduce((acc, m) => {
                  let group = groupBy === 'joinDate' ? (m.joinDate ? `${m.joinDate.split('-')[0]}年` : '不明') : getGroupTitle(m.position);
                  if (!acc[group]) acc[group] = [];
                  acc[group].push(m);
                  return acc;
                }, {})
              )
              .sort(([a], [b]) => {
                if (groupBy === 'joinDate') return a === '不明' ? 1 : b === '不明' ? -1 : b.localeCompare(a);
                const prioA = getPriority(members.find(m => getGroupTitle(m.position) === a)?.position || '');
                const prioB = getPriority(members.find(m => getGroupTitle(m.position) === b)?.position || '');
                return prioA - prioB;
              })
              .map(([title, posMembers]) => (
                <div key={title} style={{ marginBottom: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '6px' }}>
                    <h3 style={{ fontSize: '0.9rem', color: 'var(--accent-primary)', fontWeight: '800' }}>{title}</h3>
                    <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)' }}>{posMembers.length}名</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '12px' }}>
                    {posMembers.sort((a,b) => {
                      const pA = getPriority(a.position); const pB = getPriority(b.position);
                      if (pA !== pB) return pA - pB;
                      return (a.joinDate||'9999').localeCompare(b.joinDate||'9999');
                    }).map(m => <MemberCard key={m.id} m={m} onMemberClick={onMemberClick} />)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* モード: 検索 */}
        {activeTab === 'search' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: '900', color: '#ffffff', marginBottom: '24px' }}>SEARCH</h2>
            <div style={{ position: 'relative', marginBottom: '24px' }}>
              <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--accent-primary)' }} />
              <input 
                type="text" autoFocus className="search-input" placeholder="名前、役職、部署で検索..." 
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} 
                style={{ paddingLeft: '44px', height: '50px', width: '100%', color: '#ffffff', borderRadius: '12px' }} 
              />
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

        {/* モード: データ（統計） */}
        {activeTab === 'stats' && (
          <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: '900', color: '#ffffff', marginBottom: '24px' }}>STATISTICS</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '24px' }}>
              <StatCard label="総人数" value={members.length} unit="名" icon={Users} color="#4b7bff" />
              <StatCard label="平均年齢" value={stats.avgAge} unit="歳" icon={Clock} color="#00e676" />
              <StatCard label="平均勤続" value={stats.avgService} unit="年" icon={TrendingUp} color="#ff9500" />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="glass" style={{ padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <h3 style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', marginBottom: '16px', fontWeight: 'bold' }}>年代別構成</h3>
                {stats.genData.map(gen => (
                  <div key={gen.label} style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.75rem' }}>
                      <span style={{ color: 'white' }}>{gen.label}</span>
                      <span style={{ color: 'rgba(255,255,255,0.4)' }}>{gen.count}名 ({gen.percent}%)</span>
                    </div>
                    <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                      <motion.div initial={{ width: 0 }} animate={{ width: `${gen.percent}%` }} transition={{ duration: 1 }} style={{ height: '100%', background: 'var(--accent-primary)', borderRadius: '3px' }} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="glass" style={{ padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <h3 style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', marginBottom: '16px', fontWeight: 'bold' }}>役職構成比</h3>
                {stats.posData.map(pos => (
                  <div key={pos.label} style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.75rem' }}>
                      <span style={{ color: 'white' }}>{pos.label}</span>
                      <span style={{ color: 'rgba(255,255,255,0.4)' }}>{pos.count}名 ({pos.percent}%)</span>
                    </div>
                    <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                      <motion.div 
                        initial={{ width: 0 }} 
                        animate={{ width: `${pos.percent}%` }} 
                        transition={{ duration: 1 }} 
                        style={{ height: '100%', background: getPositionColor(members.find(m => getGroupTitle(m.position) === pos.label)?.position), borderRadius: '3px' }} 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}


      </div>
    </motion.div>
  );
};

const StatCard = ({ label, value, unit, icon: Icon, color }) => (
  <div className="glass" style={{ padding: '16px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.08)' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
      <div style={{ padding: '6px', borderRadius: '8px', background: `${color}20`, color: color }}><Icon size={16} /></div>
      <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', fontWeight: 'bold' }}>{label}</span>
    </div>
    <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
      <span style={{ fontSize: '1.4rem', fontWeight: '900', color: 'white' }}>{value}</span>
      <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)' }}>{unit}</span>
    </div>
  </div>
);

const MemberCard = ({ m, onMemberClick }) => {
  const roleColor = getPositionColor(m.position);
  return (
    <motion.div whileHover={{ y: -5, scale: 1.05 }} onClick={() => onMemberClick(m)} className="glass" style={{ padding: '12px 8px', cursor: 'pointer', textAlign: 'center', position: 'relative', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '3px', background: roleColor, borderRadius: '12px 12px 0 0' }} />
      {m.photo && <img src={m.photo} alt={m.lastName} style={{ width: '48px', height: '48px', borderRadius: '10px', marginBottom: '8px', objectFit: 'cover', objectPosition: 'center' }} />}
      <div style={{ fontWeight: '700', fontSize: '0.8rem', color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.lastName} {m.firstName}</div>
      <div style={{ fontSize: '0.65rem', color: roleColor, fontWeight: '900' }}>{m.position}</div>
    </motion.div>
  );
};

export default Sidebar_Desktop;

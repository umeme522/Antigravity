import React, { useMemo, useState, useEffect } from 'react';
import ReactFlow, {
  Background,
  Handle,
  Position,
  useReactFlow,
  ReactFlowProvider
} from 'reactflow';
import 'reactflow/dist/style.css';
import { ChevronDown } from 'lucide-react';

const getPositionColor = (pos) => {
  if (!pos) return '#a0aec0';
  if (pos.includes('支店長') || pos.includes('副支店長')) return '#ffd700';
  if (pos.includes('部長')) return '#ff4b4b';
  if (pos.includes('所長') || pos.includes('課長')) return '#4b7bff';
  if (pos.includes('副長')) return '#ff9500';
  if (pos.includes('係長')) return '#00e676';
  return '#a0aec0';
};

// --- 統合ノード (部署 + リーダー達) ---
const UnitNode = ({ data }) => {
  const { label, level, leaders, isExpanded, onClick, onMemberClick, hasChildren } = data;
  const unitBg = level === 0 ? 'linear-gradient(135deg, #ffd700, #b8860b)' : 'linear-gradient(135deg, #667eea, #764ba2)';
  
  return (
    <div style={{ width: '280px', position: 'relative' }}>
      <Handle type="target" position={Position.Top} style={{ background: 'transparent', border: 'none' }} />
      
      {/* 部署カード */}
      <div
        onClick={onClick}
        style={{
          padding: '16px 20px',
          background: unitBg,
          borderRadius: leaders && leaders.length > 0 ? '16px 16px 0 0' : '16px',
          color: 'white',
          fontWeight: '900',
          fontSize: '1.1rem',
          textAlign: 'center',
          cursor: 'pointer',
          boxShadow: '0 10px 20px rgba(0,0,0,0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          border: '1px solid rgba(255,255,255,0.2)',
          zIndex: 2
        }}
      >
        <span style={{ flex: 1 }}>{label}</span>
        {hasChildren && (
          <div style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.4s', opacity: 0.7 }}>
            <ChevronDown size={18} />
          </div>
        )}
      </div>

      {/* リーダー達 (大久保・堀内など複数対応) */}
      {leaders && leaders.map((leader, idx) => (
        <div
          key={leader.id}
          onClick={() => onMemberClick(leader)}
          className="glass"
          style={{
            padding: '12px 15px',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: idx === leaders.length - 1 ? '0 0 16px 16px' : '0', // 最後だけ角を丸く
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderTop: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            cursor: 'pointer',
            backdropFilter: 'blur(10px)',
          }}
        >
          {leader.photo && (
            <img src={leader.photo} alt={leader.lastName} style={{ width: '44px', height: '44px', borderRadius: '10px', objectFit: 'cover' }} />
          )}
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: '700', fontSize: '0.95rem', color: '#fff' }}>{leader.lastName} {leader.firstName}</div>
            <div style={{ fontSize: '0.7rem', color: getPositionColor(leader.position), fontWeight: '900', marginTop: '2px' }}>{leader.position}</div>
          </div>
        </div>
      ))}

      <Handle type="source" position={Position.Bottom} style={{ background: 'transparent', border: 'none' }} />
    </div>
  );
};

// --- 一般メンバーノード ---
const MemberNode = ({ data }) => {
  const { member, onClick } = data;
  const roleColor = getPositionColor(member.position);
  return (
    <div
      className="glass"
      onClick={() => onClick(member)}
      style={{
        padding: '12px 15px',
        width: '260px',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        cursor: 'pointer',
        backdropFilter: 'blur(12px)',
      }}
    >
      <Handle type="target" position={Position.Top} style={{ background: 'transparent', border: 'none' }} />
      {member.photo && (
        <img src={member.photo} alt={member.lastName} style={{ width: '44px', height: '44px', borderRadius: '10px', objectFit: 'cover' }} />
      )}
      <div>
        <div style={{ fontWeight: '700', fontSize: '0.95rem', color: '#fff' }}>{member.lastName} {member.firstName}</div>
        <div style={{ fontSize: '0.7rem', color: roleColor, fontWeight: '900', marginTop: '2px' }}>{member.position}</div>
      </div>
      <Handle type="source" position={Position.Bottom} style={{ background: 'transparent', border: 'none' }} />
    </div>
  );
};

const nodeTypes = { unit: UnitNode, member: MemberNode };

const OrgChart_Desktop = ({ units, members, onMemberClick }) => {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  // 初期展開を主要部署（レベル1）までに制限
  const [expandedUnits, setExpandedUnits] = useState(new Set(['u1', 'u2', 'u_dept2', 'u_dept3', 'u_admin', 'u_innov']));


  const { nodes: visibleNodes, edges: visibleEdges } = useMemo(() => {
    const unitMap = {};
    units.forEach(u => { unitMap[u.id] = { ...u, children: [], members: [] }; });
    
    // 役職順にソート
    const sortedMembers = [...members].sort((a, b) => {
      const getPrio = (p) => {
        if (p.includes('支店長')) return 1;
        if (p.includes('副支店長')) return 2;
        if (p.includes('部長')) return 3;
        if (p.includes('所長') || p.includes('課長')) return 4;
        return 100;
      };
      return getPrio(a.position) - getPrio(b.position);
    });

    sortedMembers.forEach(m => { if (unitMap[m.unitId]) unitMap[m.unitId].members.push(m); });
    units.forEach(u => { if (u.parentId && unitMap[u.parentId]) unitMap[u.parentId].children.push(u.id); });

    const vNodes = [];
    const vEdges = [];
    const VERTICAL_GAP = 200;
    const HORIZONTAL_GAP = 60;
    const MEMBER_GAP = 110;

    const subtreeSizeMap = {};

    const calculateSize = (unitId) => {
      const u = unitMap[unitId];
      const isExpanded = expandedUnits.has(unitId);
      
      // リーダー（統合される人）と一般メンバーを分離
      const leadersCount = u.members.length > 0 ? (u.members[0].position.includes('スタッフ') ? 0 : (u.members.length > 1 && (u.members[1].position.includes('副支店長') || u.members[1].position.includes('部長')) ? 2 : 1)) : 0;
      const leaders = u.members.slice(0, leadersCount);
      const generalMembers = u.members.slice(leadersCount);
      
      const mHeight = isExpanded ? (generalMembers.length * MEMBER_GAP) + 60 : 0;
      const unitNodeHeight = 60 + (leaders.length * 68);

      if (!isExpanded || u.children.length === 0) {
        subtreeSizeMap[unitId] = { width: 280, height: unitNodeHeight + mHeight };
        return subtreeSizeMap[unitId];
      }

      const cSizes = u.children.map(calculateSize);
      const w = Math.max(280, cSizes.reduce((a, s) => a + s.width, 0) + (u.children.length - 1) * HORIZONTAL_GAP);
      const h = unitNodeHeight + mHeight + VERTICAL_GAP + Math.max(...cSizes.map(s => s.height));
      subtreeSizeMap[unitId] = { width: w, height: h };
      return subtreeSizeMap[unitId];
    };

    const layout = (unitId, x, y, level = 0) => {
      const u = unitMap[unitId];
      const isExpanded = expandedUnits.has(unitId);
      const size = subtreeSizeMap[unitId];
      
      // リーダー抽出ロジック（支店長・副支店長・部長などは統合）
      const leadersCount = u.members.length > 0 ? (u.members[0].position.includes('スタッフ') ? 0 : (u.members.length > 1 && (u.members[1].position.includes('副支店長') || u.members[1].position.includes('部長')) ? 2 : 1)) : 0;
      const leaders = u.members.slice(0, leadersCount);
      const generalMembers = u.members.slice(leadersCount);

      vNodes.push({
        id: unitId,
        type: 'unit',
        data: { 
          label: u.name, 
          level, 
          leaders, 
          isExpanded, 
          hasChildren: u.children.length > 0 || generalMembers.length > 0,
          onClick: () => toggleUnit(unitId),
          onMemberClick
        },
        position: { x: x - 140, y },
      });

      if (u.parentId) {
        vEdges.push({ id: `e-${u.parentId}-${unitId}`, source: u.parentId, target: unitId, type: 'smoothstep', style: { strokeDasharray: '5,5' } });
      }

      const unitHeight = 60 + (leaders.length * 68);
      if (isExpanded) {
        generalMembers.forEach((m, i) => {
          const mId = `m-${m.id}-at-${unitId}`;
          vNodes.push({
            id: mId,
            type: 'member',
            data: { member: m, onClick: onMemberClick },
            position: { x: x - 130, y: y + unitHeight + 40 + (i * MEMBER_GAP) },
          });
          vEdges.push({ id: `e-${unitId}-${mId}`, source: unitId, target: mId, type: 'smoothstep' });
        });

        const totalMHeight = generalMembers.length * MEMBER_GAP;
        let startX = x - size.width / 2;
        u.children.forEach(cId => {
          const cSize = subtreeSizeMap[cId];
          layout(cId, startX + cSize.width / 2, y + unitHeight + totalMHeight + VERTICAL_GAP, level + 1);
          startX += cSize.width + HORIZONTAL_GAP;
        });
      }
    };

    const root = units.find(u => !u.parentId);
    if (root) { calculateSize(root.id); layout(root.id, 0, 0); }
    return { nodes: vNodes, edges: vEdges };
  }, [units, members, expandedUnits, onMemberClick]);

  useEffect(() => { setNodes(visibleNodes); setEdges(visibleEdges); }, [visibleNodes, visibleEdges]);

  const toggleUnit = (uid) => {
    setExpandedUnits(prev => {
      const n = new Set(prev);
      n.has(uid) ? n.delete(uid) : n.add(uid);
      return n;
    });
  };

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} fitView minZoom={0.1} maxZoom={2} nodesDraggable={false}>
        <Background color="#fff" opacity={0.05} />
      </ReactFlow>

      {/* プレミアム・ズームコントロール */}
      <div style={{ 
        position: 'absolute', 
        bottom: '24px', 
        right: '24px', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '8px', 
        zIndex: 1000 
      }}>
        <ZoomControls />
      </div>
    </div>
  );
};

const ZoomControls = () => {
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  const btnStyle = {
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    backdropFilter: 'blur(10px)',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
  };

  return (
    <>
      <motion.button whileHover={{ scale: 1.1, background: 'rgba(255,255,255,0.1)' }} whileTap={{ scale: 0.9 }} onClick={() => zoomIn()} style={btnStyle} title="拡大">+</motion.button>
      <motion.button whileHover={{ scale: 1.1, background: 'rgba(255,255,255,0.1)' }} whileTap={{ scale: 0.9 }} onClick={() => zoomOut()} style={btnStyle} title="縮小">-</motion.button>
      <motion.button 
        whileHover={{ scale: 1.1, background: 'rgba(255,255,255,0.1)', color: 'var(--accent-primary)' }} 
        whileTap={{ scale: 0.9 }} 
        onClick={() => fitView({ duration: 800 })} 
        style={{ ...btnStyle, fontSize: '0.7rem', fontWeight: 'bold' }} 
        title="全体を表示"
      >
        RESET
      </motion.button>
    </>
  );
};


const OrgChart_DesktopWrapper = (props) => (
  <ReactFlowProvider><OrgChart_Desktop {...props} /></ReactFlowProvider>
);

export default OrgChart_DesktopWrapper;

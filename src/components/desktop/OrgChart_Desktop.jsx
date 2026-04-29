import React, { useMemo, useState, useEffect } from 'react';
import ReactFlow, {
  Background,
  Handle,
  Position,
  useReactFlow,
  ReactFlowProvider,
  useStore
} from 'reactflow';
import 'reactflow/dist/style.css';
import { ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';

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
  const { label, level, leaders, isExpanded, onClick, onMemberClick, hasGeneralMembers } = data;
  
  let unitBg = 'linear-gradient(135deg, #667eea, #764ba2)'; // Default Purple
  if (level === 0) {
    unitBg = 'linear-gradient(135deg, #ffd700, #b8860b)'; // HQ Gold
  } else if (label.includes('営業所') || label.includes('流通') || label.includes('センター')) {
    unitBg = 'linear-gradient(135deg, #00b09b, #96c93d)'; // Unit Emerald
  }

  
  return (
    <div style={{ width: '280px', position: 'relative' }}>
      <Handle type="target" position={Position.Top} style={{ background: 'transparent', border: 'none' }} />
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
        {hasGeneralMembers && (
          <div style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform(0.4s)', opacity: 0.7 }}>
            <ChevronDown size={18} />
          </div>
        )}
      </div>

      {leaders && leaders.map((leader, idx) => (
        <div
          key={`${leader.id}-${idx}`}
          onClick={() => onMemberClick(leader)}
          className="glass"
          style={{
            padding: '12px 15px',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: idx === leaders.length - 1 ? '0 0 16px 16px' : '0',
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
  const [expandedUnits, setExpandedUnits] = useState(new Set(['u1']));

  const { nodes: visibleNodes, edges: visibleEdges } = useMemo(() => {
    const unitMap = {};
    units.forEach(u => { unitMap[u.id] = { ...u, children: [], members: [] }; });
    
    const isLeader = (m, unit) => {
      const p = m.position;
      const unitMembers = members.filter(mem => mem.unitId === unit.id);
      
      // その部署に一人しかいない場合は、その人がリーダー（トップ）
      if (unitMembers.length === 1 && unitMembers[0].id === m.id) return true;

      // 支店長・副支店長は常にリーダー
      if (p.includes('支店長') || p.includes('副支店長')) return true;

      if (m.additionalUnitIds && m.additionalUnitIds.includes(unit.id)) return true;
      const minPrio = Math.min(...unitMembers.map(mem => {
          const pos = mem.position;
          if (pos.includes('支店長')) return 1;
          if (pos.includes('副支店長')) return 2;
          if (pos.includes('部長')) return 3;
          if (pos.includes('所長') || pos.includes('課長')) return 4;
          return 100;
      }));
      const myPrio = p.includes('支店長') ? 1 : (p.includes('副支店長') ? 2 : (p.includes('部長') ? 3 : (p.includes('所長') || p.includes('課長') ? 4 : 100)));
      return myPrio === minPrio && myPrio < 100;
    };

    members.forEach(m => {
      if (unitMap[m.unitId]) unitMap[m.unitId].members.push(m);
      if (m.additionalUnitIds) {
        m.additionalUnitIds.forEach(aid => { if (unitMap[aid]) unitMap[aid].members.push(m); });
      }
    });

    units.forEach(u => { if (u.parentId && unitMap[u.parentId]) unitMap[u.parentId].children.push(u.id); });

    const vNodes = [];
    const vEdges = [];
    const VERTICAL_GAP = 220;
    const HORIZONTAL_GAP = 70;
    const MEMBER_GAP = 110;

    const subtreeSizeMap = {};

    const calculateSize = (unitId) => {
      const u = unitMap[unitId];
      const isExpanded = expandedUnits.has(unitId);
      const leaders = u.members.filter(m => isLeader(m, u)).sort((a,b) => {
          const getP = (p) => p.includes('支店長') ? 1 : (p.includes('副支店長') ? 2 : 3);
          return getP(a.position) - getP(b.position);
      });
      const generalMembers = u.members.filter(m => !isLeader(m, u));
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
      const leaders = u.members.filter(m => isLeader(m, u)).sort((a,b) => {
          const getP = (p) => p.includes('支店長') ? 1 : (p.includes('副支店長') ? 2 : 3);
          return getP(a.position) - getP(b.position);
      });
      const generalMembers = u.members.filter(m => !isLeader(m, u));

      vNodes.push({
        id: unitId,
        type: 'unit',
        data: { label: u.name, level, leaders, isExpanded, hasGeneralMembers: generalMembers.length > 0 || u.children.length > 0, onClick: () => toggleUnit(unitId), onMemberClick },
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

  const { fitBounds, getNodes } = useReactFlow();
  const toggleUnit = (uid) => {
    setExpandedUnits(prev => {
      const n = new Set(prev);
      const isExpanding = !n.has(uid);
      if (isExpanding) n.add(uid);
      else n.delete(uid);
      return n;
    });

    // 展開時にその「サブツリー全体」が収まるように調整
    setTimeout(() => {
      const allNodes = getNodes();
      const parentNode = allNodes.find(n => n.id === uid);
      if (!parentNode) return;

      // この部署に属する全てのノード（ユニットとメンバー）を抽出
      const branchNodes = allNodes.filter(n => {
        return n.id === uid || n.id.startsWith(`m-${uid}`) || n.id.includes(`at-${uid}`);
      });

      // さらに、その部署の直下の子供ユニットも探す（簡易的な1階層チェック）
      const childUnits = allNodes.filter(n => {
        const u = units.find(unit => unit.id === n.id);
        return u && u.parentId === uid;
      });

      const targets = [...branchNodes, ...childUnits];
      if (targets.length > 0) {
        const minX = Math.min(...targets.map(n => n.position.x));
        const maxX = Math.max(...targets.map(n => n.position.x + 280));
        const minY = Math.min(...targets.map(n => n.position.y));
        const maxY = Math.max(...targets.map(n => n.position.y + 200));

        fitBounds(
          { x: minX, y: minY, width: maxX - minX, height: maxY - minY },
          { padding: 100, duration: 800 }
        );
      }
    }, 100);
  };


  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} fitView minZoom={0.1} maxZoom={2} nodesDraggable={false}>
        <Background color="#fff" opacity={0.05} />
      </ReactFlow>

      <div style={{ position: 'absolute', bottom: '24px', right: '24px', display: 'flex', flexDirection: 'column', gap: '8px', zIndex: 1000 }}>
        <ZoomControls />
      </div>
    </div>
  );
};

const ZoomControls = () => {
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  // ReactFlowのストアから現在のズーム値を取得
  const zoom = useStore((s) => s.transform[2]);
  const zoomPercent = Math.round(zoom * 100);

  const btnStyle = { width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', backdropFilter: 'blur(10px)', transition: 'all 0.2s ease', boxShadow: '0 4px 15px rgba(0,0,0,0.3)' };
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
      {/* ズーム倍率表示 */}
      <div className="glass" style={{ 
        padding: '6px 10px', 
        fontSize: '0.75rem', 
        fontWeight: '900', 
        color: 'var(--accent-primary)', 
        borderRadius: '8px', 
        marginBottom: '4px',
        minWidth: '50px',
        textAlign: 'center'
      }}>
        {zoomPercent}%
      </div>
      
      <motion.button whileHover={{ scale: 1.1, background: 'rgba(255,255,255,0.1)' }} whileTap={{ scale: 0.9 }} onClick={() => zoomIn()} style={btnStyle}>+</motion.button>
      <motion.button whileHover={{ scale: 1.1, background: 'rgba(255,255,255,0.1)' }} whileTap={{ scale: 0.9 }} onClick={() => zoomOut()} style={btnStyle}>-</motion.button>
      <motion.button whileHover={{ scale: 1.1, background: 'rgba(255,255,255,0.1)', color: 'var(--accent-primary)' }} whileTap={{ scale: 0.9 }} onClick={() => fitView({ duration: 800 })} style={{ ...btnStyle, fontSize: '0.7rem', fontWeight: 'bold' }}>RESET</motion.button>
    </div>
  );
};

const OrgChart_DesktopWrapper = (props) => (
  <ReactFlowProvider><OrgChart_Desktop {...props} /></ReactFlowProvider>
);

export default OrgChart_DesktopWrapper;

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
  const p = String(pos);
  if (p.includes('支店長') || p.includes('副支店長')) return '#ffd700';
  if (p.includes('部長')) return '#ff4b4b';
  if (p.includes('所長') || p.includes('課長')) return '#4b7bff';
  if (p.includes('副長')) return '#ff9500';
  if (p.includes('係長')) return '#00e676';
  return '#a0aec0';
};

// --- 統合ノード (部署 + リーダー達) ---
const UnitNode = ({ data }) => {
  const { label, level, leaders, isExpanded, onClick, onMemberClick, hasGeneralMembers } = data;

  let unitBg = 'linear-gradient(135deg, #667eea, #764ba2)'; // Default Purple (Main Depts)
  let textColor = '#ffffff';

  // 判定ロジックの強化
  const isHQ = level === 0;
  const isMainDept = level === 1 && (label.includes('部') && !label.includes('営業所') && !label.includes('流通'));
  const isRegional = !isHQ && !isMainDept;

  if (isHQ) {
    unitBg = 'linear-gradient(135deg, #ffd700, #b8860b)'; // HQ Gold
    textColor = '#000000';
  } else if (isRegional) {
    unitBg = 'linear-gradient(135deg, #00b09b, #96c93d)'; // Unit Emerald
    textColor = '#000000';
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
          color: textColor,
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
          <div style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.4s', opacity: 0.7 }}>
            <ChevronDown size={18} />
          </div>
        )}
      </div>

      {leaders && leaders.map((leader, idx) => (
        <div
          key={`${leader.id}-${idx}`}
          onClick={() => onMemberClick(leader)}
          style={{
            padding: '12px 15px',
            paddingLeft: '35px',
            background: '#1a1d26',
            borderRadius: idx === leaders.length - 1 ? '0 0 16px 16px' : '0',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderTop: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            gap: '20px',
            cursor: 'pointer',
          }}
        >
          {leader.photo && (
            <img src={leader.photo} alt={leader.lastName} style={{ width: '44px', height: '44px', borderRadius: '10px', objectFit: 'cover', objectPosition: 'center' }} />
          )}

          <div style={{ textAlign: 'left' }}>
            <div style={{ fontWeight: '700', fontSize: '1rem', color: '#fff' }}>{leader.lastName} {leader.firstName}</div>
            <div style={{ fontSize: '0.75rem', color: getPositionColor(leader.position), fontWeight: '900', marginTop: '2px' }}>{leader.position}</div>
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
        paddingLeft: '30px',
        width: '260px',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        gap: '20px',
        cursor: 'pointer',
      }}
    >
      <Handle type="target" position={Position.Top} style={{ background: 'transparent', border: 'none' }} />
      {member.photo && (
        <img src={member.photo} alt={member.lastName} style={{ width: '44px', height: '44px', borderRadius: '10px', objectFit: 'cover', objectPosition: 'center' }} />
      )}

      <div style={{ textAlign: 'left' }}>
        <div style={{ fontWeight: '700', fontSize: '1rem', color: '#fff' }}>{member.lastName} {member.firstName}</div>
        <div style={{ fontSize: '0.75rem', color: roleColor, fontWeight: '900', marginTop: '2px' }}>{member.position}</div>
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
      const p = m.position ? String(m.position) : '';
      const unitMembers = members.filter(mem => mem.unitId === unit.id);

      // 支店長・副支店長は常にリーダー
      if (p.includes('支店長') || p.includes('副支店長')) return true;

      // 兼任している部署のトップ
      if (m.additionalUnitIds && m.additionalUnitIds.includes(unit.id)) return true;

      const minPrio = Math.min(...unitMembers.map(mem => {
        const pos = mem.position ? String(mem.position) : '';
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
      const leaders = u.members.filter(m => isLeader(m, u)).sort((a, b) => {
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
      const leaders = u.members.filter(m => isLeader(m, u)).sort((a, b) => {
        const getP = (p) => p.includes('支店長') ? 1 : (p.includes('副支店長') ? 2 : 3);
        return getP(a.position) - getP(b.position);
      });
      const generalMembers = u.members
        .filter(m => !isLeader(m, u))
        .sort((a, b) => {
          const getP = (p) => {
            const ps = p ? String(p) : '';
            if (ps.includes('所長') || ps.includes('課長')) return 10;
            if (ps.includes('副長')) return 20;
            if (ps.includes('係長')) return 30;
            return 100;
          };
          const prioA = getP(a.position);
          const prioB = getP(b.position);
          if (prioA !== prioB) return prioA - prioB;

          // 同役職なら入社年度順（古い順）
          return String(a.joinDate || '9999').localeCompare(String(b.joinDate || '9999'));
        });


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

  const { fitView, getNodes } = useReactFlow();
  const toggleUnit = (uid) => {
    let isExpanding = false;
    setExpandedUnits(prev => {
      const n = new Set(prev);
      isExpanding = !n.has(uid);
      if (isExpanding) n.add(uid);
      else n.delete(uid);
      return n;
    });

    // 視点調整ロジック
    setTimeout(() => {
      const allNodes = getNodes();
      let targetNodeIds = [];

      if (isExpanding) {
        // 【展開時】自分と、自分の直下（メンバー・子供ユニット）にフォーカス
        targetNodeIds = allNodes
          .filter(n => n.id === uid || n.id.includes(`at-${uid}`) || units.find(u => u.id === n.id)?.parentId === uid)
          .map(n => n.id);
      } else {
        // 【閉じた時】親ユニットとその兄弟たち（親のサブツリー全体）に視点を戻す
        const unitInfo = units.find(u => u.id === uid);
        const parentId = unitInfo?.parentId || 'u1'; // 親がいなければトップ
        targetNodeIds = allNodes
          .filter(n => n.id === parentId || n.id.includes(`at-${parentId}`) || units.find(u => u.id === n.id)?.parentId === parentId)
          .map(n => n.id);
      }

      if (targetNodeIds.length > 0) {
        fitView({
          nodes: targetNodeIds.map(id => allNodes.find(n => n.id === id)).filter(Boolean),
          duration: 800,
          padding: 0.2,
          minZoom: 0.4,
          maxZoom: 0.9
        });
      }
    }, 150);
  };




  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.1}
        maxZoom={2}
        nodesDraggable={false}
        defaultEdgeOptions={{
          type: 'smoothstep',
          style: { stroke: 'rgba(255, 255, 255, 0.25)', strokeWidth: 3 },
          animated: true,
        }}
      >
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

  const btnStyle = { width: '44px', height: '44px', borderRadius: '12px', background: '#2d3748', border: '1px solid rgba(255, 255, 255, 0.1)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s ease', boxShadow: '0 4px 15px rgba(0,0,0,0.3)' };

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

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

// --- 新しい統合ノード (部署 + リーダー) ---
const UnitNode = ({ data }) => {
  const { label, level, leader, isExpanded, onClick, onMemberClick } = data;
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
          borderRadius: leader ? '16px 16px 0 0' : '16px', // リーダーがいる場合は下を平らに
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
        <div style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.4s', opacity: 0.7 }}>
          <ChevronDown size={18} />
        </div>
      </div>

      {/* リーダーカード (隣接・セット) */}
      {leader && (
        <div
          onClick={() => onMemberClick(leader)}
          className="glass"
          style={{
            padding: '12px 15px',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '0 0 16px 16px', // 上を平らにして合体
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderTop: 'none', // 境界線を消す
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            cursor: 'pointer',
            transition: 'background 0.2s',
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
      )}

      <Handle type="source" position={Position.Bottom} style={{ background: 'transparent', border: 'none' }} />
    </div>
  );
};

// --- 一般メンバーノード ---
const MemberNode = ({ data }) => {
  const { member, onClick } = data;
  const roleColor = getPositionColor(member.position);
  const fullName = `${member.lastName} ${member.firstName}`;

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
        <img src={member.photo} alt={fullName} style={{ width: '44px', height: '44px', borderRadius: '10px', objectFit: 'cover' }} />
      )}
      <div>
        <div style={{ fontWeight: '700', fontSize: '0.95rem', color: '#fff' }}>{fullName}</div>
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
    
    // リーダー（最上位役職）を抽出
    const sortedMembers = [...members].sort((a, b) => {
      const getPrio = (p) => {
        if (p.includes('支店長')) return 1;
        if (p.includes('部長')) return 2;
        if (p.includes('所長') || p.includes('課長')) return 3;
        return 100;
      };
      return getPrio(a.position) - getPrio(b.position);
    });

    sortedMembers.forEach(m => {
      if (unitMap[m.unitId]) unitMap[m.unitId].members.push(m);
    });
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
      
      // リーダーを除いた一般メンバーの数を計算
      const generalMembers = u.members.length > 1 ? u.members.slice(1) : [];
      const mHeight = isExpanded ? (generalMembers.length * MEMBER_GAP) + 60 : 0;
      
      // 部署カード自体の高さ（リーダーがいる場合は高くなる）
      const unitNodeHeight = u.members.length > 0 ? 130 : 60;

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
      const leader = u.members.length > 0 ? u.members[0] : null;
      const generalMembers = u.members.length > 1 ? u.members.slice(1) : [];

      vNodes.push({
        id: unitId,
        type: 'unit',
        data: { 
          label: u.name, 
          level, 
          leader, // リーダー情報を渡す
          isExpanded, 
          onClick: () => toggleUnit(unitId),
          onMemberClick
        },
        position: { x: x - 140, y },
      });

      if (u.parentId) {
        vEdges.push({ id: `e-${u.parentId}-${unitId}`, source: u.parentId, target: unitId, type: 'smoothstep', style: { strokeDasharray: '5,5' } });
      }

      const unitHeight = leader ? 130 : 60;
      if (isExpanded) {
        // 一般メンバーの配置
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
    <div style={{ width: '100%', height: '100%' }}>
      <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} fitView minZoom={0.1} maxZoom={2} nodesDraggable={false}>
        <Background color="#fff" opacity={0.05} />
      </ReactFlow>
    </div>
  );
};

const OrgChart_DesktopWrapper = (props) => (
  <ReactFlowProvider><OrgChart_Desktop {...props} /></ReactFlowProvider>
);

export default OrgChart_DesktopWrapper;

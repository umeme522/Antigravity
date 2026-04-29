import React, { useMemo, useState, useEffect } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Handle,
  Position,
  MarkerType,
  useReactFlow,
  ReactFlowProvider
} from 'reactflow';
import 'reactflow/dist/style.css';
import { ChevronDown, ChevronUp } from 'lucide-react';

const getPositionColor = (pos) => {
  if (!pos) return '#a0aec0';
  if (pos.includes('支店長') || pos.includes('副支店長')) return '#ffd700'; // 金
  if (pos.includes('部長')) return '#ff4b4b'; // 赤
  if (pos.includes('所長') || pos.includes('課長')) return '#4b7bff'; // 青
  if (pos.includes('副長')) return '#ff9500'; // オレンジ
  if (pos.includes('係長')) return '#00e676'; // 緑
  return '#a0aec0'; // スタッフ（グレー）
};

const UnitNode = ({ data }) => {
  const unitBg = data.level === 0 ? 'linear-gradient(135deg, #ffd700, #b8860b)' : 'linear-gradient(135deg, #667eea, #764ba2)';
  return (
    <div
      onClick={data.onClick}
      className={`unit-node ${data.isExpanded ? 'expanded' : ''}`}
      style={{
        width: '260px',
        padding: '18px 30px',
        background: unitBg,
        border: '1px solid rgba(255, 255, 255, 0.3)',
        borderRadius: '16px',
        color: 'white',
        fontWeight: '800',
        fontSize: '1.15rem',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        boxShadow: '0 10px 20px rgba(0,0,0,0.15)',
        backdropFilter: 'blur(10px)',
      }}
    >
      <Handle type="target" position={Position.Top} style={{ background: 'transparent', border: 'none' }} />
      <div style={{ flex: 1, textAlign: 'center' }}>{data.label}</div>
      <div style={{ transform: data.isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.4s' }}>
        <ChevronDown size={20} />
      </div>
      <Handle type="source" position={Position.Bottom} style={{ background: 'transparent', border: 'none' }} />
    </div>
  );
};

const MemberNode = ({ data }) => {
  const { member } = data;
  const displayPosition = member.displayPosition || member.position;
  const roleColor = getPositionColor(displayPosition);
  const fullName = `${member.lastName || ''} ${member.firstName || ''}`;

  return (
    <div
      className="glass member-node"
      onClick={() => data.onClick(member)}
      style={{
        background: 'rgba(255, 255, 255, 0.03)',
        padding: '15px',
        width: '260px',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(12px)',
        position: 'relative',
      }}
    >
      <Handle type="target" position={Position.Top} style={{ background: 'transparent', border: 'none' }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        {member.photo && (
          <img src={member.photo} alt={fullName} style={{ width: '50px', height: '50px', borderRadius: '12px', objectFit: 'cover' }} />
        )}
        <div>
          <div style={{ fontWeight: '700', fontSize: '1rem', color: '#ffffff' }}>{fullName}</div>
          <div style={{ fontSize: '0.75rem', color: roleColor, fontWeight: '900', marginTop: '4px' }}>{displayPosition}</div>
        </div>
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
    members.forEach(m => {
      if (unitMap[m.unitId]) unitMap[m.unitId].members.push(m);
    });
    units.forEach(u => {
      if (u.parentId && unitMap[u.parentId]) unitMap[u.parentId].children.push(u.id);
    });

    const vNodes = [];
    const vEdges = [];
    const VERTICAL_GAP = 240; // 以前よりさらに拡大
    const HORIZONTAL_GAP = 60;
    const MEMBER_GAP = 135;

    const subtreeSizeMap = {};

    const calculateSize = (unitId) => {
      const u = unitMap[unitId];
      const isExpanded = expandedUnits.has(unitId);
      const mHeight = isExpanded ? (u.members.length * MEMBER_GAP) + 50 : 0;
      
      if (!isExpanded || u.children.length === 0) {
        subtreeSizeMap[unitId] = { width: 260, height: 70 + mHeight };
        return subtreeSizeMap[unitId];
      }

      const cSizes = u.children.map(calculateSize);
      const w = Math.max(260, cSizes.reduce((a, s) => a + s.width, 0) + (u.children.length - 1) * HORIZONTAL_GAP);
      const h = 70 + mHeight + VERTICAL_GAP + Math.max(...cSizes.map(s => s.height));
      subtreeSizeMap[unitId] = { width: w, height: h };
      return subtreeSizeMap[unitId];
    };

    const layout = (unitId, x, y, level = 0) => {
      const u = unitMap[unitId];
      const isExpanded = expandedUnits.has(unitId);
      const size = subtreeSizeMap[unitId];

      vNodes.push({
        id: unitId,
        type: 'unit',
        data: { label: u.name, level, isExpanded, onClick: () => toggleUnit(unitId) },
        position: { x: x - 130, y },
      });

      if (u.parentId) {
        vEdges.push({ id: `e-${u.parentId}-${unitId}`, source: u.parentId, target: unitId, type: 'smoothstep' });
      }

      let mOffset = 70 + 30;
      if (isExpanded) {
        u.members.forEach((m, i) => {
          const mId = `m-${m.id}-at-${unitId}`;
          vNodes.push({
            id: mId,
            type: 'member',
            data: { member: m, onClick: onMemberClick },
            position: { x: x - 130, y: y + mOffset + (i * MEMBER_GAP) },
          });
          vEdges.push({ id: `e-${unitId}-${mId}`, source: unitId, target: mId, type: 'smoothstep' });
        });

        const totalMHeight = u.members.length * MEMBER_GAP;
        let startX = x - size.width / 2;
        u.children.forEach(cId => {
          const cSize = subtreeSizeMap[cId];
          layout(cId, startX + cSize.width / 2, y + 70 + totalMHeight + VERTICAL_GAP, level + 1);
          startX += cSize.width + HORIZONTAL_GAP;
        });
      }
    };

    const root = units.find(u => !u.parentId);
    if (root) {
      calculateSize(root.id);
      layout(root.id, 0, 0);
    }
    return { nodes: vNodes, edges: vEdges };
  }, [units, members, expandedUnits]);

  useEffect(() => { setNodes(visibleNodes); setEdges(visibleEdges); }, [visibleNodes, visibleEdges]);

  const { setCenter } = useReactFlow();
  const toggleUnit = (uid) => {
    setExpandedUnits(prev => {
      const n = new Set(prev);
      n.has(uid) ? n.delete(uid) : n.add(uid);
      return n;
    });
  };

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} fitView minZoom={0.1} maxZoom={2}>
        <Background color="#fff" opacity={0.05} />
      </ReactFlow>
    </div>
  );
};

const OrgChart_DesktopWrapper = (props) => (
  <ReactFlowProvider><OrgChart_Desktop {...props} /></ReactFlowProvider>
);

export default OrgChart_DesktopWrapper;

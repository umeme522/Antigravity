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

const getUnitColor = (label, level) => {
  if (level === 0) return 'linear-gradient(135deg, #ffd700, #b8860b)';
  return 'linear-gradient(135deg, #667eea, #764ba2)';
};

const UnitNode = ({ data }) => {
  const unitBg = getUnitColor(data.label, data.level);
  return (
    <div onClick={data.onClick} style={{ width: '220px', padding: '12px', background: unitBg, borderRadius: '12px', color: 'white', textAlign: 'center', fontSize: '1rem', fontWeight: 'bold', position: 'relative' }}>
      <Handle type="target" position={Position.Top} style={{ background: 'transparent', border: 'none' }} />
      {data.label}
      <Handle type="source" position={Position.Bottom} style={{ background: 'transparent', border: 'none' }} />
    </div>
  );
};

const MemberNode = ({ data }) => {
  const { member } = data;
  const roleColor = getPositionColor(member.position);
  return (
    <div onClick={() => data.onClick(member)} style={{ width: '230px', padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', border: `1px solid ${roleColor}`, color: 'white', position: 'relative' }}>
      <Handle type="target" position={Position.Top} style={{ background: 'transparent', border: 'none' }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <img src={member.photo} style={{ width: '40px', height: '40px', borderRadius: '6px', border: `1px solid ${roleColor}` }} />
        <div>
          <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{member.lastName} {member.firstName}</div>
          <div style={{ fontSize: '0.7rem', background: roleColor, padding: '2px 6px', borderRadius: '4px', display: 'inline-block' }}>{member.position}</div>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} style={{ background: 'transparent', border: 'none' }} />
    </div>
  );
};

const nodeTypes = { unit: UnitNode, member: MemberNode };

const OrgChart_Mobile = ({ units, members, onMemberClick }) => {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [expandedUnits, setExpandedUnits] = useState(new Set(['u1']));

  const { nodes: visibleNodes, edges: visibleEdges } = useMemo(() => {
    // 簡易的なモバイル用レイアウトロジック（縦方向）
    const nodes = [];
    const edges = [];
    let currentY = 0;

    units.forEach((u, index) => {
      nodes.push({
        id: u.id,
        type: 'unit',
        data: { label: u.name, level: 0, onClick: () => {} },
        position: { x: 0, y: currentY }
      });
      currentY += 100;

      const unitMembers = members.filter(m => m.unitId === u.id);
      unitMembers.forEach(m => {
        nodes.push({
          id: `m-${m.id}`,
          type: 'member',
          data: { member: m, onClick: onMemberClick },
          position: { x: 20, y: currentY }
        });
        edges.push({ id: `e-${u.id}-${m.id}`, source: u.id, target: `m-${m.id}`, type: 'smoothstep' });
        currentY += 100;
      });
    });

    return { nodes, edges };
  }, [units, members, onMemberClick]);

  useEffect(() => { setNodes(visibleNodes); setEdges(visibleEdges); }, [visibleNodes, visibleEdges]);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} fitView style={{ background: 'transparent' }}>
        <Background color="#fff" opacity={0.05} />
      </ReactFlow>
    </div>
  );
};

const OrgChart_MobileWrapper = (props) => (
  <ReactFlowProvider>
    <OrgChart_Mobile {...props} />
  </ReactFlowProvider>
);

export default OrgChart_MobileWrapper;

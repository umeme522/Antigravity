import React, { useMemo, useState, useEffect } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Handle,
  Position,
  MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';
import { ChevronDown, ChevronUp } from 'lucide-react';

const getPositionColor = (pos) => {
  if (!pos) return 'var(--pos-staff)';
  if (pos.includes('支店長') || pos.includes('副支店長')) return 'var(--pos-executive)';
  if (pos.includes('部長')) return 'var(--pos-manager)';
  if (pos.includes('所長') || pos.includes('課長')) return 'var(--pos-director)';
  if (pos.includes('副長')) return 'var(--pos-subdirector)';
  if (pos.includes('係長')) return 'var(--pos-lead)';
  return 'var(--pos-staff)';
};

const getPositionClass = (pos) => {
  if (!pos) return 'pos-staff';
  if (pos.includes('支店長') || pos.includes('副支店長')) return 'pos-executive';
  if (pos.includes('部長')) return 'pos-manager';
  if (pos.includes('所長') || pos.includes('課長')) return 'pos-director';
  if (pos.includes('副長')) return 'pos-subdirector';
  if (pos.includes('係長')) return 'pos-lead';
  return 'pos-staff';
};

const UnitNode = ({ data }) => {
  const isMobile = window.innerWidth < 768;
  const isChild = data.level > 1; // 階層に応じた色分け

  return (
    <div
      onClick={data.onClick}
      className={`unit-node ${data.isExpanded ? 'expanded' : ''}`}
      style={{
        width: isMobile ? '220px' : '250px',
        padding: isMobile ? '12px' : '15px 25px',
        background: isChild 
          ? 'linear-gradient(135deg, #6b46c1, #44337a)' 
          : 'linear-gradient(135deg, var(--accent-secondary), #4b00b3)', 
        border: isChild ? '1px solid rgba(255,255,255,0.2)' : 'none',
        borderRadius: '12px',
        color: 'white',
        fontWeight: '700',
        fontSize: isMobile ? '1rem' : '1.1rem',
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        boxShadow: data.isExpanded ? '0 10px 25px rgba(0,0,0,0.4)' : '0 4px 10px rgba(0,0,0,0.2)'
      }}
    >
      <Handle type="target" position={Position.Top} style={{ background: 'transparent', border: 'none' }} />
      <div style={{ flex: 1, textAlign: 'center' }}>{data.label}</div>
      <div style={{ 
        opacity: 0.6, 
        display: 'flex', 
        alignItems: 'center',
        transition: 'transform 0.3s',
        transform: data.isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'
      }}>
        <ChevronDown size={18} />
      </div>
      <Handle type="source" position={Position.Bottom} style={{ background: 'transparent', border: 'none' }} />
    </div>
  );
};

const MemberNode = ({ data }) => {
  const { member } = data;
  const displayPosition = member.displayPosition || member.position;
  const roleColor = getPositionColor(displayPosition);
  const posClass = getPositionClass(displayPosition);
  const fullName = `${member.lastName || ''} ${member.firstName || ''}`;
  const isAdditional = !member.isMainRole;
  const isMobile = window.innerWidth < 768;

  return (
    <div
      className={`glass member-node ${posClass}`}
      onClick={() => data.onClick(member)}
      style={{
        borderLeft: `5px solid ${roleColor}`,
        background: `linear-gradient(90deg, ${roleColor}${isAdditional ? '08' : '15'} 0%, rgba(255,255,255,0.05) 100%)`,
        opacity: isAdditional ? 0.9 : 1,
        padding: isMobile ? '12px 16px' : '8px 12px',
        width: isMobile ? '230px' : '250px',
        minHeight: isMobile ? '65px' : 'auto',
        display: 'flex',
        alignItems: 'center'
      }}
    >
      <Handle type="target" position={Position.Top} style={{ background: 'transparent', border: 'none' }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ 
            fontWeight: '800', 
            fontSize: isMobile ? '1.1rem' : '0.95rem',
            color: roleColor, 
            lineHeight: '1.2',
            wordBreak: 'break-all'
          }}>
            {fullName}
          </div>
          <div style={{ 
            fontSize: isMobile ? '0.75rem' : '0.65rem', 
            color: roleColor, 
            fontWeight: '800', 
            textTransform: 'uppercase', 
            marginTop: '3px',
            lineHeight: '1.2'
          }}>
            {displayPosition}
          </div>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} style={{ background: 'transparent', border: 'none' }} />
    </div>
  );
};




const nodeTypes = {
  unit: UnitNode,
  member: MemberNode,
};

const OrgChart = ({ units, members, onMemberClick }) => {
  const [expandedUnits, setExpandedUnits] = useState(new Set(['u1']));
  const [rfInstance, setRfInstance] = useState(null);

  useEffect(() => {
    const handleResize = () => {
      if (rfInstance) {
        rfInstance.fitView({ padding: 0.2, duration: 300 });
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [rfInstance]);

  const toggleUnit = (unitId) => {
    setExpandedUnits(prev => {
      const next = new Set(prev);
      if (next.has(unitId)) {
        next.delete(unitId);
      } else {
        next.add(unitId);
      }
      return next;
    });
  };

  const { nodes, edges } = useMemo(() => {
    const isMobile = window.innerWidth < 768;

    const positionPriority = {

      '支店長': 1,
      '部長': 2,
      '所長': 3,
      '課長': 4,
      '副長': 5,
      '係長': 6,
      'スタッフ': 7,
    };

    const getPriority = (pos) => {
      if (!pos) return 99;
      if (pos.includes('支店長')) return 1;
      if (pos.includes('部長')) return 2;
      return positionPriority[pos] || 99;
    };

    const unitMap = {};
    units.forEach(u => {
      unitMap[u.id] = { ...u, children: [], members: [] };
    });

    // メンバーのソートと割り当て
    const sortedMembers = [...members].sort((a, b) => getPriority(a.position) - getPriority(b.position));
    sortedMembers.forEach(m => {
      if (unitMap[m.unitId]) {
        unitMap[m.unitId].members.push({ ...m, displayPosition: m.position, isMainRole: true });
      }
      if (m.additionalUnitIds) {
        m.additionalUnitIds.forEach(uid => {
          if (unitMap[uid]) {
            unitMap[uid].members.push({ ...m, displayPosition: m.additionalPosition || m.position, isMainRole: false });
          }
        });
      }
    });

    // ユニットの階層構築
    units.forEach(u => {
      if (u.parentId && unitMap[u.parentId]) unitMap[u.parentId].children.push(u.id);
    });

    // ユニットのソート（総務、営業などは下の方へ）
    const sortPriority = (name) => {
      if (name.includes('総務')) return 100;
      if (name.includes('営業')) return 90;
      if (name.includes('支店')) return 1;
      return 50;
    };

    Object.values(unitMap).forEach(u => {
      u.children.sort((a, b) => sortPriority(unitMap[a].name) - sortPriority(unitMap[b].name));
    });

    const visibleNodes = [];
    const visibleEdges = [];
    const VERTICAL_GAP_BASE = isMobile ? 30 : 60;
    const VERTICAL_GAP_EXPANDED = isMobile ? 80 : 120;
    const VERTICAL_GAP = 120; // PC用
    const HORIZONTAL_GAP = 50; // PC用
    const MEMBER_GAP = isMobile ? 85 : 100;
    const MEMBER_Y_OFFSET = 65;

    const subtreeHeightMap = {};
    const subtreeWidthMap = {};

    const calculateSubtreeSize = (unitId) => {
      const u = unitMap[unitId];
      const isExpanded = expandedUnits.has(unitId);
      const unitNodeHeight = isMobile ? 50 : 60;
      const unitNodeWidth = isMobile ? 220 : 250;
      const membersHeight = isExpanded ? (u.members.length * MEMBER_GAP) + MEMBER_Y_OFFSET : 0;
      
      if (!isExpanded || u.children.length === 0) {
        subtreeHeightMap[unitId] = unitNodeHeight + membersHeight;
        subtreeWidthMap[unitId] = unitNodeWidth;
        return { height: subtreeHeightMap[unitId], width: subtreeWidthMap[unitId] };
      }

      const childrenSizes = u.children.map(calculateSubtreeSize);
      
      if (isMobile) {
        if (u.parentId === 'u1') {
          const childrenHeight = childrenSizes.reduce((acc, s) => acc + s.height, 0) + (u.children.length * 25);
          subtreeHeightMap[unitId] = unitNodeHeight + membersHeight + 35 + childrenHeight;
        } else {
          const childrenHeight = childrenSizes.reduce((acc, s) => acc + s.height, 0) + (u.children.length * 20);
          subtreeHeightMap[unitId] = Math.max(unitNodeHeight + membersHeight, childrenHeight);
        }
        subtreeWidthMap[unitId] = unitNodeWidth + (u.parentId !== 'u1' ? 180 : 0);
      } else {
        const totalWidth = childrenSizes.reduce((acc, s) => acc + s.width, 0) + (u.children.length - 1) * HORIZONTAL_GAP;
        const maxHeight = Math.max(...childrenSizes.map(s => s.height));
        subtreeWidthMap[unitId] = Math.max(unitNodeWidth, totalWidth);
        subtreeHeightMap[unitId] = unitNodeHeight + membersHeight + VERTICAL_GAP + maxHeight;
      }
      
      return { height: subtreeHeightMap[unitId], width: subtreeWidthMap[unitId] };
    };

    const layoutNodes = (unitId, x, y, level = 0) => {
      const u = unitMap[unitId];
      const isExpanded = expandedUnits.has(unitId);
      const nodeWidth = isMobile ? 230 : 250;

      visibleNodes.push({
        id: unitId,
        type: 'unit',
        data: {
          label: u.name,
          level,
          isExpanded,
          hasChildren: u.children.length > 0 || u.members.length > 0,
          onClick: () => toggleUnit(unitId)
        },
        position: { x: x - nodeWidth / 2, y },
      });

      if (u.parentId) {
        visibleEdges.push({
          id: `e-${u.parentId}-${unitId}`,
          source: u.parentId,
          target: unitId,
          type: 'smoothstep',
          style: { 
            stroke: isMobile ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.2)', 
            strokeWidth: isMobile ? 2.5 : 1.5,
            strokeDasharray: isMobile ? '0' : '4 4' 
          },
        });
      }

      const unitNodeHeight = isMobile ? 50 : 60;
      let currentOffset = unitNodeHeight + 15;

      if (isExpanded && isMobile) {
        if (u.parentId === 'u1') {
          let childY = y + currentOffset + 35;
          u.children.forEach((childId) => {
            layoutNodes(childId, x, childY, level + 1);
            childY += subtreeHeightMap[childId] + 25;
          });
        } else {
          let childY = y;
          u.children.forEach((childId) => {
            layoutNodes(childId, x + 230, childY, level + 1);
            childY += subtreeHeightMap[childId] + 20;
          });
        }
      } else if (isExpanded && !isMobile) {
        let startX = x - subtreeWidthMap[unitId] / 2;
        u.children.forEach((childId) => {
          const childWidth = subtreeWidthMap[childId];
          layoutNodes(childId, startX + childWidth / 2, y + currentOffset + VERTICAL_GAP, level + 1);
          startX += childWidth + HORIZONTAL_GAP;
        });
      }

      if (isExpanded && u.members.length > 0) {
        u.members.forEach((m, i) => {
          const memberY = y + currentOffset + (i * MEMBER_GAP);
          const nodeId = `m-${m.id}-at-${unitId}`;
          visibleNodes.push({
            id: nodeId,
            type: 'member',
            data: { member: m, onClick: onMemberClick, currentUnitId: unitId },
            position: { x: x - nodeWidth / 2, y: memberY },
          });

          visibleEdges.push({
            id: `e-${unitId}-${nodeId}`,
            source: unitId,
            target: nodeId,
            type: 'smoothstep',
            style: { stroke: 'rgba(255,255,255,0.2)', strokeWidth: 1 },
          });
        });
      }
    };


    const roots = units.filter(u => !u.parentId);
    roots.forEach(r => calculateSubtreeSize(r.id));


    const mainRoot = roots.find(r => r.id === 'u1');
    if (mainRoot) {
      layoutNodes(mainRoot.id, 0, 0, 0);
    }

    return { nodes: visibleNodes, edges: visibleEdges };
  }, [units, members, onMemberClick, expandedUnits]);

  return (
    <div style={{ width: '100%', height: '100%', minHeight: '800px' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onInit={setRfInstance}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.2}
        maxZoom={2}
        // モバイル向けのインタラクション設定
        zoomOnPinch={true}
        panOnScroll={false}
        panOnDrag={true}
        preventScrolling={true}
        style={{ width: '100%', height: '100%' }}
      >
        <Background color="#333" gap={20} />
        <Controls />
      </ReactFlow>

    </div>
  );
};


export default OrgChart;

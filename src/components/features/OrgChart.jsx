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

const UnitNode = ({ data }) => {
  const isLightPurple = data.label === '支店総務部' || data.label === '営業革新部';
  const customBackground = isLightPurple
    ? 'linear-gradient(135deg, #c79eff, #9b59b6)' // はっきりと違いがわかる薄紫色
    : undefined;

  return (
    <div
      className={`unit-node ${data.isExpanded ? 'expanded' : ''} ${data.hasChildren ? 'has-children' : ''}`}
      onClick={() => data.hasChildren && data.onClick()}
      style={{
        cursor: data.hasChildren ? 'pointer' : 'default',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        backgroundImage: customBackground // 確実に上書きするためにbackgroundImageを使用
      }}
    >
      <Handle type="target" position={Position.Top} style={{ background: 'transparent', border: 'none' }} />
      <div className="unit-label" style={{ flex: 1 }}>
        {data.label}
      </div>
      {data.hasChildren && (
        <div style={{ opacity: 0.6, display: 'flex', alignItems: 'center' }}>
          {data.isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      )}
      <Handle type="source" position={Position.Bottom} style={{ background: 'transparent', border: 'none' }} />
    </div>
  );
};

const getPositionColor = (pos) => {
  if (pos.includes('支店長') || pos.includes('副支店長')) return 'var(--pos-executive)';
  if (pos.includes('部長')) return 'var(--pos-manager)';
  if (pos.includes('所長') || pos.includes('課長')) return 'var(--pos-director)';
  if (pos.includes('副長')) return 'var(--pos-subdirector)';
  if (pos.includes('係長')) return 'var(--pos-lead)';
  return 'var(--pos-staff)';
};

const getPositionClass = (pos) => {
  if (pos.includes('支店長') || pos.includes('副支店長')) return 'pos-executive';
  if (pos.includes('部長')) return 'pos-manager';
  if (pos.includes('所長') || pos.includes('課長')) return 'pos-director';
  if (pos.includes('副長')) return 'pos-subdirector';
  if (pos.includes('係長')) return 'pos-lead';
  return 'pos-staff';
};

const MemberNode = ({ data }) => {
  const { member } = data;
  const displayPosition = member.displayPosition || member.position;
  const roleColor = getPositionColor(displayPosition);
  const posClass = getPositionClass(displayPosition);
  const fullName = `${member.lastName || ''} ${member.firstName || ''}`;
  const isAdditional = !member.isMainRole;

  return (
    <div
      className={`glass member-node ${posClass}`}
      onClick={() => data.onClick(member)}
      style={{
        borderLeft: `4px solid ${roleColor}`,
        background: `linear-gradient(90deg, ${roleColor}${isAdditional ? '08' : '15'} 0%, rgba(255,255,255,0.05) 100%)`,
        opacity: isAdditional ? 0.9 : 1,
        padding: '8px 12px', // モバイル向けにパディングを少し詰める
        minWidth: '180px'   // 最小幅を少し小さく
      }}
    >
      <Handle type="target" position={Position.Top} style={{ background: 'transparent', border: 'none' }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <img
            src={member.photo}
            alt={fullName}
            style={{
              width: '36px', // アイコンを少し小さく (42px -> 36px)
              height: '36px',
              borderRadius: '50%',
              border: `2px solid ${roleColor}`,
              padding: '2px',
              background: 'rgba(0,0,0,0.2)',
              filter: isAdditional ? 'grayscale(0.3)' : 'none'
            }}
          />
          {isAdditional && (
            <div style={{
              position: 'absolute',
              bottom: '-2px',
              right: '-2px',
              background: 'var(--accent-secondary)',
              color: 'white',
              fontSize: '0.55rem',
              padding: '1px 3px',
              borderRadius: '4px',
              fontWeight: '800'
            }}>
              兼
            </div>
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ 
            fontWeight: '700', 
            fontSize: '0.95rem', 
            color: roleColor, 
            lineHeight: '1.2',
            wordBreak: 'break-all' // 長い名前でも強制的に改行して表示
          }}>
            {fullName}
          </div>
          <div style={{ 
            fontSize: '0.65rem', 
            color: roleColor, 
            fontWeight: '800', 
            textTransform: 'uppercase', 
            marginTop: '2px',
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
    const isMobile = window.innerWidth < 768;
    const NODE_WIDTH = isMobile ? 180 : 250;
    const CHILD_GAP = isMobile ? 20 : 50;
    const VERTICAL_GAP = isMobile ? 80 : 120;
    const MEMBER_GAP = isMobile ? 70 : 100;
    const MEMBER_Y_OFFSET = 60;

    const subtreeHeightMap = {};

    const calculateSubtreeSize = (unitId) => {
      const u = unitMap[unitId];
      const isExpanded = expandedUnits.has(unitId);
      
      // メンバーの高さ（展開されている時のみ計上）
      const membersHeight = isExpanded ? (u.members.length * MEMBER_GAP) + MEMBER_Y_OFFSET : 0;
      
      if (!isExpanded || u.children.length === 0) {
        subtreeHeightMap[unitId] = NODE_WIDTH + membersHeight;
        return { height: subtreeHeightMap[unitId] };
      }

      const childrenSizes = u.children.map(calculateSubtreeSize);
      const childrenHeight = childrenSizes.reduce((acc, s) => acc + s.height, 0) + (u.children.length * (isMobile ? 30 : VERTICAL_GAP));
      subtreeHeightMap[unitId] = NODE_WIDTH + membersHeight + childrenHeight;
      return { height: subtreeHeightMap[unitId] };
    };

    const layoutNodes = (unitId, centerX, y, level = 0) => {
      const u = unitMap[unitId];
      const isExpanded = expandedUnits.has(unitId);

      visibleNodes.push({
        id: unitId,
        type: 'unit',
        data: {
          label: u.name,
          isExpanded,
          hasChildren: u.children.length > 0 || u.members.length > 0,
          onClick: () => toggleUnit(unitId)
        },
        position: { x: centerX - NODE_WIDTH / 2, y },
      });

      if (u.parentId) {
        visibleEdges.push({
          id: `e-${u.parentId}-${unitId}`,
          source: u.parentId,
          target: unitId,
          type: 'smoothstep',
          style: { stroke: 'rgba(255,255,255,0.2)', strokeWidth: 1.5, strokeDasharray: '4 4' },
        });
      }

      let currentOffset = NODE_WIDTH / 2 + 20;

      // メンバー表示（展開されている時のみ）
      if (isExpanded) {
        u.members.forEach((m, i) => {
          const memberY = y + currentOffset + (i * MEMBER_GAP);
          const nodeId = `m-${m.id}-at-${unitId}`;
          visibleNodes.push({
            id: nodeId,
            type: 'member',
            data: { member: m, onClick: onMemberClick, currentUnitId: unitId },
            position: { x: centerX - NODE_WIDTH / 2, y: memberY },
          });

          visibleEdges.push({
            id: `e-${unitId}-${nodeId}`,
            source: unitId,
            target: nodeId,
            type: 'smoothstep',
            style: { stroke: 'rgba(255,255,255,0.2)', strokeWidth: 1 },
          });
        });
        currentOffset += (u.members.length * MEMBER_GAP);
      }

      // 子組織表示（展開されている時のみ）
      if (isExpanded && u.children.length > 0) {
        let childY = y + currentOffset + (isMobile ? 40 : VERTICAL_GAP);
        u.children.forEach((childId) => {
          layoutNodes(childId, centerX, childY, level + 1);
          childY += subtreeHeightMap[childId] + (isMobile ? 40 : VERTICAL_GAP);
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
        <MiniMap
          nodeColor={(n) => n.type === 'unit' ? 'var(--accent-secondary)' : 'var(--accent-primary)'}
          maskColor="rgba(0, 0, 0, 0.5)"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--glass-border)' }}
        />
      </ReactFlow>
    </div>
  );
};


export default OrgChart;

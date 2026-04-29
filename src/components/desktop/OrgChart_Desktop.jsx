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

const getPositionClass = (pos) => {
  if (!pos) return 'pos-staff';
  if (pos.includes('支店長') || pos.includes('副支店長')) return 'pos-executive';
  if (pos.includes('部長')) return 'pos-manager';
  if (pos.includes('所長') || pos.includes('課長')) return 'pos-director';
  if (pos.includes('副長')) return 'pos-subdirector';
  if (pos.includes('係長')) return 'pos-lead';
  return 'pos-staff';
};

const getUnitColor = (label, level) => {
  if (level === 0) return 'linear-gradient(135deg, #ffd700, #b8860b)'; // 支店
  if (label.includes('営業所')) {
    const colors = [
      'linear-gradient(135deg, #ff9a9e, #fecfef)', // ピンク
      'linear-gradient(135deg, #a1c4fd, #c2e9fb)', // スカイ
      'linear-gradient(135deg, #84fab0, #8fd3f4)', // エメラルド
      'linear-gradient(135deg, #fccb90, #d57eeb)', // パープル/オレンジ
      'linear-gradient(135deg, #e0c3fc, #8ec5fc)', // ラベンダー
      'linear-gradient(135deg, #f093fb, #f5576c)'  // ピンク/パープル
    ];
    const index = label.length % colors.length;
    return colors[index];
  }
  if (label.includes('業務')) {
    return 'linear-gradient(135deg, #4facfe, #00f2fe)'; // 業務部（ブルー系）
  }
  return 'linear-gradient(135deg, #667eea, #764ba2)'; // デフォルト
};

const UnitNode = ({ data }) => {
  const isMobile = false;
  const unitBg = getUnitColor(data.label, data.level);

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
        color: data.label.includes('営業所') ? '#1a202c' : 'white',
        fontWeight: '800',
        fontSize: '1.15rem',
        cursor: 'pointer',
        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        boxShadow: data.isExpanded ? '0 20px 40px rgba(0,0,0,0.3)' : '0 10px 20px rgba(0,0,0,0.15)',
        backdropFilter: 'blur(10px)',
      }}
    >
      <Handle type="target" position={Position.Top} style={{ background: 'transparent', border: 'none' }} />
      <div style={{ flex: 1, textAlign: 'center', letterSpacing: '0.05em', textShadow: unitBg.includes('ffd700') ? 'none' : '0 2px 4px rgba(0,0,0,0.2)' }}>{data.label}</div>
      <div style={{ 
        opacity: 0.6, 
        display: 'flex', 
        alignItems: 'center',
        transition: 'transform 0.4s',
        transform: data.isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'
      }}>
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
  const posClass = getPositionClass(displayPosition);
  const fullName = `${member.lastName || ''} ${member.firstName || ''}`;
  const isMobile = false;

  return (
    <div
      className={`glass member-node ${posClass}`}
      onClick={() => data.onClick(member)}
      style={{
        background: 'rgba(255, 255, 255, 0.03)',
        padding: '15px',
        width: '260px',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        transition: 'all 0.3s ease',
        boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
        backdropFilter: 'blur(12px)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <Handle type="target" position={Position.Top} style={{ background: 'transparent', border: 'none' }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', width: '100%' }}>
        {member.photo && (
          <img 
            src={member.photo} 
            alt={fullName} 
            style={{ 
              width: '50px', 
              height: '50px', 
              borderRadius: '12px', 
              objectFit: 'cover'
            }} 
          />
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ 
            fontWeight: '700', 
            fontSize: '1rem',
            color: '#ffffff', 
            lineHeight: '1.2'
          }}>
            {fullName}
          </div>
          <div style={{ 
            display: 'inline-block',
            fontSize: '0.75rem', 
            color: roleColor, 
            fontWeight: '900', 
            textTransform: 'uppercase', 
            marginTop: '4px',
            letterSpacing: '0.05em'
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
  member: MemberNode
};

const OrgChart_Desktop = ({ units, members, onMemberClick }) => {
  const isMobile = false;
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [expandedUnits, setExpandedUnits] = useState(new Set(['u1']));

  const toggleUnit = (unitId) => {
    onUnitClick(unitId);
  };

  const { nodes: visibleNodes, edges: visibleEdges } = useMemo(() => {
    const unitMap = {};
    units.forEach(u => {
      unitMap[u.id] = { ...u, children: [], members: [] };
    });

    const sortedMembers = [...members].sort((a, b) => (a.order || 0) - (b.order || 0));

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

    units.forEach(u => {
      if (u.parentId && unitMap[u.parentId]) unitMap[u.parentId].children.push(u.id);
    });

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
    const VERTICAL_GAP = 180; // 下の部署をさらに押し下げる
    const HORIZONTAL_GAP = 50; 
    const MEMBER_GAP = 125; // メンバー同士を少し上に詰める
    const MEMBER_Y_OFFSET = 100; 


    const subtreeHeightMap = {};
    const subtreeWidthMap = {};

    const calculateSubtreeSize = (unitId) => {
      const u = unitMap[unitId];
      const isExpanded = expandedUnits.has(unitId);
      const unitNodeHeight = 60;
      const unitNodeWidth = 250;
      // メンバー全員の高さ（PC版の大きなカード用）
      const membersHeight = isExpanded && u.members.length > 0 
        ? (u.members.length * MEMBER_GAP) 
        : 0;
      
      if (!isExpanded || u.children.length === 0) {
        subtreeHeightMap[unitId] = unitNodeHeight + membersHeight + 20; // 少し余白
        subtreeWidthMap[unitId] = unitNodeWidth;
        return { height: subtreeHeightMap[unitId], width: subtreeWidthMap[unitId] };
      }

      const childrenSizes = u.children.map(calculateSubtreeSize);
      const totalWidth = childrenSizes.reduce((acc, s) => acc + s.width, 0) + (u.children.length - 1) * HORIZONTAL_GAP;
      const maxHeight = Math.max(...childrenSizes.map(s => s.height));
      
      subtreeWidthMap[unitId] = Math.max(unitNodeWidth, totalWidth);
      // 部署の高さ + メンバー全員の高さ + 間隔 + 子要素の高さ
      subtreeHeightMap[unitId] = unitNodeHeight + membersHeight + VERTICAL_GAP + maxHeight;
      
      return { height: subtreeHeightMap[unitId], width: subtreeWidthMap[unitId] };
    };


    const layoutNodes = (unitId, x, y, level = 0) => {
      const u = unitMap[unitId];
      const isExpanded = expandedUnits.has(unitId);
      const nodeWidth = 250;

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
            stroke: 'rgba(255,255,255,0.2)', 
            strokeWidth: 1.5,
            strokeDasharray: '4 4' 
          },
        });
      }

      const unitNodeHeight = 60;
      let currentOffset = unitNodeHeight + 15;

      if (isExpanded) {
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

  useEffect(() => {
    setNodes(visibleNodes);
    setEdges(visibleEdges);
  }, [visibleNodes, visibleEdges]);

  const { setCenter } = useReactFlow();

  const onUnitClick = (unitId) => {
    setExpandedUnits(prev => {
      const newSet = new Set(prev);
      const isExpanding = !newSet.has(unitId);
      
      if (isExpanding) {
        newSet.add(unitId);
      } else {
        newSet.delete(unitId);
      }
      
      setTimeout(() => {
        const clickedNode = visibleNodes.find(n => n.id === unitId);
        if (clickedNode) {
          setCenter(clickedNode.position.x + 130, clickedNode.position.y + 30, { 
            zoom: 1, 
            duration: 800 
          });
        }
      }, 50);
      
      return newSet;
    });
  };

  const onNodeClick = (event, node) => {
    if (node.type === 'member') {
      onMemberClick(node.data.member);
      setCenter(node.position.x + 130, node.position.y + 40, { 
        zoom: 1.1, 
        duration: 800 
      });
    }
  };

  return (
    <div style={{ width: '100%', height: '100%', background: 'transparent' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodeClick={onNodeClick}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.2}
        maxZoom={2}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={true}
        panOnScroll={false}
        panOnDrag={true}
        zoomOnScroll={true}
        zoomOnPinch={true}
        style={{ background: 'transparent' }}
      >
        <Background color="#ffffff" opacity={0.05} gap={20} />
      </ReactFlow>
    </div>
  );
};

const OrgChart_DesktopWrapper = (props) => (
  <ReactFlowProvider>
    <OrgChart_Desktop {...props} />
  </ReactFlowProvider>
);

export default OrgChart_DesktopWrapper;

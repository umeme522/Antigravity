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
    // 営業所ごとに固有の色（名前のハッシュ等で簡易的に振り分け）
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
  const isMobile = window.innerWidth < 768;
  const unitBg = getUnitColor(data.label, data.level);

  return (
    <div
      onClick={data.onClick}
      className={`unit-node ${data.isExpanded ? 'expanded' : ''}`}
      style={{
        width: isMobile ? '220px' : '260px',
        padding: isMobile ? '12px' : '18px 30px',
        background: unitBg,
        border: '1px solid rgba(255, 255, 255, 0.3)',
        borderRadius: '16px',
        color: data.label.includes('営業所') ? '#1a202c' : 'white', // 営業所は明るい色が多いので文字を暗く
        fontWeight: '800',
        fontSize: isMobile ? '1rem' : '1.15rem',
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
  const isMobile = window.innerWidth < 768;

  return (
    <div
      className={`glass member-node ${posClass}`}
      onClick={() => data.onClick(member)}
      style={{
        background: 'rgba(255, 255, 255, 0.03)',
        padding: isMobile ? '12px 16px' : '15px',
        width: isMobile ? '230px' : '260px',
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
        {!isMobile && member.photo && (
          <img 
            src={member.photo} 
            alt={fullName} 
            style={{ 
              width: '50px', 
              height: '50px', 
              borderRadius: '12px', 
              objectFit: 'cover',
              border: `2px solid ${roleColor}`
            }} 
          />
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ 
            fontWeight: '700', 
            fontSize: isMobile ? '1.1rem' : '1rem',
            color: '#ffffff', 
            lineHeight: '1.2'
          }}>
            {fullName}
          </div>
          {/* 役職ラベルを色付きバッジに変更 */}
          <div style={{ 
            display: 'inline-block',
            fontSize: isMobile ? '0.7rem' : '0.65rem', 
            backgroundColor: roleColor,
            color: '#ffffff', // 白文字に変更
            fontWeight: '900', 
            textTransform: 'uppercase', 
            marginTop: '6px',
            padding: '2px 8px',
            borderRadius: '4px',
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

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

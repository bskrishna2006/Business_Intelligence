import { useEffect, useRef, useState, useMemo } from 'react';
import { 
  ShareNetwork, 
  MagnifyingGlass, 
  Play, 
  Sparkle,
  Sliders,
  X,
  Lightning
} from '@phosphor-icons/react';

export default function KnowledgeGraph({ tableData, datasetInfo, columns, onExecuteQuery }) {
  const canvasRef = useRef(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('graph'); // 'graph' | 'vector'
  const [clusterDensity, setClusterDensity] = useState(1);
  const [isPhysicsActive, setIsPhysicsActive] = useState(true);

  // Dragging state
  const draggingNodeRef = useRef(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });

  // Generate Graph Nodes and Edges from dataset schema and data
  const { nodes, edges } = useMemo(() => {
    if (!tableData || tableData.length === 0) {
      return { nodes: [], edges: [] };
    }

    const cols = columns && columns.length > 0 ? columns : Object.keys(tableData[0]);
    const datasetName = datasetInfo?.name || 'Dataset';

    const generatedNodes = [];
    const generatedEdges = [];

    // 1. Root Node
    const rootNode = {
      id: 'root',
      label: datasetName,
      type: 'root',
      color: '#db3552',
      radius: 22,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      details: {
        totalRows: tableData.length.toLocaleString(),
        totalCols: cols.length,
        description: 'Primary Dataset Entity',
      },
    };
    generatedNodes.push(rootNode);

    // 2. Column Nodes (Radial Distribution)
    cols.forEach((col, idx) => {
      const angle = (idx / cols.length) * Math.PI * 2;
      const distance = 160 + (idx % 2) * 40;
      const colId = `col-${col}`;

      // Check column data type
      const sampleVal = tableData.find((r) => r[col] != null)?.[col];
      const isNum = typeof sampleVal === 'number';

      const colNode = {
        id: colId,
        label: col,
        type: 'column',
        dataType: isNum ? 'numeric' : 'categorical',
        color: isNum ? '#8b5cf6' : '#3b82f6',
        radius: 14,
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
        vx: 0,
        vy: 0,
        parent: 'root',
        details: {
          column: col,
          type: isNum ? 'Numeric Field' : 'Categorical Dimension',
          sample: sampleVal != null ? String(sampleVal) : 'N/A',
        },
      };
      generatedNodes.push(colNode);

      generatedEdges.push({
        source: 'root',
        target: colId,
        weight: 1.5,
        color: 'rgba(219, 53, 82, 0.25)',
      });

      // 3. Category / Value Cluster Nodes for Top Categorical Values
      if (!isNum) {
        const valCounts = {};
        tableData.forEach((r) => {
          const v = r[col];
          if (v != null && v !== '') {
            const key = String(v);
            valCounts[key] = (valCounts[key] || 0) + 1;
          }
        });

        const sortedVals = Object.entries(valCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3);

        sortedVals.forEach(([valName, count], valIdx) => {
          const valAngle = angle + (valIdx - 1) * 0.35;
          const valDistance = distance + 90;
          const valId = `val-${col}-${valName}`;

          const valNode = {
            id: valId,
            label: valName.length > 14 ? `${valName.slice(0, 14)}…` : valName,
            fullLabel: valName,
            type: 'value',
            column: col,
            color: '#10b981',
            radius: 10,
            x: Math.cos(valAngle) * valDistance,
            y: Math.sin(valAngle) * valDistance,
            vx: 0,
            vy: 0,
            parent: colId,
            details: {
              value: valName,
              column: col,
              frequency: count,
              percentage: `${((count / tableData.length) * 100).toFixed(1)}%`,
            },
          };
          generatedNodes.push(valNode);

          generatedEdges.push({
            source: colId,
            target: valId,
            weight: 1.0,
            color: 'rgba(16, 185, 129, 0.25)',
          });
        });
      } else {
        // Numeric Summary Nodes (Min, Max, Avg)
        const nums = tableData.map((r) => Number(r[col])).filter((v) => !isNaN(v));
        if (nums.length > 0) {
          const min = Math.min(...nums);
          const max = Math.max(...nums);
          const avg = nums.reduce((a, b) => a + b, 0) / nums.length;

          const numStatId = `stat-${col}`;
          const statNode = {
            id: numStatId,
            label: `Avg: ${avg > 1000 ? Math.round(avg).toLocaleString() : avg.toFixed(1)}`,
            type: 'metric',
            column: col,
            color: '#f59e0b',
            radius: 10,
            x: Math.cos(angle + 0.2) * (distance + 80),
            y: Math.sin(angle + 0.2) * (distance + 80),
            vx: 0,
            vy: 0,
            parent: colId,
            details: {
              column: col,
              min: min.toLocaleString(),
              max: max.toLocaleString(),
              avg: avg.toFixed(2),
            },
          };
          generatedNodes.push(statNode);

          generatedEdges.push({
            source: colId,
            target: numStatId,
            weight: 1.0,
            color: 'rgba(245, 158, 11, 0.25)',
          });
        }
      }
    });

    return { nodes: generatedNodes, edges: generatedEdges };
  }, [tableData, datasetInfo, columns]);

  // Node Positions and Animation Physics Loop
  const nodesRef = useRef(nodes);
  useEffect(() => {
    nodesRef.current = nodes.map((n) => ({ ...n }));
  }, [nodes]);

  // Main Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const handleResize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;

      ctx.clearRect(0, 0, width, height);

      // Draw Subtle Background Grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      const activeNodes = nodesRef.current;

      // Update Node Physics Simulation
      if (isPhysicsActive) {
        activeNodes.forEach((node, i) => {
          if (node === draggingNodeRef.current) return;

          // Gentle floating motion
          const time = Date.now() * 0.001;
          const floatOffset = Math.sin(time + i) * 0.25;
          node.y += floatOffset;

          // Vector Cluster Mode alignment
          if (viewMode === 'vector' && node.type !== 'root') {
            const groupIndex = node.type === 'column' ? 1 : 2;
            const targetDist = 120 * groupIndex * clusterDensity;
            const currentDist = Math.hypot(node.x, node.y) || 1;
            const factor = (targetDist - currentDist) * 0.02;
            node.x += (node.x / currentDist) * factor;
            node.y += (node.y / currentDist) * factor;
          }
        });
      }

      // Draw Edges
      edges.forEach((edge) => {
        const sourceNode = activeNodes.find((n) => n.id === edge.source);
        const targetNode = activeNodes.find((n) => n.id === edge.target);
        if (!sourceNode || !targetNode) return;

        const sx = sourceNode.x + centerX;
        const sy = sourceNode.y + centerY;
        const tx = targetNode.x + centerX;
        const ty = targetNode.y + centerY;

        const isHighlighted =
          hoveredNode &&
          (hoveredNode.id === sourceNode.id || hoveredNode.id === targetNode.id);

        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(tx, ty);
        ctx.strokeStyle = isHighlighted ? 'rgba(219, 53, 82, 0.8)' : edge.color;
        ctx.lineWidth = isHighlighted ? 2.5 : edge.weight;
        ctx.stroke();

        // Animated particles along edges
        if (isPhysicsActive) {
          const time = (Date.now() * 0.0015 + activeNodes.indexOf(sourceNode)) % 1;
          const px = sx + (tx - sx) * time;
          const py = sy + (ty - sy) * time;
          ctx.beginPath();
          ctx.arc(px, py, 2, 0, Math.PI * 2);
          ctx.fillStyle = isHighlighted ? '#db3552' : '#ffffff';
          ctx.fill();
        }
      });

      // Draw Nodes
      activeNodes.forEach((node) => {
        const nx = node.x + centerX;
        const ny = node.y + centerY;

        const isHovered = hoveredNode?.id === node.id;
        const isSelected = selectedNode?.id === node.id;
        const isMatchSearch = searchQuery && node.label.toLowerCase().includes(searchQuery.toLowerCase());

        // Vector Aura Ring in Vector Mode
        if (viewMode === 'vector' || isHovered || isSelected || isMatchSearch) {
          ctx.beginPath();
          ctx.arc(nx, ny, node.radius + (isHovered ? 12 : 8), 0, Math.PI * 2);
          ctx.fillStyle = `${node.color}22`;
          ctx.fill();
          ctx.strokeStyle = node.color;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }

        // Node Solid Circle
        ctx.beginPath();
        ctx.arc(nx, ny, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.fill();
        ctx.strokeStyle = isSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = isSelected ? 3 : 1.5;
        ctx.stroke();

        // Node Label
        ctx.font = node.type === 'root' ? 'bold 12px "Space Mono", monospace' : '10px "Space Mono", monospace';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText(node.label, nx, ny + node.radius + 14);
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [edges, viewMode, clusterDensity, isPhysicsActive, hoveredNode, selectedNode, searchQuery]);

  // Pointer Interactivity (Hover & Drag)
  const getNodeAtCoords = (clientX, clientY) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left - canvas.width / 2;
    const y = clientY - rect.top - canvas.height / 2;

    return nodesRef.current.find((node) => {
      const dist = Math.hypot(node.x - x, node.y - y);
      return dist <= node.radius + 6;
    });
  };

  const handlePointerDown = (e) => {
    const node = getNodeAtCoords(e.clientX, e.clientY);
    if (node) {
      draggingNodeRef.current = node;
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left - canvas.width / 2;
      const clickY = e.clientY - rect.top - canvas.height / 2;
      dragOffsetRef.current = { x: node.x - clickX, y: node.y - clickY };
      setSelectedNode(node);
    }
  };

  const handlePointerMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();

    if (draggingNodeRef.current) {
      const clickX = e.clientX - rect.left - canvas.width / 2;
      const clickY = e.clientY - rect.top - canvas.height / 2;
      draggingNodeRef.current.x = clickX + dragOffsetRef.current.x;
      draggingNodeRef.current.y = clickY + dragOffsetRef.current.y;
    } else {
      const hovered = getNodeAtCoords(e.clientX, e.clientY);
      setHoveredNode(hovered);
      canvas.style.cursor = hovered ? 'pointer' : 'default';
    }
  };

  const handlePointerUp = () => {
    draggingNodeRef.current = null;
  };

  return (
    <div className="flex h-full w-full bg-[#161214] text-white relative overflow-hidden select-none">

      {/* Top Floating Control Bar */}
      <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between gap-3 bg-black/60 backdrop-blur-md border border-white/10 p-3 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <ShareNetwork size={18} className="text-[var(--color-accent)]" />
            <h3 className="text-xs font-mono font-bold tracking-tight">KNOWLEDGE GRAPH & VECTORS</h3>
          </div>
          <span className="text-[9px] font-mono bg-white/10 px-2 py-0.5 rounded text-zinc-300">
            {nodes.length} Nodes · {edges.length} Links
          </span>
        </div>

        {/* Search & Mode Switcher */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <MagnifyingGlass size={13} className="absolute left-2.5 top-2.5 text-zinc-400" />
            <input
              type="text"
              placeholder="Search entities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white/5 border border-white/10 text-xs font-mono pl-8 pr-3 py-1.5 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-[var(--color-accent)] w-48"
            />
          </div>

          <div className="flex items-center bg-white/5 border border-white/10 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('graph')}
              className={`px-2.5 py-1 text-[10px] font-mono font-bold rounded cursor-pointer transition-all ${
                viewMode === 'graph' ? 'bg-[var(--color-accent)] text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Schema Graph
            </button>
            <button
              onClick={() => setViewMode('vector')}
              className={`px-2.5 py-1 text-[10px] font-mono font-bold rounded cursor-pointer transition-all ${
                viewMode === 'vector' ? 'bg-[var(--color-accent)] text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Vector Clusters
            </button>
          </div>

          <button
            onClick={() => setIsPhysicsActive(!isPhysicsActive)}
            className="p-2 rounded-lg border border-white/10 bg-white/5 text-zinc-300 hover:text-white transition-all cursor-pointer"
            title={isPhysicsActive ? 'Pause Physics' : 'Play Physics'}
          >
            <Play size={13} className={isPhysicsActive ? 'text-emerald-400' : ''} />
          </button>
        </div>
      </div>

      {/* Main Interactive Canvas */}
      <div className="flex-1 h-full w-full relative">
        <canvas
          ref={canvasRef}
          onMouseDown={handlePointerDown}
          onMouseMove={handlePointerMove}
          onMouseUp={handlePointerUp}
          className="w-full h-full block"
        />

        {/* Instructions Banner */}
        <div className="absolute bottom-4 left-4 z-10 text-[10px] font-mono text-zinc-400 bg-black/60 border border-white/10 px-3 py-1.5 rounded-lg flex items-center gap-3">
          <span>💡 Drag nodes to re-organize</span>
          <span>•</span>
          <span>Hover to highlight connections</span>
          <span>•</span>
          <span>Click node to profile & query</span>
        </div>
      </div>

      {/* Node Inspector Side Panel */}
      {selectedNode && (
        <div className="w-80 h-full border-l border-white/10 bg-[#1d181a] p-5 z-20 flex flex-col space-y-4 overflow-y-auto">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ background: selectedNode.color }} />
              <h4 className="text-xs font-mono font-bold text-white uppercase">{selectedNode.label}</h4>
            </div>
            <button
              onClick={() => setSelectedNode(null)}
              className="text-zinc-400 hover:text-white p-1 rounded cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>

          <div className="space-y-3 flex-1 text-xs font-mono">
            <div className="card p-3 bg-white/5 border-white/10 space-y-1">
              <p className="text-[10px] text-zinc-400 uppercase">Entity Class</p>
              <p className="font-bold text-white uppercase">{selectedNode.type}</p>
            </div>

            {selectedNode.details && (
              <div className="card p-3 bg-white/5 border-white/10 space-y-2">
                <p className="text-[10px] text-zinc-400 uppercase">Node Metadata</p>
                {Object.entries(selectedNode.details).map(([key, val]) => (
                  <div key={key} className="flex justify-between text-[11px]">
                    <span className="text-zinc-400 capitalize">{key}:</span>
                    <span className="text-white font-bold">{String(val)}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Quick AI Action Buttons */}
            {selectedNode.type === 'value' && onExecuteQuery && (
              <div className="pt-2">
                <button
                  onClick={() => {
                    onExecuteQuery(`Show all records where ${selectedNode.details?.column} is '${selectedNode.details?.value}'`);
                    setSelectedNode(null);
                  }}
                  className="w-full btn-primary py-2.5 text-xs font-mono font-bold flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Lightning size={14} />
                  <span>Query "{selectedNode.label}"</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

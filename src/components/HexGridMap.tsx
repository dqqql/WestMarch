"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { HexGridUtils } from "@/lib/hexGrid";
import { Button } from "@/components/ui/button";
import { Map as MapIcon, ArrowLeft, Edit, ZoomIn, ZoomOut, Plus, Minus } from "lucide-react";
import Link from "next/link";
import { useApp } from "@/contexts/AppContext";
import NodeDetailModal from "./NodeDetailModal";

const HEX_SIZE = 50;
const INITIAL_GRID_RADIUS = 10;

interface MapNodeData {
  id: string;
  label: string;
  type: "据点" | "地城" | "区域";
  hexQ: number;
  hexR: number;
  hexS: number;
  description: string | null;
  events: any[];
  characters: any[];
  facilities: any[];
  createdAt: string;
  updatedAt: string;
}

interface MapEdgeData {
  id: string;
  sourceId: string;
  targetId: string;
  pathStyle: string;
  color: string | null;
  width: number;
  createdAt: string;
  updatedAt: string;
}

export default function HexGridMap() {
  const { isClient } = useApp();
  const svgRef = useRef<SVGSVGElement>(null);
  const [viewBox, setViewBox] = useState({ x: -400, y: -400, width: 800, height: 800 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [viewBoxStart, setViewBoxStart] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [gridRadius, setGridRadius] = useState(INITIAL_GRID_RADIUS);
  const [isEditMode, setIsEditMode] = useState(false);
  const [nodes, setNodes] = useState<MapNodeData[]>([]);
  const [edges, setEdges] = useState<MapEdgeData[]>([]);
  const [selectedNode, setSelectedNode] = useState<MapNodeData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [migratingFrom, setMigratingFrom] = useState<string | null>(null);

  useEffect(() => {
    loadMap();
  }, []);

  const loadMap = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/map");
      if (response.ok) {
        const data = await response.json();
        setNodes(data.nodes || []);
        setEdges(data.edges || []);
      }
    } catch (error) {
      console.error("Failed to load map:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshNode = async () => {
    if (!selectedNode) return;
    try {
      const response = await fetch(`/api/map/nodes/${selectedNode.id}`);
      if (response.ok) {
        const updatedNode = await response.json();
        setSelectedNode(updatedNode);
        setNodes(prev => prev.map(n => n.id === updatedNode.id ? updatedNode : n));
      }
    } catch (error) {
      console.error("Failed to refresh node:", error);
    }
  };

  const getSVGPoint = (e: React.MouseEvent) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };

    const rect = svg.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom - viewBox.x;
    const y = (e.clientY - rect.top) / zoom - viewBox.y;
    return { x, y };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    if (migratingFrom || connectingFrom) return;
    
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setViewBoxStart({ x: viewBox.x, y: viewBox.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      const dx = (e.clientX - dragStart.x) / zoom;
      const dy = (e.clientY - dragStart.y) / zoom;
      setViewBox(prev => ({
        ...prev,
        x: viewBoxStart.x - dx,
        y: viewBoxStart.y - dy
      }));
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.2, Math.min(5, zoom * delta));
    setZoom(newZoom);
  };

  const getNodeTypeStyle = (type: string) => {
    switch (type) {
      case "据点":
        return { fill: "rgba(245, 158, 11, 0.7)", stroke: "#fbbf24", labelColor: "#fff", glowColor: "#f59e0b" };
      case "地城":
        return { fill: "rgba(139, 92, 246, 0.7)", stroke: "#a78bfa", labelColor: "#fff", glowColor: "#8b5cf6" };
      case "区域":
        return { fill: "rgba(34, 197, 94, 0.7)", stroke: "#4ade80", labelColor: "#fff", glowColor: "#22c55e" };
      default:
        return { fill: "rgba(107, 114, 128, 0.7)", stroke: "#9ca3af", labelColor: "#fff", glowColor: "#6b7280" };
    }
  };

  const getEdgePositions = useCallback(() => {
    const edgePositions: { q: number; r: number }[] = [];
    const occupiedPositions = new Set(nodes.map(n => `${n.hexQ},${n.hexR}`));
    
    nodes.forEach(node => {
      const currentHex = HexGridUtils.create(node.hexQ, node.hexR);
      const neighbors = HexGridUtils.neighbors(currentHex);
      
      neighbors.forEach(neighbor => {
        const key = `${neighbor.q},${neighbor.r}`;
        if (!occupiedPositions.has(key)) {
          edgePositions.push({ q: neighbor.q, r: neighbor.r });
          occupiedPositions.add(key);
        }
      });
    });
    
    return edgePositions;
  }, [nodes]);

  const addNode = async (q: number, r: number) => {
    try {
      const response = await fetch("/api/map/nodes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: "新地点",
          type: "区域",
          hexQ: q,
          hexR: r,
          hexS: -q - r,
          description: ""
        }),
      });
      if (response.ok) {
        const newNode = await response.json();
        setNodes(prev => [...prev, newNode]);
      }
    } catch (error) {
      console.error("Failed to create node:", error);
    }
  };

  const migrateNode = async (nodeId: string, newQ: number, newR: number) => {
    const originalNode = nodes.find(n => n.id === nodeId);
    if (!originalNode) return;
    
    try {
      const response = await fetch("/api/map/nodes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: originalNode.label,
          type: originalNode.type,
          hexQ: newQ,
          hexR: newR,
          hexS: -newQ - newR,
          description: originalNode.description
        }),
      });
      
      if (response.ok) {
        const newNode = await response.json();
        
        const deleteResponse = await fetch(`/api/map/nodes/${nodeId}`, {
          method: "DELETE",
        });
        
        if (deleteResponse.ok) {
          setNodes(prev => [...prev.filter(n => n.id !== nodeId), newNode]);
          setSelectedNode(newNode);
        }
      }
    } catch (error) {
      console.error("Failed to migrate node:", error);
    }
  };

  const createEdge = async (sourceId: string, targetId: string) => {
    if (sourceId === targetId) return;
    try {
      const response = await fetch("/api/map/edges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceId, targetId }),
      });
      if (response.ok) {
        const newEdge = await response.json();
        setEdges(prev => [...prev, newEdge]);
      }
    } catch (error) {
      console.error("Failed to create edge:", error);
    }
  };

  const deleteNode = async () => {
    if (!selectedNode) return;
    if (!confirm(`确定要删除节点"${selectedNode.label}"吗？`)) return;
    try {
      const response = await fetch(`/api/map/nodes/${selectedNode.id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setNodes(prev => prev.filter(n => n.id !== selectedNode.id));
        setEdges(prev => prev.filter(e => e.sourceId !== selectedNode.id && e.targetId !== selectedNode.id));
        setSelectedNode(null);
        setShowModal(false);
      }
    } catch (error) {
      console.error("Failed to delete node:", error);
    }
  };

  const startConnecting = () => {
    if (!selectedNode) return;
    setConnectingFrom(selectedNode.id);
    setShowModal(false);
  };

  const startMigrating = () => {
    if (!selectedNode) return;
    setMigratingFrom(selectedNode.id);
    setShowModal(false);
  };

  const handleHexClick = (q: number, r: number, node: MapNodeData | undefined, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (migratingFrom && !node) {
      migrateNode(migratingFrom, q, r);
      setMigratingFrom(null);
      return;
    }
    
    if (migratingFrom && node) {
      setMigratingFrom(null);
      return;
    }
    
    if (connectingFrom && node) {
      createEdge(connectingFrom, node.id);
      setConnectingFrom(null);
      return;
    }

    if (node) {
      setSelectedNode(node);
    } else if (isEditMode) {
      addNode(q, r);
    }
  };

  const handleHexDoubleClick = (q: number, r: number, node: MapNodeData | undefined, e: React.MouseEvent) => {
    e.stopPropagation();
    if (node) {
      setSelectedNode(node);
      setShowModal(true);
    }
  };

  const renderGrid = () => {
    const hexagons: JSX.Element[] = [];
    const path = HexGridUtils.getHexPath(HEX_SIZE);
    const renderedPositions = new Set<string>();

    for (let q = -gridRadius; q <= gridRadius; q++) {
      for (let r = -gridRadius; r <= gridRadius; r++) {
        const hex = HexGridUtils.create(q, r);
        if (HexGridUtils.length(hex) > gridRadius) continue;

        const pixel = HexGridUtils.hexToPixel(hex, HEX_SIZE);
        const node = nodes.find(n => n.hexQ === q && n.hexR === r);
        const isSelected = selectedNode?.hexQ === q && selectedNode?.hexR === r;
        const nodeStyle = node ? getNodeTypeStyle(node.type) : null;

        renderedPositions.add(`${q},${r}`);

        hexagons.push(
          <g key={`${q},${r}`} transform={`translate(${pixel.x}, ${pixel.y})`}>
            {node && isSelected && (
              <path
                d={path}
                fill="none"
                stroke={nodeStyle?.glowColor}
                strokeWidth="8"
                opacity="0.4"
                filter="url(#glow)"
              />
            )}
            <path
              d={path}
              fill={node ? nodeStyle?.fill : "rgba(30, 41, 59, 0.3)"}
              stroke={node ? nodeStyle?.stroke : "#475569"}
              strokeWidth={isSelected ? 3 : 1.5}
              className={`cursor-pointer transition-all duration-300 hover:brightness-125 hover:scale-105 ${isSelected ? "drop-shadow-xl" : "hover:drop-shadow-lg"}`}
              onClick={(e) => handleHexClick(q, r, node, e)}
              onDoubleClick={(e) => handleHexDoubleClick(q, r, node, e)}
            />
            {node && (
              <text
                textAnchor="middle"
                dy="0.35em"
                fill={nodeStyle?.labelColor}
                fontSize="13"
                fontWeight="700"
                className="pointer-events-none select-none drop-shadow-md"
                style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}
              >
                {node.label}
              </text>
            )}
          </g>
        );
      }
    }

    nodes.forEach(node => {
      const key = `${node.hexQ},${node.hexR}`;
      if (renderedPositions.has(key)) return;

      const pixel = HexGridUtils.hexToPixel(HexGridUtils.create(node.hexQ, node.hexR), HEX_SIZE);
      const isSelected = selectedNode?.id === node.id;
      const nodeStyle = getNodeTypeStyle(node.type);

      hexagons.push(
        <g key={`node-${node.id}`} transform={`translate(${pixel.x}, ${pixel.y})`}>
          {isSelected && (
            <path
              d={path}
              fill="none"
              stroke={nodeStyle.glowColor}
              strokeWidth="8"
              opacity="0.4"
              filter="url(#glow)"
            />
          )}
          <path
            d={path}
            fill={nodeStyle.fill}
            stroke={nodeStyle.stroke}
            strokeWidth={isSelected ? 3 : 1.5}
            className={`cursor-pointer transition-all duration-300 hover:brightness-125 hover:scale-105 ${isSelected ? "drop-shadow-xl" : "hover:drop-shadow-lg"}`}
            onClick={(e) => handleHexClick(node.hexQ, node.hexR, node, e)}
            onDoubleClick={(e) => handleHexDoubleClick(node.hexQ, node.hexR, node, e)}
          />
          <text
            textAnchor="middle"
            dy="0.35em"
            fill={nodeStyle.labelColor}
            fontSize="13"
            fontWeight="700"
            className="pointer-events-none select-none drop-shadow-md"
            style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}
          >
            {node.label}
          </text>
        </g>
      );
    });

    return hexagons;
  };

  const renderGridBoundary = () => {
    const hexagons: JSX.Element[] = [];
    const path = HexGridUtils.getHexPath(HEX_SIZE);

    for (let q = -gridRadius; q <= gridRadius; q++) {
      for (let r = -gridRadius; r <= gridRadius; r++) {
        const hex = HexGridUtils.create(q, r);
        if (HexGridUtils.length(hex) !== gridRadius) continue;

        const pixel = HexGridUtils.hexToPixel(hex, HEX_SIZE);

        hexagons.push(
          <path
            key={`boundary-${q},${r}`}
            d={path}
            transform={`translate(${pixel.x}, ${pixel.y})`}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="3"
            strokeDasharray="8,4"
            opacity="0.6"
          />
        );
      }
    }
    return hexagons;
  };

  const renderEdgeButtons = () => {
    if (!isEditMode || migratingFrom || connectingFrom) return null;
    
    const edgePositions = getEdgePositions();
    const path = HexGridUtils.getHexPath(HEX_SIZE);
    
    return edgePositions.map(({ q, r }) => {
      const pixel = HexGridUtils.hexToPixel(HexGridUtils.create(q, r), HEX_SIZE);
      
      return (
        <g key={`edge-${q},${r}`} transform={`translate(${pixel.x}, ${pixel.y})`}>
          <path
            d={path}
            fill="rgba(34, 197, 94, 0.3)"
            stroke="#22c55e"
            strokeWidth="2"
            strokeDasharray="5,5"
            className="cursor-pointer transition-all duration-300 hover:brightness-125"
            onClick={(e) => {
              e.stopPropagation();
              addNode(q, r);
            }}
          />
          <circle cx="0" cy="0" r="15" fill="rgba(34, 197, 94, 0.8)" className="pointer-events-none" />
          <text
            textAnchor="middle"
            dy="0.35em"
            fill="white"
            fontSize="20"
            fontWeight="bold"
            className="pointer-events-none select-none"
          >
            +
          </text>
        </g>
      );
    });
  };

  const renderEdges = () => {
    return edges.map(edge => {
      const sourceNode = nodes.find(n => n.id === edge.sourceId);
      const targetNode = nodes.find(n => n.id === edge.targetId);
      if (!sourceNode || !targetNode) return null;

      const sourceHex = HexGridUtils.create(sourceNode.hexQ, sourceNode.hexR);
      const targetHex = HexGridUtils.create(targetNode.hexQ, targetNode.hexR);
      const sourcePixel = HexGridUtils.hexToPixel(sourceHex, HEX_SIZE);
      const targetPixel = HexGridUtils.hexToPixel(targetHex, HEX_SIZE);

      const getPathStyle = () => {
        switch (edge.pathStyle) {
          case "石板路":
            return { strokeDasharray: "none", stroke: "#78716c" };
          case "桥梁":
            return { strokeDasharray: "5,5", stroke: "#60a5fa" };
          default:
            return { strokeDasharray: "10,5", stroke: edge.color || "#a3a3a3" };
        }
      };

      const style = getPathStyle();

      return (
        <line
          key={edge.id}
          x1={sourcePixel.x}
          y1={sourcePixel.y}
          x2={targetPixel.x}
          y2={targetPixel.y}
          stroke={style.stroke}
          strokeWidth={edge.width * 2}
          strokeDasharray={style.strokeDasharray}
          strokeLinecap="round"
        />
      );
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center">
        <p className="text-zinc-400">加载中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      {isClient && (
        <div className="fixed inset-0 z-0 pointer-events-none">
          <img
            src="/images/map-bg.png"
            alt="地图背景"
            className="w-full h-full object-cover opacity-30"
          />
        </div>
      )}
      <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:text-amber-400 transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="flex items-center gap-2">
              <MapIcon className="h-6 w-6 text-amber-500" />
              <h1 className="text-xl font-bold">蜂巢格地图</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-zinc-800 rounded-lg px-2 py-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setGridRadius(r => Math.max(1, r - 1))}
                className="h-8 px-2"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="text-sm text-zinc-300 min-w-[40px] text-center">
                半径: {gridRadius}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setGridRadius(r => r + 1)}
                className="h-8 px-2"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setZoom(z => Math.min(5, z * 1.2))}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setZoom(z => Math.max(0.2, z * 0.8))}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button
              variant={isEditMode ? "default" : "secondary"}
              onClick={() => {
                setIsEditMode(!isEditMode);
                setConnectingFrom(null);
                setMigratingFrom(null);
              }}
              className={isEditMode ? "bg-amber-600 hover:bg-amber-700" : "bg-zinc-800 hover:bg-zinc-700"}
            >
              <Edit className="h-4 w-4 mr-2" />
              {isEditMode ? "退出编辑" : "编辑模式"}
            </Button>
          </div>
        </div>
      </header>
      <div className="flex-1 flex relative overflow-hidden">
        <div className={`flex-1 relative z-10 ${migratingFrom || connectingFrom ? "cursor-crosshair" : "cursor-grab active:cursor-grabbing"}`}>
          <svg
            ref={svgRef}
            className="w-full h-full"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            onWheel={handleWheel}
          >
            <defs>
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="5" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <g transform={`scale(${zoom}) translate(${-viewBox.x}, ${-viewBox.y})`}>
              {renderGridBoundary()}
              {renderEdges()}
              {renderGrid()}
              {renderEdgeButtons()}
            </g>
          </svg>
        </div>
      </div>
      {connectingFrom && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-amber-600 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          点击另一个节点创建连接，或点击空白处取消
        </div>
      )}
      {migratingFrom && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          点击目标位置迁移节点，或点击已有节点取消
        </div>
      )}
      {showModal && selectedNode && (
        <NodeDetailModal
          node={selectedNode}
          isEditMode={isEditMode}
          onClose={() => setShowModal(false)}
          onUpdate={refreshNode}
          onDelete={deleteNode}
          onStartConnecting={startConnecting}
          onStartMigrating={startMigrating}
          connectingFrom={connectingFrom}
          migratingFrom={migratingFrom}
        />
      )}
    </div>
  );
}

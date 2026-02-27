"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { HexGridUtils, type HexCoordinate } from "@/lib/hexGrid";
import { Button } from "@/components/ui/button";
import { Map as MapIcon, ArrowLeft, Edit, Plus, Info, Trash2, X, Save, ZoomIn, ZoomOut, Move, MindMap, Users, Calendar, Building2 } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useApp } from "@/contexts/AppContext";
import NodeEditor from "./NodeEditor";

const HEX_SIZE = 50;
const GRID_RADIUS = 10;

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
  const [isEditMode, setIsEditMode] = useState(false);
  const [nodes, setNodes] = useState<MapNodeData[]>([]);
  const [edges, setEdges] = useState<MapEdgeData[]>([]);
  const [selectedNode, setSelectedNode] = useState<MapNodeData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditingNode, setIsEditingNode] = useState(false);
  const [editForm, setEditForm] = useState({ label: "", type: "区域" as "据点" | "地城" | "区域", description: "" });
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"details" | "editor" | "mindmap">("details");

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

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setViewBoxStart({ x: viewBox.x, y: viewBox.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = (e.clientX - dragStart.x) / zoom;
    const dy = (e.clientY - dragStart.y) / zoom;
    setViewBox(prev => ({
      ...prev,
      x: viewBoxStart.x - dx,
      y: viewBoxStart.y - dy
    }));
  };

  const handleMouseUp = () => {
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
        return { fill: "#f59e0b", stroke: "#d97706", labelColor: "#fff" };
      case "地城":
        return { fill: "#8b5cf6", stroke: "#7c3aed", labelColor: "#fff" };
      case "区域":
        return { fill: "#22c55e", stroke: "#16a34a", labelColor: "#fff" };
      default:
        return { fill: "#6b7280", stroke: "#4b5563", labelColor: "#fff" };
    }
  };

  const renderGrid = () => {
    const hexagons: JSX.Element[] = [];
    const path = HexGridUtils.getHexPath(HEX_SIZE);

    for (let q = -GRID_RADIUS; q <= GRID_RADIUS; q++) {
      for (let r = -GRID_RADIUS; r <= GRID_RADIUS; r++) {
        const hex = HexGridUtils.create(q, r);
        if (HexGridUtils.length(hex) > GRID_RADIUS) continue;

        const pixel = HexGridUtils.hexToPixel(hex, HEX_SIZE);
        const node = nodes.find(n => n.hexQ === q && n.hexR === r);
        const isSelected = selectedNode?.hexQ === q && selectedNode?.hexR === r;

        hexagons.push(
          <g key={`${q},${r}`} transform={`translate(${pixel.x}, ${pixel.y})`}>
            <path
              d={path}
              fill={node ? getNodeTypeStyle(node.type).fill : "rgba(30, 41, 59, 0.5)"}
              stroke={node ? getNodeTypeStyle(node.type).stroke : "#475569"}
              strokeWidth={isSelected ? 3 : 1}
              className={`cursor-pointer transition-all hover:brightness-110 ${isSelected ? "drop-shadow-lg" : ""}`}
              onClick={() => handleHexClick(q, r, node)}
            />
            {node && (
              <text
                textAnchor="middle"
                dy="0.35em"
                fill={getNodeTypeStyle(node.type).labelColor}
                fontSize="12"
                fontWeight="bold"
                className="pointer-events-none select-none"
              >
                {node.label}
              </text>
            )}
          </g>
        );
      }
    }
    return hexagons;
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

  const handleHexClick = (q: number, r: number, node: MapNodeData | undefined) => {
    if (connectingFrom && node) {
      createEdge(connectingFrom, node.id);
      setConnectingFrom(null);
      return;
    }

    if (node) {
      setSelectedNode(node);
      setIsEditingNode(false);
      setViewMode("details");
    } else if (isEditMode) {
      addNode(q, r);
    }
  };

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

  const saveNodeEdit = async () => {
    if (!selectedNode) return;
    try {
      const response = await fetch(`/api/map/nodes/${selectedNode.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...selectedNode,
          label: editForm.label,
          type: editForm.type,
          description: editForm.description
        }),
      });
      if (response.ok) {
        const updatedNode = await response.json();
        setNodes(prev => prev.map(n => n.id === selectedNode.id ? updatedNode : n));
        setSelectedNode(updatedNode);
        setIsEditingNode(false);
      }
    } catch (error) {
      console.error("Failed to update node:", error);
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
      }
    } catch (error) {
      console.error("Failed to delete node:", error);
    }
  };

  const startEditNode = () => {
    if (!selectedNode) return;
    setEditForm({
      label: selectedNode.label,
      type: selectedNode.type,
      description: selectedNode.description || "",
    });
    setIsEditingNode(true);
  };

  const startConnecting = () => {
    if (!selectedNode) return;
    setConnectingFrom(selectedNode.id);
  };

  const renderMindMap = () => {
    if (!selectedNode) return null;

    const items = [
      ...selectedNode.events.map(e => ({ ...e, type: "event" })),
      ...selectedNode.characters.map(c => ({ ...c, type: "character" })),
      ...selectedNode.facilities.map(f => ({ ...f, type: "facility" }))
    ];

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-amber-500 flex items-center gap-2">
          <MindMap className="h-5 w-5" />
          思维导图视图
        </h3>
        <div className="relative min-h-64">
          <div className="absolute left-1/2 top-4 transform -translate-x-1/2">
            <Card className="bg-amber-600/20 border-amber-600 min-w-32 text-center">
              <CardContent className="p-4">
                <p className="font-bold text-amber-400">{selectedNode.label}</p>
              </CardContent>
            </Card>
          </div>
          <div className="absolute left-1/2 top-24 w-px h-8 bg-zinc-600 transform -translate-x-1/2" />
          <div className="absolute left-1/2 top-32 w-full transform -translate-x-1/2">
            <div className="flex justify-center gap-4 flex-wrap">
              {items.map((item, i) => (
                <Card key={item.id} className={`
                  ${item.type === "event" ? "bg-green-900/30 border-green-600" : ""}
                  ${item.type === "character" ? "bg-blue-900/30 border-blue-600" : ""}
                  ${item.type === "facility" ? "bg-purple-900/30 border-purple-600" : ""}
                  min-w-28
                `}>
                  <CardContent className="p-3">
                    <p className="text-sm font-semibold text-white">
                      {item.title || item.name}
                    </p>
                    <p className="text-xs text-zinc-400 mt-1">
                      {item.type === "event" ? "事件" : item.type === "character" ? "人物" : "设施"}
                    </p>
                  </CardContent>
                </Card>
              ))}
              {items.length === 0 && (
                <p className="text-zinc-500 text-sm">暂无内容</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
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
        <div className="flex-1 relative z-10 cursor-grab active:cursor-grabbing">
          <svg
            ref={svgRef}
            className="w-full h-full"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
          >
            <g transform={`scale(${zoom}) translate(${-viewBox.x}, ${-viewBox.y})`}>
              {renderEdges()}
              {renderGrid()}
            </g>
          </svg>
        </div>
        {selectedNode && (
          <div className="w-96 border-l border-zinc-800 bg-zinc-900 p-4 overflow-y-auto relative z-20">
            <Card className="bg-zinc-800 border-zinc-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-amber-500" />
                  {selectedNode.label}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!isEditingNode && (
                  <div className="flex gap-2">
                    <Button
                      variant={viewMode === "details" ? "default" : "secondary"}
                      size="sm"
                      onClick={() => setViewMode("details")}
                      className={viewMode === "details" ? "bg-amber-600" : ""}
                    >
                      <Info className="h-4 w-4 mr-1" />
                      详情
                    </Button>
                    <Button
                      variant={viewMode === "editor" ? "default" : "secondary"}
                      size="sm"
                      onClick={() => setViewMode("editor")}
                      className={viewMode === "editor" ? "bg-amber-600" : ""}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      编辑
                    </Button>
                    <Button
                      variant={viewMode === "mindmap" ? "default" : "secondary"}
                      size="sm"
                      onClick={() => setViewMode("mindmap")}
                      className={viewMode === "mindmap" ? "bg-amber-600" : ""}
                    >
                      <MindMap className="h-4 w-4 mr-1" />
                      思维导图
                    </Button>
                  </div>
                )}

                {isEditingNode ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-zinc-400 mb-1">名称</label>
                      <Input
                        value={editForm.label}
                        onChange={(e) => setEditForm({ ...editForm, label: e.target.value })}
                        className="bg-zinc-700 border-zinc-600"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-zinc-400 mb-1">类型</label>
                      <Select value={editForm.type} onValueChange={(value: any) => setEditForm({ ...editForm, type: value })}>
                        <SelectTrigger className="bg-zinc-700 border-zinc-600">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-800 border-zinc-700">
                          <SelectItem value="据点">据点</SelectItem>
                          <SelectItem value="地城">地城</SelectItem>
                          <SelectItem value="区域">区域</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm text-zinc-400 mb-1">描述</label>
                      <Textarea
                        className="bg-zinc-700 border-zinc-600 h-32"
                        value={editForm.description}
                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" onClick={() => setIsEditingNode(false)}>取消</Button>
                      <Button className="flex-1 bg-amber-600 hover:bg-amber-700" onClick={saveNodeEdit}>
                        <Save className="h-4 w-4 mr-2" />
                        保存
                      </Button>
                    </div>
                  </div>
                ) : viewMode === "details" ? (
                  <div className="space-y-4">
                    <div>
                      <span className="text-zinc-400 text-sm">类型:</span>
                      <span className="ml-2 text-white">{selectedNode.type}</span>
                    </div>
                    <div>
                      <span className="text-zinc-400 text-sm">坐标:</span>
                      <span className="ml-2 text-white">
                        ({selectedNode.hexQ}, {selectedNode.hexR}, {selectedNode.hexS})
                      </span>
                    </div>
                    <div className="pt-4 border-t border-zinc-700">
                      <p className="text-zinc-400 text-sm mb-2">描述:</p>
                      <p className="text-zinc-300">{selectedNode.description || "暂无描述"}</p>
                    </div>
                    <div className="pt-4 border-t border-zinc-700">
                      <p className="text-zinc-400 text-sm mb-2 flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        事件: {selectedNode.events?.length || 0}
                      </p>
                      <p className="text-zinc-400 text-sm mb-2 flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        人物: {selectedNode.characters?.length || 0}
                      </p>
                      <p className="text-zinc-400 text-sm mb-2 flex items-center gap-1">
                        <Building2 className="h-4 w-4" />
                        设施: {selectedNode.facilities?.length || 0}
                      </p>
                    </div>
                    {isEditMode && (
                      <div className="flex flex-col gap-2 pt-4 border-t border-zinc-700">
                        <Button variant="ghost" size="sm" onClick={startEditNode} className="w-full">
                          <Edit className="h-4 w-4 mr-2" />
                          编辑节点
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={startConnecting}
                          className={`w-full ${connectingFrom ? "bg-amber-600/20 text-amber-400" : ""}`}
                        >
                          <Move className="h-4 w-4 mr-2" />
                          {connectingFrom ? "取消连接" : "连接节点"}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={deleteNode} className="w-full text-red-400 hover:text-red-300 hover:bg-red-900/20">
                          <Trash2 className="h-4 w-4 mr-2" />
                          删除节点
                        </Button>
                      </div>
                    )}
                  </div>
                ) : viewMode === "editor" ? (
                  <NodeEditor
                    nodeId={selectedNode.id}
                    events={selectedNode.events || []}
                    characters={selectedNode.characters || []}
                    facilities={selectedNode.facilities || []}
                    onUpdate={refreshNode}
                  />
                ) : (
                  renderMindMap()
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
      {connectingFrom && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-amber-600 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          点击另一个节点创建连接，或点击空白处取消
        </div>
      )}
    </div>
  );
}

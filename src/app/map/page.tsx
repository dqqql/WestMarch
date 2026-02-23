"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Background,
  MiniMap,
  Handle,
  Position,
  MarkerType,
  Node,
  Edge,
  Connection,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Button } from "@/components/ui/button";
import { Map as MapIcon, ArrowLeft, Edit, Plus, Info, Trash2, X, Save } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useApp } from "@/contexts/AppContext";

interface MapNode {
  id: string;
  label: string;
  type: "城镇" | "地点" | "事件";
  x: number;
  y: number;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

interface MapEdge {
  id: string;
  sourceId: string;
  targetId: string;
  createdAt: string;
  updatedAt: string;
}

const CustomNode = ({ data, selected }: { data: any; selected: boolean }) => {
  const typeColors = {
    城镇: "bg-blue-900/80 border-blue-500",
    地点: "bg-green-900/80 border-green-500",
    事件: "bg-amber-900/80 border-amber-500",
  };

  return (
    <div
      className={`px-4 py-3 rounded-lg shadow-lg border-2 min-w-[120px] text-center ${
        typeColors[data.type as keyof typeof typeColors]
      } ${selected ? "ring-2 ring-white/50" : ""}`}
    >
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-zinc-400" />
      <div className="font-bold text-white">{data.label}</div>
      <div className="text-xs text-white/70">{data.type}</div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-zinc-400" />
    </div>
  );
};

const nodeTypes = {
  custom: CustomNode,
};

function MapContent() {
  const { isClient } = useApp();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isEditingNode, setIsEditingNode] = useState(false);
  const [editForm, setEditForm] = useState({ label: "", type: "地点" as "城镇" | "地点" | "事件", description: "" });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMap();
  }, []);

  const loadMap = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/map");
      if (response.ok) {
        const data = await response.json();
        const mappedNodes: Node[] = data.nodes.map((node: MapNode) => ({
          id: node.id,
          type: "custom",
          position: { x: node.x, y: node.y },
          data: { label: node.label, type: node.type, description: node.description }
        }));
        const mappedEdges: Edge[] = data.edges.map((edge: MapEdge) => ({
          id: edge.id,
          source: edge.sourceId,
          target: edge.targetId,
          animated: true,
          markerEnd: { type: MarkerType.ArrowClosed }
        }));
        setNodes(mappedNodes);
        setEdges(mappedEdges);
      }
    } catch (error) {
      console.error("Failed to load map:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const onConnect = useCallback(
    async (params: Connection) => {
      if (!isEditMode) return;
      try {
        const response = await fetch("/api/map/edges", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sourceId: params.source,
            targetId: params.target
          }),
        });
        if (response.ok) {
          const newEdge = await response.json();
          setEdges((eds) => addEdge({ 
            id: newEdge.id,
            source: params.source,
            target: params.target,
            animated: true,
            markerEnd: { type: MarkerType.ArrowClosed }
          }, eds));
        }
      } catch (error) {
        console.error("Failed to create edge:", error);
      }
    },
    [isEditMode, setEdges]
  );

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
    setIsEditingNode(false);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
    setIsEditingNode(false);
  }, []);

  const addNode = async () => {
    try {
      const response = await fetch("/api/map/nodes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: "新地点",
          type: "地点",
          x: Math.random() * 400 + 100,
          y: Math.random() * 300 + 100,
          description: ""
        }),
      });
      if (response.ok) {
        const newNode = await response.json();
        const node: Node = {
          id: newNode.id,
          type: "custom",
          position: { x: newNode.x, y: newNode.y },
          data: { label: newNode.label, type: newNode.type, description: newNode.description }
        };
        setNodes((nds) => [...nds, node]);
      }
    } catch (error) {
      console.error("Failed to create node:", error);
    }
  };

  const startEditNode = () => {
    if (!selectedNode) return;
    setEditForm({
      label: selectedNode.data.label as string,
      type: (selectedNode.data.type as "城镇" | "地点" | "事件") || "地点",
      description: (selectedNode.data.description as string) || "",
    });
    setIsEditingNode(true);
  };

  const saveNodeEdit = async () => {
    if (!selectedNode) return;
    try {
      const response = await fetch(`/api/map/nodes/${selectedNode.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: editForm.label,
          type: editForm.type,
          x: selectedNode.position.x,
          y: selectedNode.position.y,
          description: editForm.description
        }),
      });
      if (response.ok) {
        const updatedNode = await response.json();
        setNodes((nds) =>
          nds.map((n) =>
            n.id === selectedNode.id
              ? { ...n, data: { ...n.data, ...editForm } }
              : n
          )
        );
        setSelectedNode((prev) => prev ? { ...prev, data: { ...prev.data, ...editForm } } : null);
        setIsEditingNode(false);
      }
    } catch (error) {
      console.error("Failed to update node:", error);
    }
  };

  const deleteNode = async () => {
    if (!selectedNode) return;
    if (!confirm(`确定要删除节点"${selectedNode.data.label as string}"吗？`)) return;
    try {
      const response = await fetch(`/api/map/nodes/${selectedNode.id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setNodes((nds) => nds.filter((n) => n.id !== selectedNode.id));
        setEdges((eds) => eds.filter((e) => e.source !== selectedNode.id && e.target !== selectedNode.id));
        setSelectedNode(null);
      }
    } catch (error) {
      console.error("Failed to delete node:", error);
    }
  };

  const handleNodesChange = useCallback(
    (changes: any[]) => {
      onNodesChange(changes);
      changes.forEach(async (change: any) => {
        if (change.type === "position" && isEditMode) {
          const node = nodes.find((n) => n.id === change.id);
          if (node && change.position) {
            try {
              await fetch(`/api/map/nodes/${change.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  label: node.data.label,
                  type: node.data.type,
                  x: change.position.x,
                  y: change.position.y,
                  description: node.data.description
                }),
              });
            } catch (error) {
              console.error("Failed to update node position:", error);
            }
          }
        }
      });
    },
    [onNodesChange, isEditMode, nodes]
  );

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
            className="w-full h-full object-cover opacity-45"
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
              <h1 className="text-xl font-bold">世界拓扑图</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isEditMode && (
              <Button
                variant="secondary"
                size="sm"
                onClick={addNode}
                className="bg-zinc-800 hover:bg-zinc-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                添加节点
              </Button>
            )}
            <Button
              variant={isEditMode ? "default" : "secondary"}
              onClick={() => setIsEditMode(!isEditMode)}
              className={isEditMode ? "bg-amber-600 hover:bg-amber-700" : "bg-zinc-800 hover:bg-zinc-700"}
            >
              <Edit className="h-4 w-4 mr-2" />
              {isEditMode ? "退出编辑" : "编辑模式"}
            </Button>
          </div>
        </div>
      </header>
      <div className="flex-1 flex relative">
        <div ref={reactFlowWrapper} className="flex-1 relative z-10">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={handleNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            nodesDraggable={isEditMode}
            nodesConnectable={isEditMode}
            fitView
            minZoom={0.1}
            maxZoom={2.0}
            className="bg-transparent"
          >
            <MiniMap
              className="bg-zinc-900 border-zinc-800"
              nodeColor={(n) => {
                const type = n.data.type as string;
                if (type === "城镇") return "#3b82f6";
                if (type === "地点") return "#22c55e";
                return "#f59e0b";
              }}
            />
          </ReactFlow>
        </div>
        {selectedNode && (
          <div className="w-80 border-l border-zinc-800 bg-zinc-900 p-4 overflow-y-auto relative z-20">
            <Card className="bg-zinc-800 border-zinc-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-amber-500" />
                  {selectedNode.data.label as string}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditingNode ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-zinc-400 mb-1">名称</label>
                      <input
                        type="text"
                        className="w-full bg-zinc-700 border border-zinc-600 rounded px-3 py-2 text-white"
                        value={editForm.label}
                        onChange={(e) => setEditForm({ ...editForm, label: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-zinc-400 mb-1">类型</label>
                      <select
                        className="w-full bg-zinc-700 border border-zinc-600 rounded px-3 py-2 text-white"
                        value={editForm.type}
                        onChange={(e) => setEditForm({ ...editForm, type: e.target.value as any })}
                      >
                        <option value="城镇">城镇</option>
                        <option value="地点">地点</option>
                        <option value="事件">事件</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-zinc-400 mb-1">描述</label>
                      <textarea
                        className="w-full bg-zinc-700 border border-zinc-600 rounded px-3 py-2 text-white h-32"
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
                ) : (
                  <div className="space-y-4">
                    <div>
                      <span className="text-zinc-400 text-sm">类型:</span>
                      <span className="ml-2 text-white">{selectedNode.data.type as string}</span>
                    </div>
                    <div>
                      <span className="text-zinc-400 text-sm">坐标:</span>
                      <span className="ml-2 text-white">
                        ({Math.round(selectedNode.position.x)}, {Math.round(selectedNode.position.y)})
                      </span>
                    </div>
                    <div className="pt-4 border-t border-zinc-700">
                      <p className="text-zinc-400 text-sm mb-2">描述:</p>
                      <p className="text-zinc-300">{(selectedNode.data.description as string) || "暂无描述"}</p>
                    </div>
                    {isEditMode && (
                      <div className="flex gap-2 pt-4 border-t border-zinc-700">
                        <Button variant="ghost" size="sm" onClick={startEditNode} className="flex-1">
                          <Edit className="h-4 w-4 mr-2" />
                          编辑
                        </Button>
                        <Button variant="ghost" size="sm" onClick={deleteNode} className="flex-1 text-red-400 hover:text-red-300 hover:bg-red-900/20">
                          <Trash2 className="h-4 w-4 mr-2" />
                          删除
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MapPage() {
  return (
    <ReactFlowProvider>
      <MapContent />
    </ReactFlowProvider>
  );
}

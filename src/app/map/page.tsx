"use client";

import { useState, useCallback, useRef } from "react";
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
import { Map as MapIcon, ArrowLeft, Edit, Plus, Info, Trash2, X, Save, Image, Lock, Eye } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useApp } from "@/contexts/AppContext";

const initialNodes: Node[] = [
  {
    id: "1",
    type: "custom",
    position: { x: 250, y: 100 },
    data: { label: "起始城镇", type: "城镇", description: "冒险从这里开始的和平城镇" },
  },
  {
    id: "2",
    type: "custom",
    position: { x: 100, y: 250 },
    data: { label: "迷雾森林", type: "地点", description: "充满未知迷雾的神秘森林" },
  },
  {
    id: "3",
    type: "custom",
    position: { x: 400, y: 250 },
    data: { label: "废弃矿山", type: "地点", description: "曾经繁荣的矿山，如今已被废弃" },
  },
  {
    id: "4",
    type: "custom",
    position: { x: 250, y: 400 },
    data: { label: "哥布林营地", type: "事件", description: "哥布林聚集的危险营地" },
  },
];

const initialEdges: Edge[] = [
  { id: "e1-2", source: "1", target: "2", animated: true, markerEnd: { type: MarkerType.ArrowClosed } },
  { id: "e1-3", source: "1", target: "3", animated: true, markerEnd: { type: MarkerType.ArrowClosed } },
  { id: "e2-4", source: "2", target: "4", animated: true, markerEnd: { type: MarkerType.ArrowClosed } },
  { id: "e3-4", source: "3", target: "4", animated: true, markerEnd: { type: MarkerType.ArrowClosed } },
];

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
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [isEditMode, setIsEditMode] = useState(false);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isEditingNode, setIsEditingNode] = useState(false);
  const [editForm, setEditForm] = useState({ label: "", type: "地点" as "城镇" | "地点" | "事件", description: "" });
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showResourceSelector, setShowResourceSelector] = useState(false);
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { resources, settings, updateSettings, verifyPassword } = useApp();

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true, markerEnd: { type: MarkerType.ArrowClosed } }, eds)),
    [setEdges]
  );

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
    setIsEditingNode(false);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
    setIsEditingNode(false);
  }, []);

  const addNode = () => {
    const newNode: Node = {
      id: `node-${Date.now()}`,
      type: "custom",
      position: { x: Math.random() * 400 + 100, y: Math.random() * 300 + 100 },
      data: { label: "新地点", type: "地点", description: "" },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const startEditNode = () => {
    if (!selectedNode) return;
    setEditForm({
      label: selectedNode.data.label,
      type: selectedNode.data.type || "地点",
      description: selectedNode.data.description || "",
    });
    setIsEditingNode(true);
  };

  const saveNodeEdit = () => {
    if (!selectedNode) return;
    setNodes((nds) =>
      nds.map((n) =>
        n.id === selectedNode.id
          ? { ...n, data: { ...n.data, ...editForm } }
          : n
      )
    );
    setSelectedNode((prev) => prev ? { ...prev, data: { ...prev.data, ...editForm } } : null);
    setIsEditingNode(false);
  };

  const deleteNode = () => {
    if (!selectedNode) return;
    if (confirm(`确定要删除节点"${selectedNode.data.label}"吗？`)) {
      setNodes((nds) => nds.filter((n) => n.id !== selectedNode.id));
      setEdges((eds) => eds.filter((e) => e.source !== selectedNode.id && e.target !== selectedNode.id));
      setSelectedNode(null);
    }
  };

  const handleVerifyPassword = () => {
    if (verifyPassword(password)) {
      setIsAuthenticated(true);
      setShowPasswordModal(false);
      setPassword("");
      setShowResourceSelector(true);
    } else {
      alert("密码错误");
    }
  };

  const selectMapBg = (url: string | null) => {
    updateSettings({ mapBg: url });
    setShowResourceSelector(false);
  };

  const mapResources = resources.filter((r) => r.category === "mapBg" || r.category === "general");

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      {settings.mapBg && (
        <div className="fixed inset-0 z-0 pointer-events-none">
          <img src={settings.mapBg} alt="地图背景" className="w-full h-full object-cover opacity-30 blur-[2px]" />
        </div>
      )}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Lock className="h-5 w-5" />
                输入密码
              </h3>
              <button onClick={() => setShowPasswordModal(false)} className="text-zinc-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-1">密码</label>
                <input
                  type="password"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleVerifyPassword()}
                />
              </div>
              <Button className="w-full bg-amber-600 hover:bg-amber-700" onClick={handleVerifyPassword}>
                确认
              </Button>
            </div>
          </div>
        </div>
      )}

      {showResourceSelector && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Image className="h-5 w-5" />
                选择地图背景
              </h3>
              <button onClick={() => setShowResourceSelector(false)} className="text-zinc-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <Button
                variant="ghost"
                className="w-full justify-start border border-zinc-700 bg-zinc-800"
                onClick={() => selectMapBg(null)}
              >
                <Eye className="h-4 w-4 mr-2" />
                使用默认背景
              </Button>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {mapResources.map((img) => (
                  <div
                    key={img.id}
                    className="relative group cursor-pointer"
                    onClick={() => selectMapBg(img.url)}
                  >
                    <div className="aspect-video bg-zinc-800 rounded-lg overflow-hidden border border-zinc-700">
                      <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                    </div>
                    <p className="text-sm text-zinc-400 mt-1 truncate">{img.name}</p>
                  </div>
                ))}
              </div>
              {mapResources.length === 0 && (
                <p className="text-zinc-500 text-center py-8">暂无图片资源，请先去资源库上传</p>
              )}
            </div>
          </div>
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
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                if (isAuthenticated) {
                  setShowResourceSelector(true);
                } else {
                  setShowPasswordModal(true);
                }
              }}
              className="bg-zinc-800 hover:bg-zinc-700"
            >
              <Image className="h-4 w-4 mr-2" />
              背景设置
            </Button>
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
            onNodesChange={onNodesChange}
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
            className={settings.mapBg ? "bg-transparent" : "bg-zinc-950"}
          >
            {!settings.mapBg && <Background color="#3f3f46" gap={16} />}
            <MiniMap
              className="bg-zinc-900 border-zinc-800"
              nodeColor={(n) => {
                const type = n.data.type;
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
                  {selectedNode.data.label}
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
                      <span className="ml-2 text-white">{selectedNode.data.type}</span>
                    </div>
                    <div>
                      <span className="text-zinc-400 text-sm">坐标:</span>
                      <span className="ml-2 text-white">
                        ({Math.round(selectedNode.position.x)}, {Math.round(selectedNode.position.y)})
                      </span>
                    </div>
                    <div className="pt-4 border-t border-zinc-700">
                      <p className="text-zinc-400 text-sm mb-2">描述:</p>
                      <p className="text-zinc-300">{selectedNode.data.description || "暂无描述"}</p>
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

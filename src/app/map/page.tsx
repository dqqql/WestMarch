"use client";

import { useState, useCallback, useRef } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
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
import { Map as MapIcon, ArrowLeft, Edit, Plus, Info } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const initialNodes: Node[] = [
  {
    id: "1",
    type: "custom",
    position: { x: 250, y: 100 },
    data: { label: "起始城镇", type: "城镇" },
  },
  {
    id: "2",
    type: "custom",
    position: { x: 100, y: 250 },
    data: { label: "迷雾森林", type: "地点" },
  },
  {
    id: "3",
    type: "custom",
    position: { x: 400, y: 250 },
    data: { label: "废弃矿山", type: "地点" },
  },
  {
    id: "4",
    type: "custom",
    position: { x: 250, y: 400 },
    data: { label: "哥布林营地", type: "事件" },
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

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true, markerEnd: { type: MarkerType.ArrowClosed } }, eds)),
    [setEdges]
  );

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const addNode = () => {
    const newNode: Node = {
      id: `node-${Date.now()}`,
      type: "custom",
      position: { x: Math.random() * 400 + 100, y: Math.random() * 300 + 100 },
      data: { label: "新地点", type: "地点" },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
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
      <div className="flex-1 flex">
        <div ref={reactFlowWrapper} className="flex-1">
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
            className="bg-zinc-950"
          >
            <Background color="#3f3f46" gap={16} />
            <Controls className="bg-zinc-900 border-zinc-800 text-zinc-100" />
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
          <div className="w-80 border-l border-zinc-800 bg-zinc-900 p-4 overflow-y-auto">
            <Card className="bg-zinc-800 border-zinc-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-amber-500" />
                  {selectedNode.data.label}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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
                  <p className="text-zinc-300">这里是 {selectedNode.data.label} 的详细描述。</p>
                </div>
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

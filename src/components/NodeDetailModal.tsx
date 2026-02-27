"use client";

import { useState, useEffect } from "react";
import { X, Edit, Save, Trash2, Move, Info, Calendar, Users, Building2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import NodeEditor from "./NodeEditor";

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

interface NodeDetailModalProps {
  node: MapNodeData | null;
  isEditMode: boolean;
  onClose: () => void;
  onUpdate: () => void;
  onDelete: () => void;
  onStartConnecting: () => void;
  onStartMigrating: () => void;
  connectingFrom: string | null;
  migratingFrom: string | null;
}

export default function NodeDetailModal({
  node,
  isEditMode,
  onClose,
  onUpdate,
  onDelete,
  onStartConnecting,
  onStartMigrating,
  connectingFrom,
  migratingFrom,
}: NodeDetailModalProps) {
  const [isEditingNode, setIsEditingNode] = useState(false);
  const [viewMode, setViewMode] = useState<"details" | "editor">("details");
  const [editForm, setEditForm] = useState({ label: "", type: "区域" as "据点" | "地城" | "区域", description: "" });

  useEffect(() => {
    if (node) {
      setEditForm({
        label: node.label,
        type: node.type,
        description: node.description || "",
      });
      setIsEditingNode(false);
      setViewMode("details");
    }
  }, [node]);

  const handleSave = async () => {
    if (!node) return;
    try {
      const response = await fetch(`/api/map/nodes/${node.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...node,
          label: editForm.label,
          type: editForm.type,
          description: editForm.description
        }),
      });
      if (response.ok) {
        onUpdate();
        setIsEditingNode(false);
      }
    } catch (error) {
      console.error("Failed to update node:", error);
    }
  };

  const getNodeTypeColor = (type: string) => {
    switch (type) {
      case "据点":
        return "text-amber-500";
      case "地城":
        return "text-purple-500";
      case "区域":
        return "text-green-500";
      default:
        return "text-zinc-500";
    }
  };

  const getNodeTypeBg = (type: string) => {
    switch (type) {
      case "据点":
        return "bg-amber-600/20 border-amber-600";
      case "地城":
        return "bg-purple-600/20 border-purple-600";
      case "区域":
        return "bg-green-600/20 border-green-600";
      default:
        return "bg-zinc-600/20 border-zinc-600";
    }
  };

  if (!node) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-5xl max-h-[90vh] overflow-hidden bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-700">
        <div className="flex items-center justify-between p-6 border-b border-zinc-700">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl ${getNodeTypeBg(node.type)} flex items-center justify-center border-2`}>
              <Info className={`h-6 w-6 ${getNodeTypeColor(node.type)}`} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{node.label}</h2>
              <p className={`text-sm ${getNodeTypeColor(node.type)}`}>{node.type}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-10 w-10 p-0 rounded-full hover:bg-zinc-800"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          <div className="flex gap-2 mb-6">
            <Button
              variant={viewMode === "details" ? "default" : "secondary"}
              onClick={() => setViewMode("details")}
              className={viewMode === "details" ? "bg-amber-600 hover:bg-amber-700" : ""}
            >
              <Info className="h-4 w-4 mr-2" />
              详情
            </Button>
            <Button
              variant={viewMode === "editor" ? "default" : "secondary"}
              onClick={() => setViewMode("editor")}
              className={viewMode === "editor" ? "bg-amber-600 hover:bg-amber-700" : ""}
            >
              <Edit className="h-4 w-4 mr-2" />
              编辑
            </Button>
          </div>

          {viewMode === "details" ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-zinc-800 border-zinc-700">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">基本信息</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <span className="text-zinc-400 text-sm">坐标:</span>
                      <span className="ml-2 text-white">
                        ({node.hexQ}, {node.hexR}, {node.hexS})
                      </span>
                    </div>
                    <div>
                      <p className="text-zinc-400 text-sm mb-2">描述:</p>
                      <p className="text-zinc-300">{node.description || "暂无描述"}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-zinc-800 border-zinc-700">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">内容统计</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-green-900/20 rounded-lg border border-green-800">
                      <Calendar className="h-5 w-5 text-green-400" />
                      <div>
                        <p className="text-sm text-zinc-400">事件</p>
                        <p className="text-2xl font-bold text-green-400">{node.events?.length || 0}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-blue-900/20 rounded-lg border border-blue-800">
                      <Users className="h-5 w-5 text-blue-400" />
                      <div>
                        <p className="text-sm text-zinc-400">人物</p>
                        <p className="text-2xl font-bold text-blue-400">{node.characters?.length || 0}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-purple-900/20 rounded-lg border border-purple-800">
                      <Building2 className="h-5 w-5 text-purple-400" />
                      <div>
                        <p className="text-sm text-zinc-400">设施</p>
                        <p className="text-2xl font-bold text-purple-400">{node.facilities?.length || 0}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {isEditMode && (
                <div className="flex gap-3 pt-4 border-t border-zinc-700">
                  <Button
                    variant="secondary"
                    onClick={() => setIsEditingNode(true)}
                    className="flex-1"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    编辑节点
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={onStartConnecting}
                    className={`flex-1 ${connectingFrom ? "bg-amber-600/20 text-amber-400" : ""}`}
                  >
                    <Move className="h-4 w-4 mr-2" />
                    {connectingFrom ? "取消连接" : "连接节点"}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={onStartMigrating}
                    className={`flex-1 ${migratingFrom ? "bg-blue-600/20 text-blue-400" : ""}`}
                  >
                    <ArrowRight className="h-4 w-4 mr-2" />
                    {migratingFrom ? "取消迁移" : "迁移节点"}
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={onDelete}
                    className="flex-1"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    删除节点
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div>
              {isEditingNode ? (
                <Card className="bg-zinc-800 border-zinc-700 mb-6">
                  <CardHeader>
                    <CardTitle>编辑节点信息</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
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
                      <select
                        className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-2 text-white"
                        value={editForm.type}
                        onChange={(e) => setEditForm({ ...editForm, type: e.target.value as any })}
                      >
                        <option value="据点">据点</option>
                        <option value="地城">地城</option>
                        <option value="区域">区域</option>
                      </select>
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
                      <Button className="flex-1 bg-amber-600 hover:bg-amber-700" onClick={handleSave}>
                        <Save className="h-4 w-4 mr-2" />
                        保存
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                isEditMode && (
                  <Button
                    variant="secondary"
                    onClick={() => setIsEditingNode(true)}
                    className="mb-6"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    编辑节点信息
                  </Button>
                )
              )}
              <NodeEditor
                nodeId={node.id}
                events={node.events || []}
                characters={node.characters || []}
                facilities={node.facilities || []}
                onUpdate={onUpdate}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

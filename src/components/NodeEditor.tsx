"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Edit2, Trash2, Save, X, Users, Calendar, Building2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface MapEvent {
  id: string;
  title: string;
  description: string | null;
  tags: string | null;
  order: number;
}

interface MapCharacter {
  id: string;
  name: string;
  description: string | null;
  role: string | null;
  avatar: string | null;
  order: number;
}

interface MapFacility {
  id: string;
  name: string;
  description: string | null;
  type: string | null;
  order: number;
}

interface NodeEditorProps {
  nodeId: string;
  events: MapEvent[];
  characters: MapCharacter[];
  facilities: MapFacility[];
  onUpdate: () => void;
}

export default function NodeEditor({ nodeId, events, characters, facilities, onUpdate }: NodeEditorProps) {
  const [activeTab, setActiveTab] = useState<"events" | "characters" | "facilities">("events");
  const [editingItem, setEditingItem] = useState<{ type: string; id?: string; data: any } | null>(null);

  const handleAddEvent = () => {
    setEditingItem({
      type: "event",
      data: { title: "", description: "", tags: "", order: events.length }
    });
  };

  const handleEditEvent = (event: MapEvent) => {
    setEditingItem({
      type: "event",
      id: event.id,
      data: { ...event }
    });
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm("确定要删除这个事件吗？")) return;
    try {
      await fetch(`/api/map/events/${id}`, { method: "DELETE" });
      onUpdate();
    } catch (error) {
      console.error("Failed to delete event:", error);
    }
  };

  const handleSaveEvent = async () => {
    if (!editingItem) return;
    try {
      const url = editingItem.id
        ? `/api/map/events/${editingItem.id}`
        : "/api/map/events";
      const method = editingItem.id ? "PUT" : "POST";
      const body = editingItem.id
        ? editingItem.data
        : { ...editingItem.data, nodeId };

      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      setEditingItem(null);
      onUpdate();
    } catch (error) {
      console.error("Failed to save event:", error);
    }
  };

  const handleAddCharacter = () => {
    setEditingItem({
      type: "character",
      data: { name: "", description: "", role: "", avatar: "", order: characters.length }
    });
  };

  const handleEditCharacter = (character: MapCharacter) => {
    setEditingItem({
      type: "character",
      id: character.id,
      data: { ...character }
    });
  };

  const handleDeleteCharacter = async (id: string) => {
    if (!confirm("确定要删除这个人物吗？")) return;
    try {
      await fetch(`/api/map/characters/${id}`, { method: "DELETE" });
      onUpdate();
    } catch (error) {
      console.error("Failed to delete character:", error);
    }
  };

  const handleSaveCharacter = async () => {
    if (!editingItem) return;
    try {
      const url = editingItem.id
        ? `/api/map/characters/${editingItem.id}`
        : "/api/map/characters";
      const method = editingItem.id ? "PUT" : "POST";
      const body = editingItem.id
        ? editingItem.data
        : { ...editingItem.data, nodeId };

      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      setEditingItem(null);
      onUpdate();
    } catch (error) {
      console.error("Failed to save character:", error);
    }
  };

  const handleAddFacility = () => {
    setEditingItem({
      type: "facility",
      data: { name: "", description: "", type: "", order: facilities.length }
    });
  };

  const handleEditFacility = (facility: MapFacility) => {
    setEditingItem({
      type: "facility",
      id: facility.id,
      data: { ...facility }
    });
  };

  const handleDeleteFacility = async (id: string) => {
    if (!confirm("确定要删除这个设施吗？")) return;
    try {
      await fetch(`/api/map/facilities/${id}`, { method: "DELETE" });
      onUpdate();
    } catch (error) {
      console.error("Failed to delete facility:", error);
    }
  };

  const handleSaveFacility = async () => {
    if (!editingItem) return;
    try {
      const url = editingItem.id
        ? `/api/map/facilities/${editingItem.id}`
        : "/api/map/facilities";
      const method = editingItem.id ? "PUT" : "POST";
      const body = editingItem.id
        ? editingItem.data
        : { ...editingItem.data, nodeId };

      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      setEditingItem(null);
      onUpdate();
    } catch (error) {
      console.error("Failed to save facility:", error);
    }
  };

  const renderEvents = () => (
    <div className="space-y-3">
      {events.map((event) => (
        <Card key={event.id} className="bg-zinc-800 border-zinc-700">
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h4 className="font-semibold text-white">{event.title}</h4>
                {event.description && (
                  <p className="text-sm text-zinc-400 mt-1">{event.description}</p>
                )}
                {event.tags && (
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {event.tags.split(",").map((tag, i) => (
                      <span key={i} className="text-xs bg-zinc-700 px-2 py-1 rounded">{tag.trim()}</span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-1 ml-2">
                <Button variant="ghost" size="sm" onClick={() => handleEditEvent(event)}>
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDeleteEvent(event.id)} className="text-red-400">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderCharacters = () => (
    <div className="space-y-3">
      {characters.map((character) => (
        <Card key={character.id} className="bg-zinc-800 border-zinc-700">
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h4 className="font-semibold text-white">{character.name}</h4>
                {character.role && (
                  <p className="text-sm text-amber-400">{character.role}</p>
                )}
                {character.description && (
                  <p className="text-sm text-zinc-400 mt-1">{character.description}</p>
                )}
              </div>
              <div className="flex gap-1 ml-2">
                <Button variant="ghost" size="sm" onClick={() => handleEditCharacter(character)}>
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDeleteCharacter(character.id)} className="text-red-400">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderFacilities = () => (
    <div className="space-y-3">
      {facilities.map((facility) => (
        <Card key={facility.id} className="bg-zinc-800 border-zinc-700">
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h4 className="font-semibold text-white">{facility.name}</h4>
                {facility.type && (
                  <p className="text-sm text-blue-400">{facility.type}</p>
                )}
                {facility.description && (
                  <p className="text-sm text-zinc-400 mt-1">{facility.description}</p>
                )}
              </div>
              <div className="flex gap-1 ml-2">
                <Button variant="ghost" size="sm" onClick={() => handleEditFacility(facility)}>
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDeleteFacility(facility.id)} className="text-red-400">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderEditForm = () => {
    if (!editingItem) return null;

    const isEvent = editingItem.type === "event";
    const isCharacter = editingItem.type === "character";
    const isFacility = editingItem.type === "facility";

    const handleSave = () => {
      if (isEvent) handleSaveEvent();
      else if (isCharacter) handleSaveCharacter();
      else if (isFacility) handleSaveFacility();
    };

    return (
      <Card className="bg-zinc-800 border-zinc-700 mb-4">
        <CardHeader className="pb-3">
          <CardTitle className="flex justify-between items-center text-base">
            <span>
              {isEvent ? "编辑事件" : isCharacter ? "编辑人物" : "编辑设施"}
            </span>
            <Button variant="ghost" size="sm" onClick={() => setEditingItem(null)} className="h-8 w-8 p-0">
              <X className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEvent && (
            <>
              <div>
                <label className="block text-sm text-zinc-400 mb-1">标题</label>
                <Input
                  value={editingItem.data.title}
                  onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, title: e.target.value } })}
                  className="bg-zinc-700 border-zinc-600"
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1">描述</label>
                <Textarea
                  value={editingItem.data.description || ""}
                  onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, description: e.target.value } })}
                  className="bg-zinc-700 border-zinc-600 h-24"
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1">标签 (逗号分隔)</label>
                <Input
                  value={editingItem.data.tags || ""}
                  onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, tags: e.target.value } })}
                  className="bg-zinc-700 border-zinc-600"
                  placeholder="标签1, 标签2, 标签3"
                />
              </div>
            </>
          )}
          {isCharacter && (
            <>
              <div>
                <label className="block text-sm text-zinc-400 mb-1">姓名</label>
                <Input
                  value={editingItem.data.name}
                  onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, name: e.target.value } })}
                  className="bg-zinc-700 border-zinc-600"
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1">角色</label>
                <Input
                  value={editingItem.data.role || ""}
                  onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, role: e.target.value } })}
                  className="bg-zinc-700 border-zinc-600"
                  placeholder="NPC、商人、守卫等"
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1">描述</label>
                <Textarea
                  value={editingItem.data.description || ""}
                  onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, description: e.target.value } })}
                  className="bg-zinc-700 border-zinc-600 h-24"
                />
              </div>
            </>
          )}
          {isFacility && (
            <>
              <div>
                <label className="block text-sm text-zinc-400 mb-1">名称</label>
                <Input
                  value={editingItem.data.name}
                  onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, name: e.target.value } })}
                  className="bg-zinc-700 border-zinc-600"
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1">类型</label>
                <Input
                  value={editingItem.data.type || ""}
                  onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, type: e.target.value } })}
                  className="bg-zinc-700 border-zinc-600"
                  placeholder="商店、酒馆、教堂等"
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1">描述</label>
                <Textarea
                  value={editingItem.data.description || ""}
                  onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, description: e.target.value } })}
                  className="bg-zinc-700 border-zinc-600 h-24"
                />
              </div>
            </>
          )}
          <div className="flex gap-2 pt-2">
            <Button variant="ghost" onClick={() => setEditingItem(null)} className="flex-1">取消</Button>
            <Button className="flex-1 bg-amber-600 hover:bg-amber-700" onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              保存
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={activeTab === "events" ? "default" : "secondary"}
          onClick={() => setActiveTab("events")}
          className={activeTab === "events" ? "bg-amber-600" : ""}
          size="sm"
        >
          <Calendar className="h-4 w-4 mr-2" />
          事件 ({events.length})
        </Button>
        <Button
          variant={activeTab === "characters" ? "default" : "secondary"}
          onClick={() => setActiveTab("characters")}
          className={activeTab === "characters" ? "bg-amber-600" : ""}
          size="sm"
        >
          <Users className="h-4 w-4 mr-2" />
          人物 ({characters.length})
        </Button>
        <Button
          variant={activeTab === "facilities" ? "default" : "secondary"}
          onClick={() => setActiveTab("facilities")}
          className={activeTab === "facilities" ? "bg-amber-600" : ""}
          size="sm"
        >
          <Building2 className="h-4 w-4 mr-2" />
          设施 ({facilities.length})
        </Button>
      </div>

      {renderEditForm()}

      <div className="flex justify-end">
        {activeTab === "events" && (
          <Button onClick={handleAddEvent} className="bg-green-600 hover:bg-green-700" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            添加事件
          </Button>
        )}
        {activeTab === "characters" && (
          <Button onClick={handleAddCharacter} className="bg-blue-600 hover:bg-blue-700" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            添加人物
          </Button>
        )}
        {activeTab === "facilities" && (
          <Button onClick={handleAddFacility} className="bg-purple-600 hover:bg-purple-700" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            添加设施
          </Button>
        )}
      </div>

      <div className="mt-4 max-h-80 overflow-y-auto">
        {activeTab === "events" && renderEvents()}
        {activeTab === "characters" && renderCharacters()}
        {activeTab === "facilities" && renderFacilities()}
      </div>
    </div>
  );
}

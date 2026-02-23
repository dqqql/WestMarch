"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, User, Calendar, X, Plus, Edit2, Trash2, Tag } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

interface Character {
  id: string;
  name: string;
  race: string;
  class: string;
  img: string | null;
}

interface Party {
  id: string;
  title: string;
  content: string;
  authorId: string;
  author: { id: string; username: string; nickname: string | null };
  characterId: string | null;
  character: Character | null;
  maxCount: number;
  nextSessionTime: string | null;
  members: { id: string; character: Character }[];
  createdAt: string;
  updatedAt: string;
}

export default function PartyPage() {
  const { user } = useAuth();
  const [parties, setParties] = useState<Party[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingParty, setEditingParty] = useState<Party | null>(null);
  const [showCharacterSelector, setShowCharacterSelector] = useState(false);
  const [showJoinCharacterSelector, setShowJoinCharacterSelector] = useState(false);
  const [joiningPartyId, setJoiningPartyId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    character: null as Character | null,
    maxCount: 4,
    nextSessionTime: "",
  });

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [partiesRes, charsRes] = await Promise.all([
        fetch("/api/parties"),
        fetch(`/api/characters?userId=${user?.id}`)
      ]);
      if (partiesRes.ok) {
        setParties(await partiesRes.json());
      }
      if (charsRes.ok) {
        setCharacters(await charsRes.json());
      }
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const selectCharacter = (char: Character) => {
    setFormData({ ...formData, character: char });
    setShowCharacterSelector(false);
  };

  const handleCreateParty = async () => {
    if (!formData.title || !formData.content || !user) return;
    try {
      const response = await fetch("/api/parties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          content: formData.content,
          authorId: user.id,
          characterId: formData.character?.id || null,
          maxCount: formData.maxCount,
          nextSessionTime: formData.nextSessionTime || null
        }),
      });
      if (response.ok) {
        const createdParty = await response.json();
        setParties([createdParty, ...parties]);
        setShowCreateModal(false);
        setFormData({
          title: "",
          content: "",
          character: null,
          maxCount: 4,
          nextSessionTime: "",
        });
      }
    } catch (error) {
      console.error("Failed to create party:", error);
      alert("创建组队失败");
    }
  };

  const handleEditParty = async () => {
    if (!editingParty || !formData.title || !formData.content) return;
    try {
      const response = await fetch(`/api/parties/${editingParty.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          content: formData.content,
          characterId: formData.character?.id || null,
          maxCount: formData.maxCount,
          nextSessionTime: formData.nextSessionTime || null
        }),
      });
      if (response.ok) {
        const updatedParty = await response.json();
        setParties(parties.map(p => p.id === editingParty.id ? updatedParty : p));
        setEditingParty(null);
        setFormData({
          title: "",
          content: "",
          character: null,
          maxCount: 4,
          nextSessionTime: "",
        });
      }
    } catch (error) {
      console.error("Failed to edit party:", error);
      alert("编辑组队失败");
    }
  };

  const handleDeleteParty = async (id: string) => {
    if (!confirm("确定要删除这个组队信息吗？")) return;
    try {
      const response = await fetch(`/api/parties/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setParties(parties.filter(p => p.id !== id));
      }
    } catch (error) {
      console.error("Failed to delete party:", error);
      alert("删除组队失败");
    }
  };

  const openEditModal = (party: Party) => {
    setEditingParty(party);
    setFormData({
      title: party.title,
      content: party.content,
      character: party.character,
      maxCount: party.maxCount,
      nextSessionTime: party.nextSessionTime ? party.nextSessionTime.slice(0, 16) : "",
    });
  };

  const isPartyOwner = (party: Party) => {
    return user && party.authorId === user.id;
  };

  const selectJoinCharacter = async (char: Character) => {
    if (!joiningPartyId) return;
    try {
      const response = await fetch(`/api/parties/${joiningPartyId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "join",
          characterId: char.id
        }),
      });
      if (response.ok) {
        const updatedParty = await response.json();
        setParties(parties.map(p => p.id === joiningPartyId ? updatedParty : p));
      }
    } catch (error) {
      console.error("Failed to join party:", error);
      alert("加入队伍失败");
    }
    setShowJoinCharacterSelector(false);
    setJoiningPartyId(null);
  };

  const startJoinParty = (id: string) => {
    setJoiningPartyId(id);
    setShowJoinCharacterSelector(true);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100">
        <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="hover:text-amber-400 transition-colors">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div className="flex items-center gap-2">
                <Users className="h-6 w-6 text-amber-500" />
                <h1 className="text-xl font-bold">组队大厅</h1>
              </div>
            </div>
          </div>
        </header>

        <main className="min-h-[calc(100vh-160px)] flex items-center justify-center px-4 py-8 relative z-10">
          <div className="text-center">
            <Users className="h-16 w-16 text-zinc-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">需要登录</h2>
            <p className="text-zinc-400 mb-6">请先登录才能查看组队信息</p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Link href="/">
                <Button className="bg-amber-600 hover:bg-amber-700">
                  返回首页登录
                </Button>
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center">
        <p className="text-zinc-400">加载中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 overflow-y-auto py-8">
          <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-6 w-full max-w-lg mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">{editingParty ? "编辑组队" : "发布新组队"}</h3>
              <button 
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingParty(null);
                  setFormData({
                    title: "",
                    content: "",
                    character: null,
                    maxCount: 4,
                    nextSessionTime: "",
                  });
                }} 
                className="text-zinc-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-1">标题</label>
                <input 
                  type="text" 
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white" 
                  placeholder="组队标题"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-zinc-400 mb-1">队伍人数</label>
                  <input 
                    type="number" 
                    min="1" 
                    max="10" 
                    className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white" 
                    value={formData.maxCount}
                    onChange={(e) => setFormData({ ...formData, maxCount: parseInt(e.target.value) || 4 })}
                  />
                </div>
                <div>
                  <label className="block text-sm text-zinc-400 mb-1">使用角色</label>
                  {formData.character ? (
                    <Button 
                      variant="ghost" 
                      className="w-full bg-zinc-800 hover:bg-zinc-700 justify-start"
                      onClick={() => setShowCharacterSelector(true)}
                    >
                      <User className="h-4 w-4 mr-2" />
                      {formData.character.name}
                    </Button>
                  ) : (
                    <Button 
                      className="w-full bg-zinc-800 hover:bg-zinc-700"
                      onClick={() => setShowCharacterSelector(true)}
                    >
                      <User className="h-4 w-4 mr-2" />
                      选择角色
                    </Button>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1">下次跑团时间</label>
                <input 
                  type="datetime-local" 
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white" 
                  value={formData.nextSessionTime}
                  onChange={(e) => setFormData({ ...formData, nextSessionTime: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1">内容</label>
                <textarea 
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white h-32" 
                  placeholder="组队内容"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                />
              </div>
              <div className="flex gap-3">
                <Button 
                  variant="ghost" 
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingParty(null);
                  }}
                >
                  取消
                </Button>
                <Button 
                  className="flex-1 bg-amber-600 hover:bg-amber-700" 
                  onClick={editingParty ? handleEditParty : handleCreateParty}
                >
                  {editingParty ? "保存" : "发布"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCharacterSelector && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <User className="h-5 w-5" />
                选择角色
              </h3>
              <button onClick={() => setShowCharacterSelector(false)} className="text-zinc-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {characters.map((char) => (
                  <div
                    key={char.id}
                    className="bg-zinc-800 border border-zinc-700 rounded-lg p-4 cursor-pointer hover:border-amber-500/50 transition-colors"
                    onClick={() => selectCharacter(char)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-zinc-900 rounded-lg flex items-center justify-center overflow-hidden">
                        {char.img ? (
                          <img src={char.img} alt={char.name} className="w-full h-full object-cover" />
                        ) : (
                          <User className="h-8 w-8 text-zinc-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{char.name}</p>
                        <p className="text-sm text-zinc-400">{char.race} · {char.class}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {characters.length === 0 && (
                <p className="text-zinc-500 text-center py-8">暂无角色，请先去角色卡册创建</p>
              )}
            </div>
          </div>
        </div>
      )}

      {showJoinCharacterSelector && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <User className="h-5 w-5" />
                选择加入队伍的角色
              </h3>
              <button onClick={() => { setShowJoinCharacterSelector(false); setJoiningPartyId(null); }} className="text-zinc-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {characters.map((char) => {
                  const party = parties.find(p => p.id === joiningPartyId);
                  const alreadyJoined = party?.members.some(m => m.character.id === char.id) || false;
                  return (
                    <div
                      key={char.id}
                      className={`bg-zinc-800 border border-zinc-700 rounded-lg p-4 cursor-pointer transition-colors ${alreadyJoined ? 'opacity-50 cursor-not-allowed' : 'hover:border-amber-500/50'}`}
                      onClick={() => !alreadyJoined && selectJoinCharacter(char)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-zinc-900 rounded-lg flex items-center justify-center overflow-hidden">
                          {char.img ? (
                            <img src={char.img} alt={char.name} className="w-full h-full object-cover" />
                          ) : (
                            <User className="h-8 w-8 text-zinc-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{char.name}</p>
                          <p className="text-sm text-zinc-400">{char.race} · {char.class}</p>
                          {alreadyJoined && <p className="text-xs text-amber-400 mt-1">已加入</p>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {characters.length === 0 && (
                <p className="text-zinc-500 text-center py-8">暂无角色，请先去角色卡册创建</p>
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
              <Users className="h-6 w-6 text-amber-500" />
              <h1 className="text-xl font-bold">组队大厅</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {user && (
              <Button 
                className="bg-amber-600 hover:bg-amber-700" 
                onClick={() => setShowCreateModal(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                发布组队
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-3xl mx-auto space-y-6">
          {parties.map((party) => {
            const authorName = party.author.nickname || party.author.username;
            const currentCount = party.members.length;
            return (
              <Card
                key={party.id}
                className="bg-zinc-900 border-zinc-800 hover:border-amber-500/50 transition-colors"
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-1 rounded text-xs font-medium border bg-blue-900/50 text-blue-300 border-blue-800">
                          <Tag className="h-3 w-3 inline mr-1" />
                          {currentCount}/{party.maxCount}
                        </span>
                      </div>
                      <CardTitle className="text-xl">{party.title}</CardTitle>
                      <CardDescription className="flex items-center gap-2 flex-wrap">
                        <span>发起者: {authorName}</span>
                        {party.character && <span>• 角色: {party.character.name}</span>}
                        <span className="text-zinc-600">
                          • {new Date(party.createdAt).toLocaleString("zh-CN")}
                        </span>
                        {party.nextSessionTime && (
                          <span className="text-amber-400 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            • {new Date(party.nextSessionTime).toLocaleString("zh-CN")}
                          </span>
                        )}
                      </CardDescription>
                    </div>
                    {isPartyOwner(party) && (
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => {
                          setEditingParty(party);
                          setShowCreateModal(true);
                        }}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteParty(party.id)}>
                          <Trash2 className="h-4 w-4 text-red-400" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-zinc-300">{party.content}</p>
                  
                  {party.members.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm text-zinc-400">参与角色:</p>
                      <div className="flex flex-wrap gap-2">
                        {party.members.map((member) => (
                          <div key={member.id} className="flex items-center gap-2 bg-zinc-800 px-3 py-1 rounded-full border border-zinc-700">
                            <div className="w-6 h-6 bg-zinc-900 rounded-full flex items-center justify-center overflow-hidden">
                              {member.character.img ? (
                                <img src={member.character.img} alt={member.character.name} className="w-full h-full object-cover" />
                              ) : (
                                <User className="h-3 w-3 text-zinc-600" />
                              )}
                            </div>
                            <span className="text-sm">{member.character.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {currentCount < party.maxCount && (
                    <Button 
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      onClick={() => startJoinParty(party.id)}
                    >
                      <Users className="h-4 w-4 mr-2" />
                      加入队伍
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
          {parties.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-zinc-600 mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2 text-zinc-400">暂无组队信息</h2>
              <p className="text-zinc-500">点击上方按钮发布第一个组队</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

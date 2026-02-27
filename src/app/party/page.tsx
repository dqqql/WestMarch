"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, User, X, Plus, Edit2, Trash2, Tag, Calendar } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useApp } from "@/contexts/AppContext";

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
  const { isClient } = useApp();
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
        <header className="border-b border-zinc-800/50 bg-zinc-900/40 backdrop-blur-2xl sticky top-0 z-50">
          <div className="container mx-auto px-6 py-5 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href="/" className="hover:text-amber-400 transition-colors p-2 hover:bg-zinc-800/60 rounded-xl">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-rose-600 rounded-xl flex items-center justify-center shadow-lg shadow-rose-500/30">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-xl font-bold text-zinc-100">组队大厅</h1>
              </div>
            </div>
          </div>
        </header>

        <main className="min-h-[calc(100vh-160px)] flex items-center justify-center px-6 py-8 relative z-10">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-rose-500/20 to-rose-600/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Users className="h-10 w-10 text-rose-400" />
            </div>
            <h2 className="text-2xl font-bold mb-2 text-zinc-100">需要登录</h2>
            <p className="text-zinc-400 mb-6">请先登录才能查看组队信息</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/">
                <Button className="bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white rounded-xl shadow-lg shadow-rose-500/30 transition-all">
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
      {isClient && (
        <div className="fixed inset-0 z-0 pointer-events-none">
          <img
            src="/images/general-bg.png"
            alt="组队背景"
            className="w-full h-full object-cover opacity-55 transition-opacity duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/60 via-zinc-950/40 to-zinc-950/80" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-rose-500/10 via-transparent to-transparent" />
        </div>
      )}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 overflow-y-auto py-8 animate-in fade-in duration-300" onClick={() => {
          setShowCreateModal(false);
          setEditingParty(null);
          setFormData({
            title: "",
            content: "",
            character: null,
            maxCount: 4,
            nextSessionTime: "",
          });
        }}>
          <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-700/50 rounded-3xl p-8 w-full max-w-lg mx-4 shadow-2xl shadow-black/50 animate-in zoom-in-95 duration-300" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-rose-600 rounded-xl flex items-center justify-center shadow-lg shadow-rose-500/30">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-zinc-100">{editingParty ? "编辑组队" : "发布新组队"}</h3>
                  <p className="text-zinc-500 text-sm">开始你的冒险</p>
                </div>
              </div>
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
                className="text-zinc-500 hover:text-zinc-300 transition-colors p-2 hover:bg-zinc-800 rounded-xl"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-5">
              <div>
                <label className="block text-sm text-zinc-400 mb-2">标题</label>
                <input 
                  type="text" 
                  className="w-full bg-zinc-800/60 border border-zinc-700/50 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500/50 focus:ring-2 focus:ring-rose-500/20 backdrop-blur-sm transition-all" 
                  placeholder="组队标题"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-zinc-400 mb-2">队伍人数</label>
                  <input 
                    type="number" 
                    min="1" 
                    max="10" 
                    className="w-full bg-zinc-800/60 border border-zinc-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-rose-500/50 focus:ring-2 focus:ring-rose-500/20 backdrop-blur-sm transition-all" 
                    value={formData.maxCount}
                    onChange={(e) => setFormData({ ...formData, maxCount: parseInt(e.target.value) || 4 })}
                  />
                </div>
                <div>
                  <label className="block text-sm text-zinc-400 mb-2">使用角色</label>
                  {formData.character ? (
                    <Button 
                      variant="ghost" 
                      className="w-full bg-zinc-800/60 hover:bg-zinc-700/60 justify-start rounded-xl border border-zinc-700/50 backdrop-blur-sm"
                      onClick={() => setShowCharacterSelector(true)}
                    >
                      <User className="h-4 w-4 mr-2" />
                      {formData.character.name}
                    </Button>
                  ) : (
                    <Button 
                      className="w-full bg-zinc-800/60 hover:bg-zinc-700/60 rounded-xl border border-zinc-700/50 backdrop-blur-sm"
                      onClick={() => setShowCharacterSelector(true)}
                    >
                      <User className="h-4 w-4 mr-2" />
                      选择角色
                    </Button>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-2">下次跑团时间</label>
                <input 
                  type="datetime-local" 
                  className="w-full bg-zinc-800/60 border border-zinc-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-rose-500/50 focus:ring-2 focus:ring-rose-500/20 backdrop-blur-sm transition-all" 
                  value={formData.nextSessionTime}
                  onChange={(e) => setFormData({ ...formData, nextSessionTime: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-2">内容</label>
                <textarea 
                  className="w-full bg-zinc-800/60 border border-zinc-700/50 rounded-xl px-4 py-3 text-white h-32 placeholder-zinc-500 focus:outline-none focus:border-rose-500/50 focus:ring-2 focus:ring-rose-500/20 backdrop-blur-sm transition-all resize-none" 
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
                  className="rounded-xl hover:bg-zinc-800/60"
                >
                  取消
                </Button>
                <Button 
                  className="flex-1 bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white rounded-xl shadow-lg shadow-rose-500/30 transition-all" 
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-300" onClick={() => setShowCharacterSelector(false)}>
          <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-700/50 rounded-3xl p-8 w-full max-w-2xl shadow-2xl shadow-black/50 animate-in zoom-in-95 duration-300" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold flex items-center gap-3 text-zinc-100">
                <div className="w-8 h-8 bg-gradient-to-br from-rose-500 to-rose-600 rounded-xl flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                选择角色
              </h3>
              <button onClick={() => setShowCharacterSelector(false)} className="text-zinc-500 hover:text-zinc-300 transition-colors p-2 hover:bg-zinc-800 rounded-xl">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {characters.map((char) => (
                  <div
                    key={char.id}
                    className="bg-zinc-800/60 border border-zinc-700/50 rounded-xl p-4 cursor-pointer hover:border-rose-500/50 transition-all duration-300 backdrop-blur-sm"
                    onClick={() => selectCharacter(char)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-rose-500 to-rose-600 rounded-xl flex items-center justify-center overflow-hidden shadow-lg shadow-rose-500/20">
                        {char.img ? (
                          <img src={char.img} alt={char.name} className="w-full h-full object-cover" />
                        ) : (
                          <User className="h-8 w-8 text-white" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-zinc-100">{char.name}</p>
                        <p className="text-sm text-zinc-400">{char.race} · {char.class}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {characters.length === 0 && (
                <div className="text-center py-12">
                  <User className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
                  <p className="text-zinc-500">暂无角色，请先去角色卡册创建</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showJoinCharacterSelector && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-300" onClick={() => { setShowJoinCharacterSelector(false); setJoiningPartyId(null); }}>
          <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-700/50 rounded-3xl p-8 w-full max-w-2xl shadow-2xl shadow-black/50 animate-in zoom-in-95 duration-300" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold flex items-center gap-3 text-zinc-100">
                <div className="w-8 h-8 bg-gradient-to-br from-rose-500 to-rose-600 rounded-xl flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                选择加入队伍的角色
              </h3>
              <button onClick={() => { setShowJoinCharacterSelector(false); setJoiningPartyId(null); }} className="text-zinc-500 hover:text-zinc-300 transition-colors p-2 hover:bg-zinc-800 rounded-xl">
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
                      className={`bg-zinc-800/60 border border-zinc-700/50 rounded-xl p-4 cursor-pointer transition-all duration-300 backdrop-blur-sm ${alreadyJoined ? 'opacity-50 cursor-not-allowed' : 'hover:border-rose-500/50'}`}
                      onClick={() => !alreadyJoined && selectJoinCharacter(char)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-rose-500 to-rose-600 rounded-xl flex items-center justify-center overflow-hidden shadow-lg shadow-rose-500/20">
                          {char.img ? (
                            <img src={char.img} alt={char.name} className="w-full h-full object-cover" />
                          ) : (
                            <User className="h-8 w-8 text-white" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-zinc-100">{char.name}</p>
                          <p className="text-sm text-zinc-400">{char.race} · {char.class}</p>
                          {alreadyJoined && <p className="text-xs text-rose-400 mt-1">已加入</p>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {characters.length === 0 && (
                <div className="text-center py-12">
                  <User className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
                  <p className="text-zinc-500">暂无角色，请先去角色卡册创建</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <header className="border-b border-zinc-800/50 bg-zinc-900/40 backdrop-blur-2xl sticky top-0 z-50">
        <div className="container mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="hover:text-rose-400 transition-colors p-2 hover:bg-zinc-800/60 rounded-xl">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-rose-600 rounded-xl flex items-center justify-center shadow-lg shadow-rose-500/30">
                <Users className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-zinc-100">组队大厅</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {user && (
              <Button 
                className="bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white rounded-xl shadow-lg shadow-rose-500/30 transition-all"
                onClick={() => setShowCreateModal(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                发布组队
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 relative z-10">
        <div className="max-w-4xl mx-auto space-y-6">
          {parties.map((party) => {
            const authorName = party.author.nickname || party.author.username;
            const currentCount = party.members.length;
            return (
              <Card
                key={party.id}
                className="bg-gradient-to-br from-zinc-900/80 to-zinc-950/80 border-zinc-700/50 hover:border-rose-500/50 transition-all duration-300 overflow-hidden group"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="px-3 py-1 bg-rose-900/40 text-rose-300 border border-rose-800/50 rounded-xl text-sm font-medium">
                          {currentCount}/{party.maxCount} 人
                        </span>
                        {party.nextSessionTime && (
                          <span className="px-3 py-1 bg-amber-900/40 text-amber-300 border border-amber-800/50 rounded-xl text-sm font-medium flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            {new Date(party.nextSessionTime).toLocaleString("zh-CN")}
                          </span>
                        )}
                      </div>
                      <CardTitle className="text-xl font-bold mb-2 text-zinc-100 group-hover:text-white transition-colors">
                        {party.title}
                      </CardTitle>
                      <CardDescription className="text-zinc-400 mb-4 leading-relaxed">
                        {party.content}
                      </CardDescription>
                      <div className="flex items-center gap-2 text-sm text-zinc-500 mb-4">
                        <span>发起者: {authorName}</span>
                      </div>
                      {party.members.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm text-zinc-400">队伍成员:</p>
                          <div className="flex flex-wrap gap-2">
                            {party.members.map((member) => (
                              <div
                                key={member.id}
                                className="flex items-center gap-2 bg-zinc-800/60 px-3 py-2 rounded-xl border border-zinc-700/50 backdrop-blur-sm"
                              >
                                <div className="w-6 h-6 bg-gradient-to-br from-rose-500 to-rose-600 rounded-full flex items-center justify-center">
                                  <span className="text-xs font-bold text-white">{member.character.name[0]}</span>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-zinc-100">{member.character.name}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    {isPartyOwner(party) && (
                      <div className="flex flex-col gap-2">
                        <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-zinc-800/60 rounded-xl" onClick={() => {
                          setEditingParty(party);
                          setShowCreateModal(true);
                        }}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-red-900/20 text-red-400 rounded-xl" onClick={() => handleDeleteParty(party.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {currentCount < party.maxCount && (
                    <Button 
                      className="w-full bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white rounded-xl shadow-lg shadow-rose-500/30 transition-all"
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
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gradient-to-br from-rose-500/20 to-rose-600/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Users className="h-10 w-10 text-rose-400" />
              </div>
              <h2 className="text-xl font-bold mb-2 text-zinc-400">暂无组队信息</h2>
              <p className="text-zinc-500">点击上方按钮发布第一个组队</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

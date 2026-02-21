"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, User, Calendar, X, Plus, Edit2, Trash2, Send, MessageCircle, Tag, Image, Lock, Eye } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useApp } from "@/contexts/AppContext";
import { useSearchParams } from "next/navigation";

interface Character {
  id: string;
  name: string;
  race: string;
  class: string;
  img: string | null;
}

const initialCharacters: Character[] = [
  {
    id: "1",
    name: "芙蕾雅",
    race: "人类",
    class: "法师",
    img: null,
  },
  {
    id: "2",
    name: "铁锤·石拳",
    race: "矮人",
    class: "战士",
    img: null,
  },
  {
    id: "3",
    name: "月影·行者",
    race: "精灵",
    class: "游侠",
    img: null,
  },
];

interface Party {
  id: string;
  title: string;
  content: string;
  character: Character | null;
  members: Character[];
  currentCount: number;
  maxCount: number;
  nextSessionTime: string | null;
  author: string;
  createdAt: string;
}

const initialParties: Party[] = [
  {
    id: "1",
    title: "探索废弃矿山",
    content: "我们需要一名战士和一名治疗者来探索西部边境的废弃矿山，据说那里藏有丰富的矿石和古老的宝藏。",
    character: initialCharacters[0],
    members: [initialCharacters[0]],
    currentCount: 1,
    maxCount: 4,
    nextSessionTime: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
    author: "冒险者张三",
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
];

export default function PartyPage() {
  const { user } = useAuth();
  const { resources, settings, updateSettings, verifyPassword } = useApp();
  const searchParams = useSearchParams();
  const [characters] = useState<Character[]>(initialCharacters);
  const [parties, setParties] = useState<Party[]>(() => {
    const title = searchParams.get("title");
    const content = searchParams.get("content");
    if (title && content) {
      return [
        ...initialParties,
        {
          id: Date.now().toString(),
          title,
          content,
          character: null,
          members: [],
          currentCount: 1,
          maxCount: 4,
          nextSessionTime: null,
          author: user?.username || "匿名",
          createdAt: new Date().toISOString(),
        },
      ];
    }
    return initialParties;
  });
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
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showResourceSelector, setShowResourceSelector] = useState(false);
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const selectCharacter = (char: Character) => {
    setFormData({ ...formData, character: char });
    setShowCharacterSelector(false);
  };

  const handleCreateParty = () => {
    if (!formData.title || !formData.content) return;
    const party: Party = {
      id: Date.now().toString(),
      title: formData.title,
      content: formData.content,
      character: formData.character,
      members: formData.character ? [formData.character] : [],
      currentCount: formData.character ? 1 : 0,
      maxCount: formData.maxCount,
      nextSessionTime: formData.nextSessionTime || null,
      author: user?.username || "匿名",
      createdAt: new Date().toISOString(),
    };
    setParties([party, ...parties]);
    setShowCreateModal(false);
    setFormData({
      title: "",
      content: "",
      character: null,
      maxCount: 4,
      nextSessionTime: "",
    });
  };

  const handleEditParty = () => {
    if (!editingParty || !formData.title || !formData.content) return;
    setParties(parties.map(p => 
      p.id === editingParty.id ? { 
        ...p, 
        title: formData.title, 
        content: formData.content,
        character: formData.character,
        maxCount: formData.maxCount,
        nextSessionTime: formData.nextSessionTime || null,
      } : p
    ));
    setEditingParty(null);
    setFormData({
      title: "",
      content: "",
      character: null,
      maxCount: 4,
      nextSessionTime: "",
    });
  };

  const handleDeleteParty = (id: string) => {
    if (confirm("确定要删除这个组队信息吗？")) {
      setParties(parties.filter(p => p.id !== id));
    }
  };

  const openEditModal = (party: Party) => {
    setEditingParty(party);
    setFormData({
      title: party.title,
      content: party.content,
      character: party.character,
      maxCount: party.maxCount,
      nextSessionTime: party.nextSessionTime || "",
    });
  };

  const isPartyOwner = (party: Party) => {
    return user && party.author === user.username;
  };

  const selectJoinCharacter = (char: Character) => {
    if (!joiningPartyId) return;
    setParties(parties.map(p => 
      p.id === joiningPartyId && p.currentCount < p.maxCount && !p.members.some(m => m.id === char.id)
        ? { ...p, currentCount: p.currentCount + 1, members: [...p.members, char] } 
        : p
    ));
    setShowJoinCharacterSelector(false);
    setJoiningPartyId(null);
  };

  const startJoinParty = (id: string) => {
    setJoiningPartyId(id);
    setShowJoinCharacterSelector(true);
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

  const selectPartyBg = (url: string | null) => {
    updateSettings({ partyBg: url });
    setShowResourceSelector(false);
  };

  const partyResources = resources.filter((r) => r.category === "partyBg" || r.category === "general");

  if (!user) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100">
        {settings.partyBg && (
          <div className="fixed inset-0 z-0 pointer-events-none" suppressHydrationWarning={true}>
            <img src={settings.partyBg} alt="组队界面背景" className="w-full h-full object-cover opacity-30 blur-[2px]" />
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
                  选择组队界面背景
                </h3>
                <button onClick={() => setShowResourceSelector(false)} className="text-zinc-400 hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-4">
                <Button
                  variant="ghost"
                  className="w-full justify-start border border-zinc-700 bg-zinc-800"
                  onClick={() => selectPartyBg(null)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  使用默认背景
                </Button>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {partyResources.map((img) => (
                    <div
                      key={img.id}
                      className="relative group cursor-pointer"
                      onClick={() => selectPartyBg(img.url)}
                    >
                      <div className="aspect-video bg-zinc-800 rounded-lg overflow-hidden border border-zinc-700">
                        <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                      </div>
                      <p className="text-sm text-zinc-400 mt-1 truncate">{img.name}</p>
                    </div>
                  ))}
                </div>
                {partyResources.length === 0 && (
                  <p className="text-zinc-500 text-center py-8">暂无图片资源，请先去资源库上传</p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="text-center relative z-10">
          <Users className="h-16 w-16 text-zinc-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">需要登录</h2>
          <p className="text-zinc-400 mb-6">请先登录才能查看组队信息</p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Link href="/">
              <Button className="bg-amber-600 hover:bg-amber-700">
                返回首页登录
              </Button>
            </Link>
            <Button
              variant="secondary"
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
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {settings.partyBg && (
        <div className="fixed inset-0 z-0 pointer-events-none" suppressHydrationWarning={true}>
          <img src={settings.partyBg} alt="组队界面背景" className="w-full h-full object-cover opacity-30 blur-[2px]" />
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
                选择组队界面背景
              </h3>
              <button onClick={() => setShowResourceSelector(false)} className="text-zinc-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <Button
                variant="ghost"
                className="w-full justify-start border border-zinc-700 bg-zinc-800"
                onClick={() => selectPartyBg(null)}
              >
                <Eye className="h-4 w-4 mr-2" />
                使用默认背景
              </Button>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {partyResources.map((img) => (
                  <div
                    key={img.id}
                    className="relative group cursor-pointer"
                    onClick={() => selectPartyBg(img.url)}
                  >
                    <div className="aspect-video bg-zinc-800 rounded-lg overflow-hidden border border-zinc-700">
                      <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                    </div>
                    <p className="text-sm text-zinc-400 mt-1 truncate">{img.name}</p>
                  </div>
                ))}
              </div>
              {partyResources.length === 0 && (
                <p className="text-zinc-500 text-center py-8">暂无图片资源，请先去资源库上传</p>
              )}
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
                  const alreadyJoined = party?.members.some(m => m.id === char.id) || false;
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
            </div>
          </div>
        </div>
      )}

      {(showCreateModal || editingParty) && (
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
          {parties.map((party) => (
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
                        {party.currentCount}/{party.maxCount}
                      </span>
                    </div>
                    <CardTitle className="text-xl">{party.title}</CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <span>发起者: {party.author}</span>
                      {party.character && <span>• 角色: {party.character.name}</span>}
                      <span className="text-zinc-600">
                        • {new Date(party.createdAt).toLocaleString("zh-CN")}
                      </span>
                      {party.nextSessionTime && (
                        <span className="text-amber-400">
                          • 📅 {new Date(party.nextSessionTime).toLocaleString("zh-CN")}
                        </span>
                      )}
                    </CardDescription>
                  </div>
                  {isPartyOwner(party) && (
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openEditModal(party)}>
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
                            {member.img ? (
                              <img src={member.img} alt={member.name} className="w-full h-full object-cover" />
                            ) : (
                              <User className="h-3 w-3 text-zinc-600" />
                            )}
                          </div>
                          <span className="text-sm">{member.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {party.currentCount < party.maxCount && (
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
          ))}
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

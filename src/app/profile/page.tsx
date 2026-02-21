"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Upload, ArrowLeft, Sword, Shield, Zap, Heart, Lock, LogIn, Edit2, Trash2, X, Plus, Image, FolderOpen, Eye, Settings, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useApp } from "@/contexts/AppContext";

interface Character {
  id: string;
  name: string;
  race: string;
  class: string;
  img: string | null;
  abilities: {
    str: number;
    dex: number;
    con: number;
    int: number;
    wis: number;
    cha: number;
  };
  bio: string;
  fullBio: string;
}

const initialCharacters: Character[] = [
  {
    id: "1",
    name: "芙蕾雅",
    race: "人类",
    class: "法师",
    img: null,
    abilities: {
      str: 10,
      dex: 14,
      con: 12,
      int: 18,
      wis: 13,
      cha: 16,
    },
    bio: "来自东方的神秘法师，追寻着古老魔法的秘密。",
    fullBio: "芙蕾雅出生于东方的魔法王国，从小就展现出惊人的魔法天赋。她离开家乡，来到这片未知的边境，追寻着古老魔法的秘密。她性格冷静，善于思考，但在面对邪恶时也会毫不犹豫地站出来。"
  },
  {
    id: "2",
    name: "铁锤·石拳",
    race: "矮人",
    class: "战士",
    img: null,
    abilities: {
      str: 18,
      dex: 12,
      con: 16,
      int: 10,
      wis: 13,
      cha: 8,
    },
    bio: "石盾家族的勇士，誓言要夺回被怪物侵占的家园。",
    fullBio: "铁锤来自石盾家族，这是一个有着悠久历史的矮人家族。几年前，他们的家园被一群邪恶的怪物侵占，铁锤的父亲也在那场战斗中牺牲。铁锤发誓要夺回自己的家园，为家族复仇。他擅长使用战锤，力大无穷，是队伍中坚实的前排。"
  },
  {
    id: "3",
    name: "月影·行者",
    race: "精灵",
    class: "游侠",
    img: null,
    abilities: {
      str: 12,
      dex: 18,
      con: 14,
      int: 13,
      wis: 16,
      cha: 10,
    },
    bio: "迷雾森林的守护者，擅长追踪和远程攻击。",
    fullBio: "月影是迷雾森林的守护者，她的家族世代守护着这片古老的森林。她与森林中的精灵和动物有着深厚的友谊，擅长追踪和射箭。她性格温和，但在保护森林和朋友时会变得异常坚定。"
  },
];

const abilityIcons = {
  str: <Sword className="h-4 w-4" />,
  dex: <Zap className="h-4 w-4" />,
  con: <Heart className="h-4 w-4" />,
  int: <Zap className="h-4 w-4" />,
  wis: <Shield className="h-4 w-4" />,
  cha: <User className="h-4 w-4" />,
};

const abilityNames = {
  str: "力量",
  dex: "敏捷",
  con: "体质",
  int: "智力",
  wis: "感知",
  cha: "魅力",
};

export default function ProfilePage() {
  const { user } = useAuth();
  const { resources, settings, updateSettings } = useApp();
  const [characters, setCharacters] = useState<Character[]>(initialCharacters);
  const [isUploading, setIsUploading] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  const [showUserAvatarSelector, setShowUserAvatarSelector] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [newSession, setNewSession] = useState("");
  const [nickname, setNickname] = useState(settings.userNickname || "");
  const [formData, setFormData] = useState<Partial<Character>>({
    name: "",
    race: "",
    class: "",
    bio: "",
    fullBio: "",
    abilities: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
  });

  const avatarResources = resources.filter((r) => r.category === "characterAvatar" || r.category === "general");

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      setTimeout(() => {
        setIsUploading(false);
        alert("角色文件已上传！（演示）");
      }, 1000);
    }
  };

  const handleEditCharacter = (char: Character) => {
    setEditingCharacter(char);
    setFormData({ ...char });
  };

  const handleSaveCharacter = () => {
    if (!formData.name || !formData.race || !formData.class) return;
    
    if (editingCharacter) {
      setCharacters(characters.map(c => 
        c.id === editingCharacter.id ? { ...c, ...formData } as Character : c
      ));
    } else {
      const newChar: Character = {
        id: Date.now().toString(),
        name: formData.name!,
        race: formData.race!,
        class: formData.class!,
        img: null,
        bio: formData.bio || "",
        fullBio: formData.fullBio || "",
        abilities: formData.abilities || { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
      };
      setCharacters([...characters, newChar]);
    }
    
    setEditingCharacter(null);
    setShowCreateModal(false);
    setFormData({
      name: "",
      race: "",
      class: "",
      bio: "",
      fullBio: "",
      abilities: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
    });
  };

  const handleDeleteCharacter = (id: string) => {
    if (confirm("确定要删除这个角色吗？")) {
      setCharacters(characters.filter(c => c.id !== id));
    }
  };

  const selectAvatar = (url: string | null) => {
    setFormData({ ...formData, img: url });
    setShowAvatarSelector(false);
  };

  const selectUserAvatar = (url: string | null) => {
    updateSettings({ userAvatar: url });
    setShowUserAvatarSelector(false);
  };

  const saveProfile = () => {
    updateSettings({ userNickname: nickname || null });
    setEditingProfile(false);
  };

  const addSession = () => {
    if (!newSession.trim()) return;
    const currentHistory = settings.sessionHistory || [];
    if (currentHistory.length >= 10) {
      alert("已达到10个标签上限");
      return;
    }
    updateSettings({ sessionHistory: [...currentHistory, newSession.trim()] });
    setNewSession("");
    setShowSessionModal(false);
  };

  const removeSession = (index: number) => {
    const currentHistory = [...(settings.sessionHistory || [])];
    currentHistory.splice(index, 1);
    updateSettings({ sessionHistory: currentHistory });
  };

  const sessionColors = [
    "bg-red-900/50 text-red-300 border-red-800",
    "bg-blue-900/50 text-blue-300 border-blue-800",
    "bg-green-900/50 text-green-300 border-green-800",
    "bg-purple-900/50 text-purple-300 border-purple-800",
    "bg-amber-900/50 text-amber-300 border-amber-800",
    "bg-cyan-900/50 text-cyan-300 border-cyan-800",
    "bg-pink-900/50 text-pink-300 border-pink-800",
    "bg-indigo-900/50 text-indigo-300 border-indigo-800",
    "bg-orange-900/50 text-orange-300 border-orange-800",
    "bg-teal-900/50 text-teal-300 border-teal-800",
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center">
        <div className="text-center">
          <Lock className="h-16 w-16 text-zinc-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">需要登录</h2>
          <p className="text-zinc-400 mb-6">请先登录才能访问个人中心</p>
          <Link href="/">
            <Button className="bg-amber-600 hover:bg-amber-700">
              <LogIn className="h-4 w-4 mr-2" />
              返回首页登录
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {showAvatarSelector && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <User className="h-5 w-5" />
                选择角色头像
              </h3>
              <button onClick={() => setShowAvatarSelector(false)} className="text-zinc-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <Button
                variant="ghost"
                className="w-full justify-start border border-zinc-700 bg-zinc-800"
                onClick={() => selectAvatar(null)}
              >
                <Eye className="h-4 w-4 mr-2" />
                使用默认头像
              </Button>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {avatarResources.map((img) => (
                  <div
                    key={img.id}
                    className="relative group cursor-pointer"
                    onClick={() => selectAvatar(img.url)}
                  >
                    <div className="aspect-square bg-zinc-800 rounded-lg overflow-hidden border border-zinc-700">
                      <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                    </div>
                    <p className="text-sm text-zinc-400 mt-1 truncate">{img.name}</p>
                  </div>
                ))}
              </div>
              {avatarResources.length === 0 && (
                <p className="text-zinc-500 text-center py-8">暂无头像资源，请先去资源库上传</p>
              )}
            </div>
          </div>
        </div>
      )}

      {showUserAvatarSelector && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <User className="h-5 w-5" />
                选择场外头像
              </h3>
              <button onClick={() => setShowUserAvatarSelector(false)} className="text-zinc-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <Button
                variant="ghost"
                className="w-full justify-start border border-zinc-700 bg-zinc-800"
                onClick={() => selectUserAvatar(null)}
              >
                <Eye className="h-4 w-4 mr-2" />
                使用默认头像
              </Button>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {avatarResources.map((img) => (
                  <div
                    key={img.id}
                    className="relative group cursor-pointer"
                    onClick={() => selectUserAvatar(img.url)}
                  >
                    <div className="aspect-square bg-zinc-800 rounded-lg overflow-hidden border border-zinc-700">
                      <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                    </div>
                    <p className="text-sm text-zinc-400 mt-1 truncate">{img.name}</p>
                  </div>
                ))}
              </div>
              {avatarResources.length === 0 && (
                <p className="text-zinc-500 text-center py-8">暂无头像资源，请先去资源库上传</p>
              )}
            </div>
          </div>
        </div>
      )}

      {showSessionModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Plus className="h-5 w-5" />
                记录跑团
              </h3>
              <button onClick={() => setShowSessionModal(false)} className="text-zinc-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-1">团本名称</label>
                <input
                  type="text"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white"
                  placeholder="输入团本名称"
                  value={newSession}
                  onChange={(e) => setNewSession(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addSession()}
                />
              </div>
              <div className="flex gap-3">
                <Button variant="ghost" onClick={() => setShowSessionModal(false)}>取消</Button>
                <Button className="flex-1 bg-amber-600 hover:bg-amber-700" onClick={addSession}>添加</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {(editingCharacter || showCreateModal) && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 overflow-y-auto py-8">
          <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-6 w-full max-w-2xl mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">{editingCharacter ? "编辑角色" : "创建新角色"}</h3>
              <button 
                onClick={() => {
                  setEditingCharacter(null);
                  setShowCreateModal(false);
                  setFormData({
                    name: "",
                    race: "",
                    class: "",
                    bio: "",
                    fullBio: "",
                    abilities: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
                  });
                }} 
                className="text-zinc-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-24 h-24 bg-zinc-800 rounded-lg flex items-center justify-center overflow-hidden border border-zinc-700">
                    {formData.img ? (
                      <img src={formData.img} alt="头像" className="w-full h-full object-cover" />
                    ) : (
                      <User className="h-10 w-10 text-zinc-600" />
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute -bottom-2 -right-2 h-8 w-8 bg-zinc-700 hover:bg-zinc-600"
                    onClick={() => setShowAvatarSelector(true)}
                  >
                    <Image className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-zinc-400 mb-1">角色名</label>
                    <input 
                      type="text" 
                      className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white" 
                      value={formData.name || ""}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-zinc-400 mb-1">种族</label>
                    <input 
                      type="text" 
                      className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white" 
                      value={formData.race || ""}
                      onChange={(e) => setFormData({ ...formData, race: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-zinc-400 mb-1">职业</label>
                    <input 
                      type="text" 
                      className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white" 
                      value={formData.class || ""}
                      onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm text-zinc-400 mb-2">属性</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {Object.entries(formData.abilities || {}).map(([key, value]) => (
                    <div key={key} className="bg-zinc-800 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-zinc-400 text-xs mb-2">
                        {abilityIcons[key as keyof typeof abilityIcons]}
                        <span>{abilityNames[key as keyof typeof abilityNames]}</span>
                      </div>
                      <input 
                        type="number" 
                        min="1" 
                        max="30" 
                        className="w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-white text-center"
                        value={value}
                        onChange={(e) => setFormData({
                          ...formData,
                          abilities: {
                            ...formData.abilities!,
                            [key]: parseInt(e.target.value) || 10,
                          },
                        })}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-zinc-400 mb-1">简介</label>
                <input 
                  type="text" 
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white" 
                  placeholder="简短的角色介绍"
                  value={formData.bio || ""}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm text-zinc-400 mb-1">完整背景</label>
                <textarea 
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white h-40" 
                  placeholder="详细的角色背景故事"
                  value={formData.fullBio || ""}
                  onChange={(e) => setFormData({ ...formData, fullBio: e.target.value })}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button 
                  variant="ghost" 
                  onClick={() => {
                    setEditingCharacter(null);
                    setShowCreateModal(false);
                  }}
                >
                  取消
                </Button>
                <Button className="flex-1 bg-amber-600 hover:bg-amber-700" onClick={handleSaveCharacter}>
                  保存
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
              <User className="h-6 w-6 text-amber-500" />
              <h1 className="text-xl font-bold">个人中心</h1>
            </div>
          </div>
          <div className="flex gap-3">
            <Link href="/resources">
              <Button variant="ghost" size="sm">
                <FolderOpen className="h-4 w-4 mr-2" />
                资源库
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                个人信息
              </CardTitle>
              <CardDescription>编辑场外昵称和头像</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-6">
                <div className="flex flex-col items-center gap-2">
                  <div className="relative">
                    <div className="w-32 h-32 bg-zinc-800 rounded-lg flex items-center justify-center overflow-hidden border border-zinc-700">
                      {settings.userAvatar ? (
                        <img src={settings.userAvatar} alt="场外头像" className="w-full h-full object-cover" />
                      ) : (
                        <User className="h-12 w-12 text-zinc-600" />
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute -bottom-2 -right-2 h-8 w-8 bg-zinc-700 hover:bg-zinc-600"
                      onClick={() => setShowUserAvatarSelector(true)}
                    >
                      <Image className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 bg-zinc-800 hover:bg-zinc-700"
                    onClick={() => setShowSessionModal(true)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <label className="block text-sm text-zinc-400 mb-1">冒险者名称（登录账号）</label>
                    <p className="text-white">{user.username}</p>
                  </div>
                  <div>
                    <label className="block text-sm text-zinc-400 mb-1">场外昵称</label>
                    {editingProfile ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          className="flex-1 bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white"
                          placeholder="输入场外昵称"
                          value={nickname}
                          onChange={(e) => setNickname(e.target.value)}
                        />
                        <Button className="bg-amber-600 hover:bg-amber-700" onClick={saveProfile}>
                          保存
                        </Button>
                        <Button variant="ghost" onClick={() => setEditingProfile(false)}>
                          取消
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <p className="text-white">{settings.userNickname || "未设置"}</p>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => {
                            setNickname(settings.userNickname || "");
                            setEditingProfile(true);
                          }}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                  {(settings.sessionHistory && settings.sessionHistory.length > 0) && (
                    <div>
                      <label className="block text-sm text-zinc-400 mb-2">跑团记录</label>
                      <div className="flex flex-wrap gap-2">
                        {settings.sessionHistory.slice(0, 10).map((session, index) => (
                          <div
                            key={index}
                            className={`px-3 py-1 rounded-full text-sm border cursor-pointer hover:opacity-80 ${sessionColors[index % sessionColors.length]}`}
                            onClick={() => {
                              if (confirm(`删除 "${session}" 吗？`)) {
                                removeSession(index);
                              }
                            }}
                          >
                            {session}
                          </div>
                        ))}
                        {settings.sessionHistory.length > 10 && (
                          <div className="px-3 py-1 rounded-full text-sm border bg-zinc-700 text-zinc-300 border-zinc-600">
                            +{settings.sessionHistory.length - 10} 更多
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <User className="h-6 w-6 text-amber-500" />
              角色卡册
            </h2>
            <div className="flex gap-3">
              <div className="relative">
                <input
                  type="file"
                  accept=".json"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                />
                <Button
                  className="bg-zinc-800 hover:bg-zinc-700"
                  disabled={isUploading}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {isUploading ? "上传中..." : "上传 FVTT"}
                </Button>
              </div>
              <Button 
                className="bg-amber-600 hover:bg-amber-700" 
                onClick={() => setShowCreateModal(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                创建角色
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {characters.map((char) => (
              <Card
                key={char.id}
                className="bg-zinc-900 border-zinc-800 hover:border-amber-500/50 transition-colors overflow-hidden"
              >
                <div className="h-32 bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center relative">
                  {char.img ? (
                    <img src={char.img} alt={char.name} className="w-full h-full object-cover" />
                  ) : (
                    <User className="h-16 w-16 text-zinc-600" />
                  )}
                  <div className="absolute top-2 right-2 flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 bg-zinc-900/80 hover:bg-zinc-800"
                      onClick={() => handleEditCharacter(char)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 bg-zinc-900/80 hover:bg-red-900/50"
                      onClick={() => handleDeleteCharacter(char.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-400" />
                    </Button>
                  </div>
                </div>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{char.name}</span>
                    <span className="text-sm font-normal text-zinc-400">
                      {char.race} · {char.class}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-2">
                    {Object.entries(char.abilities).map(([key, value]) => (
                      <div
                        key={key}
                        className="bg-zinc-800 rounded-lg p-2 text-center"
                      >
                        <div className="flex items-center justify-center gap-1 text-zinc-400 text-xs mb-1">
                          {abilityIcons[key as keyof typeof abilityIcons]}
                          <span>
                            {abilityNames[key as keyof typeof abilityNames]}
                          </span>
                        </div>
                        <div className="text-xl font-bold text-amber-400">
                          {value}
                        </div>
                      </div>
                    ))}
                  </div>
                  {char.bio && (
                    <div className="space-y-2">
                      <p className="text-sm text-zinc-400">
                        {char.bio}
                      </p>
                      {char.fullBio && (
                        <details className="text-xs">
                          <summary className="cursor-pointer text-amber-400 hover:text-amber-300">查看完整背景</summary>
                          <p className="text-zinc-400 mt-2 pt-2 border-t border-zinc-800">
                            {char.fullBio}
                          </p>
                        </details>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

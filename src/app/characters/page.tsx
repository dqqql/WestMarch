"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Upload, ArrowLeft, User, Sword, Shield, Zap, Heart, Lock, LogIn, Edit2, Trash2, X, Plus, Image, FolderOpen, Eye } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useResources } from "@/contexts/AppContext";

interface Character {
  id: string;
  name: string;
  race: string;
  class: string;
  img: string | null;
  str: number | null;
  dex: number | null;
  con: number | null;
  int: number | null;
  wis: number | null;
  cha: number | null;
  bio: string | null;
  fullBio: string | null;
}

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

export default function CharactersPage() {
  const { user } = useAuth();
  const { resources } = useResources();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  const [formData, setFormData] = useState<Partial<Character>>({
    name: "",
    race: "",
    class: "",
    bio: "",
    fullBio: "",
    str: 10,
    dex: 10,
    con: 10,
    int: 10,
    wis: 10,
    cha: 10,
  });

  const avatarResources = resources.filter((r: any) => r.category === "characterAvatar");

  useEffect(() => {
    if (user) {
      loadCharacters();
    }
  }, [user]);

  const loadCharacters = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/characters?userId=${user?.id}`);
      if (response.ok) {
        const data = await response.json();
        setCharacters(data);
      }
    } catch (error) {
      console.error("Failed to load characters:", error);
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleSaveCharacter = async () => {
    if (!formData.name || !formData.race || !formData.class || !user) return;
    
    try {
      if (editingCharacter) {
        const response = await fetch(`/api/characters/${editingCharacter.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name,
            race: formData.race,
            class: formData.class,
            img: formData.img,
            str: formData.str,
            dex: formData.dex,
            con: formData.con,
            int: formData.int,
            wis: formData.wis,
            cha: formData.cha,
            bio: formData.bio,
            fullBio: formData.fullBio,
          }),
        });
        if (response.ok) {
          const updatedChar = await response.json();
          setCharacters(characters.map(c => 
            c.id === editingCharacter.id ? updatedChar : c
          ));
        }
      } else {
        const requestData = {
          name: formData.name,
          race: formData.race,
          class: formData.class,
          img: formData.img,
          str: formData.str,
          dex: formData.dex,
          con: formData.con,
          int: formData.int,
          wis: formData.wis,
          cha: formData.cha,
          bio: formData.bio,
          fullBio: formData.fullBio,
          userId: user.id,
        };
        console.log('Sending character data:', requestData);
        console.log('User object:', user);
        
        const response = await fetch("/api/characters", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestData),
        });
        if (response.ok) {
          const newChar = await response.json();
          setCharacters([...characters, newChar]);
        }
      }
      
      setEditingCharacter(null);
      setShowCreateModal(false);
      setFormData({
        name: "",
        race: "",
        class: "",
        bio: "",
        fullBio: "",
        str: 10,
        dex: 10,
        con: 10,
        int: 10,
        wis: 10,
        cha: 10,
      });
    } catch (error) {
      console.error("Failed to save character:", error);
      alert("保存角色失败");
    }
  };

  const handleDeleteCharacter = async (id: string) => {
    if (!confirm("确定要删除这个角色吗？")) return;
    
    try {
      const response = await fetch(`/api/characters/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setCharacters(characters.filter(c => c.id !== id));
      }
    } catch (error) {
      console.error("Failed to delete character:", error);
      alert("删除角色失败");
    }
  };

  const selectAvatar = (url: string | null) => {
    setFormData({ ...formData, img: url });
    setShowAvatarSelector(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center">
        <div className="text-center">
          <Lock className="h-16 w-16 text-zinc-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">需要登录</h2>
          <p className="text-zinc-400 mb-6">请先登录才能访问角色卡册</p>
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
                {avatarResources.map((img: any) => (
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
                    str: 10,
                    dex: 10,
                    con: 10,
                    int: 10,
                    wis: 10,
                    cha: 10,
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
                  {(["str", "dex", "con", "int", "wis", "cha"] as const).map((key) => (
                    <div key={key} className="bg-zinc-800 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-zinc-400 text-xs mb-2">
                        {abilityIcons[key]}
                        <span>{abilityNames[key]}</span>
                      </div>
                      <input 
                        type="number" 
                        min="1" 
                        max="30" 
                        className="w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-white text-center"
                        value={formData[key] || 10}
                        onChange={(e) => setFormData({
                          ...formData,
                          [key]: parseInt(e.target.value) || 10,
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
              <Users className="h-6 w-6 text-amber-500" />
              <h1 className="text-xl font-bold">角色卡册</h1>
            </div>
          </div>
          <div className="flex gap-3">
            <Link href="/resources">
              <Button variant="ghost" size="sm">
                <FolderOpen className="h-4 w-4 mr-2" />
                资源库
              </Button>
            </Link>
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
      </header>
      <main className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-zinc-400">加载中...</p>
          </div>
        ) : characters.length === 0 ? (
          <div className="text-center py-12">
            <User className="h-16 w-16 text-zinc-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">暂无角色</h3>
            <p className="text-zinc-400 mb-6">点击上方"创建角色"按钮添加你的第一个角色</p>
          </div>
        ) : (
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
                    {(["str", "dex", "con", "int", "wis", "cha"] as const).map((key) => (
                      <div
                        key={key}
                        className="bg-zinc-800 rounded-lg p-2 text-center"
                      >
                        <div className="flex items-center justify-center gap-1 text-zinc-400 text-xs mb-1">
                          {abilityIcons[key]}
                          <span>{abilityNames[key]}</span>
                        </div>
                        <div className="text-xl font-bold text-amber-400">
                          {char[key] || 10}
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
        )}
      </main>
    </div>
  );
}

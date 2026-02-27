"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BookOpen,
  Map,
  MessageSquare,
  Users,
  Sword,
  X,
  User,
  LogOut,
  ArrowRight,
  Sparkles,
  Palette,
  ChevronRight,
  Tag,
  Edit2,
  Trash2,
  Search,
  Clock,
  Plus,
  Shield,
  Zap,
  Heart,
  Image as ImageIcon,
  FolderOpen,
  Eye,
  FileText,
  Upload,
  Download,
  Star,
  MoreHorizontal
} from "lucide-react";
import Link from "next/link";

const SETTING_KEY_DATE = "game_date";
const SETTING_KEY_ERA = "era_name";

function DateDisplay() {
  const [currentDate, setCurrentDate] = useState<Date | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editYear, setEditYear] = useState(0);
  const [editMonth, setEditMonth] = useState(0);
  const [editDay, setEditDay] = useState(0);
  const [eraName, setEraName] = useState("深冬之年");
  const [isEditingEra, setIsEditingEra] = useState(false);
  const [editEraName, setEditEraName] = useState("深冬之年");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const now = new Date();
    setCurrentDate(now);
    setEditYear(now.getFullYear());
    setEditMonth(now.getMonth() + 1);
    setEditDay(now.getDate());
    setIsLoading(false);
  }, []);

  const handleEdit = () => setIsEditing(true);
  const handleSave = () => {
    const newDate = new Date(editYear, editMonth - 1, editDay);
    setCurrentDate(newDate);
    setIsEditing(false);
  };
  const handleCancel = () => {
    if (currentDate) {
      setEditYear(currentDate.getFullYear());
      setEditMonth(currentDate.getMonth() + 1);
      setEditDay(currentDate.getDate());
    }
    setIsEditing(false);
  };
  const handleEditEra = () => {
    setEditEraName(eraName);
    setIsEditingEra(true);
  };
  const handleSaveEra = () => {
    setEraName(editEraName);
    setIsEditingEra(false);
  };
  const handleCancelEra = () => {
    setEditEraName(eraName);
    setIsEditingEra(false);
  };

  if (isLoading || !currentDate) {
    return (
      <div className="flex items-center gap-2 text-zinc-400">
        <span className="text-lg">加载中...</span>
      </div>
    );
  }

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;
  const day = currentDate.getDate();
  const weekdays = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
  const weekday = weekdays[currentDate.getDay()];
  const yearFrom1492 = year - 1492;

  if (isEditing) {
    return (
      <div className="flex items-center gap-3 bg-gradient-to-r from-amber-950/80 to-zinc-900/80 border border-amber-500/40 rounded-2xl p-4 backdrop-blur-xl shadow-2xl shadow-amber-500/10">
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="1492"
            max="9999"
            value={editYear}
            onChange={(e) => setEditYear(parseInt(e.target.value) || 1492)}
            className="w-20 bg-zinc-800/80 border border-amber-500/30 rounded-xl px-3 py-2 text-center text-amber-200 font-serif transition-all focus:border-amber-400 focus:ring-2 focus:ring-amber-500/30 outline-none"
          />
          <span className="text-amber-200 font-serif">年</span>
          <input
            type="number"
            min="1"
            max="12"
            value={editMonth}
            onChange={(e) => setEditMonth(parseInt(e.target.value) || 1)}
            className="w-14 bg-zinc-800/80 border border-amber-500/30 rounded-xl px-3 py-2 text-center text-amber-200 font-serif transition-all focus:border-amber-400 focus:ring-2 focus:ring-amber-500/30 outline-none"
          />
          <span className="text-amber-200 font-serif">月</span>
          <input
            type="number"
            min="1"
            max="31"
            value={editDay}
            onChange={(e) => setEditDay(parseInt(e.target.value) || 1)}
            className="w-14 bg-zinc-800/80 border border-amber-500/30 rounded-xl px-3 py-2 text-center text-amber-200 font-serif transition-all focus:border-amber-400 focus:ring-2 focus:ring-amber-500/30 outline-none"
          />
          <span className="text-amber-200 font-serif">日</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            className="p-2 text-green-400 hover:text-green-300 hover:bg-green-500/10 rounded-xl transition-all"
          >
            <X className="h-5 w-5 rotate-45" />
          </button>
          <button
            onClick={handleCancel}
            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 group">
      <div className="flex items-center gap-3">
        <div className="bg-gradient-to-r from-amber-950/70 to-zinc-900/70 border border-amber-500/30 rounded-2xl p-4 backdrop-blur-xl hover:border-amber-400/50 hover:shadow-xl hover:shadow-amber-500/10 transition-all duration-500">
          <div className="flex items-center justify-between mb-2">
            <div className="text-right text-xs text-amber-300 font-serif tracking-wider">
              西元 {year}年 / 
              {isEditingEra ? (
                <div className="inline-flex items-center gap-1">
                  <input
                    type="text"
                    value={editEraName}
                    onChange={(e) => setEditEraName(e.target.value)}
                    className="bg-zinc-800/80 border border-amber-500/30 rounded-lg px-2 py-1 text-xs text-amber-200 font-serif outline-none"
                  />
                  <button
                    onClick={handleSaveEra}
                    className="p-0.5 text-green-400 hover:text-green-300 transition-colors"
                  >
                    <X className="h-3 w-3 rotate-45" />
                  </button>
                  <button
                    onClick={handleCancelEra}
                    className="p-0.5 text-red-400 hover:text-red-300 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <span className="cursor-pointer hover:text-amber-200 transition-colors" onClick={handleEditEra}>
                  {eraName} {yearFrom1492}年
                </span>
              )}
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-100 font-serif cursor-pointer tracking-wide" onClick={handleEdit}>
            {month}月{day}日 {weekday}
          </div>
        </div>
      </div>
    </div>
  );
}

const tagColors = {
  "DM悬赏": "bg-red-900/40 text-red-300 border-red-800/50",
  "寻找队伍": "bg-blue-900/40 text-blue-300 border-blue-800/50",
  "杂谈": "bg-purple-900/40 text-purple-300 border-purple-800/50",
  "跑团战报": "bg-amber-900/40 text-amber-300 border-amber-800/50",
};

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

export default function UIPreview() {
  const [user, setUser] = useState<any>({ username: "冒险者" });
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [activeBg, setActiveBg] = useState("home");

  const backgrounds = [
    { id: "home", label: "首页背景", src: "/images/home-bg.png" },
    { id: "map", label: "地图背景", src: "/images/map-bg.png" },
    { id: "general", label: "通用背景", src: "/images/general-bg.png" },
  ];

  const handleLogin = async () => {
    setIsLoggingIn(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setUser({ username: loginUsername || "冒险者" });
    setShowLoginModal(false);
    setIsLoggingIn(false);
  };

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 relative overflow-hidden">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <img 
          src={backgrounds.find(b => b.id === activeBg)?.src}
          alt="背景" 
          className="w-full h-full object-cover opacity-55 transition-opacity duration-1000" 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/60 via-zinc-950/40 to-zinc-950/80" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent" />
      </div>

      <div className="fixed top-4 right-4 z-50 bg-zinc-900/90 backdrop-blur-xl rounded-2xl border border-zinc-700/50 p-4 shadow-2xl">
        <div className="flex items-center gap-2 mb-3">
          <Palette className="h-4 w-4 text-amber-400" />
          <span className="text-sm font-medium text-zinc-200">背景切换</span>
        </div>
        <div className="flex gap-2">
          {backgrounds.map((bg) => (
            <button
              key={bg.id}
              onClick={() => setActiveBg(bg.id)}
              className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                activeBg === bg.id 
                  ? "bg-amber-600 text-white shadow-lg shadow-amber-500/30" 
                  : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
              }`}
            >
              {bg.label}
            </button>
          ))}
        </div>
      </div>

      <header className="border-b border-zinc-800/50 bg-zinc-900/40 backdrop-blur-2xl sticky top-0 z-40">
        <div className="container mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-xl shadow-amber-500/30">
                <Sword className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-200 via-amber-100 to-amber-200 bg-clip-text text-transparent">
                  不冻港的西征世界
                </h1>
                <p className="text-xs text-zinc-500">D&D Campaign Portal - UI 预览</p>
              </div>
            </div>
            <DateDisplay />
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 bg-zinc-800/50 px-4 py-2 rounded-2xl border border-zinc-700/50">
                  <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-white">{user.username[0]}</span>
                  </div>
                  <span className="text-amber-300 font-medium">{user.username}</span>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </header>

      <main className="relative z-10 pb-20">
        <div className="container mx-auto px-6 py-12">
          <div className="text-center mb-12 space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-300 text-sm">
              <Sparkles className="h-4 w-4" />
              <span>UI 组件预览</span>
            </div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-white via-amber-100 to-white bg-clip-text text-transparent">
              功能模块样式展示
            </h2>
            <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
              向下滚动查看各个功能模块的优化后样式
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
            {[
              { title: "公会档案馆", description: "冒险规则与指南，房规，战报等各种文档的集中处", icon: BookOpen, color: "from-blue-500 to-blue-600", shadow: "shadow-blue-500/20" },
              { title: "世界地图", description: "探索边境世界", icon: Map, color: "from-emerald-500 to-emerald-600", shadow: "shadow-emerald-500/20" },
              { title: "酒馆布告栏", description: "发布任务与战报", icon: MessageSquare, color: "from-purple-500 to-purple-600", shadow: "shadow-purple-500/20" },
              { title: "组队界面", description: "寻找冒险伙伴", icon: Users, color: "from-rose-500 to-rose-600", shadow: "shadow-rose-500/20" },
            ].map((item, index) => (
              <Card
                key={item.title}
                className="relative overflow-hidden bg-gradient-to-br from-zinc-900/80 to-zinc-950/80 border-zinc-700/50"
              >
                <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${item.color}`} />
                <CardHeader className="p-8">
                  <div className="flex items-start justify-between gap-6">
                    <div className="space-y-3 flex-1">
                      <CardTitle className="text-xl font-bold flex items-center gap-2">
                        {item.title}
                      </CardTitle>
                      <CardDescription className="text-zinc-400 text-base leading-relaxed">
                        {item.description}
                      </CardDescription>
                    </div>
                    <div className={`p-4 rounded-2xl bg-gradient-to-br ${item.color} ${item.shadow} shadow-xl`}>
                      <item.icon className="h-10 w-10 text-white" />
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>

          <section className="mb-20">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-2xl font-bold">酒馆布告栏 - 帖子样式</h3>
            </div>

              <div className="relative mb-6">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="搜索帖子、作者或内容..."
                    className="w-full bg-zinc-800/60 border border-zinc-700/50 rounded-2xl pl-12 pr-4 py-4 text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 backdrop-blur-sm transition-all"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-8">
                {["全部", "DM悬赏", "杂谈", "跑团战报"].map((tag) => (
                  <button
                    key={tag}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      tag === "全部"
                        ? "bg-purple-600 text-white shadow-lg shadow-purple-500/30"
                        : "bg-zinc-800/60 text-zinc-300 hover:bg-zinc-700/60 backdrop-blur-sm"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                {[
                  {
                    id: 1,
                    title: "【DM悬赏】失落神庙的探索任务",
                    tag: "DM悬赏",
                    author: "地下城主",
                    content: "现招募勇敢的冒险者探索失落已久的翡翠神庙。据说神庙深处藏有古老的宝藏和强大的魔法物品...",
                    time: "2025-02-27 14:30",
                    honor: 50,
                    gold: 200,
                    reputation: 30,
                  },
                  {
                    id: 2,
                    title: "【战报】冰霜巨人的覆灭 - 上周精彩回顾",
                    tag: "跑团战报",
                    author: "勇敢的骑士",
                    content: "上周我们成功击败了威胁村庄的冰霜巨人！感谢所有参与的冒险者，特别是法师莉亚的精彩表现...",
                    time: "2025-02-26 09:15",
                  },
                  {
                    id: 3,
                    title: "【寻找队伍】新手牧师求组周末副本",
                    tag: "杂谈",
                    author: "圣光使者",
                    content: "刚创建的人类牧师，治疗专精，求组周末的任意副本。有丰富的MMO经验，学习能力强...",
                    time: "2025-02-25 22:45",
                  },
                ].map((post) => (
                  <Card
                    key={post.id}
                    className="bg-gradient-to-br from-zinc-900/80 to-zinc-950/80 border-zinc-700/50 hover:border-purple-500/50 transition-all duration-300 overflow-hidden group"
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-3">
                            <span
                              className={`px-3 py-1 rounded-xl text-xs font-medium border ${tagColors[post.tag as keyof typeof tagColors]}`}
                            >
                              <Tag className="h-3 w-3 inline mr-1" />
                              {post.tag}
                            </span>
                            {post.tag === "DM悬赏" && (
                              <span className="px-3 py-1 bg-amber-900/40 text-amber-300 border border-amber-800/50 rounded-xl text-xs font-medium flex items-center gap-2">
                                <Star className="h-3 w-3" />
                                奖励: 荣誉 {post.honor} | 金币 {post.gold} | 声望 {post.reputation}
                              </span>
                            )}
                          </div>
                          <h4 className="text-xl font-bold mb-2 text-zinc-100 group-hover:text-white transition-colors">
                            {post.title}
                          </h4>
                          <p className="text-zinc-400 mb-4 line-clamp-2 leading-relaxed">
                            {post.content}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-zinc-500">
                            <span className="flex items-center gap-1">
                              <User className="h-4 w-4" />
                              {post.author}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {post.time}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-zinc-800/60 rounded-xl">
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-red-900/20 text-red-400 rounded-xl">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="mt-8 flex justify-center">
                <Button className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white rounded-xl shadow-lg shadow-purple-500/30 transition-all">
                  <Plus className="h-4 w-4 mr-2" />
                  发布新帖
                </Button>
              </div>
            </section>

          <section className="mb-20">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-rose-600 rounded-xl flex items-center justify-center">
                <Users className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-2xl font-bold">组队大厅 - 队伍样式</h3>
            </div>

              <div className="space-y-6 max-w-4xl mx-auto">
                {[
                  {
                    id: 1,
                    title: "【周末固定队】深渊地下城探索",
                    author: "老队长",
                    content: "每周六晚8点固定队，目标：深渊地下城。目前已有坦克和治疗，还需要2名DPS。要求装备等级至少100+，有经验者优先。",
                    maxCount: 5,
                    currentCount: 3,
                    nextSession: "2025-03-01 20:00",
                    members: [
                      { name: "老队长", role: "坦克", class: "战士" },
                      { name: "圣光使者", role: "治疗", class: "牧师" },
                    ],
                  },
                  {
                    id: 2,
                    title: "【临时队】新手欢迎 - 简单副本刷经验",
                    author: "好心人",
                    content: "带新手刷简单副本，熟悉游戏机制。所有人都可以来，不限职业等级。",
                    maxCount: 6,
                    currentCount: 2,
                    nextSession: null,
                    members: [
                      { name: "好心人", role: "输出", class: "法师" },
                    ],
                  },
                ].map((party) => (
                  <Card
                    key={party.id}
                    className="bg-gradient-to-br from-zinc-900/80 to-zinc-950/80 border-zinc-700/50 hover:border-rose-500/50 transition-all duration-300 overflow-hidden group"
                  >
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-3">
                            <span className="px-3 py-1 bg-rose-900/40 text-rose-300 border border-rose-800/50 rounded-xl text-sm font-medium">
                              {party.currentCount}/{party.maxCount} 人
                            </span>
                            {party.nextSession && (
                              <span className="px-3 py-1 bg-amber-900/40 text-amber-300 border border-amber-800/50 rounded-xl text-sm font-medium">
                                {party.nextSession}
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
                            <span>发起者: {party.author}</span>
                          </div>
                          {party.members.length > 0 && (
                            <div className="space-y-2">
                              <p className="text-sm text-zinc-400">队伍成员:</p>
                              <div className="flex flex-wrap gap-2">
                                {party.members.map((member, i) => (
                                  <div
                                    key={i}
                                    className="flex items-center gap-2 bg-zinc-800/60 px-3 py-2 rounded-xl border border-zinc-700/50 backdrop-blur-sm"
                                  >
                                    <div className="w-6 h-6 bg-gradient-to-br from-rose-500 to-rose-600 rounded-full flex items-center justify-center">
                                      <span className="text-xs font-bold text-white">{member.name[0]}</span>
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium">{member.name}</p>
                                      <p className="text-xs text-zinc-500">{member.role} · {member.class}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-zinc-800/60 rounded-xl">
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-red-900/20 text-red-400 rounded-xl">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      {party.currentCount < party.maxCount && (
                        <Button className="w-full bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white rounded-xl shadow-lg shadow-rose-500/30 transition-all">
                          <Users className="h-4 w-4 mr-2" />
                          加入队伍
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="mt-8 flex justify-center">
                <Button className="bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white rounded-xl shadow-lg shadow-rose-500/30 transition-all">
                  <Plus className="h-4 w-4 mr-2" />
                  发布组队
                </Button>
              </div>
            </section>

          <section className="mb-20">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-2xl font-bold">公会档案馆 - 文档管理</h3>
            </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { title: "房规总览", description: "公会的基本规则和行为准则，所有冒险者必须遵守", category: "规则", icon: FileText, color: "blue" },
                  { title: "新手入门指南", description: "新手指南，帮助你快速了解游戏机制和公会运作", category: "指南", icon: BookOpen, color: "emerald" },
                  { title: "装备分配规则", description: "详细说明副本掉落装备的分配方式和优先级", category: "规则", icon: Shield, color: "amber" },
                  { title: "2025-02-24 战报", description: "上周六深渊地下城探索的完整战报记录", category: "战报", icon: FileText, color: "purple" },
                  { title: "NPC列表", description: "重要NPC的详细信息和互动指南", category: "资料", icon: Users, color: "rose" },
                  { title: "魔法物品图鉴", description: "已知魔法物品的效果和获取方式汇总", category: "资料", icon: Star, color: "violet" },
                ].map((doc, i) => (
                  <Card
                    key={i}
                    className="bg-gradient-to-br from-zinc-900/80 to-zinc-950/80 border-zinc-700/50 hover:border-blue-500/50 transition-all duration-300 overflow-hidden group cursor-pointer"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className={`p-3 rounded-xl bg-gradient-to-br from-${doc.color}-500 to-${doc.color}-600 shadow-lg shadow-${doc.color}-500/20 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                          <doc.icon className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-zinc-800/60 rounded-lg">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-zinc-800/60 rounded-lg">
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <span className={`inline-block px-2 py-1 rounded-lg text-xs font-medium mb-2 bg-${doc.color}-900/40 text-${doc.color}-300 border border-${doc.color}-800/50`}>
                        {doc.category}
                      </span>
                      <CardTitle className="text-lg font-bold mb-2 text-zinc-100 group-hover:text-white transition-colors">
                        {doc.title}
                      </CardTitle>
                      <CardDescription className="text-zinc-400 text-sm line-clamp-2 leading-relaxed">
                        {doc.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="mt-10 flex flex-wrap gap-4 justify-center">
                <Button className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-xl shadow-lg shadow-blue-500/30 transition-all">
                  <Plus className="h-4 w-4 mr-2" />
                  新建文档
                </Button>
                <Button variant="ghost" className="bg-zinc-800/60 hover:bg-zinc-700/60 backdrop-blur-sm rounded-xl">
                  <FolderOpen className="h-4 w-4 mr-2" />
                  文件夹管理
                </Button>
                <Button variant="ghost" className="bg-zinc-800/60 hover:bg-zinc-700/60 backdrop-blur-sm rounded-xl">
                  <Upload className="h-4 w-4 mr-2" />
                  批量导入
                </Button>
              </div>
            </section>

          <section className="mb-20">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <Map className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-2xl font-bold">角色卡册 - 角色展示</h3>
            </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { name: "勇敢的骑士", race: "人类", class: "战士", bio: "来自不冻港的勇敢骑士，立志消灭所有邪恶势力。", str: 18, dex: 12, con: 16, int: 10, wis: 14, cha: 13 },
                  { name: "莉亚·月辉", race: "精灵", class: "法师", bio: "精通元素魔法的精灵法师，来自遥远的魔法王国。", str: 8, dex: 14, con: 10, int: 20, wis: 16, cha: 15 },
                  { name: "铁壁", race: "矮人", class: "牧师", bio: "虔诚的矮人牧师，用圣光治愈队友。", str: 14, dex: 10, con: 18, int: 12, wis: 18, cha: 14 },
                ].map((char, i) => (
                  <Card
                    key={i}
                    className="bg-gradient-to-br from-zinc-900/80 to-zinc-950/80 border-zinc-700/50 hover:border-emerald-500/50 transition-all duration-300 overflow-hidden group"
                  >
                    <div className="h-36 bg-gradient-to-br from-emerald-900/30 to-zinc-900 flex items-center justify-center relative">
                      <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-xl shadow-emerald-500/30 group-hover:scale-110 transition-transform duration-300">
                        <User className="h-12 w-12 text-white" />
                      </div>
                      <div className="absolute top-3 right-3 flex gap-2">
                        <Button variant="ghost" size="icon" className="h-9 w-9 bg-zinc-900/80 hover:bg-zinc-800/80 backdrop-blur-sm rounded-xl">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-9 w-9 bg-zinc-900/80 hover:bg-red-900/30 text-red-400 backdrop-blur-sm rounded-xl">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-bold">{char.name}</CardTitle>
                        <span className="text-sm font-normal text-zinc-400">
                          {char.race} · {char.class}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-3 gap-2">
                        {(["str", "dex", "con", "int", "wis", "cha"] as const).map((key) => (
                          <div
                            key={key}
                            className="bg-zinc-800/60 rounded-xl p-3 text-center backdrop-blur-sm"
                          >
                            <div className="flex items-center justify-center gap-1 text-zinc-400 text-xs mb-1">
                              {abilityIcons[key]}
                              <span>{abilityNames[key]}</span>
                            </div>
                            <div className="text-2xl font-bold text-emerald-400">
                              {char[key]}
                            </div>
                          </div>
                        ))}
                      </div>
                      <p className="text-sm text-zinc-400 leading-relaxed">
                        {char.bio}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="mt-10 flex flex-wrap gap-4 justify-center">
                <Button className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white rounded-xl shadow-lg shadow-emerald-500/30 transition-all">
                  <Plus className="h-4 w-4 mr-2" />
                  创建角色
                </Button>
                <Button variant="ghost" className="bg-zinc-800/60 hover:bg-zinc-700/60 backdrop-blur-sm rounded-xl">
                  <Upload className="h-4 w-4 mr-2" />
                  上传 FVTT
                </Button>
                <Button variant="ghost" className="bg-zinc-800/60 hover:bg-zinc-700/60 backdrop-blur-sm rounded-xl">
                  <Download className="h-4 w-4 mr-2" />
                  导出角色
                </Button>
              </div>
            </section>
        </div>
      </main>

      <footer className="border-t border-zinc-800/50 bg-zinc-900/40 backdrop-blur-xl py-10 relative z-10">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Sword className="h-5 w-5 text-amber-500" />
              <span className="text-zinc-400">不冻港的西征世界</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-500 text-sm">
              <span>&copy; 2025</span>
              <span className="w-1 h-1 rounded-full bg-zinc-700" />
              <span>UI 优化预览版</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

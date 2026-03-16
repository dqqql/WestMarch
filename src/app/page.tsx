"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BookOpen, Map, MessageSquare, Users, Sword, X, User, LogOut, ArrowRight, MessageCircleMore, Sparkles } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { DateDisplay } from "@/components/DateDisplay";
import { WeatherDisplay } from "@/components/WeatherDisplay";

export default function Home() {
  const { user, login, logout, isLoading } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [showInfoModal, setShowInfoModal] = useState(false);
  const [characterUsers, setCharacterUsers] = useState<any[]>([]);
  const [isLoadingInfo, setIsLoadingInfo] = useState(false);

  const fetchCharacterUsers = async () => {
    setIsLoadingInfo(true);
    try {
      const res = await fetch("/api/characters/users");
      const data = await res.json();
      setCharacterUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
    }
    setIsLoadingInfo(false);
  };

  useEffect(() => {
    if (showInfoModal && characterUsers.length === 0) {
      fetchCharacterUsers();
    }
  }, [showInfoModal]);
  const handleLogin = async () => {
    if (!loginUsername || !loginPassword) {
      setError("请输入用户名和密码");
      return;
    }

    setIsLoggingIn(true);
    setError("");

    const success = await login(loginUsername, loginPassword);
    if (success) {
      setShowLoginModal(false);
      setLoginUsername("");
      setLoginPassword("");
    } else {
      setError("登录失败，请重试");
    }
    setIsLoggingIn(false);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 relative overflow-hidden flex flex-col">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <img
          src="/images/home-bg.v1.webp"
          alt="背景"
          className="w-full h-full object-cover opacity-55 transition-opacity duration-1000"
          loading="eager"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/60 via-zinc-950/40 to-zinc-950/80" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent" />
      </div>

      {showInfoModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 animate-in fade-in duration-300 p-4" onClick={() => setShowInfoModal(false)}>
          <div className="bg-zinc-900 border border-indigo-500/30 rounded-3xl p-6 md:p-8 w-full max-w-2xl shadow-[0_0_50px_rgba(99,102,241,0.2)] max-h-[85vh] flex flex-col animate-in zoom-in-95 duration-300" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6 border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-fuchsia-400 bg-clip-text text-transparent">异界信息</h3>
                  <p className="text-zinc-500 text-sm">角色与账号的命运羁绊</p>
                </div>
              </div>
              <button onClick={() => setShowInfoModal(false)} className="text-zinc-500 hover:text-zinc-300 transition-colors p-2 hover:bg-zinc-800 rounded-xl">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
              {isLoadingInfo ? (
                <div className="py-20 flex flex-col justify-center items-center text-indigo-400/50">
                  <Sparkles className="h-8 w-8 animate-pulse mb-4" />
                  <p className="animate-pulse">正在窥探异次元档案...</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-950/50">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs uppercase bg-zinc-900/80 text-zinc-400 border-b border-zinc-800 sticky top-0 z-10 backdrop-blur-xl">
                      <tr>
                        <th className="px-6 py-4 font-semibold tracking-wider">角色名称</th>
                        <th className="px-6 py-4 font-semibold tracking-wider">种族 / 职业</th>
                        <th className="px-6 py-4 font-semibold tracking-wider">账号昵称</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/50">
                      {characterUsers.map((item) => (
                        <tr key={item.id} className="hover:bg-zinc-800/30 transition-colors group">
                          <td className="px-6 py-4 font-medium text-amber-100/90 group-hover:text-amber-300 transition-colors">
                            {item.name}
                          </td>
                          <td className="px-6 py-4 text-zinc-400">
                            {item.race} / {item.class}
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                              {item.user?.nickname || item.user?.username || "未知旅行者"}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {characterUsers.length === 0 && (
                        <tr>
                          <td colSpan={3} className="px-6 py-12 text-center text-zinc-500">
                            尚未有冒险者踏入这片大陆...
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            
            <div className="mt-6 pt-4 border-t border-zinc-800 text-center">
              <Button onClick={() => setShowInfoModal(false)} variant="outline" className="rounded-full border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800">
                关闭书卷
              </Button>
            </div>
          </div>
        </div>
      )}

      {showLoginModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-300" onClick={() => setShowLoginModal(false)}>
          <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-700/50 rounded-3xl p-8 w-full max-w-md shadow-2xl shadow-black/50 animate-in zoom-in-95 duration-300" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/30">
                  <Sword className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">登录</h3>
                  <p className="text-zinc-500 text-sm">开始你的冒险</p>
                </div>
              </div>
              <button onClick={() => setShowLoginModal(false)} className="text-zinc-500 hover:text-zinc-300 transition-colors p-2 hover:bg-zinc-800 rounded-xl">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              {error && <div className="text-red-400 text-sm bg-red-900/20 p-3 rounded-xl">{error}</div>}
              <div>
                <label className="block text-sm text-zinc-400 mb-2">用户名</label>
                <input 
                  type="text" 
                  className="w-full bg-zinc-800/60 border border-zinc-700/50 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 backdrop-blur-sm transition-all" 
                  placeholder="输入你的冒险者名称"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-2">密码</label>
                <input 
                  type="password" 
                  className="w-full bg-zinc-800/60 border border-zinc-700/50 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 backdrop-blur-sm transition-all" 
                  placeholder="输入密码"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                />
              </div>
              <p className="text-xs text-zinc-500">
                首次使用会自动创建账号
              </p>
              <Button 
                className="w-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white rounded-2xl py-6 font-semibold shadow-lg shadow-amber-500/30 transition-all hover:shadow-amber-500/40 hover:scale-[1.02] active:scale-[0.98]"
                onClick={handleLogin}
                disabled={isLoggingIn}
              >
                {isLoggingIn ? "登录中..." : "登录 / 注册"}
              </Button>
            </div>
          </div>
        </div>
      )}



      <header className="border-b border-zinc-800/50 bg-zinc-900/40 backdrop-blur-2xl sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/30">
              <Sword className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-amber-200 via-amber-100 to-amber-200 bg-clip-text text-transparent">
                不冻港的西征世界
              </h1>
              <p className="text-xs text-zinc-500">D&amp;D Campaign Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <Link href="/profile">
                  <Button variant="ghost" size="sm">
                    <User className="h-4 w-4 mr-2" />
                    个人中心
                  </Button>
                </Link>
                <div className="flex items-center gap-2 bg-zinc-800/50 px-3 py-1.5 rounded-xl border border-zinc-700/50">
                  <div className="w-6 h-6 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-white">{user.username[0]}</span>
                  </div>
                  <span className="text-amber-300 font-medium text-sm">{user.username}</span>
                </div>
                <Button variant="ghost" onClick={logout} size="sm">
                  <LogOut className="h-4 w-4 mr-2" />
                  退出
                </Button>
              </div>
            ) : (
              <Button variant="ghost" onClick={() => setShowLoginModal(true)} size="sm">
                {isLoading ? "加载中..." : "登录"}
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center">
        <div className="container mx-auto px-6 py-8">
          <div className="mb-8 flex justify-center">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <DateDisplay />
              <WeatherDisplay />
            </div>
          </div>
          
          <div className="relative grid grid-cols-1 md:grid-cols-2 gap-20 md:gap-[104px] max-w-4xl mx-auto py-8 md:py-12 px-4 sm:px-8 md:px-10">
            {/* The absolute centered button */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex items-center justify-center pointer-events-none">
              <button 
                className="pointer-events-auto group relative flex flex-col items-center justify-center w-16 h-16 md:w-24 md:h-24 bg-gradient-to-br from-indigo-500 via-purple-600 to-indigo-800 rounded-full border-[6px] border-zinc-950 shadow-[0_0_30px_rgba(99,102,241,0.3)] hover:shadow-[0_0_50px_rgba(168,85,247,0.6)] transition-all duration-500 hover:scale-110 active:scale-95"
                onClick={() => setShowInfoModal(true)}
              >
                <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-500"></div>
                <div className="absolute inset-0 rounded-full border border-indigo-300/30 animate-[spin_4s_linear_infinite] opacity-50 pointer-events-none group-hover:opacity-100 group-hover:animate-[spin_2s_linear_infinite]"></div>
                <Sparkles className="h-5 w-5 md:h-6 md:w-6 text-indigo-200 mb-0.5 md:mb-1 group-hover:text-amber-300 group-hover:shadow-[0_0_15px_rgba(251,191,36,0.5)] transition-all duration-300" />
                <span className="text-[10px] md:text-xs font-bold text-indigo-50 tracking-widest bg-clip-text shadow-sm">异界信息</span>
              </button>
            </div>

            {[
              { id: "docs", title: "公会档案馆", description: "文档和规则的集中处", icon: BookOpen, color: "from-blue-500 to-blue-600", shadow: "shadow-blue-500/20", href: "/docs" },
              { id: "map", title: "世界地图", description: "探索边境世界", icon: Map, color: "from-emerald-500 to-emerald-600", shadow: "shadow-emerald-500/20", href: "/map" },
              { id: "board", title: "酒馆布告栏", description: "发布任务与战报", icon: MessageSquare, color: "from-purple-500 to-purple-600", shadow: "shadow-purple-500/20", href: "/board" },
              { id: "chat", title: "逸闻趣事", description: "据点聊天、交易与组队", icon: MessageCircleMore, color: "from-amber-500 to-amber-600", shadow: "shadow-amber-500/20", href: "/chat", requireLogin: true },
            ].map((item) => {
              const isDisabled = item.requireLogin && !user;
              
              const CardContent = isDisabled ? (
                <Card 
                  key={item.id} 
                  className="h-full flex flex-col opacity-50 cursor-not-allowed bg-gradient-to-br from-zinc-900/90 to-zinc-950/90 border-indigo-900/20 rounded-2xl"
                >
                  <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${item.color} opacity-30`} />
                  <CardHeader className="p-5 flex-1 flex flex-col justify-center">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                          {item.title}
                        </CardTitle>
                        <CardDescription className="text-zinc-400 text-sm leading-relaxed">
                          需要登录
                        </CardDescription>
                      </div>
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${item.color} ${item.shadow} shadow-lg`}>
                        <item.icon className="h-7 w-7 text-white" />
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ) : (
                <Link 
                  key={item.id} 
                  href={item.href}
                  className="block h-full"
                >
                  <Card className="h-full flex flex-col relative overflow-hidden bg-gradient-to-br from-zinc-900/90 to-indigo-950/10 border-indigo-500/10 hover:border-indigo-400/30 transition-all duration-500 hover:scale-105 hover:shadow-[0_0_30px_rgba(99,102,241,0.15)] group cursor-pointer backdrop-blur-sm rounded-2xl">
                    <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${item.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                    <CardHeader className="p-5 flex-1 flex flex-col justify-center">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-2 flex-1">
                          <CardTitle className="text-lg font-bold group-hover:text-white transition-colors flex items-center gap-2">
                            {item.title}
                            <ArrowRight className="h-3 w-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                          </CardTitle>
                          <CardDescription className="text-zinc-400 text-sm leading-relaxed">
                            {item.description}
                          </CardDescription>
                        </div>
                        <div className={`p-3 rounded-xl bg-gradient-to-br ${item.color} ${item.shadow} shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                          <item.icon className="h-7 w-7 text-white" />
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                </Link>
              );
              return CardContent;
            })}
          </div>
        </div>
      </main>

      <footer className="border-t border-zinc-800/50 bg-zinc-900/40 backdrop-blur-xl py-4 relative z-10 mt-auto">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <Sword className="h-4 w-4 text-amber-500" />
              <span className="text-zinc-400 text-sm">不冻港的西征世界</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-500 text-xs">
              <span>&copy; 2025</span>
              <span className="w-1 h-1 rounded-full bg-zinc-700" />
              <span>UI 优化版</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

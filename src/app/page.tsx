"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BookOpen, Map, MessageSquare, Users, Sword, X, User, LogOut, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useApp } from "@/contexts/AppContext";
import { DateDisplay } from "@/components/DateDisplay";

export default function Home() {
  const { user, login, logout, isLoading } = useAuth();
  const { isClient } = useApp();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

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
      {isClient && (
        <div className="fixed inset-0 z-0 pointer-events-none">
          <img 
            src="/images/home-bg.png" 
            alt="背景" 
            className="w-full h-full object-cover opacity-55 transition-opacity duration-1000" 
          />
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/60 via-zinc-950/40 to-zinc-950/80" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent" />
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
            <DateDisplay />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {[
              { id: "docs", title: "公会档案馆", description: "冒险规则与指南，房规，战报等各种文档的集中处", icon: BookOpen, color: "from-blue-500 to-blue-600", shadow: "shadow-blue-500/20", href: "/docs" },
              { id: "map", title: "世界地图", description: "探索边境世界", icon: Map, color: "from-emerald-500 to-emerald-600", shadow: "shadow-emerald-500/20", href: "/map" },
              { id: "board", title: "酒馆布告栏", description: "发布任务与战报", icon: MessageSquare, color: "from-purple-500 to-purple-600", shadow: "shadow-purple-500/20", href: "/board" },
              { id: "party", title: "组队界面", description: "寻找冒险伙伴", icon: Users, color: "from-rose-500 to-rose-600", shadow: "shadow-rose-500/20", href: "/party", requireLogin: true },
            ].map((item) => {
              const isDisabled = item.requireLogin && !user;
              const CardContent = isDisabled ? (
                <Card key={item.id} className="opacity-50 cursor-not-allowed bg-gradient-to-br from-zinc-900/80 to-zinc-950/80 border-zinc-700/50">
                  <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${item.color}`} />
                  <CardHeader className="p-5">
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
                <Link key={item.id} href={item.href}>
                  <Card className="relative overflow-hidden bg-gradient-to-br from-zinc-900/80 to-zinc-950/80 border-zinc-700/50 hover:border-zinc-600/50 transition-all duration-500 hover:scale-[1.02] hover:shadow-xl group cursor-pointer">
                    <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${item.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                    <CardHeader className="p-5">
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

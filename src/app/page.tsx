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
import { BookOpen, Map, MessageSquare, Users, Sword, X, User, LogOut } from "lucide-react";
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
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {isClient && (
        <div className="fixed inset-0 z-0 pointer-events-none">
          <img 
            src="/images/home-bg.png" 
            alt="首页背景" 
            className="w-full h-full object-cover opacity-45" 
          />
        </div>
      )}

      {showLoginModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={() => setShowLoginModal(false)}>
          <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">登录/注册</h3>
              <button onClick={() => setShowLoginModal(false)} className="text-zinc-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              {error && <div className="text-red-400 text-sm bg-red-900/20 p-3 rounded">{error}</div>}
              <div>
                <label className="block text-sm text-zinc-400 mb-1">用户名</label>
                <input 
                  type="text" 
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white" 
                  placeholder="输入你的冒险者名称"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1">密码</label>
                <input 
                  type="password" 
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white" 
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
                className="w-full bg-amber-600 hover:bg-amber-700" 
                onClick={handleLogin}
                disabled={isLoggingIn}
              >
                {isLoggingIn ? "登录中..." : "登录/注册"}
              </Button>
            </div>
          </div>
        </div>
      )}

      <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Sword className="h-8 w-8 text-amber-500" />
            <h1 className="text-2xl font-bold tracking-tight">不冻港的西征世界</h1>
            <DateDisplay />
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <Link href="/profile">
                  <Button variant="ghost" size="sm">
                    <User className="h-4 w-4 mr-2" />
                    个人中心
                  </Button>
                </Link>
                <div className="flex items-center gap-2 text-amber-400">
                  <span>{user.username}</span>
                </div>
                <Button variant="ghost" onClick={logout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  退出
                </Button>
              </div>
            ) : (
              <Button variant="ghost" onClick={() => setShowLoginModal(true)}>
                {isLoading ? "加载中..." : "登录"}
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="min-h-[calc(100vh-160px)] flex items-center justify-center px-4 py-8 relative z-10">
        <div className="w-full max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <Link href="/docs">
              <Card className="bg-zinc-900/90 border-zinc-800 hover:border-amber-500/50 transition-all duration-300 hover:scale-[1.02] cursor-pointer">
                <CardHeader className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">公会档案馆</CardTitle>
                      <CardDescription className="text-sm">冒险规则与指南，房规，战报等各种文档的集中处</CardDescription>
                    </div>
                    <BookOpen className="h-12 w-12 text-amber-500 flex-shrink-0" />
                  </div>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/map">
              <Card className="bg-zinc-900/90 border-zinc-800 hover:border-amber-500/50 transition-all duration-300 hover:scale-[1.02] cursor-pointer">
                <CardHeader className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">世界地图</CardTitle>
                      <CardDescription className="text-sm">探索边境世界</CardDescription>
                    </div>
                    <Map className="h-12 w-12 text-amber-500 flex-shrink-0" />
                  </div>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/board">
              <Card className="bg-zinc-900/90 border-zinc-800 hover:border-amber-500/50 transition-all duration-300 hover:scale-[1.02] cursor-pointer">
                <CardHeader className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">酒馆布告栏</CardTitle>
                      <CardDescription className="text-sm">发布任务与战报</CardDescription>
                    </div>
                    <MessageSquare className="h-12 w-12 text-amber-500 flex-shrink-0" />
                  </div>
                </CardHeader>
              </Card>
            </Link>

            {user ? (
              <Link href="/party">
                <Card className="bg-zinc-900/90 border-zinc-800 hover:border-amber-500/50 transition-all duration-300 hover:scale-[1.02] cursor-pointer">
                  <CardHeader className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">组队界面</CardTitle>
                        <CardDescription className="text-sm">寻找冒险伙伴</CardDescription>
                      </div>
                      <Users className="h-12 w-12 text-amber-500 flex-shrink-0" />
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            ) : (
              <Card className="opacity-50 cursor-not-allowed bg-zinc-900/90 border-zinc-800">
                <CardHeader className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">组队界面</CardTitle>
                      <CardDescription className="text-sm">需要登录</CardDescription>
                    </div>
                    <Users className="h-12 w-12 text-amber-500 flex-shrink-0" />
                  </div>
                </CardHeader>
              </Card>
            )}
          </div>
        </div>
      </main>

      <footer className="border-t border-zinc-800 bg-zinc-900 py-8 relative z-10">
        <div className="container mx-auto px-4 text-center text-zinc-500">
          <p>不冻港的西征世界 &copy; 2025</p>
        </div>
      </footer>
    </div>
  );
}

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
import { BookOpen, Map, MessageSquare, Users, Sword, X, CheckCircle2, User, LogOut, Lock, Image, Eye, FolderOpen } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useApp } from "@/contexts/AppContext";

export default function Home() {
  const { user, login, register, logout, isFirstTime } = useAuth();
  const { resources, settings, updateSettings, verifyPassword } = useApp();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [registerUsername, setRegisterUsername] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showResourceSelector, setShowResourceSelector] = useState(false);
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (isFirstTime) {
      setShowRegisterModal(true);
    }
  }, [isFirstTime]);

  const handleLogin = () => {
    const success = login(loginUsername, loginPassword);
    if (success) {
      setShowLoginModal(false);
      setError("");
      setLoginUsername("");
      setLoginPassword("");
    } else {
      setError("用户名或密码错误");
    }
  };

  const handleRegister = () => {
    if (registerPassword !== registerConfirmPassword) {
      setError("两次输入的密码不一致");
      return;
    }
    if (registerPassword.length < 4) {
      setError("密码至少需要4位");
      return;
    }
    const success = register(registerUsername, registerPassword);
    if (success) {
      setShowRegisterModal(false);
      setError("");
      setRegisterUsername("");
      setRegisterPassword("");
      setRegisterConfirmPassword("");
    } else {
      setError("注册失败");
    }
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

  const selectHomeBg = (url: string | null) => {
    updateSettings({ homeBg: url });
    setShowResourceSelector(false);
  };

  const homeResources = resources.filter((r) => r.category === "homeBg" || r.category === "general");

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 relative overflow-hidden">
      {settings.homeBg && (
        <div className="absolute inset-0 z-0" suppressHydrationWarning={true}>
          <img src={settings.homeBg} alt="首页背景" className="w-full h-full object-cover opacity-45" />
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
                选择首页背景
              </h3>
              <button onClick={() => setShowResourceSelector(false)} className="text-zinc-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <Button
                variant="ghost"
                className="w-full justify-start border border-zinc-700 bg-zinc-800"
                onClick={() => selectHomeBg(null)}
              >
                <Eye className="h-4 w-4 mr-2" />
                使用默认背景
              </Button>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {homeResources.map((img) => (
                  <div
                    key={img.id}
                    className="relative group cursor-pointer"
                    onClick={() => selectHomeBg(img.url)}
                  >
                    <div className="aspect-video bg-zinc-800 rounded-lg overflow-hidden border border-zinc-700">
                      <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                    </div>
                    <p className="text-sm text-zinc-400 mt-1 truncate">{img.name}</p>
                  </div>
                ))}
              </div>
              {homeResources.length === 0 && (
                <p className="text-zinc-500 text-center py-8">暂无图片资源，请先去资源库上传</p>
              )}
            </div>
          </div>
        </div>
      )}

      {showLoginModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={() => setShowLoginModal(false)}>
          <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">登录</h3>
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
                />
              </div>
              <Button className="w-full bg-amber-600 hover:bg-amber-700" onClick={handleLogin}>
                登录
              </Button>
            </div>
          </div>
        </div>
      )}

      {showRegisterModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">欢迎加入公会</h3>
            </div>
            <div className="space-y-4">
              {error && <div className="text-red-400 text-sm bg-red-900/20 p-3 rounded">{error}</div>}
              <div className="flex items-start gap-3 p-4 bg-amber-900/30 border border-amber-700/50 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="text-white font-medium">欢迎加入西征冒险公会！</p>
                  <p className="text-zinc-300 mt-1">请设置你的冒险者名称和密码。</p>
                </div>
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1">冒险者名称</label>
                <input 
                  type="text" 
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white" 
                  placeholder="你的角色名"
                  value={registerUsername}
                  onChange={(e) => setRegisterUsername(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1">密码</label>
                <input 
                  type="password" 
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white" 
                  placeholder="设置密码"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1">确认密码</label>
                <input 
                  type="password" 
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white" 
                  placeholder="再次输入密码"
                  value={registerConfirmPassword}
                  onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                />
              </div>
              <Button className="w-full bg-amber-600 hover:bg-amber-700" onClick={handleRegister}>
                开始冒险
              </Button>
            </div>
          </div>
        </div>
      )}

      <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sword className="h-8 w-8 text-amber-500" />
            <h1 className="text-2xl font-bold tracking-tight">WestMarch</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/resources">
              <Button variant="ghost" size="sm">
                <FolderOpen className="h-4 w-4 mr-2" />
                资源库
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (isAuthenticated) {
                  setShowResourceSelector(true);
                } else {
                  setShowPasswordModal(true);
                }
              }}
            >
              <Image className="h-4 w-4 mr-2" />
              背景设置
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (confirm("确定要清除所有本地设置数据吗？这将重置背景图片等设置。")) {
                  localStorage.removeItem("wm-settings");
                  localStorage.removeItem("wm-auth");
                  location.reload();
                }
              }}
            >
              清除数据
            </Button>
            {user ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-amber-400">
                  <User className="h-5 w-5" />
                  <span>{user.username}</span>
                </div>
                <Button variant="ghost" onClick={logout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  退出
                </Button>
              </div>
            ) : (
              <Button variant="ghost" onClick={() => setShowLoginModal(true)}>登录</Button>
            )}
          </div>
        </div>
      </header>

      <main className="min-h-[calc(100vh-160px)] flex items-center justify-center px-4 py-8 relative z-10">
        <div className="w-full max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            <div className="flex flex-col gap-6">
              <Link href="/docs">
                <Card className="bg-zinc-900/90 border-zinc-800 hover:border-amber-500/50 transition-all duration-300 hover:scale-[1.02] cursor-pointer">
                  <CardHeader className="p-4">
                    <BookOpen className="h-6 w-6 text-amber-500 mb-2" />
                    <CardTitle className="text-lg">公会档案馆</CardTitle>
                    <CardDescription className="text-sm">冒险规则与指南</CardDescription>
                  </CardHeader>
                </Card>
              </Link>

              <Link href="/map">
                <Card className="bg-zinc-900/90 border-zinc-800 hover:border-amber-500/50 transition-all duration-300 hover:scale-[1.02] cursor-pointer">
                  <CardHeader className="p-4">
                    <Map className="h-6 w-6 text-amber-500 mb-2" />
                    <CardTitle className="text-lg">世界地图</CardTitle>
                    <CardDescription className="text-sm">探索边境世界</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            </div>

            <div className="flex flex-col gap-6">
              <Link href="/board">
                <Card className="bg-zinc-900/90 border-zinc-800 hover:border-amber-500/50 transition-all duration-300 hover:scale-[1.02] cursor-pointer">
                  <CardHeader className="p-4">
                    <MessageSquare className="h-6 w-6 text-amber-500 mb-2" />
                    <CardTitle className="text-lg">酒馆布告栏</CardTitle>
                    <CardDescription className="text-sm">发布任务与战报</CardDescription>
                  </CardHeader>
                </Card>
              </Link>

              {user ? (
                <Link href="/characters">
                  <Card className="bg-zinc-900/90 border-zinc-800 hover:border-amber-500/50 transition-all duration-300 hover:scale-[1.02] cursor-pointer">
                    <CardHeader className="p-4">
                      <Users className="h-6 w-6 text-amber-500 mb-2" />
                      <CardTitle className="text-lg">角色卡册</CardTitle>
                      <CardDescription className="text-sm">管理你的冒险者</CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              ) : (
                <Card className="opacity-50 cursor-not-allowed bg-zinc-900/90 border-zinc-800">
                  <CardHeader className="p-4">
                    <Users className="h-6 w-6 text-amber-500 mb-2" />
                    <CardTitle className="text-lg">角色卡册</CardTitle>
                    <CardDescription className="text-sm">需要登录</CardDescription>
                  </CardHeader>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-zinc-800 bg-zinc-900 py-8 relative z-10">
        <div className="container mx-auto px-4 text-center text-zinc-500">
          <p>WestMarch Portal &copy; 2025</p>
        </div>
      </footer>
    </div>
  );
}

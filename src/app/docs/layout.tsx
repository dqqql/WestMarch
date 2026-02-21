"use client";

import Link from "next/link";
import { BookOpen, ArrowLeft, Image, Lock, Eye, X } from "lucide-react";
import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { resources, settings, updateSettings, verifyPassword } = useApp();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showResourceSelector, setShowResourceSelector] = useState(false);
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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

  const selectDocsBg = (url: string | null) => {
    updateSettings({ docsBg: url });
    setShowResourceSelector(false);
  };

  const docsResources = resources.filter((r) => r.category === "docsBg" || r.category === "general");

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {settings.docsBg && (
        <div className="fixed inset-0 z-0 pointer-events-none" suppressHydrationWarning={true}>
          <img src={settings.docsBg} alt="档案室背景" className="w-full h-full object-cover opacity-30 blur-[2px]" />
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
                选择档案室背景
              </h3>
              <button onClick={() => setShowResourceSelector(false)} className="text-zinc-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <Button
                variant="ghost"
                className="w-full justify-start border border-zinc-700 bg-zinc-800"
                onClick={() => selectDocsBg(null)}
              >
                <Eye className="h-4 w-4 mr-2" />
                使用默认背景
              </Button>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {docsResources.map((img) => (
                  <div
                    key={img.id}
                    className="relative group cursor-pointer"
                    onClick={() => selectDocsBg(img.url)}
                  >
                    <div className="aspect-video bg-zinc-800 rounded-lg overflow-hidden border border-zinc-700">
                      <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                    </div>
                    <p className="text-sm text-zinc-400 mt-1 truncate">{img.name}</p>
                  </div>
                ))}
              </div>
              {docsResources.length === 0 && (
                <p className="text-zinc-500 text-center py-8">暂无图片资源，请先去资源库上传</p>
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
              <BookOpen className="h-6 w-6 text-amber-500" />
              <h1 className="text-xl font-bold">公会档案馆</h1>
            </div>
          </div>
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
        </div>
      </header>
      <main className="container mx-auto px-4 py-8 relative z-10">
        {children}
      </main>
    </div>
  );
}

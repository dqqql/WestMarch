"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, MapPin, MessageCircleMore, X } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useApp } from "@/contexts/AppContext";
import ChatRoom from "./ChatRoom";

interface MapNode {
  id: string;
  label: string;
  type: string;
  description: string | null;
}

export default function ChatPage() {
  const { user } = useAuth();
  const { isClient } = useApp();
  const [strongholds, setStrongholds] = useState<MapNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<MapNode | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadStrongholds();
    }
  }, [user]);

  const loadStrongholds = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/chat/strongholds");
      if (response.ok) {
        setStrongholds(await response.json());
      }
    } catch (error) {
      console.error("Failed to load strongholds:", error);
    } finally {
      setIsLoading(false);
    }
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
                <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/30">
                  <MessageCircleMore className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-xl font-bold text-zinc-100">逸闻趣事</h1>
              </div>
            </div>
          </div>
        </header>

        <main className="min-h-[calc(100vh-160px)] flex items-center justify-center px-6 py-8 relative z-10">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-amber-500/20 to-amber-600/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <MessageCircleMore className="h-10 w-10 text-amber-400" />
            </div>
            <h2 className="text-2xl font-bold mb-2 text-zinc-100">需要登录</h2>
            <p className="text-zinc-400 mb-6">请先登录才能访问据点聊天</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/">
                <button className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white px-6 py-3 rounded-xl shadow-lg shadow-amber-500/30 transition-all">
                  返回首页登录
                </button>
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

  if (selectedNode) {
    return (
      <ChatRoom 
        node={selectedNode} 
        onBack={() => setSelectedNode(null)} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {isClient && (
        <div className="fixed inset-0 z-0 pointer-events-none">
          <img
            src="/images/general-bg.png"
            alt="背景"
            className="w-full h-full object-cover opacity-55 transition-opacity duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/60 via-zinc-950/40 to-zinc-950/80" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent" />
        </div>
      )}

      <header className="border-b border-zinc-800/50 bg-zinc-900/40 backdrop-blur-2xl sticky top-0 z-50">
        <div className="container mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="hover:text-amber-400 transition-colors p-2 hover:bg-zinc-800/60 rounded-xl">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/30">
                <MessageCircleMore className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-zinc-100">逸闻趣事</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 relative z-10">
        <div className="max-w-4xl mx-auto">
          {strongholds.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gradient-to-br from-amber-500/20 to-amber-600/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <MapPin className="h-10 w-10 text-amber-400" />
              </div>
              <h2 className="text-xl font-bold mb-2 text-zinc-400">暂无据点</h2>
              <p className="text-zinc-500">请先在世界地图中创建据点</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {strongholds.map((node) => (
                <div
                  key={node.id}
                  className="bg-gradient-to-br from-zinc-900/80 to-zinc-950/80 border border-zinc-700/50 hover:border-amber-500/50 transition-all duration-300 rounded-2xl p-6 cursor-pointer hover:scale-[1.02] group"
                  onClick={() => setSelectedNode(node)}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/30 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                      <MapPin className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold mb-2 text-zinc-100 group-hover:text-white transition-colors">
                        {node.label}
                      </h3>
                      {node.description && (
                        <p className="text-zinc-400 text-sm leading-relaxed">
                          {node.description}
                        </p>
                      )}
                      <div className="mt-4 flex items-center gap-2 text-amber-400 text-sm font-medium">
                        <MessageCircleMore className="h-4 w-4" />
                        <span>进入聊天室</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

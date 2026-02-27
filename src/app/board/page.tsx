"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Plus, ArrowLeft, Tag, X, Edit2, Trash2, Search, Clock, Trash, Star, User } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useApp } from "@/contexts/AppContext";
import { storage } from "@/services/storage";

interface Post {
  id: string;
  title: string;
  content: string;
  tag: "DM悬赏" | "杂谈" | "跑团战报" | "寻找队伍";
  authorId: string;
  author: { id: string; username: string; nickname: string | null };
  characterId: string | null;
  character: { id: string; name: string } | null;
  createdAt: string;
  updatedAt: string;
  honor: number;
  gold: number;
  reputation: number;
}

const tagColors = {
  "DM悬赏": "bg-purple-900/40 text-purple-300 border-purple-800/50",
  "寻找队伍": "bg-blue-900/40 text-blue-300 border-blue-800/50",
  "杂谈": "bg-purple-900/40 text-purple-300 border-purple-800/50",
  "跑团战报": "bg-amber-900/40 text-amber-300 border-amber-800/50",
};

const getDisplayTag = (tag: string) => {
  if (tag === "寻找队伍") return "杂谈";
  return tag;
};

export default function BoardPage() {
  const { user } = useAuth();
  const { isClient } = useApp();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [newPost, setNewPost] = useState({ title: "", content: "", tag: "杂谈" as "DM悬赏" | "杂谈" | "跑团战报", honor: 0, gold: 0, reputation: 0 });
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    return storage.getSearchHistory();
  });

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/posts");
      if (response.ok) {
        const data = await response.json();
        setPosts(data);
      }
    } catch (error) {
      console.error("Failed to load posts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePost = async () => {
    if (!newPost.title || !newPost.content || !user) return;
    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newPost.title,
          content: newPost.content,
          tag: newPost.tag,
          authorId: user.id,
          characterId: null,
          honor: newPost.honor,
          gold: newPost.gold,
          reputation: newPost.reputation
        }),
      });
      if (response.ok) {
        const createdPost = await response.json();
        setPosts([createdPost, ...posts]);
        setNewPost({ title: "", content: "", tag: "杂谈", honor: 0, gold: 0, reputation: 0 });
        setShowCreateModal(false);
      }
    } catch (error) {
      console.error("Failed to create post:", error);
      alert("创建帖子失败");
    }
  };

  const handleEditPost = async () => {
    if (!editingPost || !newPost.title || !newPost.content) return;
    try {
      const response = await fetch(`/api/posts/${editingPost.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newPost.title,
          content: newPost.content,
          tag: newPost.tag,
          characterId: null,
          honor: newPost.honor,
          gold: newPost.gold,
          reputation: newPost.reputation
        }),
      });
      if (response.ok) {
        const updatedPost = await response.json();
        setPosts(posts.map(p => p.id === editingPost.id ? updatedPost : p));
        setEditingPost(null);
        setNewPost({ title: "", content: "", tag: "杂谈", honor: 0, gold: 0, reputation: 0 });
      }
    } catch (error) {
      console.error("Failed to edit post:", error);
      alert("编辑帖子失败");
    }
  };

  const handleDeletePost = async (id: string) => {
    if (!confirm("确定要删除这篇帖子吗？")) return;
    try {
      const response = await fetch(`/api/posts/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setPosts(posts.filter(p => p.id !== id));
      }
    } catch (error) {
      console.error("Failed to delete post:", error);
      alert("删除帖子失败");
    }
  };

  const openEditModal = (post: Post) => {
    setEditingPost(post);
    const displayTag = getDisplayTag(post.tag);
    setNewPost({ 
      title: post.title, 
      content: post.content, 
      tag: displayTag as any,
      honor: post.honor || 0,
      gold: post.gold || 0,
      reputation: post.reputation || 0
    });
  };

  const isPostOwner = (post: Post) => {
    return user && post.authorId === user.id;
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() && !searchHistory.includes(query)) {
      const newHistory = [query, ...searchHistory].slice(0, 10);
      setSearchHistory(newHistory);
      storage.setSearchHistory(newHistory);
    }
  };

  const clearSearchHistory = () => {
    setSearchHistory([]);
    storage.setSearchHistory([]);
  };

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;
    const parts = text.split(new RegExp(`(${query})`, "gi"));
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={i} className="bg-amber-500/30 text-amber-200 px-1 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const sortedPosts = useMemo(() => {
    return [...posts].sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [posts]);

  const filteredPosts = useMemo(() => {
    let result = sortedPosts;
    
    if (selectedTag) {
      result = result.filter(post => {
        const displayTag = getDisplayTag(post.tag);
        return displayTag === selectedTag;
      });
    }
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const authorName = (post: Post) => post.author.nickname || post.author.username;
      result = result.filter(post =>
        post.title.toLowerCase().includes(query) ||
        post.content.toLowerCase().includes(query) ||
        authorName(post).toLowerCase().includes(query)
      );
    }
    
    return result;
  }, [sortedPosts, selectedTag, searchQuery]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center">
        <p className="text-zinc-400">加载中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 relative overflow-hidden flex flex-col">
      {isClient && (
        <div className="fixed inset-0 z-0 pointer-events-none">
          <img
            src="/images/general-bg.png"
            alt="公告栏背景"
            className="w-full h-full object-cover opacity-55 transition-opacity duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/60 via-zinc-950/40 to-zinc-950/80" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent" />
        </div>
      )}
      
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-300" onClick={() => setShowCreateModal(false)}>
          <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-700/50 rounded-3xl p-8 w-full max-w-lg mx-4 shadow-2xl shadow-black/50 animate-in zoom-in-95 duration-300" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">发布新帖</h3>
              <button 
                onClick={() => setShowCreateModal(false)} 
                className="text-zinc-500 hover:text-zinc-300 transition-colors p-2 hover:bg-zinc-800 rounded-xl"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-2">标题</label>
                <input 
                  type="text" 
                  className="w-full bg-zinc-800/60 border border-zinc-700/50 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 backdrop-blur-sm transition-all" 
                  placeholder="帖子标题"
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-2">分类</label>
                <select 
                  className="w-full bg-zinc-800/60 border border-zinc-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 backdrop-blur-sm transition-all"
                  value={newPost.tag}
                  onChange={(e) => setNewPost({ ...newPost, tag: e.target.value as any })}
                >
                  <option value="杂谈">杂谈</option>
                  <option value="跑团战报">跑团战报</option>
                  <option value="DM悬赏">DM悬赏</option>
                </select>
              </div>
              {newPost.tag === "DM悬赏" && (
                <div className="space-y-3 p-4 bg-zinc-800/60 rounded-xl border border-zinc-700/50 backdrop-blur-sm">
                  <h3 className="text-sm font-medium text-zinc-300">任务奖励</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs text-zinc-400 mb-2">荣誉</label>
                      <input 
                        type="number" 
                        min="0"
                        className="w-full bg-zinc-800/60 border border-zinc-700/50 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 backdrop-blur-sm transition-all" 
                        value={newPost.honor}
                        onChange={(e) => setNewPost({ ...newPost, honor: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-zinc-400 mb-2">金币</label>
                      <input 
                        type="number" 
                        min="0"
                        className="w-full bg-zinc-800/60 border border-zinc-700/50 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 backdrop-blur-sm transition-all" 
                        value={newPost.gold}
                        onChange={(e) => setNewPost({ ...newPost, gold: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-zinc-400 mb-2">声望</label>
                      <input 
                        type="number" 
                        min="0"
                        className="w-full bg-zinc-800/60 border border-zinc-700/50 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 backdrop-blur-sm transition-all" 
                        value={newPost.reputation}
                        onChange={(e) => setNewPost({ ...newPost, reputation: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                  </div>
                </div>
              )}
              <div>
                <label className="block text-sm text-zinc-400 mb-2">内容</label>
                <textarea 
                  className="w-full bg-zinc-800/60 border border-zinc-700/50 rounded-xl px-4 py-3 text-white h-32 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 backdrop-blur-sm transition-all" 
                  placeholder="帖子内容"
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                />
              </div>
              <div className="flex gap-3">
                <Button variant="ghost" onClick={() => setShowCreateModal(false)} className="rounded-xl">取消</Button>
                <Button className="flex-1 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white rounded-xl shadow-lg shadow-purple-500/30 transition-all" onClick={handleCreatePost}>发布</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {editingPost && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-300" onClick={() => setEditingPost(null)}>
          <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-700/50 rounded-3xl p-8 w-full max-w-lg mx-4 shadow-2xl shadow-black/50 animate-in zoom-in-95 duration-300" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">编辑帖子</h3>
              <button 
                onClick={() => setEditingPost(null)} 
                className="text-zinc-500 hover:text-zinc-300 transition-colors p-2 hover:bg-zinc-800 rounded-xl"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-2">标题</label>
                <input 
                  type="text" 
                  className="w-full bg-zinc-800/60 border border-zinc-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 backdrop-blur-sm transition-all" 
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-2">分类</label>
                <select 
                  className="w-full bg-zinc-800/60 border border-zinc-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 backdrop-blur-sm transition-all"
                  value={newPost.tag}
                  onChange={(e) => setNewPost({ ...newPost, tag: e.target.value as any })}
                >
                  <option value="杂谈">杂谈</option>
                  <option value="跑团战报">跑团战报</option>
                  <option value="DM悬赏">DM悬赏</option>
                </select>
              </div>
              {newPost.tag === "DM悬赏" && (
                <div className="space-y-3 p-4 bg-zinc-800/60 rounded-xl border border-zinc-700/50 backdrop-blur-sm">
                  <h3 className="text-sm font-medium text-zinc-300">任务奖励</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs text-zinc-400 mb-2">荣誉</label>
                      <input 
                        type="number" 
                        min="0"
                        className="w-full bg-zinc-800/60 border border-zinc-700/50 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 backdrop-blur-sm transition-all" 
                        value={newPost.honor}
                        onChange={(e) => setNewPost({ ...newPost, honor: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-zinc-400 mb-2">金币</label>
                      <input 
                        type="number" 
                        min="0"
                        className="w-full bg-zinc-800/60 border border-zinc-700/50 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 backdrop-blur-sm transition-all" 
                        value={newPost.gold}
                        onChange={(e) => setNewPost({ ...newPost, gold: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-zinc-400 mb-2">声望</label>
                      <input 
                        type="number" 
                        min="0"
                        className="w-full bg-zinc-800/60 border border-zinc-700/50 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 backdrop-blur-sm transition-all" 
                        value={newPost.reputation}
                        onChange={(e) => setNewPost({ ...newPost, reputation: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                  </div>
                </div>
              )}
              <div>
                <label className="block text-sm text-zinc-400 mb-2">内容</label>
                <textarea 
                  className="w-full bg-zinc-800/60 border border-zinc-700/50 rounded-xl px-4 py-3 text-white h-32 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 backdrop-blur-sm transition-all" 
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                />
              </div>
              <div className="flex gap-3">
                <Button variant="ghost" onClick={() => setEditingPost(null)} className="rounded-xl">取消</Button>
                <Button className="flex-1 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white rounded-xl shadow-lg shadow-purple-500/30 transition-all" onClick={handleEditPost}>保存</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <header className="border-b border-zinc-800/50 bg-zinc-900/40 backdrop-blur-2xl sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="hover:text-amber-400 transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                <MessageSquare className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-200 via-purple-100 to-purple-200 bg-clip-text text-transparent">
                  酒馆布告栏
                </h1>
                <p className="text-xs text-zinc-500">任务与战报</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {user && (
              <Button 
                className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white rounded-xl shadow-lg shadow-purple-500/30 transition-all" 
                onClick={() => setShowCreateModal(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                发布新帖
              </Button>
            )}
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-6 py-8 relative z-10 flex-1">
        <div className="max-w-5xl mx-auto">
          <div className="relative mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
              <input
                type="text"
                placeholder="搜索帖子、作者或内容..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full bg-zinc-800/60 border border-zinc-700/50 rounded-2xl pl-12 pr-4 py-4 text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 backdrop-blur-sm transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
            {searchHistory.length > 0 && !searchQuery && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-800/90 border border-zinc-700/50 rounded-2xl p-4 z-50 backdrop-blur-xl">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-zinc-400 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    搜索历史
                  </span>
                  <button
                    onClick={clearSearchHistory}
                    className="text-xs text-zinc-500 hover:text-red-400 flex items-center gap-1"
                  >
                    <Trash className="h-3 w-3" />
                    清空
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {searchHistory.map((item, i) => (
                    <button
                      key={i}
                      onClick={() => handleSearch(item)}
                      className="px-3 py-1.5 bg-zinc-700/60 hover:bg-zinc-600/60 rounded-xl text-sm text-zinc-300 transition-colors backdrop-blur-sm"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2 mb-8">
            <Button
              variant={selectedTag === null ? "default" : "secondary"}
              size="sm"
              onClick={() => setSelectedTag(null)}
              className={selectedTag === null 
                ? "bg-purple-600 text-white shadow-lg shadow-purple-500/30" 
                : "bg-zinc-800/60 text-zinc-300 hover:bg-zinc-700/60 backdrop-blur-sm"
              }
            >
              全部
            </Button>
            {["DM悬赏", "杂谈", "跑团战报"].map((tag) => (
              <Button
                key={tag}
                variant={selectedTag === tag ? "default" : "secondary"}
                size="sm"
                onClick={() => setSelectedTag(tag)}
                className={selectedTag === tag 
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-500/30" 
                  : "bg-zinc-800/60 text-zinc-300 hover:bg-zinc-700/60 backdrop-blur-sm"
                }
              >
                {tag}
              </Button>
            ))}
          </div>

          {filteredPosts.length === 0 ? (
            <Card className="bg-gradient-to-br from-zinc-900/80 to-zinc-950/80 border-zinc-700/50">
              <CardContent className="py-12 text-center">
                <MessageSquare className="h-16 w-16 mx-auto mb-4 text-zinc-600" />
                <p className="text-zinc-400">暂无帖子</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredPosts.map((post) => {
                const authorName = post.author.nickname || post.author.username;
                const displayTag = getDisplayTag(post.tag);
                return (
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
                              className={`px-3 py-1 rounded-xl text-xs font-medium border ${tagColors[post.tag]}`}
                            >
                              <Tag className="h-3 w-3 inline mr-1" />
                              {displayTag}
                            </span>
                            {displayTag === "DM悬赏" && (
                              <span className="px-3 py-1 bg-amber-900/40 text-amber-300 border border-amber-800/50 rounded-xl text-xs font-medium flex items-center gap-2">
                                <Star className="h-3 w-3" />
                                奖励: 荣誉 {post.honor || 0} | 金币 {post.gold || 0} | 声望 {post.reputation || 0}
                              </span>
                            )}
                          </div>
                          <Link href={`/board/${post.id}`} className="block hover:bg-zinc-800/50 transition-colors -mx-2 -my-2 px-2 py-2 rounded-xl">
                            <h3 className="text-xl font-bold mb-2 text-zinc-100 group-hover:text-white transition-colors">
                              {searchQuery ? highlightText(post.title, searchQuery) : post.title}
                            </h3>
                            <p className="text-zinc-400 mb-4 line-clamp-2 leading-relaxed">
                              {searchQuery ? highlightText(post.content, searchQuery) : post.content}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-zinc-500">
                              <span className="flex items-center gap-1">
                                <User className="h-4 w-4" />
                                {authorName}
                              </span>
                              {post.character && <span>角色: {post.character.name}</span>}
                              <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {new Date(post.createdAt).toLocaleString("zh-CN")}
                              </span>
                            </div>
                          </Link>
                        </div>
                        {isPostOwner(post) && (
                          <div className="flex gap-2">
                            <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-zinc-800/60 rounded-xl" onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              openEditModal(post);
                            }}>
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-red-900/20 text-red-400 rounded-xl" onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleDeletePost(post.id);
                            }}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

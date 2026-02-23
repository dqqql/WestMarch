"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Plus, ArrowLeft, Tag, X, Edit2, Trash2, Send, Search, Clock, Trash } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

interface Post {
  id: string;
  title: string;
  content: string;
  tag: "DM悬赏" | "寻找队伍" | "跑团战报";
  authorId: string;
  author: { id: string; username: string; nickname: string | null };
  characterId: string | null;
  character: { id: string; name: string } | null;
  createdAt: string;
  updatedAt: string;
}

const tagColors = {
  "DM悬赏": "bg-red-900/50 text-red-300 border-red-800",
  "寻找队伍": "bg-blue-900/50 text-blue-300 border-blue-800",
  "跑团战报": "bg-amber-900/50 text-amber-300 border-amber-800",
};

export default function BoardPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [newPost, setNewPost] = useState({ title: "", content: "", tag: "寻找队伍" as "DM悬赏" | "寻找队伍" | "跑团战报" });
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("wm-search-history");
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
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
          characterId: null
        }),
      });
      if (response.ok) {
        const createdPost = await response.json();
        setPosts([createdPost, ...posts]);
        setNewPost({ title: "", content: "", tag: "寻找队伍" });
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
          characterId: null
        }),
      });
      if (response.ok) {
        const updatedPost = await response.json();
        setPosts(posts.map(p => p.id === editingPost.id ? updatedPost : p));
        setEditingPost(null);
        setNewPost({ title: "", content: "", tag: "寻找队伍" });
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
    setNewPost({ title: post.title, content: post.content, tag: post.tag });
  };

  const isPostOwner = (post: Post) => {
    return user && post.authorId === user.id;
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() && !searchHistory.includes(query)) {
      const newHistory = [query, ...searchHistory].slice(0, 10);
      setSearchHistory(newHistory);
      try {
        localStorage.setItem("wm-search-history", JSON.stringify(newHistory));
      } catch {}
    }
  };

  const clearSearchHistory = () => {
    setSearchHistory([]);
    try {
      localStorage.removeItem("wm-search-history");
    } catch {}
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
      result = result.filter(post => post.tag === selectedTag);
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
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={() => setShowCreateModal(false)}>
          <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-6 w-full max-w-lg mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">发布新帖</h3>
              <button 
                onClick={() => setShowCreateModal(false)} 
                className="text-zinc-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-1">标题</label>
                <input 
                  type="text" 
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white" 
                  placeholder="帖子标题"
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1">分类</label>
                <select 
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white"
                  value={newPost.tag}
                  onChange={(e) => setNewPost({ ...newPost, tag: e.target.value as any })}
                >
                  <option value="寻找队伍">寻找队伍</option>
                  <option value="跑团战报">跑团战报</option>
                  <option value="DM悬赏">DM悬赏</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1">内容</label>
                <textarea 
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white h-32" 
                  placeholder="帖子内容"
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                />
              </div>
              <div className="flex gap-3">
                <Button variant="ghost" onClick={() => setShowCreateModal(false)}>取消</Button>
                <Button className="flex-1 bg-amber-600 hover:bg-amber-700" onClick={handleCreatePost}>发布</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {editingPost && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={() => setEditingPost(null)}>
          <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-6 w-full max-w-lg mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">编辑帖子</h3>
              <button 
                onClick={() => setEditingPost(null)} 
                className="text-zinc-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-1">标题</label>
                <input 
                  type="text" 
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white" 
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1">分类</label>
                <select 
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white"
                  value={newPost.tag}
                  onChange={(e) => setNewPost({ ...newPost, tag: e.target.value as any })}
                >
                  <option value="寻找队伍">寻找队伍</option>
                  <option value="跑团战报">跑团战报</option>
                  <option value="DM悬赏">DM悬赏</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1">内容</label>
                <textarea 
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white h-32" 
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                />
              </div>
              <div className="flex gap-3">
                <Button variant="ghost" onClick={() => setEditingPost(null)}>取消</Button>
                <Button className="flex-1 bg-amber-600 hover:bg-amber-700" onClick={handleEditPost}>保存</Button>
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
              <MessageSquare className="h-6 w-6 text-amber-500" />
              <h1 className="text-xl font-bold">酒馆布告栏</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {user && (
              <Button 
                className="bg-amber-600 hover:bg-amber-700" 
                onClick={() => setShowCreateModal(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                发布新帖
              </Button>
            )}
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="relative mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
              <input
                type="text"
                placeholder="搜索帖子、作者或内容..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-10 pr-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/50"
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
              <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-800 border border-zinc-700 rounded-lg p-3 z-50">
                <div className="flex items-center justify-between mb-2">
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
                      className="px-3 py-1 bg-zinc-700 hover:bg-zinc-600 rounded text-sm text-zinc-300 transition-colors"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            <Button
              variant={selectedTag === null ? "default" : "secondary"}
              size="sm"
              onClick={() => setSelectedTag(null)}
              className={selectedTag === null ? "bg-amber-600 hover:bg-amber-700" : "bg-zinc-800 hover:bg-zinc-700"}
            >
              全部
            </Button>
            {["DM悬赏", "寻找队伍", "跑团战报"].map((tag) => (
              <Button
                key={tag}
                variant={selectedTag === tag ? "default" : "secondary"}
                size="sm"
                onClick={() => setSelectedTag(tag)}
                className={selectedTag === tag ? "bg-amber-600 hover:bg-amber-700" : "bg-zinc-800 hover:bg-zinc-700"}
              >
                {tag}
              </Button>
            ))}
          </div>

          {filteredPosts.length === 0 ? (
            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="py-12 text-center">
                <MessageSquare className="h-16 w-16 mx-auto mb-4 text-zinc-600" />
                <p className="text-zinc-400">暂无帖子</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredPosts.map((post) => {
                const authorName = post.author.nickname || post.author.username;
                return (
                  <Card
                    key={post.id}
                    className="bg-zinc-900 border-zinc-800 hover:border-amber-500/50 transition-colors flex flex-col"
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-3">
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium border ${tagColors[post.tag]}`}
                            >
                              <Tag className="h-3 w-3 inline mr-1" />
                              {post.tag}
                            </span>
                          </div>
                          <CardTitle className="text-xl">
                            {searchQuery ? highlightText(post.title, searchQuery) : post.title}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-2">
                            <span>作者: {searchQuery ? highlightText(authorName, searchQuery) : authorName}</span>
                            {post.character && <span>• 角色: {post.character.name}</span>}
                            <span className="text-zinc-600">
                              • {new Date(post.createdAt).toLocaleString("zh-CN")}
                            </span>
                          </CardDescription>
                        </div>
                        {isPostOwner(post) && (
                          <div className="flex gap-2">
                            <Button variant="ghost" size="icon" onClick={() => openEditModal(post)}>
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeletePost(post.id)}>
                              <Trash2 className="h-4 w-4 text-red-400" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4 flex-1">
                      <p className="text-zinc-300">
                        {searchQuery ? highlightText(post.content, searchQuery) : post.content}
                      </p>
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

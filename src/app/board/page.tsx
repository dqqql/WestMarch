"use client";

import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Plus, ArrowLeft, Tag, X, Edit2, Trash2, Send, MessageCircle, Users, Image, Lock, Eye, Search, Clock, Trash } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useApp } from "@/contexts/AppContext";

interface Comment {
  id: string;
  author: string;
  content: string;
  createdAt: string;
}

interface Post {
  id: string;
  title: string;
  content: string;
  tag: "DM悬赏" | "寻找队伍" | "跑团战报";
  author: string;
  character: string | null;
  createdAt: string;
  comments: Comment[];
}

const initialPosts: Post[] = [
  {
    id: "1",
    title: "寻找队伍：探索废弃矿山",
    content: "我们需要一名战士和一名治疗者来探索西部边境的废弃矿山，据说那里藏有丰富的矿石和古老的宝藏。",
    tag: "寻找队伍",
    author: "冒险者张三",
    character: "铁锤·石拳",
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    comments: [
      {
        id: "c1",
        author: "冒险者李四",
        content: "我想加入！我是游侠。",
        createdAt: new Date(Date.now() - 3000000).toISOString(),
      },
    ],
  },
  {
    id: "2",
    title: "战报：迷雾森林探险",
    content: "昨天我们成功探索了迷雾森林，发现了一个神秘的精灵遗迹！详细战报如下...",
    tag: "跑团战报",
    author: "冒险者李四",
    character: "月影·行者",
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    comments: [],
  },
  {
    id: "3",
    title: "DM悬赏：剿灭哥布林营地",
    content: "西部边境的哥布林活动日益频繁，现悬赏剿灭哥布林营地的冒险者队伍！",
    tag: "DM悬赏",
    author: "DM",
    character: null,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    comments: [],
  },
];

const tagColors = {
  "DM悬赏": "bg-red-900/50 text-red-300 border-red-800",
  "寻找队伍": "bg-blue-900/50 text-blue-300 border-blue-800",
  "跑团战报": "bg-amber-900/50 text-amber-300 border-amber-800",
};

export default function BoardPage() {
  const { user } = useAuth();
  const { resources, settings, updateSettings, verifyPassword } = useApp();
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [newPost, setNewPost] = useState({ title: "", content: "", tag: "寻找队伍" as "DM悬赏" | "寻找队伍" | "跑团战报" });
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showResourceSelector, setShowResourceSelector] = useState(false);
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [boardBgError, setBoardBgError] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("wm-search-history");
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  const handleCreatePost = () => {
    if (!newPost.title || !newPost.content) return;
    const post: Post = {
      id: Date.now().toString(),
      title: newPost.title,
      content: newPost.content,
      tag: newPost.tag,
      author: user?.username || "匿名",
      character: null,
      createdAt: new Date().toISOString(),
      comments: [],
    };
    setPosts([post, ...posts]);
    setNewPost({ title: "", content: "", tag: "寻找队伍" });
    setShowCreateModal(false);
  };

  const handleEditPost = () => {
    if (!editingPost || !newPost.title || !newPost.content) return;
    setPosts(posts.map(p => p.id === editingPost.id ? { ...p, ...newPost } : p));
    setEditingPost(null);
    setNewPost({ title: "", content: "", tag: "寻找队伍" });
  };

  const handleDeletePost = (id: string) => {
    if (confirm("确定要删除这篇帖子吗？")) {
      setPosts(posts.filter(p => p.id !== id));
    }
  };

  const handleAddComment = (postId: string) => {
    const content = commentInputs[postId] || "";
    if (!content.trim()) return;
    setPosts(posts.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          comments: [
            ...p.comments,
            {
              id: Date.now().toString(),
              author: user?.username || "匿名",
              content,
              createdAt: new Date().toISOString(),
            },
          ],
        };
      }
      return p;
    }));
    setCommentInputs({ ...commentInputs, [postId]: "" });
  };

  const openEditModal = (post: Post) => {
    setEditingPost(post);
    setNewPost({ title: post.title, content: post.content, tag: post.tag });
  };

  const isPostOwner = (post: Post) => {
    return user && post.author === user.username;
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

  const selectBoardBg = (url: string | null) => {
    updateSettings({ boardBg: url });
    setShowResourceSelector(false);
  };

  const boardResources = resources.filter((r) => r.category === "boardBg" || r.category === "general");

  const handleBoardBgError = () => {
    setBoardBgError(true);
    updateSettings({ boardBg: null });
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
      result = result.filter(post =>
        post.title.toLowerCase().includes(query) ||
        post.content.toLowerCase().includes(query) ||
        post.author.toLowerCase().includes(query)
      );
    }
    
    return result;
  }, [sortedPosts, selectedTag, searchQuery]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {settings.boardBg && !boardBgError && (
        <div className="fixed inset-0 z-0 pointer-events-none" suppressHydrationWarning={true}>
          <img 
            src={settings.boardBg} 
            alt="布告栏背景" 
            className="w-full h-full object-cover opacity-30 blur-[2px]" 
            onError={handleBoardBgError}
          />
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
                选择布告栏背景
              </h3>
              <button onClick={() => setShowResourceSelector(false)} className="text-zinc-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <Button
                variant="ghost"
                className="w-full justify-start border border-zinc-700 bg-zinc-800"
                onClick={() => selectBoardBg(null)}
              >
                <Eye className="h-4 w-4 mr-2" />
                使用默认背景
              </Button>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {boardResources.map((img) => (
                  <div
                    key={img.id}
                    className="relative group cursor-pointer"
                    onClick={() => selectBoardBg(img.url)}
                  >
                    <div className="aspect-video bg-zinc-800 rounded-lg overflow-hidden border border-zinc-700">
                      <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                    </div>
                    <p className="text-sm text-zinc-400 mt-1 truncate">{img.name}</p>
                  </div>
                ))}
              </div>
              {boardResources.length === 0 && (
                <p className="text-zinc-500 text-center py-8">暂无图片资源，请先去资源库上传</p>
              )}
            </div>
          </div>
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={() => setShowCreateModal(false)}>
          <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-6 w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">发布新帖</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-zinc-400 hover:text-white">
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
          <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-6 w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">编辑帖子</h3>
              <button onClick={() => setEditingPost(null)} className="text-zinc-400 hover:text-white">
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
            {user && (
              <Button className="bg-amber-600 hover:bg-amber-700" onClick={() => setShowCreateModal(true)}>
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
              variant={selectedTag === null ? "default" : "ghost"}
              onClick={() => setSelectedTag(null)}
              className={selectedTag === null ? "bg-amber-600 hover:bg-amber-700" : ""}
            >
              全部
            </Button>
            {["DM悬赏", "寻找队伍", "跑团战报"].map((tag) => (
              <Button
                key={tag}
                variant={selectedTag === tag ? "default" : "ghost"}
                onClick={() => setSelectedTag(tag)}
                className={selectedTag === tag ? "bg-amber-600 hover:bg-amber-700" : ""}
              >
                {tag}
              </Button>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredPosts.map((post) => (
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
                      <span>作者: {searchQuery ? highlightText(post.author, searchQuery) : post.author}</span>
                      {post.character && <span>• 角色: {post.character}</span>}
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
                
                {post.tag === "寻找队伍" && user && (
                  <Link
                    href={`/party?title=${encodeURIComponent(post.title)}&content=${encodeURIComponent(post.content)}`}
                  >
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      <Users className="h-4 w-4 mr-2" />
                      一键发起组队
                    </Button>
                  </Link>
                )}
                
                <div className="border-t border-zinc-800 pt-4 mt-auto">
                  <div className="flex items-center gap-2 mb-3 text-zinc-400">
                    <MessageCircle className="h-4 w-4" />
                    <span className="text-sm">评论 ({post.comments.length})</span>
                  </div>
                  
                  <div className="space-y-3 mb-4">
                    {post.comments.map((comment) => (
                      <div key={comment.id} className="bg-zinc-800/50 rounded-lg p-3">
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-sm font-medium text-amber-400">{comment.author}</span>
                          <span className="text-xs text-zinc-500">{new Date(comment.createdAt).toLocaleString("zh-CN")}</span>
                        </div>
                        <p className="text-sm text-zinc-300">{comment.content}</p>
                      </div>
                    ))}
                  </div>
                  
                  {user && (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        className="flex-1 bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white text-sm"
                        placeholder="写下你的评论..."
                        value={commentInputs[post.id] || ""}
                        onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                        onKeyDown={(e) => e.key === "Enter" && handleAddComment(post.id)}
                      />
                      <Button className="bg-amber-600 hover:bg-amber-700" onClick={() => handleAddComment(post.id)}>
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
          </div>
        </div>
      </main>
    </div>
  );
}

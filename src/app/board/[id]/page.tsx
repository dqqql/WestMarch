"use client";

import { useState, useEffect, use } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Tag, Edit2, Trash2, User, MapPin } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import ReactMarkdown from "react-markdown";
import { CommentList } from "@/components/CommentList";

interface Post {
  id: string;
  title: string;
  content: string;
  tag: "DM悬赏" | "杂谈" | "跑团战报" | "寻找队伍";
  authorId: string;
  author: { id: string; username: string; nickname: string | null; avatar: string | null };
  characterId: string | null;
  character: { id: string; name: string } | null;
  nodeId: string | null;
  node: { id: string; label: string; type: string } | null;
  createdAt: string;
  updatedAt: string;
  honor: number;
  gold: number;
  reputation: number;
}

const tagColors = {
  "DM悬赏": "bg-red-900/50 text-red-300 border-red-800",
  "寻找队伍": "bg-blue-900/50 text-blue-300 border-blue-800",
  "杂谈": "bg-blue-900/50 text-blue-300 border-blue-800",
  "跑团战报": "bg-amber-900/50 text-amber-300 border-amber-800",
};

const getDisplayTag = (tag: string) => {
  if (tag === "寻找队伍") return "杂谈";
  return tag;
};

export default function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { user } = useAuth();
  const { id } = use(params);
  const [post, setPost] = useState<Post | null>(null);
  const [strongholds, setStrongholds] = useState<{ id: string; label: string; type: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editTag, setEditTag] = useState<"DM悬赏" | "杂谈" | "跑团战报">("杂谈");
  const [editHonor, setEditHonor] = useState(0);
  const [editGold, setEditGold] = useState(0);
  const [editReputation, setEditReputation] = useState(0);
  const [editNodeId, setEditNodeId] = useState("");

  useEffect(() => {
    loadPost();
    loadStrongholds();
  }, [id]);

  const loadStrongholds = async () => {
    try {
      const response = await fetch("/api/chat/strongholds");
      if (response.ok) {
        const data = await response.json();
        setStrongholds(data);
      }
    } catch (error) {
      console.error("Failed to load strongholds:", error);
    }
  };

  const loadPost = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/posts/${id}`);
      if (response.ok) {
        const data = await response.json();
        setPost(data);
        setEditTitle(data.title);
        setEditContent(data.content);
        const displayTag = getDisplayTag(data.tag);
        setEditTag(displayTag as any);
        setEditHonor(data.honor || 0);
        setEditGold(data.gold || 0);
        setEditReputation(data.reputation || 0);
        setEditNodeId(data.nodeId || "");
      }
    } catch (error) {
      console.error("Failed to load post:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!post || !editTitle || !editContent) return;
    try {
      const response = await fetch(`/api/posts/${post.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle,
          content: editContent,
          tag: editTag,
          characterId: null,
          nodeId: editNodeId || null,
          honor: editHonor,
          gold: editGold,
          reputation: editReputation
        }),
      });
      if (response.ok) {
        const updatedPost = await response.json();
        setPost(updatedPost);
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Failed to edit post:", error);
      alert("编辑帖子失败");
    }
  };

  const handleDelete = async () => {
    if (!post || !confirm("确定要删除这篇帖子吗？")) return;
    try {
      const response = await fetch(`/api/posts/${post.id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        window.location.href = "/board";
      }
    } catch (error) {
      console.error("Failed to delete post:", error);
      alert("删除帖子失败");
    }
  };

  const isPostOwner = () => {
    return user && post && post.authorId === user.id;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center">
        <p className="text-zinc-400">加载中...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center">
        <p className="text-zinc-400">帖子不存在</p>
      </div>
    );
  }

  const authorName = post.author.nickname || post.author.username;
  const displayTag = getDisplayTag(post.tag);

  if (isEditing) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100">
        <div className="fixed inset-0 z-0 pointer-events-none">
          <img
            src="/images/general-bg.v1.webp"
            alt="公告栏背景"
            className="w-full h-full object-cover opacity-30 blur-[2px]"
          />
        </div>

        <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/board" className="hover:text-amber-400 transition-colors">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <h1 className="text-xl font-bold">编辑帖子</h1>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8 relative z-10">
          <div className="max-w-3xl mx-auto">
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-1">标题</label>
                <input 
                  type="text" 
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white" 
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1">分类</label>
                <select 
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white"
                  value={editTag}
                  onChange={(e) => setEditTag(e.target.value as any)}
                >
                  <option value="杂谈">杂谈</option>
                  <option value="跑团战报">跑团战报</option>
                  <option value="DM悬赏">DM悬赏</option>
                </select>
              </div>
              {editTag === "DM悬赏" && (
                <div className="space-y-3 p-4 bg-zinc-800/50 rounded-lg border border-zinc-700">
                  <h3 className="text-sm font-medium text-zinc-300">任务奖励</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs text-zinc-400 mb-1">荣誉</label>
                      <input 
                        type="number" 
                        min="0"
                        className="w-full bg-zinc-700 border border-zinc-600 rounded px-3 py-2 text-white" 
                        value={editHonor}
                        onChange={(e) => setEditHonor(parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-zinc-400 mb-1">金币</label>
                      <input 
                        type="number" 
                        min="0"
                        className="w-full bg-zinc-700 border border-zinc-600 rounded px-3 py-2 text-white" 
                        value={editGold}
                        onChange={(e) => setEditGold(parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-zinc-400 mb-1">声望</label>
                      <input 
                        type="number" 
                        min="0"
                        className="w-full bg-zinc-700 border border-zinc-600 rounded px-3 py-2 text-white" 
                        value={editReputation}
                        onChange={(e) => setEditReputation(parseInt(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                  <div className="mt-3">
                    <label className="block text-xs text-zinc-400 mb-1">关联据点（可选）</label>
                    <select 
                      className="w-full bg-zinc-700 border border-zinc-600 rounded px-3 py-2 text-white"
                      value={editNodeId}
                      onChange={(e) => setEditNodeId(e.target.value)}
                    >
                      <option value="">不关联据点</option>
                      {strongholds.map((stronghold) => (
                        <option key={stronghold.id} value={stronghold.id}>
                          {stronghold.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
              <div>
                <label className="block text-sm text-zinc-400 mb-1">内容 (支持Markdown格式)</label>
                <textarea 
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white h-64"
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                />
              </div>
              <div className="flex gap-3">
                <Button variant="ghost" onClick={() => setIsEditing(false)}>取消</Button>
                <Button className="flex-1 bg-amber-600 hover:bg-amber-700" onClick={handleEdit}>保存</Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <img
          src="/images/general-bg.v1.webp"
          alt="公告栏背景"
          className="w-full h-full object-cover opacity-30 blur-[2px]"
        />
      </div>

      <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/board" className="hover:text-amber-400 transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-xl font-bold">帖子详情</h1>
          </div>
          {isPostOwner() && (
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                <Edit2 className="h-4 w-4 mr-2" />
                编辑
              </Button>
              <Button variant="ghost" size="sm" onClick={handleDelete} className="text-red-400 hover:text-red-300">
                <Trash2 className="h-4 w-4 mr-2" />
                删除
              </Button>
            </div>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-3xl mx-auto">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                <span className={`px-2 py-1 rounded text-xs font-medium border ${tagColors[post.tag]}`}>
                  <Tag className="h-3 w-3 inline mr-1" />
                  {displayTag}
                </span>
                {displayTag === "DM悬赏" && (
                  <>
                    <span className="px-2 py-1 bg-amber-900/50 text-amber-300 border border-amber-800 rounded text-xs font-medium">
                      奖励: 荣誉 {post.honor || 0} | 金币 {post.gold || 0} | 声望 {post.reputation || 0}
                    </span>
                    {post.node && (
                      <span className="px-2 py-1 bg-emerald-900/50 text-emerald-300 border border-emerald-800 rounded text-xs font-medium flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {post.node.label}
                      </span>
                    )}
                  </>
                )}
              </div>
              <h1 className="text-2xl font-bold mb-4 text-zinc-100">
                {post.title}
              </h1>
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    {post.author.avatar ? (
                      <img
                        src={post.author.avatar}
                        alt={authorName}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-zinc-700 flex items-center justify-center">
                        <User className="w-6 h-6 text-zinc-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-zinc-200 font-medium">{authorName}</span>
                    <div className="flex items-center gap-3 text-zinc-400 text-sm">
                      {post.character && <span>角色: {post.character.name}</span>}
                      <span>发布时间: {new Date(post.createdAt).toLocaleString("zh-CN")}</span>
                      {post.updatedAt !== post.createdAt && (
                        <span>更新时间: {new Date(post.updatedAt).toLocaleString("zh-CN")}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="prose prose-invert max-w-none [&>p]:my-2 [&>p]:leading-relaxed [&>h1]:mb-3 [&>h1]:mt-4 [&>h2]:mb-2 [&>h2]:mt-3 [&>h3]:mb-2 [&>h3]:mt-3 [&>ul]:my-2 [&>ol]:my-2 [&>li]:my-1 [&>blockquote]:my-3 [&>pre]:my-3">
                <ReactMarkdown>
                  {post.content}
                </ReactMarkdown>
              </div>
            </div>
          </div>
          
          <CommentList postId={post.id} />
        </div>
      </main>
    </div>
  );
}

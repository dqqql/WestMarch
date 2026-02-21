"use client";

import Link from "next/link";
import {
  BookOpen,
  ArrowLeft,
  Image,
  Lock,
  Eye,
  X,
  Plus,
  Hash,
  Folder,
  FileText,
  Pin,
  Edit2,
  Trash2,
  Save,
  MoreHorizontal,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useApp, Document } from "@/contexts/AppContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const {
    resources,
    settings,
    updateSettings,
    verifyPassword,
    documents,
    addDocument,
    updateDocument,
    deleteDocument,
  } = useApp();
  const { user } = useAuth();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showResourceSelector, setShowResourceSelector] = useState(false);
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingDoc, setEditingDoc] = useState<Document | null>(null);
  const [newDoc, setNewDoc] = useState({
    title: "",
    content: "",
    category: "规则",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const sortedDocuments = [...documents].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  const categories = Array.from(new Set(documents.map((d) => d.category)));

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

  const docsResources = resources.filter(
    (r) => r.category === "docsBg" || r.category === "general"
  );

  const handleCreateDoc = () => {
    if (!newDoc.title || !newDoc.content) return;
    addDocument({
      title: newDoc.title,
      content: newDoc.content,
      category: newDoc.category,
      author: user?.username || "匿名",
    });
    setNewDoc({ title: "", content: "", category: "规则" });
    setShowCreateModal(false);
  };

  const handleEditDoc = () => {
    if (!editingDoc) return;
    updateDocument(editingDoc.id, {
      title: newDoc.title,
      content: newDoc.content,
      category: newDoc.category,
    });
    setEditingDoc(null);
    setNewDoc({ title: "", content: "", category: "规则" });
  };

  const handleStartEdit = (doc: Document) => {
    setEditingDoc(doc);
    setNewDoc({
      title: doc.title,
      content: doc.content,
      category: doc.category,
    });
  };

  const handleSaveEdit = () => {
    if (!selectedDoc) return;
    updateDocument(selectedDoc.id, { content: editContent });
    setIsEditing(false);
    setSelectedDoc({ ...selectedDoc, content: editContent });
  };

  const handleStartEditTitle = () => {
    if (!selectedDoc) return;
    setEditTitle(selectedDoc.title);
    setIsEditingTitle(true);
  };

  const handleSaveEditTitle = () => {
    if (!selectedDoc) return;
    updateDocument(selectedDoc.id, { title: editTitle });
    setIsEditingTitle(false);
    setSelectedDoc({ ...selectedDoc, title: editTitle });
  };

  const handleTogglePin = (doc: Document) => {
    updateDocument(doc.id, { isPinned: !doc.isPinned });
  };

  useEffect(() => {
    if (documents.length > 0 && !selectedDoc) {
      setSelectedDoc(documents[0]);
    }
  }, [documents]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex h-screen overflow-hidden">
      {settings.docsBg && (
        <div className="fixed inset-0 z-0 pointer-events-none" suppressHydrationWarning={true}>
          <img
            src={settings.docsBg}
            alt="档案室背景"
            className="w-full h-full object-cover opacity-20"
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
              <button
                onClick={() => setShowPasswordModal(false)}
                className="text-zinc-400 hover:text-white"
              >
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
              <Button
                className="w-full bg-amber-600 hover:bg-amber-700"
                onClick={handleVerifyPassword}
              >
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
              <button
                onClick={() => setShowResourceSelector(false)}
                className="text-zinc-400 hover:text-white"
              >
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
                      <img
                        src={img.url}
                        alt={img.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="text-sm text-zinc-400 mt-1 truncate">{img.name}</p>
                  </div>
                ))}
              </div>
              {docsResources.length === 0 && (
                <p className="text-zinc-500 text-center py-8">
                  暂无图片资源，请先去资源库上传
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {(showCreateModal || editingDoc) && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
          onClick={() => {
            setShowCreateModal(false);
            setEditingDoc(null);
            setNewDoc({ title: "", content: "", category: "规则" });
          }}
        >
          <div
            className="bg-zinc-900 border border-zinc-700 rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">
                {editingDoc ? "编辑文档" : "创建新文档"}
              </h3>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingDoc(null);
                }}
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
                  placeholder="文档标题"
                  value={newDoc.title}
                  onChange={(e) => setNewDoc({ ...newDoc, title: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1">分类</label>
                <input
                  type="text"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white"
                  placeholder="分类名称"
                  value={newDoc.category}
                  onChange={(e) => setNewDoc({ ...newDoc, category: e.target.value })}
                  list="categoryList"
                />
                <datalist id="categoryList">
                  {categories.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1">内容 (支持 Markdown)</label>
                <textarea
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white h-64 font-mono text-sm"
                  placeholder="# 标题&#10;&#10;文档内容..."
                  value={newDoc.content}
                  onChange={(e) => setNewDoc({ ...newDoc, content: e.target.value })}
                />
              </div>
              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingDoc(null);
                  }}
                >
                  取消
                </Button>
                <Button
                  className="flex-1 bg-amber-600 hover:bg-amber-700"
                  onClick={editingDoc ? handleEditDoc : handleCreateDoc}
                >
                  {editingDoc ? "保存" : "创建"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="w-16 bg-zinc-900 border-r border-zinc-800 flex flex-col items-center py-4 gap-4 relative z-10">
        <Link href="/" className="hover:bg-zinc-800 p-2 rounded-lg transition-colors">
          <ArrowLeft className="h-6 w-6 text-zinc-400 hover:text-white" />
        </Link>
        <div className="w-10 h-10 bg-amber-600 rounded-lg flex items-center justify-center">
          <BookOpen className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1" />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            if (isAuthenticated) {
              setShowResourceSelector(true);
            } else {
              setShowPasswordModal(true);
            }
          }}
        >
          <Image className="h-5 w-5 text-zinc-400" />
        </Button>
      </div>

      <div className="w-64 bg-zinc-900/95 border-r border-zinc-800 flex flex-col relative z-10">
        <div className="p-4 border-b border-zinc-800">
          <h2 className="font-bold text-lg">公会档案馆</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {isMounted && sortedDocuments.map((doc) => (
            <button
              key={doc.id}
              onClick={() => setSelectedDoc(doc)}
              className={`w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-zinc-800 transition-colors ${
                selectedDoc?.id === doc.id ? "bg-zinc-800 text-white" : "text-zinc-400"
              } ${doc.isPinned ? "border-l-4 border-amber-500 pl-2" : ""}`}
            >
              {doc.isPinned ? (
                <Pin className="h-4 w-4 text-amber-500 flex-shrink-0" />
              ) : (
                <FileText className="h-4 w-4 flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="truncate">{doc.title}</p>
                {doc.category && (
                  <p className="text-xs text-zinc-600 truncate">{doc.category}</p>
                )}
              </div>
            </button>
          ))}
        </div>
        {user && (
          <div className="p-4 border-t border-zinc-800">
            <Button
              className="w-full bg-amber-600 hover:bg-amber-700"
              onClick={() => setShowCreateModal(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              新建文档
            </Button>
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col relative z-10">
        {selectedDoc ? (
          <>
            <div className="h-12 border-b border-zinc-800 bg-zinc-900/80 flex items-center px-4 gap-4">
              <Hash className="h-5 w-5 text-zinc-400" />
              {isEditingTitle ? (
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="text"
                    className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-white flex-1 max-w-md"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveEditTitle();
                      if (e.key === 'Escape') {
                        setIsEditingTitle(false);
                        setEditTitle(selectedDoc?.title || '');
                      }
                    }}
                    autoFocus
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSaveEditTitle}
                  >
                    <Save className="h-4 w-4 text-amber-500" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsEditingTitle(false);
                      setEditTitle(selectedDoc?.title || '');
                    }}
                  >
                    <X className="h-4 w-4 text-zinc-400" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2 flex-1">
                  <h2 className="font-semibold">{selectedDoc?.title}</h2>
                  {user && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleStartEditTitle}
                    >
                      <Edit2 className="h-4 w-4 text-zinc-500 hover:text-zinc-300" />
                    </Button>
                  )}
                </div>
              )}
              <div className="flex-1" />
              {user && (
                <div className="flex items-center gap-2">
                  {selectedDoc?.isPinned ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleTogglePin(selectedDoc)}
                    >
                      <Pin className="h-4 w-4 text-amber-500" />
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleTogglePin(selectedDoc!)}
                    >
                      <Pin className="h-4 w-4 text-zinc-400" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (confirm("确定要删除这篇文档吗？")) {
                        deleteDocument(selectedDoc!.id);
                        setSelectedDoc(null);
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-red-400" />
                  </Button>
                </div>
              )}
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {isEditing ? (
                <div className="space-y-4">
                  <textarea
                    className="w-full h-full min-h-[500px] bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white font-mono text-sm"
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setIsEditing(false);
                        setEditContent(selectedDoc.content);
                      }}
                    >
                      取消
                    </Button>
                    <Button className="bg-amber-600 hover:bg-amber-700" onClick={handleSaveEdit}>
                      <Save className="h-4 w-4 mr-2" />
                      保存
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  className="prose prose-invert prose-zinc max-w-none"
                  onDoubleClick={() => {
                    if (user) {
                      setIsEditing(true);
                      setEditContent(selectedDoc.content);
                    }
                  }}
                >
                  <Markdown remarkPlugins={[remarkGfm]}>{selectedDoc.content}</Markdown>
                  <div className="mt-8 pt-4 border-t border-zinc-800 text-sm text-zinc-500">
                    <p>作者: {selectedDoc.author}</p>
                    <p>创建时间: {new Date(selectedDoc.createdAt).toLocaleString("zh-CN")}</p>
                    <p>最后更新: {new Date(selectedDoc.updatedAt).toLocaleString("zh-CN")}</p>
                    {user && (
                      <p className="mt-2 text-zinc-600">双击文档内容可以快速编辑</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-zinc-500">
            <div className="text-center">
              <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p>选择或创建一个文档</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

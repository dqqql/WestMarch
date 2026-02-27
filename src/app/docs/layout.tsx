"use client";

import Link from "next/link";
import {
  BookOpen,
  ArrowLeft,
  X,
  Plus,
  Hash,
  FileText,
  Pin,
  Edit2,
  Trash2,
  Save,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useApp, useDocuments, type Document } from "@/contexts/AppContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isClient } = useApp();
  const {
    documents,
    addDocument,
    updateDocument,
    deleteDocument,
  } = useDocuments();
  const { user } = useAuth();
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
      {isClient && (
        <div className="fixed inset-0 z-0 pointer-events-none">
          <img
            src="/images/general-bg.png"
            alt="档案室背景"
            className="w-full h-full object-cover opacity-55 transition-opacity duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/60 via-zinc-950/40 to-zinc-950/80" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent" />
        </div>
      )}

      {(showCreateModal || editingDoc) && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-300"
          onClick={() => {
            setShowCreateModal(false);
            setEditingDoc(null);
            setNewDoc({ title: "", content: "", category: "规则" });
          }}
        >
          <div
            className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-700/50 rounded-3xl p-8 w-full max-w-2xl max-h-[80vh] overflow-y-auto shadow-2xl shadow-black/50 animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-zinc-100">
                    {editingDoc ? "编辑文档" : "创建新文档"}
                  </h3>
                  <p className="text-zinc-500 text-sm">记录你的冒险知识</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingDoc(null);
                }}
                className="text-zinc-500 hover:text-zinc-300 transition-colors p-2 hover:bg-zinc-800 rounded-xl"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-5">
              <div>
                <label className="block text-sm text-zinc-400 mb-2">标题</label>
                <input
                  type="text"
                  className="w-full bg-zinc-800/60 border border-zinc-700/50 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 backdrop-blur-sm transition-all"
                  placeholder="文档标题"
                  value={newDoc.title}
                  onChange={(e) => setNewDoc({ ...newDoc, title: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-2">分类</label>
                <input
                  type="text"
                  className="w-full bg-zinc-800/60 border border-zinc-700/50 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 backdrop-blur-sm transition-all"
                  placeholder="分类名称"
                  value={newDoc.category}
                  onChange={(e) => setNewDoc({ ...newDoc, category: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-2">内容 (支持 Markdown)</label>
                <textarea
                  className="w-full bg-zinc-800/60 border border-zinc-700/50 rounded-xl px-4 py-3 text-white h-64 font-mono text-sm placeholder-zinc-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 backdrop-blur-sm transition-all resize-none"
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
                  className="rounded-xl hover:bg-zinc-800/60"
                >
                  取消
                </Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-xl shadow-lg shadow-blue-500/30 transition-all"
                  onClick={editingDoc ? handleEditDoc : handleCreateDoc}
                >
                  {editingDoc ? "保存" : "创建"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="w-16 bg-zinc-900/80 border-r border-zinc-800/50 flex flex-col items-center py-4 gap-4 relative z-10 backdrop-blur-xl">
        <Link href="/" className="hover:bg-zinc-800/60 p-2 rounded-xl transition-colors">
          <ArrowLeft className="h-6 w-6 text-zinc-400 hover:text-white" />
        </Link>
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
          <BookOpen className="h-6 w-6 text-white" />
        </div>
      </div>

      <div className="w-72 bg-zinc-900/70 border-r border-zinc-800/50 flex flex-col relative z-10 backdrop-blur-xl">
        <div className="p-4 border-b border-zinc-800/50">
          <h2 className="font-bold text-lg text-zinc-100">公会档案馆</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {isMounted && sortedDocuments.map((doc) => (
            <button
              key={doc.id}
              onClick={() => setSelectedDoc(doc)}
              className={`w-full px-3 py-3 text-left text-sm flex items-center gap-3 hover:bg-zinc-800/60 transition-all duration-300 rounded-xl ${
                selectedDoc?.id === doc.id ? "bg-zinc-800/60 text-zinc-100" : "text-zinc-400"
              } ${doc.isPinned ? "border-l-4 border-amber-500" : ""}`}
            >
              {doc.isPinned ? (
                <Pin className="h-4 w-4 text-amber-500 flex-shrink-0" />
              ) : (
                <FileText className="h-4 w-4 flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="truncate font-medium">{doc.title}</p>
                {doc.category && (
                  <p className="text-xs text-zinc-500 truncate">{doc.category}</p>
                )}
              </div>
            </button>
          ))}
        </div>
        {user && (
          <div className="p-4 border-t border-zinc-800/50">
            <Button
              className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-xl shadow-lg shadow-blue-500/30 transition-all"
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
            <div className="h-14 border-b border-zinc-800/50 bg-zinc-900/60 backdrop-blur-xl flex items-center px-6 gap-4">
              <Hash className="h-5 w-5 text-zinc-400" />
              {isEditingTitle ? (
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="text"
                    className="bg-zinc-800/60 border border-zinc-700/50 rounded-xl px-3 py-2 text-white flex-1 max-w-md backdrop-blur-sm transition-all focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
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
                    className="rounded-xl hover:bg-zinc-800/60"
                  >
                    <Save className="h-4 w-4 text-blue-400" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsEditingTitle(false);
                      setEditTitle(selectedDoc?.title || '');
                    }}
                    className="rounded-xl hover:bg-zinc-800/60"
                  >
                    <X className="h-4 w-4 text-zinc-400" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2 flex-1">
                  <h2 className="font-semibold text-zinc-100">{selectedDoc?.title}</h2>
                  {user && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleStartEditTitle}
                      className="rounded-xl hover:bg-zinc-800/60"
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
                      className="rounded-xl hover:bg-zinc-800/60"
                    >
                      <Pin className="h-4 w-4 text-amber-500" />
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleTogglePin(selectedDoc!)}
                      className="rounded-xl hover:bg-zinc-800/60"
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
                    className="rounded-xl hover:bg-red-900/20 text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
            <div className="flex-1 overflow-y-auto p-8">
              {isEditing ? (
                <div className="space-y-4 max-w-4xl mx-auto">
                  <textarea
                    className="w-full h-full min-h-[500px] bg-zinc-900/60 border border-zinc-700/50 rounded-xl px-4 py-4 text-white font-mono text-sm backdrop-blur-sm transition-all focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 resize-none"
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                  />
                  <div className="flex gap-3">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setIsEditing(false);
                        setEditContent(selectedDoc.content);
                      }}
                      className="rounded-xl hover:bg-zinc-800/60"
                    >
                      取消
                    </Button>
                    <Button className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-xl shadow-lg shadow-blue-500/30 transition-all" onClick={handleSaveEdit}>
                      <Save className="h-4 w-4 mr-2" />
                      保存
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  className="prose prose-invert prose-zinc max-w-4xl mx-auto"
                  onDoubleClick={() => {
                    if (user) {
                      setIsEditing(true);
                      setEditContent(selectedDoc.content);
                    }
                  }}
                >
                  <Markdown remarkPlugins={[remarkGfm]}>{selectedDoc.content}</Markdown>
                  <div className="mt-8 pt-4 border-t border-zinc-800/50 text-sm text-zinc-500">
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
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <FileText className="h-10 w-10 text-blue-400" />
              </div>
              <p className="text-zinc-400">选择或创建一个文档</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

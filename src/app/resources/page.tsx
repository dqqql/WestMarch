"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FolderOpen, Upload, Trash2, X, Image, Home, MapPin, User, FileImage, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useApp, type ImageCategory } from "@/contexts/AppContext";

const categoryLabels: Record<ImageCategory, string> = {
  homeBg: "首页背景",
  mapBg: "地图背景",
  characterAvatar: "角色头像",
  general: "通用",
};

const categoryIcons: Record<ImageCategory, React.ReactNode> = {
  homeBg: <Home className="h-4 w-4" />,
  mapBg: <MapPin className="h-4 w-4" />,
  characterAvatar: <User className="h-4 w-4" />,
  general: <FileImage className="h-4 w-4" />,
};

export default function ResourcesPage() {
  const { resources, addResource, deleteResource, isLoading, loadResources } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<ImageCategory | "all">("all");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadName, setUploadName] = useState("");
  const [uploadCategory, setUploadCategory] = useState<ImageCategory>("general");
  const [uploadUrl, setUploadUrl] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const clearOldLocalStorage = () => {
    if (confirm("确定要清除旧的 localStorage 数据吗？这不会影响已保存到 IndexedDB 的图片。")) {
      try {
        localStorage.removeItem("wm-resources");
        alert("已清除旧数据");
      } catch (error) {
        console.error("Failed to clear localStorage:", error);
        alert("清除失败，请重试");
      }
    }
  };

  const filteredResources = selectedCategory === "all"
    ? resources
    : resources.filter((r) => r.category === selectedCategory);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("请选择图片文件");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setUploadUrl(result);
      if (!uploadName) {
        setUploadName(file.name.replace(/\.[^/.]+$/, ""));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleUpload = async () => {
    if (!uploadUrl || !uploadName) {
      alert("请选择图片并填写名称");
      return;
    }

    setIsUploading(true);
    try {
      await addResource({
        name: uploadName,
        url: uploadUrl,
        category: uploadCategory,
      });

      setShowUploadModal(false);
      setUploadName("");
      setUploadUrl("");
      setUploadCategory("general");
    } catch (error) {
      console.error("Failed to upload resource:", error);
      alert("上传失败，请重试");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`确定要删除图片"${name}"吗？`)) {
      try {
        await deleteResource(id);
      } catch (error) {
        console.error("Failed to delete resource:", error);
        alert("删除失败，请重试");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center">
        <div className="text-center">
          <Image className="h-16 w-16 text-zinc-600 mx-auto mb-4 animate-pulse" />
          <p className="text-zinc-400">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Upload className="h-5 w-5" />
                上传图片
              </h3>
              <button onClick={() => setShowUploadModal(false)} className="text-zinc-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              {!uploadUrl ? (
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                    isDragging
                      ? "border-amber-500 bg-amber-500/10"
                      : "border-zinc-700 hover:border-zinc-600 bg-zinc-800"
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById("file-input")?.click()}
                >
                  <Image className="h-12 w-12 mx-auto mb-4 text-zinc-500" />
                  <p className="text-zinc-400 mb-2">拖拽图片到这里或点击选择</p>
                  <p className="text-xs text-zinc-500">支持 JPG、PNG、GIF 等格式</p>
                  <input
                    id="file-input"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="aspect-video bg-zinc-800 rounded-lg overflow-hidden border border-zinc-700">
                    <img src={uploadUrl} alt="预览" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <label className="block text-sm text-zinc-400 mb-1">图片名称</label>
                    <input
                      type="text"
                      className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white"
                      value={uploadName}
                      onChange={(e) => setUploadName(e.target.value)}
                      placeholder="输入图片名称"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-zinc-400 mb-1">分类</label>
                    <select
                      className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white"
                      value={uploadCategory}
                      onChange={(e) => setUploadCategory(e.target.value as ImageCategory)}
                    >
                      {(Object.keys(categoryLabels) as ImageCategory[]).map((cat) => (
                        <option key={cat} value={cat}>
                          {categoryLabels[cat]}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      className="flex-1"
                      onClick={() => {
                        setUploadUrl("");
                        setUploadName("");
                      }}
                    >
                      重新选择
                    </Button>
                  </div>
                </div>
              )}
              <div className="flex gap-2 pt-4">
                <Button variant="ghost" onClick={() => setShowUploadModal(false)}>
                  取消
                </Button>
                <Button
                  className="flex-1 bg-amber-600 hover:bg-amber-700"
                  onClick={handleUpload}
                  disabled={!uploadUrl || !uploadName || isUploading}
                >
                  {isUploading ? "上传中..." : "上传"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:text-amber-400 transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="flex items-center gap-2">
              <FolderOpen className="h-6 w-6 text-amber-500" />
              <h1 className="text-xl font-bold">资源库</h1>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={clearOldLocalStorage}
            >
              清除旧数据
            </Button>
            <Button
              className="bg-amber-600 hover:bg-amber-700"
              onClick={() => setShowUploadModal(true)}
            >
              <Upload className="h-4 w-4 mr-2" />
              上传图片
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex gap-2 mb-6 flex-wrap">
          <Button
            variant={selectedCategory === "all" ? "default" : "secondary"}
            size="sm"
            onClick={() => setSelectedCategory("all")}
            className={selectedCategory === "all" ? "bg-amber-600 hover:bg-amber-700" : "bg-zinc-800 hover:bg-zinc-700"}
          >
            全部
          </Button>
          {(Object.keys(categoryLabels) as ImageCategory[]).map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? "default" : "secondary"}
              size="sm"
              onClick={() => setSelectedCategory(cat)}
              className={selectedCategory === cat ? "bg-amber-600 hover:bg-amber-700" : "bg-zinc-800 hover:bg-zinc-700"}
            >
              <span className="flex items-center gap-2">
                {categoryIcons[cat]}
                {categoryLabels[cat]}
              </span>
            </Button>
          ))}
        </div>

        {filteredResources.length === 0 ? (
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="py-12 text-center">
              <Image className="h-16 w-16 mx-auto mb-4 text-zinc-600" />
              <p className="text-zinc-400 mb-4">暂无图片资源</p>
              <Button
                className="bg-amber-600 hover:bg-amber-700"
                onClick={() => setShowUploadModal(true)}
              >
                <Upload className="h-4 w-4 mr-2" />
                上传第一张图片
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredResources.map((resource) => (
              <Card
                key={resource.id}
                className="bg-zinc-900 border-zinc-800 overflow-hidden group"
              >
                <div className="aspect-video bg-zinc-800 relative">
                  <img
                    src={resource.url}
                    alt={resource.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 bg-zinc-900/80 hover:bg-red-900/50"
                      onClick={() => handleDelete(resource.id, resource.name)}
                    >
                      <Trash2 className="h-4 w-4 text-red-400" />
                    </Button>
                  </div>
                  <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="px-2 py-1 bg-zinc-900/80 rounded text-xs text-zinc-300 flex items-center gap-1">
                      {categoryIcons[resource.category]}
                      {categoryLabels[resource.category]}
                    </span>
                  </div>
                </div>
                <CardContent className="p-3">
                  <p className="text-sm text-zinc-300 truncate">{resource.name}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

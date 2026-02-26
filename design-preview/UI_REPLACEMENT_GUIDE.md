# UI 替换实施指南

本文档详细说明了如何按照优先级逐步替换和改进项目的 UI 设计。

---

## 📋 总览

### 实施原则
1. **渐进式改造**：按优先级逐步进行，每个步骤完成后进行测试
2. **保持功能稳定**：UI 改进不应影响现有功能
3. **统一设计系统**：使用设计令牌替代硬编码值
4. **可访问性优先**：确保所有改进符合 WCAG 2.1 AA 标准

### 文件结构
```
src/
├── app/                    # 页面文件
│   ├── page.tsx           # 首页
│   ├── layout.tsx         # 根布局
│   ├── globals.css        # 全局样式
│   ├── board/             # 布告栏
│   ├── characters/        # 角色管理
│   ├── docs/              # 文档系统
│   ├── map/               # 地图页面
│   ├── party/             # 组队系统
│   ├── profile/           # 个人中心
│   └── resources/         # 资源管理
├── components/
│   └── ui/                # UI 组件
│       ├── button.tsx
│       └── card.tsx
└── config/
    └── theme.ts           # 主题配置
```

---

## 第一阶段：基础设施准备

### 步骤 1.1：创建 Input 组件

**文件**：`src/components/ui/input.tsx`

**原因**：当前项目使用原生 `<input>` 元素，样式不统一。

**操作**：创建 shadcn/ui 风格的 Input 组件

```tsx
import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium",
          "placeholder:text-muted-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 focus-visible:border-amber-500",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "transition-all duration-200",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
```

---

### 步骤 1.2：创建 Textarea 组件

**文件**：`src/components/ui/textarea.tsx`

**原因**：当前项目使用原生 `<textarea>` 元素。

**操作**：

```tsx
import * as React from "react"
import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background",
          "placeholder:text-muted-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 focus-visible:border-amber-500",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "transition-all duration-200",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
```

---

### 步骤 1.3：创建 Select 组件

**文件**：`src/components/ui/select.tsx`

**原因**：当前项目使用原生 `<select>` 元素。

**操作**：

```tsx
import * as React from "react"
import { cn } from "@/lib/utils"

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <select
        className={cn(
          "flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 focus-visible:border-amber-500",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "transition-all duration-200",
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </select>
    )
  }
)
Select.displayName = "Select"

export { Select }
```

---

### 步骤 1.4：创建 Modal 组件

**文件**：`src/components/ui/modal.tsx`

**原因**：当前项目多处使用重复的模态框代码。

**操作**：

```tsx
"use client"

import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  className?: string
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl"
}

const maxWidthClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
}

export function Modal({
  open,
  onClose,
  title,
  children,
  className,
  maxWidth = "md",
}: ModalProps) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className={cn(
          "bg-card border border-border rounded-xl p-6 w-full",
          "max-h-[85vh] overflow-y-auto",
          "animate-in fade-in-0 zoom-in-95 duration-200",
          maxWidthClasses[maxWidth],
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-foreground">{title}</h3>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-lg hover:bg-muted"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
```

---

### 步骤 1.5：创建 Skeleton 组件

**文件**：`src/components/ui/skeleton.tsx`

**原因**：添加加载状态骨架屏。

**操作**：

```tsx
import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted",
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
```

---

### 步骤 1.6：更新全局样式

**文件**：`src/app/globals.css`

**操作**：在文件末尾添加以下内容

```css
/* 自定义滚动条 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: hsl(var(--muted));
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: hsl(var(--border));
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: hsl(var(--ring));
}

/* 焦点样式增强 */
*:focus-visible {
  outline: 2px solid hsl(var(--ring));
  outline-offset: 2px;
}

/* 平滑过渡 */
* {
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

/* 动画关键帧 */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideIn {
  from { opacity: 0; transform: translateX(-10px); }
  to { opacity: 1; transform: translateX(0); }
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-out forwards;
}

.animate-slide-in {
  animation: slideIn 0.3s ease-out forwards;
}
```

---

## 第二阶段：首页改造

### 步骤 2.1：更新首页头部

**文件**：`src/app/page.tsx`

**当前代码**（约第 106-137 行）：
```tsx
<header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm sticky top-0 z-50">
  <div className="container mx-auto px-4 py-4 flex items-center justify-between">
    ...
  </div>
</header>
```

**替换为**：
```tsx
<header className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-50">
  <div className="container mx-auto px-4 py-4 flex items-center justify-between">
    <div className="flex items-center gap-4">
      <div className="p-2 bg-gradient-to-br from-amber-500 to-amber-700 rounded-lg">
        <Sword className="h-6 w-6 text-white" />
      </div>
      <div>
        <h1 className="text-xl font-bold bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
          不冻港的西征世界
        </h1>
      </div>
      <DateDisplay />
    </div>
    <div className="flex items-center gap-3">
      {user ? (
        <div className="flex items-center gap-3">
          <Link href="/profile">
            <Button variant="ghost" size="sm" className="gap-2">
              <User className="h-4 w-4" />
              个人中心
            </Button>
          </Link>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 rounded-lg border border-amber-500/20">
            <span className="text-amber-400 font-medium">{user.username}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={logout} className="gap-2">
            <LogOut className="h-4 w-4" />
            退出
          </Button>
        </div>
      ) : (
        <Button variant="ghost" onClick={() => setShowLoginModal(true)}>
          {isLoading ? "加载中..." : "登录"}
        </Button>
      )}
    </div>
  </div>
</header>
```

---

### 步骤 2.2：更新登录模态框

**文件**：`src/app/page.tsx`

**当前代码**（约第 59-104 行）：
```tsx
{showLoginModal && (
  <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={() => setShowLoginModal(false)}>
    <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
      ...
    </div>
  </div>
)}
```

**替换为**：
```tsx
import { Modal } from "@/components/ui/modal"
import { Input } from "@/components/ui/input"

// 在组件内
<Modal
  open={showLoginModal}
  onClose={() => setShowLoginModal(false)}
  title="登录/注册"
  maxWidth="md"
>
  <div className="space-y-4">
    {error && (
      <div className="text-red-400 text-sm bg-red-900/20 border border-red-800/50 p-3 rounded-lg">
        {error}
      </div>
    )}
    <div>
      <label className="block text-sm font-medium text-muted-foreground mb-2">
        用户名
      </label>
      <Input
        type="text"
        placeholder="输入你的冒险者名称"
        value={loginUsername}
        onChange={(e) => setLoginUsername(e.target.value)}
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-muted-foreground mb-2">
        密码
      </label>
      <Input
        type="password"
        placeholder="输入密码"
        value={loginPassword}
        onChange={(e) => setLoginPassword(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleLogin()}
      />
    </div>
    <p className="text-xs text-muted-foreground">
      首次使用会自动创建账号
    </p>
    <Button
      className="w-full bg-amber-600 hover:bg-amber-500"
      onClick={handleLogin}
      disabled={isLoggingIn}
    >
      {isLoggingIn ? "登录中..." : "登录/注册"}
    </Button>
  </div>
</Modal>
```

---

### 步骤 2.3：更新首页卡片

**文件**：`src/app/page.tsx`

**当前代码**（约第 142-154 行）：
```tsx
<Link href="/docs">
  <Card className="bg-zinc-900/90 border-zinc-800 hover:border-amber-500/50 transition-all duration-300 hover:scale-[1.02] cursor-pointer">
    <CardHeader className="p-6">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <CardTitle className="text-lg">公会档案馆</CardTitle>
          <CardDescription className="text-sm">冒险规则与指南，房规，战报等各种文档的集中处</CardDescription>
        </div>
        <BookOpen className="h-12 w-12 text-amber-500 flex-shrink-0" />
      </div>
    </CardHeader>
  </Card>
</Link>
```

**替换为**：
```tsx
<Link href="/docs" className="group block">
  <Card className="
    bg-card/90 
    border-border 
    hover:border-amber-500/50 
    hover:shadow-xl hover:shadow-amber-900/10
    hover:-translate-y-1
    transition-all 
    duration-300
    cursor-pointer
    relative
    overflow-hidden
  ">
    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-amber-500/10 to-transparent rounded-bl-full -translate-y-1/2 translate-x-1/2 group-hover:translate-x-1/4 group-hover:-translate-y-1/4 transition-transform duration-500" />
    
    <CardHeader className="p-6 relative">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <CardTitle className="text-lg font-bold group-hover:text-amber-400 transition-colors">
            公会档案馆
          </CardTitle>
          <CardDescription className="text-sm leading-relaxed">
            冒险规则与指南，房规，战报等各种文档的集中处
          </CardDescription>
        </div>
        <div className="p-3 bg-amber-500/10 rounded-xl group-hover:bg-amber-500/20 group-hover:scale-110 transition-all">
          <BookOpen className="h-8 w-8 text-amber-500 flex-shrink-0" />
        </div>
      </div>
    </CardHeader>
  </Card>
</Link>
```

**注意**：对其他三个卡片（世界地图、酒馆布告栏、组队界面）应用相同的模式。

---

## 第三阶段：布告栏页面改造

### 步骤 3.1：更新布告栏头部

**文件**：`src/app/board/page.tsx`

**当前代码**（约第 327-350 行）：
```tsx
<header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm sticky top-0 z-50">
  ...
</header>
```

**替换为**：
```tsx
<header className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-50">
  <div className="container mx-auto px-4 py-4 flex items-center justify-between">
    <div className="flex items-center gap-4">
      <Link href="/" className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-5 w-5" />
      </Link>
      <div className="flex items-center gap-2">
        <div className="p-2 bg-amber-500/10 rounded-lg">
          <MessageSquare className="h-5 w-5 text-amber-500" />
        </div>
        <h1 className="text-xl font-bold">酒馆布告栏</h1>
      </div>
    </div>
    <div className="flex items-center gap-2">
      {user && (
        <Button
          className="bg-amber-600 hover:bg-amber-500"
          onClick={() => setShowCreateModal(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          发布新帖
        </Button>
      )}
    </div>
  </div>
</header>
```

---

### 步骤 3.2：更新搜索框

**文件**：`src/app/board/page.tsx`

**当前代码**（约第 353-400 行）：
```tsx
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
    ...
  </div>
</div>
```

**替换为**：
```tsx
import { Input } from "@/components/ui/input"

<div className="relative mb-6">
  <div className="relative">
    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
    <Input
      type="text"
      placeholder="搜索帖子、作者或内容..."
      value={searchQuery}
      onChange={(e) => handleSearch(e.target.value)}
      className="pl-10 pr-10 h-12"
    />
    {searchQuery && (
      <button
        onClick={() => setSearchQuery("")}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <X className="h-5 w-5" />
      </button>
    )}
  </div>
  
  {searchHistory.length > 0 && !searchQuery && (
    <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl p-4 z-50 shadow-xl">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-muted-foreground flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" />
          搜索历史
        </span>
        <button
          onClick={clearSearchHistory}
          className="text-xs text-muted-foreground hover:text-red-400 flex items-center gap-1 transition-colors"
        >
          <Trash className="h-3.5 w-3.5" />
          清空
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {searchHistory.map((item, i) => (
          <button
            key={i}
            onClick={() => handleSearch(item)}
            className="px-3 py-1.5 bg-muted hover:bg-muted/80 rounded-lg text-sm text-foreground transition-colors"
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  )}
</div>
```

---

### 步骤 3.3：更新帖子卡片

**文件**：`src/app/board/page.tsx`

**当前代码**（约第 436-488 行）：
```tsx
<div
  key={post.id}
  className="bg-zinc-900 border border-zinc-800 hover:border-amber-500/50 transition-colors rounded-lg overflow-hidden"
>
  <Link href={`/board/${post.id}`} className="block hover:bg-zinc-800/50 transition-colors">
    ...
  </Link>
</div>
```

**替换为**：
```tsx
<div key={post.id} className="group">
  <div className="
    bg-card 
    border border-border 
    rounded-xl 
    overflow-hidden
    hover:border-amber-500/40 
    transition-all 
    duration-200
  ">
    <Link href={`/board/${post.id}`} className="block hover:bg-muted/30 transition-colors">
      <div className="p-5">
        {/* 顶部信息 */}
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-center gap-3 flex-wrap">
            <span className={cn(
              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border",
              tagColors[post.tag]
            )}>
              <Tag className="h-3.5 w-3.5" />
              {post.tag}
            </span>
            {post.tag === "DM悬赏" && post.rewards && (
              <div className="flex items-center gap-1.5 text-xs">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-900/30 text-amber-300 rounded border border-amber-800/30">
                  金币 {post.rewards.gold}
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-900/30 text-purple-300 rounded border border-purple-800/30">
                  荣誉 {post.rewards.honor}
                </span>
              </div>
            )}
          </div>
          
          {isPostOwner(post) && (
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.preventDefault(); openEditModal(post); }}>
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-300" onClick={(e) => { e.preventDefault(); handleDeletePost(post.id); }}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
        
        {/* 标题 */}
        <h3 className="text-lg font-bold mb-2 text-foreground group-hover:text-amber-400 transition-colors">
          {searchQuery ? highlightText(post.title, searchQuery) : post.title}
        </h3>
        
        {/* 底部信息 */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-xs font-bold text-white">
                {authorName.charAt(0)}
              </div>
              <span>{searchQuery ? highlightText(authorName, searchQuery) : authorName}</span>
            </div>
            {post.character && <span className="text-muted-foreground/60">· {post.character.name}</span>}
          </div>
          <span>{new Date(post.createdAt).toLocaleString("zh-CN")}</span>
        </div>
      </div>
    </Link>
  </div>
</div>
```

---

## 第四阶段：文档页面改造

### 步骤 4.1：更新文档侧边栏

**文件**：`src/app/docs/layout.tsx`

**当前代码**（约第 213-260 行）：
```tsx
<div className="w-16 bg-zinc-900 border-r border-zinc-800 flex flex-col items-center py-4 gap-4 relative z-10">
  ...
</div>

<div className="w-64 bg-zinc-900/95 border-r border-zinc-800 flex flex-col relative z-10">
  ...
</div>
```

**替换为**：
```tsx
{/* 左侧图标栏 */}
<div className="w-16 bg-card border-r border-border flex flex-col items-center py-4 gap-4 relative z-10">
  <Link href="/" className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground">
    <ArrowLeft className="h-6 w-6" />
  </Link>
  <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-700 rounded-xl flex items-center justify-center">
    <BookOpen className="h-6 w-6 text-white" />
  </div>
</div>

{/* 文档列表侧边栏 */}
<div className="w-64 bg-card/95 border-r border-border flex flex-col relative z-10">
  <div className="p-4 border-b border-border">
    <h2 className="font-bold text-lg">公会档案馆</h2>
    <p className="text-xs text-muted-foreground mt-1">{documents.length} 篇文档</p>
  </div>
  
  <div className="flex-1 overflow-y-auto py-2">
    {isMounted && sortedDocuments.map((doc) => (
      <button
        key={doc.id}
        onClick={() => setSelectedDoc(doc)}
        className={cn(
          "w-full px-3 py-2.5 text-left text-sm flex items-center gap-2 transition-all duration-200",
          selectedDoc?.id === doc.id
            ? "bg-muted text-foreground"
            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
          doc.isPinned && "border-l-2 border-amber-500 pl-2"
        )}
      >
        {doc.isPinned ? (
          <Pin className="h-4 w-4 text-amber-500 flex-shrink-0" />
        ) : (
          <FileText className="h-4 w-4 flex-shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <p className="truncate font-medium">{doc.title}</p>
          {doc.category && (
            <p className="text-xs text-muted-foreground/60 truncate">{doc.category}</p>
          )}
        </div>
      </button>
    ))}
  </div>
  
  {user && (
    <div className="p-4 border-t border-border">
      <Button
        className="w-full bg-amber-600 hover:bg-amber-500"
        onClick={() => setShowCreateModal(true)}
      >
        <Plus className="h-4 w-4 mr-2" />
        新建文档
      </Button>
    </div>
  )}
</div>
```

---

### 步骤 4.2：更新文档创建/编辑模态框

**文件**：`src/app/docs/layout.tsx`

**当前代码**（约第 134-211 行）：
```tsx
{(showCreateModal || editingDoc) && (
  <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={...}>
    <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto" onClick={...}>
      ...
    </div>
  </div>
)}
```

**替换为**：
```tsx
import { Modal } from "@/components/ui/modal"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

<Modal
  open={showCreateModal || !!editingDoc}
  onClose={() => {
    setShowCreateModal(false)
    setEditingDoc(null)
    setNewDoc({ title: "", content: "", category: "规则" })
  }}
  title={editingDoc ? "编辑文档" : "创建新文档"}
  maxWidth="2xl"
>
  <div className="space-y-4">
    <div>
      <label className="block text-sm font-medium text-muted-foreground mb-2">标题</label>
      <Input
        placeholder="文档标题"
        value={newDoc.title}
        onChange={(e) => setNewDoc({ ...newDoc, title: e.target.value })}
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-muted-foreground mb-2">分类</label>
      <Input
        placeholder="分类名称"
        value={newDoc.category}
        onChange={(e) => setNewDoc({ ...newDoc, category: e.target.value })}
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-muted-foreground mb-2">
        内容 <span className="text-muted-foreground/60">(支持 Markdown)</span>
      </label>
      <Textarea
        placeholder="# 标题&#10;&#10;文档内容..."
        value={newDoc.content}
        onChange={(e) => setNewDoc({ ...newDoc, content: e.target.value })}
        className="min-h-[300px] font-mono text-sm"
      />
    </div>
    <div className="flex gap-3 pt-2">
      <Button
        variant="ghost"
        onClick={() => {
          setShowCreateModal(false)
          setEditingDoc(null)
        }}
      >
        取消
      </Button>
      <Button
        className="flex-1 bg-amber-600 hover:bg-amber-500"
        onClick={editingDoc ? handleEditDoc : handleCreateDoc}
      >
        {editingDoc ? "保存" : "创建"}
      </Button>
    </div>
  </div>
</Modal>
```

---

## 第五阶段：其他页面改造

### 步骤 5.1：角色管理页面

**文件**：`src/app/characters/page.tsx`

**主要改动点**：
1. 替换 `bg-zinc-*` 为设计令牌
2. 替换 `border-zinc-*` 为设计令牌
3. 替换 `text-zinc-*` 为设计令牌
4. 添加焦点状态
5. 使用 Modal 组件替换原生模态框
6. 使用 Input/Textarea 组件

**批量替换规则**：
```
bg-zinc-950  → bg-background
bg-zinc-900  → bg-card
bg-zinc-800  → bg-muted
border-zinc-800 → border-border
border-zinc-700 → border-input
text-zinc-100 → text-foreground
text-zinc-400 → text-muted-foreground
text-zinc-500 → text-muted-foreground
```

---

### 步骤 5.2：组队页面

**文件**：`src/app/party/page.tsx`

**主要改动点**：同上，遵循相同的替换规则。

---

### 步骤 5.3：个人中心页面

**文件**：`src/app/profile/page.tsx`

**主要改动点**：同上，遵循相同的替换规则。

---

### 步骤 5.4：地图页面

**文件**：`src/app/map/page.tsx`

**主要改动点**：
1. 替换颜色类名
2. 优化地图节点的交互状态
3. 添加加载状态

---

### 步骤 5.5：资源管理页面

**文件**：`src/app/resources/page.tsx`

**主要改动点**：同上，遵循相同的替换规则。

---

## 第六阶段：完善与测试

### 步骤 6.1：添加加载状态

**为所有需要数据加载的页面添加骨架屏**：

```tsx
import { Skeleton } from "@/components/ui/skeleton"

// 在加载状态时显示
{isLoading && (
  <div className="space-y-4">
    {[1, 2, 3].map((i) => (
      <div key={i} className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Skeleton className="w-10 h-10 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      </div>
    ))}
  </div>
)}
```

---

### 步骤 6.2：优化空状态

**统一空状态设计**：

```tsx
<div className="text-center py-16">
  <div className="w-20 h-20 mx-auto mb-6 bg-muted rounded-2xl flex items-center justify-center">
    <Icon className="h-10 w-10 text-muted-foreground" />
  </div>
  <h3 className="text-lg font-semibold text-foreground mb-2">暂无内容</h3>
  <p className="text-muted-foreground mb-6 max-w-xs mx-auto">
    描述文字
  </p>
  <Button className="bg-amber-600 hover:bg-amber-500">
    <Plus className="h-4 w-4 mr-2" />
    操作按钮
  </Button>
</div>
```

---

### 步骤 6.3：测试清单

**功能测试**：
- [ ] 登录/注册功能正常
- [ ] 所有页面导航正常
- [ ] 表单提交功能正常
- [ ] 数据加载和显示正常
- [ ] 模态框打开/关闭正常

**视觉测试**：
- [ ] 颜色对比度符合 WCAG AA
- [ ] 焦点状态清晰可见
- [ ] 响应式布局正常
- [ ] 动画过渡流畅

**可访问性测试**：
- [ ] 键盘导航完整
- [ ] 屏幕阅读器兼容
- [ ] 表单标签关联正确
- [ ] 图片 alt 文本完整

---

## 附录：快速参考

### 设计令牌映射表

| 原值 | 新值 | 用途 |
|------|------|------|
| `bg-zinc-950` | `bg-background` | 页面背景 |
| `bg-zinc-900` | `bg-card` | 卡片背景 |
| `bg-zinc-800` | `bg-muted` | 次要背景 |
| `border-zinc-800` | `border-border` | 边框 |
| `border-zinc-700` | `border-input` | 输入框边框 |
| `text-zinc-100` | `text-foreground` | 主要文本 |
| `text-zinc-400` | `text-muted-foreground` | 次要文本 |
| `text-zinc-500` | `text-muted-foreground` | 辅助文本 |

### 焦点状态样式

```tsx
className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
```

### 按钮变体

```tsx
// 主要按钮
<Button className="bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-900/25">

// 次要按钮
<Button variant="secondary">

// 幽灵按钮
<Button variant="ghost">

// 危险按钮
<Button className="bg-red-900/80 hover:bg-red-900 text-red-100 border border-red-800">
```

---

*文档版本：1.0*  
*创建时间：2026-02-26*

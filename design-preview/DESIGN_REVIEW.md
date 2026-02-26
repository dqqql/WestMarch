# 不冻港的西征世界 - UI 设计审查报告

## 综述

本项目是一个 D&D 战役管理门户网站，采用了深色主题设计风格，使用了 amber（琥珀色）作为主要品牌色。整体设计思路清晰，但在多个方面有改进空间。

### 项目优点

✅ **主题一致性**：整体采用深色主题，风格统一
✅ **品牌色明确**：使用 amber（琥珀色）作为品牌色，符合 D&D 奇幻主题
✅ **响应式布局**：页面基本支持响应式设计
✅ **背景氛围**：使用背景图片增加沉浸感
✅ **组件基础**：基于 shadcn/ui 组件库，有良好的基础

---

## 🔴 阻断性问题 (Blockers)

无严重阻断性问题。

---

## 🟡 高优先级问题 (High Priority)

### 1. 设计系统未充分利用

**问题**：虽然配置了 shadcn/ui 的设计系统，但很多页面直接使用硬编码的颜色类名（如 `bg-zinc-900`），而不是使用设计令牌。

**影响**：
- 难以维护和统一修改
- 主题切换困难
- 不一致的视觉体验

**建议**：
```css
/* 使用设计令牌 */
.bg-card 而非 bg-zinc-900
.text-foreground 而非 text-zinc-100
.border-border 而非 border-zinc-800
```

### 2. 焦点状态缺失

**问题**：大部分交互元素缺少明显的焦点样式，仅依赖浏览器默认轮廓。

**位置**：
- 首页卡片 (`src/app/page.tsx:143`)
- 侧边栏文档列表 (`src/app/docs/layout.tsx:228`)
- 所有按钮和输入框

**影响**：键盘用户无法清楚知道当前焦点位置，违反 WCAG 2.1 AA 标准。

**建议**：
```tsx
// 为按钮添加明显的焦点样式
className="focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
```

### 3. 表单元素样式不统一

**问题**：自定义的表单元素（登录模态框、创建文档模态框）没有使用 shadcn/ui 的 Input 组件，样式不统一。

**位置**：
- `src/app/page.tsx:72-78` - 登录输入框
- `src/app/docs/layout.tsx:164-170` - 文档创建输入框

**建议**：统一使用 shadcn/ui 的 Input 组件，保持一致性。

### 4. 色彩对比度需要验证

**问题**：部分文本颜色可能对比度不足。

**需要检查的组合**：
- `text-zinc-400` 在 `bg-zinc-900` 上
- `text-zinc-500` 在 `bg-zinc-950` 上

**建议**：使用 [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/) 验证所有文本组合，确保符合 WCAG AA 标准（4.5:1）。

---

## 🟢 中等优先级改进 (Medium Priority)

### 5. 视觉层次可以增强

**问题**：首页的卡片标题和描述之间层次不够明显。

**当前**：
```tsx
<CardTitle className="text-lg">公会档案馆</CardTitle>
<CardDescription className="text-sm">冒险规则与指南...</CardDescription>
```

**建议**：
```tsx
<CardTitle className="text-xl font-bold">公会档案馆</CardTitle>
<CardDescription className="text-sm mt-2 opacity-80">冒险规则与指南...</CardDescription>
```

### 6. 间距不一致

**问题**：页面中存在多处不一致的间距值。

**例子**：
- `px-4 py-4` vs `p-6`
- `gap-4` vs `gap-6` vs `gap-8`

**建议**：建立统一的间距尺度，如：
- 小间距：2, 4, 8 (px)
- 中间距：12, 16, 24 (px)
- 大间距：32, 48, 64 (px)

### 7. 加载状态体验可以改善

**问题**：
- 首页没有骨架屏或加载指示器
- 布告栏只有简单的 "加载中..." 文本

**建议**：
- 添加骨架屏组件
- 使用旋转的加载动画
- 为加载状态添加视觉反馈

### 8. 空状态设计

**问题**：空状态设计过于简单。

**位置**：
- `src/app/docs/layout.tsx:398-403` - 文档空状态
- `src/app/board/page.tsx:424-430` - 帖子空状态

**建议**：
```tsx
<CardContent className="py-16 text-center">
  <div className="w-20 h-20 mx-auto mb-6 bg-zinc-800 rounded-full flex items-center justify-center">
    <FileText className="h-10 w-10 text-zinc-500" />
  </div>
  <h3 className="text-lg font-semibold text-zinc-300 mb-2">还没有文档</h3>
  <p className="text-zinc-500 mb-6">点击下方按钮创建你的第一篇文档</p>
  <Button className="bg-amber-600 hover:bg-amber-700">
    <Plus className="h-4 w-4 mr-2" />
    新建文档
  </Button>
</CardContent>
```

### 9. 动效可以更精致

**问题**：当前只有简单的 hover 效果，缺少过渡动画。

**建议**：
- 为侧边栏添加平滑的展开/收起动画
- 为模态框添加淡入淡出和缩放动画
- 为列表项添加进入动画（staggered animation）

### 10. 图标尺寸不一致

**问题**：图标尺寸在不同页面中不统一。

**位置**：
- 首页图标：`h-12 w-12`
- 文档页侧边栏图标：`h-4 w-4`
- 布告栏标签图标：`h-3 w-3`

**建议**：建立图标尺寸规范：
- 大型图标：24-32px（页面标题、卡片装饰）
- 中型图标：16-20px（按钮、导航）
- 小型图标：12-14px（标签、辅助信息）

---

## 🟣 细节优化 (Nitpicks)

### 11. 确认对话框使用原生 alert/confirm

**问题**：删除操作使用原生 `confirm()`，体验较差。

**位置**：
- `src/app/docs/layout.tsx:339`
- `src/app/board/page.tsx:127`

**建议**：使用自定义的确认模态框组件。

### 12. 魔法数字

**问题**：代码中存在硬编码的数值。

**例子**：
- `opacity-45` (`src/app/page.tsx:54`)
- `opacity-30` (`src/app/docs/layout.tsx:129`)
- `h-64` (`src/app/docs/layout.tsx:185`)

**建议**：将这些值提取为常量或使用设计令牌。

### 13. 滚动条样式

**问题**：使用浏览器默认滚动条，与整体设计风格不匹配。

**建议**：添加自定义滚动条样式：

```css
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: hsl(var(--muted));
}

::-webkit-scrollbar-thumb {
  background: hsl(var(--border));
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: hsl(var(--ring));
}
```

### 14. 输入框占位符颜色

**问题**：占位符文本颜色可能不够明显。

**建议**：统一设置 `placeholder-zinc-500` 或使用设计令牌。

### 15. 按钮文本大小写

**问题**：按钮文本混合使用中文，没有统一的大小写规则（中文不适用）。

**建议**：对于英文文本，保持 sentence case（首字母大写）。

---

## 🎨 设计改进建议

### 建议 1：建立完整的设计系统

在 `src/config/` 下创建 `design-system.ts`：

```typescript
export const designSystem = {
  colors: {
    brand: {
      primary: 'amber',
      50: '#fffbeb',
      100: '#fef3c7',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
    }
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
  },
}
```

### 建议 2：优化首页卡片设计

当前卡片比较扁平，建议增加层次感：

```tsx
<Card className="
  bg-zinc-900/90 
  border-zinc-800 
  hover:border-amber-500/50 
  hover:shadow-amber-900/20 
  hover:shadow-lg
  transition-all 
  duration-300 
  hover:scale-[1.02] 
  hover:-translate-y-1
  cursor-pointer
  group
">
  <CardHeader className="p-6">
    <div className="flex items-start justify-between">
      <div className="space-y-2">
        <CardTitle className="text-lg font-bold group-hover:text-amber-400 transition-colors">
          公会档案馆
        </CardTitle>
        <CardDescription className="text-sm">
          冒险规则与指南，房规，战报等各种文档的集中处
        </CardDescription>
      </div>
      <div className="p-3 bg-amber-500/10 rounded-xl group-hover:bg-amber-500/20 transition-colors">
        <BookOpen className="h-8 w-8 text-amber-500 flex-shrink-0" />
      </div>
    </div>
  </CardHeader>
</Card>
```

### 建议 3：改进文档侧边栏

为文档列表添加分组和更好的视觉层次：

```tsx
<div className="p-4 border-b border-zinc-800">
  <h2 className="font-bold text-lg mb-2">公会档案馆</h2>
  <div className="text-xs text-zinc-500">{documents.length} 篇文档</div>
</div>

<div className="flex-1 overflow-y-auto py-2">
  {/* 置顶文档分组 */}
  {pinnedDocs.length > 0 && (
    <div className="mb-4">
      <div className="px-3 py-1 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
        置顶
      </div>
      {pinnedDocs.map((doc) => (
        <DocumentItem key={doc.id} doc={doc} />
      ))}
    </div>
  )}
  
  {/* 常规文档分组 */}
  <div>
    <div className="px-3 py-1 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
      全部文档
    </div>
    {normalDocs.map((doc) => (
      <DocumentItem key={doc.id} doc={doc} />
    ))}
  </div>
</div>
```

### 建议 4：优化布告栏帖子卡片

增加更多视觉信息和更好的布局：

```tsx
<div className="bg-zinc-900 border border-zinc-800 hover:border-amber-500/50 transition-all duration-200 rounded-xl overflow-hidden group">
  <Link href={`/board/${post.id}`} className="block hover:bg-zinc-800/30 transition-colors">
    <div className="p-5">
      {/* 顶部信息栏 */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-3 flex-wrap">
          <span className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${tagColors[post.tag]}`}>
            <Tag className="h-3.5 w-3.5 inline mr-1.5" />
            {post.tag}
          </span>
          {post.rewards && (
            <div className="flex items-center gap-1.5 text-xs">
              <div className="flex items-center gap-1 px-2 py-0.5 bg-amber-900/30 text-amber-300 rounded">
                <Coins className="h-3 w-3" />
                {post.rewards.gold}
              </div>
              <div className="flex items-center gap-1 px-2 py-0.5 bg-purple-900/30 text-purple-300 rounded">
                <Trophy className="h-3 w-3" />
                {post.rewards.honor}
              </div>
            </div>
          )}
        </div>
        {/* 操作按钮 */}
        {isPostOwner(post) && (
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
      
      {/* 标题 */}
      <h3 className="text-lg font-bold mb-2 text-zinc-100 group-hover:text-amber-400 transition-colors">
        {post.title}
      </h3>
      
      {/* 摘要 */}
      <p className="text-zinc-400 text-sm mb-4 line-clamp-2">
        {post.content.substring(0, 150)}...
      </p>
      
      {/* 底部元信息 */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-xs font-bold">
              {authorName.charAt(0)}
            </div>
            <span className="text-zinc-300">{authorName}</span>
          </div>
          {post.character && (
            <span className="text-zinc-500">· {post.character.name}</span>
          )}
        </div>
        <span className="text-zinc-500">
          {formatRelativeTime(post.createdAt)}
        </span>
      </div>
    </div>
  </Link>
</div>
```

### 建议 5：添加 Micro-interactions

为交互添加细腻的反馈：

```tsx
// 按钮点击效果
<button className="
  transform 
  active:scale-[0.97] 
  transition-transform 
  duration-150
">
  点击我
</button>

// 输入框聚焦效果
<input className="
  transition-all 
  duration-200
  focus:ring-2 
  focus:ring-amber-500/50 
  focus:border-amber-500
" />

// 列表项悬停效果
<div className="
  hover:bg-zinc-800/50 
  hover:pl-5 
  transition-all 
  duration-200
">
  列表项
</div>
```

---

## 📱 响应式设计检查清单

- [ ] 移动端（< 640px）测试
- [ ] 平板端（640px - 1024px）测试
- [ ] 桌面端（> 1024px）测试
- [ ] 触摸目标最小 44px
- [ ] 避免水平滚动
- [ ] 图片响应式加载

---

## ♿ 可访问性检查清单

- [ ] 所有图片有 alt 文本
- [ ] 表单元素有关联的 label
- [ ] 键盘可访问所有交互元素
- [ ] 焦点状态清晰可见
- [ ] 颜色对比度符合 WCAG AA
- [ ] 语义化 HTML 结构
- [ ] 标题层级正确（h1 → h2 → h3）
- [ ] 支持 `prefers-reduced-motion`

---

## 🎯 下一步行动计划

### 第一阶段（核心修复）
1. 统一使用设计系统令牌
2. 添加焦点状态样式
3. 验证色彩对比度
4. 统一表单元素

### 第二阶段（体验优化）
5. 改进视觉层次
6. 统一间距规范
7. 添加加载状态
8. 优化空状态设计

### 第三阶段（精致打磨）
9. 添加微交互动画
10. 完善可访问性
11. 优化响应式设计
12. 添加自定义滚动条

---

## 📚 参考资源

- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [WCAG 2.1 Guidelines](https://www.w3.org/TR/WCAG21/)
- [Material Design 3](https://m3.material.io)
- [Refactoring UI](https://www.refactoringui.com)

---

*报告生成时间：2026-02-26*  
*审查工具：frontend-design-review skill*

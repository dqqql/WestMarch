# WestMarch 全栈开发学习指南

> 这是一个基于 Next.js 的全栈 D&D（龙与地下城）跑团管理平台，适合新手学习现代全栈开发技术。

## 📊 项目技术栈

### 前端技术
- **Next.js 16** - React 全栈框架，支持服务端渲染和 API 路由
- **React 19** - 用户界面库
- **TypeScript** - JavaScript 的超集，提供类型安全
- **Tailwind CSS** - 实用优先的 CSS 框架
- **Radix UI** - 无样式的可访问组件库
- **React Flow** - 用于地图可视化的流程图库
- **Lucide React** - 图标库

### 后端技术
- **Next.js API Routes** - 基于文件系统的 API 端点
- **Prisma** - 现代化的 TypeScript ORM
- **SQLite** - 轻量级关系型数据库

### 核心功能模块
- ✅ 用户认证系统（登录/注册）
- ✅ 角色管理（创建、编辑角色卡）
- ✅ 地图系统（蜂巢格坐标、节点管理）
- ✅ 聊天系统（多频道、回复、撤回）
- ✅ 布告栏（帖子发布、评论）
- ✅ 组队系统（创建队伍、加入队伍）
- ✅ 物品交易（发布物品、标记售出）
- ✅ 文档管理（规则、指南）
- ✅ 天气系统（动态天气显示）

---

## 🎯 学习路线（由浅入深）

### 阶段 1：基础环境与前端入门（1-2周）

#### 1.1 环境搭建

```bash
# 安装依赖
npm install

# 初始化数据库
npm run db:generate
npm run db:push

# 启动开发服务器
npm run dev
```

访问 http://localhost:3000 查看效果

#### 1.2 学习 React 基础

**推荐阅读文件：**
- `src/app/page.tsx` - 首页组件，包含登录模态框、导航卡片

**核心概念：**
- 组件（Component）：可复用的 UI 单元
- 状态（State）：`useState` 管理组件内部数据
- 副作用（Effect）：`useEffect` 处理数据获取、订阅等
- JSX 语法：在 JavaScript 中编写类似 HTML 的代码

**实践任务：**
- [ ] 修改首页标题文字
- [ ] 更改导航卡片的颜色
- [ ] 添加一个新的状态变量

#### 1.3 学习 Tailwind CSS

**推荐阅读文件：**
- `src/app/page.tsx` - 观察样式类名的使用
- `tailwind.config.ts` - Tailwind 配置文件

**核心概念：**
- 实用类（Utility Classes）：`bg-zinc-950`、`text-zinc-100`
- 响应式设计：`md:grid-cols-2`、`lg:px-8`
- 伪类：`hover:scale-[1.02]`、`group-hover:opacity-100`
- 自定义颜色：`from-amber-500 to-amber-600`

**实践任务：**
- [ ] 修改首页背景颜色
- [ ] 调整卡片的圆角大小
- [ ] 添加悬停动画效果

---

### 阶段 2：Next.js 核心概念（2-3周）

#### 2.1 文件路由系统

**目录结构：**
```
src/app/
├── page.tsx              # 首页 (/)
├── layout.tsx            # 根布局
├── docs/
│   └── page.tsx          # 文档页面 (/docs)
├── board/
│   └── page.tsx          # 布告栏 (/board)
├── map/
│   └── page.tsx          # 地图 (/map)
├── chat/
│   └── page.tsx          # 聊天 (/chat)
└── api/
    ├── auth/
    │   └── login/
    │       └── route.ts  # POST /api/auth/login
    └── posts/
        └── route.ts      # GET/POST /api/posts
```

**核心概念：**
- `page.tsx` - 定义页面组件
- `layout.tsx` - 定义布局（包裹子页面）
- `route.ts` - 定义 API 端点
- `[id]` - 动态路由参数

**实践任务：**
- [ ] 创建一个新页面 `/about`
- [ ] 理解动态路由 `/posts/[id]` 的工作原理

#### 2.2 客户端 vs 服务端组件

**客户端组件（Client Component）：**
- 文件顶部有 `"use client"` 指令
- 可以使用 React Hooks（useState、useEffect）
- 可以处理用户交互（onClick、onChange）
- 示例：`src/app/page.tsx`

**服务端组件（Server Component）：**
- 默认情况下所有组件都是服务端组件
- 可以直接访问数据库
- 不能使用 React Hooks
- 性能更好，SEO 友好

**实践任务：**
- [ ] 识别项目中哪些组件是客户端组件
- [ ] 理解为什么首页需要是客户端组件

#### 2.3 学习关键页面

**简单页面（推荐先学）：**
1. `src/app/docs/page.tsx` - 文档列表页面
   - 数据获取
   - 列表渲染
   - 分类筛选

**中等难度：**
2. `src/app/board/page.tsx` - 布告栏
   - 表单提交
   - 标签筛选
   - 分页加载

**复杂页面（后期学习）：**
3. `src/app/map/page.tsx` - 地图系统
   - React Flow 集成
   - 复杂状态管理
   - 拖拽交互

4. `src/app/chat/page.tsx` - 聊天系统
   - 实时消息
   - 多频道切换
   - 回复功能

---

### 阶段 3：后端与数据库（3-4周）

#### 3.1 Prisma ORM

**推荐阅读文件：**
- `prisma/schema.prisma` - 数据库模型定义

**核心数据模型：**
```prisma
User (用户)
├── characters (角色)
├── posts (帖子)
├── chatMessages (聊天消息)
└── parties (队伍)

Character (角色)
├── user (所属用户)
├── posts (发布的帖子)
└── parties (加入的队伍)

Post (帖子)
├── author (作者)
├── character (关联角色)
├── comments (评论)
└── node (关联地图节点)
```

**常用 Prisma 操作：**
```typescript
// 查询所有用户
const users = await prisma.user.findMany();

// 查询单个用户（包含关联数据）
const user = await prisma.user.findUnique({
  where: { id: userId },
  include: { characters: true }
});

// 创建新用户
const newUser = await prisma.user.create({
  data: {
    username: "player1",
    password: "hashed_password"
  }
});

// 更新用户
await prisma.user.update({
  where: { id: userId },
  data: { nickname: "新昵称" }
});

// 删除用户
await prisma.user.delete({
  where: { id: userId }
});
```

**实践任务：**
- [ ] 阅读 schema.prisma，理解各个模型的关系
- [ ] 运行 `npm run db:generate` 生成 Prisma Client
- [ ] 使用 Prisma Studio 查看数据：`npx prisma studio`

#### 3.2 API Routes

**推荐学习顺序：**

1. **简单的 GET 请求** - `src/app/api/documents/route.ts`
```typescript
export async function GET() {
  const documents = await prisma.document.findMany();
  return Response.json(documents);
}
```

2. **带参数的 POST 请求** - `src/app/api/auth/login/route.ts`
```typescript
export async function POST(request: Request) {
  const { username, password } = await request.json();
  // 验证逻辑...
  return Response.json({ success: true });
}
```

3. **动态路由参数** - `src/app/api/posts/[id]/route.ts`
```typescript
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const post = await prisma.post.findUnique({
    where: { id: params.id }
  });
  return Response.json(post);
}
```

**实践任务：**
- [ ] 创建一个简单的 API：`/api/hello`
- [ ] 使用 Postman 或浏览器测试 API
- [ ] 理解 HTTP 状态码（200、400、404、500）

#### 3.3 数据流向

```
┌─────────────┐      ┌──────────────┐      ┌─────────┐      ┌─────────┐
│  前端组件    │ ───> │  fetch API   │ ───> │ API Route│ ───> │ Prisma  │
│ (page.tsx)  │      │              │      │(route.ts)│      │         │
└─────────────┘      └──────────────┘      └─────────┘      └─────────┘
                                                                   │
                                                                   ▼
                                                              ┌─────────┐
                                                              │ SQLite  │
                                                              │   DB    │
                                                              └─────────┘
```

**示例：获取帖子列表**

1. 前端发起请求：
```typescript
const response = await fetch('/api/posts');
const posts = await response.json();
```

2. API 处理请求：
```typescript
export async function GET() {
  const posts = await prisma.post.findMany({
    include: { author: true, character: true }
  });
  return Response.json(posts);
}
```

---

### 阶段 4：状态管理与上下文（2周）

#### 4.1 React Context

**推荐阅读文件：**
- `src/contexts/AuthContext.tsx` - 认证上下文

**核心概念：**
- Context 用于跨组件共享数据（避免 props 层层传递）
- Provider 提供数据
- useContext Hook 消费数据

**AuthContext 的作用：**
- 管理用户登录状态
- 提供登录/登出方法
- 在整个应用中共享用户信息

**使用示例：**
```typescript
// 在组件中使用
const { user, login, logout } = useAuth();

if (user) {
  console.log('当前用户:', user.username);
}
```

**实践任务：**
- [ ] 理解 AuthContext 的实现
- [ ] 尝试创建一个新的 Context（如 ThemeContext）

#### 4.2 表单处理

**推荐学习示例：**

1. **登录表单** - `src/app/page.tsx`
   - 受控组件（value + onChange）
   - 表单验证
   - 错误处理
   - 加载状态

2. **创建角色表单** - `src/app/profile/page.tsx`
   - 多字段表单
   - 图片上传
   - 数据提交

**实践任务：**
- [ ] 为登录表单添加"记住我"功能
- [ ] 添加表单验证（用户名长度、密码强度）

---

### 阶段 5：高级功能（3-4周）

#### 5.1 实时聊天系统

**推荐阅读文件：**
- `src/app/chat/page.tsx` - 聊天页面
- `src/app/api/chat/[nodeId]/messages/route.ts` - 消息 API

**核心功能：**
- 多频道切换（日常RP、玩家交易、寻找队友）
- 消息发送与接收
- 回复功能
- 消息撤回（5分钟内）
- 自动滚动到底部

**技术要点：**
- 使用 `setInterval` 轮询新消息
- 使用 `useRef` 控制滚动
- 使用 `react-markdown` 渲染 Markdown

**实践任务：**
- [ ] 理解消息轮询机制
- [ ] 添加消息搜索功能
- [ ] 实现消息编辑功能

#### 5.2 地图可视化

**推荐阅读文件：**
- `src/app/map/page.tsx` - 地图页面
- `src/app/api/map/nodes/route.ts` - 节点 API

**核心功能：**
- 蜂巢格坐标系统（Hexagonal Grid）
- 节点拖拽
- 节点连线
- 节点详情面板
- 多位面切换

**技术要点：**
- React Flow 库的使用
- 自定义节点样式
- 坐标转换（蜂巢格 ↔ 像素）

**实践任务：**
- [ ] 理解蜂巢格坐标系统
- [ ] 添加节点搜索功能
- [ ] 实现地图缩放限制

#### 5.3 组件复用

**推荐阅读目录：**
- `src/components/ui/` - 通用 UI 组件

**常用组件：**
- `Button` - 按钮
- `Card` - 卡片
- `Input` - 输入框
- `Dialog` - 对话框

**设计模式：**
- 组件组合（Composition）
- Props 传递
- 样式变体（Variants）

**实践任务：**
- [ ] 创建一个自定义组件（如 Badge）
- [ ] 理解 Radix UI 的无样式组件理念

---

### 阶段 6：部署与优化（1-2周）

#### 6.1 性能优化

**图片优化：**
- 使用 WebP 格式
- 懒加载（loading="lazy"）
- 响应式图片

**代码优化：**
- 动态导入（Dynamic Import）
- 代码分割（Code Splitting）
- 减少包体积

**数据库优化：**
- 添加索引（@@index）
- 优化查询（select 特定字段）
- 使用分页

**实践任务：**
- [ ] 使用 Lighthouse 分析性能
- [ ] 优化首页加载速度
- [ ] 添加加载骨架屏

#### 6.2 部署

**使用 Docker：**
```bash
# 构建镜像
docker build -t westmarch .

# 运行容器
docker-compose up -d
```

**部署到 Vercel：**
1. 推送代码到 GitHub
2. 在 Vercel 导入项目
3. 配置环境变量
4. 自动部署

**实践任务：**
- [ ] 本地运行 Docker 容器
- [ ] 部署到 Vercel 或其他平台

---

## 🔍 推荐学习顺序（具体文件）

### 第 1 周：前端基础
1. ✅ `src/app/page.tsx` - 首页，理解 React 基础
2. ✅ `src/app/layout.tsx` - 根布局，理解 Next.js 布局
3. ✅ `src/components/ui/button.tsx` - 按钮组件，理解组件封装
4. ✅ `tailwind.config.ts` - Tailwind 配置

### 第 2 周：简单页面
5. ✅ `src/app/docs/page.tsx` - 文档列表页面
6. ✅ `src/app/api/documents/route.ts` - 文档 API
7. ✅ `src/contexts/AuthContext.tsx` - 认证上下文

### 第 3 周：数据库与 API
8. ✅ `prisma/schema.prisma` - 数据模型
9. ✅ `src/app/api/auth/login/route.ts` - 登录 API
10. ✅ `src/app/api/posts/route.ts` - 帖子 API

### 第 4 周：中等复杂度页面
11. ✅ `src/app/board/page.tsx` - 布告栏页面
12. ✅ `src/app/profile/page.tsx` - 个人中心

### 第 5-6 周：复杂功能
13. ✅ `src/app/map/page.tsx` - 地图系统
14. ✅ `src/app/chat/page.tsx` - 聊天系统

### 第 7-8 周：深入理解
15. ✅ 阅读所有 API Routes，理解后端逻辑
16. ✅ 优化性能，添加新功能

---

## 💡 学习建议

### 学习方法
- **边学边改**：不要只看代码，尝试修改样式、添加小功能
- **阅读文档**：遇到不懂的概念，查阅官方文档
  - [Next.js 文档](https://nextjs.org/docs)
  - [React 文档](https://react.dev)
  - [Prisma 文档](https://www.prisma.io/docs)
  - [Tailwind CSS 文档](https://tailwindcss.com/docs)
- **使用调试工具**：
  - Chrome DevTools（查看网络请求、控制台）
  - React DevTools（查看组件树、状态）
  - Prisma Studio（查看数据库）
- **提问实践**：遇到问题先尝试解决，再查资料或提问

### 常见问题

**Q: 如何查看数据库内容？**
```bash
npx prisma studio
```

**Q: 如何重置数据库？**
```bash
rm prisma/dev.db
npm run db:push
```

**Q: 如何添加新的数据模型？**
1. 编辑 `prisma/schema.prisma`
2. 运行 `npm run db:generate`
3. 运行 `npm run db:push`

**Q: 如何调试 API？**
- 在 API Route 中使用 `console.log()`
- 查看终端输出（运行 `npm run dev` 的窗口）

### 实践项目建议

在学习过程中，可以尝试添加以下功能：

1. **简单功能**
   - [ ] 添加用户头像上传
   - [ ] 添加帖子点赞功能
   - [ ] 添加搜索功能

2. **中等功能**
   - [ ] 添加私信系统
   - [ ] 添加通知系统
   - [ ] 添加用户权限管理

3. **复杂功能**
   - [ ] 添加实时通知（WebSocket）
   - [ ] 添加数据导出功能
   - [ ] 添加移动端适配

---

## 📚 参考资源

### 官方文档
- [Next.js 官方文档](https://nextjs.org/docs)
- [React 官方文档](https://react.dev)
- [Prisma 官方文档](https://www.prisma.io/docs)
- [Tailwind CSS 官方文档](https://tailwindcss.com/docs)
- [TypeScript 官方文档](https://www.typescriptlang.org/docs)

### 视频教程
- [Next.js 13+ 完整教程](https://www.youtube.com/results?search_query=nextjs+tutorial)
- [Prisma 入门教程](https://www.youtube.com/results?search_query=prisma+tutorial)

### 社区资源
- [Next.js GitHub](https://github.com/vercel/next.js)
- [Prisma Discord](https://pris.ly/discord)

---

## 🎓 学习检查清单

### 基础知识
- [ ] 理解 React 组件、状态、副作用
- [ ] 掌握 JSX 语法
- [ ] 熟悉 Tailwind CSS 常用类名
- [ ] 理解 TypeScript 基础类型

### Next.js
- [ ] 理解文件路由系统
- [ ] 区分客户端组件和服务端组件
- [ ] 掌握 API Routes 的使用
- [ ] 理解布局和页面的关系

### 数据库
- [ ] 理解 Prisma Schema 语法
- [ ] 掌握 CRUD 操作
- [ ] 理解数据模型关系（一对多、多对多）
- [ ] 会使用 Prisma Studio

### 高级功能
- [ ] 理解 React Context 的使用
- [ ] 掌握表单处理和验证
- [ ] 理解异步数据获取
- [ ] 掌握错误处理

---

## 🚀 开始你的学习之旅

现在你已经有了完整的学习路线图，建议从第一阶段开始，循序渐进。记住：

> **实践是最好的老师。不要害怕犯错，每一个 bug 都是学习的机会。**

祝你学习顺利！如果有任何问题，欢迎查阅文档或寻求帮助。

---

**最后更新：** 2026-03-08
**项目版本：** 0.1.0

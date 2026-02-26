# WestMarch 项目深度耦合度分析报告

**分析日期**: 2026-02-25  
**项目版本**: WestMarch v1.0  
**分析范围**: 核心模块、API 路由、Context 层、页面组件

---

## 目录

1. [执行摘要](#1-执行摘要)
2. [耦合类型定义](#2-耦合类型定义)
3. [核心模块耦合分析](#3-核心模块耦合分析)
4. [强耦合对详细列表](#4-强耦合对详细列表)
5. [耦合度总结](#5-耦合度总结)
6. [重构建议](#6-重构建议)

---

## 1. 执行摘要

### 1.1 整体耦合度评估

| 评估维度 | 评级 | 说明 |
|---------|------|------|
| 整体架构耦合度 | **中高** | 存在多个高耦合点，主要集中在 API 层和 Context 层 |
| 可维护性 | **中等** | 模块间职责划分基本清晰，但存在职责过载问题 |
| 可扩展性 | **中等** | 新增功能时可能需要修改多个模块 |
| 测试友好性 | **较低** | 高耦合模块难以进行单元测试 |

### 1.2 关键发现

1. **AppContext.tsx 职责过载**：承担了资源管理、文档管理、设置管理、密码验证等多项职责
2. **API 路由层高度耦合**：所有 API 路由直接依赖 Prisma 客户端，无抽象层
3. **公共耦合严重**：多个模块共享全局 Context 状态
4. **印记耦合存在**：页面组件直接依赖 Context 的完整数据结构

### 1.3 耦合统计

| 耦合类型 | 数量 | 严重程度 |
|---------|------|---------|
| 公共耦合 (Common Coupling) | 8 | 高 |
| 内容耦合 (Content Coupling) | 0 | 无 |
| 控制耦合 (Control Coupling) | 3 | 中 |
| 印记耦合 (Stamp Coupling) | 5 | 中 |
| **总计** | **16** | |

---

## 2. 耦合类型定义

### 2.1 内容耦合 (Content Coupling) - 最严重
- 一个模块直接修改或依赖另一个模块的内部数据
- 一个模块不通过正常入口而转入另一个模块内部
- **本项目中未发现**

### 2.2 公共耦合 (Common Coupling) - 严重
- 多个模块共享同一个全局数据结构
- 一个模块修改全局数据会影响其他模块
- **本项目中大量存在**

### 2.3 控制耦合 (Control Coupling) - 中等
- 一个模块通过传递控制信息来控制另一个模块的逻辑
- 模块之间通过标志、开关等控制信息交互
- **本项目中存在**

### 2.4 印记耦合 (Stamp Coupling) - 中等
- 模块间传递完整的数据结构，但只使用其中一部分
- 模块依赖数据结构的具体格式
- **本项目中存在**

### 2.5 数据耦合 (Data Coupling) - 最佳
- 模块间仅通过参数传递基本数据类型
- 模块间独立性最高
- **本项目中部分存在**

---

## 3. 核心模块耦合分析

### 3.1 AppContext.tsx 分析

**文件路径**: `src/contexts/AppContext.tsx`

#### 3.1.1 职责分析

AppContext 承担了以下多项职责：

| 职责类别 | 具体功能 | 代码位置 |
|---------|---------|---------|
| 资源管理 | `resources` 状态、`addResource`、`deleteResource`、`loadResources` | 64, 88-143 |
| 文档管理 | `documents` 状态、`addDocument`、`updateDocument`、`deleteDocument`、`loadDocuments` | 67, 89-222 |
| 设置管理 | `settings` 状态、`updateSettings`、`loadSettings` | 66, 100-172 |
| 密码验证 | `verifyPassword` 函数、硬编码密码 `PASSWORD` | 52, 224-226 |
| 客户端检测 | `isClient` 状态 | 68, 70-72 |

**问题**: 单一 Context 承担过多职责，违反单一职责原则。

#### 3.1.2 耦合关系

```mermaid
graph TB
    AppContext[AppContext.tsx]
    AuthContext[AuthContext.tsx]
    API_Resources[/api/resources]
    API_Documents[/api/documents]
    API_Settings[/api/settings]
    Pages[多个页面组件]
    
    AuthContext --> AppContext
    API_Resources --> AppContext
    API_Documents --> AppContext
    API_Settings --> AppContext
    AppContext --> Pages
```

---

### 3.2 API 路由层分析

**所有 API 路由文件**: `src/app/api/**/route.ts`

#### 3.2.1 Prisma 直接依赖

所有 API 路由都直接导入并使用 Prisma 客户端：

```typescript
// 模式: 所有 API 路由都遵循此模式
import prisma from '@/lib/prisma'

export async function GET() {
  const data = await prisma.model.findMany()
  return NextResponse.json(data)
}
```

**受影响的文件**:
- `src/app/api/auth/login/route.ts`
- `src/app/api/characters/route.ts`
- `src/app/api/documents/route.ts`
- `src/app/api/posts/route.ts`
- `src/app/api/resources/route.ts`
- `src/app/api/parties/route.ts`
- `src/app/api/map/route.ts`
- `src/app/api/map/nodes/route.ts`
- `src/app/api/map/edges/route.ts`
- `src/app/api/settings/[userId]/route.ts`

**问题**: 无数据访问抽象层，难以进行单元测试和数据库替换。

#### 3.2.2 业务逻辑耦合

部分 API 路由包含业务逻辑：

**示例**: `src/app/api/documents/route.ts` 包含默认文档初始化逻辑（4-91 行）

```typescript
const defaultDocuments = [...] // 硬编码默认文档

export async function GET() {
  let documents = await prisma.document.findMany()
  if (documents.length === 0) {
    for (const doc of defaultDocuments) {
      await prisma.document.create({ data: doc })
    }
    // 重新查询
  }
  return NextResponse.json(documents)
}
```

**问题**: 数据初始化逻辑与 API 路由耦合，应移至服务层。

---

### 3.3 页面组件耦合分析

#### 3.3.1 公共耦合示例

**BoardPage** (`src/app/board/page.tsx`):
- 直接访问 `useAuth()` 获取用户信息
- 直接访问 `useApp()` 获取 `isClient` 状态
- 自行管理 `posts` 状态（未使用 AppContext 的 posts）

**CharactersPage** (`src/app/characters/page.tsx`):
- 直接访问 `useAuth()` 获取用户信息
- 直接访问 `useApp()` 获取 `resources` 状态
- 自行管理 `characters` 状态

**MapPage** (`src/app/map/page.tsx`):
- 直接访问 `useApp()` 获取 `isClient` 状态
- 自行管理 `nodes` 和 `edges` 状态

#### 3.3.2 印记耦合示例

**AppContext 提供完整数据结构**:

```typescript
// AppContext.tsx
interface AppContextType {
  resources: ResourceImage[];      // 完整数组
  settings: AppSettings;            // 完整对象
  documents: Document[];            // 完整数组
  // ... 更多状态
}
```

页面组件即使只需要部分数据，也需要获取整个 Context：

```typescript
// page.tsx - 只需要 isClient，但获取整个 AppContext
const { isClient } = useApp();

// characters/page.tsx - 只需要 resources，但获取整个 AppContext
const { resources } = useApp();
```

---

## 4. 强耦合对详细列表

### 4.1 高严重程度耦合

#### 耦合对 #1
| 项目 | 内容 |
|------|------|
| **模块 A** | `src/contexts/AppContext.tsx` |
| **模块 B** | `src/contexts/AuthContext.tsx` |
| **耦合类型** | 公共耦合 (Common Coupling) |
| **严重程度** | 🔴 高 |
| **问题描述** | AppContext 依赖 AuthContext 的 `user` 状态，两者共享用户身份信息，一个模块的变更会影响另一个 |
| **代码位置** | AppContext.tsx:63 |

```typescript
// AppContext.tsx:63
const { user } = useAuth();
```

---

#### 耦合对 #2
| 项目 | 内容 |
|------|------|
| **模块 A** | `src/app/api/**/*.ts` (所有 API 路由) |
| **模块 B** | `src/lib/prisma.ts` |
| **耦合类型** | 公共耦合 (Common Coupling) |
| **严重程度** | 🔴 高 |
| **问题描述** | 所有 API 路由直接依赖 Prisma 客户端单例，无抽象层，难以测试和替换数据库 |
| **代码位置** | 共 14 个文件受影响 |

**受影响文件列表**:
1. `src/app/api/auth/login/route.ts:2`
2. `src/app/api/characters/route.ts:2`
3. `src/app/api/characters/[id]/route.ts`
4. `src/app/api/documents/route.ts:2`
5. `src/app/api/documents/[id]/route.ts`
6. `src/app/api/posts/route.ts:2`
7. `src/app/api/posts/[id]/route.ts`
8. `src/app/api/resources/route.ts`
9. `src/app/api/resources/[id]/route.ts`
10. `src/app/api/parties/route.ts`
11. `src/app/api/parties/[id]/route.ts`
12. `src/app/api/map/route.ts:2`
13. `src/app/api/map/nodes/route.ts`
14. `src/app/api/map/edges/route.ts`
15. `src/app/api/settings/[userId]/route.ts`

---

#### 耦合对 #3
| 项目 | 内容 |
|------|------|
| **模块 A** | `src/contexts/AppContext.tsx` |
| **模块 B** | 所有页面组件 |
| **耦合类型** | 公共耦合 (Common Coupling) |
| **严重程度** | 🔴 高 |
| **问题描述** | 多个页面组件共享 AppContext 的全局状态，一个组件修改状态会影响其他所有组件 |
| **受影响页面** | page.tsx, board/page.tsx, map/page.tsx, characters/page.tsx 等 |

---

#### 耦合对 #4
| 项目 | 内容 |
|------|------|
| **模块 A** | `src/contexts/AppContext.tsx` |
| **模块 B** | `/api/resources`, `/api/documents`, `/api/settings` |
| **耦合类型** | 控制耦合 (Control Coupling) |
| **严重程度** | 🔴 高 |
| **问题描述** | AppContext 直接调用多个 API 端点，控制数据加载流程，耦合了 API 路径和调用逻辑 |
| **代码位置** | AppContext.tsx:76, 90, 103, 130, 147, 164, 176, 193, 212 |

```typescript
// 示例
const response = await fetch("/api/resources");
const response = await fetch("/api/documents");
const response = await fetch(`/api/settings/${user.id}`);
```

---

### 4.2 中严重程度耦合

#### 耦合对 #5
| 项目 | 内容 |
|------|------|
| **模块 A** | `src/contexts/AppContext.tsx` |
| **模块 B** | 自身（职责过载） |
| **耦合类型** | 印记耦合 (Stamp Coupling) + 内部耦合 |
| **严重程度** | 🟡 中 |
| **问题描述** | AppContext 包含资源、文档、设置、密码验证等多个不相关的功能，形成"上帝对象" |
| **代码位置** | AppContext.tsx:35-50 (interface 定义) |

---

#### 耦合对 #6
| 项目 | 内容 |
|------|------|
| **模块 A** | 页面组件 |
| **模块 B** | `src/contexts/AppContext.tsx` |
| **耦合类型** | 印记耦合 (Stamp Coupling) |
| **严重程度** | 🟡 中 |
| **问题描述** | 页面组件获取整个 AppContext 对象，即使只需要其中一个属性（如 `isClient`） |
| **代码示例** |
```typescript
// 只需要 isClient，但获取整个 context
const { isClient } = useApp();

// 只需要 resources，但获取整个 context
const { resources } = useApp();
```

---

#### 耦合对 #7
| 项目 | 内容 |
|------|------|
| **模块 A** | `src/app/api/documents/route.ts` |
| **模块 B** | 默认文档数据 |
| **耦合类型** | 控制耦合 (Control Coupling) |
| **严重程度** | 🟡 中 |
| **问题描述** | API 路由中硬编码默认文档初始化逻辑，业务逻辑与数据访问耦合 |
| **代码位置** | documents/route.ts:4-91 |

---

#### 耦合对 #8
| 项目 | 内容 |
|------|------|
| **模块 A** | `src/app/board/page.tsx` |
| **模块 B** | `/api/posts` |
| **耦合类型** | 控制耦合 (Control Coupling) |
| **严重程度** | 🟡 中 |
| **问题描述** | BoardPage 直接调用 posts API，自行管理 posts 状态（未使用 AppContext），与其他页面的数据管理方式不一致 |
| **代码位置** | board/page.tsx:58-71, 73-97 |

---

#### 耦合对 #9
| 项目 | 内容 |
|------|------|
| **模块 A** | `src/contexts/AppContext.tsx` |
| **模块 B** | 硬编码密码 |
| **耦合类型** | 控制耦合 (Control Coupling) |
| **严重程度** | 🟡 中 |
| **问题描述** | AppContext 中硬编码密码 `PASSWORD = "WM2006"`，密码验证逻辑与应用状态管理耦合 |
| **代码位置** | AppContext.tsx:52, 224-226 |

```typescript
const PASSWORD = "WM2006";

const verifyPassword = (password: string) => {
  return password === PASSWORD;
};
```

---

#### 耦合对 #10
| 项目 | 内容 |
|------|------|
| **模块 A** | `src/app/characters/page.tsx` |
| **模块 B** | `/api/characters` |
| **耦合类型** | 控制耦合 (Control Coupling) |
| **严重程度** | 🟡 中 |
| **问题描述** | CharactersPage 直接调用 characters API，自行管理 characters 状态，与其他页面的数据管理方式不一致 |
| **代码位置** | characters/page.tsx:76-89, 107-181 |

---

#### 耦合对 #11
| 项目 | 内容 |
|------|------|
| **模块 A** | `src/app/map/page.tsx` |
| **模块 B** | `/api/map`, `/api/map/nodes`, `/api/map/edges` |
| **耦合类型** | 控制耦合 (Control Coupling) |
| **严重程度** | 🟡 中 |
| **问题描述** | MapPage 直接调用多个 map API，自行管理 nodes 和 edges 状态，与其他页面的数据管理方式不一致 |
| **代码位置** | map/page.tsx:86-113, 115-142, 154-180, 192-221, 223-238 |

---

#### 耦合对 #12
| 项目 | 内容 |
|------|------|
| **模块 A** | `src/contexts/AuthContext.tsx` |
| **模块 B** | `localStorage` |
| **耦合类型** | 公共耦合 (Common Coupling) |
| **严重程度** | 🟡 中 |
| **问题描述** | AuthContext 直接使用 localStorage 持久化用户信息，存储逻辑与认证逻辑耦合 |
| **代码位置** | AuthContext.tsx:27-33, 55, 65 |

```typescript
useEffect(() => {
  const storedUser = localStorage.getItem("westmarch_user");
  // ...
}, []);

localStorage.setItem("westmarch_user", JSON.stringify(userData));

localStorage.removeItem("westmarch_user");
```

---

#### 耦合对 #13
| 项目 | 内容 |
|------|------|
| **模块 A** | `src/app/board/page.tsx` |
| **模块 B** | `localStorage` |
| **耦合类型** | 公共耦合 (Common Coupling) |
| **严重程度** | 🟡 中 |
| **问题描述** | BoardPage 直接使用 localStorage 存储搜索历史，存储逻辑与页面逻辑耦合 |
| **代码位置** | board/page.tsx:46-52, 148-164 |

---

### 4.3 低严重程度耦合

#### 耦合对 #14
| 项目 | 内容 |
|------|------|
| **模块 A** | UI 组件 (Button, Card) |
| **模块 B** | `src/lib/utils.ts` |
| **耦合类型** | 数据耦合 (Data Coupling) |
| **严重程度** | 🟢 低 |
| **问题描述** | UI 组件使用 `cn()` 函数合并样式类，这是良好的耦合方式 |
| **状态** | ✅ 可接受 |

---

#### 耦合对 #15
| 项目 | 内容 |
|------|------|
| **模块 A** | `src/app/layout.tsx` |
| **模块 B** | Context Providers |
| **耦合类型** | 数据耦合 (Data Coupling) |
| **严重程度** | 🟢 低 |
| **问题描述** | RootLayout 正确组合了 ThemeProvider、AuthProvider、AppProvider，这是良好的架构模式 |
| **状态** | ✅ 可接受 |

---

#### 耦合对 #16
| 项目 | 内容 |
|------|------|
| **模块 A** | 页面组件 |
| **模块 B** | UI 组件 (Button, Card) |
| **耦合类型** | 数据耦合 (Data Coupling) |
| **严重程度** | 🟢 低 |
| **问题描述** | 页面组件使用可复用的 UI 组件，这是良好的耦合方式 |
| **状态** | ✅ 可接受 |

---

## 5. 耦合度总结

### 5.1 耦合热力图

```
模块                  | 高 | 中 | 低 | 总计
---------------------|----|----|----|-----
AppContext.tsx       | 3  | 1  | 0  | 4
API 路由层           | 2  | 1  | 0  | 3
AuthContext.tsx      | 1  | 1  | 0  | 2
页面组件             | 1  | 4  | 2  | 7
UI 组件层            | 0  | 0  | 2  | 2
---------------------|----|----|----|-----
总计                 | 7  | 7  | 4  | 18
```

### 5.2 关键问题总结

1. **AppContext 是最大的耦合源**：承担 4 个耦合对，其中 3 个高严重程度
2. **API 层缺乏抽象**：所有路由直接依赖 Prisma，无 Repository 模式
3. **状态管理不一致**：部分页面用 AppContext，部分页面自行管理状态
4. **硬编码问题**：密码、默认文档等硬编码在代码中
5. **存储逻辑分散**：localStorage 使用分散在多个模块中

---

## 6. 重构建议

### 6.1 高优先级重构

#### 建议 1: 拆分 AppContext
**问题**: AppContext 职责过载
**方案**: 将 AppContext 拆分为多个专用 Context

```
AppContext.tsx (重构为)
├── ResourcesContext.tsx    # 资源管理
├── DocumentsContext.tsx    # 文档管理
├── SettingsContext.tsx     # 设置管理
└── AuthUtils.tsx           # 密码验证
```

**预期收益**:
- 降低耦合度 🔴→ 🟡
- 提高可维护性
- 便于独立测试

---

#### 建议 2: 引入 Repository 层
**问题**: API 路由直接依赖 Prisma
**方案**: 创建 Repository 层抽象数据访问

```
src/
├── repositories/
│   ├── UserRepository.ts
│   ├── CharacterRepository.ts
│   ├── PostRepository.ts
│   ├── DocumentRepository.ts
│   ├── MapRepository.ts
│   └── index.ts
```

**示例代码**:
```typescript
// repositories/PostRepository.ts
export class PostRepository {
  constructor(private prisma: PrismaClient) {}
  
  async findAll() {
    return this.prisma.post.findMany({
      orderBy: { createdAt: 'desc' },
      include: { author: true, character: true }
    });
  }
  
  async create(data: CreatePostInput) {
    return this.prisma.post.create({ data });
  }
}
```

**预期收益**:
- 降低耦合度 🔴→ 🟢
- 便于单元测试
- 支持数据库迁移

---

#### 建议 3: 创建 API Client 层
**问题**: AppContext 和页面组件直接调用 fetch
**方案**: 创建 API Client 层封装 API 调用

```
src/
├── services/
│   ├── api.ts              # 基础 fetch 封装
│   ├── postsApi.ts
│   ├── charactersApi.ts
│   ├── documentsApi.ts
│   └── index.ts
```

**示例代码**:
```typescript
// services/api.ts
const apiClient = {
  get: async <T>(url: string) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error('API Error');
    return res.json() as T;
  },
  post: async <T>(url: string, data: any) => {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json() as T;
  }
};
```

**预期收益**:
- 降低耦合度 🔴→ 🟡
- 统一错误处理
- 便于添加认证、重试等横切关注点

---

### 6.2 中优先级重构

#### 建议 4: 创建存储服务层
**问题**: localStorage 使用分散
**方案**: 创建统一的存储服务

```typescript
// services/storage.ts
const STORAGE_KEYS = {
  USER: 'westmarch_user',
  SEARCH_HISTORY: 'wm-search-history'
} as const;

export const storage = {
  getUser: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER);
      return data ? JSON.parse(data) : null;
    } catch { return null; }
  },
  setUser: (user: User) => {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  },
  // ... 更多方法
};
```

**预期收益**:
- 降低耦合度 🟡→ 🟢
- 统一存储管理
- 便于迁移到其他存储方案

---

#### 建议 5: 提取默认数据到配置
**问题**: 默认文档硬编码在 API 路由中
**方案**: 创建配置文件

```
src/
├── config/
│   ├── defaultDocuments.ts
│   └── index.ts
```

**预期收益**:
- 降低耦合度 🟡→ 🟢
- 便于修改默认内容
- 支持多语言

---

#### 建议 6: 环境变量配置密码
**问题**: 密码硬编码在 AppContext 中
**方案**: 使用环境变量

```typescript
// .env
ADMIN_PASSWORD=WM2006

// AppContext.tsx
const PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "WM2006";
```

**预期收益**:
- 提高安全性
- 便于不同环境配置

---

### 6.3 低优先级重构

#### 建议 7: 统一状态管理策略
**问题**: 部分页面用 Context，部分自行管理
**方案**: 明确状态管理策略

| 状态类型 | 推荐方案 |
|---------|---------|
| 全局用户状态 | AuthContext |
| 全局应用设置 | SettingsContext |
| 页面级状态 | 页面自行管理 (useState) |
| 共享资源状态 | ResourcesContext |

**预期收益**:
- 提高代码一致性
- 减少混淆

---

## 附录

### A. 参考文件清单

| 文件路径 | 说明 |
|---------|------|
| `src/contexts/AppContext.tsx` | 应用全局状态管理（高耦合） |
| `src/contexts/AuthContext.tsx` | 认证状态管理 |
| `src/lib/prisma.ts` | Prisma 客户端 |
| `src/app/api/**/*.ts` | API 路由层（高耦合） |
| `src/app/page.tsx` | 首页 |
| `src/app/board/page.tsx` | 布告栏页面 |
| `src/app/map/page.tsx` | 地图页面 |
| `src/app/characters/page.tsx` | 角色页面 |

### B. 耦合度评估标准

| 严重程度 | 颜色 | 说明 | 重构优先级 |
|---------|------|------|-----------|
| 高 | 🔴 红色 | 严重影响可维护性和可测试性 | 立即重构 |
| 中 | 🟡 黄色 | 有一定影响，建议重构 | 尽快重构 |
| 低 | 🟢 绿色 | 影响很小或可接受 | 可选重构 |

---

**报告生成完成**  
**分析工具**: 手动代码审查 + 架构分析  
**下次审查建议**: 3 个月后或重大功能添加后


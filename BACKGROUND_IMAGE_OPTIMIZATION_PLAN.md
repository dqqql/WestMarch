# 背景图优化方案文档

## 1. 目标

在不改变当前视觉风格的前提下，提升各页面背景图的加载速度与稳定性，减少“有时快、有时慢”的体感差异。

核心目标：

- 首屏更快出现背景图。
- 多页面切换时背景图更稳定命中缓存。
- 改动可控、风险低、可快速回滚。

## 2. 现状

### 2.1 背景资源体积

当前 `public/images` 下共有三张 PNG：

- `home-bg.png`：1584x672，约 1946.7 KB
- `general-bg.png`：1584x672，约 1888.2 KB
- `map-bg.png`：1024x1024，约 2672.2 KB

总计约 6.5 MB+（仅图片原始体积，未计网络链路波动）。

### 2.2 使用位置

- 首页：`src/app/page.tsx`
- 地图页：`src/components/HexGridMap.tsx`
- 公告列表：`src/app/board/page.tsx`
- 公告详情：`src/app/board/[id]/page.tsx`
- 文档页布局：`src/app/docs/layout.tsx`
- 组队页：`src/app/party/page.tsx`
- UI 预览页：`src/app/ui-preview/page.tsx`

### 2.3 当前加载方式

- 通过原生 `<img src="/images/*.png" />` 加载背景。
- 多个页面背景渲染受 `isClient` 条件控制，即客户端 hydration 后才开始请求背景图。

### 2.4 当前缓存行为

背景图请求头现状为：

- `Cache-Control: public, max-age=0`
- 带 `ETag` / `Last-Modified`

这代表浏览器通常会重复协商缓存，难以实现强缓存复用。

## 3. 问题根因

造成“加载忽快忽慢”的主要因素：

- PNG 体积偏大，弱网下首包时间长。
- `isClient` 导致背景图请求启动时机偏晚。
- 缓存策略较弱（`max-age=0`），跨页面/重复访问收益有限。
- 开发模式下编译波动会放大体感差异。

## 4. 优化策略（分阶段）

采用低风险分阶段方案：

- Phase A：高收益、低风险（优先实施）
- Phase B：可维护性与一致性提升
- Phase C：长期进阶（可选）

## 5. Phase A（优先）

### 5.1 将 PNG 转为 WebP（可选 AVIF）

新增优化资源：

- `public/images/home-bg.v1.webp`
- `public/images/general-bg.v1.webp`
- `public/images/map-bg.v1.webp`

建议保留原 PNG 作为回退资源。

预期收益：

- 较 PNG 通常可缩小 40%~80%。
- 首次加载显著提速。

### 5.2 背景图不再依赖 `isClient` 才渲染

让服务端输出中直接包含背景节点，浏览器可更早开始请求背景图。

预期收益：

- 减少“页面先出来，背景后出来”的延迟感。

### 5.3 为版本化背景图设置强缓存

在 `next.config.ts` 为版本化资源（如 `*.v1.webp`）配置：

- `Cache-Control: public, max-age=31536000, immutable`

预期收益：

- 二次访问与页面切换大概率直接命中缓存。
- 加载体验更稳定。

### 5.4 仅首页背景做预加载

仅对首页背景做预加载（或优先级提升），不要全站都预加载，避免浪费带宽。

## 6. Phase B（A 稳定后）

### 6.1 抽离统一背景组件

新增统一背景组件，例如：

- `src/components/PageBackground.tsx`

职责：

- 统一背景图、透明度、叠加渐变配置。
- 统一层级与 class，避免多页面重复代码。

### 6.2 评估迁移到 `next/image`

在适配成本可控时，使用 `next/image`（`fill` + 合理 `sizes`）管理背景图加载策略与优化输出。

## 7. Phase C（可选长期）

- 接入 CDN 分发背景图。
- AVIF 主格式 + WebP 回退。
- 建立图片压缩与版本化脚本流程（避免手工漏改）。

## 8. 文件级改动清单

### 8.1 配置文件

- `next.config.ts`
  - 增加背景图缓存 header 配置。
  - 如启用 `next/image`，补充 `images` 配置。

### 8.2 新增资源文件

- `public/images/home-bg.v1.webp`
- `public/images/general-bg.v1.webp`
- `public/images/map-bg.v1.webp`

### 8.3 页面引用改造

- `src/app/page.tsx`
- `src/components/HexGridMap.tsx`
- `src/app/board/page.tsx`
- `src/app/board/[id]/page.tsx`
- `src/app/docs/layout.tsx`
- `src/app/party/page.tsx`
- `src/app/ui-preview/page.tsx`

### 8.4 可选清理

- `src/contexts/AppContext.tsx`
  - 若背景不再依赖 `isClient`，可移除相关耦合。

## 9. 执行步骤

1. 生成三张 `.webp` 版本背景图并放入 `public/images`。
2. 批量替换页面中的背景引用路径。
3. 配置强缓存策略（仅版本化资源）。
4. 移除背景的 `isClient` 渲染门控。
5. 执行构建与页面冒烟测试。
6. 用浏览器 Network 对比优化前后数据。

## 10. 验证口径

### 10.1 功能验证

- 所有目标页面背景显示正常。
- 叠加层、对比度、可读性不退化。
- 无新增 hydration 警告或明显布局抖动。

### 10.2 性能验证（Network）

重点对比：

- 背景图资源体积（transfer size）。
- 首次进入页面背景出现耗时。
- 二次访问是否命中缓存、避免重复完整下载。

建议至少验证：

- 首页 `/`
- 地图页
- 任一使用 `general-bg` 的页面

### 10.3 构建验证

- `npm run build` 通过。

## 11. 风险与回滚

### 11.1 主要风险

- 压缩参数过高导致画质下降。
- 缓存策略配置错误，导致更新后用户拿到旧图。

### 11.2 风险控制

- 使用版本化文件名（`v1`、`v2`）发布新图。
- 首次上线阶段保留 PNG 回退路径。

### 11.3 回滚方案

- 页面引用切回原 PNG。
- 暂停或移除背景图强缓存规则。

## 12. 验收标准

- 首页背景传输体积下降至少 50%。
- 同会话内多页面切换背景图不再重复完整下载。
- 用户主观体感：背景出现更快、更稳定。
- 桌面端与移动端无明显视觉回归。


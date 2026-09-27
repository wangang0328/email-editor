# Arco Design → shadcn/ui 迁移进度

## 概览

| 项目 | 状态 |
|------|------|
| **开始日期** | 2026-03-31 |
| **预计完成** | 6 周 |
| **当前阶段** | 阶段 2: 样式 / DOM 类名去 Arco ✅ |
| **总进度** | 55% |

---

## 阶段进度

### 阶段 0: 基础设施搭建 ✅ 完成

- [x] 安装 Tailwind CSS (`tailwindcss@^3.4.0` - 从 v4 降级，因为 shadcn/ui 兼容 v3)
- [x] 配置 PostCSS (`postcss@^8.5.8`, `autoprefixer@^10.4.27`)
- [x] 在 demo 添加 `postcss.config.js` 指向 extensions 的 tailwind.config
- [x] 在 demo 的 `App.tsx` 导入 `globals.css`
- [x] 初始化 shadcn/ui 核心依赖
- [x] 安装 Radix UI 组件 (13 个)
- [x] 安装第三方依赖 (5 个)
- [x] 创建 `cn()` 工具函数
- [x] 创建 CSS 变量文件 (v3 格式：`@tailwind base/components/utilities`)
- [x] 创建基础 shadcn 组件 (14 个)

### 阶段 1: 组件适配层迁移 ✅ 完成

通过创建适配层 (`src/components/arco-adapter/`)，将所有 Arco 组件导入迁移到适配层。

**创建的适配器组件 (19 个)**:

| 组件 | 文件 | 底层实现 |
|------|------|----------|
| Button | `Button.tsx` | shadcn Button |
| Tooltip | `Tooltip.tsx` | Radix Tooltip |
| Popover | `Popover.tsx` | Radix Popover |
| Input / TextArea | `Input.tsx` | shadcn Input |
| Switch | `Switch.tsx` | Radix Switch |
| Select | `Select.tsx` | Radix Select |
| Collapse | `Collapse.tsx` | Radix Accordion |
| Tabs | `Tabs.tsx` | Radix Tabs |
| Slider | `Slider.tsx` | Radix Slider |
| Radio / RadioGroup | `Radio.tsx` | Radix RadioGroup |
| Checkbox / CheckboxGroup | `Checkbox.tsx` | Radix Checkbox |
| Grid (Row/Col) | `Grid.tsx` | Flexbox |
| Space | `Space.tsx` | Flexbox |
| Drawer | `Drawer.tsx` | Vaul |
| Modal | `Modal.tsx` | Radix Dialog |
| Message | `Message.tsx` | Sonner |
| Dropdown / Menu | `Dropdown.tsx` | Radix DropdownMenu |
| Tree | `Tree.tsx` | react-arborist |
| Layout | `Layout.tsx` | Flexbox |
| Card | `Card.tsx` | Tailwind |
| ConfigProvider | `ConfigProvider.tsx` | TooltipProvider |
| Typography | `Typography.tsx` | Tailwind |
| InputNumber | `InputNumber.tsx` | shadcn Input |
| Spin | `Spin.tsx` | Lucide Icons |
| List | `List.tsx` | Tailwind |
| TreeSelect | `TreeSelect.tsx` | Radix Select |
| Form | `Form.tsx` | Tailwind |
| AutoComplete | `AutoComplete.tsx` | shadcn Input |

**迁移的文件数量**: 83 个文件

**完成情况**:

- [x] Button (14 文件) 
- [x] Input / Textarea (9 文件)
- [x] Select (1 文件)
- [x] Checkbox (1 文件)
- [x] Radio (1 文件)
- [x] Switch (4 文件)
- [x] Slider (1 文件)
- [x] Tooltip (13 文件)
- [x] Popover (9 文件)
- [x] Grid (26 文件)
- [x] Space (24 文件)
- [x] Layout (3 文件)
- [x] Collapse (25 文件)
- [x] Tabs (5 文件)
- [x] Card (4 文件)
- [x] Modal (2 文件)
- [x] Drawer (2 文件)
- [x] Tree (2 文件)
- [x] TreeSelect (2 文件)
- [x] Message (3 文件)
- [x] Dropdown/Menu (4 文件)
- [x] Spin (1 文件)
- [x] 所有类型导入迁移

### 验证阶段 ✅ 完成

**已发现并修复的问题**：

1. ✅ `Link.tsx` - Duplicate declaration "Link"
   - 原因：`Link` 从 lucide-react 导入后又导出同名函数
   - 修复：重命名为 `LinkIcon`

2. ✅ `Dropdown.tsx` - Multiple exports with same name "Menu"
   - 原因：`Menu` 组件导出后又通过 `MenuNamespace` 重导出
   - 修复：移除重复导出，直接导出 `Menu`

3. ✅ `Dropdown.tsx` - Cannot access 'Menu' before initialization
   - 原因：`Menu.displayName` 在 `Menu` 定义前被调用
   - 修复：改为 `MenuComponent.displayName`

4. ✅ `Grid.tsx` - Row is not defined
   - 原因：`GridContext` 在使用后才定义
   - 修复：将 `GridContext` 移到文件顶部

5. ✅ `Tabs.tsx` - React key prop warning
   - 原因：`TabPaneProps.key` 与 React 特殊属性冲突
   - 修复：改用 `tabKey` 属性

6. ✅ `Tree.tsx` - Data must contain 'id' property
   - 原因：`convertToArboristData` 未正确处理 `fieldNames`
   - 修复：添加 `fieldNames` 参数支持

7. ✅ **Tailwind CSS v4 兼容性问题**
   - 原因：shadcn/ui 组件设计基于 Tailwind v3，v4 配置方式完全不同
   - 修复：将 `tailwindcss` 从 v4.2.2 降级到 v3.4.0
   - 更新 `globals.css` 使用 v3 格式 (`@tailwind base/components/utilities`)
   - 在 demo 添加 `postcss.config.js`
   - 在 demo 的 `App.tsx` 导入 `globals.css`

8. ✅ **Tree.tsx - renderTitle 未定义**
   - 原因：`renderTitle` prop 未从解构中提取
   - 修复：在组件 props 解构中添加 `renderTitle`

9. ✅ **Grid.tsx - 布局样式失效**
   - 原因：Tailwind 动态类名在 JIT 模式下无法生成
   - 修复：改用内联样式实现 Row/Col 的 flex 布局

10. ✅ **Tabs.tsx - 横向滚动**
    - 修复：添加 `tabs-scroll-container` 包装器和 CSS 样式
    - hover 时显示滚动条，默认隐藏

**当前状态**：

- 首页正常加载 ✅
- 编辑器页面正常显示 ✅
- 左侧 Tab 切换正常 (Block/Layer/Configuration/Source code) ✅
- Block 列表显示正常 ✅
- Layer 树显示正常，显示完整节点名称 ✅
- Configuration 配置面板显示正常 ✅
- Tabs 支持横向滚动 ✅
- Tailwind CSS v3 样式生效 ✅
- 服务器端无编译错误 ✅
- 只有 Sass 弃用警告（非阻塞）

### 阶段 1.5: 移除 `@arco-design` npm 依赖 ✅ 完成

- [x] `Help` 图标改为 `lucide-react`（`CircleHelp`）
- [x] `BlockTree` 类型迁至 `arco-adapter/Tree.tsx`（`NodeInstance`、`AllowDrop`）
- [x] `InputSearchProps` 迁至 `arco-adapter/Input.tsx`
- [x] `StandardLayout` / `SimpleLayout` 移除无效 `enUS` locale
- [x] `package.json` 移除 `@arco-design/web-react`
- [x] `extensions` 包内 `@arco-design` 引用归零

### 阶段 2: 样式 / DOM 类名去 Arco ✅ 完成

- [x] 新增 `src/styles/editorClassNames.ts`（`ee-*` 稳定类名）
- [x] 适配层组件挂载 `ee-*` 类（Layout / Tabs / Collapse / Popover / Select / Input / Tree）
- [x] SCSS/CSS 中 `.arco-*` 全部替换为 `ee-*` 或 `[data-state=open]`
- [x] `useAvatarWrapperDrop` / `BlockLayer` 拖拽高亮类名迁移
- [x] 暗色模式：`[arco-theme="dark"]` → `.dark`（`globals.css`、`index.scss`、`tailwind.config.ts`）
- [x] `Input.searchButton` 映射到适配层 `addAfter` 按钮

### 阶段 3-5: 待进行

待适配层验证稳定后，逐步移除适配层，直接使用 shadcn 组件。

### 阶段 6: 样式统一 (待进行)

- [x] 移除 extensions 内 `.arco-*` CSS 覆盖
- [ ] 统一设计令牌（demo 仍用 Arco 主题变量处）
- [x] extensions 暗色主题适配（`.dark`）

### 阶段 7: 测试与修复 (待进行)

- [ ] 功能回归测试
- [ ] 视觉还原检查
- [ ] 性能验证

---

## 详细日志

### 2026-03-31

#### 阶段 0: 基础设施搭建 ✅

**状态**: ✅ 完成

#### 阶段 1: 组件适配层迁移 ✅

**状态**: ✅ 完成

**操作记录**:

1. **创建适配器组件目录**: `src/components/arco-adapter/`

2. **创建 19 个适配器组件**，每个组件：
   - 保持 Arco Design API 兼容性
   - 内部使用 shadcn/Radix UI 实现
   - 支持类型导出

3. **运行批量迁移脚本**:

```bash
# 迁移组件导入
node scripts/batch-migrate-arco.mjs
# 结果: 修改 64 个文件

# 补充迁移
node scripts/batch-migrate-arco.mjs  
# 结果: 修改 12 个文件

# 迁移类型导入
node scripts/migrate-arco-types.mjs
# 结果: 修改 19 个文件
```

4. **验证迁移结果**:

```bash
# 检查剩余 Arco 导入
rg "from '@arco-design/web-react'" packages/email-editor-extensions/src
# 结果: 无匹配
```

**创建的脚本**:

| 脚本 | 用途 |
|------|------|
| `scripts/batch-migrate-arco.mjs` | 批量迁移 Arco 组件导入 |
| `scripts/migrate-arco-types.mjs` | 迁移 Arco 类型导入 |

---

## 统计

| 指标 | 数量 |
|------|------|
| 总文件数 | 67+ |
| 已迁移到适配层 | 83 |
| 适配器组件 | 19 |
| shadcn UI 组件 | 14 |
| extensions 内 `@arco-design` 直连 | 0 |
| 经 `arco-adapter` 间接引用 | ~77 文件 |

---

## 下一步计划

### 验证与测试 ✅

1. ✅ 启动开发服务器，验证应用正常运行
2. ✅ 检查各组件功能是否正常
3. ✅ 修复发现的问题

### 已修复的样式问题 (2026-04-02)

1. **Input 组件边框样式** - 使用内联样式替代 Tailwind 类，确保边框正确显示
2. **Select 组件样式** - SelectTrigger、SelectContent、SelectItem 使用内联样式
3. **TextArea 组件样式** - 添加边框和聚焦状态样式
4. **InputNumber 组件样式** - 使用内联样式替代 Tailwind 类
5. **Accordion/Collapse 组件样式** - 使用内联样式，chevron 旋转动画
6. **Form.Item 组件** - 支持 labelCol/wrapperCol 属性实现 inline 布局
7. **Space 组件** - 使用内联样式替代 Tailwind 类
8. **Grid/Row/Col 组件** - 使用内联样式替代动态 Tailwind 类
9. **Tabs 横向滚动** - 添加自定义滚动条样式
10. **Tree 组件** - 修复 renderTitle 支持

### 逐步优化

1. 统一样式：移除 SCSS，使用 Tailwind
2. 移除适配层：直接使用 shadcn 组件
3. 性能优化：移除未使用的依赖

---

## 文件结构

```
packages/email-editor-extensions/src/
├── components/
│   ├── arco-adapter/          # 适配层 (19 组件)
│   │   ├── Button.tsx
│   │   ├── Tooltip.tsx
│   │   ├── Popover.tsx
│   │   ├── Input.tsx
│   │   ├── Switch.tsx
│   │   ├── Select.tsx
│   │   ├── Collapse.tsx
│   │   ├── Tabs.tsx
│   │   ├── Slider.tsx
│   │   ├── Radio.tsx
│   │   ├── Checkbox.tsx
│   │   ├── Grid.tsx
│   │   ├── Space.tsx
│   │   ├── Drawer.tsx
│   │   ├── Modal.tsx
│   │   ├── Message.tsx
│   │   ├── Dropdown.tsx
│   │   ├── Tree.tsx
│   │   ├── Layout.tsx
│   │   ├── Card.tsx
│   │   ├── ConfigProvider.tsx
│   │   ├── Typography.tsx
│   │   ├── InputNumber.tsx
│   │   ├── Spin.tsx
│   │   ├── List.tsx
│   │   ├── TreeSelect.tsx
│   │   ├── Form.tsx
│   │   ├── AutoComplete.tsx
│   │   └── index.ts
│   └── ui/                    # shadcn 组件 (14 组件)
│       ├── button.tsx
│       ├── input.tsx
│       ├── tooltip.tsx
│       ├── popover.tsx
│       ├── accordion.tsx
│       ├── tabs.tsx
│       ├── switch.tsx
│       ├── select.tsx
│       ├── dialog.tsx
│       ├── slider.tsx
│       ├── checkbox.tsx
│       ├── radio-group.tsx
│       ├── dropdown-menu.tsx
│       ├── label.tsx
│       └── index.ts
├── lib/
│   └── utils.ts               # cn() 工具函数
└── styles/
    └── globals.css            # CSS 变量
```

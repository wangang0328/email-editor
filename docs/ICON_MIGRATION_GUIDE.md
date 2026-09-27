# IconFont → lucide-react 迁移指南

## 概述

本文档提供从字体图标 (iconfont) 迁移到 lucide-react 的完整对照表和实施步骤。

- **当前图标数量**: 51 个
- **使用位置**: 49 处，涉及 30 个文件
- **lucide-react 版本**: `^0.454.0` (项目已安装)

---

## 一、图标映射对照表

### 1.1 完整映射表

| 原图标名称 | lucide-react 组件 | 说明 |
|------------|-------------------|------|
| `icon-accordion` | `ChevronsUpDown` | 手风琴折叠展开效果 |
| `icon-align-center` | `AlignCenter` | 居中对齐 |
| `icon-align-left` | `AlignLeft` | 左对齐 |
| `icon-align-right` | `AlignRight` | 右对齐 |
| `icon-back-parent` | `CornerLeftUp` | 返回父级 |
| `icon-bg-color` | `PaintBucket` | 背景颜色 |
| `icon-bold` | `Bold` | 加粗 |
| `icon-bottom` | `ArrowDownToLine` | 置底 |
| `icon-button` | `RectangleHorizontal` | 按钮块 |
| `icon-carousel` | `GalleryHorizontal` | 轮播图 |
| `icon-close` | `X` | 关闭 |
| `icon-collection` | `Star` | 收藏 |
| `icon-column` | `Columns2` | 多列布局 |
| `icon-copy` | `Copy` | 复制 |
| `icon-delete` | `Trash2` | 删除 |
| `icon-desktop` | `Monitor` | 桌面预览 |
| `icon-divider` | `Minus` | 分割线 |
| `icon-drag` | `GripVertical` | 拖拽手柄 |
| `icon-editor` | `PenLine` | 编辑器 |
| `icon-eye` | `Eye` | 可见 |
| `icon-eye-invisible` | `EyeOff` | 隐藏 |
| `icon-font-color` | `Palette` | 字体颜色 |
| `icon-group` | `Group` | 分组 |
| `icon-hero` | `LayoutTemplate` | Hero 区块 |
| `icon-html` | `Code` | HTML 代码 |
| `icon-img` | `Image` | 图片 |
| `icon-italic` | `Italic` | 斜体 |
| `icon-line` | `SeparatorHorizontal` | 水平线 |
| `icon-link` | `Link` | 链接 |
| `icon-list-ol` | `ListOrdered` | 有序列表 |
| `icon-list-ul` | `List` | 无序列表 |
| `icon-merge-tags` | `Braces` | 合并标签/变量 |
| `icon-mobile` | `Smartphone` | 移动端预览 |
| `icon-more` | `MoreHorizontal` | 更多操作 |
| `icon-move` | `Move` | 移动 |
| `icon-navbar` | `Menu` | 导航栏 |
| `icon-number` | `Hash` | 数字/编号 |
| `icon-page` | `FileText` | 页面 |
| `icon-redo` | `Redo2` | 重做 |
| `icon-remove` | `CircleX` | 移除 |
| `icon-section` | `SquareDashed` | 区块 |
| `icon-social` | `Share2` | 社交分享 |
| `icon-spacing` | `Space` | 间距 |
| `icon-start` | `Play` | 开始 |
| `icon-strikethrough` | `Strikethrough` | 删除线 |
| `icon-text` | `Type` | 文本 |
| `icon-top` | `ArrowUpToLine` | 置顶 |
| `icon-underline` | `Underline` | 下划线 |
| `icon-undo` | `Undo2` | 撤销 |
| `icon-unlink` | `Unlink` | 取消链接 |
| `icon-wrapper` | `Package` | 包装器 |

### 1.2 分类汇总

#### 富文本工具栏 (RichTextToolBar)
| 原图标 | lucide 组件 |
|--------|-------------|
| `icon-bold` | `Bold` |
| `icon-italic` | `Italic` |
| `icon-underline` | `Underline` |
| `icon-strikethrough` | `Strikethrough` |
| `icon-align-left` | `AlignLeft` |
| `icon-align-center` | `AlignCenter` |
| `icon-align-right` | `AlignRight` |
| `icon-list-ol` | `ListOrdered` |
| `icon-list-ul` | `List` |
| `icon-link` | `Link` |
| `icon-unlink` | `Unlink` |
| `icon-font-color` | `Palette` |
| `icon-bg-color` | `PaintBucket` |
| `icon-line` | `SeparatorHorizontal` |
| `icon-merge-tags` | `Braces` |

#### 区块类型 (Block Types)
| 原图标 | lucide 组件 |
|--------|-------------|
| `icon-text` | `Type` |
| `icon-img` | `Image` |
| `icon-button` | `RectangleHorizontal` |
| `icon-divider` | `Minus` |
| `icon-section` | `SquareDashed` |
| `icon-column` | `Columns2` |
| `icon-group` | `Group` |
| `icon-wrapper` | `Package` |
| `icon-page` | `FileText` |
| `icon-navbar` | `Menu` |
| `icon-hero` | `LayoutTemplate` |
| `icon-carousel` | `GalleryHorizontal` |
| `icon-accordion` | `ChevronsUpDown` |
| `icon-social` | `Share2` |
| `icon-spacing` | `Space` |
| `icon-html` | `Code` |

#### 操作图标 (Actions)
| 原图标 | lucide 组件 |
|--------|-------------|
| `icon-undo` | `Undo2` |
| `icon-redo` | `Redo2` |
| `icon-copy` | `Copy` |
| `icon-delete` | `Trash2` |
| `icon-remove` | `CircleX` |
| `icon-drag` | `GripVertical` |
| `icon-move` | `Move` |
| `icon-more` | `MoreHorizontal` |
| `icon-close` | `X` |
| `icon-collection` | `Star` |
| `icon-back-parent` | `CornerLeftUp` |
| `icon-top` | `ArrowUpToLine` |
| `icon-bottom` | `ArrowDownToLine` |

#### 视图切换
| 原图标 | lucide 组件 |
|--------|-------------|
| `icon-desktop` | `Monitor` |
| `icon-mobile` | `Smartphone` |
| `icon-eye` | `Eye` |
| `icon-eye-invisible` | `EyeOff` |
| `icon-editor` | `PenLine` |

---

## 二、实施方案

### 2.1 新增依赖

```bash
# 在 email-editor-editor 包中添加依赖
cd packages/email-editor-editor
pnpm add lucide-react
```

### 2.2 创建图标适配层

创建文件 `packages/email-editor-editor/src/components/Icon/index.tsx`:

```tsx
import React from 'react';
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ArrowDownToLine,
  ArrowUpToLine,
  Bold,
  Braces,
  ChevronsUpDown,
  CircleX,
  Code,
  Columns2,
  Copy,
  CornerLeftUp,
  Eye,
  EyeOff,
  FileText,
  GalleryHorizontal,
  GripVertical,
  Group,
  Hash,
  Image,
  Italic,
  LayoutTemplate,
  Link,
  List,
  ListOrdered,
  Menu,
  Minus,
  Monitor,
  MoreHorizontal,
  Move,
  Package,
  PaintBucket,
  Palette,
  PenLine,
  Play,
  RectangleHorizontal,
  Redo2,
  SeparatorHorizontal,
  Share2,
  Smartphone,
  Space,
  SquareDashed,
  Star,
  Strikethrough,
  Trash2,
  Type,
  Underline,
  Undo2,
  Unlink,
  X,
  type LucideProps,
} from 'lucide-react';

const ICON_MAP: Record<string, React.ComponentType<LucideProps>> = {
  'icon-accordion': ChevronsUpDown,
  'icon-align-center': AlignCenter,
  'icon-align-left': AlignLeft,
  'icon-align-right': AlignRight,
  'icon-back-parent': CornerLeftUp,
  'icon-bg-color': PaintBucket,
  'icon-bold': Bold,
  'icon-bottom': ArrowDownToLine,
  'icon-button': RectangleHorizontal,
  'icon-carousel': GalleryHorizontal,
  'icon-close': X,
  'icon-collection': Star,
  'icon-column': Columns2,
  'icon-copy': Copy,
  'icon-delete': Trash2,
  'icon-desktop': Monitor,
  'icon-divider': Minus,
  'icon-drag': GripVertical,
  'icon-editor': PenLine,
  'icon-eye': Eye,
  'icon-eye-invisible': EyeOff,
  'icon-font-color': Palette,
  'icon-group': Group,
  'icon-hero': LayoutTemplate,
  'icon-html': Code,
  'icon-img': Image,
  'icon-italic': Italic,
  'icon-line': SeparatorHorizontal,
  'icon-link': Link,
  'icon-list-ol': ListOrdered,
  'icon-list-ul': List,
  'icon-merge-tags': Braces,
  'icon-mobile': Smartphone,
  'icon-more': MoreHorizontal,
  'icon-move': Move,
  'icon-navbar': Menu,
  'icon-number': Hash,
  'icon-page': FileText,
  'icon-redo': Redo2,
  'icon-remove': CircleX,
  'icon-section': SquareDashed,
  'icon-social': Share2,
  'icon-spacing': Space,
  'icon-start': Play,
  'icon-strikethrough': Strikethrough,
  'icon-text': Type,
  'icon-top': ArrowUpToLine,
  'icon-underline': Underline,
  'icon-undo': Undo2,
  'icon-unlink': Unlink,
  'icon-wrapper': Package,
};

export interface IconProps {
  name: string;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
  onClick?: React.MouseEventHandler<SVGSVGElement>;
  title?: string;
}

export function Icon({
  name,
  size = 16,
  className,
  style,
  onClick,
  title,
}: IconProps) {
  const IconComponent = ICON_MAP[name];

  if (!IconComponent) {
    console.warn(`[Icon] Unknown icon name: ${name}`);
    return null;
  }

  return (
    <IconComponent
      size={size}
      className={className}
      style={{ cursor: 'pointer', ...style }}
      onClick={onClick}
      aria-label={title}
    />
  );
}

export function hasIcon(name: string): boolean {
  return name in ICON_MAP;
}

export { ICON_MAP };
```

### 2.3 修改 IconFont 组件 (兼容过渡)

修改 `packages/email-editor-editor/src/components/IconFont/index.tsx`:

```tsx
import { classnames } from '@/utils/classnames';
import React from 'react';
import { Icon, hasIcon } from '../Icon';

export function IconFont(props: {
  iconName: string;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  onClickCapture?: React.MouseEventHandler<HTMLDivElement>;
  size?: number;
  style?: React.CSSProperties;
  title?: string;
}) {
  // 优先使用 lucide 图标
  if (hasIcon(props.iconName)) {
    return (
      <div
        title={props.title}
        onClick={props.onClick}
        onClickCapture={props.onClickCapture}
        style={{
          cursor: 'pointer',
          pointerEvents: 'auto',
          color: 'inherit',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          ...(props.style as any),
        }}
      >
        <Icon
          name={props.iconName}
          size={props.size || (props.style as any)?.fontSize || 16}
        />
      </div>
    );
  }

  // Fallback 到字体图标（用于未迁移的图标）
  return (
    <div
      title={props.title}
      onClick={props.onClick}
      onClickCapture={props.onClickCapture}
      style={{
        cursor: 'pointer',
        pointerEvents: 'auto',
        color: 'inherit',
        ...(props.style as any),
        fontSize: props.size || (props.style as any)?.fontSize,
      }}
      className={classnames('iconfont', props.iconName)}
    />
  );
}
```

### 2.4 导出新组件

在 `packages/email-editor-editor/src/index.tsx` 添加:

```tsx
export { Icon, hasIcon, ICON_MAP } from './components/Icon';
```

---

## 三、文件修改清单

以下文件使用了 `<IconFont />` 组件，在完成适配层后无需修改（自动生效）：

### email-editor-extensions 包

| 文件路径 | 使用次数 |
|----------|----------|
| `src/components/Form/RichTextToolBar/components/Tools/Tools.tsx` | 多次 |
| `src/components/Form/RichTextToolBar/components/FontSize/index.tsx` | 1 |
| `src/components/Form/RichTextToolBar/components/FontFamily/index.tsx` | 1 |
| `src/components/Form/RichTextToolBar/components/Link/index.tsx` | 2 |
| `src/components/Form/RichTextToolBar/components/MergeTags/index.tsx` | 1 |
| `src/EditPanel/components/Blocks/index.tsx` | 多次 |
| `src/EditPanel/components/Layers/index.tsx` | 多次 |
| `src/ConfigurationPanel/components/BlockLayer/index.tsx` | 多次 |
| `src/InteractivePrompt/components/Toolbar.tsx` | 多次 |
| `src/ShortcutToolbar/index.tsx` | 多次 |
| `src/AttributePanel/components/blocks/*/index.tsx` | 多次 |
| `src/utils/getIconNameByBlockType.ts` | 映射函数 |

### email-editor-editor 包

| 文件路径 | 使用次数 |
|----------|----------|
| `src/components/EmailEditor/components/*/index.tsx` | 多次 |

---

## 四、验证清单

完成迁移后，验证以下功能：

- [ ] 富文本工具栏所有图标正常显示
- [ ] 左侧区块列表图标正常显示
- [ ] 图层面板图标正常显示
- [ ] 悬浮工具栏图标正常显示
- [ ] 快捷工具栏图标正常显示
- [ ] 预览切换（桌面/移动端）图标正常
- [ ] 撤销/重做图标正常
- [ ] 所有图标尺寸与原来一致
- [ ] 图标颜色继承正常
- [ ] 图标点击事件正常触发

---

## 五、清理旧资源

验证无误后，删除以下文件：

```
packages/email-editor-editor/src/assets/font/
├── iconfont.css      # 删除
├── iconfont.json     # 删除
├── iconfont.js       # 删除
├── iconfont.woff2    # 删除
├── iconfont.woff     # 删除
├── iconfont.ttf      # 删除
├── demo_index.html   # 删除
└── demo.css          # 删除
```

同时移除相关 CSS 引用：

```tsx
// 删除以下 import
import '@/assets/font/iconfont.css';
import 'xxx/iconfont.css?inline';
```

---

## 六、回滚方案

如果需要回滚，只需将 `IconFont` 组件恢复为原版本：

```tsx
// 恢复原版 IconFont（无 lucide 依赖）
export function IconFont(props: {...}) {
  return (
    <div
      className={classnames('iconfont', props.iconName)}
      ...
    />
  );
}
```

---

## 七、收益总结

| 指标 | 迁移前 | 迁移后 |
|------|--------|--------|
| 图标加载方式 | 字体文件 (WOFF2) | Tree-shaking SVG |
| TypeScript 支持 | ❌ 无 | ✅ 完整类型 |
| 新增图标 | 需登录 iconfont.cn | 直接 import |
| 多色支持 | ❌ 单色 | ✅ 支持 |
| 小尺寸清晰度 | 可能模糊 | ✅ SVG 清晰 |
| 字体加载闪烁 | 可能出现 | ✅ 无 |
| 包体积 | ~50KB 全量 | ~15KB (51图标) |

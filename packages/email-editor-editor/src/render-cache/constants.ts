import { AdvancedType, BasicType } from '@wa-dev/email-editor-shared';

/**
 * 引擎版本号：块 render 逻辑或 mjml-browser 升级时手动递增，使旧缓存自动失效。
 * 发布前若修改了 @wa-dev/email-editor-blocks-react 的 render 实现，应 bump 此值。
 */
export const RENDER_ENGINE_VERSION = '1.0.3';

/** L1 整页缓存最大条目（LRU） */
export const L1_CACHE_MAX_ENTRIES = 32;

/** L2 段级缓存最大条目（LRU，跨页面共享） */
export const L2_CACHE_MAX_ENTRIES = 256;

/** edit 快路径：最多直通挂载的变更段数，超出走整页 replaceSegmentInHtml */
export const L2_DIRECT_PATCH_MAX = 3;

/**
 * 可作为 L2 独立编译单元的块类型。
 * 与邮件纵向结构对齐：section / hero 等对应 MJML body 下的一级内容块。
 * 使用 string Set：块 type 含 BasicType 与 AdvancedType，而 BlockType 仅别名到 BasicType。
 */
export const SEGMENT_BLOCK_TYPES = new Set<string>([
  BasicType.SECTION,
  BasicType.HERO,
  BasicType.GROUP,
  AdvancedType.SECTION,
  AdvancedType.HERO,
]);

/**
 * 子树含以下块类型时，该段不参与 L2 部分缓存（依赖整树 context / dataSource 展开）。
 */
export const NON_CACHEABLE_DESCENDANT_TYPES = new Set<string>([
  'condition',
  'iteration',
  'advanced_condition',
  'advanced_iteration',
]);

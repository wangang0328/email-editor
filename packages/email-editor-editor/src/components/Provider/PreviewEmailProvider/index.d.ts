import React from 'react';
/**
 * 预览模式渲染 Provider（PC / 移动预览 Tab）。
 *
 * 渲染管线：
 *   pageData → JsonToMjml(mode:'production') → mjml-browser → HtmlStringToPreviewReactNodes
 * 预览编译走主线程同步路径，优先保证 Tab 切换时预览稳定更新。
 *
 * 与 MjmlDomRender 的区别：
 * - 使用 production 模式（无 node-idx，无 contenteditable）
 * - 输出供 DesktopEmailPreview / MobileEmailPreview 只读展示
 * - 编辑 Tab 下跳过整条管线，切到预览 Tab 后再计算（见 isEditTab 守卫）
 *
 */
export declare const MOBILE_WIDTH = 320;
export declare const PreviewEmailContext: React.Context<{
    html: string;
    reactNode: React.ReactNode | null;
    errMsg: React.ReactNode;
    mobileWidth: number;
}>;
export declare const PreviewEmailProvider: React.FC<{
    children?: React.ReactNode;
}>;
//# sourceMappingURL=index.d.ts.map
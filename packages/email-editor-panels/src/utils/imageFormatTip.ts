import { t } from '@lingui/core/macro';

/** 图片上传/属性提示用的格式列表（技术标识，不进翻译） */
export const IMAGE_FILE_FORMATS = '.jpg, .jpeg, .png, .gif';

/** 上传区短提示用的展示名 */
export const IMAGE_FORMAT_LABELS = 'JPG / PNG / GIF';

/** 属性面板 tip：格式列表通过变量传入，便于统一维护 */
export function imageFormatRequiredTip(
  formats: string = IMAGE_FILE_FORMATS,
): string {
  return t`图片格式应为 ${formats} 等，否则可能无法正常显示。`;
}

/** 拖拽上传区副标题 */
export function imageFormatSupportTip(
  formats: string = IMAGE_FORMAT_LABELS,
): string {
  return t`支持 ${formats} 等常见格式`;
}

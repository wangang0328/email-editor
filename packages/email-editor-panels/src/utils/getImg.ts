import { ImageManager } from '@wa-dev/email-editor-blocks-react';
import { defaultImageUrls, transparentIcon } from '@wa-dev/email-editor-shared';

const defaultImagesMap = {
  ...defaultImageUrls,
  AttributePanel_01:
    'https://easy-email-m-ryan.vercel.app/images/e22f78f2-aa76-408d-ba94-c95c7abe1908-image.png',
  /** 透明图片（与 @wa-dev/email-editor-shared 常量一致） */
  TRANSPARENT_ICON: transparentIcon,
  AttributePanel_03:
    'https://easy-email-m-ryan.vercel.app/images/Fi_vI4vyLhTM-Tp6ivq4dR_ieGHk.png',
};

ImageManager.add(defaultImagesMap);

export function getImg(name: keyof typeof defaultImagesMap) {
  return ImageManager.get(name);
}

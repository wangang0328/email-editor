import { defaultImageUrls } from '@wa-dev/email-editor-shared';
import { ImageManager } from './ImageManager';

ImageManager.add(defaultImageUrls);

export function getImg(name: keyof typeof defaultImageUrls) {
  return ImageManager.get(name);
}

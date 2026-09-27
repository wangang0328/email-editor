import { useMemoizedFn } from 'ahooks';
import {
  lockRichTextToolbar,
  unlockRichTextToolbar,
} from '../../RichTextField/richTextToolbarInteraction';

export function useRichTextToolbarPopover() {
  return useMemoizedFn((visible: boolean) => {
    if (visible) {
      lockRichTextToolbar();
    } else {
      unlockRichTextToolbar();
    }
  });
}

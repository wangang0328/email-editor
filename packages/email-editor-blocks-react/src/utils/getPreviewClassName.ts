import { classnames, getNodeIdxClassName, getNodeTypeClassName } from '@wa-dev/email-editor-shared';

export function getPreviewClassName(idx: string | null, type: string) {
  return classnames('email-block',
    idx && getNodeIdxClassName(idx),
    getNodeTypeClassName(type));
}
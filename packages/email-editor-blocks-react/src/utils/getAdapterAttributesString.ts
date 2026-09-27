import { IBlock } from '@blocks/typings';
import { EMAIL_BLOCK_CLASS_NAME } from '@wa-dev/email-editor-shared';

import { isString } from 'lodash-es';

import { classnames } from '@wa-dev/email-editor-shared';
import { getNodeIdxClassName, getNodeTypeClassName } from '@wa-dev/email-editor-shared';

export function getAdapterAttributesString(
  params: Parameters<IBlock['render']>[0]
) {
  const { data, idx } = params;
  const isTest = params.mode === 'testing';
  const attributes = { ...data.attributes };
  const keepClassName = isTest ? params.keepClassName : false;

  if (isTest && idx) {
    attributes['css-class'] = classnames(
      attributes['css-class'],
      EMAIL_BLOCK_CLASS_NAME,
      getNodeIdxClassName(idx),
      getNodeTypeClassName(data.type)
    );
  }

  if (keepClassName) {
    attributes['css-class'] = classnames(
      attributes['css-class'],
      getNodeTypeClassName(data.type)
    );
  }

  let attributeStr = '';
  for (let key in attributes) {
    const keyName = key as keyof typeof attributes;
    const val = attributes[keyName];
    if (typeof val === 'boolean') {
      attributeStr += `${key}="${val.toString()}" `;
    } else if (isString(val) && val) {
      attributeStr += `${key}="${val.replace(/"/gm, '')}" `;
    }
  }

  return attributeStr;
}

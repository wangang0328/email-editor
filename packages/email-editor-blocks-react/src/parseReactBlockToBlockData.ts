import { renderToStaticMarkup } from 'react-dom/server';
import { unescape } from 'lodash-es';
import type { IBlockData } from './typings';

/**
 * 将 React 元素转换为 BlockData， 目前无用
 * @param node - React 元素
 * @returns BlockData
 */
export function parseReactBlockToBlockData<T extends IBlockData = IBlockData>(
  node: React.ReactElement,
) {
  return JSON.parse(unescape(renderToStaticMarkup(node))) as T;
}

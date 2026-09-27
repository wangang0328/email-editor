import { useEffect, useMemo, useRef, useState, useContext } from 'react';

import { getPageIdx } from '@wa-dev/email-editor-blocks-react';
import { getBlockNodeByChildEle } from '@/utils/getBlockNodeByChildEle';
import { resolveBlockIdxFromElement } from '@/utils/blockDom';
import { useBlock } from '@/hooks/useBlock';
import { getDirectionPosition } from '@/utils/getDirectionPosition';
import { useFocusIdx } from './useFocusIdx';
import { useDataTransfer } from './useDataTransfer';
import { HoverIdxContext } from '@/components/Provider/HoverIdxProvider';
import { getInsertPosition } from '@/utils/getInsertPosition';
import { useEditorProps } from './useEditorProps';
import { DATA_ATTRIBUTE_DROP_CONTAINER } from '@/constants';
import { getShadowRoot, suppressInlineTextPreserve } from '@/utils';
import { createDragAutoScroller } from '@/utils/dragAutoScroll';

/** 交互只认 uid→registry；解析失败则不更新，避免误用过期 node-idx */
function resolveLiveBlockIdx(blockNode: Element): string | null {
  return resolveBlockIdxFromElement(blockNode);
}

export function useDropBlock() {
  const [ref, setRef] = useState<HTMLElement | null>(null);
  const { values } = useBlock();
  const { autoComplete } = useEditorProps();
  const { dataTransfer, setDataTransfer } = useDataTransfer();
  const cacheValues = useRef(values);
  const cacheDataTransfer = useRef(dataTransfer);

  useEffect(() => {
    cacheValues.current = values;
  }, [values]);

  useEffect(() => {
    cacheDataTransfer.current = dataTransfer;
  }, [dataTransfer]);
  const { setFocusIdx, focusIdx, notifyFocusSelection } = useFocusIdx();
  const {
    setHoverIdx,
    setDirection,
    isDragging,
    hoverIdx,
    direction,
    dataTransferRef,
  } = useContext(HoverIdxContext);
  const dragHoverRef = useRef({ hoverIdx: '', direction: '' });

  useEffect(() => {
    if (ref) {
      const selectBlockFromEvent = (ev: Event) => {
        if (!(ev.target instanceof Element)) return;

        const blockNode = getBlockNodeByChildEle(ev.target);
        if (blockNode) {
          const idx = resolveLiveBlockIdx(blockNode);
          if (idx) {
            setFocusIdx(idx);
            notifyFocusSelection();
          }
          return;
        }

        // Page 无画布 DOM 节点；点击邮件区域外空白 / 非块区域时选中 page
        if (ref.contains(ev.target)) {
          setFocusIdx(getPageIdx());
          notifyFocusSelection();
        }
      };

      const onPointerDown = (ev: PointerEvent) => {
        if (ev.button !== 0) return;

        const target = ev.target instanceof Node ? ev.target : null;
        const clickingContentEditable =
          target instanceof Element &&
          Boolean(target.closest('[contenteditable="true"]'));

        // 点击 contenteditable 进入/继续富文本编辑：不可抑制 L3，否则 DOM 重挂载会销毁选区与工具栏
        if (!clickingContentEditable) {
          // 切换到其他块：pointerdown 时 activeElement 往往仍是旧 contenteditable
          suppressInlineTextPreserve();
          const shadowRoot = getShadowRoot();
          const active = shadowRoot?.activeElement;
          if (
            active instanceof HTMLElement &&
            active.getAttribute('contenteditable') === 'true' &&
            target &&
            target !== active &&
            !active.contains(target)
          ) {
            active.blur();
          }
        }

        selectBlockFromEvent(ev);
      };

      /** 选中已在 pointerdown(capture) 完成；click 仅阻止链接跳转，避免重复 setFocusIdx 导致面板闪动 */
      const onClick = (ev: MouseEvent) => {
        const target = ev.target instanceof Element ? ev.target : null;
        if (target?.closest('[contenteditable="true"]')) {
          return;
        }
        ev.preventDefault();
      };

      ref.addEventListener('pointerdown', onPointerDown, true);
      ref.addEventListener('click', onClick);
      return () => {
        ref.removeEventListener('pointerdown', onPointerDown, true);
        ref.removeEventListener('click', onClick);
      };
    }
  }, [ref, setFocusIdx, notifyFocusSelection]);

  useEffect(() => {
    if (ref) {
      let lastHoverTarget: EventTarget | null = null;

      let lastDragover: {
        target: EventTarget | null;
        valid: boolean;
      } = {
        target: null,
        valid: false,
      };

      // ref 即 SYNC_SCROLL 滚动容器（EditEmailPreview）
      const autoScroller = createDragAutoScroller(() => ref);

      const onMouseover = (ev: MouseEvent) => {
        if (lastHoverTarget === ev.target) return;
        lastHoverTarget = ev.target;
        const blockNode = getBlockNodeByChildEle(ev.target as HTMLElement);

        if (blockNode) {
          const idx = resolveLiveBlockIdx(blockNode);
          if (idx && idx !== getPageIdx()) {
            setHoverIdx(idx);
          } else {
            setHoverIdx('');
          }
        }
      };

      const onDrop = (ev: DragEvent) => {
        ev.preventDefault();
        lastDragover.target = null;
        autoScroller.stop();
      };

      const onDragOver = (ev: DragEvent) => {
        if (!cacheDataTransfer.current) return;

        // 靠近上下边缘时自动滚动，便于拖到视口外的目标
        autoScroller.updateFromPointer(ev.clientX, ev.clientY);

        lastDragover.target = ev.target;
        lastDragover.valid = false;

        const blockNode = getBlockNodeByChildEle(ev.target as HTMLDivElement);

        if (blockNode) {
          const directionPosition = getDirectionPosition(ev);
          const idx = resolveLiveBlockIdx(blockNode);
          // registry 未就绪或无 uid：不更新落点，避免过期 node-idx 指错块
          const positionData = idx
            ? getInsertPosition({
                context: cacheValues.current,
                idx,
                directionPosition,
                dragType: cacheDataTransfer.current.type,
                action: cacheDataTransfer.current.action,
                sourceIdx: cacheDataTransfer.current.sourceIdx,
              })
            : null;

          if (positionData) {
            ev.preventDefault();
            lastDragover.valid = true;
            const nextTransfer = {
              ...cacheDataTransfer.current,
              parentIdx: positionData.parentIdx,
              positionIndex: positionData.insertIndex,
            };
            cacheDataTransfer.current = nextTransfer;
            dataTransferRef.current = nextTransfer;
            setDataTransfer(nextTransfer);

            const nextHoverIdx = positionData.hoverIdx;
            const nextDirection = positionData.endDirection;
            if (
              dragHoverRef.current.hoverIdx !== nextHoverIdx ||
              dragHoverRef.current.direction !== nextDirection
            ) {
              dragHoverRef.current = {
                hoverIdx: nextHoverIdx,
                direction: nextDirection,
              };
              setDirection(nextDirection);
              setHoverIdx(nextHoverIdx);
            }
          }
        }
        if (!lastDragover.valid) {
          if (dragHoverRef.current.hoverIdx || dragHoverRef.current.direction) {
            dragHoverRef.current = { hoverIdx: '', direction: '' };
            setDirection('');
            setHoverIdx('');
          }
          setDataTransfer((dataTransfer: any) => {
            if (!dataTransfer?.parentIdx) {
              return dataTransfer;
            }
            return {
              ...dataTransfer,
              parentIdx: undefined,
            };
          });
        }
      };

      const onCheckDragLeave = (ev: DragEvent) => {
        const dropEleList = [
          ...document.querySelectorAll(
            `[${DATA_ATTRIBUTE_DROP_CONTAINER}="true"]`,
          ),
        ];
        // 勿用 ev.target：松手瞬间 target 常回到侧栏拖拽源，会误清 parentIdx
        const hit = document.elementFromPoint(ev.clientX, ev.clientY);
        const isOverDropContainer = dropEleList.some(
          (ele) => hit && ele.contains(hit),
        );

        // Shadow 内节点对 host.contains 常为 false；用滚动容器几何范围兜底
        const scrollRect = ref.getBoundingClientRect();
        const isOverScrollViewport =
          ev.clientX >= scrollRect.left - 24 &&
          ev.clientX <= scrollRect.right + 24 &&
          ev.clientY >= scrollRect.top - 8 &&
          ev.clientY <= scrollRect.bottom + 8;

        if (isOverScrollViewport) {
          autoScroller.updateFromPointer(ev.clientX, ev.clientY);
        } else {
          autoScroller.stop();
        }

        if (!isOverDropContainer && !isOverScrollViewport) {
          setDirection('');
          setHoverIdx('');
          if (cacheDataTransfer.current) {
            const cleared = {
              ...cacheDataTransfer.current,
              parentIdx: undefined,
              positionIndex: undefined,
            };
            cacheDataTransfer.current = cleared;
            setDataTransfer(cleared);
          }
        }
      };

      const onDragEnd = () => {
        autoScroller.stop();
      };

      ref.addEventListener('mouseover', onMouseover);
      // ref.addEventListener('mouseout', onMouseOut);
      ref.addEventListener('drop', onDrop);
      ref.addEventListener('dragover', onDragOver);
      window.addEventListener('dragover', onCheckDragLeave);
      window.addEventListener('dragend', onDragEnd);

      return () => {
        autoScroller.stop();
        ref.removeEventListener('mouseover', onMouseover);
        // ref.removeEventListener('mouseout', onMouseOut);
        ref.removeEventListener('drop', onDrop);
        ref.removeEventListener('dragover', onDragOver);
        window.removeEventListener('dragover', onCheckDragLeave);
        window.removeEventListener('dragend', onDragEnd);
      };
    }
  }, [
    autoComplete,
    cacheDataTransfer,
    dataTransferRef,
    ref,
    setDataTransfer,
    setDirection,
    setHoverIdx,
  ]);

  useEffect(() => {
    if (!ref) return;

    const onMouseOut = (ev: MouseEvent) => {
      if (!isDragging) {
        ev.stopPropagation();
        setHoverIdx('');
      }
    };
    ref.addEventListener('mouseout', onMouseOut);
    return () => {
      ref.removeEventListener('mouseout', onMouseOut);
    };
  }, [isDragging, ref, setHoverIdx]);

  useEffect(() => {
    if (ref) {
      ref.setAttribute('data-dragging', String(isDragging));
      ref.setAttribute('data-direction', direction || 'none');
    }
  }, [direction, isDragging, ref]);

  useEffect(() => {
    if (ref) {
      ref.setAttribute('data-hoverIdx', hoverIdx);
    }
  }, [hoverIdx, ref]);

  useEffect(() => {
    if (ref) {
      ref.setAttribute('data-focusIdx', focusIdx);
    }
  }, [focusIdx, ref]);

  return useMemo(
    () => ({
      setRef,
    }),
    [setRef]
  );
}

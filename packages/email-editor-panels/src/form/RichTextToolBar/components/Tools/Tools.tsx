import { t } from '@lingui/core/macro';
import { useMemoizedFn } from 'ahooks';
import React from 'react';
import { ToolItem } from '../ToolItem';
import { getLinkNode, Link, LinkParams } from '../Link';
import {
  FIXED_CONTAINER_ID,
  getBlockNodeByIdx,
  getShadowRoot,
  getShadowSelection,
  useEditorProps,
  useFocusBlockLayout,
  useFocusIdx,
  MergeTagBadge,
  AvailableTools,
} from '@wa-dev/email-editor-editor';
import { Eraser, List, ListOrdered, SeparatorHorizontal } from 'lucide-react';
import { FontFamily } from '../FontFamily';
import { MergeTags } from '../MergeTags';
import { useSelectionRange } from '@panels/hooks/useSelectionRange';
import { IconBgColor } from './IconBgColor';
import { IconFontColor } from './IconFontColor';
import { Unlink } from '../Unlink';
import { StrikeThrough } from '../StrikeThrough';
import { Underline } from '../Underline';
import { Italic } from '../Italic';
import { Bold } from '../Bold';
import { FontSize } from '../FontSize';
import { JustifyButton } from '../Justify';
import { RICH_TEXT_TOOL_BAR } from '@panels/constants';
import {
  applyFontFamilyToRange,
  applyFontSizeToRange,
  resolveExecRange,
} from '../../utils/selection';

export interface ToolsProps {
  onChange: (content: string) => any;
  /** 从 RichTextToolBar 传入的 toolbar（portal 内 context 可能不可用），优先于 useEditorProps().toolbar */
  toolbar?: {
    suffix?: (execCommand: (cmd: string, value?: any) => void) => React.ReactNode;
  };
}

export function Tools(props: ToolsProps) {
  const { mergeTags, enabledMergeTagsBadge, toolbar: contextToolbar } = useEditorProps();
  const toolbar = {
    ...(contextToolbar || {}),
    ...(props.toolbar?.suffix != null && { suffix: props.toolbar.suffix }),
  } as NonNullable<typeof contextToolbar>;
  const { focusIdx } = useFocusIdx();
  const { focusBlockNode } = useFocusBlockLayout();
  const liveBlockNode = getBlockNodeByIdx(focusIdx) ?? focusBlockNode;
  const { selectionRange, restoreRange, setRangeByElement, setSelectionRange } =
    useSelectionRange();

  const execCommand = useMemoizedFn((cmd: string, val?: any) => {
      const resolved = resolveExecRange(selectionRange, liveBlockNode);
      if (!resolved) {
        return;
      }

      const { range: execRange, contentEditable } = resolved;
      contentEditable.focus();
      restoreRange(execRange);

      const syncContent = () => {
        props.onChange(contentEditable.innerHTML || '');
        const selection = getShadowSelection();
        if (selection && selection.rangeCount > 0) {
          setSelectionRange(selection.getRangeAt(0).cloneRange());
        }
      };

      const uuid = (+new Date()).toString();
      if (cmd === 'createLink') {
        const linkData = val as LinkParams;
        const target = linkData.blank ? '_blank' : '';
        let link: HTMLAnchorElement;
        if (linkData.linkNode) {
          link = linkData.linkNode;
        } else {
          document.execCommand(cmd, false, uuid);

          link = getShadowRoot().querySelector(`a[href="${uuid}"]`)!;
          if (!link) {
            return;
          }
        }

        if (target) {
          link.setAttribute('target', target);
        } else {
          link.removeAttribute('target');
        }
        link.style.color = 'inherit';
        link.style.textDecoration = linkData.underline ? 'underline' : 'none';
        link.setAttribute('href', linkData.link.trim());
        syncContent();
        return;
      } else if (cmd === 'insertHTML') {
        let newContent = val;
        if (enabledMergeTagsBadge) {
          newContent = MergeTagBadge.transform(val, uuid);
        }

        document.execCommand(cmd, false, newContent);
        const insertMergeTagEle = getShadowRoot().getElementById(uuid);
        if (insertMergeTagEle) {
          insertMergeTagEle.focus();
          setRangeByElement(insertMergeTagEle);
        }
        syncContent();
        return;
      } else if (cmd === 'foreColor') {
        document.execCommand(cmd, false, val);
        const linkNode: HTMLAnchorElement | null = getLinkNode(execRange);
        if (linkNode) {
          linkNode.style.color = 'inherit';
        }
        syncContent();
        return;
      } else if (cmd === 'hiliteColor') {
        if (!document.execCommand(cmd, false, val)) {
          document.execCommand('backColor', false, val);
        }
        syncContent();
        return;
      } else if (cmd === 'fontName') {
        applyFontFamilyToRange(execRange, contentEditable, String(val));
        syncContent();
        return;
      } else if (cmd === 'fontSize') {
        applyFontSizeToRange(execRange, contentEditable, String(val));
        syncContent();
        return;
      } else {
        document.execCommand(cmd, false, val);
      }

      syncContent();
  });

  const getPopoverMountNode = () => document.getElementById(FIXED_CONTAINER_ID)!;

  const enabledTools = toolbar?.tools ?? [
    AvailableTools.MergeTags,
    AvailableTools.FontFamily,
    AvailableTools.FontSize,
    AvailableTools.Bold,
    AvailableTools.Italic,
    AvailableTools.StrikeThrough,
    AvailableTools.Underline,
    AvailableTools.IconFontColor,
    AvailableTools.IconBgColor,
    AvailableTools.Link,
    AvailableTools.Justify,
    AvailableTools.Lists,
    AvailableTools.HorizontalRule,
    AvailableTools.RemoveFormat,
  ];

  const tools = enabledTools.flatMap((tool: (typeof enabledTools)[number]) => {
    switch (tool) {
      case AvailableTools.MergeTags:
        if (!mergeTags) return [];
        return [
          <MergeTags
            key={tool}
            execCommand={execCommand}
            getPopupContainer={getPopoverMountNode}
          />,
        ];
      case AvailableTools.FontFamily:
        return [
          <FontFamily
            key={tool}
            execCommand={execCommand}
            getPopupContainer={getPopoverMountNode}
          />,
        ];
      case AvailableTools.FontSize:
        return [
          <FontSize
            key={tool}
            execCommand={execCommand}
            getPopupContainer={getPopoverMountNode}
          />,
        ];
      case AvailableTools.Bold:
        return [
          <Bold
            key={tool}
            currentRange={selectionRange}
            onChange={() => execCommand('bold')}
          />,
        ];
      case AvailableTools.Italic:
        return [
          <Italic
            key={tool}
            currentRange={selectionRange}
            onChange={() => execCommand('italic')}
          />,
        ];
      case AvailableTools.StrikeThrough:
        return [
          <StrikeThrough
            key={tool}
            currentRange={selectionRange}
            onChange={() => execCommand('strikeThrough')}
          />,
        ];
      case AvailableTools.Underline:
        return [
          <Underline
            key={tool}
            currentRange={selectionRange}
            onChange={() => execCommand('underline')}
          />,
        ];
      case AvailableTools.IconFontColor:
        return [
          <IconFontColor
            key={tool}
            selectionRange={selectionRange}
            execCommand={execCommand}
            getPopoverMountNode={getPopoverMountNode}
          />,
        ];
      case AvailableTools.IconBgColor:
        return [
          <IconBgColor
            key={tool}
            selectionRange={selectionRange}
            execCommand={execCommand}
            getPopoverMountNode={getPopoverMountNode}
          />,
        ];
      case AvailableTools.Link:
        return [
          <Link
            key={`${tool}-link`}
            currentRange={selectionRange}
            onChange={values => execCommand('createLink', values)}
            getPopupContainer={getPopoverMountNode}
          />,
          <Unlink
            key={`${tool}-unlink`}
            currentRange={selectionRange}
            onChange={() => execCommand('')}
          />,
        ];
      case 'justify':
        return [
          <JustifyButton
            key={`${tool}-justify-left`}
            align='left'
            onChange={execCommand}
          />,
          <JustifyButton
            key={`${tool}-justify-center`}
            align='center'
            onChange={execCommand}
          />,
          <JustifyButton
            key={`${tool}-justify-right`}
            align='right'
            onChange={execCommand}
          />,
        ];
      case AvailableTools.Lists:
        return [
          <ToolItem
            key={`${tool}-ordered-list`}
            onClick={() => execCommand('insertOrderedList')}
            icon={<ListOrdered size={16} />}
            title={t`有序列表`}
          />,
          <ToolItem
            key={`${tool}-unordered-list`}
            onClick={() => execCommand('insertUnorderedList')}
            icon={<List size={16} />}
            title={t`无序列表`}
          />,
        ];
      case AvailableTools.HorizontalRule:
        return [
          <ToolItem
            key={tool}
            onClick={() => execCommand('insertHorizontalRule')}
            icon={<SeparatorHorizontal size={16} />}
            title={t`分隔线`}
          />,
        ];
      case AvailableTools.RemoveFormat:
        return [
          <ToolItem
            key={tool}
            onClick={() => execCommand('removeFormat')}
            icon={<Eraser size={16} />}
            title={t`清除格式`}
          />,
        ];
      default:
        console.error('Not existing tool', tool);
        throw new Error(`Not existing tool ${tool}`);
    }
  });

  return (
    <div
      id={RICH_TEXT_TOOL_BAR}
      style={{ display: 'flex', flexWrap: 'nowrap' }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {tools.flatMap((tool: React.ReactNode, index: number) => [
          tool,
          <div
            className='wa-email-editor-extensions-divider'
            key={`divider-${index}`}
          />,
        ])}
        {toolbar?.suffix?.(execCommand) != null && (
          <div className='wa-email-editor-extensions-toolbar-suffix'>
            {toolbar?.suffix?.(execCommand)}
          </div>
        )}
      </div>
    </div>
  );
}

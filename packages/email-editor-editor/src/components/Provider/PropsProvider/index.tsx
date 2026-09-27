import { IBlockData } from '@wa-dev/email-editor-blocks-react';
import React, { useMemo } from 'react';

export interface CollectedBlock {
  label: string;
  helpText: string;
  thumbnail: string;
  data: IBlockData;
  id: string;
}

export interface BlockGroup {
  title: string;
  blocks: Array<CollectedBlock>;
}

export enum AvailableTools {
  MergeTags = 'mergeTags',
  FontFamily = 'fontFamily',
  FontSize = 'fontSize',
  Bold = 'bold',
  Italic = 'italic',
  StrikeThrough = 'strikeThrough',
  Underline = 'underline',
  IconFontColor = 'iconFontColor',
  IconBgColor = 'iconBgColor',
  Link = 'link',
  Justify = 'justify',
  Lists = 'lists',
  HorizontalRule = 'horizontalRule',
  RemoveFormat = 'removeFormat',
}

export interface PropsProviderProps {
  children?: React.ReactNode;
  height: string;
  fontList?: { value: string; label: string }[];
  onAddCollection?: (payload: CollectedBlock) => void;
  onRemoveCollection?: (payload: { id: string }) => void;
  onUploadImage?: (data: Blob) => Promise<string>;
  interactiveStyle?: {
    hoverColor?: string;
    selectedColor?: string;
    dragoverColor?: string;
    tangentColor?: string;
  };
  autoComplete?: boolean;
  dashed?: boolean;
  socialIcons?: Array<{ content: string; image: string }>;

  mergeTagGenerate?: (m: string) => string;
  onChangeMergeTag?: (ptah: string, val: any) => any;
  renderMergeTagContent?: (props: {
    onChange: (val: string) => void;
    isSelect: boolean;
    value: string;
  }) => React.ReactNode;
  enabledMergeTagsBadge?: boolean;
  mergeTags?: Record<string, any>;
  previewInjectData?: Record<string, any>;
  onBeforePreview?: (
    html: string,
    mergeTags: PropsProviderProps['previewInjectData'] | PropsProviderProps['mergeTags'],
  ) => string | Promise<string>;
  enabledLogic?: boolean;
  locale?: 'zh-Hans' | 'zh-Hant' | 'en' | 'ja' | 'ko' | 'it' | 'tr';

  toolbar?: {
    tools?: AvailableTools[];
    /** 富文本工具栝末尾自定义内容（�?AI 按钮�?*/
    suffix?: (execCommand: (cmd: string, value?: any) => void) => React.ReactNode;
  };
  /** 块蝚焦时 Toolbar 的自定义项（�?AI 局部优化按钮），渲染在夝制/删除等按钮之�?*/
  toolbarItems?: React.ReactNode;
}

const defaultMergeTagGenerate = (m: string) => `{{${m}}}`;

export const EditorPropsContext = React.createContext<
  PropsProviderProps & {
    mergeTagGenerate: Required<PropsProviderProps['mergeTagGenerate']>;
  }
>({
  children: null,
  height: '100vh',
  fontList: [],
  onAddCollection: undefined,
  onRemoveCollection: undefined,
  onUploadImage: undefined,
  autoComplete: true,
  dashed: true,
  mergeTagGenerate: defaultMergeTagGenerate,
  enabledLogic: false,
});

export const PropsProvider: React.FC<PropsProviderProps> = props => {
  const { dashed = true, mergeTagGenerate = defaultMergeTagGenerate } = props;
  const formatProps = useMemo(() => {
    return {
      ...props,
      mergeTagGenerate,
      dashed,
    };
  }, [mergeTagGenerate, props, dashed]);

  return (
    <EditorPropsContext.Provider value={formatProps}>
      {props.children}
    </EditorPropsContext.Provider>
  );
};

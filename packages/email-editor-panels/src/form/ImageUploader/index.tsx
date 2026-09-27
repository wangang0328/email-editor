import { Spin } from '@wa-dev/email-editor-ui';
import { Dropdown, Grid, Input, Menu, Message, Modal, Popover, Tooltip, Button as ArcoButton } from '@wa-dev/email-editor-ui';
import { Braces, Eye, Trash2, AtSign } from 'lucide-react';
import { t } from '@lingui/core/macro';
import { useMemoizedFn } from 'ahooks';
import React, { useEffect, useState, useRef, useMemo } from 'react';
import styles from './index.module.scss';
import { Uploader, UploaderServer } from '@panels/utils/Uploader';
import { classnames } from '@wa-dev/email-editor-shared';
import { previewLoadImage } from '@panels/utils/previewLoadImage';
import { imageFormatSupportTip } from '@panels/utils/imageFormatTip';
import { MergeTags } from '@panels/fields';
import { useEditorProps } from '@wa-dev/email-editor-editor';
import { ImageOff } from 'lucide-react';

export interface ImageUploaderProps {
  onChange: (val: string) => void;
  value: string;
  label: React.ReactNode;
  uploadHandler?: UploaderServer;
  autoCompleteOptions?: Array<{ value: string; label: React.ReactNode; }>;
}

export function ImageUploader(props: ImageUploaderProps) {
  const { mergeTags } = useEditorProps();
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState(false);
  const [imageBroken, setImageBroken] = useState(false);
  const uploadHandlerRef = useRef<UploaderServer | null | undefined>(
    props.uploadHandler
  );

  const onChange = props.onChange;

  const onUpload = useMemoizedFn(() => {
    if (isUploading) {
      return Message.warning(t`上传中...`);
    }
    if (!uploadHandlerRef.current) return;

    const uploader = new Uploader(uploadHandlerRef.current, {
      limit: 1,
      accept: 'image/*',
    });

    uploader.on('start', (photos) => {
      setIsUploading(true);

      uploader.on('end', (data) => {
        const url = data[0]?.url;
        if (url) {
          onChange(url);
        }
        setIsUploading(false);
      });
    });

    uploader.chooseFile();
  });

  const onUploadFile = useMemoizedFn(async (file: File) => {
    if (!uploadHandlerRef.current) return;
    if (isUploading) {
      return Message.warning(t`上传中...`);
    }
    try {
      setIsUploading(true);
      const picture = await uploadHandlerRef.current(file);
      await previewLoadImage(picture);
      props.onChange(picture);
    } catch (error: any) {
      Message.error(error?.message || error || t`上传失败`);
    } finally {
      setIsUploading(false);
    }
  });

  const onPaste = useMemoizedFn(async (e: React.ClipboardEvent<HTMLInputElement>) => {
    if (!uploadHandlerRef.current) return;
    const clipboardData = e.clipboardData;

    for (let i = 0; i < clipboardData.items.length; i++) {
      const item = clipboardData.items[i];
      if (item.kind == 'file') {
        const blob = item.getAsFile();

        if (!blob || blob.size === 0) {
          return;
        }
        await onUploadFile(blob);
      }
    }
  });

  const onRemove = useMemoizedFn(() => {
    props.onChange('');
  });

  useEffect(() => {
    setImageBroken(false);
  }, [props.value]);

  const content = useMemo(() => {
    if (isUploading) {
      return (
        <div className={styles['item']}>
          <div className={classnames(styles['info'])}>
            <Spin />
            <div className={styles['btn-wrap']} />
          </div>
        </div>
      );
    }

    if (!props.value) {
      return (
        <div
          className={styles['upload']}
          role="button"
          tabIndex={0}
          onClick={onUpload}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onUpload();
            }
          }}
          onDragOver={(e) => {
            e.preventDefault();
          }}
          onDrop={(e) => {
            e.preventDefault();
            const file = e.dataTransfer.files?.[0];
            if (file) {
              onUploadFile(file);
            }
          }}
        >
          <div className={styles['upload-title']}>{t`拖拽图片到此处或点击上传`}</div>
          <div className={styles['upload-subtitle']}>{imageFormatSupportTip()}</div>
        </div>
      );
    }

    return (
      <div className={styles['item']}>
        <div className={classnames(styles['info'])}>
          {imageBroken ? (
            <div className={styles['broken']}>
              <ImageOff className={styles['brokenIcon']} />
              <div className={styles['brokenText']}>{t`图片加载失败`}</div>
            </div>
          ) : (
            <img
              src={props.value}
              onError={() => setImageBroken(true)}
            />
          )}
          <div className={styles['btn-wrap']}>
            <a title={t`预览`} onClick={() => setPreview(true)}>
              <Eye className="h-4 w-4" />
            </a>
            <a title={t`移除`} onClick={() => onRemove()}>
              <Trash2 className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    );
  }, [imageBroken, isUploading, onRemove, onUpload, onUploadFile, props.value]);

  if (!props.uploadHandler) {
    return <Input value={props.value} onChange={onChange} />;
  }

  return (
    <div className={styles.wrap}>
      <div className={styles['container']}>
        {content}
        <Grid.Row style={{ width: '100%' }} align="center">
          <div className={styles['urlLabel']}>{t`地址`}</div>
          {mergeTags && (
            <Popover
              trigger='click'
              content={<MergeTags value={props.value} onChange={onChange} />}
            >
              <ArcoButton icon={<Braces size={16} />} />
            </Popover>
          )}
          <Tooltip
            disabled={!props.value}
            content={props.value}
            position="top"
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <Input
                style={{ width: '100%' }}
                onPaste={onPaste}
                value={props.value}
                onChange={onChange}
                disabled={isUploading}
              />
            </div>
          </Tooltip>
          {props.autoCompleteOptions && (
            <Dropdown
              position="tr"
              droplist={(
                <Menu onClickMenuItem={(indexStr) => {
                  if (!props.autoCompleteOptions) return;
                  onChange(props.autoCompleteOptions[+indexStr]?.value);
                }}
                >
                  {
                    props.autoCompleteOptions.map((item, index) => {
                      return (
                        <Menu.Item style={{ display: 'flex', alignItems: 'center' }} key={index.toString()}>
                          <img src={item.value} style={{ width: 20, height: 20 }} />&emsp;<span>{item.label}</span>
                        </Menu.Item>
                      );
                    })
                  }
                </Menu>
              )}
            >
              <ArcoButton icon={<AtSign className="h-4 w-4" />} />
            </Dropdown>
          )}
        </Grid.Row>
      </div>
      <Modal
        visible={preview}
        simple
        title={t`预览`}
        footer={null}
        onCancel={() => setPreview(false)}
      >
        <img alt={t`预览`} style={{ width: '100%', display: 'block' }} src={props.value} />
      </Modal>
    </div>
  );
}

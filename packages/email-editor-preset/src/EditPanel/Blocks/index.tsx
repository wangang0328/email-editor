/**
 * Blocks panel: categorized draggable blocks.
 * Categories from ExtensionProvider (see StandardLayout defaultCategories).
 */
import { cn, Collapse, Grid, Typography } from '@wa-dev/email-editor-ui';
import { ChevronRight, ChevronUp } from 'lucide-react';
import { AdvancedType, IBlockData } from '@wa-dev/email-editor-blocks-react';
import { getBlockByType } from '../../utils/blockRegistry';
import { BlockAvatarWrapper, IconFont } from '@wa-dev/email-editor-editor';
import React, { useMemo, useState } from 'react';
import {
  getBlockTypeAccent,
  getBlockTypeIcon,
} from '@extensions/utils/getBlockTypeIcon';
import styles from './index.module.scss';
import { useExtensionProps } from '@extensions/components/Providers/ExtensionProvider';

export function Blocks() {
  const { categories } = useExtensionProps();

  const defaultActiveKey = useMemo(
    () => [
      ...categories.filter(item => item.active).map(item => item.label),
    ],
    [categories],
  );

  return (
    <div className={styles.blocksPanel}>
      <Collapse
        bordered={false}
        defaultActiveKey={defaultActiveKey}
        style={{ paddingBottom: 24, minHeight: '100%' }}
      >
        {categories.map((cat, index) => {
          if (cat.displayType === 'column') {
            return (
              <Collapse.Item key={index} name={cat.label} header={cat.label}>
                <div className={styles.layoutList}>
                  {cat.blocks.map(item => (
                    <LayoutItem
                      key={item.title}
                      title={item.title || ''}
                      columns={item.payload}
                    />
                  ))}
                </div>
              </Collapse.Item>
            );
          }

          if (cat.displayType === 'custom') {
            return (
              <Collapse.Item key={index} name={cat.label} header={cat.label}>
                <Grid.Row className='flex-wrap gap-2.5 pb-3 pt-1'>
                  {cat.blocks.map((item, i) => (
                    <React.Fragment key={i}>{item}</React.Fragment>
                  ))}
                </Grid.Row>
              </Collapse.Item>
            );
          }

          return (
            <Collapse.Item key={index} name={cat.label} header={cat.label}>
              <Grid.Row className='flex-wrap gap-2.5 pb-3 pt-1'>
                {cat.blocks.map((item, i) => (
                  <BlockItem key={i} {...(item as any)} />
                ))}
              </Grid.Row>
            </Collapse.Item>
          );
        })}
      </Collapse>
    </div>
  );
}

function BlockItem({
  type,
  payload,
  title,
}: {
  type: string;
  payload?: Partial<IBlockData>;
  title?: string;
  filterType?: string;
}) {
  const block = getBlockByType(type);
  const accent = getBlockTypeAccent(type);

  return (
    <div className={cn(styles.blockItem, 'flex-none')}>
      <BlockAvatarWrapper type={type} payload={payload}>
        <div className={styles.blockItemContainer}>
          <span
            className={styles.blockIconWell}
            style={{ backgroundColor: accent.bg, color: accent.fg }}
          >
            <IconFont icon={getBlockTypeIcon(type)} size={18} />
          </span>
          <Typography.Text className={styles.blockLabel}>
            {title || block?.name}
          </Typography.Text>
        </div>
      </BlockAvatarWrapper>
    </div>
  );
}

function LayoutItem({
  columns,
  title,
}: {
  columns: string[][];
  title: string;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className={styles.layoutItem}>
      <button
        type='button'
        className={styles.layoutItemHeader}
        onClick={() => setVisible(v => !v)}
      >
        <span>{title}</span>
        {columns.length > 1 ? (
          <span className={styles.layoutItemChevron}>
            {!visible ? (
              <ChevronRight className='h-3.5 w-3.5' />
            ) : (
              <ChevronUp className='h-3.5 w-3.5' />
            )}
          </span>
        ) : null}
      </button>
      {columns.map((item, index) => {
        const hide = !visible && index !== 0;
        const payload = {
          type: AdvancedType.SECTION,
          attributes: {},
          children: item.map(col => ({
            type: AdvancedType.COLUMN,
            attributes: {
              width: col,
            },
            data: {
              value: {},
            },
            children: [],
          })),
        };

        return (
          <div
            key={index}
            className={styles.layoutPreviewWrap}
            style={{
              height: hide ? 0 : undefined,
              overflow: 'hidden',
              marginBottom: hide ? 0 : 10,
              opacity: hide ? 0 : 1,
            }}
          >
            <BlockAvatarWrapper type={AdvancedType.SECTION} payload={payload}>
              <div className={styles.layoutPreview}>
                <div className={styles.layoutPreviewInner}>
                  {item.map((column, colIndex) => (
                    <div
                      key={colIndex}
                      className={styles.layoutPreviewCol}
                      style={{ width: column }}
                    />
                  ))}
                </div>
              </div>
            </BlockAvatarWrapper>
          </div>
        );
      })}
    </div>
  );
}

import React, { useCallback, useRef, useState } from 'react';

export interface HoverIdxState {
  hoverIdx: string;
}

export interface DragPosition {
  left: number;
  top: number;
}
export interface DataTransfer {
  type: string;
  payload?: any;
  action: 'add' | 'move';
  positionIndex?: number;
  parentIdx?: string;
  sourceIdx?: string;
}

export const HoverIdxContext = React.createContext<{
  hoverIdx: string;
  isDragging: boolean;
  setHoverIdx: React.Dispatch<React.SetStateAction<string>>;
  setIsDragging: React.Dispatch<React.SetStateAction<boolean>>;
  direction: string;
  setDirection: React.Dispatch<React.SetStateAction<string>>;
  dataTransfer: DataTransfer | null;
  setDataTransfer: React.Dispatch<React.SetStateAction<DataTransfer | null>>;
  /** dragend 时读取，与 setDataTransfer 同步更新，避免插入位置落后于一帧 */
  dataTransferRef: React.MutableRefObject<DataTransfer | null>;
}>({
  hoverIdx: '',
  direction: '',
  isDragging: false,
  dataTransfer: null,
  setHoverIdx: () => {},
  setIsDragging: () => {},
  setDirection: () => {},
  setDataTransfer: () => {},
  dataTransferRef: { current: null },
});

export const HoverIdxProvider: React.FC<{ children?: React.ReactNode }> = props => {
  const [hoverIdx, setHoverIdx] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [dataTransfer, setDataTransferState] = useState<DataTransfer | null>(null);
  const [direction, setDirection] = useState<string>('');
  const dataTransferRef = useRef<DataTransfer | null>(null);

  const setDataTransfer = useCallback(
    (value: React.SetStateAction<DataTransfer | null>) => {
      setDataTransferState((prev) => {
        const next =
          typeof value === 'function'
            ? (value as (p: DataTransfer | null) => DataTransfer | null)(prev)
            : value;
        if (
          prev &&
          next &&
          prev.parentIdx === next.parentIdx &&
          prev.positionIndex === next.positionIndex &&
          prev.sourceIdx === next.sourceIdx &&
          prev.type === next.type &&
          prev.action === next.action
        ) {
          return prev;
        }
        dataTransferRef.current = next;
        return next;
      });
    },
    [],
  );

  return (
    <HoverIdxContext.Provider
      value={{
        dataTransfer,
        setDataTransfer,
        dataTransferRef,
        hoverIdx,
        setHoverIdx,
        isDragging,
        setIsDragging,
        direction,
        setDirection,
      }}
    >
      {props.children}
    </HoverIdxContext.Provider>
  );
};

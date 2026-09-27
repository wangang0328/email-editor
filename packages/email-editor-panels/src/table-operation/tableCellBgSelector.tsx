import { Input } from '@wa-dev/email-editor-ui';
import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { useState } from 'react';

interface CellBackgroundSelectorProps {
  bgColorHandler: (color: string) => void;
  rootDom: Element;
}

const CellBackgroundSelector: React.FC<CellBackgroundSelectorProps> = ({
  bgColorHandler,
  rootDom,
}) => {
  const [color, setColor] = useState('#ffffff');

  useEffect(() => {
    if (!rootDom) {
      return;
    }
    const observer = new ResizeObserver(e => {
      setColor('#ffffff');
    });
    observer.observe(rootDom);
    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div
      onClick={e => e.stopPropagation()}
      className='easy-email-table-operation-menu-bg-item'
    >
      <div>Set Background Color</div>
      <div>
        <div className='easy-email-table-operation-menu-bg-item-color'>
          <div style={{ backgroundColor: color }}></div>
          <input
            type='color'
            value={color}
            onChange={e => setColor(e.target.value)}
          />
        </div>
        <Input.Search
          height={28}
          searchButton='Set'
          onSearch={() => bgColorHandler(color)}
          value={color}
          onKeyDown={e => e.stopPropagation()}
          onChange={e => setColor(e)}
        />
      </div>
    </div>
  );
};

const getCellBackgroundSelectorRoot = (
  bgColorHandler: CellBackgroundSelectorProps['bgColorHandler'],
  rootDom: any,
) => {
  const node = document.createElement('div');

  createRoot(node).render(
    <CellBackgroundSelector
      bgColorHandler={bgColorHandler}
      rootDom={rootDom}
    />,
  );
  return node;
};

export default getCellBackgroundSelectorRoot;

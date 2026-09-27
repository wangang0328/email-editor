import { AdvancedType, BasicType } from '@wa-dev/email-editor-blocks-react';
import {
  DATA_CONTENT_EDITABLE_IDX,
  DATA_CONTENT_FIELD,
  DATA_EE_BLOCK_UID,
} from '@/constants';
import {
  markBlockContentEditable,
  markStandardContentEditable,
} from '../contentEditableMarkers';

describe('contentEditableMarkers uid fields', () => {
  it('injects data-ee-block-uid + data-content-field for text', () => {
    const root = document.createElement('div');
    root.setAttribute('data-ee-uid', 'txt-1');
    root.classList.add('email-block', 'node-type-text');
    markStandardContentEditable(root, BasicType.TEXT, 'content.children.[0]');
    root.innerHTML = '<div>hello</div>';
    markBlockContentEditable(root);

    const edit = root.querySelector('[contenteditable="true"]') as HTMLElement;
    expect(edit.getAttribute(DATA_EE_BLOCK_UID)).toBe('txt-1');
    expect(edit.getAttribute(DATA_CONTENT_FIELD)).toBe('data.value.content');
    expect(edit.getAttribute(DATA_CONTENT_EDITABLE_IDX)).toContain(
      'data.value.content',
    );
  });

  it('injects uid + field for navbar links', () => {
    const root = document.createElement('div');
    root.setAttribute('data-ee-uid', 'nav-1');
    root.classList.add('email-block', 'node-type-navbar');
    root.innerHTML =
      '<a class="mj-link" href="#">Home</a><a class="mj-link" href="#">About</a>';
    markStandardContentEditable(root, BasicType.NAVBAR, 'content.children.[0]');
    markBlockContentEditable(root);

    const links = root.querySelectorAll('.mj-link');
    expect(links[0].getAttribute(DATA_EE_BLOCK_UID)).toBe('nav-1');
    expect(links[0].getAttribute(DATA_CONTENT_FIELD)).toBe(
      'data.value.links.0.content',
    );
    expect(links[1].getAttribute(DATA_CONTENT_FIELD)).toBe(
      'data.value.links.1.content',
    );
    expect(links[0].getAttribute(DATA_CONTENT_EDITABLE_IDX)).toBe(
      'content.children.[0].data.value.links.0.content',
    );
  });

  it('injects uid + field for table cells', () => {
    const root = document.createElement('div');
    root.setAttribute('data-ee-uid', 'tbl-1');
    root.classList.add('email-block', 'node-type-advanced_table');
    markStandardContentEditable(
      root,
      AdvancedType.TABLE,
      'content.children.[0]',
    );
    root.innerHTML = `
      <table><tbody>
        <tr><td>a</td><td>b</td></tr>
      </tbody></table>
    `;
    markBlockContentEditable(root);

    const cells = root.querySelectorAll('td');
    expect(cells[0].getAttribute(DATA_EE_BLOCK_UID)).toBe('tbl-1');
    expect(cells[0].getAttribute(DATA_CONTENT_FIELD)).toBe(
      'data.value.tableSource.0.0.content',
    );
    expect(cells[1].getAttribute(DATA_CONTENT_FIELD)).toBe(
      'data.value.tableSource.0.1.content',
    );
  });
});

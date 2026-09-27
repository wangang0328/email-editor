import {
  shouldPreserveInlineTextDom,
  suppressInlineTextPreserve,
} from '../richTextChrome';

describe('shouldPreserveInlineTextDom', () => {
  let host: HTMLElement;
  let editable: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML = '';
    host = document.createElement('div');
    host.id = 'VisualEditorEditMode';
    document.body.appendChild(host);

    const shadow = host.attachShadow({ mode: 'open' });
    editable = document.createElement('div');
    editable.setAttribute('contenteditable', 'true');
    editable.textContent = 'hello';
    shadow.appendChild(editable);

    // 清掉上一用例可能残留的 suppress 窗口
    suppressInlineTextPreserve(0);
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('returns true when contenteditable is focused inside open shadow (doc active = host)', () => {
    editable.focus();

    expect(document.activeElement).toBe(host);
    expect(host.shadowRoot?.activeElement).toBe(editable);
    expect(shouldPreserveInlineTextDom()).toBe(true);
  });

  it('returns false when shadow has no contenteditable focus', () => {
    host.focus?.();
    expect(shouldPreserveInlineTextDom()).toBe(false);
  });

  it('returns false while suppress window is active', () => {
    editable.focus();
    suppressInlineTextPreserve(500);
    expect(shouldPreserveInlineTextDom()).toBe(false);
  });
});

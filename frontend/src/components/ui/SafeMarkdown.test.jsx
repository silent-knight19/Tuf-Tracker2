/**
 * S9 — sanitization policy tests (vitest, node env, no DOM needed:
 * renderToString exercises the full remark → rehype-sanitize → React pipe).
 *
 * Corpus: stored/DOM XSS shapes, javascript:/data:/vbscript: URLs, SVG,
 * iframes, event handlers — all must render inert. Legit Markdown
 * (bold/links/code/tables) must survive.
 */
import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import React from 'react';
import SafeMarkdown, { isSafeHttpUrl } from './SafeMarkdown.jsx';

const render = (md, props = {}) =>
  renderToString(React.createElement(SafeMarkdown, props, md));

describe('S9 isSafeHttpUrl gate', () => {
  it.each([
    ['https://leetcode.com/problems/two-sum', true],
    ['http://localhost:5001/x', true],
    ['  https://example.com/a?b=c  ', true],
    ['javascript:alert(1)', false],
    ['JaVaScRiPt:alert(1)', false],
    ['data:text/html,<script>alert(1)</script>', false],
    ['vbscript:msgbox(1)', false],
    ['//evil.com/x', false],
    ['/relative/path', false],
    ['https://', false],
    ['', false],
    [null, false],
    [undefined, false],
    [123, false],
  ])('isSafeHttpUrl(%p) === %p', (input, expected) => {
    expect(isSafeHttpUrl(input)).toBe(expected);
  });
});

describe('S9 XSS corpus renders inert', () => {
  const cases = [
    ['script tag', '<script>alert(1)</script>'],
    ['svg onload', '<svg onload=alert(1)>'],
    ['img onerror', '<img src=x onerror=alert(1)>'],
    ['iframe', '<iframe src="https://evil.test"></iframe>'],
    ['javascript href (markdown)', '[click](javascript:alert(1))'],
    ['javascript href (case)', '[click](JaVaScRiPt:alert(1))'],
    ['data href', '[click](data:text/html;base64,PHNjcmlwdA==)'],
    ['event handler div', '<div onclick="alert(1)">hi</div>'],
    ['style attr', '<p style="color:expression(alert(1))">hi</p>'],
    ['form', '<form action="https://evil.test"><input type="text"></form>'],
    ['vbscript', '[x](vbscript:msgbox(1))'],
  ];
  it.each(cases)('%s is neutralized', (_name, md) => {
    const html = render(md);
    expect(html).not.toMatch(/<script/i);
    expect(html).not.toMatch(/<iframe/i);
    expect(html).not.toMatch(/<svg/i);
    expect(html).not.toMatch(/javascript:/i);
    expect(html).not.toMatch(/data:text\/html/i);
    expect(html).not.toMatch(/onerror|onload|onclick/i);
    expect(html).not.toMatch(/<form/i);
  });

  it('keeps text content (no silent drops of the message)', () => {
    expect(render('hello <script>alert(1)</script> world')).toContain('hello');
    expect(render('hello <script>alert(1)</script> world')).toContain('world');
    expect(render('[click](javascript:alert(1))')).toContain('click');
  });
});

describe('S9 legitimate Markdown survives', () => {
  it('bold, code, tables, lists', () => {
    const html = render('**bold** and `code`\n\n- a\n- b\n\n| h |\n|---|\n| v |');
    expect(html).toContain('<strong>');
    expect(html).toContain('<code>');
    expect(html).toContain('<table>');
  });

  it('http(s) links keep working, forced safe target', () => {
    const html = render('[lc](https://leetcode.com/problems/two-sum)');
    expect(html).toContain('href="https://leetcode.com/problems/two-sum"');
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');
  });

  it('http(s) images render, others vanish', () => {
    expect(render('![a](https://example.com/x.png)')).toContain('<img');
    expect(render('![a](data:image/png;base64,AAA)')).not.toContain('<img');
  });

  it('caller components merge, but a/img stay locked', () => {
    const html = render('**x** [y](https://example.com)', {
      components: {
        strong: ({ children }) => React.createElement('b', { className: 'kept' }, children),
        a: () => React.createElement('a', { href: 'https://evil.test' }, 'hijack'),
      },
    });
    expect(html).toContain('<b class="kept">');
    expect(html).not.toContain('evil.test');
  });

  it('non-string children render empty (never crash, never object-dump)', () => {
    expect(render(null)).not.toContain('null');
    expect(render(undefined)).not.toContain('undefined');
  });
});

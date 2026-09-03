/**
 * S9 — the ONLY sanctioned Markdown renderer. All user/AI/hostile content
 * (problem text, notes, AI output, quotes, test cases, error strings) must
 * flow through SafeMarkdown — never raw ReactMarkdown, never
 * dangerouslySetInnerHTML.
 *
 * Layers: remark-gfm parse → rehype-sanitize (http(s)-only hrefs, no input/
 * script/iframe/svg, no event handlers, no style attrs) → forced SafeLink /
 * SafeImage components (callers cannot override `a`/`img`: security wins).
 */
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';

export const sanitizeSchema = {
  ...defaultSchema,
  tagNames: (defaultSchema.tagNames || []).filter((t) => t !== 'input'),
  protocols: { ...(defaultSchema.protocols || {}), href: ['http', 'https'] },
};

/** Absolute http(s) URLs only. Everything else (javascript:, data:, //x, relative) is unsafe here. */
export function isSafeHttpUrl(value) {
  if (typeof value !== 'string') return false;
  const s = value.trim();
  if (!/^https?:\/\//i.test(s)) return false;
  try {
    const u = new URL(s);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

function SafeLink({ href, children }) {
  if (!isSafeHttpUrl(href)) {
    // Unsafe scheme — render inert text, never a clickable attack vector.
    return <span>{children}</span>;
  }
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
}

function SafeImage({ src, alt }) {
  if (!isSafeHttpUrl(src)) return null;
  return <img src={src} alt={typeof alt === 'string' ? alt : ''} loading="lazy" />;
}

export default function SafeMarkdown({
  children,
  components = {},
  remarkPlugins,
  rehypePlugins = [],
  ...rest
}) {
  return (
    <ReactMarkdown
      remarkPlugins={remarkPlugins || [remarkGfm]}
      rehypePlugins={[[rehypeSanitize, sanitizeSchema], ...rehypePlugins]}
      components={{ ...components, a: SafeLink, img: SafeImage }}
      {...rest}
    >
      {typeof children === 'string' ? children : ''}
    </ReactMarkdown>
  );
}

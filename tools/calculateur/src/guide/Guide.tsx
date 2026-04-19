import { useEffect, useMemo, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { GUIDE_SECTIONS, resolveGuideSlug, type GuideEntry } from './content';
import { rehypeItemIcons } from './rehype-item-icons';

const ALL_ENTRIES: GuideEntry[] = GUIDE_SECTIONS.flatMap((s) => s.entries);

export function Guide() {
  const [slug, setSlug] = useState<string>('readme');
  const [query, setQuery] = useState('');
  const articleRef = useRef<HTMLElement>(null);

  const current = useMemo(
    () => ALL_ENTRIES.find((e) => e.slug === slug) ?? ALL_ENTRIES[0],
    [slug],
  );

  // Scroll en haut quand on change de page
  useEffect(() => {
    articleRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [slug]);

  const filteredSections = useMemo(() => {
    if (!query.trim()) return GUIDE_SECTIONS;
    const q = query.toLowerCase();
    return GUIDE_SECTIONS.map((s) => ({
      ...s,
      entries: s.entries.filter(
        (e) =>
          e.title.toLowerCase().includes(q) || e.content.toLowerCase().includes(q),
      ),
    })).filter((s) => s.entries.length > 0);
  }, [query]);

  return (
    <div className="grid md:grid-cols-[260px_1fr] gap-6">
      <aside className="card h-fit sticky top-4">
        <input
          type="search"
          placeholder="Rechercher…"
          className="input mb-3 text-sm"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {filteredSections.map((section) => (
          <div key={section.title} className="mb-3">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              {section.icon} {section.title}
            </div>
            <ul className="space-y-0.5">
              {section.entries.map((entry) => (
                <li key={entry.slug}>
                  <button
                    type="button"
                    onClick={() => setSlug(entry.slug)}
                    className={`w-full text-left text-sm px-2 py-1 rounded transition-colors ${
                      slug === entry.slug
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-amber-200'
                    }`}
                  >
                    {entry.title}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
        {filteredSections.length === 0 && (
          <div className="text-sm text-slate-500">Aucun résultat.</div>
        )}
      </aside>

      <article ref={articleRef} className="card markdown">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeItemIcons]}
          components={{
            a: ({ href, children, ...props }) => {
              const target = resolveGuideSlug(href);
              if (target) {
                return (
                  <a
                    href={`#${target}`}
                    onClick={(e) => {
                      e.preventDefault();
                      setSlug(target);
                    }}
                    {...props}
                  >
                    {children}
                  </a>
                );
              }
              return (
                <a href={href} target="_blank" rel="noreferrer" {...props}>
                  {children}
                </a>
              );
            },
          }}
        >
          {current.content}
        </ReactMarkdown>
      </article>
    </div>
  );
}

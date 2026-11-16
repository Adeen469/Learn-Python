"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Search, X } from "lucide-react";
import { LEARN_SECTIONS } from "@/lib/learn/sidebar";

/**
 * The Learn sidebar — the W3Schools-style topic menu. Sections with
 * collapsible groups; the group holding the current topic opens by
 * itself. Same muted look as the rest of the app.
 */
export function LearnSidebar({
  activeSlug,
  mobileOpen,
  onCloseMobile,
}: {
  activeSlug: string;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}) {
  const [query, setQuery] = useState("");
  const [openGroups, setOpenGroups] = useState<Set<string>>(() => new Set());

  // Open the group that holds the current topic.
  useEffect(() => {
    for (const section of LEARN_SECTIONS) {
      for (const group of section.groups) {
        if (group.topics.some((t) => t.slug === activeSlug)) {
          setOpenGroups((prev) => {
            if (prev.has(group.title)) return prev;
            const next = new Set(prev);
            next.add(group.title);
            return next;
          });
        }
      }
    }
  }, [activeSlug]);

  function toggleGroup(title: string) {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(title)) next.delete(title);
      else next.add(title);
      return next;
    });
  }

  const q = query.trim().toLowerCase();
  const searchResults = useMemo(() => {
    if (!q) return null;
    return LEARN_SECTIONS.flatMap((section) =>
      section.groups.flatMap((group) =>
        group.topics
          .filter((t) => t.title.toLowerCase().includes(q))
          .map((t) => ({ ...t, sectionTitle: section.title }))
      )
    ).slice(0, 40);
  }, [q]);

  const body = (
    <div className="flex h-full flex-col">
      <div className="p-3 pb-2">
        <label className="relative block">
          <span className="sr-only">Search topics</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search topics…"
            className="w-full rounded-lg border border-neutral-800 bg-neutral-950 py-2 pl-9 pr-3 text-sm text-white placeholder:text-neutral-600 outline-none transition focus:border-neutral-600"
          />
        </label>
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto px-3 pb-6">
        {searchResults ? (
          searchResults.length === 0 ? (
            <p className="px-2 py-4 text-sm text-neutral-500">
              No topics match “{query}”.
            </p>
          ) : (
            <ul className="space-y-0.5">
              {searchResults.map((t) => (
                <li key={t.slug}>
                  <Link
                    href={`/learn/${t.slug}`}
                    onClick={onCloseMobile}
                    className={`block rounded-lg px-3 py-1.5 text-sm transition ${
                      t.slug === activeSlug
                        ? "bg-white font-medium text-black"
                        : "text-neutral-300 hover:bg-neutral-900 hover:text-white"
                    }`}
                  >
                    {t.title}
                    <span className="block text-[11px] font-normal text-neutral-500">
                      {t.sectionTitle}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )
        ) : (
          LEARN_SECTIONS.map((section) => (
            <div key={section.id} className="mt-4 first:mt-1">
              <p className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                {section.title}
              </p>
              {section.groups.map((group) => {
                const isOpen = openGroups.has(group.title);
                const isSingle = group.topics.length === 1;
                const topic = group.topics[0];
                if (isSingle && topic) {
                  return (
                    <Link
                      key={group.title}
                      href={`/learn/${topic.slug}`}
                      onClick={onCloseMobile}
                      className={`block rounded-lg px-3 py-1.5 text-sm transition ${
                        topic.slug === activeSlug
                          ? "bg-white font-medium text-black"
                          : "text-neutral-300 hover:bg-neutral-900 hover:text-white"
                      }`}
                    >
                      {topic.title}
                    </Link>
                  );
                }
                return (
                  <div key={group.title}>
                    <button
                      type="button"
                      onClick={() => toggleGroup(group.title)}
                      aria-expanded={isOpen}
                      className="flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-left text-sm font-medium text-neutral-200 transition hover:bg-neutral-900 hover:text-white"
                    >
                      <span className="min-w-0 truncate">{group.title}</span>
                      <ChevronDown
                        className={`h-4 w-4 shrink-0 text-neutral-500 transition-transform duration-300 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    <div
                      className="grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
                      style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                    >
                      <div className="overflow-hidden">
                        <ul className="space-y-0.5 py-0.5 pl-3">
                          {group.topics.map((t) => (
                            <li key={t.slug}>
                              <Link
                                href={`/learn/${t.slug}`}
                                onClick={onCloseMobile}
                                className={`block rounded-lg px-3 py-1.5 text-sm transition ${
                                  t.slug === activeSlug
                                    ? "bg-white font-medium text-black"
                                    : "text-neutral-400 hover:bg-neutral-900 hover:text-white"
                                }`}
                              >
                                {t.title}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
      </nav>
    </div>
  );

  return (
    <>
      {/* Desktop: fixed-width column. */}
      <aside className="sticky top-[57px] hidden h-[calc(100vh-57px)] w-72 shrink-0 border-r border-neutral-800 bg-black md:block">
        {body}
      </aside>

      {/* Mobile: drawer. */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Close topics"
            onClick={onCloseMobile}
            className="absolute inset-0 bg-black/70"
          />
          <aside className="absolute bottom-0 left-0 top-0 w-80 max-w-[85vw] border-r border-neutral-800 bg-black">
            <div className="flex items-center justify-between border-b border-neutral-800 px-3 py-2.5">
              <span className="text-sm font-semibold text-white">Python Tutorial</span>
              <button
                type="button"
                onClick={onCloseMobile}
                aria-label="Close"
                className="rounded-lg p-1.5 text-neutral-400 transition hover:bg-neutral-900 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="h-[calc(100%-49px)]">{body}</div>
          </aside>
        </div>
      )}
    </>
  );
}

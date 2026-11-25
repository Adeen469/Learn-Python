// Extensions catalog — the third Explorer tab. One card per built-in
// viewer extension: name, one-line description, the formats it handles
// and an Install button that becomes Installed (with an Uninstall
// option) once installed. Install state is per-browser localStorage;
// installing or uninstalling updates the catalog and the editor pane
// immediately (the viewer hook listens for the change event).
import type { Strings } from "@/lib/i18n";
import { Check, FileText, Film, Image, Music, Puzzle, Table2 } from "lucide-react";
import { EDITOR_EXTENSIONS, type ExtensionKind } from "../lib/editor-extensions";
import { useInstalledExtensions } from "../hooks/useExtensions";

const KIND_ICONS: Record<ExtensionKind, typeof FileText> = {
  pdf: FileText,
  excel: Table2,
  word: FileText,
  image: Image,
  video: Film,
  audio: Music,
};

export function ExtensionsPanel({ t }: { t: Strings }) {
  const { installed, setExtensionInstalled } = useInstalledExtensions();
  return (
    <div className="flex-1 overflow-auto p-2">
      <p className="flex items-center gap-1.5 px-1 pb-2 text-[10px] font-mono tracking-wider text-neutral-600 uppercase">
        <Puzzle className="h-3.5 w-3.5" /> {t.editorPage.extensionsTab}
      </p>
      <div className="space-y-2">
        {EDITOR_EXTENSIONS.map((ext) => {
          const isInstalled = installed.includes(ext.id);
          const Icon = KIND_ICONS[ext.kind];
          return (
            <div key={ext.id} className="rounded-lg border border-neutral-800 bg-neutral-950 p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex min-w-0 items-start gap-2">
                  <Icon className="mt-0.5 h-4 w-4 shrink-0 text-neutral-300" aria-hidden="true" />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-white">{ext.name}</p>
                    <p className="mt-0.5 text-[11px] leading-snug text-neutral-400">{ext.description}</p>
                  </div>
                </div>
                {isInstalled ? (
                  <span className="flex shrink-0 items-center gap-1 rounded-md bg-white px-2 py-1 text-[11px] font-medium text-black">
                    <Check className="h-3 w-3" /> {t.editorPage.extensionInstalled}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setExtensionInstalled(ext.id, true)}
                    className="shrink-0 rounded-md border border-neutral-700 px-2.5 py-1 text-[11px] font-medium text-white hover:bg-neutral-800"
                  >
                    {t.editorPage.extensionInstall}
                  </button>
                )}
              </div>
              <p className="mt-2 flex flex-wrap gap-1">
                {ext.formats.map((f) => (
                  <span key={f} className="rounded bg-neutral-900 px-1.5 py-0.5 font-mono text-[10px] text-neutral-400">
                    .{f}
                  </span>
                ))}
              </p>
              {isInstalled && (
                <button
                  type="button"
                  onClick={() => setExtensionInstalled(ext.id, false)}
                  className="mt-2 text-[11px] text-neutral-500 underline hover:text-white"
                >
                  {t.editorPage.extensionUninstall}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

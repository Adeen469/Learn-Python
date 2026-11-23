import type { Strings } from "@/lib/i18n";
import type { Dispatch, SetStateAction } from "react";

export type PushDialogProps = {
  t: Strings;
  openRepoState: { repo: string; branch: string };
  setPushDialogOpen: Dispatch<SetStateAction<boolean>>;
  pushDialogFiles: { ready: string[]; skipped: string[] };
  commitMessage: string;
  setCommitMessage: Dispatch<SetStateAction<string>>;
  messageEditedRef: { current: boolean };
  generatingMessage: boolean;
  confirmPush: () => Promise<void>;
  pushing: boolean;
};

export function PushDialog(props: PushDialogProps) {
  const { t, openRepoState, setPushDialogOpen, pushDialogFiles, commitMessage, setCommitMessage, messageEditedRef, generatingMessage, confirmPush, pushing } = props;

  return (

    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={() => setPushDialogOpen(false)}
    >
      <div
        className="w-full max-w-lg rounded-xl border border-neutral-800 bg-neutral-950 p-4 shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-label={t.editorPage.pushDialogTitle}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-sm font-semibold text-white">{t.editorPage.pushDialogTitle}</h2>
        <p className="mt-1 text-xs text-neutral-400">
          {t.editorPage.pushDialogSummary(pushDialogFiles.ready.length, pushDialogFiles.skipped.length, openRepoState.repo)}
        </p>
        <ul className="mt-2 max-h-32 space-y-0.5 overflow-y-auto rounded-md border border-neutral-800 bg-neutral-900 px-2.5 py-2 font-mono text-xs text-neutral-300">
          {pushDialogFiles.ready.map((p) => (
            <li key={p}>{p}</li>
          ))}
          {pushDialogFiles.skipped.map((p) => (
            <li key={p} className="text-neutral-600">
              {p} — skipped
            </li>
          ))}
        </ul>
        <label
          htmlFor="push-commit-message"
          className="mt-3 block text-xs font-medium text-neutral-300"
        >
          {t.editorPage.pushCommitMessageLabel}
        </label>
        <textarea
          id="push-commit-message"
          value={commitMessage}
          onChange={(e) => {
            messageEditedRef.current = true;
            setCommitMessage(e.target.value);
          }}
          rows={2}
          className="mt-1 w-full rounded-md border border-neutral-700 bg-neutral-900 px-2.5 py-2 text-sm text-white outline-none focus:border-neutral-500"
        />
        {generatingMessage && (
          <p className="mt-1 text-xs text-neutral-500">{t.editorPage.pushGeneratingMessage}</p>
        )}
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setPushDialogOpen(false)}
            className="rounded-md px-3 py-1.5 text-xs font-medium text-neutral-300 hover:bg-neutral-800 hover:text-white"
          >
            {t.common.cancel}
          </button>
          <button
            type="button"
            onClick={() => void confirmPush()}
            disabled={pushing}
            className="rounded-md bg-white px-3 py-1.5 text-xs font-medium text-black hover:bg-neutral-200 disabled:text-neutral-600"
          >
            {t.editorPage.pushButton}
          </button>
        </div>
      </div>
    </div>

  );
}

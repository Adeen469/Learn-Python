// Workspace item — one file or folder in the editor's workspace.
// Moved verbatim from web/src/app/editor/page.tsx (editor split).
export interface WorkspaceItem {
  id: string;
  name: string;
  path: string; // e.g. "main.py" or "utils/math_helpers.py"
  type: "file" | "folder";
  content?: string;
  isSaved?: boolean;
  // Repo files opened from the GitHub page load lazily: the tree
  // arrives first (content empty, lazy set), the content is fetched
  // when the file is opened, using its blob sha.
  lazy?: boolean;
  sha?: string;
  // Dropped binary file (PDF/image/video/...): a blob: object URL
  // for the raw bytes, so the viewer renders them without the
  // bytes ever being text-decoded (file.text() corrupts binary).
  // Session-only — blob: URLs die on reload, so the workspace
  // loader strips them when restoring from storage.
  blobUrl?: string;
}

export type AiChatMessage = { role: "user" | "ai"; text: string };

export type AiChat = { id: string; title: string; createdAt: number; messages: AiChatMessage[] };

export type AiPanelView = "chat" | "history";

/** Centre column view: the editor, or the AI Settings card in the
    editor's place (not movable — it replaces the editor until the
    user goes back). */
export type CentreView = "editor" | "ai-settings";

export type PanelZone = "left" | "right" | "bottom";

export type PanelId = "explorer" | "terminal" | "ai";

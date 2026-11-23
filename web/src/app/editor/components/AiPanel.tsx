import type { Strings } from "@/lib/i18n";
import type { Dispatch, SetStateAction } from "react";
import { ArrowLeft, Trash2 } from "lucide-react";
import type { AiChat, AiPanelView } from "../lib/editor-types";

export type AiHistoryViewProps = {
  t: Strings;
  aiChats: AiChat[];
  setAiView: Dispatch<SetStateAction<AiPanelView>>;
  startNewChat: () => void;
  loadAiChat: (chat: AiChat) => void;
  deleteAiChat: (id: string) => void;
};

export function AiHistoryView(props: AiHistoryViewProps) {
  const { t, aiChats, setAiView, startNewChat, loadAiChat, deleteAiChat } = props;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setAiView("chat")}
          aria-label={t.editorPage.aiBackToChat}
          title={t.editorPage.aiBackToChat}
          className="shrink-0 rounded p-1 text-neutral-400 hover:bg-neutral-800 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <span className="flex-1 text-sm font-semibold text-neutral-200">
          {t.editorPage.aiHistoryTitle}
        </span>
        <button
          type="button"
          onClick={startNewChat}
          className="shrink-0 rounded-md bg-neutral-800 px-2 py-1 text-xs font-medium text-neutral-200 hover:bg-neutral-700 transition"
        >
          {t.editorPage.aiNewChat}
        </button>
      </div>
      {aiChats.length === 0 ? (
        <p className="text-xs text-neutral-500">{t.editorPage.aiHistoryEmpty}</p>
      ) : (
        aiChats.map((chat) => (
          <div
            key={chat.id}
            className="flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2"
          >
            <button
              type="button"
              onClick={() => loadAiChat(chat)}
              className="min-w-0 flex-1 text-left"
            >
              <span className="block truncate text-sm text-neutral-100">{chat.title}</span>
              <span className="block text-[11px] text-neutral-500">
                {new Date(chat.createdAt).toLocaleDateString()}
              </span>
            </button>
            <button
              type="button"
              onClick={() => deleteAiChat(chat.id)}
              aria-label={t.editorPage.menuDelete}
              title={t.editorPage.menuDelete}
              className="shrink-0 rounded p-1 text-neutral-500 hover:bg-neutral-800 hover:text-red-300"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))
      )}
    </div>
  );
}

import { Code2, History, MoreVertical, Settings, Sparkles } from "lucide-react";
import { EditorPanelHeader } from "@/components/EditorPanelHeader";
import PromptBar, { type PromptBarModel } from "@/components/PromptBar";
import ThoughtLine from "@/components/ThoughtLine";
import { HighlightedMarkdown } from "@/lib/highlight";
import type { AiChatMessage, CentreView, PanelId, PanelZone, WorkspaceItem } from "../lib/editor-types";

export type AiPanelProps = {
  t: Strings;
  aiView: AiPanelView;
  aiMessages: AiChatMessage[];
  aiThinking: boolean;
  aiThoughtSeconds: number | null;
  setAiThoughtSeconds: Dispatch<SetStateAction<number | null>>;
  aiError: string | null;
  aiMenuOpen: boolean;
  setAiMenuOpen: Dispatch<SetStateAction<boolean>>;
  activeFile: WorkspaceItem | undefined;
  sendAiMessage: (text: string, opts: { model: PromptBarModel | undefined; effort: string }) => Promise<void>;
  stopAi: () => void;
  clearAiChat: () => void;
  setAiView: Dispatch<SetStateAction<AiPanelView>>;
  setCentreView: Dispatch<SetStateAction<CentreView>>;
  setSettingsSection: Dispatch<SetStateAction<"menu" | "skills" | "models" | "byok">>;
  setSettingsTabOpen: Dispatch<SetStateAction<boolean>>;
  setPanelVisible: (id: PanelId, v: boolean) => void;
  setDraggingPanel: Dispatch<SetStateAction<PanelId | null>>;
  setDropZone: Dispatch<SetStateAction<PanelZone | null>>;
  AI_PANEL_MODELS: PromptBarModel[];
  aiChats: AiChat[];
  startNewChat: () => void;
  loadAiChat: (chat: AiChat) => void;
  deleteAiChat: (id: string) => void;
  defaultModel: string;
};

export function AiPanel(props: AiPanelProps) {
  const { t, aiView, aiMessages, aiThinking, aiThoughtSeconds, setAiThoughtSeconds, aiError, aiMenuOpen, setAiMenuOpen, activeFile, sendAiMessage, stopAi, clearAiChat, setAiView, setCentreView, setSettingsSection, setSettingsTabOpen, setPanelVisible, setDraggingPanel, setDropZone, AI_PANEL_MODELS, aiChats, startNewChat, loadAiChat, deleteAiChat, defaultModel } = props;

  return (
    <div className="w-full flex-1 min-h-0 rounded-xl border border-neutral-800 bg-neutral-950 flex flex-col overflow-hidden">
      <EditorPanelHeader
        id="ai"
        title={
          <>
            <Sparkles className="h-4 w-4 text-neutral-400" />
            <span>{t.editorPage.aiPanelTitle}</span>
          </>
        }
        actions={
          <>
            <button
              type="button"
              onClick={clearAiChat}
              title={t.editorPage.aiClearChat}
              className="shrink-0 rounded-md px-2 py-1 text-xs font-medium text-neutral-400 hover:bg-neutral-800 hover:text-white transition"
            >
              {t.editorPage.aiClearChat}
            </button>
            <div className="relative shrink-0">
              <button
                type="button"
                draggable={false}
                onClick={() => setAiMenuOpen((o) => !o)}
                aria-label={t.editorPage.aiMenuOptions}
                title={t.editorPage.aiMenuOptions}
                className="rounded p-1 text-neutral-400 hover:bg-neutral-800 hover:text-white"
              >
                <MoreVertical className="h-4 w-4" />
              </button>
              {aiMenuOpen ? (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setAiMenuOpen(false)}
                  />
                  <div className="absolute right-0 top-full z-40 mt-1 w-44 overflow-hidden rounded-lg border border-neutral-700 bg-neutral-900 shadow-xl">
                    <button
                      type="button"
                      onClick={() => {
                        setAiView("history");
                        setAiMenuOpen(false);
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-neutral-200 hover:bg-neutral-800"
                    >
                      <History className="h-3.5 w-3.5 text-neutral-400" />
                      {t.editorPage.aiMenuHistory}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCentreView("ai-settings");
                        setSettingsSection("menu");
                        setSettingsTabOpen(true);
                        setAiMenuOpen(false);
                      }}
                      className="flex w-full items-center gap-2 border-t border-neutral-800 px-3 py-2 text-left text-sm text-neutral-200 hover:bg-neutral-800"
                    >
                      <Settings className="h-3.5 w-3.5 text-neutral-400" />
                      {t.editorPage.aiMenuSettings}
                    </button>
                  </div>
                </>
              ) : null}
            </div>
          </>
        }
        onDragStart={setDraggingPanel}
        onDragEnd={() => {
          setDraggingPanel(null);
          setDropZone(null);
        }}
        onClose={() => setPanelVisible("ai", false)}
        closeLabel={t.editorPage.aiClosePanel}
      />
      <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-3">
        {aiView === "history" ? (
          <AiHistoryView t={t} aiChats={aiChats} setAiView={setAiView} startNewChat={startNewChat} loadAiChat={loadAiChat} deleteAiChat={deleteAiChat} />
        ) : (
          <>
        {aiMessages.length === 0 && !aiThinking && aiThoughtSeconds === null ? (
          <div className="flex min-h-full flex-col justify-center space-y-2">
            <p className="text-sm text-neutral-300">{t.editorPage.aiWelcome}</p>
            <p className="text-xs text-neutral-500">{t.editorPage.aiGuideNote}</p>
          </div>
        ) : null}
        {aiMessages.map((m, i) =>
          m.role === "user" ? (
            <div key={i} className="flex justify-end">
              <div className="max-w-[85%] rounded-xl rounded-br-sm bg-neutral-800 px-3 py-2 text-sm text-neutral-100 whitespace-pre-wrap break-words">
                {m.text}
              </div>
            </div>
          ) : (
            <div key={i} className="rounded-xl bg-neutral-900 px-3 py-2 text-sm text-neutral-200">
              <HighlightedMarkdown text={m.text} />
            </div>
          ),
        )}
        {aiThinking || aiThoughtSeconds !== null || aiMessages.length > 0 ? (
          <ThoughtLine
            working={aiThinking}
            label={t.editorPage.aiThinkingLabel}
            steps={[
              t.editorPage.aiStepReading,
              t.editorPage.aiStepThinking,
              t.editorPage.aiStepDrafting,
            ]}
            fontSize={13}
            defaultOpen={false}
            onSettle={(seconds) => setAiThoughtSeconds(seconds)}
          />
        ) : null}
        {aiError ? <p className="text-xs text-red-400">{aiError}</p> : null}
          </>
        )}
      </div>
      {aiView === "chat" ? (
      <div className="shrink-0 border-t border-neutral-800 p-2">
        <PromptBar
          placeholder={t.editorPage.aiPlaceholder}
          sources={[
            {
              key: "files",
              name: "Current file",
              description: activeFile ? activeFile.path : "No file open",
              icon: <Code2 className="h-4 w-4" />,
              attach: true,
            },
          ]}
          commands={[
            { key: "explain", name: "/explain", description: "Explain the current file" },
            { key: "debug", name: "/debug", description: "Find the bug in this code" },
            { key: "hint", name: "/hint", description: "Hint for the next step" },
          ]}
          models={AI_PANEL_MODELS}
          defaultModel={defaultModel}
          efforts={["Low", "Medium", "High", "Extra", "Max"]}
          defaultEffort="Medium"
          busy={aiThinking}
          onSend={sendAiMessage}
          onStop={stopAi}
          onAttach={() => (activeFile ? [activeFile.path] : [])}
          background="#27272a"
          color="#f5f5f5"
          menuBackground="#323236"
          sparkColor="#8e8e8e"
          width={400}
          radius={16}
          maxRows={5}
        />
      </div>
      ) : null}
    </div>
  );
}

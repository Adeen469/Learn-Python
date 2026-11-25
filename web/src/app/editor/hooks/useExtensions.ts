// Reactive installed-extensions state: reads the per-browser list
// from localStorage and refreshes when it changes (same tab via the
// custom event the setter dispatches, other tabs via storage).
import { useCallback, useEffect, useState } from "react";
import {
  EXTENSIONS_CHANGED_EVENT,
  readInstalledExtensions,
  setExtensionInstalled,
} from "../lib/editor-extensions";

export function useInstalledExtensions() {
  const [installed, setInstalled] = useState<string[]>(() => readInstalledExtensions());
  useEffect(() => {
    const refresh = () => setInstalled(readInstalledExtensions());
    window.addEventListener(EXTENSIONS_CHANGED_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(EXTENSIONS_CHANGED_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);
  const setInstalledOne = useCallback((id: string, on: boolean) => {
    setInstalled(setExtensionInstalled(id, on));
  }, []);
  return { installed, setExtensionInstalled: setInstalledOne };
}

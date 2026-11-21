import AsyncStorage from "@react-native-async-storage/async-storage";

export type AiProvider = "gemini" | "groq";

export interface AiKey {
  provider: AiProvider;
  key: string;
}

const KEY = "lp_ai_byok_v1";

// BYOK only: there is no built-in key and no server in the middle.
// The key lives on this device and is sent only to the provider the
// user chose, together with the question — nowhere else, ever.
export async function loadAiKey(): Promise<AiKey | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as Partial<AiKey>;
    if ((p.provider === "gemini" || p.provider === "groq") && typeof p.key === "string" && p.key.length >= 10) {
      return { provider: p.provider, key: p.key };
    }
    return null;
  } catch {
    return null;
  }
}

export async function saveAiKey(next: AiKey | null): Promise<void> {
  try {
    if (next) await AsyncStorage.setItem(KEY, JSON.stringify(next));
    else await AsyncStorage.removeItem(KEY);
  } catch {
    // Storage full — the key just doesn't persist this time.
  }
}

type GeminiResponse = {
  candidates?: { content?: { parts?: { text?: string }[] } }[];
};
type GroqResponse = {
  choices?: { message?: { content?: string } }[];
};

export async function askAi(
  provider: AiProvider,
  key: string,
  question: string
): Promise<string> {
  if (provider === "gemini") {
    const res = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent",
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": key },
        body: JSON.stringify({ contents: [{ parts: [{ text: question }] }] }),
      }
    );
    if (!res.ok) throw new Error(`Gemini returned ${res.status}`);
    const data = (await res.json()) as GeminiResponse;
    const text = data.candidates?.[0]?.content?.parts
      ?.map((p) => p.text ?? "")
      .join("");
    if (!text) throw new Error("Gemini returned an empty reply");
    return text;
  }
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: "openai/gpt-oss-20b",
      messages: [{ role: "user", content: question }],
      max_tokens: 600,
    }),
  });
  if (!res.ok) throw new Error(`Groq returned ${res.status}`);
  const data = (await res.json()) as GroqResponse;
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error("Groq returned an empty reply");
  return text;
}

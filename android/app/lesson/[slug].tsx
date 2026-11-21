import { useEffect, useState } from "react";
import { ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { getTutorial, type TutorialBlock } from "../../lib/content";
import { loadAiKey, askAi, type AiKey } from "../../lib/ai";
import { loadProgress, toggleLesson } from "../../lib/progress";
import { colors, s } from "../../lib/theme";

function Block({ block }: { block: TutorialBlock }) {
  if (block.type === "heading") {
    return (
      <Text style={{ fontSize: 18, fontWeight: "700", color: colors.text, marginTop: 20, marginBottom: 6 }}>
        {block.text}
      </Text>
    );
  }
  if (block.type === "code") {
    return (
      <View style={{ backgroundColor: colors.surface, borderRadius: 10, padding: 12, marginTop: 10 }}>
        {block.title ? (
          <Text style={{ fontSize: 12, color: colors.muted, marginBottom: 6 }}>{block.title}</Text>
        ) : null}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <Text style={{ fontFamily: "monospace", fontSize: 13, color: colors.text }}>{block.code}</Text>
        </ScrollView>
        {block.output ? (
          <Text style={{ fontFamily: "monospace", fontSize: 13, color: colors.muted, marginTop: 8 }}>
            {block.output}
          </Text>
        ) : null}
      </View>
    );
  }
  if (block.type === "list") {
    return (
      <View style={{ marginTop: 10 }}>
        {block.items.map((item, i) => (
          <Text key={i} style={{ fontSize: 15, lineHeight: 22, color: colors.text, marginBottom: 4 }}>
            {"•  "}{item}
          </Text>
        ))}
      </View>
    );
  }
  if (block.type === "note" || block.type === "tip") {
    return (
      <View
        style={{
          borderLeftWidth: 3,
          borderLeftColor: colors.accent,
          backgroundColor: colors.surface,
          borderRadius: 8,
          padding: 12,
          marginTop: 10,
        }}
      >
        <Text style={{ fontSize: 14, lineHeight: 21, color: colors.text }}>{block.text}</Text>
      </View>
    );
  }
  return (
    <Text style={{ fontSize: 15, lineHeight: 22, color: colors.text, marginTop: 10 }}>
      {block.text}
    </Text>
  );
}

export default function LessonScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const tutorial = getTutorial(slug ?? "");
  const [done, setDone] = useState(false);
  const [aiKey, setAiKey] = useState<AiKey | null>(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [asking, setAsking] = useState(false);
  const [aiError, setAiError] = useState("");

  useEffect(() => {
    loadProgress().then((p) => setDone(p.lessons.includes(slug ?? "")));
    loadAiKey().then(setAiKey);
  }, [slug]);

  if (!tutorial) {
    return (
      <View style={[s.container, s.pad]}>
        <Text style={s.title}>Lesson not found</Text>
      </View>
    );
  }

  const mark = async () => {
    const p = await toggleLesson(tutorial.slug);
    setDone(p.lessons.includes(tutorial.slug));
  };

  const ask = async () => {
    const q = question.trim();
    if (!q || asking) return;
    if (!aiKey) {
      router.push("/(tabs)/settings");
      return;
    }
    setAsking(true);
    setAiError("");
    setAnswer("");
    try {
      const reply = await askAi(
        aiKey.provider,
        aiKey.key,
        `You are helping a beginner learn Python. The lesson is "${tutorial.title}". Answer this question briefly, in plain words, with a short code example only if it helps:\n${q}`
      );
      setAnswer(reply);
    } catch (e) {
      setAiError(e instanceof Error ? e.message : "The AI request failed");
    } finally {
      setAsking(false);
    }
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={s.pad}>
      <Text style={s.title}>{tutorial.title}</Text>
      <Text style={{ fontSize: 15, lineHeight: 22, color: colors.muted, marginTop: 8 }}>
        {tutorial.intro}
      </Text>
      {tutorial.blocks.map((b, i) => (
        <Block key={i} block={b} />
      ))}

      <Text style={{ fontSize: 17, fontWeight: "700", color: colors.text, marginTop: 24 }}>
        Try it yourself
      </Text>
      {tutorial.practice.map((p, i) => (
        <Text key={i} style={{ fontSize: 15, lineHeight: 22, color: colors.text, marginTop: 8 }}>
          {i + 1}. {p}
        </Text>
      ))}

      <Text style={{ fontSize: 17, fontWeight: "700", color: colors.text, marginTop: 24 }}>
        Summary
      </Text>
      {tutorial.summary.map((line, i) => (
        <Text key={i} style={{ fontSize: 15, lineHeight: 22, color: colors.text, marginTop: 6 }}>
          •  {line}
        </Text>
      ))}

      <TouchableOpacity style={s.button} onPress={() => void mark()}>
        <Text style={s.buttonText}>{done ? "✓ Completed — tap to undo" : "Mark complete"}</Text>
      </TouchableOpacity>

      <Text style={{ fontSize: 17, fontWeight: "700", color: colors.text, marginTop: 24 }}>
        Ask AI about this lesson
      </Text>
      {aiKey ? (
        <>
          <TextInput
            value={question}
            onChangeText={setQuestion}
            placeholder="Ask a question…"
            placeholderTextColor={colors.faint}
            multiline
            style={[s.input, { minHeight: 64, textAlignVertical: "top" }]}
          />
          <TouchableOpacity style={s.button} onPress={() => void ask()}>
            <Text style={s.buttonText}>{asking ? "Asking…" : `Ask with your ${aiKey.provider} key`}</Text>
          </TouchableOpacity>
          {aiError ? <Text style={{ color: "#f87171", marginTop: 10 }}>{aiError}</Text> : null}
          {answer ? (
            <Text style={{ fontSize: 15, lineHeight: 22, color: colors.text, marginTop: 12 }}>{answer}</Text>
          ) : null}
        </>
      ) : (
        <>
          <Text style={s.subtitle}>Add your own API key in Settings to ask the AI.</Text>
          <TouchableOpacity style={s.buttonGhost} onPress={() => router.push("/(tabs)/settings")}>
            <Text style={s.buttonGhostText}>Open Settings</Text>
          </TouchableOpacity>
        </>
      )}
      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

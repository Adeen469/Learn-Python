import { useEffect, useState } from "react";
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { TUTORIALS, allVideos, playableVideos } from "../../lib/content";
import { clearProgress } from "../../lib/progress";
import { loadAiKey, saveAiKey, type AiKey, type AiProvider } from "../../lib/ai";
import { colors, s } from "../../lib/theme";

export default function SettingsScreen() {
  const [provider, setProvider] = useState<AiProvider>("gemini");
  const [key, setKey] = useState("");
  const [saved, setSaved] = useState<AiKey | null>(null);

  useEffect(() => {
    loadAiKey().then((k) => {
      setSaved(k);
      if (k) {
        setProvider(k.provider);
        setKey(k.key);
      }
    });
  }, []);

  const save = async () => {
    const trimmed = key.trim();
    if (trimmed.length < 10) return;
    const next = { provider, key: trimmed };
    await saveAiKey(next);
    setSaved(next);
  };

  const remove = async () => {
    await saveAiKey(null);
    setSaved(null);
    setKey("");
  };

  const clear = () => {
    Alert.alert("Clear progress?", "This erases your completed lessons and videos.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear",
        style: "destructive",
        onPress: () => {
          void clearProgress();
        },
      },
    ]);
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={s.pad}>
      <Text style={s.title}>Settings</Text>

      <Text style={{ fontSize: 15, fontWeight: "600", color: colors.text, marginTop: 20 }}>
        About
      </Text>
      <Text style={s.subtitle}>Learn Python 1.0.0 — no account, no tracking.</Text>
      <Text style={s.subtitle}>
        {TUTORIALS.length} written lessons · {allVideos.length} course videos (
        {playableVideos.length} ready to play). Content is bundled with the
        app.
      </Text>

      <Text style={{ fontSize: 15, fontWeight: "600", color: colors.text, marginTop: 24 }}>
        Ask AI — your own key (BYOK)
      </Text>
      <Text style={s.subtitle}>
        The AI answers from your own key only. It is stored on this device
        and sent only to the provider you pick — there is no built-in key.
      </Text>
      <View style={{ flexDirection: "row", gap: 8, marginTop: 12 }}>
        {(["gemini", "groq"] as AiProvider[]).map((p) => (
          <TouchableOpacity
            key={p}
            onPress={() => setProvider(p)}
            style={{
              flex: 1,
              borderWidth: 1,
              borderColor: provider === p ? colors.accent : colors.border,
              borderRadius: 10,
              paddingVertical: 10,
              alignItems: "center",
              backgroundColor: colors.surface,
            }}
          >
            <Text style={{ color: colors.text, fontWeight: "600", textTransform: "capitalize" }}>
              {p}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <TextInput
        value={key}
        onChangeText={setKey}
        placeholder="Paste your API key"
        placeholderTextColor={colors.faint}
        secureTextEntry
        autoCapitalize="none"
        autoCorrect={false}
        style={s.input}
      />
      <TouchableOpacity style={s.button} onPress={() => void save()}>
        <Text style={s.buttonText}>Save key</Text>
      </TouchableOpacity>
      {saved ? (
        <TouchableOpacity style={s.buttonGhost} onPress={() => void remove()}>
          <Text style={s.buttonGhostText}>
            Remove saved {saved.provider} key
          </Text>
        </TouchableOpacity>
      ) : null}

      <Text style={{ fontSize: 15, fontWeight: "600", color: colors.text, marginTop: 24 }}>
        Progress
      </Text>
      <TouchableOpacity style={s.buttonGhost} onPress={clear}>
        <Text style={s.buttonGhostText}>Clear progress</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

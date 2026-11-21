import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { formatDuration, getCreator } from "../../lib/content";
import { colors, s } from "../../lib/theme";

export default function CreatorScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const creator = getCreator(slug ?? "");

  if (!creator) {
    return (
      <View style={[s.container, s.pad]}>
        <Text style={s.title}>Creator not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={s.container} contentContainerStyle={s.pad}>
      <Text style={s.title}>{creator.name}</Text>
      <Text style={s.subtitle}>
        {creator.handle} · {creator.subscribers} · {creator.language}
      </Text>
      <Text style={[s.subtitle, { marginTop: 4 }]}>{creator.tagline}</Text>

      {creator.playlists.map((pl) => (
        <View key={pl.title} style={{ marginTop: 20 }}>
          <Text style={{ fontSize: 16, fontWeight: "700", color: colors.text, marginBottom: 8 }}>
            {pl.title}
          </Text>
          {pl.videos.map((v) => {
            const playable = Boolean(v.megaLessonId);
            return (
              <TouchableOpacity
                key={v.videoId}
                style={[s.row, !playable && { opacity: 0.45 }]}
                disabled={!playable}
                onPress={() => router.push(`/video/${v.megaLessonId}`)}
              >
                <View style={{ flex: 1 }}>
                  <Text style={s.rowTitle}>{v.title}</Text>
                  <Text style={s.rowMeta}>
                    {formatDuration(v.durationSeconds)}
                    {playable ? "" : " · Not uploaded yet"}
                  </Text>
                </View>
                {playable ? <Text style={{ color: colors.muted, fontSize: 16 }}>›</Text> : null}
              </TouchableOpacity>
            );
          })}
        </View>
      ))}

      {creator.oneShots.length > 0 ? (
        <View style={{ marginTop: 20 }}>
          <Text style={{ fontSize: 16, fontWeight: "700", color: colors.text, marginBottom: 8 }}>
            One-shot videos
          </Text>
          {creator.oneShots.map((v) => {
            const playable = Boolean(v.megaLessonId);
            return (
              <TouchableOpacity
                key={v.videoId}
                style={[s.row, !playable && { opacity: 0.45 }]}
                disabled={!playable}
                onPress={() => router.push(`/video/${v.megaLessonId}`)}
              >
                <View style={{ flex: 1 }}>
                  <Text style={s.rowTitle}>{v.title}</Text>
                  <Text style={s.rowMeta}>
                    {formatDuration(v.durationSeconds)}
                    {playable ? "" : " · Not uploaded yet"}
                  </Text>
                </View>
                {playable ? <Text style={{ color: colors.muted, fontSize: 16 }}>›</Text> : null}
              </TouchableOpacity>
            );
          })}
        </View>
      ) : null}
      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

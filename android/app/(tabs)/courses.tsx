import { useCallback, useState } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { Link, useFocusEffect } from "expo-router";
import { CREATORS, allVideos, playableVideos } from "../../lib/content";
import { loadProgress, type Progress } from "../../lib/progress";
import { colors, s } from "../../lib/theme";

export default function CoursesScreen() {
  const [progress, setProgress] = useState<Progress>({ lessons: [], videos: [] });

  useFocusEffect(
    useCallback(() => {
      loadProgress().then(setProgress);
    }, [])
  );

  return (
    <View style={s.container}>
      <FlatList
        data={CREATORS}
        keyExtractor={(c) => c.slug}
        contentContainerStyle={s.pad}
        ListHeaderComponent={
          <View style={{ marginBottom: 12 }}>
            <Text style={s.title}>Video Courses</Text>
            <Text style={s.subtitle}>
              {allVideos.length} videos · {playableVideos.length} ready to play ·{" "}
              {progress.videos.length} watched
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const count =
            item.playlists.flatMap((p) => p.videos).length + item.oneShots.length;
          return (
            <Link href={`/creator/${item.slug}`} asChild>
              <TouchableOpacity style={[s.row, { alignItems: "flex-start" }]}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: "600", color: colors.text }}>
                    {item.name}
                  </Text>
                  <Text style={s.rowMeta}>
                    {item.handle} · {item.subscribers} · {item.language}
                  </Text>
                  <Text style={[s.rowMeta, { marginTop: 4 }]}>{item.tagline}</Text>
                  <Text style={[s.rowMeta, { marginTop: 4 }]}>{count} videos</Text>
                </View>
                <Text style={{ color: colors.muted, fontSize: 16 }}>›</Text>
              </TouchableOpacity>
            </Link>
          );
        }}
      />
    </View>
  );
}

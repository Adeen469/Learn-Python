import { useCallback, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Link, useFocusEffect } from "expo-router";
import { TUTORIALS, playableVideos } from "../../lib/content";
import { loadProgress, type Progress } from "../../lib/progress";
import { colors, s } from "../../lib/theme";

function Bar({ done, total }: { done: number; total: number }) {
  return (
    <View
      style={{
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.surface2,
        overflow: "hidden",
        marginTop: 6,
      }}
    >
      <View
        style={{
          height: 8,
          width: `${total === 0 ? 0 : Math.round((done / total) * 100)}%`,
          backgroundColor: colors.accent,
        }}
      />
    </View>
  );
}

export default function ProgressScreen() {
  const [progress, setProgress] = useState<Progress>({ lessons: [], videos: [] });

  useFocusEffect(
    useCallback(() => {
      loadProgress().then(setProgress);
    }, [])
  );

  const doneLessons = TUTORIALS.filter((t) => progress.lessons.includes(t.slug));

  return (
    <ScrollView style={s.container} contentContainerStyle={s.pad}>
      <Text style={s.title}>Your progress</Text>
      <Text style={[s.subtitle, { marginTop: 16 }]}>
        Lessons · {progress.lessons.length} of {TUTORIALS.length}
      </Text>
      <Bar done={progress.lessons.length} total={TUTORIALS.length} />
      <Text style={[s.subtitle, { marginTop: 16 }]}>
        Videos watched · {progress.videos.length} of {playableVideos.length} ready
        to play
      </Text>
      <Bar done={progress.videos.length} total={playableVideos.length} />

      <Text style={{ fontSize: 15, fontWeight: "600", color: colors.text, marginTop: 24, marginBottom: 8 }}>
        Completed lessons
      </Text>
      {doneLessons.length === 0 ? (
        <Text style={s.subtitle}>Nothing yet — open a lesson and mark it complete.</Text>
      ) : (
        doneLessons.map((t) => (
          <Link key={t.slug} href={`/lesson/${t.slug}`} asChild>
            <TouchableOpacity style={s.row}>
              <Text style={s.rowTitle}>{t.title}</Text>
              <Text style={s.check}>✓</Text>
            </TouchableOpacity>
          </Link>
        ))
      )}
    </ScrollView>
  );
}

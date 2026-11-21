import { useEffect, useRef } from "react";
import { Text, View } from "react-native";
import { useEvent } from "expo";
import { useVideoPlayer, VideoView } from "expo-video";
import { useLocalSearchParams } from "expo-router";
import { formatDuration, getVideoLesson, streamUrl } from "../../lib/content";
import { markVideoComplete } from "../../lib/progress";
import { colors, s } from "../../lib/theme";

// Same 95% watch rule as the website: reaching 95% marks the video
// watched. Streams run through the website's own video endpoint
// (public, no sign-in) — a MEGA share link cannot play directly.
export default function VideoScreen() {
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
  const lesson = getVideoLesson(lessonId ?? "");
  const markedRef = useRef(false);

  const player = useVideoPlayer(lesson ? streamUrl(lesson.id) : null, (p) => {
    p.timeUpdateEventInterval = 1;
    p.play();
  });
  const { status } = useEvent(player, "statusChange", { status: player.status });
  const timeUpdate = useEvent(player, "timeUpdate", {
    currentTime: 0,
    currentLiveTimestamp: null,
    currentOffsetFromLive: null,
    bufferedPosition: 0,
  });
  const currentTime = timeUpdate?.currentTime ?? 0;

  useEffect(() => {
    if (!lesson || markedRef.current) return;
    const duration = player.duration;
    if (duration > 0 && currentTime / duration >= 0.95) {
      markedRef.current = true;
      void markVideoComplete(lesson.id);
    }
  }, [currentTime, lesson, player]);

  if (!lesson) {
    return (
      <View style={[s.container, s.pad]}>
        <Text style={s.title}>Video not found</Text>
      </View>
    );
  }

  return (
    <View style={[s.container, s.pad]}>
      <VideoView
        player={player}
        style={{ width: "100%", aspectRatio: 16 / 9, backgroundColor: colors.surface }}
        contentFit="contain"
        nativeControls
        fullscreenOptions={{ enable: true }}
      />
      <Text style={[s.title, { fontSize: 18, marginTop: 16 }]}>{lesson.title}</Text>
      <Text style={s.subtitle}>
        {lesson.courseTitle} · {formatDuration(lesson.durationSeconds)}
      </Text>
      {status === "error" ? (
        <Text style={{ color: "#f87171", marginTop: 12 }}>
          This video could not be played. Check your connection and try again.
        </Text>
      ) : null}
      {status === "loading" ? (
        <Text style={[s.subtitle, { marginTop: 12 }]}>Loading video…</Text>
      ) : null}
    </View>
  );
}

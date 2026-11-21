import { useCallback, useState } from "react";
import { FlatList, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Link, useFocusEffect } from "expo-router";
import { TUTORIALS } from "../../lib/content";
import { loadProgress, type Progress } from "../../lib/progress";
import { colors, s } from "../../lib/theme";

export default function LearnScreen() {
  const [query, setQuery] = useState("");
  const [progress, setProgress] = useState<Progress>({ lessons: [], videos: [] });

  useFocusEffect(
    useCallback(() => {
      loadProgress().then(setProgress);
    }, [])
  );

  const q = query.trim().toLowerCase();
  const list = q
    ? TUTORIALS.filter((t) => t.title.toLowerCase().includes(q))
    : TUTORIALS;

  return (
    <View style={s.container}>
      <FlatList
        data={list}
        keyExtractor={(t) => t.slug}
        contentContainerStyle={s.pad}
        ListHeaderComponent={
          <View style={{ marginBottom: 12 }}>
            <Text style={s.title}>Learn Python</Text>
            <Text style={s.subtitle}>
              {progress.lessons.length} of {TUTORIALS.length} lessons complete
            </Text>
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search lessons"
              placeholderTextColor={colors.faint}
              style={s.input}
            />
          </View>
        }
        renderItem={({ item }) => {
          const done = progress.lessons.includes(item.slug);
          return (
            <Link href={`/lesson/${item.slug}`} asChild>
              <TouchableOpacity style={s.row}>
                <Text style={s.rowTitle}>{item.title}</Text>
                {done ? <Text style={s.check}>✓</Text> : null}
              </TouchableOpacity>
            </Link>
          );
        }}
      />
    </View>
  );
}

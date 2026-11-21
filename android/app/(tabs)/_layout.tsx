import { Tabs } from "expo-router";
import { colors } from "../../lib/theme";

// Labels only, no icons — keeps the tab bar quiet and dependency-free.
export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.bg,
          borderTopColor: colors.border,
        },
        tabBarActiveTintColor: colors.text,
        tabBarInactiveTintColor: colors.faint,
        tabBarLabelStyle: { fontSize: 12 },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Learn" }} />
      <Tabs.Screen name="courses" options={{ title: "Courses" }} />
      <Tabs.Screen name="editor" options={{ title: "Editor" }} />
      <Tabs.Screen name="progress" options={{ title: "Progress" }} />
      <Tabs.Screen name="settings" options={{ title: "Settings" }} />
    </Tabs>
  );
}

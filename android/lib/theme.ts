import { StyleSheet } from "react-native";

// Same black/neutral theme as the website: black background,
// neutral surfaces, white text. No gradients, no colour.
export const colors = {
  bg: "#000000",
  surface: "#171717",
  surface2: "#262626",
  border: "#262626",
  text: "#f5f5f5",
  muted: "#a3a3a3",
  faint: "#737373",
  accent: "#ffffff",
};

export const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  pad: { padding: 16 },
  title: { fontSize: 22, fontWeight: "700", color: colors.text },
  subtitle: { fontSize: 13, color: colors.muted, marginTop: 4 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: colors.surface,
    marginBottom: 8,
  },
  rowTitle: { fontSize: 15, color: colors.text, flex: 1, paddingRight: 8 },
  rowMeta: { fontSize: 12, color: colors.muted, marginTop: 2 },
  button: {
    backgroundColor: colors.accent,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 12,
  },
  buttonText: { color: "#000000", fontSize: 15, fontWeight: "600" },
  buttonGhost: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 12,
  },
  buttonGhostText: { color: colors.text, fontSize: 15, fontWeight: "600" },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    backgroundColor: colors.surface,
    color: colors.text,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    marginTop: 8,
  },
  check: { color: colors.accent, fontSize: 15, fontWeight: "700" },
});

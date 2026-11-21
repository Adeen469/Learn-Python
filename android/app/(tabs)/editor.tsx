import { ActivityIndicator, Linking, StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";
import { colors } from "../../lib/theme";

const EDITOR_URL = "https://learnpythonprogram.vercel.app/editor";
const APP_HOST = "learnpythonprogram.vercel.app";

// The editor is the ONLY WebView in the app: the website's /editor runs the
// full Pyodide editor (all 273 packages, on-demand via micropip), which has
// no native equivalent on Android. Everything else in the app is native.
export default function EditorScreen() {
  return (
    <View style={styles.root}>
      <WebView
        source={{ uri: EDITOR_URL }}
        startInLoadingState
        renderLoading={() => (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color={colors.text} />
          </View>
        )}
        onShouldStartLoadWithRequest={(event) => {
          try {
            const host = new URL(event.url).host;
            if (host === APP_HOST) return true;
          } catch {
            return false;
          }
          // Anything off the app (Google sign-in, external links) opens in
          // the browser — Google blocks OAuth inside a WebView.
          void Linking.openURL(event.url);
          return false;
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  loading: {
    alignItems: "center",
    backgroundColor: colors.bg,
    flex: 1,
    justifyContent: "center",
  },
  root: { backgroundColor: colors.bg, flex: 1 },
});

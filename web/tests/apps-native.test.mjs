import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const android = join(repoRoot, "android");
const androidSkip = existsSync(android)
  ? false
  : "Android project is not present in this web repository";

function filesUnder(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (entry === "node_modules" || entry === "package-lock.json") continue;
    if (statSync(full).isDirectory()) filesUnder(full, out);
    else if (/\.(tsx?|json)$/.test(entry)) out.push(full);
  }
  return out;
}

test("android app.json names the Learn Python package", { skip: androidSkip }, () => {
  const appJson = JSON.parse(readFileSync(join(android, "app.json"), "utf8"));
  assert.equal(appJson.expo.name, "Learn Python");
  assert.equal(appJson.expo.android.package, "com.learnpython.app");
});

test("the only WebView in the app is the editor screen", { skip: androidSkip }, () => {
  const webviewFiles = filesUnder(android).filter((f) =>
    readFileSync(f, "utf8").includes("react-native-webview"),
  );
  assert.deepEqual(
    webviewFiles.map((f) => f.replace(android + "/", "")),
    ["app/(tabs)/editor.tsx", "package.json"],
  );
  const editor = readFileSync(join(android, "app/(tabs)/editor.tsx"), "utf8");
  assert.ok(editor.includes("learnpythonprogram.vercel.app/editor"));
});

test("the android app reads no env vars and ships no .env", { skip: androidSkip }, () => {
  for (const f of filesUnder(join(android, "app"))
    .concat(filesUnder(join(android, "lib")))
    .concat([join(android, "index.ts")])) {
    assert.ok(
      !readFileSync(f, "utf8").includes("process.env"),
      `${f} reads process.env`,
    );
  }
  assert.ok(!existsSync(join(android, ".env")));
  const pkg = JSON.parse(readFileSync(join(android, "package.json"), "utf8"));
  assert.ok(!("dotenv" in (pkg.dependencies ?? {})));
});

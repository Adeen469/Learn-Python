import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "lp_progress_v1";

export interface Progress {
  lessons: string[];
  videos: string[];
}

export async function loadProgress(): Promise<Progress> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return { lessons: [], videos: [] };
    const p = JSON.parse(raw) as Partial<Progress>;
    return {
      lessons: Array.isArray(p.lessons) ? p.lessons : [],
      videos: Array.isArray(p.videos) ? p.videos : [],
    };
  } catch {
    return { lessons: [], videos: [] };
  }
}

async function save(p: Progress): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    // Storage full — progress just doesn't persist this time.
  }
}

export async function toggleLesson(slug: string): Promise<Progress> {
  const p = await loadProgress();
  const lessons = p.lessons.includes(slug)
    ? p.lessons.filter((s) => s !== slug)
    : [...p.lessons, slug];
  const out = { ...p, lessons };
  await save(out);
  return out;
}

export async function markVideoComplete(id: string): Promise<Progress> {
  const p = await loadProgress();
  if (p.videos.includes(id)) return p;
  const out = { ...p, videos: [...p.videos, id] };
  await save(out);
  return out;
}

export async function clearProgress(): Promise<Progress> {
  const out: Progress = { lessons: [], videos: [] };
  await save(out);
  return out;
}

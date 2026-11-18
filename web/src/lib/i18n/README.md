# Website i18n

UI chrome is translated through `src/lib/i18n/` (this folder); tutorial
and reference prose through `src/lib/learn/i18n/` overlays. Content
titles (course videos, roadmap names) live in `./titles/`.

Standing rule: **the website and the app must be the SAME wherever
possible, and translations IDENTICAL.** For every string that exists in
the app's dictionaries (`~/workspace/learn-python-app/src/lib/i18n/`),
the website's dictionaries copy the app's translation **verbatim**.
Only genuinely website-only strings are translated fresh, following the
app's conventions (Roman Hindi everyday mix, Roman Urdu polite "karein"
forms, pt-BR, etc.).

## How to use a string in a component

```tsx
"use client";
import { useLanguage } from "@/lib/i18n";

const { t } = useLanguage();
<h1>{t.landing.featuresHeading}</h1>
<p>{t.quiz.passRequirement(70)}</p>
```

Non-component code uses `getCurrentStrings()` (English until the
provider mounts). Titles use the helpers on the same hook:

```tsx
const { videoTitle, roadmapName, tutorialTitle, lessonTitle, referenceTitle, roadmapBlurb } = useLanguage();
videoTitle(videoId, fallbackTitle)   // 259 course videos
roadmapName("Python Lists")          // stage / topic / difficulty names
tutorialTitle(slug, fallbackTitle)   // /learn sidebar + page titles
lessonTitle(lessonId, fallbackTitle) // day-lesson titles (python-day-001 …)
referenceTitle(slug, fallbackTitle)  // /learn reference-entry titles
roadmapBlurb("Python Lists")         // roadmap topic blurb, English fallback
```

Language is stored in `localStorage` under `lp_language` and defaults
to the browser locale (`navigator.language` base code: `hi` →
`hi-roman`, else the matching code, else `en`).
`document.documentElement.lang` is set on change. Arabic is strings
only — no RTL layout flipping.

## How to add a string

1. Check the app first (`learn-python-app/src/lib/i18n/en.ts`): if the
   app already has the string with the same meaning, **reuse its key**
   and copy its English wording verbatim into `en.ts` here. Do not
   mint a new key, and do not change the wording.
2. Otherwise add a key to the `Strings` type in `index.tsx` (in the
   matching section, or a new website-only section) and the English
   text to `en.ts`. Dynamic parts are functions, so each language can
   apply its own grammar — never concatenate translated fragments in
   the component; pass the values as function arguments.
3. Add the same key with the same structure to all 11 language files.
   TypeScript errors if any key is missing. Shared (app) keys must be
   copied verbatim from the app's language file; website-only keys are
   translated fresh.
4. Never put content in `Strings`: video/lesson/tutorial titles,
   creator names, quiz questions, tutorial prose, AI answers, package
   descriptions, or API error text. Those live in titles maps,
   overlays, or stay in English.

Notes on tricky keys (wiring agents, read this):

- `sidebar.searchTopics` serves both the search label and the
  placeholder — append `…` for the placeholder.
- `learnPage.noteLabel` / `tipLabel` end in `": "` (colon + space);
  `settings.cantScanEnterSecret` ends in `": "` (the secret follows).
- `roadmapModal.subtitle(totalTopics, totalMinutes)` takes the
  duration pre-formatted, e.g. via `t.common.durationTotal(seconds)`.
- `tutorPage.askPlaceholder(lessonTitle)` truncates the title to 40
  chars itself; pass the full title.
- `lesson.nextLesson` renders as `Next →` — do not add a second arrow
  icon next to it. `learnPage.previous` has no arrow; the page adds
  its own icon.
- `roadmap.topicDone` renders as `✓ Done` — let the ✓ render.
- `common.durationTotal` shows `{h}h 0m` for exact hours, as the app
  does. `common.duration` is only called with a real duration; an
  undefined duration renders `""` with no key.
- `editorPage.aiEmptyReplyError` and `tutor.errorEmptyReply` have the
  same English text in different components; both keys are kept (one
  per audit). Do not merge them without coordinator approval.
- `player.saving` is the download label at 0% (next to
  `player.savingPct`); `githubPage.visibilityPrivateShort` /
  `visibilityPublicShort` are the bare "private"/"public" repo badges.
  The 3 keys were added in the final pass (2026-11-18) — their
  translations were derived from each language's own `savingPct` verb
  and `visibilityPrivate/Public` wording and are flagged for
  native-speaker review.
- `auth.otpSubtitle(email, purpose)` is the app's two-sentence
  function; pass `"signin"` / `"signup"` at each call site.
- `learnPage.backToPythonHome(title)` takes the *localized* title
  (via `roadmapName()`), e.g. `Back to Python HOME`.

## How to add a language

1. Add the code + labels to `LANGUAGES` in `index.tsx` (same 12
   codes/labels as the app).
2. Copy `en.ts` to `<code>.ts`, replace the header with the STUB
   comment, rename the export (`export const <name>: Strings`), and
   translate every value. App-section keys: copy verbatim from the
   app's `<code>.ts`. The provider's `STRINGS` map picks it up.
3. Copy the app's `titles/<code>.ts` into `./titles/<code>.ts`
   (`lessonTitles` + `videoTitles` + `roadmapNames`) — or re-run
   `~/workspace/learn-python-i18n/generate-web-i18n.py`, which also
   regenerates the stubs and blurbs and diffs the titles maps.
4. Add `./blurbs/<code>.ts` (`roadmapBlurbs`, keyed by English topic
   title) and `src/lib/learn/i18n/<code>/` chunk files (below).
5. Add the locale to `defaultLanguage()` in `index.tsx` if the
   browser base code differs from the app code (as `hi`/`ur` do).

## How tutorial translations work

Tutorial and reference prose is NOT in `Strings`. Translators write
per-language chunk files (never edit the loader by hand):

```
src/lib/learn/i18n/<lang>/tutorials-basics-1.ts
src/lib/learn/i18n/<lang>/tutorials-basics-2.ts
src/lib/learn/i18n/<lang>/tutorials-functions-matplotlib.ts
src/lib/learn/i18n/<lang>/tutorials-classes-filemodules.ts
src/lib/learn/i18n/<lang>/tutorials-ml-databases-dsa.ts
src/lib/learn/i18n/<lang>/references-modules.ts
src/lib/learn/i18n/<lang>/references-others.ts
```

Each file exports `TRANSLATIONS` typed as `TutorialTranslations`
(or `ReferenceTranslations` for references) — see
`src/lib/learn/i18n/types.ts`. Keys are tutorial/reference slugs.
`blocks` is keyed by the 0-based index of the block in the English
`blocks` array and covers only heading/para/list/note/tip blocks —
**code blocks are never translated and never appear in an overlay**.

`src/lib/learn/i18n/index.ts` imports all chunks per language and
merges them. Wiring code localizes content like this:

```ts
import { getTutorialTranslations, localizeTutorial } from "@/lib/learn/i18n";
const tr = getTutorialTranslations(lang)[tutorial.slug];
const localized = localizeTutorial(tutorial, tr);
```

`localizeTutorial` / `localizeReference` return a new object with
translated fields replaced and everything else (including all code)
kept verbatim in English; any missing field falls back to English.
English has no chunks — both getters return `{}` for `"en"`.

## Related maps

- `./titles/<lang>.ts` — `{ lessonTitles, videoTitles, roadmapNames }`,
  copied verbatim from the app. Playlist titles (3) stay English,
  like the app. Regenerate with `generate-web-i18n.py`; never
  hand-edit. (Run only `gen_titles()` + `verify_titles()` from the
  script — running it whole also regenerates the UI stubs and blurbs.)
- `./blurbs/<lang>.ts` — `roadmapBlurbs: Record<string, string>`,
  keyed by English topic title. Website-only content, translated
  fresh. `en.ts` is real; the other 11 are STUB English copies.

import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const webDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => readFileSync(join(webDir, rel), "utf8");

// Extract the topic rows from the data file (static mirror of the
// ROADMAP_STAGES shape — the component is checked separately).
function topicsFromData() {
  const src = read("src/lib/roadmap.ts");
  const rows = [...src.matchAll(
    /\{\s*id: "([^"]+)", title: "([^"]+)", learnSlug: ("[^"]+"|null), difficulty: "(Beginner|Intermediate|Advanced)", estimatedMinutes: (\d+),/g
  )];
  return rows.map((m) => ({
    id: m[1],
    title: m[2],
    learnSlug: m[3] === "null" ? null : m[3].slice(1, -1),
    difficulty: m[4],
    minutes: Number(m[5]),
  }));
}

describe("roadmap data (LP-RM topics, timeline rail)", () => {
  test("29 topics in 6 stages, unique ids", () => {
    const src = read("src/lib/roadmap.ts");
    const stages = [...src.matchAll(/id: "(basics|structures|control|oop|libraries|advanced)",/g)];
    assert.equal(stages.length, 6, "must have exactly 6 stages");
    const topics = topicsFromData();
    assert.equal(topics.length, 29, "must carry all 29 LP-RM topics");
    assert.equal(new Set(topics.map((t) => t.id)).size, 29, "topic ids must be unique");
  });

  test("every topic links to a real /learn page, except Machine Learning", () => {
    const learnFiles = readdirSync(join(webDir, "src/lib/learn")).filter((f) =>
      f.endsWith(".ts")
    );
    const learnSrc = learnFiles
      .map((f) => readFileSync(join(webDir, "src/lib/learn", f), "utf8"))
      .join("\n");
    const topics = topicsFromData();
    const noPage = topics.filter((t) => t.learnSlug === null);
    assert.deepEqual(
      noPage.map((t) => t.id),
      ["machine-learning"],
      "only Machine Learning may lack a /learn page"
    );
    for (const t of topics) {
      if (!t.learnSlug) continue;
      assert.ok(
        learnSrc.includes(`slug: "${t.learnSlug}"`),
        `${t.id} links to /learn/${t.learnSlug}, which must exist`
      );
    }
  });

  test("total time is 580 minutes", () => {
    const topics = topicsFromData();
    const total = topics.reduce((n, t) => n + t.minutes, 0);
    assert.equal(total, 580, "29 topics must total 580 minutes (~9h 40m)");
  });

  test("no 3D street baggage from LP-RM", () => {
    const data = read("src/lib/roadmap.ts");
    const modal = read("src/components/RoadmapModal.tsx");
    for (const [name, src] of [["roadmap.ts", data], ["RoadmapModal.tsx", modal]]) {
      for (const banned of ["@react-three", "three", "shapeType", "icosahedron", "RoadmapCanvas"]) {
        assert.ok(!src.includes(banned), `${name} must not contain ${banned}`);
      }
    }
  });
});

describe("roadmap modal + hint", () => {
  test("modal shows the path, progress, and done states from /learn", () => {
    const modal = read("src/components/RoadmapModal.tsx");
    assert.ok(modal.includes("Your Python Roadmap"), "modal must be titled Your Python Roadmap");
    assert.ok(modal.includes('aria-label="Close roadmap"'), "modal must have a Close button");
    assert.ok(modal.includes("lp_learn_completed"), "modal must read /learn completion");
    assert.ok(modal.includes("roadmapTopicHref"), "topics must link through roadmapTopicHref");
  });

  test("closing shows where to find the roadmap again", () => {
    const modal = read("src/components/RoadmapModal.tsx");
    assert.ok(
      modal.includes("Next time you can preview the roadmap from the profile dropdown"),
      "hint must point at the profile dropdown"
    );
    assert.ok(modal.includes("Got it"), "hint must have a Got it button");
    // The hint sits above the still-open roadmap (z-60 over z-50),
    // and Escape on it dismisses both.
    assert.ok(modal.includes("z-[60]"), "hint must overlay the roadmap modal");
    assert.ok(modal.includes("z-50"), "roadmap modal must sit below the hint");
    assert.ok(
      modal.includes('if (e.key === "Escape") onGotIt()'),
      "Escape on the hint must dismiss it"
    );
  });

  test("a topic click navigates quietly — it must not fire the hint", () => {
    const modal = read("src/components/RoadmapModal.tsx");
    assert.ok(
      modal.includes("onNavigate: () => void"),
      "modal must take a separate onNavigate for topic clicks"
    );
    assert.ok(
      modal.includes("onNavigate={onNavigate}"),
      "topic rows must call onNavigate, not onClose"
    );
  });
});

describe("roadmap wiring in the navbar", () => {
  test("profile menu has a Roadmap item (signed-in) and the modal is mounted", () => {
    const nav = read("src/components/AppNavbar.tsx");
    assert.ok(nav.includes("Roadmap"), "profile menu must offer Roadmap");
    assert.ok(nav.includes("RoadmapModal"), "navbar must mount the roadmap modal");
    assert.ok(nav.includes("RoadmapHint"), "navbar must mount the hint popup");
  });

  test("first sign-in auto-shows once, then marks it seen", () => {
    const nav = read("src/components/AppNavbar.tsx");
    const data = read("src/lib/roadmap.ts");
    assert.ok(
      data.includes('ROADMAP_SEEN_KEY = "lp_roadmap_seen"'),
      "lib/roadmap must define the lp_roadmap_seen flag"
    );
    assert.ok(nav.includes("ROADMAP_SEEN_KEY"), "navbar must use the ROADMAP_SEEN_KEY flag");
    assert.ok(
      nav.includes("localStorage.getItem(ROADMAP_SEEN_KEY)"),
      "navbar must check the flag before auto-showing"
    );
    assert.ok(
      nav.includes('localStorage.setItem(ROADMAP_SEEN_KEY, "1")'),
      "closing the roadmap must mark it seen"
    );
  });

  test("hint fires only on the first close, over the still-open roadmap", () => {
    const nav = read("src/components/AppNavbar.tsx");
    // The close handler must read the seen flag BEFORE deciding to
    // show the hint — otherwise it fires on every close.
    const closeFn = nav.slice(nav.indexOf("function handleCloseRoadmap()"));
    assert.ok(
      closeFn.includes('localStorage.getItem(ROADMAP_SEEN_KEY) !== "1"'),
      "close must check whether this is the first close"
    );
    assert.ok(
      closeFn.includes("if (firstClose)"),
      "hint must open only on the first close"
    );
    assert.ok(
      closeFn.includes("if (roadmapHintOpen) return;"),
      "close must ignore Escape/X while the hint is already up"
    );
    // First close keeps the roadmap mounted (no setRoadmapOpen(false)
    // on the firstClose branch) — the hint overlays it.
    const firstBranch = closeFn.slice(closeFn.indexOf("if (firstClose)"));
    assert.ok(
      firstBranch.indexOf("setRoadmapHintOpen(true)") <
        firstBranch.indexOf("setRoadmapOpen(false)"),
      "first close must open the hint before any close of the modal"
    );
    // Dismissing the hint is what finally closes the roadmap.
    assert.ok(
      nav.includes("function handleRoadmapHintGotIt()"),
      "hint dismissal must have its own handler"
    );
    const gotIt = nav.slice(nav.indexOf("function handleRoadmapHintGotIt()"));
    assert.ok(gotIt.includes("setRoadmapHintOpen(false)"), "Got it must close the hint");
    assert.ok(gotIt.includes("setRoadmapOpen(false)"), "Got it must close the roadmap");
    assert.ok(
      nav.includes("onGotIt={handleRoadmapHintGotIt}"),
      "hint must be wired to the Got it handler"
    );
    // Topic clicks navigate quietly, no hint.
    assert.ok(
      nav.includes("function handleRoadmapNavigate()"),
      "topic clicks must have their own handler"
    );
    assert.ok(
      nav.includes("onNavigate={handleRoadmapNavigate}"),
      "modal must be wired to the navigate handler"
    );
  });
});

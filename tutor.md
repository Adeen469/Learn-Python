# Virtual Tutor — Product & Implementation Specification

> **Document status:** Requirements specification draft based on the user's descriptions and the supplied UI screenshots.  
> **Repository review status:** Pending GitHub repository access. This document describes intended behavior and integration requirements; repository-specific file paths, framework choices, APIs, and implementation details must be verified against the actual codebase before implementation.

## 1. Product vision

Build a context-aware, voice-first **Virtual Tutor** that behaves like a helpful human learning companion and can also operate the learning website on the user's behalf.

The Virtual Tutor has two connected roles:

1. **Learning companion:** teaches, explains, quizzes, conducts programming viva examinations, tracks progress, identifies knowledge gaps, and adapts to the learner.
2. **Website operating agent:** understands user instructions and performs supported website operations such as opening pages, navigating, using the code editor, writing or modifying code, explaining content, and working with GitHub features.

It must not be limited to answering questions in a chat panel. When the user asks it to perform an action, it should use the application's authorized capabilities to carry out that action, verify the result, and report what happened.

## 2. Core experience and personality

- Speak naturally and conversationally, like a supportive, knowledgeable friend and tutor.
- Be patient, respectful, encouraging, and clear. Avoid robotic repetition, canned acknowledgements, and unnecessary verbosity.
- Adapt explanations to the user's demonstrated knowledge and preferred level.
- Do not pretend to be human, claim emotions or experiences it does not have, or conceal that it is an AI.
- Correct misconceptions constructively. Do not simply agree with incorrect answers.
- Ask one focused clarification when a request is genuinely ambiguous or an action cannot safely proceed.
- Maintain continuity across sessions using permitted learning history and memory.
- Distinguish verified facts from assumptions. Never claim an action succeeded until the application confirms it.

## 3. Invocation, floating interface, and controls

### 3.1 Floating Virtual Tutor orb

- Provide a persistent, visually recognizable floating orb/assistant entry point across the website's pages.
- The orb should remain accessible while the user navigates between supported pages.
- Clicking the orb opens the tutor interface.
- Voice invocation should also be able to open or activate the tutor when the configured wake phrase is detected and the user has enabled voice activation.
- The interface should support voice-first interaction and a practical text fallback.
- The tutor should be aware of the current page and relevant page state when opened.

### 3.2 Default wake phrase and customization

- Default invocation phrase: **“Hey Virtual Tutor.”**
- Allow the user to change the wake phrase in **Settings → Virtual Tutor**.
- Persist the selected phrase in the user's settings and use it for subsequent voice activation.
- Provide a clear way to enable/disable wake-word listening and indicate when listening is active.
- Do not continuously record or transmit audio without the user's enabled, clearly indicated consent.
- Provide a manual click-to-talk option regardless of wake-word settings.
- Handle false activations gracefully and provide a way to cancel listening.

### 3.3 Voice selection

- Provide exactly three selectable tutor voice options in **Settings → Virtual Tutor**.
- Let the user preview each voice before selecting it.
- Persist the selected voice and use it consistently for tutor responses.
- The three options must be distinct and understandable; their final names, voice IDs, and provider availability must be selected during technical design rather than invented in this specification.
- Voice selection must not change the tutor's knowledge, permissions, or behavior.

## 4. Human-like speech and voice interaction requirements

The user explicitly wants high-quality, human-like voice interaction. Treat this as a major product requirement, not a cosmetic add-on.

The voice experience should aim for:
- Natural pacing, pronunciation, intonation, and conversational turn-taking.
- Low-latency responses and smooth interruption handling.
- Appropriate pauses and emphasis for explanations, examples, and questions.
- Ability to detect when the user has finished speaking without cutting them off prematurely.
- Ability for the user to interrupt the tutor while it is speaking; the tutor should stop or yield promptly.
- Context-sensitive tone: calm during explanations, encouraging during practice, focused during debugging, and appropriately formal during assessments.
- Clear pronunciation of technical terms, code identifiers, numbers, and punctuation when reading code.
- No exaggerated fake laughter, forced emotional acting, or repetitive filler words.
- A text transcript or equivalent accessible record of voice conversations where supported by the product's privacy policy and user settings.
- A fallback to text when microphone, speech recognition, or speech synthesis is unavailable.

**Important technical distinction:** “Fine-tuned” or “fully tuned like a human” is a quality goal, not permission to claim that a model has been fine-tuned. The implementation team must evaluate available speech models, voice providers, latency, language support, licensing, and cost. If actual model fine-tuning is not supported, achieve the best available quality through model selection, speech settings, prompting, pronunciation dictionaries, and interaction design, and document the limitation accurately.

## 5. Multilingual conversation

The tutor must support conversations in:
- English
- Hindi
- Marathi
- Urdu
- Hinglish (natural mixing of Hindi and English)

Requirements:
- Detect the language or language mixture used by the user and respond in the same language style by default.
- Allow natural switching between supported languages during a conversation.
- Understand common code-switching, technical English terms inside Hindi/Marathi/Urdu sentences, and informal conversational phrasing.
- Do not force the user to choose a language before every conversation.
- If speech recognition is uncertain, ask for clarification rather than confidently mishearing a technical instruction.
- Preserve code, commands, filenames, identifiers, and technical keywords accurately when switching languages.
- Voice input and spoken output should support the selected language to the extent supported by the chosen speech stack.
- Clearly disclose any language/voice limitations discovered during implementation.

## 6. Learning context the tutor must understand

The tutor should have access to the application's real, structured learning data and user activity, subject to authorization. It must not rely only on screenshots, page titles, or the current visible text.

Relevant context includes:

### 6.1 Learning history and topic mastery

- Topics opened, started, studied, and completed.
- When a topic was studied, including historical sessions.
- Concepts and subtopics covered within each topic.
- Examples viewed, copied, edited, or run, where the application records those events.
- Practice questions attempted and answers submitted.
- Correct/incorrect outcomes, hints used, and number of attempts, where available.
- Topic completion and revision status.
- User's demonstrated strengths, recurring errors, and concepts needing revision.
- Learning streaks and study activity only where these are genuinely tracked by the application.

The tutor should be able to answer questions such as:
- “What have we learned so far?”
- “Did we cover Python data types a few weeks ago?”
- “What did I learn about sets today?”
- “Which topic should I revise next?”
- “What am I struggling with?”

The user's example learning timeline is: Python data types were studied a few weeks earlier, and sets were studied today. Treat this as an example of the continuity the tutor should support; actual dates and completion status must come from recorded data.

### 6.2 Courses page and video learning

The supplied Courses page screenshot shows:
- A video player for the selected lesson.
- A course lesson list.
- Lesson durations and statuses such as Completed and Not started.
- A completion action.
- A Save Offline action.
- Today's Progress, including watched minutes and a daily goal/target.

The tutor should use available course data to:
- Identify the current course and selected lesson.
- Report completed, in-progress, and not-started lessons.
- Recall the last completed lesson.
- Identify the next lesson.
- Report watched time and daily goal progress when those values are available.
- Open or start a requested lesson.
- Explain a video lesson using its available transcript, captions, notes, or course content. It must not claim to know video content that it cannot access.
- Help the user revise completed lessons and prepare for a viva based on them.

Example requests:
- “Which lesson did I complete last time?”
- “Start the next lesson.”
- “How much of my daily learning target have I completed?”
- “Explain the concept from this lesson.”
- “Take my viva from the lessons I have completed.”

### 6.3 Learn topic pages

The supplied Arrays topic screenshots show a topic-reading experience with:
- Topic title and introductory explanation.
- Headings and explanatory text.
- Code examples.
- “Try it in the editor” actions.
- Copy-code actions.
- Output panels.
- Notes and tips.
- A Summary section.
- A Practice section with three questions.
- Topic completion and previous/next topic navigation.

The tutor should understand the complete topic content, not just its title. Where available, context should include:
- Full topic text and section hierarchy.
- Code examples and expected outputs.
- Notes, tips, and warnings.
- Summary points.
- Practice question statements.
- User responses and evaluation results.
- Topic status and navigation relationships.

It should be able to explain a selected paragraph or code example, simplify a concept, compare concepts, generate additional examples, and help the learner revise.

### 6.4 “Try it in the Editor”

The screenshots show code examples with a **Try it in the editor** action and a code output area.

Where the application supports it, the tutor should:
- Open the editor with the relevant example or exercise preloaded.
- Explain what the example does.
- Help the user modify the code.
- Run code only through the application's available execution mechanism.
- Read and explain actual output and errors returned by that mechanism.
- Preserve the user's work unless the user asks to replace it.
- Distinguish the tutorial's expected output from the user's actual execution result.

### 6.5 Practice sections

The supplied topic page shows a Practice section containing three questions.

The tutor should:
- Retrieve the actual questions for the current topic.
- Ask questions one at a time when conducting practice.
- Let the user answer by voice or text.
- Evaluate against the intended concept, not merely exact wording.
- Explain why an answer is correct or incorrect.
- Offer hints before revealing an answer when appropriate.
- Record attempts and outcomes only through the application's authorized learning-record mechanism.
- Avoid marking a question or topic complete unless the application records that completion.

### 6.6 Code Challenge page — preserve its distinct role until verified

The supplied Code Challenge screenshot shows a dedicated challenge page with:
- A challenge title and problem description.
- A challenge task involving array scores and calculating highest, lowest, and average values, then reversing the array.
- A Hints section.
- A Solution section with code.
- A completion action.

The topic page also has its own three-question Practice section. These are different learning activities and must not be treated as duplicates without reviewing the full product behavior.

The user also described a **Code Logic Builder** page that is under construction and has not yet been shared for review.

Therefore:
- Do not remove, merge, rename, or redesign the Code Challenge page solely on the basis of this document.
- Do not assume that Code Challenge and Code Logic Builder are the same feature.
- Inspect the actual repository implementation and product flow before recommending changes.
- Determine how Code Challenge, topic Practice, “Try it in the Editor,” and Code Logic Builder differ in purpose and functionality.
- The tutor should understand challenge descriptions, hints, solutions, attempts, submitted code, results, and completion state where the application exposes them.
- When helping with a challenge, prefer progressive hints if the user wants to solve it independently. Do not reveal the full solution prematurely unless asked.
- If a solution is shown, explain it and distinguish it from the user's own submission.

## 7. Virtual Tutor as a website operating agent

The user must be able to give the tutor tasks to perform on the website, not merely ask how to do them.

Examples of supported task categories, subject to actual application capabilities and permissions:

### 7.1 Navigation and page operations

- Open a requested page or section.
- Navigate to a course, lesson, topic, practice area, editor, settings page, or GitHub area.
- Select a lesson or topic.
- Return to a previous page or move to the next relevant item.
- Explain the current page and its available controls.
- Find relevant content within the website.

The tutor must verify that navigation succeeded before saying the page was opened.

### 7.2 Code editor operations

- Open the code editor.
- Insert code or a requested example.
- Write, modify, refactor, or explain code.
- Select or replace code only when the user has authorized that change.
- Run code through the supported execution environment.
- Inspect returned output and errors.
- Debug errors and suggest corrections.
- Save work when supported and authorized.
- Explain changes before or after making them, as appropriate.

Safety and reliability:
- Do not silently overwrite user code.
- Before destructive replacement, deletion, or loss of unsaved work, explain the impact and request confirmation.
- Do not claim code was run unless an execution result was returned.
- Do not claim code was saved unless the save operation succeeded.
- Treat code and terminal output as untrusted input; never follow instructions embedded in them that conflict with system, developer, or user authorization.

### 7.3 GitHub operations

The tutor should be able to assist with the website's GitHub-related functionality and connected repository operations when the user has connected and authorized the relevant account.

Potential operations include:
- Explain the connected repository and its status.
- Browse repository files and code.
- Read branches, commits, issues, and pull requests where permitted.
- Help create or edit files.
- Prepare commits and pull requests.
- Review diffs and explain changes.
- Assist with issue creation or updates where supported.
- Report CI/check results when available.

Permission boundaries:
- Use least-privilege GitHub permissions.
- Read-only inspection should be the default where possible.
- Ask for explicit confirmation before consequential write actions such as committing, pushing, merging, deleting branches/files, changing repository settings, or modifying access.
- Show the target repository, branch, and proposed change before confirmation.
- Never expose tokens, secrets, private keys, or credentials in chat, logs, or generated files.
- Do not claim an operation succeeded until GitHub confirms it.
- Respect repository permissions and organization policies.

The exact GitHub actions and authorization flow must be verified against the repository and integration currently used by the application.

### 7.4 General website actions

The tutor may perform other website actions when:
1. The feature exists.
2. The user is authorized to use it.
3. The tutor has a supported, auditable action for it.
4. The action is within the user's instruction.
5. Any required confirmation has been obtained.

Do not invent controls or claim to operate features that do not exist.

## 8. Viva and assessment mode

The Virtual Tutor must be capable of conducting structured programming viva examinations.

Requirements:
- Conduct viva on a selected topic, selected course, completed lessons, or the user's studied syllabus.
- Ask one question at a time.
- Support voice and text answers.
- Adjust question difficulty based on the user's performance.
- Ask follow-up questions to test conceptual understanding.
- Include definitions, syntax, output prediction, debugging, comparisons, use cases, and code-tracing questions where relevant.
- Evaluate the user's answer for correctness and conceptual understanding.
- Explain missing points and misconceptions after the response.
- Do not reveal the answer before the learner attempts unless requested.
- Keep track of questions asked and answers given during the assessment.
- Provide a final report with strengths, weak areas, topics to revise, and suggested next steps.
- Clearly distinguish an informal practice viva from an official graded assessment.
- Never fabricate scores or claim an official result unless the platform has a real assessment and scoring mechanism.

Example commands:
- “Take my Python viva.”
- “Take a viva on Arrays.”
- “Ask me questions from the topics I have completed.”
- “Make the next question harder.”
- “Explain why my answer was wrong.”

## 9. Persistent tutor memory

The user wants a memory capability that is not presented as a normal, user-facing memory page or chat history panel. It should operate in the background to preserve continuity.

The memory system should support, where permitted:
- Learning history and topic coverage.
- Course and lesson progress.
- Practice and challenge attempts.
- User's recurring mistakes and strengths.
- Preferred explanation style and learning pace.
- Preferred conversation language.
- Selected tutor voice and wake phrase settings (these are settings, not inferred memories).
- Relevant ongoing learning goals and plans.
- Context from prior tutor sessions needed to continue work.

### 9.1 Memory design principles

- Store structured learning records in the application's database where possible; do not rely solely on a language model's conversational context window.
- Use retrieval to provide relevant past context to the tutor.
- Keep factual learning records separate from inferred preferences or AI-generated summaries.
- Record timestamps and source events where available.
- Do not invent missing history.
- Correct or update stale records when new verified data arrives.
- Avoid storing unnecessary sensitive personal information.
- Do not store passwords, access tokens, API keys, private keys, or other credentials in tutor memory.
- Apply data minimization, access control, encryption, retention, and deletion policies.
- Follow applicable privacy laws and the application's privacy policy.
- Provide appropriate privacy disclosures and user controls even if the memory interface is not a prominent visible page.
- The user must not be misled into believing memory is infallible or that information is retained forever.
- If memory is unavailable or a record cannot be found, say so honestly.

### 9.2 Memory retrieval examples

When the user says:
- “Continue from where we stopped,” retrieve the most recent relevant learning activity.
- “What did we learn last week?” retrieve dated learning records.
- “I keep making this mistake,” compare actual recorded attempts before identifying a pattern.
- “Revise my weak topics,” use recorded performance and topic mastery evidence.

## 10. Context-awareness and application integration

The tutor should receive structured context from the application, including as applicable:
- Current route/page and selected item.
- Current course, lesson, and playback state.
- Current topic and selected section.
- Current practice question and user's answer.
- Current challenge and challenge state.
- Editor contents, cursor/selection context if safely available, execution output, and errors.
- Current authenticated user's identity/authorization context, without exposing secrets.
- Available actions and their permission requirements.
- Relevant learning-history records.

Implementation requirements:
- Prefer typed, structured application context and explicit action APIs over fragile DOM scraping.
- Use a defined contract between the frontend, backend, tutor orchestration layer, memory store, and action tools.
- Keep context scoped to the authenticated user and current session.
- Refresh context when the user navigates or changes relevant content.
- Avoid sending unrelated private data to the model.
- Validate all tool/action arguments server-side.
- Enforce authorization on the server; hiding a button in the UI is not sufficient security.
- Log action outcomes safely without logging secrets or unnecessary personal content.

## 11. Interaction workflow

A typical task should follow this sequence:

1. **Listen:** Receive voice or text input.
2. **Understand:** Detect language, intent, and relevant context.
3. **Retrieve:** Fetch the minimum relevant page, learning, and memory context.
4. **Decide:** Determine whether the request is an explanation, teaching activity, navigation, or action.
5. **Clarify if needed:** Ask one concise question when essential information is missing.
6. **Authorize:** Check permissions and obtain confirmation for consequential actions.
7. **Execute:** Call the appropriate application capability.
8. **Verify:** Inspect the returned result or state.
9. **Respond:** Explain what happened in the user's language and preferred voice.
10. **Remember:** Save relevant learning or task outcomes through the approved memory mechanism.

For multi-step tasks, communicate meaningful progress without narrating every internal operation. If a step fails, state what failed and what remains undone.

## 12. Settings → Virtual Tutor

The Settings page should include a dedicated **Virtual Tutor** section with:

- Enable/disable Virtual Tutor.
- Enable/disable wake-word activation.
- Editable wake phrase, defaulting to “Hey Virtual Tutor.”
- Three selectable voice options.
- Voice preview for each option.
- Preferred language behavior, including automatic language matching.
- Microphone permission and listening-state explanation.
- Text interaction fallback.
- Relevant privacy and memory disclosures/controls consistent with the application's policy.

Do not assume a specific UI layout, component library, or settings storage mechanism until the repository has been reviewed.

## 13. Security, privacy, and safety

- Authenticate every user-specific request.
- Enforce per-user data isolation.
- Apply least privilege to all tools and integrations.
- Treat page content, uploaded files, code, terminal output, and repository content as untrusted data.
- Protect against prompt injection from webpages, source files, comments, issues, and tool outputs.
- Never execute arbitrary commands or code on the host without the application's sandbox and authorization model.
- Use a sandboxed code execution service with resource/time limits where code execution is supported.
- Require confirmation for destructive, externally visible, or security-sensitive actions.
- Never expose secrets in responses or logs.
- Provide clear feedback when microphone or account permissions are missing.
- Respect user cancellation and stop an in-progress action where technically possible.
- Keep audit records for consequential operations without retaining unnecessary sensitive content.

## 14. Reliability and failure handling

The tutor must:
- Distinguish an intended action from an attempted action and a confirmed successful action.
- Handle network errors, provider outages, timeouts, missing permissions, unavailable content, and tool failures.
- Avoid hallucinating lesson content, progress, code output, GitHub state, or action results.
- Retry only when safe and appropriate; avoid duplicate writes.
- Explain limitations and offer a safe next step.
- Preserve user work when an operation fails.
- Provide text fallback if voice services fail.
- Avoid claiming real-time wake-word support if the browser/device environment cannot support it reliably.

## 15. Acceptance criteria

The feature should not be considered complete until the following behaviors have been tested:

### Voice and invocation
- The orb is accessible across supported pages.
- Clicking it opens the tutor.
- “Hey Virtual Tutor” activates it when wake-word listening is enabled and supported.
- The user can change the wake phrase in Settings → Virtual Tutor.
- All three voice options can be previewed and selected.
- The selected voice persists.
- The user can interrupt speech and use text fallback.

### Language
- English, Hindi, Marathi, Urdu, and Hinglish inputs are handled to the supported quality level.
- The tutor naturally follows language switching.
- Technical identifiers and code remain accurate.

### Learning continuity
- The tutor can retrieve verified historical topic activity.
- It can distinguish previously studied topics from topics not yet studied.
- It can retrieve actual course and lesson progress.
- It can explain actual Learn topic content and code examples.
- It can retrieve the three actual practice questions for a topic.
- It can understand challenge attempts and results where recorded.
- It does not fabricate learning history.

### Teaching and viva
- The tutor explains concepts at an appropriate level.
- It asks practice questions one at a time.
- It conducts a viva from selected or completed topics.
- It evaluates answers with useful explanations.
- It produces a revision plan based on actual performance data.

### Website operations
- It can navigate to supported pages.
- It can open relevant lessons and editor contexts.
- It can write and modify code only within authorized editor capabilities.
- It can run code only through the supported execution mechanism and report actual results.
- It can perform GitHub operations only when connected and authorized.
- It confirms consequential actions and verifies outcomes.
- It does not claim success after failed or unconfirmed operations.

### Memory and security
- Relevant learning history persists across sessions.
- Memory is scoped to the correct user.
- Sensitive credentials are never stored in tutor memory.
- Server-side authorization prevents unauthorized actions.
- Prompt injection in page or repository content cannot override system permissions.
- Users receive clear privacy disclosures and appropriate controls.

## 16. Repository review required before implementation

This document is based on the requirements discussed and the supplied screenshots. It is not yet a repository audit.

Before implementation, inspect the actual GitHub repository and document:

1. Framework, language, package manager, build system, and application architecture.
2. Routing and page structure.
3. Authentication and user/session model.
4. Database schema and existing learning-progress records.
5. Courses, lesson player, completion, daily progress, and offline-save implementation.
6. Learn topic content model, summaries, practice questions, and topic completion.
7. Code Challenge implementation and its relationship to Practice and the editor.
8. Current code editor, code execution environment, and persistence model.
9. Code Logic Builder status and intended integration.
10. Existing GitHub integration and permission model.
11. Existing AI provider, speech input/output, and streaming infrastructure.
12. Settings architecture and user preference persistence.
13. Existing tests, error handling, logging, and deployment constraints.

After the audit, update this document with:
- Verified current architecture.
- Existing components/services that should be reused.
- Missing capabilities and required changes.
- Data model and API contracts.
- Voice provider/model options and their costs/limitations.
- Security and permission design.
- Phased implementation plan.
- Test plan and measurable acceptance criteria.

Do not invent repository paths, files, APIs, dependencies, database tables, or completed features. Mark anything not verified as **Unknown / Requires repository inspection**.

## 17. Product decisions that must remain open until repository review

- Whether wake-word detection can run reliably in the target browser/device environment.
- Which speech recognition and speech synthesis providers meet language, latency, quality, privacy, and budget requirements.
- Whether actual model fine-tuning is technically and financially feasible.
- How tutor memory is stored, retrieved, retained, and controlled.
- Which code execution sandbox is used.
- Which GitHub operations are already implemented and which need to be added.
- Whether Code Challenge remains a separate page.
- How Code Logic Builder differs from Code Challenge and topic Practice.
- Whether the tutor can access video transcripts/captions or only lesson metadata.

## 18. Guiding principle

Build the Virtual Tutor around the learner's real activity and the application's real capabilities. It should remember what the learner has genuinely studied, understand what they are currently doing, teach and assess them effectively, and carry out authorized website tasks reliably.

**Never substitute a confident-sounding response for verified context, permission, execution, or results.**

When virtual tutor is active, this will be shown ![alt text](image.png) {it is a reactbits.dev component https://reactbits.dev/animations/strands?speed=2.45&listening=true&colors=afafaf,afafaf,000000,000000,afafaf,afafaf,afafaf&glassSize=0.5&rim=0.7&intensity=0.6&waviness=2.5&energy=1&glow=0.9&taper=1.2&thickness=0.3&amplitude=1.05&saturation=1.05&dispersion=0&spread=1.4} prompt to implement this:
## Integrate the <Strands /> component from React Bits

You are helping integrate an open-source React component into an existing application.

### Component: Strands
### Variant: JavaScript + CSS


---

### Usage Example
```jsx
import Strands from './Strands';

<div style={{ width: '100%', height: '480px', position: 'relative' }}>
  <Strands />
</div>

<div style={{ width: '100%', height: '480px', position: 'relative' }}>
  <Strands listening />
</div>

<div style={{ width: '100%', height: '480px', position: 'relative' }}>
  <Strands level={micLevel} />
</div>

<div style={{ width: '100%', height: '320px', position: 'relative' }}>
  <Strands glass={false} energy={0.6}
  colors={["#afafaf","#afafaf","#000000","#000000","#afafaf","#afafaf","#afafaf"]}
  speed={2.45}
  amplitude={1.05}
  waviness={2.5}
  energy={1}
  thickness={0.3}
  spread={1.4}
  glow={0.9}
  taper={1.2}
  intensity={0.6}
  saturation={1.05}
  glassSize={0.5}
  rim={0.7}
  dispersion={0}
  listening
/>
</div>
```

### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| colors | string[] | Siri palette | Colors of the strands, in order: the red top edge of the bulge, orange, amber, the warm white core, cyan, blue and deep blue. Fewer colors are spread across these roles. |
| count | number | 3 | How many strands show inside the bulge of light, from 1 to 3. |
| speed | number | 1 | How fast the light turns. 0 holds it still. |
| amplitude | number | 1 | How tall the arch rises and how deeply the ribbon curves. |
| waviness | number | 1 | How tightly the ribbon twists along its length. |
| energy | number | 0.65 | How lively the light is on its own, from 0 to 1. 0 rests as a calm white line, 1 keeps the ribbons fully open. |
| thickness | number | 1 | How thick the edges of the light are, and the white core where the ribbon turns edge-on. |
| spread | number | 1 | How wide the ribbon opens, fanning its colors out. |
| glow | number | 1 | Strength of the soft glow around the light. |
| taper | number | 1 | How quickly the light fades toward the sides of the orb. |
| intensity | number | 1 | Overall brightness of the light. |
| saturation | number | 1 | Color saturation of the light. 0 is greyscale. |
| hueShift | number | 0 | Rotates the colors of the light around the color wheel, from 0 to 1. |
| scale | number | 1 | Width of the light. |
| glass | boolean | true | Shows the glass orb. Turn it off for the light on its own. |
| glassSize | number | 1 | Size of the glass orb. |
| refraction | number | 1 | How strongly the edge of the glass bends the light, wrapping the colors around its rim. |
| rim | number | 1 | Brightness of the glass rim and the light it catches. |
| dispersion | number | 1 | Amount of rainbow color separation along the edge of the glass. |
| listening | boolean | false | Animates the orb as if it were hearing someone speak. |
| level | number | undefined | Drives the orb from your own audio level, from 0 to 1, for example a microphone volume. Overrides listening. |
| interactive | boolean | true | The light tilts toward the cursor and stirs as it gets close. |
| clickPulse | boolean | true | Clicking sends a burst of motion through the light. |
| intro | boolean | true | The orb fades in and the light unfolds from the center when it first appears. |
| lightMode | boolean | false | For light pages. The orb turns into frosted white glass and the strands use deeper colors with a warm core. |
| opacity | number | 1 | Overall opacity. |
| maxDevicePixelRatio | number | 2 | Highest pixel ratio the canvas renders at. |
| className | string | '' | Extra class names for the container. |
| style | CSSProperties | - | Inline styles for the container. |

### Full Component Source
```jsx
'use client';

import { useEffect, useRef } from 'react';
import './Strands.css';

const MAX_COLORS = 8;
const ROLES = 7;

const VERT = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAG = `#version 300 es
precision highp float;

uniform vec2 uResolution;
uniform vec3 uMotion;
uniform float uLevel;
uniform vec3 uColors[8];
uniform int uCount;
uniform float uAmplitude;
uniform float uWaviness;
uniform float uThickness;
uniform float uGlow;
uniform float uTaper;
uniform float uSpread;
uniform float uHueShift;
uniform float uIntensity;
uniform float uSaturation;
uniform float uScale;
uniform float uGlass;
uniform float uRadius;
uniform float uRefraction;
uniform float uDispersion;
uniform float uRim;
uniform vec2 uLean;
uniform float uIntro;
uniform float uPulse;
uniform float uLight;
uniform float uOpacity;

out vec4 fragColor;

const int NB = 10;
const float PI = 3.14159265;

vec3 hueRotate(vec3 c, float a) {
  const mat3 toYiq = mat3(0.299, 0.596, 0.211, 0.587, -0.274, -0.523, 0.114, -0.322, 0.312);
  const mat3 toRgb = mat3(1.0, 1.0, 1.0, 0.956, -0.272, -1.106, 0.621, -0.647, 1.703);
  vec3 yiq = toYiq * c;
  float ca = cos(a);
  float sa = sin(a);
  yiq.yz = mat2(ca, sa, -sa, ca) * yiq.yz;
  return max(toRgb * yiq, 0.0);
}

vec3 grade(vec3 c) {
  float g = dot(c, vec3(0.2126, 0.7152, 0.0722));
  c = clamp(mix(vec3(g), c, 1.5 * uSaturation), 0.0, 1.0);
  return hueRotate(c, uHueShift * 6.2831853);
}

vec3 lightInk(vec3 L, float halo, vec3 body) {
  vec3 Lg = grade(L);
  float lum = dot(Lg, vec3(0.2126, 0.7152, 0.0722));
  float cov = 1.0 - exp(-lum * 2.6);
  vec3 hue = Lg / max(max(Lg.r, max(Lg.g, Lg.b)), 1e-4);
  float white = pow(clamp(min(hue.r, min(hue.g, hue.b)), 0.0, 1.0), 1.4);
  vec3 ink = pow(hue, vec3(2.2)) * 0.88;
  float coreAmt = white * smoothstep(0.05, 2.2, lum) * 0.92;
  vec3 cream = mix(mix(uColors[3], vec3(1.0), 0.3), vec3(1.0, 0.985, 0.95), smoothstep(1.2, 3.5, lum));
  vec3 c = mix(body, vec3(0.66, 0.69, 0.76), halo * 0.32);
  c = mix(c, ink, cov * (1.0 - white));
  return mix(c, cream, clamp(coreAmt, 0.0, 1.0));
}

float sstep(float a, float b, float x) {
  float t = clamp((x - a) / (b - a), 0.0, 1.0);
  return t * t * (3.0 - 2.0 * t);
}

float erfa(float x) {
  float a = abs(x);
  float t = 1.0 / (1.0 + 0.3275911 * a);
  float y = 1.0 - ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * exp(-a * a);
  return x < 0.0 ? -y : y;
}

vec3 grad4(vec3 c0, vec3 c1, vec3 c2, vec3 c3, float p1, float p2, float f) {
  vec3 c = mix(c0, c1, sstep(0.0, p1, f));
  c = mix(c, c2, sstep(p1, p2, f));
  return mix(c, c3, sstep(p2, 1.0, f));
}

float smaxk(float a, float b, float k) {
  float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
  return mix(a, b, h) + k * h * (1.0 - h);
}

vec2 sheetW(float tt, float H, float sig, float sigB, float ridges) {
  float ew = 0.04 * uThickness;
  float res0;
  float res1;
  for (int pass = 0; pass < 2; pass++) {
    float sg = pass == 0 ? sig : sigB;
    float fill = 0.5 * (erfa(tt / sg) - erfa((tt - H) / sg)) / H;
    float se = sqrt(sg * sg + 0.25 * ew * ew * H * H);
    float de = (tt - H + 0.5 * ew * H) / se;
    float eg = exp(-de * de) / (se * 1.7724539);
    float rgw = sqrt(sg * sg + 0.0025 * H * H);
    float d1 = (tt - 0.45 * H) / rgw;
    float d2 = (tt - 0.241 * H) / rgw;
    float rid = 0.04 * (exp(-d1 * d1) * step(1.5, ridges) + 0.7 * exp(-d2 * d2) * step(2.5, ridges)) / (rgw * 1.7724539);
    float v = 0.6 * fill * (1.0 - 0.55 * uLight) + (1.6 * ew * 0.886 * eg + rid) * (1.0 + 1.3 * uLight);
    if (pass == 0) res0 = v;
    else res1 = v;
  }
  return vec2(res0, res1);
}

float axis(float x) {
  float a = uAmplitude;
  return -0.2318 + uLean.y * 0.06 + (-0.2394 + uLean.x * 0.1) * x + 0.2815 * a * x * x + 0.3368 * a * x * x * x;
}

float softp(float z) {
  return 0.03 * log(1.0 + exp(clamp(z / 0.03, -60.0, 60.0)));
}

vec3 light(vec2 u, float fp, float bend, float level, out float halo) {
  float amp = level < 0.65 ? mix(0.25, 1.0, sstep(0.0, 0.65, level)) : mix(1.0, 1.12, (level - 0.65) / 0.35);
  float grow = clamp((amp - 0.25) / 0.75, 0.0, 1.25);
  float x = u.x / uScale;
  float uy = u.y;
  float ya = axis(x);
  float taper = max(uTaper, 0.05);
  float bx = 0.0437 + uMotion.z + uLean.x * 0.08;
  float bump = exp(-pow((x - bx) / (0.6879 * taper), 2.0));
  float hW = 0.02 + softp(-0.12 + 0.5324 * uAmplitude * grow * uMotion.y * bump - 0.02);
  float k = 1.0 * uWaviness;
  float cphi = cos(0.5 * PI + k * (x + 0.0664) + uMotion.x);
  float envC = (0.0886 + 0.3 * exp(-pow((x - 0.0634) / 0.6873, 2.0))) * uSpread * grow;
  float hC = -envC * tanh(cphi / 0.6);
  float th = 0.051 * uThickness * exp(-pow(cphi / 0.5, 2.0));
  float sig = sqrt(pow(0.005 + 0.05 * bend, 2.0) + fp * fp + th * th);
  float sigB = sqrt(0.0064 * max(uGlow, 0.05) * max(uGlow, 0.05) + fp * fp + th * th);
  float mend = exp(-pow(abs((x + 0.0421) / (0.4235 * taper)), 2.2689));
  vec3 red = uColors[0];
  vec3 orange = uColors[1];
  vec3 amber = uColors[2];
  vec3 warmWhite = uColors[3];
  vec3 cyan = uColors[4];
  vec3 blue = uColors[5];
  vec3 deep = uColors[6];
  vec3 orangeEdge = orange * vec3(1.0, 0.85, 0.77);
  vec3 coolCore = mix(warmWhite, vec3(1.0, 1.0, 0.7), 0.6);
  vec3 mint = clamp(mix(cyan, warmWhite, 0.35) * vec3(0.92, 1.05, 0.95), 0.0, 1.0);
  float ridges = float(uCount);
  float glow = max(uGlow, 0.0);
  vec3 L = vec3(0.0);
  vec3 Lb = vec3(0.0);
  {
    float H = max(abs(hW), 1e-4);
    float tt = uy - ya;
    vec2 w = sheetW(tt, H, sig, sigB, ridges);
    float f = clamp(tt / H, 0.0, 1.0);
    vec3 c = grad4(warmWhite, amber, orange, orangeEdge, 0.2351, 0.5643, f);
    c = mix(c, red, sstep(0.75, 1.0, f) * sstep(0.196, 0.3376, hW));
    vec3 mean = (grad4(warmWhite, amber, orange, orangeEdge, 0.2351, 0.5643, 0.1) + grad4(warmWhite, amber, orange, orangeEdge, 0.2351, 0.5643, 0.35) + grad4(warmWhite, amber, orange, orangeEdge, 0.2351, 0.5643, 0.6) + grad4(warmWhite, amber, orange, orangeEdge, 0.2351, 0.5643, 0.9)) * 0.25;
    L += mix(c, mean, sstep(0.3, 1.2, sig / H)) * (w.x * 0.2101 * mend);
    Lb += mix(c, mean, sstep(0.3, 1.2, sigB / H)) * (w.y * 0.2101 * mend);
  }
  {
    float H = max(abs(hC), 1e-4);
    float tt = (uy - ya) * (hC >= 0.0 ? 1.0 : -1.0);
    vec2 w = sheetW(tt, H, sig, sigB, 1.0);
    float f = clamp(tt / H, 0.0, 1.0);
    vec3 c = grad4(coolCore, cyan, blue, deep, 0.15, 0.7931, f);
    vec3 mean = (grad4(coolCore, cyan, blue, deep, 0.15, 0.7931, 0.1) + grad4(coolCore, cyan, blue, deep, 0.15, 0.7931, 0.35) + grad4(coolCore, cyan, blue, deep, 0.15, 0.7931, 0.6) + grad4(coolCore, cyan, blue, deep, 0.15, 0.7931, 0.9)) * 0.25;
    L += mix(c, mean, sstep(0.3, 1.2, sig / H)) * (w.x * 0.28 * mend);
    Lb += mix(c, mean, sstep(0.3, 1.2, sigB / H)) * (w.y * 0.28 * mend);
  }
  vec3 G = vec3(0.0);
  float wh = sqrt(0.0256 + envC * envC * cphi * cphi);
  float dg = (uy - ya) / wh;
  G += vec3(1.0, 0.97, 0.92) * (exp(-dg * dg) * 0.0315 / wh * mend * glow);
  float nx = -0.0664 - uMotion.x / k + 0.2168;
  float bxx = (x - nx) / 0.1849;
  float byy = (uy - axis(nx) - 0.0333) / (0.0544 * mix(0.7, 1.0, min(amp, 1.0)));
  G += mint * (exp(-bxx * bxx - byy * byy) * 1.4 * glow * sstep(0.0, 0.6, amp));
  float hb = (uy - ya - 0.3 * hW) / (0.07 + 0.45 * hW + 0.3 * envC);
  halo = exp(-hb * hb) * mend * smoothstep(0.0, 0.3, uIntro);
  vec3 total = L + 0.16 * glow * Lb + 1.16 * G;
  return total * 2.4 * uIntensity * smoothstep(0.0, 0.3, uIntro) * sstep(uIntro * 1.6, uIntro * 1.6 - 0.5, abs(x));
}

vec2 remap(vec2 p, float f, out float r, out float bend) {
  r = min(length(p), 0.9995);
  bend = pow(r, 5.17);
  float k = clamp(uRefraction, 0.0, 1.8);
  float sc = (1.0 - 0.278 * k * (1.0 - bend)) * (1.0 - 0.632 * k * bend) / (1.0 - 0.278 * k);
  return p * sc * f;
}

void main() {
  vec2 res = uResolution;
  vec2 p = (gl_FragCoord.xy - 0.5 * res) / min(res.x, res.y);
  float level = clamp(uLevel, 0.0, 1.0);
  float appear = smoothstep(0.0, 0.35, uIntro);

  if (uGlass > 0.5) {
    float R = uRadius * mix(0.94, 1.0, uIntro) * (1.0 + 0.03 * uPulse);
    float px = 1.0 / (min(res.x, res.y) * R);
    vec2 pc = p / R;
    float rho = length(pc);
    if (rho > 1.0 + 2.0 * px) {
      float sh = uLight * 0.07 * exp(-pow((rho - 0.985) / 0.07, 2.0)) * smoothstep(-0.6, 0.4, -pc.y) * appear * uOpacity;
      fragColor = vec4(0.0, 0.0, 0.0, sh);
      return;
    }
    float r;
    float bend;
    vec2 u = remap(pc, 1.0, r, bend);
    float fp = 0.5 * max(length(dFdx(u)), length(dFdy(u)));
    float halo;
    float skip;
    vec3 L = light(u, fp, bend, level, halo);
    float ca = 0.02 * uDispersion * bend;
    if (ca > 0.0015) {
      float r2;
      float b2;
      L.r = light(remap(pc, 1.0 - ca, r2, b2), fp, bend, level, skip).r;
      L.b = light(remap(pc, 1.0 + ca, r2, b2), fp, bend, level, skip).b;
    }
    vec3 col = 1.0 - exp(-L);
    vec2 d = pc / max(rho, 1e-6);
    float key = 0.4 * pow(max(0.0, d.x * 0.94 - d.y * 0.34), 6.0) + 0.2 * pow(max(0.0, -d.x * 0.5 + d.y * 0.87), 6.0);
    float ring = exp(-pow((r - 0.985) / 0.011, 2.0));
    float hzk = 0.25 + 0.7 * pow(max(0.0, -d.x * 0.6 + d.y * 0.8), 2.0) + pow(max(0.0, d.x * 0.8 - d.y * 0.6), 2.0);
    float haze = exp(-pow((1.0 - r) / 0.09, 2.0)) * hzk * 0.13 * uRim;
    vec3 orb;
    if (uLight > 0.5) {
      float lz = dot(d * r, vec2(-0.55, 0.83));
      vec3 body = mix(vec3(0.885, 0.893, 0.915), vec3(0.972, 0.975, 0.983), 0.5 + 0.5 * lz);
      float fres = smoothstep(0.8, 1.0, r);
      body = mix(body, vec3(0.82, 0.83, 0.86), fres * fres * 0.5);
      orb = lightInk(L, halo, body);
      float spec = exp(-pow((r - 0.955) / 0.03, 2.0)) * pow(max(0.0, dot(d, vec2(-0.55, 0.83))), 3.0);
      orb = mix(orb, vec3(1.0), clamp(spec * 0.85 * uRim + haze * 0.6, 0.0, 1.0));
      float edge = exp(-pow((1.0 - r) / (0.01 + 1.2 * px), 2.0));
      orb *= 1.0 - 0.12 * edge;
    } else {
      orb = vec3(0.04) + col * (1.0 + 0.1 * bend * uRim) + ring * key * uRim * (1.0 + 0.4 * level) + haze * vec3(1.0, 1.02, 1.04);
      orb = grade(clamp(orb, 0.0, 1.0));
    }
    float inside = clamp((1.0 - rho) / px + 0.5, 0.0, 1.0) * appear;
    vec3 rgb = orb * inside;
    fragColor = vec4(rgb, max(inside * mix(0.92, 1.0, uLight), max(max(rgb.r, rgb.g), rgb.b))) * uOpacity;
  } else {
    float span = 0.5 * res.x / min(res.x, res.y);
    vec2 u = p * (0.78 / span) + vec2(0.0, -0.15);
    float fp = 0.5 * max(length(dFdx(u)), length(dFdy(u)));
    float halo;
    float fade = sstep(0.82, 0.55, abs(u.x));
    vec3 L = light(u, fp, 0.0, level, halo) * fade;
    vec3 col = grade(1.0 - exp(-L)) * appear;
    if (uLight > 0.5) {
      vec3 c = lightInk(L, halo * fade * 0.6, vec3(1.0));
      float a = clamp(1.0 - min(c.r, min(c.g, c.b)), 0.0, 1.0) * appear;
      fragColor = vec4((c - (1.0 - a)) * appear, a) * uOpacity;
    } else {
      fragColor = vec4(col, max(max(col.r, col.g), col.b)) * uOpacity;
    }
  }
}
`;

const hexToRgb = hex => {
  let h = String(hex).replace('#', '').trim();
  if (h.length === 3) h = h.replace(/(.)/g, '$1$1');
  const v = parseInt(h.slice(0, 6), 16);
  if (!isFinite(v)) return [1, 1, 1];
  return [((v >> 16) & 255) / 255, ((v >> 8) & 255) / 255, (v & 255) / 255];
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const compile = (gl, type, source) => {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  return shader;
};

const createProgram = gl => {
  const program = gl.createProgram();
  gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERT));
  gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAG));
  gl.bindAttribLocation(program, 0, 'position');
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;
  return program;
};

const smooth = (a, b, x) => {
  const k = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return k * k * (3 - 2 * k);
};

const speech = t => {
  const phrase = smooth(-0.8, -0.3, 0.6 * Math.sin(t * 2.7) + 0.5 * Math.sin(t * 1.53 + 1.2));
  const syllable = Math.max(0, Math.sin(t * 17 + 1.6 * Math.sin(t * 5.3)));
  const stress = 0.6 + 0.4 * Math.sin(t * 3.7 + 0.7);
  return phrase * (0.35 + 0.65 * syllable) * (0.25 + stress);
};

const DEFAULT_COLORS = ['#d95b56', '#ba5046', '#ffa24c', '#ffe0b3', '#93f1ff', '#3569fa', '#193d9b'];

export default function Strands({
  colors = DEFAULT_COLORS,
  count = 3,
  speed = 1,
  amplitude = 1,
  waviness = 1,
  thickness = 1,
  glow = 1,
  taper = 1,
  spread = 1,
  hueShift = 0,
  intensity = 1,
  saturation = 1,
  opacity = 1,
  scale = 1,
  glass = true,
  refraction = 1,
  dispersion = 1,
  glassSize = 1,
  rim = 1,
  energy = 0.65,
  listening = false,
  level,
  interactive = true,
  clickPulse = true,
  intro = true,
  lightMode = false,
  maxDevicePixelRatio = 2,
  className = '',
  style
}) {
  const containerRef = useRef(null);
  const propsRef = useRef(null);
  propsRef.current = {
    colors,
    count,
    speed,
    amplitude,
    waviness,
    thickness,
    glow,
    taper,
    spread,
    hueShift,
    intensity,
    saturation,
    opacity,
    scale,
    glass,
    refraction,
    dispersion,
    glassSize,
    rim,
    energy,
    listening,
    level,
    interactive,
    clickPulse,
    intro,
    lightMode,
    maxDevicePixelRatio
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const canvas = document.createElement('canvas');
    canvas.style.display = 'block';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.setAttribute('aria-hidden', 'true');
    const gl = canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: true, antialias: false });
    if (!gl) return;
    container.appendChild(canvas);

    let program = null;
    let buffer = null;
    let loc = {};
    const names = [
      'uResolution',
      'uMotion',
      'uLevel',
      'uColors',
      'uCount',
      'uAmplitude',
      'uWaviness',
      'uThickness',
      'uGlow',
      'uTaper',
      'uSpread',
      'uHueShift',
      'uIntensity',
      'uSaturation',
      'uScale',
      'uGlass',
      'uRadius',
      'uRefraction',
      'uDispersion',
      'uRim',
      'uLean',
      'uIntro',
      'uPulse',
      'uLight',
      'uOpacity'
    ];
    const setup = () => {
      const next = createProgram(gl);
      if (!next) return false;
      program = next;
      buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
      gl.useProgram(next);
      loc = Object.fromEntries(names.map(name => [name, gl.getUniformLocation(next, name)]));
      gl.disable(gl.BLEND);
      gl.clearColor(0, 0, 0, 0);
      return true;
    };
    if (!setup()) {
      canvas.remove();
      return;
    }

    const query =
      typeof window.matchMedia === 'function' ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
    const st = {
      clock: 0,
      pace: 0,
      activity: 0,
      hover: 0,
      hoverTarget: 0,
      burst: 0,
      lean: [0, 0],
      leanTarget: [0, 0],
      pulse: 0,
      pulseV: 0,
      introStart: -1,
      intro: propsRef.current.intro ? 0 : 1,
      visible: typeof IntersectionObserver === 'undefined',
      lost: false,
      raf: 0,
      last: 0,
      width: 0,
      height: 0,
      speechT: 0,
      paletteKey: '',
      palette: { flat: new Float32Array(MAX_COLORS * 3), count: 1 }
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, Math.max(0.5, propsRef.current.maxDevicePixelRatio));
      const w = Math.max(1, Math.round(container.clientWidth * dpr));
      const h = Math.max(1, Math.round(container.clientHeight * dpr));
      if (w !== st.width || h !== st.height) {
        st.width = w;
        st.height = h;
        canvas.width = w;
        canvas.height = h;
      }
    };

    const updatePalette = list => {
      const key = list.join(',');
      if (key === st.paletteKey) return;
      st.paletteKey = key;
      const rgb = (list.length ? list : DEFAULT_COLORS).slice(0, MAX_COLORS).map(hexToRgb);
      const flat = new Float32Array(MAX_COLORS * 3);
      for (let i = 0; i < ROLES; i++) {
        const t = rgb.length > 1 ? (i / (ROLES - 1)) * (rgb.length - 1) : 0;
        const a = Math.floor(t);
        const b = Math.min(a + 1, rgb.length - 1);
        const f = t - a;
        flat.set(
          rgb[a].map((c, k) => c + (rgb[b][k] - c) * f),
          i * 3
        );
      }
      st.palette = { flat, count: ROLES };
    };

    const draw = () => {
      if (st.lost || !program) return;
      const p = propsRef.current;
      updatePalette(Array.isArray(p.colors) ? p.colors : []);
      gl.viewport(0, 0, st.width, st.height);
      gl.uniform2f(loc.uResolution, st.width, st.height);
      const c = st.clock;
      const sway = 0.75 + 0.45 * st.pace;
      gl.uniform3f(
        loc.uMotion,
        (0.26 * Math.sin(0.53 * c) + 0.1 * Math.sin(1.19 * c + 1.3)) * sway,
        1 + (0.06 * Math.sin(0.71 * c) + 0.035 * Math.sin(1.37 * c + 0.4)) * sway,
        0.06 * Math.sin(0.41 * c + 2) * sway
      );
      gl.uniform1f(loc.uLevel, clamp(st.activity, 0, 1));
      gl.uniform3fv(loc.uColors, st.palette.flat);
      gl.uniform1i(loc.uCount, clamp(Math.round(p.count), 1, 3));
      gl.uniform1f(loc.uAmplitude, p.amplitude);
      gl.uniform1f(loc.uWaviness, p.waviness);
      gl.uniform1f(loc.uThickness, p.thickness);
      gl.uniform1f(loc.uGlow, p.glow);
      gl.uniform1f(loc.uTaper, Math.max(0.05, p.taper));
      gl.uniform1f(loc.uSpread, p.spread);
      gl.uniform1f(loc.uHueShift, p.hueShift);
      gl.uniform1f(loc.uIntensity, p.intensity);
      gl.uniform1f(loc.uSaturation, p.saturation);
      gl.uniform1f(loc.uScale, Math.max(0.05, p.scale));
      gl.uniform1f(loc.uGlass, p.glass ? 1 : 0);
      gl.uniform1f(loc.uRadius, 0.42 * p.glassSize);
      gl.uniform1f(loc.uRefraction, p.refraction);
      gl.uniform1f(loc.uDispersion, p.dispersion);
      gl.uniform1f(loc.uRim, p.rim);
      gl.uniform2f(loc.uLean, st.lean[0], st.lean[1]);
      gl.uniform1f(loc.uIntro, st.intro);
      gl.uniform1f(loc.uPulse, st.pulse);
      gl.uniform1f(loc.uLight, p.lightMode ? 1 : 0);
      gl.uniform1f(loc.uOpacity, p.opacity);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const frame = now => {
      st.raf = 0;
      const p = propsRef.current;
      const dt = st.last ? clamp((now - st.last) / 1000, 0, 0.05) : 0;
      st.last = now;
      const reduced = !!query?.matches;
      if (st.introStart < 0 && st.visible) st.introStart = now;
      if (p.intro && !reduced && st.introStart >= 0) {
        const t = clamp((now - st.introStart) / 1400, 0, 1);
        st.intro = 1 - Math.pow(1 - t, 3);
      } else {
        st.intro = 1;
      }
      st.hover += (st.hoverTarget - st.hover) * (1 - Math.exp(-dt / (st.hoverTarget > st.hover ? 0.25 : 0.6)));
      for (let i = 0; i < 2; i++) st.lean[i] += (st.leanTarget[i] - st.lean[i]) * (1 - Math.exp(-dt / 0.35));
      st.pulseV += (-170 * st.pulse - 14 * st.pulseV) * dt;
      st.pulse += st.pulseV * dt;
      st.burst *= Math.exp(-dt / 0.45);
      if (p.listening && !reduced) st.speechT += dt;
      const voice =
        typeof p.level === 'number' ? clamp(p.level, 0, 1) : p.listening && !reduced ? speech(st.speechT) : 0;
      const target = Math.min(1.2, Math.max(clamp(p.energy, 0, 1), voice) + st.hover * 0.18 + st.burst);
      st.activity += (target - st.activity) * (1 - Math.exp(-dt / (target > st.activity ? 0.12 : 0.4)));
      st.pace += (Math.min(1, st.activity) - st.pace) * (1 - Math.exp(-dt / 0.8));
      if (!reduced) {
        st.clock += dt * p.speed * (0.6 + 1.6 * st.pace);
      }
      draw();
      const settled =
        reduced &&
        Math.abs(st.activity - target) < 1e-3 &&
        Math.abs(st.pulse) < 1e-3 &&
        Math.abs(st.pulseV) < 1e-3 &&
        st.burst < 1e-3 &&
        Math.abs(st.hover - st.hoverTarget) < 1e-3 &&
        Math.abs(st.lean[0] - st.leanTarget[0]) < 1e-3 &&
        Math.abs(st.lean[1] - st.leanTarget[1]) < 1e-3;
      if (st.visible && !document.hidden && !st.lost && !settled) st.raf = requestAnimationFrame(frame);
    };

    const wake = () => {
      if (!st.raf && st.visible && !st.lost) {
        st.last = 0;
        st.raf = requestAnimationFrame(frame);
      }
    };

    const local = e => {
      const r = container.getBoundingClientRect();
      const m = Math.min(r.width, r.height) || 1;
      return [(e.clientX - r.left - r.width / 2) / (m / 2), (e.clientY - r.top - r.height / 2) / (m / 2)];
    };

    const onMove = e => {
      if (!propsRef.current.interactive) return;
      const [x, y] = local(e);
      st.hoverTarget = clamp(1.6 - Math.hypot(x, y), 0, 1);
      st.leanTarget = [clamp(x, -1.2, 1.2) * 0.8, clamp(-y, -1.2, 1.2) * 0.8];
      wake();
    };

    const onLeave = () => {
      st.hoverTarget = 0;
      st.leanTarget = [0, 0];
      wake();
    };

    const onDown = () => {
      if (!propsRef.current.clickPulse) return;
      st.pulseV += 5;
      st.burst = Math.min(1.2, st.burst + 0.9);
      wake();
    };

    const onLost = e => {
      e.preventDefault();
      st.lost = true;
      if (st.raf) cancelAnimationFrame(st.raf);
      st.raf = 0;
    };

    const onRestored = () => {
      st.lost = false;
      if (setup()) wake();
    };

    canvas.addEventListener('webglcontextlost', onLost);
    canvas.addEventListener('webglcontextrestored', onRestored);
    container.addEventListener('pointermove', onMove);
    container.addEventListener('pointerleave', onLeave);
    container.addEventListener('pointerdown', onDown);

    const resizeObserver = new ResizeObserver(() => {
      resize();
      draw();
    });
    resizeObserver.observe(container);
    resize();

    let intersection = null;
    if (typeof IntersectionObserver !== 'undefined') {
      intersection = new IntersectionObserver(entries => {
        st.visible = entries[entries.length - 1].isIntersecting;
        if (st.visible) wake();
      });
      intersection.observe(container);
    }
    const onVisibility = () => {
      if (!document.hidden) wake();
    };
    document.addEventListener('visibilitychange', onVisibility);
    wake();

    return () => {
      if (st.raf) cancelAnimationFrame(st.raf);
      canvas.removeEventListener('webglcontextlost', onLost);
      canvas.removeEventListener('webglcontextrestored', onRestored);
      container.removeEventListener('pointermove', onMove);
      container.removeEventListener('pointerleave', onLeave);
      container.removeEventListener('pointerdown', onDown);
      document.removeEventListener('visibilitychange', onVisibility);
      resizeObserver.disconnect();
      intersection?.disconnect();
      if (program) gl.deleteProgram(program);
      if (buffer) gl.deleteBuffer(buffer);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      canvas.remove();
    };
  }, []);

  return <div ref={containerRef} className={`strands-container ${className}`.trim()} style={style} />;
}

```

### Component CSS
```css
.strands-container {
  position: relative;
  width: 100%;
  height: 100%;
  background: transparent;
  -webkit-tap-highlight-color: transparent;
}

.strands-container canvas {
  display: block;
  width: 100%;
  height: 100%;
}

```

### Integration Instructions
1. Install any listed dependencies.
2. Copy the component source into the appropriate directory in the project.
3. Import the CSS file alongside the component.
4. Import and render the component using the usage example above as a starting point.
5. Adjust props as needed for the specific use case — refer to the props table for all available options.

### More from React Bits
The full library index, including everything reactbits.dev offers, is at https://reactbits.dev/llms.txt — fetch it if this component is not the right fit or the project needs more pieces.




There will be fallback of ai priority:
1. Gemini
2. Groq
3. Openrouter (best model)
all provier will have same memory

implement this and push to main (on github)
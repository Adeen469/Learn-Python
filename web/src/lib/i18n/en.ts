// English strings — the source of truth for every website UI string.
// Every other language file is typed as `Strings`, so TypeScript errors
// if any key is missing. Dynamic strings are functions so each language
// can apply its own grammar (plurals, word order, units).
//
// REUSE rule: keys copied from the app's en.ts are VERBATIM — same key,
// same English wording, same function shape. Website-only keys are
// fresh. See ./README.md for the harmonisation decisions behind the
// wording choices (e.g. "Video Courses" → "Courses").
//
// Scope: UI chrome ONLY. Content stays in English and is never passed
// through here: lesson/video titles (use the titles maps in ./titles),
// course/creator names, notes text, AI tutor answers, tutorial prose
// (see ../learn/i18n), roadmap blurbs (see ./blurbs).
// "Learn Python" is the product name and stays identical in most
// languages (translators may transliterate it only if natural).

import type { Strings } from "./index";

export const en: Strings = {
  common: {
    appName: "Learn Python",
    signIn: "Sign in",
    signOut: "Sign out",
    email: "Email",
    password: "Password",
    genericError: "Something went wrong. Please try again.",
    backToSignIn: "Back to sign in",
    retry: "Retry",
    cancel: "Cancel",
    completed: "Completed",
    watchedPct: (pct: number) => `Watched ${pct}%`,
    notStarted: "Not started",
    duration: (totalSeconds: number) => {
      const s = Math.max(0, Math.round(totalSeconds));
      const h = Math.floor(s / 3600);
      const m = Math.floor((s % 3600) / 60);
      const sec = s % 60;
      const mm = String(m).padStart(2, "0");
      const ss = String(sec).padStart(2, "0");
      return h > 0 ? `${h}:${mm}:${ss}` : `${m}:${ss}`;
    },
    durationTotal: (totalSeconds: number) => {
      const totalMinutes = Math.floor(totalSeconds / 60);
      const h = Math.floor(totalMinutes / 60);
      const m = totalMinutes % 60;
      return h > 0 ? `${h}h ${m}m` : `${m}m`;
    },
    sixDigitCodeLabel: "6-digit code",
    roadmap: "Roadmap",
    settings: "Settings",
    aiTutor: "AI Tutor",
    close: "Close",
    all: "All",
    delete: "Delete",
    clear: "Clear",
    back: "Back",
    or: "or",
    emailAddress: "Email address",
    loading: "Loading…",
    pleaseWait: "Please wait a moment.",
    errorPageDetail:
      "This page hit an unexpected error. Try again, or head back to the dashboard.",
    backToDashboard: "Back to Dashboard",
    pageNotFound: "Page not found",
    pageNotFoundDetail:
      "The lesson or page you are looking for does not exist.",
  },
  tabs: {
    learn: "Learn",
    courses: "Courses",
    logicBuilder: "Logic Builder",
  },
  logicBuilder: {
    comingSoon: "Coming Soon",
    notifyText: "We're building Logic Builder right now. The moment it's ready, we'll let you know by email.",
  },
  learn: {
    streakChip: (n: number) =>
      n === 1 ? `Streak: ${n} day` : `Streak: ${n} days`,
  },
  courses: {
    intro: "Full Python video courses — pick a creator to start watching.",
    countVideos: (n: number) => (n === 1 ? `${n} video` : `${n} videos`),
  },
  editor: {
    title: "Code Editor",
  },
  profile: {
    statStreakLabel: "day streak",
  },
  lesson: {
    markComplete: "Mark complete",
    askTutor: "Ask AI Tutor",
    saveOffline: "Save Offline",
    savedOffline: "Saved offline",
    nextLesson: "Next →",
    upNext: "Up Next:",
  },
  course: {
    markAsComplete: "Mark as complete",
    oneShotsHeading: "One-shot videos",
    fullCourseLabel: "Full course",
    totalLabel: "total",
    playingLabel: "Playing",
    pausedLabel: "Paused",
  },
  roadmap: {
    topicsComplete: (done: number, total: number) =>
      `${done} of ${total} topics complete`,
    topicMeta: (difficulty: string, minutes: number) =>
      `${difficulty} · ${minutes} min`,
    topicDone: "✓ Done",
  },
  tutor: {
    errorSessionExpired: "Your session expired. Sign in again to keep chatting.",
    errorGeneric:
      "The tutor couldn't answer right now. Check your connection and try again.",
    errorEmptyReply: "The AI returned an empty reply — please try again.",
    youLabel: "You",
    groundedFootnote:
      "✓ From this lesson's video — timestamps point to the moment in the video.",
    notGroundedFootnote:
      "General answer — this lesson's video transcript was not available.",
    thinking: "AI is thinking…",
    askButton: "Ask",
  },
  selectionToolbar: {
    askAi: "Ask to AI",
    translate: "Translate",
    copy: "Copy",
    copied: "Copied",
    aiAnswerTitle: "AI Answer",
    translationTitle: (lang: string) => `Translation — ${lang}`,
    thinking: "AI is thinking…",
    translating: "Translating…",
    showOriginal: "Click to show the original text",
    minimize: "Minimize",
    maximize: "Maximize",
    errorGeneric: "Couldn't get an answer right now. Check your connection and try again.",
    errorSessionExpired: "Your session expired. Sign in again.",
    close: "Close",
  },
  auth: {
    continueWithGoogle: "Continue with Google",
    forgotPassword: "Forgot password?",
    createAccount: "Create account",
    namePlaceholder: "Your name",
    otpSubtitle: (email: string, purpose: "signup" | "signin") =>
      `We sent a 6-digit code to ${email || "your email"}. Enter it below to ${
        purpose === "signup" ? "verify your account" : "sign in"
      }.`,
    forgotSubtitle:
      "Enter the email you signed up with and we'll send you a reset link.",
    sendResetLink: "Send reset link",
    twoFactorTitle: "Two-factor auth",
    verifyAndSignIn: "Verify and sign in",
    couldNotSendCode: "Could not send the code. Please try again.",
    codeSentToWithExpiry: (email: string) =>
      `Code sent to ${email}. It expires in 10 minutes.`,
    couldNotSignIn: "Could not sign in. Please try again.",
    couldNotCreateAccount: "Could not create the account. Please try again.",
    codeIncorrectOrExpired: "The code is incorrect or has expired.",
    enterCodeTitle: "Enter the code",
    signInWithEmail: "Sign in with email",
    signInEmailSubtitle: "Use your email and password, or a code instead.",
    signUpEmailSubtitle: "Create your account — we'll verify your email first.",
    signInOrCreateAccount: "Sign in or create account",
    signingIn: "Signing in…",
    continueWithEmailCode: "Continue with an email code instead",
    passwordWithMinPlaceholder: "Password (at least 8 characters)",
    creatingAccount: "Creating account…",
    verifying: "Verifying…",
    verifyAndContinue: "Verify and continue",
    resendCodeIn: (cooldown: number) => `Resend code in ${cooldown}s`,
    resendCode: "Resend code",
    sending: "Sending…",
    couldNotSendEmail: "Could not send the email. Please try again.",
    resetLinkSentWithExpiry: (email: string) =>
      `If an account exists with ${email}, we've sent a password reset link. It expires in 1 hour.`,
    passwordsDontMatch: "The passwords don't match.",
    couldNotResetPassword: "Could not reset the password. Please try again.",
    resetPassword: "Reset password",
    checkingResetLink: "Checking your reset link…",
    resetLinkExpiredTitle: "Reset link expired",
    resetLinkExpiredSubtitle:
      "This reset link is invalid or has expired. Reset links work once and last 1 hour.",
    requestNewResetLink: "Request a new reset link",
    setNewPasswordTitle: "Set a new password",
    setNewPasswordSubtitle: "Choose a new password for your account.",
    passwordUpdated: "Password updated. Sign in with your new password.",
    newPasswordPlaceholder: "New password (at least 8 characters)",
    confirmNewPasswordPlaceholder: "Confirm new password",
    resetting: "Resetting…",
    codeSentToYourEmailWithExpiry:
      "Code sent to your email. It expires in 10 minutes.",
    checkingSignInStep: "Checking your sign-in step…",
    signInStepExpiredTitle: "Sign-in step expired",
    signInStepExpiredSubtitle:
      "This two-factor step only lasts 10 minutes. Sign in again to continue.",
    twoFactorEnterCodeSubtitle:
      "Enter the code from your authenticator app to finish signing in.",
    secondFactorMethodLabel: "Second-factor method",
    methodAuthenticator: "Authenticator",
    methodEmailCode: "Email code",
    methodBackupCode: "Backup code",
    emailCodeWillBeSent:
      "We'll email a 6-digit code to the address on your account.",
    sendEmailCode: "Send email code",
    backupCodesWorkOnce:
      "Backup codes work once. Find them where you saved them when you turned on two-factor authentication.",
  },
  settings: {
    dailyGoal: "Daily goal",
    streak: "Streak",
    appearance: "Appearance",
    theme: "Theme",
    themeDark: "Dark",
    themeLight: "Light",
    language: "Language",
    languageHint: "Applies to the whole app right away.",
    goalMinutes: (minutes: number) => `${minutes} min`,
    couldNotStartTwoFactorSetup: "Could not start setup. Please try again.",
    twoFactorCodeIncorrect: "The code is incorrect. Try again.",
    couldNotDisableTwoFactor: "Could not disable two-factor authentication.",
    twoFactorOff: "Two-factor authentication is off.",
    couldNotGenerateBackupCodes: "Could not generate new backup codes.",
    twoFactorSignInRequired:
      "Sign in to manage two-factor authentication for your account.",
    twoFactorGoogleManaged:
      "You signed in with Google — two-factor authentication is managed by your Google account, not here.",
    twoFactorIntro:
      "Add a second step to sign-in with Google Authenticator or an email code. Your password alone will no longer be enough.",
    twoFactorStarting: "Starting…",
    setUpTwoFactor: "Set up two-factor authentication",
    twoFactorScanQr:
      "Scan this QR code with Google Authenticator (or any authenticator app), then enter the 6-digit code it shows.",
    twoFactorQrAlt: "Two-factor setup QR code",
    cantScanEnterSecret: "Can't scan? Enter this secret manually: ",
    turnOnTwoFactor: "Turn on two-factor authentication",
    twoFactorOn: "Two-factor authentication is on.",
    twoFactorOnExplainer:
      "Sign-in asks for your authenticator code (or an email code) after your password.",
    newBackupCodes: "New backup codes",
    disable: "Disable",
    disableTwoFactorPrompt:
      "Enter your password to turn two-factor authentication off.",
    disablingTwoFactor: "Disabling…",
    disableTwoFactor: "Disable two-factor authentication",
    backupCodesTitle: "Backup codes",
    backupCodesWarning:
      "Save these somewhere safe — each code works once, and this is the only time they are shown.",
    savedBackupCodes: "I've saved these codes",
    backupCodesSaved: "Backup codes saved. Keep them somewhere safe.",
  },
  update: {
    tryAgain: "Try again",
  },
  landing: {
    heroTitle: "Learn Python programming,",
    heroWordOnline: "online",
    heroWordOffline: "offline",
    heroSubtitle:
      "Topic-by-topic tutorials, video courses, and a real code editor — from your first print() to real projects. Watch, code, and build the streak.",
    getStarted: "Get started",
    heroNote: "Free • Sign in with email or Google • Your progress stays on this device",
    statTopics: "topics",
    statVideos: "videos",
    statStages: "stages",
    featuresHeading: "Everything you need to actually finish",
    featureVideosTitle: "Videos, online & offline",
    featureVideosText:
      "Watch video lessons with or without internet — save them on your device and keep watching when the connection drops.",
    featureTutorialsTitle: "Tutorials, offline too",
    featureTutorialsText:
      "Topic-by-topic tutorials and reference entries — read them anywhere, even without internet.",
    featureEditorText:
      "Write and run real Python in the browser — Monaco editor with Pyodide, multi-file workspace, no install needed.",
    featureTutorText:
      "Stuck on a concept or an error? Ask the AI tutor anything — it answers from the lesson you're on, with examples and fixes.",
    featureGithubTitle: "GitHub, built in",
    featureGithubText:
      "Connect your GitHub account, create repos, and push your code straight from the editor — your work, versioned from day one.",
    featureGoalsTitle: "Daily goals & streaks",
    featureGoalsText:
      "Set a daily watch goal, keep the streak alive, and see today's real progress at a glance.",
    splashTagline: "Learn • Practice • Offline",
  },
  navbar: {
    continue: "Continue",
    profileMenu: "Profile menu",
    mainNavLabel: "Main",
    openMenu: "Open menu",
    closeMenu: "Close menu",
  },
  learnPage: {
    example: "Example",
    copy: "Copy",
    copied: "Copied",
    output: "Output",
    noteLabel: "Note: ",
    tipLabel: "Tip: ",
    topicNotFound: "Topic not found",
    topicNotFoundHint:
      "Pick a topic from the sidebar — every Python topic lives there.",
    tryInEditor: "Try it in the editor",
    summary: "Summary",
    practice: "Practice",
    practiceHint:
      "Try each task in the Code Editor — reading is not enough, typing it yourself is what makes it stick.",
    tutorialBeingPrepared:
      "The written tutorial for this topic is being prepared. Pick another topic from the sidebar for now — this one will appear here once it is ready.",
    previous: "Previous",
    backToPythonHome: (title: string) => `Back to ${title}`,
  },
  sidebar: {
    searchTopics: "Search topics",
    noTopicsMatch: (query: string) => `No topics match “${query}”.`,
    closeTopics: "Close topics",
    sectionPythonTutorial: "Python Tutorial",
    sectionPythonClasses: "Python Classes",
    sectionFileHandling: "File Handling",
    sectionPythonModules: "Python Modules",
    sectionPythonMatplotlib: "Python Matplotlib",
    sectionMachineLearning: "Machine Learning",
    sectionPythonDsa: "Python DSA",
    sectionPythonMysql: "Python MySQL",
    sectionPythonMongodb: "Python MongoDB",
    sectionPythonCert: "Python Cert",
    sectionPythonHowTo: "Python How To",
    sectionPythonExamples: "Python Examples",
    sectionPythonReference: "Python Reference",
    sectionModuleReference: "Module Reference",
    groupPythonArrays: "Python Arrays",
    groupPythonCasting: "Python Casting",
    groupPythonClassMethods: "Python Class Methods",
    groupPythonClassProperties: "Python Class Properties",
    groupPythonDates: "Python Dates",
    groupPythonEncapsulation: "Python Encapsulation",
    groupPythonInheritance: "Python Inheritance",
    groupPythonIterators: "Python Iterators",
    groupPythonJson: "Python JSON",
    groupPythonMagicMethods: "Python Magic Methods",
    groupPythonMath: "Python Math",
    groupPythonNone: "Python None",
    groupPythonPolymorphism: "Python Polymorphism",
    groupPythonRange: "Python Range",
    groupPythonRegex: "Python RegEx",
    groupPythonStringFormatting: "Python String Formatting",
    groupPythonTryExcept: "Python Try...Except",
    groupPythonInitMethod: "Python __init__ Method",
    groupPythonSelfParameter: "Python self Parameter",
  },
  quiz: {
    testLabel: "Test",
    passRequirement: (pct: number) =>
      `Score ${pct}% or more to pass the test.`,
    closeTest: "Close test",
    correctAnswer: (answer: string) => `Correct answer: ${answer}`,
    correct: "Correct",
    submitTest: "Submit test",
    passedScore: (score: number, total: number) =>
      `Passed — ${score}/${total} correct`,
    passedMessage: "You passed the test for this lesson.",
    notPassedScore: (score: number, total: number) =>
      `Not passed — ${score}/${total} correct`,
    notPassedMessage: (pct: number) =>
      `You need ${pct}% to pass. Review the answers above and try again.`,
  },
  roadmapModal: {
    title: "Your Python Roadmap",
    subtitle: (totalTopics: number, totalMinutes: string) =>
      `${totalTopics} topics • about ${totalMinutes} • follow it top to bottom`,
    close: "Close roadmap",
    dialogLabel: "Python roadmap",
    savedDialogLabel: "Roadmap saved",
    savedTitle: "Roadmap saved for later",
    savedBody:
      "Next time you can preview the roadmap from the profile dropdown.",
    gotIt: "Got it",
  },
  coursesPage: {
    videoCourses: "Video courses",
    heroTitle: "Learn Python by watching.",
    emptyState: "Course videos are being added — check back shortly.",
    allTeachers: "All teachers",
    channelPictureAlt: (name: string) => `${name} channel picture`,
    countCourses: (n: number) => (n === 1 ? `${n} course` : `${n} courses`),
    videoSourceNote: "MEGA & Drive, YouTube for now",
    taglineCodeWithHarry:
      "Complete Python courses in Hindi — step by step, with notes.",
    taglineMosh:
      "The classic Python course in English — full course plus topic videos.",
    taglineApnaCollege:
      "Full Python courses in Hindi, with notes and practice questions.",
  },
  editorPage: {
    emptyFileError: "This file is empty — write some code first.",
    aiEmptyReplyError: "The AI returned an empty reply — please try again.",
    micropipTimeoutError:
      "Loading micropip timed out after 1 minute — check your connection and retry.",
    pyodideLoadError:
      "Pyodide script failed to load from cdn.jsdelivr.net — check your connection and reload the page.",
    fileExistsError: "A file with this path already exists",
    folderExistsError: "A folder with this name already exists",
    keepOneFileError: "You must keep at least one file in the workspace.",
    itemExistsInLocationError: (itemName: string) =>
      `An item named '${itemName}' already exists in that location.`,
    filesTab: "Files",
    modulesTab: "Modules",
    activeLabel: "Active:",
    noActiveFile: "None",
    unsavedBadge: "(unsaved*)",
    saved: "Saved",
    saveFileRequired: "Save File (Required)",
    explainCodeHint: "Ask the AI to explain this file",
    explainCode: "Explain this code",
    findBugHint: "Ask the AI to find the bug in this file",
    findBug: "Find the bug",
    stop: "Stop",
    stopHint: "Interrupt the running code",
    stopUnavailableHint:
      "Stop needs SharedArrayBuffer, which this browser setup does not provide — reload the page to stop a stuck run.",
    compiling: "Compiling...",
    loadingEngine: "Loading Engine",
    compileAndRun: "Compile & Run",
    saveNow: "Save Now",
    explorer: "Explorer",
    newFile: "New File",
    newFolder: "New Folder",
    newFilePlaceholder: "e.g. script.py or utils/helper.py",
    newFolderPlaceholder: "folder name, e.g. tests",
    workspaceRootDropHint: "Workspace Root (drop here to move out)",
    unsavedTooltip: "Unsaved",
    dragFilesHint: "Drag files here from your computer",
    terminalLogs: "Terminal Logs",
    terminalButton: "Terminal",
    programInputLabel: "Program input — one line per input() call",
    programInputPlaceholder: "e.g.\nAdeen\n21",
    terminalInputPlaceholder: "Type a Python command, e.g. 2 + 2 — or 'clear' to clear the terminal",
    terminalCommandPlaceholder: "Type a command — python <file>, run, or Python code…",
    terminalInputLoadingPlaceholder: "Python runtime is still loading…",
    terminalNotReady: "Python runtime is still loading — wait for it to finish, then try again.",
    aiExplanation: "AI explanation",
    aiBugCheck: "AI bug check",
    aiCodeHelp: "AI code help",
    closeAiAnswer: "Close AI answer",
    aiUnavailableMessage:
      "AI is not available right now — the API keys are not configured yet. The editor and the rest of the course work normally.",
    aiReadingCode: "AI is reading your code…",
    aiTruncatedNote:
      "Note: the file was longer than the AI limit, so only the first 8000 characters were sent.",
    menuFile: "File",
    menuEdit: "Edit",
    menuView: "View",
    menuRun: "Run",
    menuTerminal: "Terminal",
    menuSaveAll: "Save All",
    menuRename: "Rename",
    menuDelete: "Delete",
    menuDuplicate: "Duplicate",
    menuCopyPath: "Copy Path",
    menuFormat: "Format Document",
    menuAutoSave: "Auto Save",
    menuUndo: "Undo",
    menuRedo: "Redo",
    menuFind: "Find",
    menuClearTerminal: "Clear Terminal",
    menuFocusTerminal: "Focus Terminal",
    formatting: "Formatting…",
    formatFailed: "Could not format — the formatter could not be loaded. Check your connection and try again.",
    formatNotReady: "Python runtime is still loading — wait for it, then format.",
    renamePlaceholder: "New name, e.g. helpers.py",
    autoSaved: "Auto-saved",
    statusPython: "Python 3.12 (WASM)",
    runWithoutDebugging: "Run Without Debugging",
    aiButton: "AI",
    aiPanelTitle: "AI Assistant",
    aiPlaceholder: "Ask AI anything — write code, explain, fix bugs…",
    aiWelcome: "Hi! I'm your AI assistant. Ask me anything — I'll explain, write code, fix bugs, or help you build logic.",
    aiClearChat: "Clear chat",
    aiGuideNote: "AI answers anything — it explains, writes code, and fixes bugs.",
    aiStepReading: "Reading your code",
    aiStepThinking: "Thinking through the logic",
    aiStepDrafting: "Drafting guidance",
    aiThinkingLabel: "Thinking…",
    aiClosePanel: "Close AI panel",
    aiDragHint: "Drag a panel header to move it",
  },
  modulesPage: {
    openingInEditor: "Opening Modules in the Code Editor…",
    title: "Python Modules & Packages Manager",
    subtitle:
      "Browse Python's complete official standard library and search/install all PyPI & Pyodide external packages in your workspace.",
    tabStdlib: (count: number) => `Built-in Standard Library (${count})`,
    tabExternal: (count: number) => `External Packages (${count})`,
    tabSearch: "Live PyPI Search & Install",
    filterStdlibPlaceholder: "Filter built-in modules...",
    builtInReady: "Built-in (Always ready)",
    docs: "Docs",
    externalIntro: (pyodideCount: number, micropipCount: number) =>
      `${pyodideCount} Pyodide-built packages (install fast from the CDN) + ${micropipCount} popular pure-Python PyPI packages (install via micropip).`,
    installedInWorkspace: (n: number) => `${n} installed in this workspace.`,
    externalOutro:
      "Anything else on PyPI can still be installed by exact name in the Live PyPI Search tab.",
    searchPackagesPlaceholder:
      "Search all packages — e.g. numpy, flask, seaborn, opencv…",
    installByNamePlaceholder: "Install any package by name — e.g. tabulate",
    install: "Install",
    showingCount: (shown: number, total: number) =>
      `Showing ${shown} of ${total} packages.`,
    noMatch:
      "No match — try the Live PyPI Search tab for an exact package name.",
    installed: "Installed",
    remove: "Remove",
    installing: "Installing...",
    installPackage: "Install Package",
    searchHeading: "Search the Official Python Package Index (PyPI)",
    searchPyPiPlaceholder: "e.g. rich, requests, sympy, tabulate, httpx, textstat",
    searchPyPi: "Search PyPI",
    installedInWorkspaceLabel: "Installed in Workspace",
    installPackageNamed: (name: string) => `Install ${name}`,
    licenseLabel: "License:",
    authorLabel: "Author:",
    projectHomepage: "Project Homepage",
    logsHeading: "Package Engine Terminal Logs",
    logsEmpty:
      "Python environment ready. Install any package to load it into your workspace.",
    stageStartingRuntime: "Starting Python runtime…",
    logStartingRuntime:
      "Starting Python runtime — one-time download (~15 MB), please wait…",
    stageRuntimeReady: "Python runtime ready",
    logRuntimeReady: "Python runtime ready.",
    errorEnvStartWithDetail: (error: string) =>
      `Python environment could not start: ${error}`,
    errorEnvStartNoLoad:
      "Python environment could not start (the Pyodide script did not load). Check your connection and try again — the Install button will retry.",
    stageDownloading: (pkg: string) => `Downloading '${pkg}'…`,
    logInstalling: (pkg: string) => `Installing '${pkg}'…`,
    stageInstalled: (pkg: string) => `Installed '${pkg}' ✓`,
    logInstalled: (pkg: string, method: string, importName: string) =>
      `✓ Installed '${pkg}' via ${method} (import ${importName} works). Saved in workspace storage.`,
    logInstallFailed: (pkg: string, error: string) =>
      `✗ Failed to install '${pkg}': ${error}`,
    logUninstalled: (pkg: string) =>
      `Uninstalled and removed '${pkg}' from workspace.`,
    errorPackageNotFound: "Package not found on PyPI",
    errorQueryPyPi: "Error querying PyPI",
    defaultPyodideDesc:
      "Pyodide-built package — installs fast from the CDN, ready to import.",
    stageLoadingMicropip: "Loading micropip…",
  },
  player: {
    errorOfflineCacheUnsupported:
      "Offline cache is not supported in this browser.",
    errorDownloadFailed: (status: number) => `Download failed (${status})`,
    errorSaveOffline: "Could not save video offline.",
    ariaLabel:
      "Video player — Space plays or pauses, left and right arrows seek 10 seconds",
    autoplayOnHint: "Autoplay on — the next lesson plays automatically",
    autoplayOffHint: "Autoplay off",
    autoplay: "Autoplay",
    playbackSpeed: "Playback speed",
    speedNormal: "Normal",
    quality: "Quality",
    qualityAuto: "Auto",
    original: "(original)",
    qualityNote:
      "MEGA serves one quality per video — the file above is the only stream.",
    seekLabel: "Seek",
    play: "Play",
    pause: "Pause",
    mute: "Mute",
    unmute: "Unmute",
    volumeLabel: "Volume",
    hideCaptions: "Hide English captions",
    showCaptions: "Show English captions",
    captionsLabel: "English captions",
    downloadVideo: "Download video",
    settingsLabel: "Settings — speed and quality",
    exitFullscreen: "Exit fullscreen",
    fullscreen: "Fullscreen",
    playingOffline: "Playing from in-app offline storage",
    streamingOnline: "Streaming online",
    offlineNotSaved: "Offline (not saved)",
    keyboardHint:
      "Space — play / pause · ← → — seek 10 seconds · ↑ ↓ — volume · tap the speaker for volume",
    removeOfflineCopy: "Remove offline copy",
    savingPct: (pct: number) => `Saving ${pct}%`,
    saving: "Saving ...",
    sliderLabel: "Slider",
    youtubeFallbackNote: "Playing from YouTube — MEGA link coming soon",
    todayProgress: "Today's Progress",
    progressSummary: (minutesWatched: number, goalMinutes: number) =>
      `${minutesWatched} min watched of ${goalMinutes} min goal`,
    dailyTargetLabel: "Target (min/day)",
    courseLessonsHeading: "Course Lessons",
  },
  settingsPage: {
    subtitle: "Your progress and how the app looks.",
    todaySection: "Today",
    goalProgress: (minutes: number, goal: number) => `${minutes}/${goal}m`,
    streakRestored: "Streak restored — welcome back.",
    streakBroken: "Streak broken",
    streakBrokenRestore: (
      brokenStreak: number,
      restoresUsed: number,
      max: number
    ) =>
      `Your ${brokenStreak}-day streak broke. Restore it before the timer runs out — ${restoresUsed} of ${max} restores used this month.`,
    countdownHrs: "hrs",
    countdownMin: "min",
    countdownSec: "sec",
    restoreStreakButton: (brokenStreak: number) =>
      `Restore ${brokenStreak}-day streak`,
    streakBrokenExpired: (brokenStreak: number) =>
      `Your ${brokenStreak}-day streak broke and the 24-hour restore window has passed. Watch a lesson to start a new streak.`,
    noRestoresLeft: "No restores left",
    noRestoresLeftBody: (max: number, brokenStreak: number) =>
      `You used all ${max} restores this month. Your ${brokenStreak}-day streak broke — watch a lesson to start a new streak. Restores reset next month.`,
    accountSecurity: "Account security",
  },
  tutorPage: {
    heading: "Ask AI about this lesson",
    intro:
      "Doubts, explanations, examples — in Hindi or English. Answers come from this lesson's actual video, with timestamps, and anything the video doesn't cover is marked as general knowledge. Chats are not stored anywhere.",
    unavailable:
      "AI is not available right now — the API keys are not configured yet. The rest of the course works normally.",
    askPlaceholder: (lessonTitle: string) => {
      const display =
        lessonTitle.length > 40
          ? `${lessonTitle.slice(0, 40)}…`
          : lessonTitle;
      return `Ask about "${display}"`;
    },
  },
  githubPage: {
    repoNameTooLong: "Repo name must be 100 characters or fewer.",
    repoNameInvalidChars:
      "Repo names can't contain spaces or special characters — only letters, numbers, - _ . are allowed.",
    tokenSaved: "Token saved in this browser only.",
    tokenRemoved: "Disconnected GitHub token.",
    loadReposFailed: "Failed to load repositories",
    createRepoFailed: "Failed to create repository",
    repoCreated: (fullName: string) => `✓ Successfully created repo: ${fullName}`,
    pushFailed: "Failed to push file",
    pushed: (filePath: string, fullName: string) =>
      `✓ Pushed '${filePath}' to ${fullName}!`,
    title: "GitHub Integration",
    intro:
      "Connect your GitHub account using a Personal Access Token (PAT) to create repositories and commit code directly from LP. The token link below opens GitHub with every scope pre-checked, so the token has full access to your account.",
    connectHeading: "Connect GitHub Personal Access Token",
    tokenExplainer:
      "Create a token on github.com/settings/tokens with every scope pre-checked — the token has full access to your account, including deleting repos and managing orgs, so keep it private. Then paste it below. Your token lives only in this browser (localStorage). It is sent to the LP server only to call GitHub on your behalf, is never stored on the server, and Disconnect removes it from this browser.",
    connectToken: "Connect Token",
    connected: (tokenPrefix: string) => `Connected to GitHub • ${tokenPrefix}...`,
    refresh: "Refresh",
    disconnect: "Disconnect",
    createHeading: "Create New GitHub Repository",
    repoNameLabel: "Repository Name *",
    descriptionLabel: "Description (optional)",
    descriptionPlaceholder: "Practice solutions and notes from LP",
    publicRepo: "Public repository",
    privateRepo: "Private repository",
    initReadme: "Initialize with README",
    createButton: "Create Repository on GitHub",
    commitHeading: "Push / Commit Code from Workspace",
    targetRepoLabel: "Target Repository *",
    visibilityPrivate: (fullName: string) => `${fullName} (Private)`,
    visibilityPublic: (fullName: string) => `${fullName} (Public)`,
    visibilityPrivateShort: "private",
    visibilityPublicShort: "public",
    filePathLabel: "File Path in Repo *",
    filePathPlaceholder: "e.g. main.py",
    commitMessageLabel: "Commit Message *",
    commitMessagePlaceholder: "Commit message",
    fileContentLabel: "File Content",
    commitButton: (repoName: string) => `Commit & Push to ${repoName}`,
    repoFallback: "Repo",
    yourRepos: (count: number) => `Your Repositories (${count})`,
    fetchingRepos: "Fetching your repositories...",
    noRepos: "No repositories found or access restricted.",
    noDescription: "No description",
    openOnGitHub: "Open on GitHub",
  },
};

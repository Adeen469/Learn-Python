// Website i18n — language provider, the `Strings` type, and title helpers.
//
// English is the source of truth: `Strings` is defined here, `en.ts`
// implements it, and every other language file is typed as `Strings`,
// so TypeScript errors if any key is missing. Dynamic strings are
// functions so each language can apply its own grammar (plurals, word
// order, units) instead of sharing English word order.
//
// Standing rule: the website and the app must be the SAME wherever
// possible. Every string that exists in the app's dictionaries is
// copied VERBATIM from the app's `en.ts` (see the REUSE entries
// below); only genuinely website-only strings are fresh here.
// Translations must be IDENTICAL between app and website for shared
// keys — never re-translate a shared key.
//
// Scope: UI chrome ONLY. Content translations live in ./titles/<lang>.ts
// as partial maps with graceful fallback:
//   lessonTitles — keyed by day-lesson id (python-day-001 …)
//   videoTitles  — keyed by YouTube videoId (268 course videos)
//   roadmapNames — keyed by the English stage/topic/difficulty name
// A missing title falls back to the original English text, so a titles
// map may be partial. The main `Strings` object must stay complete.
// Tutorial prose lives in ../learn/i18n/<lang>/ chunk files (overlays,
// see ../learn/i18n/index.ts). Roadmap blurbs live in ./blurbs/<lang>.ts.
//
// No RTL layout flipping in this version (Arabic strings only).

"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { en } from "./en";
import { hiRoman } from "./hi-roman";
import { fr } from "./fr";
import { ja } from "./ja";
import { ko } from "./ko";
import { es } from "./es";
import { de } from "./de";
import { pt } from "./pt";
import { ru } from "./ru";
import { ar } from "./ar";
import { zh } from "./zh";
import { titles as titlesEn } from "./titles/en";
import { titles as titlesHiRoman } from "./titles/hi-roman";
import { titles as titlesFr } from "./titles/fr";
import { titles as titlesJa } from "./titles/ja";
import { titles as titlesKo } from "./titles/ko";
import { titles as titlesEs } from "./titles/es";
import { titles as titlesDe } from "./titles/de";
import { titles as titlesPt } from "./titles/pt";
import { titles as titlesRu } from "./titles/ru";
import { titles as titlesAr } from "./titles/ar";
import { titles as titlesZh } from "./titles/zh";
import { roadmapBlurbs as blurbsEn } from "./blurbs/en";
import { roadmapBlurbs as blurbsHiRoman } from "./blurbs/hi-roman";
import { roadmapBlurbs as blurbsFr } from "./blurbs/fr";
import { roadmapBlurbs as blurbsJa } from "./blurbs/ja";
import { roadmapBlurbs as blurbsKo } from "./blurbs/ko";
import { roadmapBlurbs as blurbsEs } from "./blurbs/es";
import { roadmapBlurbs as blurbsDe } from "./blurbs/de";
import { roadmapBlurbs as blurbsPt } from "./blurbs/pt";
import { roadmapBlurbs as blurbsRu } from "./blurbs/ru";
import { roadmapBlurbs as blurbsAr } from "./blurbs/ar";
import { roadmapBlurbs as blurbsZh } from "./blurbs/zh";
import {
  getReferenceTranslations,
  getTutorialTranslations,
} from "../learn/i18n";

export type LanguageCode =
  | "en"
  | "hi-roman"
  | "fr"
  | "ja"
  | "ko"
  | "es"
  | "de"
  | "pt"
  | "ru"
  | "ar"
  | "zh";

export interface LanguageInfo {
  code: LanguageCode;
  /** Native name, shown in the picker (e.g. "Français", "日本語"). */
  label: string;
  /** English name, shown under the native label. */
  englishName: string;
}

export const LANGUAGES: LanguageInfo[] = [
  { code: "en", label: "English", englishName: "English" },
  { code: "hi-roman", label: "Hinglish (Roman)", englishName: "Roman Hindi (Hinglish)" },
  { code: "fr", label: "Français", englishName: "French" },
  { code: "ja", label: "日本語", englishName: "Japanese" },
  { code: "ko", label: "한국어", englishName: "Korean" },
  { code: "es", label: "Español", englishName: "Spanish" },
  { code: "de", label: "Deutsch", englishName: "German" },
  { code: "pt", label: "Português", englishName: "Portuguese" },
  { code: "ru", label: "Русский", englishName: "Russian" },
  { code: "ar", label: "العربية", englishName: "Arabic" },
  { code: "zh", label: "简体中文", englishName: "Chinese (Simplified)" },
];

/**
 * The full website UI-chrome string set. Every language file must
 * implement all of it. Sections marked REUSE copy the app's key and
 * English wording verbatim; website-only sections are fresh.
 */
export type Strings = {
  common: {
    appName: string;
    signIn: string;
    signOut: string;
    email: string;
    password: string;
    genericError: string;
    backToSignIn: string;
    retry: string;
    cancel: string;
    completed: string;
    watchedPct: (pct: number) => string;
    notStarted: string;
    duration: (totalSeconds: number) => string;
    durationTotal: (totalSeconds: number) => string;
    sixDigitCodeLabel: string;
    roadmap: string;
    settings: string;
    aiTutor: string;
    // Website-only:
    close: string;
    all: string;
    delete: string;
    clear: string;
    back: string;
    or: string;
    emailAddress: string;
    loading: string;
    pleaseWait: string;
    errorPageDetail: string;
    backToDashboard: string;
    pageNotFound: string;
    pageNotFoundDetail: string;
  };
  tabs: {
    learn: string;
    courses: string;
    logicBuilder: string;
  };
  logicBuilder: {
    comingSoon: string;
    notifyText: string;
  };
  learn: {
    streakChip: (n: number) => string;
  };
  courses: {
    intro: string;
    countVideos: (n: number) => string;
  };
  editor: {
    title: string;
  };
  profile: {
    statStreakLabel: string;
  };
  lesson: {
    markComplete: string;
    askTutor: string;
    saveOffline: string;
    savedOffline: string;
    nextLesson: string;
    upNext: string;
  };
  course: {
    markAsComplete: string;
    oneShotsHeading: string;
    // Website-only:
    fullCourseLabel: string;
    totalLabel: string;
    playingLabel: string;
    pausedLabel: string;
  };
  roadmap: {
    topicsComplete: (done: number, total: number) => string;
    topicMeta: (difficulty: string, minutes: number) => string;
    topicDone: string;
  };
  tutor: {
    errorSessionExpired: string;
    errorGeneric: string;
    // Website-only:
    errorEmptyReply: string;
    youLabel: string;
    groundedFootnote: string;
    notGroundedFootnote: string;
    thinking: string;
    askButton: string;
  };
  selectionToolbar: {
    askAi: string;
    translate: string;
    copy: string;
    copied: string;
    aiAnswerTitle: string;
    translationTitle: (lang: string) => string;
    thinking: string;
    translating: string;
    showOriginal: string;
    minimize: string;
    maximize: string;
    errorGeneric: string;
    errorSessionExpired: string;
    close: string;
  };
  auth: {
    continueWithGoogle: string;
    forgotPassword: string;
    createAccount: string;
    namePlaceholder: string;
    otpSubtitle: (email: string, purpose: "signup" | "signin") => string;
    forgotSubtitle: string;
    sendResetLink: string;
    twoFactorTitle: string;
    verifyAndSignIn: string;
    // Website-only:
    couldNotSendCode: string;
    codeSentToWithExpiry: (email: string) => string;
    couldNotSignIn: string;
    couldNotCreateAccount: string;
    codeIncorrectOrExpired: string;
    enterCodeTitle: string;
    signInWithEmail: string;
    signInEmailSubtitle: string;
    signUpEmailSubtitle: string;
    signInOrCreateAccount: string;
    signingIn: string;
    continueWithEmailCode: string;
    passwordWithMinPlaceholder: string;
    creatingAccount: string;
    verifying: string;
    verifyAndContinue: string;
    resendCodeIn: (cooldown: number) => string;
    resendCode: string;
    sending: string;
    couldNotSendEmail: string;
    resetLinkSentWithExpiry: (email: string) => string;
    passwordsDontMatch: string;
    couldNotResetPassword: string;
    resetPassword: string;
    checkingResetLink: string;
    resetLinkExpiredTitle: string;
    resetLinkExpiredSubtitle: string;
    requestNewResetLink: string;
    setNewPasswordTitle: string;
    setNewPasswordSubtitle: string;
    passwordUpdated: string;
    newPasswordPlaceholder: string;
    confirmNewPasswordPlaceholder: string;
    resetting: string;
    codeSentToYourEmailWithExpiry: string;
    checkingSignInStep: string;
    signInStepExpiredTitle: string;
    signInStepExpiredSubtitle: string;
    twoFactorEnterCodeSubtitle: string;
    secondFactorMethodLabel: string;
    methodAuthenticator: string;
    methodEmailCode: string;
    methodBackupCode: string;
    emailCodeWillBeSent: string;
    sendEmailCode: string;
    backupCodesWorkOnce: string;
  };
  settings: {
    dailyGoal: string;
    streak: string;
    appearance: string;
    theme: string;
    themeDark: string;
    themeLight: string;
    language: string;
    languageHint: string;
    goalMinutes: (minutes: number) => string;
    // Website-only (two-factor management):
    couldNotStartTwoFactorSetup: string;
    twoFactorCodeIncorrect: string;
    couldNotDisableTwoFactor: string;
    twoFactorOff: string;
    couldNotGenerateBackupCodes: string;
    twoFactorSignInRequired: string;
    twoFactorGoogleManaged: string;
    twoFactorIntro: string;
    twoFactorStarting: string;
    setUpTwoFactor: string;
    twoFactorScanQr: string;
    twoFactorQrAlt: string;
    cantScanEnterSecret: string;
    turnOnTwoFactor: string;
    twoFactorOn: string;
    twoFactorOnExplainer: string;
    newBackupCodes: string;
    disable: string;
    disableTwoFactorPrompt: string;
    disablingTwoFactor: string;
    disableTwoFactor: string;
    backupCodesTitle: string;
    backupCodesWarning: string;
    savedBackupCodes: string;
    backupCodesSaved: string;
  };
  update: {
    // Only key with a web usage (error page + QuizModal "Try again").
    tryAgain: string;
  };
  // ---- Website-only sections below ----
  landing: {
    heroTitle: string;
    heroWordOnline: string;
    heroWordOffline: string;
    heroSubtitle: string;
    getStarted: string;
    heroNote: string;
    statTopics: string;
    statVideos: string;
    statStages: string;
    featuresHeading: string;
    featureVideosTitle: string;
    featureVideosText: string;
    featureTutorialsTitle: string;
    featureTutorialsText: string;
    featureEditorText: string;
    featureTutorText: string;
    featureGithubTitle: string;
    featureGithubText: string;
    featureGoalsTitle: string;
    featureGoalsText: string;
    splashTagline: string;
  };
  navbar: {
    continue: string;
    profileMenu: string;
    mainNavLabel: string;
    openMenu: string;
    closeMenu: string;
  };
  learnPage: {
    example: string;
    copy: string;
    copied: string;
    output: string;
    noteLabel: string;
    tipLabel: string;
    topicNotFound: string;
    topicNotFoundHint: string;
    tryInEditor: string;
    summary: string;
    practice: string;
    practiceHint: string;
    tutorialBeingPrepared: string;
    previous: string;
    backToPythonHome: (title: string) => string;
  };
  sidebar: {
    searchTopics: string;
    noTopicsMatch: (query: string) => string;
    closeTopics: string;
    sectionPythonTutorial: string;
    sectionPythonClasses: string;
    sectionFileHandling: string;
    sectionPythonModules: string;
    sectionPythonMatplotlib: string;
    sectionMachineLearning: string;
    sectionPythonDsa: string;
    sectionPythonMysql: string;
    sectionPythonMongodb: string;
    sectionPythonCert: string;
    sectionPythonHowTo: string;
    sectionPythonExamples: string;
    sectionPythonReference: string;
    sectionModuleReference: string;
    groupPythonArrays: string;
    groupPythonCasting: string;
    groupPythonClassMethods: string;
    groupPythonClassProperties: string;
    groupPythonDates: string;
    groupPythonEncapsulation: string;
    groupPythonInheritance: string;
    groupPythonIterators: string;
    groupPythonJson: string;
    groupPythonMagicMethods: string;
    groupPythonMath: string;
    groupPythonNone: string;
    groupPythonPolymorphism: string;
    groupPythonRange: string;
    groupPythonRegex: string;
    groupPythonStringFormatting: string;
    groupPythonTryExcept: string;
    groupPythonInitMethod: string;
    groupPythonSelfParameter: string;
  };
  quiz: {
    testLabel: string;
    passRequirement: (pct: number) => string;
    closeTest: string;
    correctAnswer: (answer: string) => string;
    correct: string;
    submitTest: string;
    passedScore: (score: number, total: number) => string;
    passedMessage: string;
    notPassedScore: (score: number, total: number) => string;
    notPassedMessage: (pct: number) => string;
  };
  roadmapModal: {
    title: string;
    subtitle: (totalTopics: number, totalMinutes: string) => string;
    close: string;
    dialogLabel: string;
    savedDialogLabel: string;
    savedTitle: string;
    savedBody: string;
    gotIt: string;
  };
  coursesPage: {
    videoCourses: string;
    heroTitle: string;
    emptyState: string;
    allTeachers: string;
    channelPictureAlt: (name: string) => string;
    countCourses: (n: number) => string;
    videoSourceNote: string;
    taglineCodeWithHarry: string;
    taglineMosh: string;
    taglineApnaCollege: string;
  };
  editorPage: {
    emptyFileError: string;
    aiEmptyReplyError: string;
    micropipTimeoutError: string;
    pyodideLoadError: string;
    fileExistsError: string;
    folderExistsError: string;
    keepOneFileError: string;
    itemExistsInLocationError: (itemName: string) => string;
    filesTab: string;
    modulesTab: string;
    activeLabel: string;
    noActiveFile: string;
    unsavedBadge: string;
    saved: string;
    saveFileRequired: string;
    explainCodeHint: string;
    explainCode: string;
    findBugHint: string;
    findBug: string;
    stop: string;
    stopHint: string;
    stopUnavailableHint: string;
    compiling: string;
    loadingEngine: string;
    compileAndRun: string;
    saveNow: string;
    explorer: string;
    newFile: string;
    newFolder: string;
    newFilePlaceholder: string;
    newFolderPlaceholder: string;
    workspaceRootDropHint: string;
    unsavedTooltip: string;
    dragFilesHint: string;
    terminalLogs: string;
    terminalButton: string;
    pushButton: string;
    deleteRepoButton: string;
    deleteRepoTitle: string;
    deleteRepoWarning: (repo: string) => string;
    deleteRepoOwnerNote: string;
    deleteRepoScopeNote: string;
    deleteRepoConfirmLabel: string;
    deleteRepoConfirmPlaceholder: string;
    deleteRepoDeleting: string;
    pushNeedsRepo: string;
    pushDialogTitle: string;
    pushDialogSummary: (ready: number, skipped: number, repo: string) => string;
    repoLoadedToast: (repo: string, count: number) => string;
    pushCommitMessageLabel: string;
    pushGeneratingMessage: string;
    programInputLabel: string;
    programInputPlaceholder: string;
    terminalInputPlaceholder: string;
    terminalCommandPlaceholder: string;
    terminalInputLoadingPlaceholder: string;
    terminalNotReady: string;
    aiExplanation: string;
    aiBugCheck: string;
    aiCodeHelp: string;
    closeAiAnswer: string;
    aiUnavailableMessage: string;
    aiReadingCode: string;
    aiTruncatedNote: string;
    menuFile: string;
    menuEdit: string;
    menuView: string;
    menuRun: string;
    menuTerminal: string;
    menuSaveAll: string;
    restoreWorkspace: string;
    menuRename: string;
    menuDelete: string;
    menuDuplicate: string;
    menuCopyPath: string;
    tabClose: string;
    tabCloseOthers: string;
    tabCloseToRight: string;
    tabCloseSaved: string;
    tabCloseAll: string;
    tabCopyRelativePath: string;
    tabRevealInExplorer: string;
    tabKeepOpen: string;
    tabPin: string;
    tabUnpin: string;
    menuFormat: string;
    menuAutoSave: string;
    menuUndo: string;
    menuRedo: string;
    menuFind: string;
    menuClearTerminal: string;
    menuFocusTerminal: string;
    formatting: string;
    formatFailed: string;
    formatNotReady: string;
    renamePlaceholder: string;
    autoSaved: string;
    statusPython: string;
    runWithoutDebugging: string;
    aiButton: string;
    aiPanelTitle: string;
    aiPlaceholder: string;
    aiWelcome: string;
    aiClearChat: string;
    aiGuideNote: string;
    aiMenuOptions: string;
    aiMenuHistory: string;
    aiMenuSettings: string;
    aiBackToChat: string;
    aiBackToEditor: string;
    aiHistoryTitle: string;
    aiHistoryEmpty: string;
    aiNewChat: string;
    aiSettingsTitle: string;
    aiSkillsTitle: string;
    aiSkillsBuiltin: string;
    aiSkillsCustom: string;
    aiSkillAdd: string;
    aiSkillName: string;
    aiSkillDescription: string;
    aiSkillContent: string;
    aiByokTitle: string;
    aiByokProvider: string;
    aiByokKey: string;
    aiByokBaseUrl: string;
    aiByokModel: string;
    aiByokSave: string;
    aiByokSaved: string;
    aiByokRemove: string;
    aiByokNote: string;
    aiStepReading: string;
    aiStepThinking: string;
    aiStepDrafting: string;
    aiThinkingLabel: string;
    aiClosePanel: string;
    aiDragHint: string;
  };
  modulesPage: {
    openingInEditor: string;
    title: string;
    subtitle: string;
    tabStdlib: (count: number) => string;
    tabExternal: (count: number) => string;
    tabSearch: string;
    filterStdlibPlaceholder: string;
    builtInReady: string;
    docs: string;
    externalIntro: (pyodideCount: number, micropipCount: number) => string;
    installedInWorkspace: (n: number) => string;
    externalOutro: string;
    searchPackagesPlaceholder: string;
    installByNamePlaceholder: string;
    install: string;
    showingCount: (shown: number, total: number) => string;
    noMatch: string;
    installed: string;
    remove: string;
    installing: string;
    installPackage: string;
    searchHeading: string;
    searchPyPiPlaceholder: string;
    searchPyPi: string;
    installedInWorkspaceLabel: string;
    installPackageNamed: (name: string) => string;
    licenseLabel: string;
    authorLabel: string;
    projectHomepage: string;
    logsHeading: string;
    logsEmpty: string;
    stageStartingRuntime: string;
    logStartingRuntime: string;
    stageRuntimeReady: string;
    logRuntimeReady: string;
    errorEnvStartWithDetail: (error: string) => string;
    errorEnvStartNoLoad: string;
    stageDownloading: (pkg: string) => string;
    logInstalling: (pkg: string) => string;
    stageInstalled: (pkg: string) => string;
    logInstalled: (pkg: string, method: string, importName: string) => string;
    logInstallFailed: (pkg: string, error: string) => string;
    logUninstalled: (pkg: string) => string;
    errorPackageNotFound: string;
    errorQueryPyPi: string;
    defaultPyodideDesc: string;
    stageLoadingMicropip: string;
  };
  player: {
    errorOfflineCacheUnsupported: string;
    errorDownloadFailed: (status: number) => string;
    errorSaveOffline: string;
    ariaLabel: string;
    autoplayOnHint: string;
    autoplayOffHint: string;
    autoplay: string;
    playbackSpeed: string;
    speedNormal: string;
    quality: string;
    qualityAuto: string;
    original: string;
    qualityNote: string;
    seekLabel: string;
    play: string;
    pause: string;
    mute: string;
    unmute: string;
    volumeLabel: string;
    hideCaptions: string;
    showCaptions: string;
    captionsLabel: string;
    downloadVideo: string;
    settingsLabel: string;
    exitFullscreen: string;
    fullscreen: string;
    playingOffline: string;
    streamingOnline: string;
    offlineNotSaved: string;
    keyboardHint: string;
    removeOfflineCopy: string;
    savingPct: (pct: number) => string;
    saving: string;
    sliderLabel: string;
    youtubeFallbackNote: string;
    todayProgress: string;
    progressSummary: (minutesWatched: number, goalMinutes: number) => string;
    dailyTargetLabel: string;
    courseLessonsHeading: string;
  };
  settingsPage: {
    subtitle: string;
    todaySection: string;
    goalProgress: (minutes: number, goal: number) => string;
    streakRestored: string;
    streakBroken: string;
    streakBrokenRestore: (
      brokenStreak: number,
      restoresUsed: number,
      max: number
    ) => string;
    countdownHrs: string;
    countdownMin: string;
    countdownSec: string;
    restoreStreakButton: (brokenStreak: number) => string;
    streakBrokenExpired: (brokenStreak: number) => string;
    noRestoresLeft: string;
    noRestoresLeftBody: (max: number, brokenStreak: number) => string;
    accountSecurity: string;
  };
  tutorPage: {
    heading: string;
    intro: string;
    unavailable: string;
    askPlaceholder: (lessonTitle: string) => string;
  };
  githubPage: {
    repoNameTooLong: string;
    repoNameInvalidChars: string;
    tokenSaved: string;
    tokenRemoved: string;
    tokenStorageNotReady: string;
    loadReposFailed: string;
    createRepoFailed: string;
    repoCreated: (fullName: string) => string;
    pushFailed: string;
    pushed: (filePath: string, fullName: string) => string;
    title: string;
    intro: string;
    connectHeading: string;
    tokenExplainer: string;
    connectToken: string;
    connected: string;
    refresh: string;
    disconnect: string;
    createHeading: string;
    repoNameLabel: string;
    descriptionLabel: string;
    descriptionPlaceholder: string;
    publicRepo: string;
    privateRepo: string;
    initReadme: string;
    gitignoreLabel: string;
    licenseLabel: string;
    noneOption: string;
    openInEditor: string;
    createButton: string;
    commitHeading: string;
    targetRepoLabel: string;
    visibilityPrivate: (fullName: string) => string;
    visibilityPublic: (fullName: string) => string;
    visibilityPrivateShort: string;
    visibilityPublicShort: string;
    filePathLabel: string;
    filePathPlaceholder: string;
    commitMessageLabel: string;
    commitMessagePlaceholder: string;
    fileContentLabel: string;
    commitButton: (repoName: string) => string;
    repoFallback: string;
    repoMenuOpenEditor: string;
    repoMenuOpenGithub: string;
    repoMenuCopyLink: string;
    repoMenuFav: string;
    repoMenuUnfav: string;
    repoMenuDelete: string;
    repoLinkCopied: string;
    repoDeleted: (repo: string) => string;
    yourRepos: (count: number) => string;
    fetchingRepos: string;
    noRepos: string;
    noDescription: string;
    openOnGitHub: string;
  };
};

/** Partial content-title maps (graceful fallback to the original text). */
export type WebTitlesMaps = {
  lessonTitles: Record<string, string>;
  videoTitles: Record<string, string>;
  roadmapNames: Record<string, string>;
};

const STRINGS: Record<LanguageCode, Strings> = {
  en,
  "hi-roman": hiRoman,
  fr,
  ja,
  ko,
  es,
  de,
  pt,
  ru,
  ar,
  zh,
};

const TITLES: Record<LanguageCode, WebTitlesMaps> = {
  en: titlesEn,
  "hi-roman": titlesHiRoman,
  fr: titlesFr,
  ja: titlesJa,
  ko: titlesKo,
  es: titlesEs,
  de: titlesDe,
  pt: titlesPt,
  ru: titlesRu,
  ar: titlesAr,
  zh: titlesZh,
};

const BLURBS: Record<LanguageCode, Record<string, string>> = {
  en: blurbsEn,
  "hi-roman": blurbsHiRoman,
  fr: blurbsFr,
  ja: blurbsJa,
  ko: blurbsKo,
  es: blurbsEs,
  de: blurbsDe,
  pt: blurbsPt,
  ru: blurbsRu,
  ar: blurbsAr,
  zh: blurbsZh,
};

const KEY = "lp_language";

function isLanguageCode(code: string): code is LanguageCode {
  return LANGUAGES.some((l) => l.code === code);
}

/** Browser locale when it matches a supported language, else English. */
function defaultLanguage(): LanguageCode {
  try {
    const base = (navigator.language || "en").split("-")[0].toLowerCase();
    if (base === "hi") return "hi-roman";
    if (isLanguageCode(base)) return base;
  } catch {
    // Locale unavailable — fall through to English.
  }
  return "en";
}

/** BCP 47 tag for <html lang>: hi-roman is an app code, not a tag. */
function htmlLang(code: LanguageCode): string {
  if (code === "hi-roman") return "hi";
  return code;
}

interface LanguageContextValue {
  lang: LanguageCode;
  setLang: (lang: LanguageCode) => void;
  t: Strings;
  /** Translated course video title, or the original title when untranslated. */
  videoTitle: (videoId: string, fallback: string) => string;
  /** Translated roadmap stage/topic/difficulty name, or the English name. */
  roadmapName: (englishName: string) => string;
  /** Translated tutorial title by slug, or the fallback when untranslated. */
  tutorialTitle: (slug: string, fallback: string) => string;
  /** Translated day-lesson title by lesson id, or the fallback when untranslated. */
  lessonTitle: (lessonId: string, fallback: string) => string;
  /** Translated reference-entry title by slug, or the fallback when untranslated. */
  referenceTitle: (slug: string, fallback: string) => string;
  /** Translated roadmap blurb for an English topic title (English fallback). */
  roadmapBlurb: (englishTopic: string) => string;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: "en",
  setLang: () => {},
  t: en,
  videoTitle: (_videoId, fallback) => fallback,
  roadmapName: (name) => name,
  tutorialTitle: (_slug, fallback) => fallback,
  lessonTitle: (_lessonId, fallback) => fallback,
  referenceTitle: (_slug, fallback) => fallback,
  roadmapBlurb: (topic) => topic,
});

// Current strings for non-component code. Components must use
// useLanguage() instead; this is English until the provider mounts
// and resolves the stored language.
let currentStrings: Strings = en;

export function getCurrentStrings(): Strings {
  return currentStrings;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<LanguageCode>("en");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(KEY);
      if (stored && isLanguageCode(stored)) {
        setLangState(stored);
      } else {
        setLangState(defaultLanguage());
      }
    } catch {
      // Storage/locale unavailable — stay on English.
    }
  }, []);

  useEffect(() => {
    currentStrings = STRINGS[lang];
    document.documentElement.lang = htmlLang(lang);
  }, [lang]);

  const setLang = useCallback((next: LanguageCode) => {
    setLangState(next);
    try {
      localStorage.setItem(KEY, next);
    } catch {
      // Storage unavailable — the choice still applies for this session.
    }
  }, []);

  const videoTitle = useCallback(
    (videoId: string, fallback: string) =>
      TITLES[lang].videoTitles[videoId] ?? fallback,
    [lang]
  );

  const roadmapName = useCallback(
    (englishName: string) =>
      TITLES[lang].roadmapNames[englishName] ?? englishName,
    [lang]
  );

  const tutorialTitle = useCallback(
    (slug: string, fallback: string) =>
      getTutorialTranslations(lang)[slug]?.title ?? fallback,
    [lang]
  );

  const lessonTitle = useCallback(
    (lessonId: string, fallback: string) =>
      TITLES[lang].lessonTitles[lessonId] ?? fallback,
    [lang]
  );

  const referenceTitle = useCallback(
    (slug: string, fallback: string) =>
      getReferenceTranslations(lang)[slug]?.title ?? fallback,
    [lang]
  );

  const roadmapBlurb = useCallback(
    (englishTopic: string) =>
      BLURBS[lang][englishTopic] ?? BLURBS.en[englishTopic] ?? englishTopic,
    [lang]
  );

  const value = useMemo(
    () => ({
      lang,
      setLang,
      t: STRINGS[lang],
      videoTitle,
      roadmapName,
      tutorialTitle,
      lessonTitle,
      referenceTitle,
      roadmapBlurb,
    }),
    [lang, setLang, videoTitle, roadmapName, tutorialTitle, lessonTitle, referenceTitle, roadmapBlurb]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  return useContext(LanguageContext);
}

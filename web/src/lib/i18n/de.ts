// German strings — UI chrome only (see en.ts for scope).
// Keys copied from the app's de.ts are VERBATIM — same key, same
// German wording, same function shape. Website-only keys are
// translated fresh, following the app's conventions (informal "du").

import type { Strings } from "./index";

export const de: Strings = {
  common: {
    appName: "Learn Python",
    signIn: "Anmelden",
    signOut: "Abmelden",
    email: "E-Mail",
    password: "Passwort",
    genericError: "Etwas ist schiefgelaufen. Bitte versuche es erneut.",
    backToSignIn: "Zurück zur Anmeldung",
    retry: "Erneut versuchen",
    completed: "Abgeschlossen",
    watchedPct: (pct: number) => `${pct} % angesehen`,
    notStarted: "Nicht begonnen",
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
    sixDigitCodeLabel: "6-stelliger Code",
    roadmap: "Lernplan",
    settings: "Einstellungen",
    aiTutor: "KI-Tutor",
    close: "Schließen",
    all: "Alle",
    delete: "Löschen",
    clear: "Leeren",
    back: "Zurück",
    or: "oder",
    emailAddress: "E-Mail-Adresse",
    loading: "Wird geladen…",
    pleaseWait: "Bitte einen Moment warten.",
    errorPageDetail:
      "Diese Seite hat einen unerwarteten Fehler gemeldet. Versuch es erneut oder geh zurück zum Dashboard.",
    backToDashboard: "Zurück zum Dashboard",
    pageNotFound: "Seite nicht gefunden",
    pageNotFoundDetail:
      "Die Lektion oder Seite, die du suchst, existiert nicht.",
  },
  tabs: {
    learn: "Lernen",
    courses: "Kurse",
  },
  learn: {
    streakChip: (n: number) =>
      n === 1 ? `Serie: ${n} Tag` : `Serie: ${n} Tage`,
  },
  courses: {
    intro:
      "Vollständige Python-Videokurse – wähle einen Creator, um mit dem Ansehen zu beginnen.",
    countVideos: (n: number) => (n === 1 ? `${n} Video` : `${n} Videos`),
  },
  editor: {
    title: "Code-Editor",
  },
  profile: {
    statStreakLabel: "Tage Serie",
  },
  lesson: {
    markComplete: "Als abgeschlossen markieren",
    askTutor: "KI-Tutor fragen",
    saveOffline: "Offline speichern",
    savedOffline: "Offline gespeichert",
    nextLesson: "Weiter →",
  },
  course: {
    markAsComplete: "Als abgeschlossen markieren",
    oneShotsHeading: "Einzelvideos",
    fullCourseLabel: "Vollständiger Kurs",
    totalLabel: "gesamt",
    playingLabel: "Läuft",
    pausedLabel: "Pausiert",
  },
  roadmap: {
    topicsComplete: (done: number, total: number) =>
      `${done} von ${total} Themen abgeschlossen`,
    topicMeta: (difficulty: string, minutes: number) =>
      `${difficulty} · ${minutes} Min.`,
    topicDone: "✓ Fertig",
  },
  tutor: {
    errorSessionExpired:
      "Deine Sitzung ist abgelaufen. Melde dich erneut an, um weiter zu chatten.",
    errorGeneric:
      "Der Tutor kann gerade nicht antworten. Prüfe deine Verbindung und versuch es erneut.",
    errorEmptyReply: "Die KI hat eine leere Antwort zurückgegeben — bitte versuch es erneut.",
    youLabel: "Du",
    groundedFootnote:
      "✓ Aus dem Video dieser Lektion — Zeitstempel zeigen auf die Stelle im Video.",
    notGroundedFootnote:
      "Allgemeine Antwort — das Transkript des Videos dieser Lektion war nicht verfügbar.",
    thinking: "Die KI denkt nach…",
    askButton: "Fragen",
  },
  auth: {
    continueWithGoogle: "Mit Google fortfahren",
    forgotPassword: "Passwort vergessen?",
    createAccount: "Konto erstellen",
    namePlaceholder: "Dein Name",
    otpSubtitle: (email: string, purpose: "signup" | "signin") =>
      `Wir haben einen 6-stelligen Code an ${email || "deine E-Mail-Adresse"} gesendet. Gib ihn unten ein, um ${
        purpose === "signup" ? "dein Konto zu bestätigen" : "dich anzumelden"
      }.`,
    forgotSubtitle:
      "Gib die E-Mail ein, mit der du dich registriert hast, und wir senden dir einen Link zum Zurücksetzen.",
    sendResetLink: "Link zum Zurücksetzen senden",
    twoFactorTitle: "Zwei-Faktor-Authentifizierung",
    verifyAndSignIn: "Bestätigen und anmelden",
    couldNotSendCode: "Der Code konnte nicht gesendet werden. Bitte versuch es erneut.",
    codeSentToWithExpiry: (email: string) =>
      `Code an ${email} gesendet. Er läuft in 10 Minuten ab.`,
    couldNotSignIn: "Anmeldung fehlgeschlagen. Bitte versuch es erneut.",
    couldNotCreateAccount: "Das Konto konnte nicht erstellt werden. Bitte versuch es erneut.",
    codeIncorrectOrExpired: "Der Code ist falsch oder abgelaufen.",
    enterCodeTitle: "Code eingeben",
    signInWithEmail: "Mit E-Mail anmelden",
    signInEmailSubtitle: "Nutze deine E-Mail-Adresse und dein Passwort – oder stattdessen einen Code.",
    signUpEmailSubtitle: "Erstelle dein Konto — wir bestätigen zuerst deine E-Mail-Adresse.",
    signInOrCreateAccount: "Anmelden oder Konto erstellen",
    signingIn: "Anmeldung läuft…",
    continueWithEmailCode: "Stattdessen mit einem E-Mail-Code fortfahren",
    passwordWithMinPlaceholder: "Passwort (mindestens 8 Zeichen)",
    creatingAccount: "Konto wird erstellt…",
    verifying: "Wird geprüft…",
    verifyAndContinue: "Bestätigen und fortfahren",
    resendCodeIn: (cooldown: number) => `Code erneut senden in ${cooldown}s`,
    resendCode: "Code erneut senden",
    sending: "Wird gesendet…",
    couldNotSendEmail: "Die E-Mail konnte nicht gesendet werden. Bitte versuch es erneut.",
    resetLinkSentWithExpiry: (email: string) =>
      `Falls ein Konto für ${email} existiert, haben wir einen Link zum Zurücksetzen des Passworts gesendet. Er läuft in 1 Stunde ab.`,
    passwordsDontMatch: "Die Passwörter stimmen nicht überein.",
    couldNotResetPassword: "Das Passwort konnte nicht zurückgesetzt werden. Bitte versuch es erneut.",
    resetPassword: "Passwort zurücksetzen",
    checkingResetLink: "Link zum Zurücksetzen wird geprüft…",
    resetLinkExpiredTitle: "Link zum Zurücksetzen abgelaufen",
    resetLinkExpiredSubtitle:
      "Dieser Link zum Zurücksetzen ist ungültig oder abgelaufen. Links zum Zurücksetzen funktionieren einmal und sind 1 Stunde gültig.",
    requestNewResetLink: "Neuen Link zum Zurücksetzen anfordern",
    setNewPasswordTitle: "Neues Passwort festlegen",
    setNewPasswordSubtitle: "Wähle ein neues Passwort für dein Konto.",
    passwordUpdated: "Passwort aktualisiert. Melde dich mit deinem neuen Passwort an.",
    newPasswordPlaceholder: "Neues Passwort (mindestens 8 Zeichen)",
    confirmNewPasswordPlaceholder: "Neues Passwort bestätigen",
    resetting: "Wird zurückgesetzt…",
    codeSentToYourEmailWithExpiry:
      "Code an deine E-Mail gesendet. Er läuft in 10 Minuten ab.",
    checkingSignInStep: "Anmeldeschritt wird geprüft…",
    signInStepExpiredTitle: "Anmeldeschritt abgelaufen",
    signInStepExpiredSubtitle:
      "Dieser Zwei-Faktor-Schritt dauert nur 10 Minuten. Melde dich erneut an, um fortzufahren.",
    twoFactorEnterCodeSubtitle:
      "Gib den Code aus deiner Authenticator-App ein, um die Anmeldung abzuschließen.",
    secondFactorMethodLabel: "Methode für den zweiten Faktor",
    methodAuthenticator: "Authenticator",
    methodEmailCode: "E-Mail-Code",
    methodBackupCode: "Backup-Code",
    emailCodeWillBeSent:
      "Wir senden einen 6-stelligen Code an die E-Mail-Adresse deines Kontos.",
    sendEmailCode: "E-Mail-Code senden",
    backupCodesWorkOnce:
      "Backup-Codes funktionieren einmal. Du findest sie dort, wo du sie gespeichert hast, als du die Zwei-Faktor-Authentifizierung aktiviert hast.",
  },
  settings: {
    dailyGoal: "Tagesziel",
    streak: "Serie",
    appearance: "Darstellung",
    theme: "Design",
    themeDark: "Dunkel",
    themeLight: "Hell",
    language: "Sprache",
    languageHint: "Gilt sofort für die gesamte App.",
    goalMinutes: (minutes: number) => `${minutes} Min.`,
    couldNotStartTwoFactorSetup: "Einrichtung konnte nicht gestartet werden. Bitte versuch es erneut.",
    twoFactorCodeIncorrect: "Der Code ist falsch. Versuch es erneut.",
    couldNotDisableTwoFactor: "Die Zwei-Faktor-Authentifizierung konnte nicht deaktiviert werden.",
    twoFactorOff: "Die Zwei-Faktor-Authentifizierung ist aus.",
    couldNotGenerateBackupCodes: "Neue Backup-Codes konnten nicht erstellt werden.",
    twoFactorSignInRequired:
      "Melde dich an, um die Zwei-Faktor-Authentifizierung für dein Konto zu verwalten.",
    twoFactorGoogleManaged:
      "Du hast dich mit Google angemeldet — die Zwei-Faktor-Authentifizierung wird von deinem Google-Konto verwaltet, nicht hier.",
    twoFactorIntro:
      "Füge der Anmeldung einen zweiten Schritt hinzu — mit Google Authenticator oder einem E-Mail-Code. Dein Passwort allein reicht dann nicht mehr aus.",
    twoFactorStarting: "Wird gestartet…",
    setUpTwoFactor: "Zwei-Faktor-Authentifizierung einrichten",
    twoFactorScanQr:
      "Scanne diesen QR-Code mit Google Authenticator (oder einer anderen Authenticator-App) und gib dann den 6-stelligen Code ein, den sie anzeigt.",
    twoFactorQrAlt: "QR-Code zur Einrichtung der Zwei-Faktor-Authentifizierung",
    cantScanEnterSecret: "Kannst du nicht scannen? Gib dieses Geheimnis manuell ein: ",
    turnOnTwoFactor: "Zwei-Faktor-Authentifizierung aktivieren",
    twoFactorOn: "Die Zwei-Faktor-Authentifizierung ist an.",
    twoFactorOnExplainer:
      "Bei der Anmeldung wird nach deinem Passwort der Code aus deiner Authenticator-App (oder ein E-Mail-Code) abgefragt.",
    newBackupCodes: "Neue Backup-Codes",
    disable: "Deaktivieren",
    disableTwoFactorPrompt:
      "Gib dein Passwort ein, um die Zwei-Faktor-Authentifizierung zu deaktivieren.",
    disablingTwoFactor: "Wird deaktiviert…",
    disableTwoFactor: "Zwei-Faktor-Authentifizierung deaktivieren",
    backupCodesTitle: "Backup-Codes",
    backupCodesWarning:
      "Bewahre sie an einem sicheren Ort auf — jeder Code funktioniert einmal, und dies ist das einzige Mal, dass sie angezeigt werden.",
    savedBackupCodes: "Ich habe diese Codes gespeichert",
    backupCodesSaved: "Backup-Codes gespeichert. Bewahre sie an einem sicheren Ort auf.",
  },
  update: {
    tryAgain: "Erneut versuchen",
  },
  landing: {
    heroTitle: "Lerne Python-Programmierung,",
    heroWordOnline: "online",
    heroWordOffline: "offline",
    heroSubtitle:
      "Tutorials nach Themen, Videokurse und ein echter Code-Editor — von deinem ersten print() bis zu echten Projekten. Schau zu, programmiere und baue deine Serie auf.",
    getStarted: "Loslegen",
    heroNote: "Kostenlos • Mit E-Mail oder Google anmelden • Dein Fortschritt bleibt auf diesem Gerät",
    statTopics: "Themen",
    statVideos: "Videos",
    statStages: "Stufen",
    featuresHeading: "Alles, was du brauchst, um wirklich fertig zu werden",
    featureVideosTitle: "Videos, online & offline",
    featureVideosText:
      "Sieh dir Videolektionen mit oder ohne Internet an — speichere sie auf deinem Gerät und schau weiter, wenn die Verbindung abbricht.",
    featureTutorialsTitle: "Tutorials, auch offline",
    featureTutorialsText:
      "Tutorials nach Themen und Referenzeinträge — lies sie überall, auch ohne Internet.",
    featureEditorText:
      "Schreibe und führe echtes Python im Browser aus — Monaco-Editor mit Pyodide, Arbeitsbereich mit mehreren Dateien, keine Installation nötig.",
    featureTutorText:
      "Bei einem Konzept oder Fehler nicht weitergekommen? Frag den KI-Tutor alles — er antwortet anhand der Lektion, auf der du gerade bist, mit Beispielen und Lösungen.",
    featureGithubTitle: "GitHub, eingebaut",
    featureGithubText:
      "Verbinde dein GitHub-Konto, erstelle Repos und pushe deinen Code direkt aus dem Editor — deine Arbeit, von Tag eins an versioniert.",
    featureGoalsTitle: "Tagesziele & Serien",
    featureGoalsText:
      "Setze dir ein tägliches Lernziel, halte deine Serie am Leben und sieh deinen echten Fortschritt für heute auf einen Blick.",
    splashTagline: "Lernen • Üben • Offline",
  },
  navbar: {
    continue: "Weitermachen",
    profileMenu: "Profilmenü",
    mainNavLabel: "Hauptnavigation",
    openMenu: "Menü öffnen",
    closeMenu: "Menü schließen",
  },
  learnPage: {
    example: "Beispiel",
    copy: "Kopieren",
    copied: "Kopiert",
    output: "Ausgabe",
    noteLabel: "Hinweis: ",
    tipLabel: "Tipp: ",
    topicNotFound: "Thema nicht gefunden",
    topicNotFoundHint:
      "Wähle ein Thema aus der Seitenleiste — jedes Python-Thema findest du dort.",
    tryInEditor: "Im Editor ausprobieren",
    summary: "Zusammenfassung",
    practice: "Üben",
    practiceHint:
      "Probiere jede Aufgabe im Code-Editor aus — Lesen allein reicht nicht, erst selbst tippen lässt es sitzen.",
    tutorialBeingPrepared:
      "Das schriftliche Tutorial zu diesem Thema wird gerade vorbereitet. Wähle vorerst ein anderes Thema aus der Seitenleiste — dieses erscheint hier, sobald es fertig ist.",
    previous: "Zurück",
    backToPythonHome: (title: string) => `Zurück zu ${title}`,
  },
  sidebar: {
    searchTopics: "Themen suchen",
    noTopicsMatch: (query: string) => `Keine Themen für „${query}“.`,
    closeTopics: "Themen schließen",
    sectionPythonTutorial: "Python-Tutorial",
    sectionPythonClasses: "Python-Klassen",
    sectionFileHandling: "Dateiverarbeitung",
    sectionPythonModules: "Python-Module",
    sectionPythonMatplotlib: "Python Matplotlib",
    sectionMachineLearning: "Maschinelles Lernen",
    sectionPythonDsa: "Python DSA",
    sectionPythonMysql: "Python MySQL",
    sectionPythonMongodb: "Python MongoDB",
    sectionPythonCert: "Python-Zertifikat",
    sectionPythonHowTo: "Python-Anleitungen",
    sectionPythonExamples: "Python-Beispiele",
    sectionPythonReference: "Python-Referenz",
    sectionModuleReference: "Modul-Referenz",
    groupPythonArrays: "Python-Arrays",
    groupPythonCasting: "Python-Casting",
    groupPythonClassMethods: "Python-Klassenmethoden",
    groupPythonClassProperties: "Python-Klasseneigenschaften",
    groupPythonDates: "Python-Daten",
    groupPythonEncapsulation: "Python-Kapselung",
    groupPythonInheritance: "Python-Vererbung",
    groupPythonIterators: "Python-Iteratoren",
    groupPythonJson: "Python JSON",
    groupPythonMagicMethods: "Python-Magische Methoden",
    groupPythonMath: "Python-Mathe",
    groupPythonNone: "Python None",
    groupPythonPolymorphism: "Python-Polymorphie",
    groupPythonRange: "Python Range",
    groupPythonRegex: "Python RegEx",
    groupPythonStringFormatting: "Python-Stringformatierung",
    groupPythonTryExcept: "Python Try...Except",
    groupPythonInitMethod: "Python __init__-Methode",
    groupPythonSelfParameter: "Python self-Parameter",
  },
  quiz: {
    testLabel: "Test",
    passRequirement: (pct: number) =>
      `Erreiche ${pct} % oder mehr, um den Test zu bestehen.`,
    closeTest: "Test schließen",
    correctAnswer: (answer: string) => `Richtige Antwort: ${answer}`,
    correct: "Richtig",
    submitTest: "Test abgeben",
    passedScore: (score: number, total: number) =>
      `Bestanden — ${score}/${total} richtig`,
    passedMessage: "Du hast den Test zu dieser Lektion bestanden.",
    notPassedScore: (score: number, total: number) =>
      `Nicht bestanden — ${score}/${total} richtig`,
    notPassedMessage: (pct: number) =>
      `Du brauchst ${pct} % zum Bestehen. Sieh dir die Antworten oben an und versuch es erneut.`,
  },
  roadmapModal: {
    title: "Dein Python-Lernplan",
    subtitle: (totalTopics: number, totalMinutes: string) =>
      `${totalTopics} Themen • etwa ${totalMinutes} • von oben nach unten durcharbeiten`,
    close: "Lernplan schließen",
    dialogLabel: "Python-Lernplan",
    savedDialogLabel: "Lernplan gespeichert",
    savedTitle: "Lernplan für später gespeichert",
    savedBody:
      "Beim nächsten Mal kannst du den Lernplan über das Profilmenü in der Vorschau ansehen.",
    gotIt: "Verstanden",
  },
  coursesPage: {
    videoCourses: "Videokurse",
    heroTitle: "Lerne Python durch Zuschauen.",
    emptyState: "Kursvideos werden gerade hinzugefügt — schau bald wieder vorbei.",
    allTeachers: "Alle Lehrer",
    channelPictureAlt: (name: string) => `${name}-Kanalbild`,
    countCourses: (n: number) => (n === 1 ? `${n} Kurs` : `${n} Kurse`),
    videoSourceNote: "MEGA & Drive, vorerst YouTube",
    taglineCodeWithHarry:
      "Vollständige Python-Kurse auf Hindi — Schritt für Schritt, mit Notizen.",
    taglineMosh:
      "Der klassische Python-Kurs auf Englisch — vollständiger Kurs plus Themenvideos.",
    taglineApnaCollege:
      "Vollständige Python-Kurse auf Hindi, mit Notizen und Übungsfragen.",
  },
  editorPage: {
    emptyFileError: "Diese Datei ist leer — schreibe zuerst etwas Code.",
    aiEmptyReplyError: "Die KI hat eine leere Antwort zurückgegeben — bitte versuch es erneut.",
    micropipTimeoutError:
      "Das Laden von micropip hat nach 1 Minute abgebrochen — prüfe deine Verbindung und versuch es erneut.",
    pyodideLoadError:
      "Das Pyodide-Skript konnte nicht von cdn.jsdelivr.net geladen werden — prüfe deine Verbindung und lade die Seite neu.",
    fileExistsError: "Eine Datei mit diesem Pfad existiert bereits",
    folderExistsError: "Ein Ordner mit diesem Namen existiert bereits",
    keepOneFileError: "Du musst mindestens eine Datei im Arbeitsbereich behalten.",
    itemExistsInLocationError: (itemName: string) =>
      `Ein Element namens '${itemName}' existiert bereits an diesem Ort.`,
    filesTab: "Dateien",
    modulesTab: "Module",
    activeLabel: "Aktiv:",
    noActiveFile: "Keine",
    unsavedBadge: "(ungespeichert*)",
    saved: "Gespeichert",
    saveFileRequired: "Datei speichern (erforderlich)",
    explainCodeHint: "Die KI bitten, diese Datei zu erklären",
    explainCode: "Diesen Code erklären",
    findBugHint: "Die KI bitten, den Fehler in dieser Datei zu finden",
    findBug: "Fehler finden",
    stop: "Stopp",
    stopHint: "Den laufenden Code unterbrechen",
    stopUnavailableHint:
      "Stopp braucht SharedArrayBuffer, das diese Browser-Einrichtung nicht bereitstellt — lade die Seite neu, um einen festhängenden Lauf zu stoppen.",
    compiling: "Wird kompiliert...",
    loadingEngine: "Engine wird geladen",
    compileAndRun: "Kompilieren & Ausführen",
    saveNow: "Jetzt speichern",
    explorer: "Explorer",
    newFile: "Neue Datei",
    newFolder: "Neuer Ordner",
    newFilePlaceholder: "z. B. script.py oder utils/helper.py",
    newFolderPlaceholder: "Ordnername, z. B. tests",
    workspaceRootDropHint: "Arbeitsbereich-Stamm (hier ablegen, um heraus zu verschieben)",
    unsavedTooltip: "Ungespeichert",
    dragFilesHint: "Dateien von deinem Computer hierher ziehen",
    terminalLogs: "Terminal-Protokolle",
    programInputLabel: "Programmeingabe — eine Zeile pro input()-Aufruf",
    programInputPlaceholder: "z. B.\nAdeen\n21",
    terminalInputPlaceholder: "Python-Befehl eingeben, z. B. 2 + 2 — oder 'clear', um das Terminal zu leeren",
    terminalInputLoadingPlaceholder: "Die Python-Laufzeit wird noch geladen…",
    terminalNotReady: "Die Python-Laufzeit wird noch geladen — bitte warten, bis sie fertig ist, dann erneut versuchen.",
    aiExplanation: "KI-Erklärung",
    aiBugCheck: "KI-Fehlerprüfung",
    aiCodeHelp: "KI-Code-Hilfe",
    closeAiAnswer: "KI-Antwort schließen",
    aiUnavailableMessage:
      "Die KI ist gerade nicht verfügbar — die API-Schlüssel sind noch nicht konfiguriert. Der Editor und der Rest des Kurses funktionieren normal.",
    aiReadingCode: "Die KI liest deinen Code…",
    aiTruncatedNote:
      "Hinweis: Die Datei war länger als das KI-Limit, daher wurden nur die ersten 8000 Zeichen gesendet.",
  },
  modulesPage: {
    openingInEditor: "Module werden im Code-Editor geöffnet…",
    title: "Python-Module & Pakete-Manager",
    subtitle:
      "Durchsuche die komplette offizielle Python-Standardbibliothek und suche/installiere alle PyPI- & Pyodide-Pakete in deinem Arbeitsbereich.",
    tabStdlib: (count: number) => `Eingebaute Standardbibliothek (${count})`,
    tabExternal: (count: number) => `Externe Pakete (${count})`,
    tabSearch: "Live-PyPI-Suche & Installation",
    filterStdlibPlaceholder: "Eingebaute Module filtern...",
    builtInReady: "Eingebaut (immer bereit)",
    docs: "Doku",
    externalIntro: (pyodideCount: number, micropipCount: number) =>
      `${pyodideCount} Pyodide-Pakete (schnelle Installation vom CDN) + ${micropipCount} beliebte reine Python-PyPI-Pakete (Installation via micropip).`,
    installedInWorkspace: (n: number) => `${n} in diesem Arbeitsbereich installiert.`,
    externalOutro:
      "Alles andere auf PyPI kann weiterhin über den exakten Namen im Tab „Live-PyPI-Suche“ installiert werden.",
    searchPackagesPlaceholder:
      "Alle Pakete durchsuchen — z. B. numpy, flask, seaborn, opencv…",
    installByNamePlaceholder: "Paket per Name installieren — z. B. tabulate",
    install: "Installieren",
    showingCount: (shown: number, total: number) =>
      `${shown} von ${total} Paketen werden angezeigt.`,
    noMatch:
      "Kein Treffer — versuch es im Tab „Live-PyPI-Suche“ mit einem exakten Paketnamen.",
    installed: "Installiert",
    remove: "Entfernen",
    installing: "Wird installiert...",
    installPackage: "Paket installieren",
    searchHeading: "Das offizielle Python Package Index (PyPI) durchsuchen",
    searchPyPiPlaceholder: "z. B. rich, requests, sympy, tabulate, httpx, textstat",
    searchPyPi: "PyPI durchsuchen",
    installedInWorkspaceLabel: "Im Arbeitsbereich installiert",
    installPackageNamed: (name: string) => `${name} installieren`,
    licenseLabel: "Lizenz:",
    authorLabel: "Autor:",
    projectHomepage: "Projekt-Homepage",
    logsHeading: "Terminal-Protokolle der Paket-Engine",
    logsEmpty:
      "Python-Umgebung bereit. Installiere ein Paket, um es in deinen Arbeitsbereich zu laden.",
    stageStartingRuntime: "Python-Laufzeit wird gestartet…",
    logStartingRuntime:
      "Python-Laufzeit wird gestartet — einmaliger Download (~15 MB), bitte warten…",
    stageRuntimeReady: "Python-Laufzeit bereit",
    logRuntimeReady: "Python-Laufzeit bereit.",
    errorEnvStartWithDetail: (error: string) =>
      `Die Python-Umgebung konnte nicht gestartet werden: ${error}`,
    errorEnvStartNoLoad:
      "Die Python-Umgebung konnte nicht gestartet werden (das Pyodide-Skript wurde nicht geladen). Prüfe deine Verbindung und versuch es erneut — der Installieren-Button versucht es erneut.",
    stageDownloading: (pkg: string) => `'${pkg}' wird heruntergeladen…`,
    logInstalling: (pkg: string) => `'${pkg}' wird installiert…`,
    stageInstalled: (pkg: string) => `'${pkg}' installiert ✓`,
    logInstalled: (pkg: string, method: string, importName: string) =>
      `✓ '${pkg}' via ${method} installiert (import ${importName} funktioniert). Im Arbeitsbereich-Speicher abgelegt.`,
    logInstallFailed: (pkg: string, error: string) =>
      `✗ Installation von '${pkg}' fehlgeschlagen: ${error}`,
    logUninstalled: (pkg: string) =>
      `'${pkg}' deinstalliert und aus dem Arbeitsbereich entfernt.`,
    errorPackageNotFound: "Paket auf PyPI nicht gefunden",
    errorQueryPyPi: "Fehler bei der PyPI-Abfrage",
    defaultPyodideDesc:
      "Pyodide-Paket — schnelle Installation vom CDN, sofort importierbar.",
    stageLoadingMicropip: "micropip wird geladen…",
  },
  player: {
    errorOfflineCacheUnsupported:
      "Offline-Cache wird in diesem Browser nicht unterstützt.",
    errorDownloadFailed: (status: number) => `Download fehlgeschlagen (${status})`,
    errorSaveOffline: "Video konnte nicht offline gespeichert werden.",
    ariaLabel:
      "Videoplayer — Leertaste spielt ab oder pausiert, Pfeile links und rechts spulen 10 Sekunden vor/zurück",
    autoplayOnHint: "Autoplay an — die nächste Lektion spielt automatisch",
    autoplayOffHint: "Autoplay aus",
    autoplay: "Autoplay",
    playbackSpeed: "Wiedergabegeschwindigkeit",
    speedNormal: "Normal",
    quality: "Qualität",
    qualityAuto: "Auto",
    original: "(Original)",
    qualityNote:
      "MEGA liefert eine Qualität pro Video — die Datei oben ist der einzige Stream.",
    seekLabel: "Spulen",
    play: "Abspielen",
    pause: "Pausieren",
    mute: "Stumm",
    unmute: "Ton an",
    volumeLabel: "Lautstärke",
    hideCaptions: "Englische Untertitel ausblenden",
    showCaptions: "Englische Untertitel anzeigen",
    captionsLabel: "Englische Untertitel",
    downloadVideo: "Video herunterladen",
    settingsLabel: "Einstellungen — Geschwindigkeit und Qualität",
    exitFullscreen: "Vollbild beenden",
    fullscreen: "Vollbild",
    playingOffline: "Wiedergabe aus dem Offline-Speicher der App",
    streamingOnline: "Online-Streaming",
    offlineNotSaved: "Offline (nicht gespeichert)",
    keyboardHint:
      "Leertaste — Abspielen / Pausieren · ← → — 10 Sekunden spulen · ↑ ↓ — Lautstärke · Lautsprecher antippen für Lautstärke",
    removeOfflineCopy: "Offline-Kopie entfernen",
    savingPct: (pct: number) => `Wird gespeichert: ${pct} %`,
    saving: "Wird gespeichert…",
    sliderLabel: "Schieberegler",
    youtubeFallbackNote: "Wiedergabe von YouTube — MEGA-Link kommt bald",
    todayProgress: "Fortschritt heute",
    progressSummary: (minutesWatched: number, goalMinutes: number) =>
      `${minutesWatched} Min. von ${goalMinutes} Min. Ziel angesehen`,
    dailyTargetLabel: "Ziel (Min./Tag)",
    courseLessonsHeading: "Kurslektionen",
  },
  settingsPage: {
    subtitle: "Dein Fortschritt und wie die App aussieht.",
    todaySection: "Heute",
    goalProgress: (minutes: number, goal: number) => `${minutes}/${goal} Min.`,
    streakRestored: "Serie wiederhergestellt — willkommen zurück.",
    streakBroken: "Serie abgebrochen",
    streakBrokenRestore: (
      brokenStreak: number,
      restoresUsed: number,
      max: number
    ) =>
      `Deine ${brokenStreak}-Tage-Serie ist abgebrochen. Stelle sie wieder her, bevor der Timer abläuft — ${restoresUsed} von ${max} Wiederherstellungen in diesem Monat verbraucht.`,
    countdownHrs: "Std.",
    countdownMin: "Min.",
    countdownSec: "Sek.",
    restoreStreakButton: (brokenStreak: number) =>
      `${brokenStreak}-Tage-Serie wiederherstellen`,
    streakBrokenExpired: (brokenStreak: number) =>
      `Deine ${brokenStreak}-Tage-Serie ist abgebrochen und das 24-Stunden-Fenster zur Wiederherstellung ist abgelaufen. Schau dir eine Lektion an, um eine neue Serie zu starten.`,
    noRestoresLeft: "Keine Wiederherstellungen übrig",
    noRestoresLeftBody: (max: number, brokenStreak: number) =>
      `Du hast alle ${max} Wiederherstellungen in diesem Monat verbraucht. Deine ${brokenStreak}-Tage-Serie ist abgebrochen — schau dir eine Lektion an, um eine neue Serie zu starten. Wiederherstellungen werden nächsten Monat zurückgesetzt.`,
    accountSecurity: "Kontosicherheit",
  },
  tutorPage: {
    heading: "Frag die KI zu dieser Lektion",
    intro:
      "Zweifel, Erklärungen, Beispiele — auf Hindi oder Englisch. Antworten kommen aus dem echten Video dieser Lektion, mit Zeitstempeln, und alles, was das Video nicht abdeckt, ist als Allgemeinwissen gekennzeichnet. Chats werden nirgendwo gespeichert.",
    unavailable:
      "Die KI ist gerade nicht verfügbar — die API-Schlüssel sind noch nicht konfiguriert. Der Rest des Kurses funktioniert normal.",
    askPlaceholder: (lessonTitle: string) => {
      const display =
        lessonTitle.length > 40
          ? `${lessonTitle.slice(0, 40)}…`
          : lessonTitle;
      return `Frage zu "${display}"`;
    },
  },
  githubPage: {
    repoNameTooLong: "Der Repo-Name darf höchstens 100 Zeichen lang sein.",
    repoNameInvalidChars:
      "Repo-Namen dürfen keine Leerzeichen oder Sonderzeichen enthalten — nur Buchstaben, Zahlen, - _ . sind erlaubt.",
    tokenSaved: "Token nur in diesem Browser gespeichert.",
    tokenRemoved: "GitHub-Token getrennt.",
    loadReposFailed: "Repositories konnten nicht geladen werden",
    createRepoFailed: "Repository konnte nicht erstellt werden",
    repoCreated: (fullName: string) => `✓ Repo erfolgreich erstellt: ${fullName}`,
    pushFailed: "Push der Datei fehlgeschlagen",
    pushed: (filePath: string, fullName: string) =>
      `✓ '${filePath}' nach ${fullName} gepusht!`,
    title: "GitHub-Integration",
    intro:
      "Verbinde dein GitHub-Konto mit einem Personal Access Token (PAT), um Repositories zu erstellen und Code direkt aus LP zu committen. Der Token-Link unten öffnet GitHub mit allen Scopes vorab aktiviert, sodass der Token vollen Zugriff auf dein Konto hat.",
    connectHeading: "GitHub Personal Access Token verbinden",
    tokenExplainer:
      "Erstelle einen Token auf github.com/settings/tokens mit allen Scopes vorab aktiviert — der Token hat vollen Zugriff auf dein Konto, einschließlich Löschen von Repos und Verwalten von Orgs, also halte ihn geheim. Füge ihn dann unten ein. Dein Token lebt nur in diesem Browser (localStorage). Er wird nur an den LP-Server gesendet, um GitHub in deinem Auftrag aufzurufen, wird nie auf dem Server gespeichert, und „Trennen“ entfernt ihn aus diesem Browser.",
    connectToken: "Token verbinden",
    connected: (tokenPrefix: string) => `Mit GitHub verbunden • ${tokenPrefix}...`,
    refresh: "Aktualisieren",
    disconnect: "Trennen",
    createHeading: "Neues GitHub-Repository erstellen",
    repoNameLabel: "Repository-Name *",
    descriptionLabel: "Beschreibung (optional)",
    descriptionPlaceholder: "Übungslösungen und Notizen von LP",
    publicRepo: "Öffentliches Repository",
    privateRepo: "Privates Repository",
    initReadme: "Mit README initialisieren",
    createButton: "Repository auf GitHub erstellen",
    commitHeading: "Code aus dem Arbeitsbereich pushen / committen",
    targetRepoLabel: "Ziel-Repository *",
    visibilityPrivate: (fullName: string) => `${fullName} (privat)`,
    visibilityPublic: (fullName: string) => `${fullName} (öffentlich)`,
    visibilityPrivateShort: "privat",
    visibilityPublicShort: "öffentlich",
    filePathLabel: "Dateipfad im Repo *",
    filePathPlaceholder: "z. B. main.py",
    commitMessageLabel: "Commit-Nachricht *",
    commitMessagePlaceholder: "Commit-Nachricht",
    fileContentLabel: "Dateiinhalt",
    commitButton: (repoName: string) => `Committen & zu ${repoName} pushen`,
    repoFallback: "Repo",
    yourRepos: (count: number) => `Deine Repositories (${count})`,
    fetchingRepos: "Deine Repositories werden geladen...",
    noRepos: "Keine Repositories gefunden oder Zugriff eingeschränkt.",
    noDescription: "Keine Beschreibung",
    openOnGitHub: "Auf GitHub öffnen",
  },
};

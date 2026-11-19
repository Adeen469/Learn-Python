// Spanish strings — UI chrome only (see en.ts for scope).
// Keys shared with the app are copied VERBATIM from the app's es.ts;
// website-only keys are translated fresh, following the app's
// conventions ("tú" form, "Iniciar sesión", "Inténtalo de nuevo").

import type { Strings } from "./index";

export const es: Strings = {
  common: {
    appName: "Learn Python",
    signIn: "Iniciar sesión",
    signOut: "Cerrar sesión",
    email: "Correo electrónico",
    password: "Contraseña",
    genericError: "Algo salió mal. Inténtalo de nuevo.",
    backToSignIn: "Volver a iniciar sesión",
    retry: "Reintentar",
    completed: "Completado",
    watchedPct: (pct: number) => `Visto el ${pct}%`,
    notStarted: "Sin empezar",
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
    sixDigitCodeLabel: "Código de 6 dígitos",
    roadmap: "Ruta de aprendizaje",
    settings: "Ajustes",
    aiTutor: "Tutor de IA",
    close: "Cerrar",
    all: "Todos",
    delete: "Eliminar",
    clear: "Limpiar",
    back: "Atrás",
    or: "o",
    emailAddress: "Correo electrónico",
    loading: "Cargando…",
    pleaseWait: "Espera un momento, por favor.",
    errorPageDetail:
      "Esta página tuvo un error inesperado. Inténtalo de nuevo o vuelve al panel principal.",
    backToDashboard: "Volver al panel principal",
    pageNotFound: "Página no encontrada",
    pageNotFoundDetail:
      "La lección o página que buscas no existe.",
  },
  tabs: {
    learn: "Aprender",
    courses: "Cursos",
  },
  learn: {
    streakChip: (n: number) =>
      n === 1 ? `Racha: ${n} día` : `Racha: ${n} días`,
  },
  courses: {
    intro: "Cursos completos de Python en vídeo: elige un creador para empezar a ver.",
    countVideos: (n: number) => (n === 1 ? `${n} vídeo` : `${n} vídeos`),
  },
  editor: {
    title: "Editor de código",
  },
  profile: {
    statStreakLabel: "días de racha",
  },
  lesson: {
    markComplete: "Marcar como completada",
    askTutor: "Preguntar al tutor de IA",
    saveOffline: "Guardar sin conexión",
    savedOffline: "Guardado sin conexión",
    nextLesson: "Siguiente →",
  },
  course: {
    markAsComplete: "Marcar como completado",
    oneShotsHeading: "Vídeos únicos",
    fullCourseLabel: "Curso completo",
    totalLabel: "en total",
    playingLabel: "Reproduciendo",
    pausedLabel: "En pausa",
  },
  roadmap: {
    topicsComplete: (done: number, total: number) =>
      `${done} de ${total} temas completados`,
    topicMeta: (difficulty: string, minutes: number) =>
      `${difficulty} · ${minutes} min`,
    topicDone: "✓ Hecho",
  },
  tutor: {
    errorSessionExpired: "Tu sesión caducó. Inicia sesión de nuevo para seguir chateando.",
    errorGeneric:
      "El tutor no puede responder ahora mismo. Revisa tu conexión e inténtalo de nuevo.",
    errorEmptyReply: "La IA devolvió una respuesta vacía; inténtalo de nuevo.",
    youLabel: "Tú",
    groundedFootnote:
      "✓ Del vídeo de esta lección: las marcas de tiempo apuntan al momento exacto del vídeo.",
    notGroundedFootnote:
      "Respuesta general: la transcripción del vídeo de esta lección no estaba disponible.",
    thinking: "La IA está pensando…",
    askButton: "Preguntar",
  },
  auth: {
    continueWithGoogle: "Continuar con Google",
    forgotPassword: "¿Olvidaste tu contraseña?",
    createAccount: "Crear cuenta",
    namePlaceholder: "Tu nombre",
    otpSubtitle: (email: string, purpose: "signup" | "signin") =>
      `Te enviamos un código de 6 dígitos a ${email || "tu correo electrónico"}. Introdúcelo abajo para ${
        purpose === "signup" ? "verificar tu cuenta" : "iniciar sesión"
      }.`,
    forgotSubtitle:
      "Introduce el correo con el que te registraste y te enviaremos un enlace para restablecerla.",
    sendResetLink: "Enviar enlace de restablecimiento",
    twoFactorTitle: "Autenticación en dos pasos",
    verifyAndSignIn: "Verificar e iniciar sesión",
    couldNotSendCode: "No se pudo enviar el código. Inténtalo de nuevo.",
    codeSentToWithExpiry: (email: string) =>
      `Código enviado a ${email}. Caduca en 10 minutos.`,
    couldNotSignIn: "No se pudo iniciar sesión. Inténtalo de nuevo.",
    couldNotCreateAccount: "No se pudo crear la cuenta. Inténtalo de nuevo.",
    codeIncorrectOrExpired: "El código es incorrecto o ha caducado.",
    enterCodeTitle: "Introduce el código",
    signInWithEmail: "Iniciar sesión con correo electrónico",
    signInEmailSubtitle: "Usa tu correo electrónico y tu contraseña, o un código.",
    signUpEmailSubtitle: "Crea tu cuenta: primero verificaremos tu correo electrónico.",
    signInOrCreateAccount: "Inicia sesión o crea una cuenta",
    signingIn: "Iniciando sesión…",
    continueWithEmailCode: "Continuar con un código por correo electrónico",
    passwordWithMinPlaceholder: "Contraseña (al menos 8 caracteres)",
    creatingAccount: "Creando cuenta…",
    verifying: "Verificando…",
    verifyAndContinue: "Verificar y continuar",
    resendCodeIn: (cooldown: number) => `Reenviar código en ${cooldown}s`,
    resendCode: "Reenviar código",
    sending: "Enviando…",
    couldNotSendEmail: "No se pudo enviar el correo. Inténtalo de nuevo.",
    resetLinkSentWithExpiry: (email: string) =>
      `Si existe una cuenta con ${email}, te hemos enviado un enlace para restablecer la contraseña. Caduca en 1 hora.`,
    passwordsDontMatch: "Las contraseñas no coinciden.",
    couldNotResetPassword: "No se pudo restablecer la contraseña. Inténtalo de nuevo.",
    resetPassword: "Restablecer contraseña",
    checkingResetLink: "Comprobando tu enlace de restablecimiento…",
    resetLinkExpiredTitle: "Enlace de restablecimiento caducado",
    resetLinkExpiredSubtitle:
      "Este enlace de restablecimiento no es válido o ha caducado. Los enlaces de restablecimiento solo se pueden usar una vez y duran 1 hora.",
    requestNewResetLink: "Solicitar un nuevo enlace de restablecimiento",
    setNewPasswordTitle: "Establecer una nueva contraseña",
    setNewPasswordSubtitle: "Elige una nueva contraseña para tu cuenta.",
    passwordUpdated: "Contraseña actualizada. Inicia sesión con tu nueva contraseña.",
    newPasswordPlaceholder: "Nueva contraseña (al menos 8 caracteres)",
    confirmNewPasswordPlaceholder: "Confirmar nueva contraseña",
    resetting: "Restableciendo…",
    codeSentToYourEmailWithExpiry:
      "Código enviado a tu correo. Caduca en 10 minutos.",
    checkingSignInStep: "Comprobando tu paso de inicio de sesión…",
    signInStepExpiredTitle: "Paso de inicio de sesión caducado",
    signInStepExpiredSubtitle:
      "Este paso de dos factores solo dura 10 minutos. Inicia sesión de nuevo para continuar.",
    twoFactorEnterCodeSubtitle:
      "Introduce el código de tu app de autenticación para terminar de iniciar sesión.",
    secondFactorMethodLabel: "Método de segundo factor",
    methodAuthenticator: "Autenticador",
    methodEmailCode: "Código por correo",
    methodBackupCode: "Código de respaldo",
    emailCodeWillBeSent:
      "Te enviaremos un código de 6 dígitos a la dirección de tu cuenta.",
    sendEmailCode: "Enviar código por correo",
    backupCodesWorkOnce:
      "Los códigos de respaldo solo se pueden usar una vez. Búscalos donde los guardaste cuando activaste la autenticación en dos pasos.",
  },
  settings: {
    dailyGoal: "Objetivo diario",
    streak: "Racha",
    appearance: "Apariencia",
    theme: "Tema",
    themeDark: "Oscuro",
    themeLight: "Claro",
    language: "Idioma",
    languageHint: "Se aplica a toda la app de inmediato.",
    goalMinutes: (minutes: number) => `${minutes} min`,
    couldNotStartTwoFactorSetup: "No se pudo iniciar la configuración. Inténtalo de nuevo.",
    twoFactorCodeIncorrect: "El código es incorrecto. Inténtalo de nuevo.",
    couldNotDisableTwoFactor: "No se pudo desactivar la autenticación en dos pasos.",
    twoFactorOff: "La autenticación en dos pasos está desactivada.",
    couldNotGenerateBackupCodes: "No se pudieron generar nuevos códigos de respaldo.",
    twoFactorSignInRequired:
      "Inicia sesión para gestionar la autenticación en dos pasos de tu cuenta.",
    twoFactorGoogleManaged:
      "Iniciaste sesión con Google: la autenticación en dos pasos la gestiona tu cuenta de Google, no aquí.",
    twoFactorIntro:
      "Añade un segundo paso al inicio de sesión con Google Authenticator o un código por correo. Tu contraseña por sí sola ya no bastará.",
    twoFactorStarting: "Iniciando…",
    setUpTwoFactor: "Configurar la autenticación en dos pasos",
    twoFactorScanQr:
      "Escanea este código QR con Google Authenticator (o cualquier app de autenticación) y luego introduce el código de 6 dígitos que muestra.",
    twoFactorQrAlt: "Código QR para configurar la autenticación en dos pasos",
    cantScanEnterSecret: "¿No puedes escanear? Introduce este secreto manualmente: ",
    turnOnTwoFactor: "Activar la autenticación en dos pasos",
    twoFactorOn: "La autenticación en dos pasos está activada.",
    twoFactorOnExplainer:
      "Al iniciar sesión, se te pedirá el código de tu autenticador (o un código por correo) después de la contraseña.",
    newBackupCodes: "Nuevos códigos de respaldo",
    disable: "Desactivar",
    disableTwoFactorPrompt:
      "Introduce tu contraseña para desactivar la autenticación en dos pasos.",
    disablingTwoFactor: "Desactivando…",
    disableTwoFactor: "Desactivar la autenticación en dos pasos",
    backupCodesTitle: "Códigos de respaldo",
    backupCodesWarning:
      "Guárdalos en un lugar seguro: cada código solo se puede usar una vez, y esta es la única vez que se muestran.",
    savedBackupCodes: "He guardado estos códigos",
    backupCodesSaved: "Códigos de respaldo guardados. Guárdalos en un lugar seguro.",
  },
  update: {
    tryAgain: "Intentar de nuevo",
  },
  landing: {
    heroTitle: "Aprende programación en Python,",
    heroWordOnline: "en línea",
    heroWordOffline: "sin conexión",
    heroSubtitle:
      "Tutoriales tema por tema, cursos en vídeo y un editor de código real: desde tu primer print() hasta proyectos reales. Mira, programa y mantén la racha.",
    getStarted: "Empezar",
    heroNote: "Gratis • Inicia sesión con correo electrónico o Google • Tu progreso se queda en este dispositivo",
    statTopics: "temas",
    statVideos: "vídeos",
    statStages: "etapas",
    featuresHeading: "Todo lo que necesitas para terminar de verdad",
    featureVideosTitle: "Vídeos, en línea y sin conexión",
    featureVideosText:
      "Mira las lecciones en vídeo con o sin internet: guárdalas en tu dispositivo y sigue viéndolas cuando se caiga la conexión.",
    featureTutorialsTitle: "Tutoriales, también sin conexión",
    featureTutorialsText:
      "Tutoriales tema por tema y entradas de referencia: léelos donde quieras, incluso sin internet.",
    featureEditorText:
      "Escribe y ejecuta Python real en el navegador: editor Monaco con Pyodide, espacio de trabajo con varios archivos, sin instalar nada.",
    featureTutorText:
      "¿Atascado con un concepto o un error? Pregúntale lo que quieras al tutor de IA: responde desde la lección en la que estás, con ejemplos y soluciones.",
    featureGithubTitle: "GitHub, integrado",
    featureGithubText:
      "Conecta tu cuenta de GitHub, crea repositorios y sube tu código directamente desde el editor: tu trabajo, con versiones desde el primer día.",
    featureGoalsTitle: "Objetivos diarios y rachas",
    featureGoalsText:
      "Fija un objetivo diario de visualización, mantén viva la racha y ve el progreso real de hoy de un vistazo.",
    splashTagline: "Aprende • Practica • Sin conexión",
  },
  navbar: {
    continue: "Continuar",
    profileMenu: "Menú de perfil",
    mainNavLabel: "Principal",
    openMenu: "Abrir menú",
    closeMenu: "Cerrar menú",
  },
  learnPage: {
    example: "Ejemplo",
    copy: "Copiar",
    copied: "Copiado",
    output: "Salida",
    noteLabel: "Nota: ",
    tipLabel: "Consejo: ",
    topicNotFound: "Tema no encontrado",
    topicNotFoundHint:
      "Elige un tema en la barra lateral: todos los temas de Python están ahí.",
    tryInEditor: "Pruébalo en el editor",
    summary: "Resumen",
    practice: "Práctica",
    practiceHint:
      "Prueba cada tarea en el editor de código: leer no basta; escribirlo tú mismo es lo que hace que se te quede.",
    tutorialBeingPrepared:
      "El tutorial escrito de este tema se está preparando. Elige otro tema en la barra lateral por ahora: este aparecerá aquí cuando esté listo.",
    previous: "Anterior",
    backToPythonHome: (title: string) => `Volver a ${title}`,
  },
  sidebar: {
    searchTopics: "Buscar temas",
    noTopicsMatch: (query: string) => `Ningún tema coincide con “${query}”.`,
    closeTopics: "Cerrar temas",
    sectionPythonTutorial: "Tutorial de Python",
    sectionPythonClasses: "Clases de Python",
    sectionFileHandling: "Manejo de archivos",
    sectionPythonModules: "Módulos de Python",
    sectionPythonMatplotlib: "Matplotlib en Python",
    sectionMachineLearning: "Aprendizaje automático",
    sectionPythonDsa: "Python DSA",
    sectionPythonMysql: "MySQL en Python",
    sectionPythonMongodb: "MongoDB en Python",
    sectionPythonCert: "Certificación de Python",
    sectionPythonHowTo: "Cómo hacerlo en Python",
    sectionPythonExamples: "Ejemplos de Python",
    sectionPythonReference: "Referencia de Python",
    sectionModuleReference: "Referencia de módulos",
    groupPythonArrays: "Arrays de Python",
    groupPythonCasting: "Casting de Python",
    groupPythonClassMethods: "Métodos de clase en Python",
    groupPythonClassProperties: "Propiedades de clase en Python",
    groupPythonDates: "Fechas en Python",
    groupPythonEncapsulation: "Encapsulación en Python",
    groupPythonInheritance: "Herencia en Python",
    groupPythonIterators: "Iteradores en Python",
    groupPythonJson: "JSON en Python",
    groupPythonMagicMethods: "Métodos mágicos en Python",
    groupPythonMath: "Matemáticas en Python",
    groupPythonNone: "None en Python",
    groupPythonPolymorphism: "Polimorfismo en Python",
    groupPythonRange: "Range en Python",
    groupPythonRegex: "RegEx en Python",
    groupPythonStringFormatting: "Formato de cadenas en Python",
    groupPythonTryExcept: "Try...Except en Python",
    groupPythonInitMethod: "Método __init__ en Python",
    groupPythonSelfParameter: "Parámetro self en Python",
  },
  quiz: {
    testLabel: "Prueba",
    passRequirement: (pct: number) =>
      `Consigue un ${pct}% o más para aprobar la prueba.`,
    closeTest: "Cerrar la prueba",
    correctAnswer: (answer: string) => `Respuesta correcta: ${answer}`,
    correct: "Correcta",
    submitTest: "Enviar la prueba",
    passedScore: (score: number, total: number) =>
      `Aprobado — ${score}/${total} correctas`,
    passedMessage: "Aprobaste la prueba de esta lección.",
    notPassedScore: (score: number, total: number) =>
      `No aprobado — ${score}/${total} correctas`,
    notPassedMessage: (pct: number) =>
      `Necesitas un ${pct}% para aprobar. Revisa las respuestas de arriba e inténtalo de nuevo.`,
  },
  roadmapModal: {
    title: "Tu ruta de aprendizaje de Python",
    subtitle: (totalTopics: number, totalMinutes: string) =>
      `${totalTopics} temas • unos ${totalMinutes} • síguela de arriba abajo`,
    close: "Cerrar la ruta de aprendizaje",
    dialogLabel: "Ruta de aprendizaje de Python",
    savedDialogLabel: "Ruta de aprendizaje guardada",
    savedTitle: "Ruta de aprendizaje guardada para más tarde",
    savedBody:
      "La próxima vez podrás ver la ruta de aprendizaje desde el menú de perfil.",
    gotIt: "Entendido",
  },
  coursesPage: {
    videoCourses: "Cursos en vídeo",
    heroTitle: "Aprende Python viendo vídeos.",
    emptyState: "Se están añadiendo vídeos de cursos: vuelve pronto.",
    allTeachers: "Todos los profesores",
    channelPictureAlt: (name: string) => `Foto de perfil del canal de ${name}`,
    countCourses: (n: number) => (n === 1 ? `${n} curso` : `${n} cursos`),
    videoSourceNote: "MEGA y Drive, YouTube por ahora",
    taglineCodeWithHarry:
      "Cursos completos de Python en hindi, paso a paso y con apuntes.",
    taglineMosh:
      "El clásico curso de Python en inglés: curso completo y vídeos por tema.",
    taglineApnaCollege:
      "Cursos completos de Python en hindi, con apuntes y preguntas de práctica.",
  },
  editorPage: {
    emptyFileError: "Este archivo está vacío: escribe algo de código primero.",
    aiEmptyReplyError: "La IA devolvió una respuesta vacía; inténtalo de nuevo.",
    micropipTimeoutError:
      "La carga de micropip tardó más de 1 minuto: revisa tu conexión e inténtalo de nuevo.",
    pyodideLoadError:
      "No se pudo cargar el script de Pyodide desde cdn.jsdelivr.net: revisa tu conexión y recarga la página.",
    fileExistsError: "Ya existe un archivo con esta ruta",
    folderExistsError: "Ya existe una carpeta con este nombre",
    keepOneFileError: "Debes conservar al menos un archivo en el espacio de trabajo.",
    itemExistsInLocationError: (itemName: string) =>
      `Ya existe un elemento llamado '${itemName}' en esa ubicación.`,
    filesTab: "Archivos",
    modulesTab: "Módulos",
    activeLabel: "Activo:",
    noActiveFile: "Ninguno",
    unsavedBadge: "(sin guardar*)",
    saved: "Guardado",
    saveFileRequired: "Guardar archivo (obligatorio)",
    explainCodeHint: "Pídele a la IA que explique este archivo",
    explainCode: "Explicar este código",
    findBugHint: "Pídele a la IA que encuentre el error de este archivo",
    findBug: "Encontrar el error",
    stop: "Detener",
    stopHint: "Interrumpir el código en ejecución",
    stopUnavailableHint:
      "Detener necesita SharedArrayBuffer, que esta configuración del navegador no proporciona: recarga la página para detener una ejecución bloqueada.",
    compiling: "Compilando…",
    loadingEngine: "Cargando el motor",
    compileAndRun: "Compilar y ejecutar",
    saveNow: "Guardar ahora",
    explorer: "Explorador",
    newFile: "Nuevo archivo",
    newFolder: "Nueva carpeta",
    newFilePlaceholder: "p. ej., script.py o utils/helper.py",
    newFolderPlaceholder: "nombre de la carpeta, p. ej., tests",
    workspaceRootDropHint: "Raíz del espacio de trabajo (suelta aquí para mover fuera)",
    unsavedTooltip: "Sin guardar",
    dragFilesHint: "Arrastra archivos aquí desde tu ordenador",
    terminalLogs: "Registros de la terminal",
    programInputLabel: "Entrada del programa: una línea por cada llamada a input()",
    programInputPlaceholder: "p. ej.\nAdeen\n21",
    aiExplanation: "Explicación de la IA",
    aiBugCheck: "Revisión de errores de la IA",
    aiCodeHelp: "Ayuda de la IA con el código",
    closeAiAnswer: "Cerrar la respuesta de la IA",
    aiUnavailableMessage:
      "La IA no está disponible ahora mismo: las claves de la API aún no están configuradas. El editor y el resto del curso funcionan con normalidad.",
    aiReadingCode: "La IA está leyendo tu código…",
    aiTruncatedNote:
      "Nota: el archivo superaba el límite de la IA, así que solo se enviaron los primeros 8000 caracteres.",
  },
  modulesPage: {
    openingInEditor: "Abriendo Módulos en el editor de código…",
    title: "Gestor de módulos y paquetes de Python",
    subtitle:
      "Explora la biblioteca estándar oficial completa de Python y busca o instala todos los paquetes externos de PyPI y Pyodide en tu espacio de trabajo.",
    tabStdlib: (count: number) => `Biblioteca estándar integrada (${count})`,
    tabExternal: (count: number) => `Paquetes externos (${count})`,
    tabSearch: "Búsqueda e instalación en PyPI en vivo",
    filterStdlibPlaceholder: "Filtrar módulos integrados…",
    builtInReady: "Integrado (siempre listo)",
    docs: "Documentación",
    externalIntro: (pyodideCount: number, micropipCount: number) =>
      `${pyodideCount} paquetes compilados para Pyodide (se instalan rápido desde el CDN) + ${micropipCount} paquetes populares de PyPI en Python puro (se instalan con micropip).`,
    installedInWorkspace: (n: number) => `${n} instalados en este espacio de trabajo.`,
    externalOutro:
      "Cualquier otra cosa de PyPI se puede instalar por su nombre exacto en la pestaña de búsqueda en vivo de PyPI.",
    searchPackagesPlaceholder:
      "Buscar todos los paquetes: p. ej., numpy, flask, seaborn, opencv…",
    installByNamePlaceholder: "Instalar cualquier paquete por nombre: p. ej., tabulate",
    install: "Instalar",
    showingCount: (shown: number, total: number) =>
      `Mostrando ${shown} de ${total} paquetes.`,
    noMatch:
      "Sin coincidencias: prueba la pestaña de búsqueda en vivo de PyPI con el nombre exacto del paquete.",
    installed: "Instalado",
    remove: "Eliminar",
    installing: "Instalando…",
    installPackage: "Instalar paquete",
    searchHeading: "Buscar en el Índice oficial de paquetes de Python (PyPI)",
    searchPyPiPlaceholder: "p. ej., rich, requests, sympy, tabulate, httpx, textstat",
    searchPyPi: "Buscar en PyPI",
    installedInWorkspaceLabel: "Instalados en el espacio de trabajo",
    installPackageNamed: (name: string) => `Instalar ${name}`,
    licenseLabel: "Licencia:",
    authorLabel: "Autor:",
    projectHomepage: "Página principal del proyecto",
    logsHeading: "Registros de la terminal del motor de paquetes",
    logsEmpty:
      "Entorno de Python listo. Instala cualquier paquete para cargarlo en tu espacio de trabajo.",
    stageStartingRuntime: "Iniciando el entorno de Python…",
    logStartingRuntime:
      "Iniciando el entorno de Python: descarga única (~15 MB), espera un momento…",
    stageRuntimeReady: "Entorno de Python listo",
    logRuntimeReady: "Entorno de Python listo.",
    errorEnvStartWithDetail: (error: string) =>
      `No se pudo iniciar el entorno de Python: ${error}`,
    errorEnvStartNoLoad:
      "No se pudo iniciar el entorno de Python (el script de Pyodide no se cargó). Revisa tu conexión e inténtalo de nuevo: el botón Instalar lo reintentará.",
    stageDownloading: (pkg: string) => `Descargando '${pkg}'…`,
    logInstalling: (pkg: string) => `Instalando '${pkg}'…`,
    stageInstalled: (pkg: string) => `'${pkg}' instalado ✓`,
    logInstalled: (pkg: string, method: string, importName: string) =>
      `✓ '${pkg}' instalado con ${method} (import ${importName} funciona). Guardado en el almacenamiento del espacio de trabajo.`,
    logInstallFailed: (pkg: string, error: string) =>
      `✗ No se pudo instalar '${pkg}': ${error}`,
    logUninstalled: (pkg: string) =>
      `'${pkg}' desinstalado y eliminado del espacio de trabajo.`,
    errorPackageNotFound: "Paquete no encontrado en PyPI",
    errorQueryPyPi: "Error al consultar PyPI",
    defaultPyodideDesc:
      "Paquete compilado para Pyodide: se instala rápido desde el CDN y está listo para importar.",
    stageLoadingMicropip: "Cargando micropip…",
  },
  player: {
    errorOfflineCacheUnsupported:
      "La caché sin conexión no es compatible con este navegador.",
    errorDownloadFailed: (status: number) => `La descarga falló (${status})`,
    errorSaveOffline: "No se pudo guardar el vídeo sin conexión.",
    ariaLabel:
      "Reproductor de vídeo: Espacio reproduce o pausa, las flechas izquierda y derecha avanzan o retroceden 10 segundos",
    autoplayOnHint: "Reproducción automática activada: la siguiente lección se reproduce sola",
    autoplayOffHint: "Reproducción automática desactivada",
    autoplay: "Reproducción automática",
    playbackSpeed: "Velocidad de reproducción",
    speedNormal: "Normal",
    quality: "Calidad",
    qualityAuto: "Automática",
    original: "(original)",
    qualityNote:
      "MEGA ofrece una calidad por vídeo: el archivo de arriba es el único flujo disponible.",
    seekLabel: "Buscar",
    play: "Reproducir",
    pause: "Pausar",
    mute: "Silenciar",
    unmute: "Activar sonido",
    volumeLabel: "Volumen",
    hideCaptions: "Ocultar subtítulos en inglés",
    showCaptions: "Mostrar subtítulos en inglés",
    captionsLabel: "Subtítulos en inglés",
    downloadVideo: "Descargar vídeo",
    settingsLabel: "Ajustes: velocidad y calidad",
    exitFullscreen: "Salir de pantalla completa",
    fullscreen: "Pantalla completa",
    playingOffline: "Reproduciendo desde el almacenamiento sin conexión de la app",
    streamingOnline: "Transmitiendo en línea",
    offlineNotSaved: "Sin conexión (no guardado)",
    keyboardHint:
      "Espacio: reproducir / pausar · ← →: avanzar o retroceder 10 segundos · ↑ ↓: volumen · toca el altavoz para el volumen",
    removeOfflineCopy: "Eliminar la copia sin conexión",
    savingPct: (pct: number) => `Guardando ${pct}%`,
    saving: "Guardando…",
    sliderLabel: "Deslizador",
    youtubeFallbackNote: "Reproduciendo desde YouTube: el enlace de MEGA llegará pronto",
    todayProgress: "Progreso de hoy",
    progressSummary: (minutesWatched: number, goalMinutes: number) =>
      `${minutesWatched} min vistos de un objetivo de ${goalMinutes} min`,
    dailyTargetLabel: "Objetivo (min/día)",
    courseLessonsHeading: "Lecciones del curso",
  },
  settingsPage: {
    subtitle: "Tu progreso y el aspecto de la app.",
    todaySection: "Hoy",
    goalProgress: (minutes: number, goal: number) => `${minutes}/${goal}m`,
    streakRestored: "Racha restaurada. Te damos la bienvenida de nuevo.",
    streakBroken: "Racha rota",
    streakBrokenRestore: (
      brokenStreak: number,
      restoresUsed: number,
      max: number
    ) =>
      `Tu racha de ${brokenStreak} días se rompió. Restáurala antes de que se acabe el tiempo: has usado ${restoresUsed} de ${max} restauraciones este mes.`,
    countdownHrs: "h",
    countdownMin: "min",
    countdownSec: "s",
    restoreStreakButton: (brokenStreak: number) =>
      `Restaurar la racha de ${brokenStreak} días`,
    streakBrokenExpired: (brokenStreak: number) =>
      `Tu racha de ${brokenStreak} días se rompió y la ventana de restauración de 24 horas ya pasó. Mira una lección para empezar una nueva racha.`,
    noRestoresLeft: "No quedan restauraciones",
    noRestoresLeftBody: (max: number, brokenStreak: number) =>
      `Usaste las ${max} restauraciones de este mes. Tu racha de ${brokenStreak} días se rompió: mira una lección para empezar una nueva racha. Las restauraciones se renuevan el mes que viene.`,
    accountSecurity: "Seguridad de la cuenta",
  },
  tutorPage: {
    heading: "Pregúntale a la IA sobre esta lección",
    intro:
      "Dudas, explicaciones, ejemplos: en hindi o en inglés. Las respuestas salen del vídeo real de esta lección, con marcas de tiempo, y todo lo que el vídeo no cubre se marca como conocimiento general. Los chats no se guardan en ningún sitio.",
    unavailable:
      "La IA no está disponible ahora mismo: las claves de la API aún no están configuradas. El resto del curso funciona con normalidad.",
    askPlaceholder: (lessonTitle: string) => {
      const display =
        lessonTitle.length > 40
          ? `${lessonTitle.slice(0, 40)}…`
          : lessonTitle;
      return `Pregunta sobre "${display}"`;
    },
  },
  githubPage: {
    repoNameTooLong: "El nombre del repositorio debe tener 100 caracteres o menos.",
    repoNameInvalidChars:
      "Los nombres de repositorio no pueden contener espacios ni caracteres especiales: solo se permiten letras, números, - _ .",
    tokenSaved: "Token guardado solo en este navegador.",
    tokenRemoved: "Token de GitHub desconectado.",
    loadReposFailed: "No se pudieron cargar los repositorios",
    createRepoFailed: "No se pudo crear el repositorio",
    repoCreated: (fullName: string) => `✓ Repositorio creado: ${fullName}`,
    pushFailed: "No se pudo subir el archivo",
    pushed: (filePath: string, fullName: string) =>
      `✓ '${filePath}' subido a ${fullName}.`,
    title: "Integración con GitHub",
    intro:
      "Conecta tu cuenta de GitHub con un token de acceso personal (PAT) para crear repositorios y confirmar código directamente desde LP. El enlace del token abre GitHub con todos los permisos preseleccionados, así que el token tiene acceso completo a tu cuenta.",
    connectHeading: "Conectar token de acceso personal de GitHub",
    tokenExplainer:
      "Crea un token en github.com/settings/tokens con todos los permisos preseleccionados: el token tiene acceso completo a tu cuenta, incluido eliminar repositorios y gestionar organizaciones, así que mantenlo privado. Luego pégalo abajo. Tu token vive solo en este navegador (localStorage). Se envía al servidor de LP solo para llamar a GitHub en tu nombre, nunca se guarda en el servidor, y Desconectar lo elimina de este navegador.",
    connectToken: "Conectar token",
    connected: (tokenPrefix: string) => `Conectado a GitHub • ${tokenPrefix}...`,
    refresh: "Actualizar",
    disconnect: "Desconectar",
    createHeading: "Crear un nuevo repositorio de GitHub",
    repoNameLabel: "Nombre del repositorio *",
    descriptionLabel: "Descripción (opcional)",
    descriptionPlaceholder: "Soluciones de práctica y apuntes de LP",
    publicRepo: "Repositorio público",
    privateRepo: "Repositorio privado",
    initReadme: "Inicializar con README",
    createButton: "Crear repositorio en GitHub",
    commitHeading: "Subir / confirmar código desde el espacio de trabajo",
    targetRepoLabel: "Repositorio de destino *",
    visibilityPrivate: (fullName: string) => `${fullName} (privado)`,
    visibilityPublic: (fullName: string) => `${fullName} (público)`,
    visibilityPrivateShort: "privado",
    visibilityPublicShort: "público",
    filePathLabel: "Ruta del archivo en el repositorio *",
    filePathPlaceholder: "p. ej., main.py",
    commitMessageLabel: "Mensaje de confirmación *",
    commitMessagePlaceholder: "Mensaje de confirmación",
    fileContentLabel: "Contenido del archivo",
    commitButton: (repoName: string) => `Confirmar y subir a ${repoName}`,
    repoFallback: "Repositorio",
    yourRepos: (count: number) => `Tus repositorios (${count})`,
    fetchingRepos: "Cargando tus repositorios…",
    noRepos: "No se encontraron repositorios o el acceso está restringido.",
    noDescription: "Sin descripción",
    openOnGitHub: "Abrir en GitHub",
  },
};

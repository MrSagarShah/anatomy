import type { EducationLevel, PriorKnowledge, StudyGoal } from "./types";

/**
 * Copy for the learner-progress feature (onboarding + dashboard).
 *
 * This lives outside the strict per-locale `UiDictionary` on purpose: adding a
 * whole feature namespace to all 12 locale files would block this work on
 * translation. Instead every locale falls back to English here, and a locale is
 * upgraded by adding its own entry to `translations` below. No layout depends on
 * string length, so the English fallback renders correctly everywhere today.
 */
export type ProgressCopy = {
  nav: string;
  profileGuest: string;
  signInCta: string;
  onboarding: {
    eyebrow: string;
    title: string;
    subtitle: string;
    levelLabel: string;
    knowledgeLabel: string;
    goalLabel: string;
    focusLabel: string;
    focusHint: string;
    skip: string;
    save: string;
    levels: Record<EducationLevel, string>;
    knowledge: Record<PriorKnowledge, string>;
    goals: Record<StudyGoal, string>;
  };
  dashboard: {
    eyebrow: string;
    title: string;
    close: string;
    empty: string;
    loading?: string;
    unavailable: string;
    guest: string;
    backgroundTitle: string;
    editBackground: string;
    stats: {
      organs: string;
      lessons: string;
      accuracy: string;
      streak: string;
      streakUnit: string;
      mastery: string;
    };
    masteryTitle: string;
    masteryHint: string;
    activityTitle: string;
    noActivity: string;
    lessonDone: string;
    quizScore: string;
    viewed: string;
    notStarted: string;
    lessonsTitle: string;
    resume: string;
    recommended: string;
    recommendedHint: string;
    keepGoing: string;
  };
  activity: Record<string, string>;
};

const en: ProgressCopy = {
  nav: "Progress",
  profileGuest: "Guest",
  signInCta: "Sign in to save progress",
  onboarding: {
    eyebrow: "Welcome",
    title: "Tell us where you're starting from",
    subtitle:
      "A few quick answers let us tailor lessons and track how far you grow. You can skip and change these anytime.",
    levelLabel: "What best describes you?",
    knowledgeLabel: "How much anatomy do you already know?",
    goalLabel: "What are you here to do?",
    focusLabel: "Systems you want to focus on",
    focusHint: "Optional — pick any that interest you",
    skip: "Skip for now",
    save: "Save & start learning",
    levels: {
      school: "School student",
      university: "University / med student",
      professional: "Healthcare professional",
      educator: "Teacher / educator",
      curious: "Curious learner",
    },
    knowledge: {
      beginner: "Just starting",
      intermediate: "Some background",
      advanced: "Advanced",
    },
    goals: {
      exam: "Prepare for an exam",
      career: "Grow in my career",
      teaching: "Teach others",
      curiosity: "Satisfy curiosity",
      refresh: "Refresh what I knew",
    },
  },
  dashboard: {
    eyebrow: "Your learning",
    title: "Progress",
    close: "Close progress",
    empty: "Start a lesson or a quiz and your growth will show up here.",
    loading: "Loading your progress…",
    unavailable:
      "Progress tracking isn't connected in this environment yet. Explore freely — nothing is lost.",
    guest: "Sign in with ChatGPT to save your progress and pick up where you left off.",
    backgroundTitle: "Your background",
    editBackground: "Edit",
    stats: {
      organs: "Organs studied",
      lessons: "Lessons completed",
      accuracy: "Quiz accuracy",
      streak: "Day streak",
      streakUnit: "days",
      mastery: "Avg. mastery",
    },
    masteryTitle: "Mastery by organ",
    masteryHint: "Built from views, guided lessons, and quiz scores.",
    activityTitle: "Recent activity",
    noActivity: "No activity yet.",
    lessonDone: "Completed the guided lesson",
    quizScore: "Labelling quiz",
    viewed: "Explored",
    notStarted: "Not started",
    lessonsTitle: "Lessons",
    resume: "Continue",
    recommended: "Suggested next",
    recommendedHint: "Based on your focus and current mastery.",
    keepGoing: "Keep going",
  },
  activity: {
    organ_view: "Explored",
    lesson_start: "Started a lesson",
    lesson_step: "Worked through a lesson step",
    lesson_complete: "Completed a guided lesson",
    quiz_answer: "Answered a checkpoint",
    quiz_complete: "Finished a checkpoint",
    label_answer: "Labelled a structure",
    label_quiz_complete: "Finished a labelling quiz",
  },
};

const es: ProgressCopy = {
  nav: "Progreso",
  profileGuest: "Invitado",
  signInCta: "Inicia sesión para guardar tu progreso",
  onboarding: {
    eyebrow: "Bienvenida",
    title: "Cuéntanos desde dónde partes",
    subtitle:
      "Unas pocas respuestas nos permiten adaptar las lecciones y seguir cómo avanzas. Puedes saltarlas y cambiarlas cuando quieras.",
    levelLabel: "¿Qué te describe mejor?",
    knowledgeLabel: "¿Cuánta anatomía conoces ya?",
    goalLabel: "¿Para qué estás aquí?",
    focusLabel: "Sistemas en los que quieres centrarte",
    focusHint: "Opcional — elige los que te interesen",
    skip: "Saltar por ahora",
    save: "Guardar y empezar",
    levels: {
      school: "Estudiante de secundaria",
      university: "Universidad / medicina",
      professional: "Profesional sanitario",
      educator: "Docente / educador",
      curious: "Aprendiz curioso",
    },
    knowledge: {
      beginner: "Empiezo ahora",
      intermediate: "Algo de base",
      advanced: "Avanzado",
    },
    goals: {
      exam: "Prepararme para un examen",
      career: "Crecer profesionalmente",
      teaching: "Enseñar a otros",
      curiosity: "Satisfacer la curiosidad",
      refresh: "Refrescar lo que ya sabía",
    },
  },
  dashboard: {
    eyebrow: "Tu aprendizaje",
    title: "Progreso",
    close: "Cerrar progreso",
    empty: "Empieza una lección o un cuestionario y tu avance aparecerá aquí.",
    unavailable:
      "El seguimiento del progreso aún no está conectado en este entorno. Explora con libertad: no se pierde nada.",
    guest: "Inicia sesión con ChatGPT para guardar tu progreso y retomar donde lo dejaste.",
    backgroundTitle: "Tu perfil",
    editBackground: "Editar",
    stats: {
      organs: "Órganos estudiados",
      lessons: "Lecciones completadas",
      accuracy: "Precisión en cuestionarios",
      streak: "Racha diaria",
      streakUnit: "días",
      mastery: "Dominio medio",
    },
    masteryTitle: "Dominio por órgano",
    masteryHint: "Se construye con visitas, lecciones guiadas y puntuaciones.",
    activityTitle: "Actividad reciente",
    noActivity: "Aún no hay actividad.",
    lessonDone: "Completaste la lección guiada",
    quizScore: "Cuestionario de etiquetas",
    viewed: "Explorado",
    notStarted: "Sin empezar",
    lessonsTitle: "Lecciones",
    resume: "Continuar",
    recommended: "Siguiente sugerida",
    recommendedHint: "Según tu enfoque y tu dominio actual.",
    keepGoing: "Sigue adelante",
  },
  activity: {
    organ_view: "Explorado",
    lesson_start: "Empezó una lección",
    lesson_step: "Avanzó un paso de la lección",
    lesson_complete: "Completó una lección guiada",
    quiz_answer: "Respondió un punto de control",
    quiz_complete: "Terminó un punto de control",
    label_answer: "Etiquetó una estructura",
    label_quiz_complete: "Terminó un cuestionario de etiquetas",
  },
};

const hi: ProgressCopy = {
  nav: "प्रगति",
  profileGuest: "अतिथि",
  signInCta: "प्रगति सहेजने के लिए साइन इन करें",
  onboarding: {
    eyebrow: "स्वागत है",
    title: "बताएँ, आप कहाँ से शुरू कर रहे हैं",
    subtitle:
      "कुछ संक्षिप्त उत्तरों से हम पाठ आपके अनुकूल बना सकते हैं और आपकी प्रगति देख सकते हैं। इन्हें अभी छोड़ सकते हैं और बाद में बदल सकते हैं।",
    levelLabel: "आपको सबसे बेहतर क्या वर्णन करता है?",
    knowledgeLabel: "शरीर रचना आप कितनी जानते हैं?",
    goalLabel: "आप यहाँ क्या करना चाहते हैं?",
    focusLabel: "वे तंत्र जिन पर आप ध्यान देना चाहते हैं",
    focusHint: "वैकल्पिक — जो रुचिकर हों, उन्हें चुनें",
    skip: "अभी छोड़ें",
    save: "सहेजें और सीखना शुरू करें",
    levels: {
      school: "विद्यालय का विद्यार्थी",
      university: "विश्वविद्यालय / चिकित्सा विद्यार्थी",
      professional: "स्वास्थ्य पेशेवर",
      educator: "शिक्षक / अध्यापक",
      curious: "जिज्ञासु शिक्षार्थी",
    },
    knowledge: {
      beginner: "अभी शुरुआत",
      intermediate: "कुछ आधार है",
      advanced: "उन्नत",
    },
    goals: {
      exam: "परीक्षा की तैयारी",
      career: "करियर में आगे बढ़ना",
      teaching: "दूसरों को पढ़ाना",
      curiosity: "जिज्ञासा पूरी करना",
      refresh: "पहले सीखी बातें ताज़ा करना",
    },
  },
  dashboard: {
    eyebrow: "आपकी सीख",
    title: "प्रगति",
    close: "प्रगति बंद करें",
    empty: "कोई पाठ या प्रश्नोत्तरी शुरू करें — आपकी प्रगति यहाँ दिखेगी।",
    unavailable:
      "इस वातावरण में प्रगति ट्रैकिंग अभी जुड़ी नहीं है। बेझिझक अन्वेषण करें — कुछ खोता नहीं।",
    guest: "ChatGPT से साइन इन करें ताकि प्रगति सहेजी जाए और जहाँ छोड़ा था वहीं से जारी रख सकें।",
    backgroundTitle: "आपकी पृष्ठभूमि",
    editBackground: "संपादित करें",
    stats: {
      organs: "अध्ययन किए अंग",
      lessons: "पूर्ण किए पाठ",
      accuracy: "प्रश्नोत्तरी सटीकता",
      streak: "दैनिक श्रृंखला",
      streakUnit: "दिन",
      mastery: "औसत दक्षता",
    },
    masteryTitle: "अंग के अनुसार दक्षता",
    masteryHint: "अवलोकन, निर्देशित पाठ और प्रश्नोत्तरी अंकों से बनती है।",
    activityTitle: "हाल की गतिविधि",
    noActivity: "अभी कोई गतिविधि नहीं।",
    lessonDone: "निर्देशित पाठ पूरा किया",
    quizScore: "लेबलिंग प्रश्नोत्तरी",
    viewed: "अन्वेषण किया",
    notStarted: "शुरू नहीं हुआ",
    lessonsTitle: "पाठ",
    resume: "जारी रखें",
    recommended: "सुझाया गया अगला",
    recommendedHint: "आपके फोकस और वर्तमान दक्षता के आधार पर।",
    keepGoing: "लगे रहें",
  },
  activity: {
    organ_view: "अन्वेषण किया",
    lesson_start: "पाठ शुरू किया",
    lesson_step: "पाठ का एक चरण पूरा किया",
    lesson_complete: "निर्देशित पाठ पूरा किया",
    quiz_answer: "जाँच प्रश्न का उत्तर दिया",
    quiz_complete: "जाँच प्रश्न पूरे किए",
    label_answer: "एक संरचना को लेबल किया",
    label_quiz_complete: "लेबलिंग प्रश्नोत्तरी पूरी की",
  },
};

const zh: ProgressCopy = {
  nav: "进度",
  profileGuest: "访客",
  signInCta: "登录以保存进度",
  onboarding: {
    eyebrow: "欢迎",
    title: "先告诉我们你的起点",
    subtitle: "几个简短问题，就能为你匹配课程并记录成长。可以先跳过，之后随时再改。",
    levelLabel: "哪一项最符合你？",
    knowledgeLabel: "你已经掌握多少解剖学？",
    goalLabel: "你来这里想做什么？",
    focusLabel: "想重点学习的系统",
    focusHint: "可选 — 勾选你感兴趣的即可",
    skip: "暂时跳过",
    save: "保存并开始学习",
    levels: {
      school: "中小学生",
      university: "大学 / 医科学生",
      professional: "医护专业人员",
      educator: "教师 / 教育工作者",
      curious: "好奇的学习者",
    },
    knowledge: {
      beginner: "刚入门",
      intermediate: "有一些基础",
      advanced: "进阶",
    },
    goals: {
      exam: "备考",
      career: "提升职业能力",
      teaching: "教授他人",
      curiosity: "满足好奇心",
      refresh: "温故知新",
    },
  },
  dashboard: {
    eyebrow: "你的学习",
    title: "进度",
    close: "关闭进度",
    empty: "开始一节课或一次测验，成长就会出现在这里。",
    unavailable: "此环境尚未接入进度跟踪。请自由探索 — 内容不会丢失。",
    guest: "用 ChatGPT 登录，即可保存进度并从上次停下的地方继续。",
    backgroundTitle: "你的背景",
    editBackground: "编辑",
    stats: {
      organs: "已学器官",
      lessons: "已完成课程",
      accuracy: "测验正确率",
      streak: "连续天数",
      streakUnit: "天",
      mastery: "平均掌握度",
    },
    masteryTitle: "各器官掌握度",
    masteryHint: "由浏览、引导课程和测验成绩综合而成。",
    activityTitle: "最近动态",
    noActivity: "还没有动态。",
    lessonDone: "已完成引导课程",
    quizScore: "标注测验",
    viewed: "已探索",
    notStarted: "未开始",
    lessonsTitle: "课程",
    resume: "继续",
    recommended: "建议下一步",
    recommendedHint: "依据你的关注点和当前掌握度。",
    keepGoing: "继续加油",
  },
  activity: {
    organ_view: "已探索",
    lesson_start: "开始了一节课",
    lesson_step: "完成了一个课程步骤",
    lesson_complete: "完成了一节引导课程",
    quiz_answer: "回答了一个检查点",
    quiz_complete: "完成了一个检查点",
    label_answer: "标注了一个结构",
    label_quiz_complete: "完成了标注测验",
  },
};

const ar: ProgressCopy = {
  nav: "التقدّم",
  profileGuest: "زائر",
  signInCta: "سجّل الدخول لحفظ تقدّمك",
  onboarding: {
    eyebrow: "مرحبًا",
    title: "أخبرنا من أين تبدأ",
    subtitle:
      "بضع إجابات سريعة تتيح لنا مواءمة الدروس ومتابعة نموّك. يمكنك التخطّي وتغييرها في أي وقت.",
    levelLabel: "ما الذي يصفك على نحو أفضل؟",
    knowledgeLabel: "كم تعرف من علم التشريح أصلًا؟",
    goalLabel: "ماذا تريد أن تنجز هنا؟",
    focusLabel: "الأجهزة التي تودّ التركيز عليها",
    focusHint: "اختياري — اختر ما يثير اهتمامك",
    skip: "تخطَّ الآن",
    save: "احفظ وابدأ التعلّم",
    levels: {
      school: "طالب مدرسي",
      university: "طالب جامعي / طبّي",
      professional: "ممارس صحي",
      educator: "معلّم / تربوي",
      curious: "متعلّم فضولي",
    },
    knowledge: {
      beginner: "في البداية",
      intermediate: "لديّ أساس",
      advanced: "متقدّم",
    },
    goals: {
      exam: "الاستعداد لامتحان",
      career: "التقدّم في مساري المهني",
      teaching: "تعليم الآخرين",
      curiosity: "إرضاء الفضول",
      refresh: "تجديد ما سبق أن عرفته",
    },
  },
  dashboard: {
    eyebrow: "تعلّمك",
    title: "التقدّم",
    close: "إغلاق التقدّم",
    empty: "ابدأ درسًا أو اختبارًا وسيظهر نموّك هنا.",
    unavailable:
      "تتبّع التقدّم غير متّصل بعد في هذه البيئة. استكشف بحرّية — لا يُفقد شيء.",
    guest: "سجّل الدخول عبر ChatGPT لحفظ تقدّمك ومتابعة ما توقّفت عنده.",
    backgroundTitle: "خلفيّتك",
    editBackground: "تعديل",
    stats: {
      organs: "أعضاء دُرست",
      lessons: "دروس أُكملت",
      accuracy: "دقّة الاختبارات",
      streak: "سلسلة الأيام",
      streakUnit: "أيام",
      mastery: "متوسط الإتقان",
    },
    masteryTitle: "الإتقان حسب العضو",
    masteryHint: "يُبنى من المعاينات والدروس الموجَّهة ودرجات الاختبار.",
    activityTitle: "النشاط الأخير",
    noActivity: "لا نشاط بعد.",
    lessonDone: "أتممت الدرس الموجَّه",
    quizScore: "اختبار التسمية",
    viewed: "استُكشف",
    notStarted: "لم يبدأ",
    lessonsTitle: "الدروس",
    resume: "متابعة",
    recommended: "المقترَح التالي",
    recommendedHint: "بناءً على تركيزك ومستوى إتقانك الحالي.",
    keepGoing: "واصل التقدّم",
  },
  activity: {
    organ_view: "استُكشف",
    lesson_start: "بدأ درسًا",
    lesson_step: "أكمل خطوة من الدرس",
    lesson_complete: "أتمّ درسًا موجَّهًا",
    quiz_answer: "أجاب عن نقطة تحقّق",
    quiz_complete: "أنهى نقطة تحقّق",
    label_answer: "سمّى بنية تشريحية",
    label_quiz_complete: "أنهى اختبار تسمية",
  },
};

const pt: ProgressCopy = {
  nav: "Progresso",
  profileGuest: "Convidado",
  signInCta: "Entre para salvar seu progresso",
  onboarding: {
    eyebrow: "Boas-vindas",
    title: "Conte de onde você está partindo",
    subtitle:
      "Algumas respostas rápidas nos ajudam a adaptar as lições e acompanhar seu avanço. Você pode pular e mudar isso a qualquer momento.",
    levelLabel: "O que melhor descreve você?",
    knowledgeLabel: "Quanto de anatomia você já conhece?",
    goalLabel: "O que você veio fazer aqui?",
    focusLabel: "Sistemas em que quer se concentrar",
    focusHint: "Opcional — escolha os que lhe interessam",
    skip: "Pular por agora",
    save: "Salvar e começar a aprender",
    levels: {
      school: "Estudante escolar",
      university: "Universidade / medicina",
      professional: "Profissional de saúde",
      educator: "Professor / educador",
      curious: "Aprendiz curioso",
    },
    knowledge: {
      beginner: "Estou começando",
      intermediate: "Tenho alguma base",
      advanced: "Avançado",
    },
    goals: {
      exam: "Preparar-me para uma prova",
      career: "Crescer na carreira",
      teaching: "Ensinar outras pessoas",
      curiosity: "Satisfazer a curiosidade",
      refresh: "Relembrar o que eu já sabia",
    },
  },
  dashboard: {
    eyebrow: "Seu aprendizado",
    title: "Progresso",
    close: "Fechar progresso",
    empty: "Comece uma lição ou um quiz e seu avanço aparece aqui.",
    unavailable:
      "O acompanhamento de progresso ainda não está ligado neste ambiente. Explore à vontade — nada se perde.",
    guest: "Entre com o ChatGPT para salvar seu progresso e retomar de onde parou.",
    backgroundTitle: "Seu perfil",
    editBackground: "Editar",
    stats: {
      organs: "Órgãos estudados",
      lessons: "Lições concluídas",
      accuracy: "Precisão nos quizzes",
      streak: "Sequência diária",
      streakUnit: "dias",
      mastery: "Domínio médio",
    },
    masteryTitle: "Domínio por órgão",
    masteryHint: "Montado a partir de visualizações, lições guiadas e notas.",
    activityTitle: "Atividade recente",
    noActivity: "Ainda não há atividade.",
    lessonDone: "Concluiu a lição guiada",
    quizScore: "Quiz de identificação",
    viewed: "Explorado",
    notStarted: "Não iniciado",
    lessonsTitle: "Lições",
    resume: "Continuar",
    recommended: "Próxima sugerida",
    recommendedHint: "Com base no seu foco e no domínio atual.",
    keepGoing: "Continue assim",
  },
  activity: {
    organ_view: "Explorado",
    lesson_start: "Começou uma lição",
    lesson_step: "Avançou um passo da lição",
    lesson_complete: "Concluiu uma lição guiada",
    quiz_answer: "Respondeu a um ponto de verificação",
    quiz_complete: "Terminou um ponto de verificação",
    label_answer: "Identificou uma estrutura",
    label_quiz_complete: "Terminou um quiz de identificação",
  },
};

const fr: ProgressCopy = {
  nav: "Progression",
  profileGuest: "Invité",
  signInCta: "Connectez-vous pour enregistrer votre progression",
  onboarding: {
    eyebrow: "Bienvenue",
    title: "Dites-nous d'où vous partez",
    subtitle:
      "Quelques réponses suffisent pour adapter les leçons et suivre vos progrès. Vous pouvez passer et modifier ces choix à tout moment.",
    levelLabel: "Qu'est-ce qui vous décrit le mieux ?",
    knowledgeLabel: "Quelle anatomie connaissez-vous déjà ?",
    goalLabel: "Que venez-vous faire ici ?",
    focusLabel: "Systèmes sur lesquels vous voulez vous concentrer",
    focusHint: "Facultatif — choisissez ce qui vous intéresse",
    skip: "Passer pour l'instant",
    save: "Enregistrer et commencer",
    levels: {
      school: "Collégien / lycéen",
      university: "Université / médecine",
      professional: "Professionnel de santé",
      educator: "Enseignant / formateur",
      curious: "Apprenant curieux",
    },
    knowledge: {
      beginner: "Je débute",
      intermediate: "J'ai des bases",
      advanced: "Avancé",
    },
    goals: {
      exam: "Préparer un examen",
      career: "Progresser dans ma carrière",
      teaching: "Enseigner à d'autres",
      curiosity: "Satisfaire ma curiosité",
      refresh: "Réactiver ce que je savais",
    },
  },
  dashboard: {
    eyebrow: "Votre apprentissage",
    title: "Progression",
    close: "Fermer la progression",
    empty: "Commencez une leçon ou un quiz : votre progression apparaîtra ici.",
    unavailable:
      "Le suivi de progression n'est pas encore branché dans cet environnement. Explorez librement — rien n'est perdu.",
    guest: "Connectez-vous avec ChatGPT pour enregistrer votre progression et reprendre là où vous vous êtes arrêté.",
    backgroundTitle: "Votre profil",
    editBackground: "Modifier",
    stats: {
      organs: "Organes étudiés",
      lessons: "Leçons terminées",
      accuracy: "Précision aux quiz",
      streak: "Série quotidienne",
      streakUnit: "jours",
      mastery: "Maîtrise moyenne",
    },
    masteryTitle: "Maîtrise par organe",
    masteryHint: "Calculée à partir des visites, des leçons guidées et des scores.",
    activityTitle: "Activité récente",
    noActivity: "Aucune activité pour l'instant.",
    lessonDone: "Leçon guidée terminée",
    quizScore: "Quiz d'identification",
    viewed: "Exploré",
    notStarted: "Pas commencé",
    lessonsTitle: "Leçons",
    resume: "Continuer",
    recommended: "Suite suggérée",
    recommendedHint: "Selon votre focus et votre maîtrise actuelle.",
    keepGoing: "Continuez",
  },
  activity: {
    organ_view: "Exploré",
    lesson_start: "A commencé une leçon",
    lesson_step: "A avancé une étape de leçon",
    lesson_complete: "A terminé une leçon guidée",
    quiz_answer: "A répondu à un point de contrôle",
    quiz_complete: "A fini un point de contrôle",
    label_answer: "A identifié une structure",
    label_quiz_complete: "A fini un quiz d'identification",
  },
};

const de: ProgressCopy = {
  nav: "Fortschritt",
  profileGuest: "Gast",
  signInCta: "Melde dich an, um deinen Fortschritt zu speichern",
  onboarding: {
    eyebrow: "Willkommen",
    title: "Sag uns, wo du startest",
    subtitle:
      "Ein paar kurze Angaben helfen uns, Lektionen anzupassen und dein Wachstum festzuhalten. Du kannst sie überspringen und jederzeit ändern.",
    levelLabel: "Was beschreibt dich am besten?",
    knowledgeLabel: "Wie viel Anatomie bringst du schon mit?",
    goalLabel: "Wozu bist du hier?",
    focusLabel: "Systeme, auf die du dich konzentrieren willst",
    focusHint: "Optional — wähle, was dich interessiert",
    skip: "Vorerst überspringen",
    save: "Speichern und loslernen",
    levels: {
      school: "Schüler/in",
      university: "Universität / Medizinstudium",
      professional: "Gesundheitsfachkraft",
      educator: "Lehrkraft / Pädagoge",
      curious: "Neugierige/r Lernende/r",
    },
    knowledge: {
      beginner: "Ganz am Anfang",
      intermediate: "Einige Vorkenntnisse",
      advanced: "Fortgeschritten",
    },
    goals: {
      exam: "Auf eine Prüfung vorbereiten",
      career: "Beruflich weiterkommen",
      teaching: "Andere unterrichten",
      curiosity: "Neugier stillen",
      refresh: "Bekanntes auffrischen",
    },
  },
  dashboard: {
    eyebrow: "Dein Lernen",
    title: "Fortschritt",
    close: "Fortschritt schließen",
    empty: "Starte eine Lektion oder ein Quiz — dein Wachstum erscheint hier.",
    unavailable:
      "Die Fortschrittserfassung ist in dieser Umgebung noch nicht verbunden. Entdecke frei — nichts geht verloren.",
    guest: "Melde dich mit ChatGPT an, um deinen Fortschritt zu speichern und dort weiterzumachen, wo du aufgehört hast.",
    backgroundTitle: "Dein Hintergrund",
    editBackground: "Bearbeiten",
    stats: {
      organs: "Studierte Organe",
      lessons: "Abgeschlossene Lektionen",
      accuracy: "Quizgenauigkeit",
      streak: "Tagesreihe",
      streakUnit: "Tage",
      mastery: "Mittlere Beherrschung",
    },
    masteryTitle: "Beherrschung nach Organ",
    masteryHint: "Aus Ansichten, geführten Lektionen und Quizpunkten.",
    activityTitle: "Letzte Aktivität",
    noActivity: "Noch keine Aktivität.",
    lessonDone: "Geführte Lektion abgeschlossen",
    quizScore: "Beschriftungsquiz",
    viewed: "Erkundet",
    notStarted: "Noch nicht begonnen",
    lessonsTitle: "Lektionen",
    resume: "Weiter",
    recommended: "Als Nächstes vorgeschlagen",
    recommendedHint: "Anhand deines Schwerpunkts und deiner aktuellen Beherrschung.",
    keepGoing: "Mach weiter",
  },
  activity: {
    organ_view: "Erkundet",
    lesson_start: "Hat eine Lektion begonnen",
    lesson_step: "Hat einen Lektionsschritt bearbeitet",
    lesson_complete: "Hat eine geführte Lektion abgeschlossen",
    quiz_answer: "Hat einen Checkpoint beantwortet",
    quiz_complete: "Hat einen Checkpoint beendet",
    label_answer: "Hat eine Struktur beschriftet",
    label_quiz_complete: "Hat ein Beschriftungsquiz beendet",
  },
};

const ja: ProgressCopy = {
  nav: "進捗",
  profileGuest: "ゲスト",
  signInCta: "ログインして進捗を保存",
  onboarding: {
    eyebrow: "ようこそ",
    title: "いまの出発点を教えてください",
    subtitle:
      "短い質問に答えると、レッスンを合わせ、伸びを記録できます。今は飛ばしても、あとからいつでも変えられます。",
    levelLabel: "いちばん近いのはどれですか？",
    knowledgeLabel: "解剖学はどのくらい知っていますか？",
    goalLabel: "ここで何をしたいですか？",
    focusLabel: "重点的に学びたい系統",
    focusHint: "任意 — 興味のあるものを選んでください",
    skip: "今はスキップ",
    save: "保存して学び始める",
    levels: {
      school: "小中高生",
      university: "大学／医学生",
      professional: "医療従事者",
      educator: "教員／教育者",
      curious: "好奇心のある学習者",
    },
    knowledge: {
      beginner: "これから始める",
      intermediate: "基礎はある",
      advanced: "上級",
    },
    goals: {
      exam: "試験の準備",
      career: "キャリアを伸ばす",
      teaching: "人に教える",
      curiosity: "知りたい気持ちを満たす",
      refresh: "以前の知識を見直す",
    },
  },
  dashboard: {
    eyebrow: "あなたの学び",
    title: "進捗",
    close: "進捗を閉じる",
    empty: "レッスンかクイズを始めると、成長がここに現れます。",
    unavailable:
      "この環境では進捗の記録がまだつながっていません。自由に探索してください — 失われるものはありません。",
    guest: "ChatGPT でログインすると、進捗を保存し、中断したところから続けられます。",
    backgroundTitle: "あなたの背景",
    editBackground: "編集",
    stats: {
      organs: "学んだ器官",
      lessons: "完了したレッスン",
      accuracy: "クイズ正答率",
      streak: "連続日数",
      streakUnit: "日",
      mastery: "平均習熟度",
    },
    masteryTitle: "器官ごとの習熟度",
    masteryHint: "閲覧、ガイド付きレッスン、クイズ得点から算出します。",
    activityTitle: "最近の活動",
    noActivity: "まだ活動がありません。",
    lessonDone: "ガイド付きレッスンを完了",
    quizScore: "ラベルクイズ",
    viewed: "探索済み",
    notStarted: "未開始",
    lessonsTitle: "レッスン",
    resume: "続ける",
    recommended: "次のおすすめ",
    recommendedHint: "関心と現在の習熟度に基づきます。",
    keepGoing: "この調子で",
  },
  activity: {
    organ_view: "探索済み",
    lesson_start: "レッスンを開始",
    lesson_step: "レッスンの一歩を進めた",
    lesson_complete: "ガイド付きレッスンを完了",
    quiz_answer: "確認問題に回答",
    quiz_complete: "確認問題を終えた",
    label_answer: "構造にラベルを付けた",
    label_quiz_complete: "ラベルクイズを終えた",
  },
};

const ru: ProgressCopy = {
  nav: "Прогресс",
  profileGuest: "Гость",
  signInCta: "Войдите, чтобы сохранить прогресс",
  onboarding: {
    eyebrow: "Добро пожаловать",
    title: "Расскажите, с чего вы начинаете",
    subtitle:
      "Несколько коротких ответов помогут подобрать уроки и отследить рост. Можно пропустить и изменить позже.",
    levelLabel: "Что лучше всего вас описывает?",
    knowledgeLabel: "Сколько анатомии вы уже знаете?",
    goalLabel: "Зачем вы здесь?",
    focusLabel: "Системы, на которых хотите сосредоточиться",
    focusHint: "Необязательно — выберите то, что интересно",
    skip: "Пока пропустить",
    save: "Сохранить и начать учиться",
    levels: {
      school: "Школьник",
      university: "Студент вуза / медвуза",
      professional: "Медицинский специалист",
      educator: "Преподаватель",
      curious: "Любознательный ученик",
    },
    knowledge: {
      beginner: "Только начинаю",
      intermediate: "Есть база",
      advanced: "Продвинутый уровень",
    },
    goals: {
      exam: "Подготовиться к экзамену",
      career: "Расти в профессии",
      teaching: "Учить других",
      curiosity: "Утолить любопытство",
      refresh: "Освежить то, что знал",
    },
  },
  dashboard: {
    eyebrow: "Ваше обучение",
    title: "Прогресс",
    close: "Закрыть прогресс",
    empty: "Начните урок или тест — рост появится здесь.",
    unavailable:
      "Отслеживание прогресса в этой среде ещё не подключено. Изучайте свободно — ничего не потеряется.",
    guest: "Войдите через ChatGPT, чтобы сохранить прогресс и продолжить с того места, где остановились.",
    backgroundTitle: "Ваш профиль",
    editBackground: "Изменить",
    stats: {
      organs: "Изученные органы",
      lessons: "Завершённые уроки",
      accuracy: "Точность тестов",
      streak: "Серия дней",
      streakUnit: "дн.",
      mastery: "Среднее владение",
    },
    masteryTitle: "Владение по органам",
    masteryHint: "Считается по просмотрам, направляющим урокам и баллам тестов.",
    activityTitle: "Недавняя активность",
    noActivity: "Пока нет активности.",
    lessonDone: "Направляющий урок завершён",
    quizScore: "Тест на подписи",
    viewed: "Изучено",
    notStarted: "Не начато",
    lessonsTitle: "Уроки",
    resume: "Продолжить",
    recommended: "Что дальше",
    recommendedHint: "С учётом вашего фокуса и текущего владения.",
    keepGoing: "Так держать",
  },
  activity: {
    organ_view: "Изучено",
    lesson_start: "Начал урок",
    lesson_step: "Прошёл шаг урока",
    lesson_complete: "Завершил направляющий урок",
    quiz_answer: "Ответил на контрольный вопрос",
    quiz_complete: "Закончил контрольную точку",
    label_answer: "Подписал структуру",
    label_quiz_complete: "Закончил тест на подписи",
  },
};

const id: ProgressCopy = {
  nav: "Progres",
  profileGuest: "Tamu",
  signInCta: "Masuk untuk menyimpan progres",
  onboarding: {
    eyebrow: "Selamat datang",
    title: "Ceritakan dari mana kamu memulai",
    subtitle:
      "Beberapa jawaban singkat membantu kami menyesuaikan pelajaran dan mengikuti perkembanganmu. Bisa dilewati dan diubah kapan saja.",
    levelLabel: "Mana yang paling menggambarkanmu?",
    knowledgeLabel: "Seberapa banyak anatomi yang sudah kamu ketahui?",
    goalLabel: "Kamu di sini untuk apa?",
    focusLabel: "Sistem yang ingin kamu fokuskan",
    focusHint: "Opsional — pilih yang menarik bagimu",
    skip: "Lewati dulu",
    save: "Simpan dan mulai belajar",
    levels: {
      school: "Siswa sekolah",
      university: "Mahasiswa / kedokteran",
      professional: "Tenaga kesehatan",
      educator: "Guru / pendidik",
      curious: "Pembelajar yang ingin tahu",
    },
    knowledge: {
      beginner: "Baru mulai",
      intermediate: "Sudah ada dasar",
      advanced: "Lanjutan",
    },
    goals: {
      exam: "Persiapan ujian",
      career: "Tumbuh di karier",
      teaching: "Mengajari orang lain",
      curiosity: "Memuaskan rasa ingin tahu",
      refresh: "Menyegarkan yang sudah pernah dipelajari",
    },
  },
  dashboard: {
    eyebrow: "Belajarmu",
    title: "Progres",
    close: "Tutup progres",
    empty: "Mulai pelajaran atau kuis, dan kemajuanmu akan muncul di sini.",
    unavailable:
      "Pelacakan progres belum terhubung di lingkungan ini. Jelajahi bebas — tidak ada yang hilang.",
    guest: "Masuk dengan ChatGPT untuk menyimpan progres dan lanjut dari tempat terakhir.",
    backgroundTitle: "Latar belakangmu",
    editBackground: "Edit",
    stats: {
      organs: "Organ dipelajari",
      lessons: "Pelajaran selesai",
      accuracy: "Akurasi kuis",
      streak: "Rangkaian hari",
      streakUnit: "hari",
      mastery: "Rata-rata penguasaan",
    },
    masteryTitle: "Penguasaan per organ",
    masteryHint: "Dihitung dari kunjungan, pelajaran terpandu, dan skor kuis.",
    activityTitle: "Aktivitas terbaru",
    noActivity: "Belum ada aktivitas.",
    lessonDone: "Menyelesaikan pelajaran terpandu",
    quizScore: "Kuis penamaan",
    viewed: "Dijelajahi",
    notStarted: "Belum mulai",
    lessonsTitle: "Pelajaran",
    resume: "Lanjutkan",
    recommended: "Saran berikutnya",
    recommendedHint: "Berdasarkan fokus dan penguasaanmu saat ini.",
    keepGoing: "Terus lanjutkan",
  },
  activity: {
    organ_view: "Dijelajahi",
    lesson_start: "Memulai pelajaran",
    lesson_step: "Menyelesaikan satu langkah pelajaran",
    lesson_complete: "Menyelesaikan pelajaran terpandu",
    quiz_answer: "Menjawab titik pemeriksaan",
    quiz_complete: "Menyelesaikan titik pemeriksaan",
    label_answer: "Menamai sebuah struktur",
    label_quiz_complete: "Menyelesaikan kuis penamaan",
  },
};

const ko: ProgressCopy = {
  nav: "진도",
  profileGuest: "손님",
  signInCta: "로그인하여 진도를 저장하세요",
  onboarding: {
    eyebrow: "환영합니다",
    title: "어디에서 시작하는지 알려 주세요",
    subtitle:
      "짧은 몇 가지 답으로 수업을 맞추고 성장을 기록할 수 있습니다. 지금은 건너뛰고 나중에 언제든 바꿀 수 있습니다.",
    levelLabel: "나를 가장 잘 나타내는 것은?",
    knowledgeLabel: "해부학을 얼마나 알고 있나요?",
    goalLabel: "여기에서 무엇을 하고 싶나요?",
    focusLabel: "집중하고 싶은 계통",
    focusHint: "선택 사항 — 관심 있는 항목만 고르세요",
    skip: "지금은 건너뛰기",
    save: "저장하고 학습 시작",
    levels: {
      school: "초·중·고등학생",
      university: "대학 / 의대생",
      professional: "의료 종사자",
      educator: "교사 / 교육자",
      curious: "호기심 많은 학습자",
    },
    knowledge: {
      beginner: "이제 시작",
      intermediate: "기초는 있음",
      advanced: "심화",
    },
    goals: {
      exam: "시험 준비",
      career: "커리어를 키우기",
      teaching: "다른 사람을 가르치기",
      curiosity: "궁금증 풀기",
      refresh: "예전에 알던 내용 다시 보기",
    },
  },
  dashboard: {
    eyebrow: "나의 학습",
    title: "진도",
    close: "진도 닫기",
    empty: "수업이나 퀴즈를 시작하면 성장이 여기에 나타납니다.",
    unavailable:
      "이 환경에는 아직 진도 추적이 연결되어 있지 않습니다. 자유롭게 탐색하세요 — 사라지는 것은 없습니다.",
    guest: "ChatGPT로 로그인하면 진도를 저장하고 멈춘 곳부터 이어갈 수 있습니다.",
    backgroundTitle: "나의 배경",
    editBackground: "편집",
    stats: {
      organs: "학습한 기관",
      lessons: "완료한 수업",
      accuracy: "퀴즈 정답률",
      streak: "연속 일수",
      streakUnit: "일",
      mastery: "평균 숙련도",
    },
    masteryTitle: "기관별 숙련도",
    masteryHint: "열람, 안내 수업, 퀴즈 점수로 쌓입니다.",
    activityTitle: "최근 활동",
    noActivity: "아직 활동이 없습니다.",
    lessonDone: "안내 수업을 완료함",
    quizScore: "이름 맞히기 퀴즈",
    viewed: "탐색함",
    notStarted: "시작 전",
    lessonsTitle: "수업",
    resume: "계속",
    recommended: "다음에 추천",
    recommendedHint: "관심 분야와 현재 숙련도를 바탕으로 합니다.",
    keepGoing: "이어서 하세요",
  },
  activity: {
    organ_view: "탐색함",
    lesson_start: "수업을 시작함",
    lesson_step: "수업 단계를 진행함",
    lesson_complete: "안내 수업을 완료함",
    quiz_answer: "확인 문제에 답함",
    quiz_complete: "확인 문제를 마침",
    label_answer: "구조를 표시함",
    label_quiz_complete: "이름 맞히기 퀴즈를 마침",
  },
};

/** Locale → copy. Add entries here to translate; anything missing uses English. */
const translations: Record<string, ProgressCopy> = {
  en,
  es,
  hi,
  zh,
  ar,
  pt,
  fr,
  de,
  ja,
  ru,
  id,
  ko,
};

export function progressCopy(locale: string): ProgressCopy {
  return translations[locale] ?? en;
}

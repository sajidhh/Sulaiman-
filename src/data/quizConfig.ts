export type Language = 'kk' | 'en';

export interface AnswerOptionConfig {
  id: string;
  isCustom?: boolean;
  label: {
    kk: string;
    en: string;
  };
  reaction?: {
    kk: string;
    en: string;
  };
}

export interface QuestionConfig {
  id: string;
  number: number;
  title: {
    kk: string;
    en: string;
  };
  options: AnswerOptionConfig[];
  forcedReveal?: {
    kk: string;
    en: string;
  };
}

export const SIGNATURE_TEXT = '— Your Sohan / Sulaimaen 🤭💗';

export const QUESTIONS_CONFIG: QuestionConfig[] = [
  {
    id: 'q1_missing_amount',
    number: 1,
    title: {
      kk: 'Мен сені қаншалықты сағындым деп ойлайсың?',
      en: 'How much do you think I missed you?',
    },
    forcedReveal: {
      kk: 'Шынын айтсам... ӨТЕ ҚАТТЫ 😭💗',
      en: 'OKAY, THE TRUTH IS... WAY TOO MUCH 😭💗',
    },
    options: [
      {
        id: 'opt_not_much',
        label: {
          kk: 'Онша емес шығар 😌',
          en: 'Not that much 😌',
        },
        reaction: {
          kk: 'Қателестің! 🤭',
          en: 'Wrong guess! 🤭',
        },
      },
      {
        id: 'opt_little',
        label: {
          kk: 'Аздап 🤭',
          en: 'A little 🤭',
        },
        reaction: {
          kk: 'Жоқ, одан да көп! 🤭',
          en: 'Nope, way more than that! 🤭',
        },
      },
      {
        id: 'opt_way_too_much',
        label: {
          kk: 'Өте қатты шығар 👀',
          en: 'Way too much, maybe 👀',
        },
        reaction: {
          kk: 'Дәл таптың! 👀',
          en: 'Spot on! 👀',
        },
      },
    ],
  },
  {
    id: 'q2_why_missed',
    number: 2,
    title: {
      kk: 'Сеніңше, мен неге сені сағындым?',
      en: 'Why do you think I missed you?',
    },
    options: [
      {
        id: 'opt_amazing',
        label: {
          kk: 'Өйткені мен кереметпін ғой 😌',
          en: "Because I'm amazing, obviously 😌",
        },
        reaction: {
          kk: 'СЕНІМДІЛІК: 100% 😂',
          en: 'CONFIDENCE: 100% 😂',
        },
      },
      {
        id: 'opt_talking_fun',
        label: {
          kk: 'Өйткені сенімен сөйлесу қызық 😂',
          en: 'Because talking to you is fun 😂',
        },
        reaction: {
          kk: 'Жарайды, рас айтасың 😂💗',
          en: 'Okay, fair point 😂💗',
        },
      },
      {
        id: 'opt_figure_out',
        label: {
          kk: 'Оны өзің тап 🤭',
          en: 'Figure it out yourself 🤭',
        },
        reaction: {
          kk: 'Аа, маған жұмбақ қалдырып кеттің бе? 🤭',
          en: 'Ah, leaving me with a mystery now? 🤭',
        },
      },
      {
        id: 'opt_custom',
        isCustom: true,
        label: {
          kk: 'Өз жауабымды жазамын ✍️',
          en: "I'll write my own answer ✍️",
        },
      },
    ],
  },
  {
    id: 'q3_reels',
    number: 3,
    title: {
      kk: 'Саған мен жіберетін рилстер ұнай ма? 👀💗',
      en: 'Do you like the reels I send you? 👀💗',
    },
    options: [
      {
        id: 'opt_yesss',
        label: {
          kk: 'Иәә 😂',
          en: 'Yesss 😂',
        },
        reaction: {
          kk: 'Тамаша! Рилстер легі тоқтамайды демек 😂',
          en: 'Awesome! The reel flood continues then 😂',
        },
      },
      {
        id: 'opt_of_course',
        label: {
          kk: 'Әрине 🤭',
          en: 'Of course 🤭',
        },
        reaction: {
          kk: 'Ең адал көрерменім 🤭💗',
          en: 'My most loyal viewer 🤭💗',
        },
      },
      {
        id: 'opt_some',
        label: {
          kk: 'Кейбіреуі 😂',
          en: 'Some of them 😂',
        },
        reaction: {
          kk: 'Жарайды, қалғандарына көбірек күлуге тырысамын 😂',
          en: "Fair enough, I'll aim for better ones 😂",
        },
      },
      {
        id: 'opt_depends',
        label: {
          kk: 'Рилске байланысты 😌',
          en: 'Depends on the reel 😌',
        },
        reaction: {
          kk: 'Түсінікті... талғамды жақсарту керек екен 😂',
          en: "Fair enough... I'll have to improve my reel selection 😂",
        },
      },
      {
        id: 'opt_custom',
        isCustom: true,
        label: {
          kk: 'Өз жауабымды жазамын ✍️',
          en: "I'll write my own answer ✍️",
        },
      },
    ],
  },
  {
    id: 'q4_opinion',
    number: 4,
    title: {
      kk: 'Мен туралы не ойлайсың? 👀',
      en: 'What do you think about me? 👀',
    },
    options: [
      {
        id: 'opt_nice',
        label: {
          kk: 'Жақсы жігіт 😊',
          en: 'Nice boy 😊',
        },
        reaction: {
          kk: 'Рахмет, жүрегім жылып қалды 😊',
          en: 'Thank you, that warmed my heart 😊',
        },
      },
      {
        id: 'opt_weird',
        label: {
          kk: 'Біртүрлі жігіт 😂',
          en: 'Weird boy 😂',
        },
        reaction: {
          kk: 'НЕЕ 😭😂 Мұны комплимент деп қабылдаймын!',
          en: "WHAT 😭😂 I'll take that as a compliment!",
        },
      },
      {
        id: 'opt_cool',
        label: {
          kk: 'Крутой жігіт 😎',
          en: 'Cool boy 😎',
        },
        reaction: {
          kk: 'Көзәйнегімді киіп алдым уже 😎',
          en: 'Sunglasses deployed 😎',
        },
      },
      {
        id: 'opt_funny',
        label: {
          kk: 'Көңілді жігіт 🤣',
          en: 'Funny boy 🤣',
        },
        reaction: {
          kk: 'Күлдіре алсам, бақыттымын 🤣',
          en: 'As long as I make you laugh 🤣',
        },
      },
      {
        id: 'opt_figuring',
        label: {
          kk: 'Сені әлі танып жүрмін 🤔',
          en: 'Still figuring you out 🤔',
        },
        reaction: {
          kk: 'Жұмбақ күйі: ӘЛІ ШЕШІЛМЕДІ 🤔😂',
          en: 'Mystery status: UNRESOLVED 🤔😂',
        },
      },
      {
        id: 'opt_custom',
        isCustom: true,
        label: {
          kk: 'Өз жауабымды жазамын ✍️',
          en: "I'll write my own answer ✍️",
        },
      },
    ],
  },
  {
    id: 'q5_dramatic',
    number: 5,
    title: {
      kk: 'Шынын айтшы, кім көбірек драматизация жасайды? 😂',
      en: 'Be honest, who is more dramatic? 😂',
    },
    options: [
      {
        id: 'opt_sohan',
        label: {
          kk: 'Әрине, сен, Сохан 😌',
          en: 'Definitely you, Sohan 😌',
        },
        reaction: {
          kk: 'Ойбай, бірден мені кінәлай салды ма? 😭😂',
          en: 'Wow, blaming me already? 😭😂',
        },
      },
      {
        id: 'opt_saltanat',
        label: {
          kk: 'Негізі, мен шығармын 😂',
          en: "Actually, I think it's me 😂",
        },
        reaction: {
          kk: 'Шынайы мойындау сәті 😂',
          en: 'A rare moment of honesty 😂',
        },
      },
      {
        id: 'opt_both',
        label: {
          kk: 'Екеуміз де кінәсізбіз 🤝',
          en: "We're both innocent 🤝",
        },
        reaction: {
          kk: 'Іс жабылды. Ешкім кінәлі емес 🤝',
          en: 'Case closed. Nobody is guilty 🤝',
        },
      },
      {
        id: 'opt_custom',
        isCustom: true,
        label: {
          kk: 'Өз жауабымды жазамын ✍️',
          en: "I'll write my own answer ✍️",
        },
      },
    ],
  },
];

export const UI_TEXT = {
  welcome: {
    badge: {
      kk: 'САҒАН АРНАЛҒАН КІШКЕНТАЙ ТОСЫНСЫЙ',
      en: 'A TINY SURPRISE, JUST FOR YOU',
    },
    greeting: {
      kk: 'Сәлем, Салтанат! 💗',
      en: 'Hi, Saltanat! 💗',
    },
    subtext: {
      kk: 'Саған бір кішкентай сұрағым бар...',
      en: 'I have one little question for you...',
    },
    button: {
      kk: 'Қане, көрейік 👀',
      en: "Let's see 👀",
    },
  },
  freeResponse: {
    heading: {
      kk: 'Енді сенің кезегің! 🤭',
      en: "Now it's your turn! 🤭",
    },
    subtext: {
      kk: 'Енді сен де бір нәрсе жаз! Мені аздап әзілдеп алуыңа, кездейсоқ бір нәрсе айтуыңа немесе ойыңа келген нәрсені жазуыңа болады 😂',
      en: "Now you can write something too! Roast me a little, tell me something random, or just write whatever comes to mind 😂",
    },
    placeholder: {
      kk: 'Сенің кезегің... тыңдап тұрмын 👀',
      en: "Your turn... I'm listening 👀",
    },
    saveButton: {
      kk: 'Жауабымды сақтау 💗',
      en: 'Save & finish 💗',
    },
    skipButton: {
      kk: 'Өткізіп жіберу',
      en: 'Skip this',
    },
  },
  notice: {
    kk: 'Кішкентай ескерту: жауаптарың Соханға көрінуі үшін сақталады. Бұл жай ғана көңілді тосынсый — ешқандай қысым жоқ 💗',
    en: "Tiny note: your answers are saved so Sohan can read them later. It's just a playful surprise — no pressure 💗",
  },
  ending: {
    heading: {
      kk: 'Жарайды, мойындаймын... сені біраз сағынып қалыппын 🤭💗',
      en: 'Okay, I admit it... I really did miss you quite a bit 🤭💗',
    },
    subtext: {
      kk: 'Бұл кішкентай тосынсый көңіліңе күлкі сыйласа, мақсат орындалды 😂',
      en: 'If this little surprise made you smile, mission accomplished 😂',
    },
    replayButton: {
      kk: 'Қайтадан көру ↻',
      en: 'Replay ↻',
    },
  },
  common: {
    next: {
      kk: 'Келесі →',
      en: 'Next →',
    },
    back: {
      kk: '← Артқа',
      en: '← Back',
    },
    continue: {
      kk: 'Жалғастыру ✨',
      en: 'Continue ✨',
    },
    customPlaceholder: {
      kk: 'Өз ойыңды осында жаз...',
      en: 'Type your thoughts here...',
    },
    saving: {
      kk: 'Сақталуда...',
      en: 'Saving...',
    },
    saved: {
      kk: 'Сақталды!',
      en: 'Saved!',
    },
    errorSave: {
      kk: 'Сақтау сәтсіз аяқталды. Қайта көріңіз.',
      en: 'Failed to save. Please try again.',
    },
    retry: {
      kk: 'Қайталау',
      en: 'Retry',
    },
    questionOf: {
      kk: (cur: number, total: number) => `${cur} / ${total} сұрақ`,
      en: (cur: number, total: number) => `Question ${cur} of ${total}`,
    },
    adminBadge: {
      kk: 'Администратор панелі',
      en: 'Admin Panel',
    },
  },
};

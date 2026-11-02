/* Sevakunj study · buildless, same-origin data, browser-local progress. */
(() => {
  'use strict';

  const STORAGE_KEY = 'sevakunj-study:v1';
  const SVG_NS = 'http://www.w3.org/2000/svg';
  const GROUPS = ['adi', 'madhya', 'antya', 'mantra'];
  const COLLECTIONS = {
    sevakunj: { file: 'corpus.json', maxUnits: 76, firstId: 'V-01', title: { ru: 'Шлоки Севакунджа', en: 'Sevakunj Ślokas' } },
    kanthahara: { file: 'kanthahara.json', maxUnits: 688, firstId: 'K-1.1', title: { ru: 'Гаудия Кантхахара', en: 'Gaudiya Kanthahara' } },
  };
  const MAX_STORED_UNITS = 2048;
  const RATINGS = ['again', 'hard', 'good', 'easy'];
  const $ = (id) => document.getElementById(id);
  const text = (value) => typeof value === 'string' ? value : '';
  const isRecord = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
  const bounded = (value, fallback, min, max) => Number.isFinite(Number(value)) ? Math.max(min, Math.min(max, Number(value))) : fallback;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = window.matchMedia('(max-width: 960px)');

  const messages = {
    ru: {
      skip: 'Перейти к чтению', brand: 'Севакундж', brandCaption: 'СОБРАНИЕ ШЛОК',
      openLibrary: 'Открыть собрание шлок', closeLibrary: 'Закрыть собрание', language: 'Язык интерфейса',
      darkTheme: 'Включить тёмную тему', lightTheme: 'Включить светлую тему', offline: 'Нет сети',
      books: 'Книги', takeWithYou: 'ВОЗЬМИТЕ С СОБОЙ', pdfDescription: 'Для чтения и печати',
      docxDescription: 'Для заметок и правок', epubDescription: 'Для электронной книги', fb2Description: 'Для любимой читалки',
      downloadNote: 'Рабочая учебная редакция со ссылками на источники.', collection: 'Собрание',
      chooseCollection: 'Выбрать собрание', sevakunjBook: 'Севакундж', kanthaharaBook: 'Гаудия Кантхахара',
      sevakunjScope: '76 текстов', kanthaharaScope: 'Представленное издание · 13 глав', returnSevakunj: 'Вернуться к Севакунджу',
      chapter: 'Жемчужина / глава', allChapters: 'Все 13 глав', aboutEdition: 'Об издании',
      editionTranslation: 'Перевод издания', readingNote: 'Примечание к чтению',
      previewEdition: 'Предварительная редакция', entryCount: '{count} ТЕКСТОВ',
      readOnlyNote: 'Эта запись доступна для чтения. Запоминание и оценка для неё отключены.',
      searchLabel: 'Поиск по собранию', searchPlaceholder: 'Слово, источник, номер…', sectionFilter: 'Раздел собрания',
      allSections: 'Все', adiShort: 'Ади', madhyaShort: 'Мадхья', antyaShort: 'Антья', mantraShort: 'Мантры',
      adi: 'Ади-лила', madhya: 'Мадхья-лила', antya: 'Антья-лила', mantra: 'Мантры и молитвы',
      progressFilter: 'Фильтр по прогрессу', allVerses: 'Все шлоки', favourites: 'Избранное', due: 'К повторению',
      learned: 'Изученные', notStarted: 'Ещё не начатые', verseList: 'Оглавление собрания',
      localProgress: 'Ваш прогресс хранится\nна этом устройстве.', storageUnavailable: 'Прогресс доступен только\nдо закрытия этой вкладки.',
      storageWarning: 'Браузер не разрешает сохранять прогресс. В этой вкладке можно продолжать практику.',
      help: 'О практике и клавишах', dailyPractice: 'ЕЖЕДНЕВНАЯ ПРАКТИКА', heroTitle: 'Читать. Помнить.\nСозерцать.',
      heroDescription: 'Шлоки Севакунджа для вдумчивого чтения и бережной работы с памятью.',
      editGoal: 'Изменить ежедневную цель', today: 'Сегодня', dailyGoal: 'маленькая ежедневная цель',
      goalComplete: 'цель дня достигнута', goalProgress: 'Сегодня: {count} из {goal} шлок',
      studyMode: 'Режим практики', reading: 'Чтение', memorising: 'Запоминание',
      previous: 'Предыдущая шлока (←)', next: 'Следующая шлока (→)', loading: 'Открываем собрание…',
      loadErrorTitle: 'Не удалось открыть собрание', loadErrorText: 'Проверьте соединение и попробуйте ещё раз. Сохранённый прогресс останется на этом устройстве.',
      retry: 'Попробовать снова', addFavourite: 'Добавить в избранное (F)', removeFavourite: 'Убрать из избранного (F)',
      script: 'Написание шлоки', cyrillic: 'Кириллица', original: 'Оригинал', verse: 'Шлока',
      hideWords: 'Скрыть слова', allVisible: 'Все видны', fromMemory: 'По памяти',
      mask0: 'Все слова видны', mask1: 'Часть слов скрыта', mask2: 'Остались опорные слова', mask3: 'Полностью по памяти',
      revealHint: 'Вспоминайте строку за строкой. Значок глаза откроет подсказку.', revealAll: 'Показать всё', hideAll: 'Скрыть подсказки',
      revealLine: 'Показать строку {line}', hideLine: 'Скрыть строку {line}', hiddenWord: 'Скрытое слово',
      plateVariant: 'Чтение на табличке', meaning: 'Краткий смысл', editorial: 'редакционное изложение',
      meaningUnavailable: 'Краткий смысл пока не добавлен. Обратитесь к указанному первоисточнику.',
      fullTranslationNote: 'Опубликованный перевод можно прочитать по ссылке на источник ниже.',
      publishedTranslation: 'Опубликованный перевод', variantTranslations: 'Литургические варианты перевода',
      commentary: 'Контекст и комментарий', commentaryUnavailable: 'Обратитесь к тексту и комментарию в указанном первоисточнике.',
      sourceCommentary: 'Комментарий в источнике', readSource: 'Читать источник', sourceLanguage: 'Источник на {language}',
      russianSource: 'русском', englishSource: 'английском', variantRussian: 'Русский · отдельный вариант', variantEnglish: 'English · отдельный вариант',
      variantOther: 'Отдельный вариант', markLearned: 'Отметить изученной', isLearned: 'Изучена',
      markedLearned: 'Шлока отмечена изученной.', unmarkedLearned: 'Отметка об изучении снята.',
      howRemembered: 'Как удалось вспомнить?', ratingHint: 'Ваша оценка подскажет, когда повторить шлоку.',
      again: 'Снова', hard: 'Трудно', good: 'Помню', easy: 'Легко', inTenMinutes: 'через 10 мин',
      afterDays: 'через {days} дн.', reviewDue: 'Время повторить', nextReview: 'Повтор: {date}', newVerse: 'Новая шлока',
      ratingSaved: 'Сохранено. Следующее повторение: {date}.', previousVerse: 'Предыдущая', nextVerse: 'Следующая шлока', toNavigate: 'для перехода',
      editionNote: 'Рабочая учебная редакция. Краткий смысл — редакционное изложение, не полный перевод. Опубликованные переводы приводятся там, где доступны, с указанием авторства; оригинальные тексты и комментарии — по ссылкам на источники.',
      workingEdition: 'Учебная редакция', practiceGuide: 'О практике', close: 'Закрыть', aLittleEveryDay: 'ПОНЕМНОГУ КАЖДЫЙ ДЕНЬ',
      yourDailyGoal: 'Ваша ежедневная цель', goalExplanation: 'Цель считает разные шлоки, которым вы дали оценку в режиме запоминания сегодня. Выберите удобный ритм.',
      versesPerDay: 'Шлок в день', cancel: 'Отмена', saveGoal: 'Сохранить цель', goalSaved: 'Ежедневная цель сохранена.',
      aQuietPractice: 'СПОКОЙНАЯ ПРАКТИКА', helpReadTitle: 'Прочитайте внимательно.',
      helpReadText: 'Выберите удобное написание, прочитайте текст и перевод или пояснение. Сверьтесь с указанным источником.',
      helpRecallTitle: 'Оставьте место памяти.', helpRecallText: 'Включите запоминание и постепенно скрывайте слова. При необходимости открывайте отдельные строки.',
      helpRateTitle: 'Вернитесь вовремя.', helpRateText: 'Оцените, как удалось вспомнить. Фильтр «К повторению» покажет шлоки, для которых подошло время.',
      keyboardShortcuts: 'Клавиши', shortcutNavigate: 'Предыдущая / следующая', shortcutSearch: 'Поиск по собранию',
      shortcutMode: 'Чтение / запоминание', shortcutFavourite: 'В избранное', shortcutReveal: 'Открыть / скрыть строки', shortcutRate: 'Оценка запоминания',
      privacyNote: 'Без аккаунта. Прогресс сохраняется только в этом браузере и не синхронизируется между устройствами. Очистка данных браузера удалит его.',
      noResults: 'По этим условиям шлок не найдено.', noFavourites: 'Добавляйте шлоки в избранное звёздочкой на странице.',
      noDue: 'Сейчас нет шлок к повторению. Начните практику с любой шлоки.', noLearned: 'Здесь появятся шлоки, отмеченные изученными.',
      noNew: 'Все шлоки уже знакомы. Вернитесь к чтению или повторению.', resetFilters: 'Показать всё собрание',
      collectionCount: '{count} ШЛОК', foundCount: 'Найдено: {count}', navigation: 'Шлока {number} из {total}. {reference}',
      favouriteAdded: 'Добавлено в избранное.', favouriteRemoved: 'Убрано из избранного.',
    },
    en: {
      skip: 'Skip to reading', brand: 'Sevakunj', brandCaption: 'A COLLECTION OF ŚLOKAS',
      openLibrary: 'Open the verse collection', closeLibrary: 'Close the collection', language: 'Interface language',
      darkTheme: 'Switch to dark theme', lightTheme: 'Switch to light theme', offline: 'Offline',
      books: 'Books', takeWithYou: 'TAKE THE VERSES WITH YOU', pdfDescription: 'For reading and printing',
      docxDescription: 'For notes and editing', epubDescription: 'For your e-reader', fb2Description: 'For your reading app',
      downloadNote: 'A working study edition with links to the sources.', collection: 'Collection',
      chooseCollection: 'Choose a collection', sevakunjBook: 'Sevakunj', kanthaharaBook: 'Gaudiya Kanthahara',
      sevakunjScope: '76 texts', kanthaharaScope: 'Supplied edition · 13 chapters', returnSevakunj: 'Return to Sevakunj',
      chapter: 'Jewel / chapter', allChapters: 'All 13 chapters', aboutEdition: 'About this edition',
      editionTranslation: 'Translation in this edition', readingNote: 'Reading note',
      previewEdition: 'Preview edition', entryCount: '{count} TEXTS',
      readOnlyNote: 'This entry is available for reading. Memorisation and self-rating are disabled for it.',
      searchLabel: 'Search the collection', searchPlaceholder: 'Word, source, number…', sectionFilter: 'Collection section',
      allSections: 'All', adiShort: 'Ādi', madhyaShort: 'Madhya', antyaShort: 'Antya', mantraShort: 'Mantras',
      adi: 'Ādi-līlā', madhya: 'Madhya-līlā', antya: 'Antya-līlā', mantra: 'Mantras & prayers',
      progressFilter: 'Filter by progress', allVerses: 'All verses', favourites: 'Favourites', due: 'Due for review',
      learned: 'Learned', notStarted: 'Not yet started', verseList: 'Verse collection contents',
      localProgress: 'Your progress stays\non this device.', storageUnavailable: 'Progress lasts only\nwhile this tab is open.',
      storageWarning: 'This browser cannot save progress. You can continue practising in this tab.',
      help: 'Practice guide and keyboard shortcuts', dailyPractice: 'A DAILY PRACTICE', heroTitle: 'Read. Remember.\nReflect.',
      heroDescription: 'The verses of Sevakunj, for thoughtful reading and a gentle practice of recollection.',
      editGoal: 'Change your daily goal', today: 'Today', dailyGoal: 'a little practice, every day',
      goalComplete: 'your daily goal is complete', goalProgress: 'Today: {count} of {goal} verses',
      studyMode: 'Practice mode', reading: 'Reading', memorising: 'Memorising',
      previous: 'Previous verse (←)', next: 'Next verse (→)', loading: 'Opening the collection…',
      loadErrorTitle: 'The collection could not be opened', loadErrorText: 'Check your connection and try again. Your saved progress will stay on this device.',
      retry: 'Try again', addFavourite: 'Add to favourites (F)', removeFavourite: 'Remove from favourites (F)',
      script: 'Verse script', cyrillic: 'Cyrillic', original: 'Original', verse: 'Verse',
      hideWords: 'Hide words', allVisible: 'All visible', fromMemory: 'From memory',
      mask0: 'All words visible', mask1: 'Some words hidden', mask2: 'Only a few cues remain', mask3: 'Entirely from memory',
      revealHint: 'Recall one line at a time. Use the eye for a gentle hint.', revealAll: 'Reveal all', hideAll: 'Hide the hints',
      revealLine: 'Reveal line {line}', hideLine: 'Hide line {line}', hiddenWord: 'Hidden word',
      plateVariant: 'Reading on the plate', meaning: 'Essential meaning', editorial: 'editorial summary',
      meaningUnavailable: 'An editorial summary has not yet been added. Please consult the linked source.',
      fullTranslationNote: 'Read the published translation by following the source link below.',
      publishedTranslation: 'Published translation', variantTranslations: 'Liturgical translation variants',
      commentary: 'Context & commentary', commentaryUnavailable: 'Please consult the text and commentary in the linked source.',
      sourceCommentary: 'Commentary at the source', readSource: 'Read the source', sourceLanguage: 'Source in {language}',
      russianSource: 'Russian', englishSource: 'English', variantRussian: 'Russian · separate variant', variantEnglish: 'English · separate variant',
      variantOther: 'Separate variant', markLearned: 'Mark as learned', isLearned: 'Learned',
      markedLearned: 'Verse marked as learned.', unmarkedLearned: 'Learned mark removed.',
      howRemembered: 'How did your recall feel?', ratingHint: 'Your rating helps choose the next time to revisit this verse.',
      again: 'Again', hard: 'Hard', good: 'Good', easy: 'Easy', inTenMinutes: 'in 10 min',
      afterDays: 'in {days} days', reviewDue: 'Time to review', nextReview: 'Review: {date}', newVerse: 'New verse',
      ratingSaved: 'Saved. Next review: {date}.', previousVerse: 'Previous', nextVerse: 'Next verse', toNavigate: 'to move between verses',
      editionNote: 'A working study edition. Essential meanings are editorial summaries, not complete translations. Published translations are included where available, with attribution; follow the source links for original texts and commentaries.',
      workingEdition: 'Study edition', practiceGuide: 'About the practice', close: 'Close', aLittleEveryDay: 'A LITTLE, EVERY DAY',
      yourDailyGoal: 'Your daily goal', goalExplanation: 'Your goal counts distinct verses you rate in memorisation mode today. Choose a rhythm that feels right.',
      versesPerDay: 'Verses per day', cancel: 'Cancel', saveGoal: 'Save goal', goalSaved: 'Your daily goal has been saved.',
      aQuietPractice: 'A QUIET PRACTICE', helpReadTitle: 'Read with attention.',
      helpReadText: 'Choose a comfortable script, read the text and its translation or explanation, then consult the cited source.',
      helpRecallTitle: 'Make room for memory.', helpRecallText: 'Switch to memorising and gradually hide the words. Reveal individual lines whenever you need a hint.',
      helpRateTitle: 'Return in good time.', helpRateText: 'Rate your recall. The “Due for review” filter will show the verses ready to revisit.',
      keyboardShortcuts: 'Keyboard shortcuts', shortcutNavigate: 'Previous / next verse', shortcutSearch: 'Search the collection',
      shortcutMode: 'Reading / memorising', shortcutFavourite: 'Toggle favourite', shortcutReveal: 'Reveal / hide the lines', shortcutRate: 'Rate your recall',
      privacyNote: 'No account needed. Progress stays in this browser and does not sync between devices. Clearing browser data removes it.',
      noResults: 'No verses match these filters.', noFavourites: 'Use the star on a verse page to keep it in your favourites.',
      noDue: 'Nothing is due for review right now. Begin with any verse.', noLearned: 'Verses marked as learned will appear here.',
      noNew: 'You have begun every verse. Return to reading or review.', resetFilters: 'Show the whole collection',
      collectionCount: '{count} VERSES', foundCount: 'Found: {count}', navigation: 'Verse {number} of {total}. {reference}',
      favouriteAdded: 'Added to favourites.', favouriteRemoved: 'Removed from favourites.',
    },
  };

  let storageAvailable = true;
  let settings = readSettings();
  let activeCollection = hashTarget()?.collection || settings.activeCollection;
  let corpus = null;
  let units = [];
  let unitById = new Map();
  let searchIndex = new Map();
  let activeId = '';
  let filtered = [];
  let query = '';
  let group = 'all';
  let statusFilter = 'all';
  let maskLevel = 2;
  let revealedLines = new Set();
  let ratingFeedback = null;
  let drawerOpen = false;
  let drawerReturnFocus = null;
  let toastTimer = null;
  let searchTimer = null;
  let loading = false;
  let loadSequence = 0;
  let loadController = null;
  let serviceWorkerRequested = false;

  function t(key, values = {}) {
    const template = messages[settings.language][key] || messages.en[key] || key;
    return template.replace(/\{(\w+)\}/g, (_, name) => String(values[name] ?? ''));
  }

  function localised(value) {
    return isRecord(value) ? text(value[settings.language]) : text(value);
  }

  function element(tag, className, content) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (content !== undefined) node.textContent = content;
    return node;
  }

  function icon(name, className = '') {
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('class', `icon ${className}`.trim());
    svg.setAttribute('aria-hidden', 'true');
    const use = document.createElementNS(SVG_NS, 'use');
    use.setAttribute('href', `#i-${name}`);
    svg.append(use);
    return svg;
  }

  function collectionForId(id) {
    if (typeof id !== 'string') return null;
    if (/^V-(?:0[1-9]|[1-6]\d|7[0-6])[ab]?$/.test(id)) return 'sevakunj';
    if (/^K-(?:[1-9]|1[0-3])\.[1-9]\d{0,3}$/.test(id)) return 'kanthahara';
    return null;
  }

  function validDay(value) {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const date = new Date(`${value}T00:00:00Z`);
    return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
  }

  function readSettings() {
    const defaults = {
      version: 1, language: 'ru',
      theme: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
      script: 'cyrillic', mode: 'read', goal: 5, lastUnit: '', favourites: [],
      activeCollection: 'sevakunj',
      positions: { sevakunj: '', kanthahara: '' },
      goals: { sevakunj: 5, kanthahara: 5 },
      reviews: Object.create(null), days: Object.create(null),
    };
    let saved;
    try {
      saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    } catch {
      // Reading remains available when browser storage is blocked or damaged.
      storageAvailable = false;
      return defaults;
    }
    if (!isRecord(saved)) return defaults;
    const language = saved.language === 'en' ? 'en' : 'ru';
    const reviews = Object.create(null);
    if (isRecord(saved.reviews)) {
      let count = 0;
      for (const [id, review] of Object.entries(saved.reviews)) {
        if (!collectionForId(id) || !isRecord(review)) continue;
        reviews[id] = {
          interval: bounded(review.interval, 0, 0, 3650),
          ease: bounded(review.ease, 2.5, 1.3, 3.5),
          repetitions: Math.floor(bounded(review.repetitions, 0, 0, 10000)),
          learned: review.learned === true,
          due: validDate(review.due),
          lastReviewed: validDate(review.lastReviewed),
          lastRating: [...RATINGS, 'manual'].includes(review.lastRating) ? review.lastRating : '',
        };
        count += 1;
        if (count >= MAX_STORED_UNITS) break;
      }
    }
    const days = Object.create(null);
    if (isRecord(saved.days)) {
      for (const day of Object.keys(saved.days).filter(validDay).sort().slice(-60)) {
        if (Array.isArray(saved.days[day])) days[day] = [...new Set(saved.days[day].filter((id) => collectionForId(id)))].slice(0, MAX_STORED_UNITS);
      }
    }
    const legacyGoal = Math.round(bounded(saved.goal, 5, 1, 76));
    const legacyPosition = collectionForId(saved.lastUnit) === 'sevakunj' ? saved.lastUnit : '';
    const positions = { sevakunj: legacyPosition, kanthahara: '' };
    const goals = { sevakunj: legacyGoal, kanthahara: 5 };
    for (const id of Object.keys(COLLECTIONS)) {
      if (isRecord(saved.positions) && collectionForId(saved.positions[id]) === id) positions[id] = saved.positions[id];
      if (isRecord(saved.goals)) goals[id] = Math.round(bounded(saved.goals[id], goals[id], 1, COLLECTIONS[id].maxUnits));
    }
    return {
      ...defaults, language,
      theme: ['light', 'dark'].includes(saved.theme) ? saved.theme : defaults.theme,
      script: ['cyrillic', 'iast', 'original'].includes(saved.script) ? saved.script : (language === 'ru' ? 'cyrillic' : 'iast'),
      mode: saved.mode === 'recall' ? 'recall' : 'read',
      // Legacy fields continue to describe Sevakunj; its existing progress is never renumbered.
      goal: goals.sevakunj, lastUnit: positions.sevakunj,
      activeCollection: Object.hasOwn(COLLECTIONS, saved.activeCollection) ? saved.activeCollection : 'sevakunj',
      positions, goals,
      favourites: Array.isArray(saved.favourites) ? [...new Set(saved.favourites.filter((id) => collectionForId(id)))].slice(0, MAX_STORED_UNITS) : [],
      reviews, days,
    };
  }

  function validDate(value) {
    if (typeof value !== 'string' || !validDay(value.slice(0, 10))) return null;
    const iso = /^\d{4}-\d{2}-\d{2}(?:T(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d(?:\.\d{1,3})?)?(?:Z|[+-](?:0\d|1[0-4]):[0-5]\d))?$/;
    return iso.test(value) && Number.isFinite(Date.parse(value)) ? value : null;
  }

  function collectionGoal() { return settings.goals[activeCollection]; }

  function persist() {
    const previousAvailability = storageAvailable;
    settings.activeCollection = activeCollection;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      storageAvailable = true;
    } catch {
      storageAvailable = false;
      if (previousAvailability) showToast(t('storageWarning'));
    }
    renderStorageNote();
  }

  function renderStorageNote() {
    $('storage-note').textContent = t(storageAvailable ? 'localProgress' : 'storageUnavailable');
  }

  function applyLocale() {
    document.documentElement.lang = settings.language;
    document.documentElement.dataset.theme = settings.theme;
    document.documentElement.dataset.collection = activeCollection;
    document.querySelector('meta[name="theme-color"]').content = settings.theme === 'dark' ? '#242620' : '#f7f3eb';
    document.querySelectorAll('[data-i18n]').forEach((node) => { node.textContent = t(node.dataset.i18n); });
    document.querySelectorAll('[data-i18n-placeholder]').forEach((node) => { node.placeholder = t(node.dataset.i18nPlaceholder); });
    document.querySelectorAll('[data-i18n-label]').forEach((node) => {
      const label = t(node.dataset.i18nLabel);
      node.setAttribute('aria-label', label);
      if (node.tagName === 'BUTTON') node.title = label;
    });
    document.querySelectorAll('[data-language]').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.language === settings.language)));
    $('theme-toggle').setAttribute('aria-label', t(settings.theme === 'dark' ? 'lightTheme' : 'darkTheme'));
    $('theme-toggle').title = $('theme-toggle').getAttribute('aria-label');
    $('theme-icon').setAttribute('href', settings.theme === 'dark' ? '#i-sun' : '#i-moon');
    $('download-menu').querySelector('summary').setAttribute('aria-label', t('books'));
    $('verse').setAttribute('aria-label', t('verse'));
    renderStorageNote();
    renderCollection();
    $('goal-input').lang = settings.language;
    renderProgress();
  }

  function groupLabel(id) {
    if (id === 'all') return t('allVerses');
    if (activeCollection === 'sevakunj') return t(GROUPS.includes(id) ? id : 'collection');
    const chapter = corpus?.groups?.find((item) => item.id === id);
    return chapter ? `${Number(id.slice(-2))}. ${localised(chapter)}` : t('chapter');
  }

  function renderCollection() {
    const isKanthahara = activeCollection === 'kanthahara';
    const title = localised(corpus?.title) || localised(COLLECTIONS[activeCollection].title);
    document.title = `${title} · ${t('workingEdition')}`;
    $('page-title').textContent = title;
    $('collection-select').value = activeCollection;
    $('collection-scope').textContent = t(isKanthahara ? 'kanthaharaScope' : 'sevakunjScope');
    $('collection-subtitle').textContent = localised(corpus?.subtitle) || t(isKanthahara ? 'kanthaharaScope' : 'sevakunjScope');
    $('collection-dedication').textContent = localised(corpus?.dedication);
    $('collection-dedication').hidden = !$('collection-dedication').textContent.trim();
    $('collection-total').textContent = corpus ? t(isKanthahara ? 'entryCount' : 'collectionCount', { count: units.length }) : '—';
    $('download-menu').hidden = isKanthahara;
    if (isKanthahara) $('download-menu').open = false;
    $('home-link').setAttribute('href', `#${settings.positions.sevakunj || COLLECTIONS.sevakunj.firstId}`);
    $('home-link').setAttribute('aria-label', t('returnSevakunj'));
    $('sevakunj-groups').hidden = isKanthahara;
    $('chapter-filter').hidden = !isKanthahara;
    const options = document.createDocumentFragment();
    const all = element('option', '', t('allChapters'));
    all.value = 'all';
    options.append(all);
    if (isKanthahara && corpus) {
      corpus.groups.forEach((chapter) => {
        const count = units.filter((unit) => unit.group === chapter.id).length;
        const option = element('option', '', `${groupLabel(chapter.id)} · ${count}`);
        option.value = chapter.id;
        options.append(option);
      });
    }
    $('chapter-select').replaceChildren(options);
    $('chapter-select').value = group;
    for (const id of ['search', 'status-filter', 'chapter-select']) $(id).disabled = !corpus;
    document.querySelectorAll('[data-group]').forEach((button) => { button.disabled = !corpus; });
    document.querySelectorAll('[data-mode]').forEach((button) => { button.disabled = !currentUnit() || (button.dataset.mode === 'recall' && !canStudy()); });
    const editorialNote = localised(corpus?.editorialNote) || (corpus && !isKanthahara ? t('editionNote') : '');
    $('edition-note-text').textContent = editorialNote;
    $('edition-note').hidden = !editorialNote.trim();
    const attribution = localised(corpus?.attribution);
    $('edition-attribution').textContent = attribution;
    $('edition-about').hidden = !attribution.trim();
    $('edition-label').textContent = corpus?.reviewStatus === 'pending_anthropic' ? t('previewEdition') :
      text(corpus?.edition) ? `${t('workingEdition')} · ${text(corpus.edition)}` : t('workingEdition');
  }

  function fold(value) {
    return text(value).normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().replace(/ё/g, 'е').trim();
  }

  function indexUnit(unit) {
    const pieces = [unit.id, unit.archiveId, String(unit.number), unit.opening, unit.iast, unit.cyrillic, unit.original];
    for (const language of ['ru', 'en']) {
      pieces.push(text(unit.reference?.[language]), text(unit.sourceCitation?.[language]), text(unit.readingNote?.[language]), text(unit.meaning?.[language]), text(unit.commentary?.[language]), text(unit.translation?.[language]?.text));
    }
    if (Array.isArray(unit.variantTranslations)) unit.variantTranslations.forEach((variant) => pieces.push(text(variant?.text)));
    return fold(pieces.filter((piece) => typeof piece === 'string').join(' '));
  }

  function currentUnit() { return unitById.get(activeId); }
  function canStudy(unit = currentUnit()) { return Boolean(unit && unit.studyEligible !== false); }
  function reviewFor(id) { return settings.reviews[id] || null; }
  function isFavourite(id) { return settings.favourites.includes(id); }
  function isDue(id) { const due = reviewFor(id)?.due; return Boolean(due && Date.parse(due) <= Date.now()); }

  function filterUnits() {
    const terms = fold(query).split(/\s+/).filter(Boolean);
    return units.filter((unit) => {
      if (group !== 'all' && unit.group !== group) return false;
      const review = reviewFor(unit.id);
      if (statusFilter === 'favourites' && !isFavourite(unit.id)) return false;
      if (statusFilter === 'due' && !isDue(unit.id)) return false;
      if (statusFilter === 'learned' && !review?.learned) return false;
      if (statusFilter === 'new' && review?.lastReviewed) return false;
      return terms.every((term) => searchIndex.get(unit.id).includes(term));
    });
  }

  function renderList() {
    filtered = filterUnits();
    const list = $('unit-list');
    const oldScroll = list.scrollTop;
    const focusedId = document.activeElement?.dataset?.unitId;
    const fragment = document.createDocumentFragment();
    document.querySelectorAll('[data-group]').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.group === group)));
    $('chapter-select').value = group;
    $('status-filter').value = statusFilter;
    $('result-count').textContent = corpus ? String(filtered.length) : '—';
    $('result-count').setAttribute('aria-label', t('foundCount', { count: filtered.length }));
    if (corpus && !filtered.length) {
      const empty = element('div', 'list-empty');
      const emptyKey = query || group !== 'all' ? 'noResults' : ({ favourites: 'noFavourites', due: 'noDue', learned: 'noLearned', new: 'noNew' }[statusFilter] || 'noResults');
      empty.append(icon(statusFilter === 'favourites' ? 'star' : 'search'), element('p', '', t(emptyKey)));
      const reset = element('button', 'text-button', t('resetFilters'));
      reset.type = 'button';
      reset.addEventListener('click', resetFilters);
      empty.append(reset);
      fragment.append(empty);
    }
    // Chapter headings follow the supplied sequence; filtering never sorts the book.
    const blocks = [];
    for (const unit of filtered) {
      const name = activeCollection === 'kanthahara' ? unit.group : group;
      if (blocks[blocks.length - 1]?.name !== name) blocks.push({ name, members: [] });
      blocks[blocks.length - 1].members.push(unit);
    }
    for (const { name, members } of blocks) {
      const section = element('section', 'list-group');
      const heading = element('h3', 'list-group-heading', groupLabel(name));
      heading.append(element('span', '', String(members.length)));
      section.append(heading);
      for (const unit of members) {
        const button = element('button', 'unit-row');
        button.type = 'button';
        button.dataset.unitId = unit.id;
        if (unit.id === activeId) button.setAttribute('aria-current', 'page');
        const number = element('span', 'row-number', String(unit.number).padStart(2, '0'));
        const content = element('span', 'row-content');
        const opening = settings.language === 'ru' && text(unit.cyrillic) ? unit.cyrillic.split(/\r?\n/)[0] : (text(unit.opening) || text(unit.iast).split(/\r?\n/)[0]);
        content.append(element('span', 'row-reference', localised(unit.reference)), element('span', 'row-opening', opening));
        const markers = element('span', 'row-markers');
        markers.setAttribute('aria-hidden', 'true');
        if (isFavourite(unit.id)) markers.append(icon('star', 'is-favourite'));
        if (reviewFor(unit.id)?.learned) markers.append(icon('check', 'is-learned'));
        else if (isDue(unit.id)) markers.append(icon('clock', 'is-due'));
        button.append(number, content, markers);
        section.append(button);
      }
      fragment.append(section);
    }
    list.replaceChildren(fragment);
    list.scrollTop = oldScroll;
    if (focusedId) [...list.querySelectorAll('[data-unit-id]')].find((button) => button.dataset.unitId === focusedId)?.focus({ preventScroll: true });
    renderNavigation();
  }

  function resetFilters() {
    query = '';
    group = 'all';
    statusFilter = 'all';
    $('search').value = '';
    clearTimeout(searchTimer);
    renderList();
  }

  function effectiveScript(unit) {
    if (text(unit[settings.script]).trim()) return settings.script;
    const preferred = settings.language === 'ru' ? 'cyrillic' : 'iast';
    return [preferred, 'iast', 'cyrillic', 'original'].find((script) => text(unit[script]).trim()) || 'iast';
  }

  function verseLines(unit) {
    return text(unit[effectiveScript(unit)]).trim().split(/\r?\n/);
  }

  function wordScore(id, line, index) {
    const value = `${id}:${line}:${index}`;
    let hash = 2166136261;
    for (let i = 0; i < value.length; i += 1) hash = Math.imul(hash ^ value.charCodeAt(i), 16777619);
    return (hash >>> 0) / 4294967296;
  }

  function renderVerse() {
    const unit = currentUnit();
    if (!unit) return;
    const script = effectiveScript(unit);
    const recalling = settings.mode === 'recall' && canStudy(unit);
    const container = $('verse');
    container.className = `verse is-${script}${recalling ? ' is-recall' : ''}`;
    container.lang = script === 'original' ? (unit.originalScript === 'bn' ? 'bn' : 'sa-Deva') : (script === 'iast' ? 'sa-Latn' : 'ru');
    const fragment = document.createDocumentFragment();
    const lines = verseLines(unit);
    lines.forEach((line, lineIndex) => {
      const row = element('div', 'verse-line');
      const number = element('span', 'line-number', String(lineIndex + 1).padStart(2, '0'));
      number.hidden = !recalling;
      number.setAttribute('aria-hidden', 'true');
      const content = element('span', 'line-text');
      const revealed = revealedLines.has(lineIndex);
      if (!recalling || revealed || maskLevel === 0) {
        content.textContent = line || '\u00a0';
      } else {
        const words = line.split(/(\s+)/u);
        let wordIndex = 0;
        words.forEach((word) => {
          if (!/[\p{L}\p{N}]/u.test(word)) {
            content.append(document.createTextNode(word));
            return;
          }
          const hide = maskLevel === 3 || wordScore(unit.id, lineIndex, wordIndex) < (maskLevel === 1 ? .38 : .73);
          wordIndex += 1;
          if (hide) {
            const masked = element('span', 'word-mask', word.replace(/[\p{L}\p{M}\p{N}]/gu, '·'));
            masked.setAttribute('role', 'img');
            masked.setAttribute('aria-label', t('hiddenWord'));
            content.append(masked);
          } else content.append(document.createTextNode(word));
        });
      }
      const reveal = element('button', 'line-reveal');
      reveal.type = 'button';
      reveal.hidden = !recalling;
      reveal.disabled = maskLevel === 0;
      reveal.dataset.line = String(lineIndex);
      reveal.setAttribute('aria-pressed', String(revealed));
      const label = t(revealed ? 'hideLine' : 'revealLine', { line: lineIndex + 1 });
      reveal.setAttribute('aria-label', label);
      reveal.title = label;
      reveal.append(icon('eye'));
      row.append(number, content, reveal);
      fragment.append(row);
    });
    container.replaceChildren(fragment);
    $('mask-description').textContent = t(`mask${maskLevel}`);
    $('mask-level').setAttribute('aria-valuetext', t(`mask${maskLevel}`));
    $('reveal-all-label').textContent = t(revealedLines.size === lines.length ? 'hideAll' : 'revealAll');
    $('reveal-all').disabled = maskLevel === 0;
    $('reveal-all').setAttribute('aria-pressed', String(revealedLines.size === lines.length));
  }

  function safeExternalUrl(value) {
    if (typeof value !== 'string') return null;
    try {
      const url = new URL(value);
      return ['https:', 'http:'].includes(url.protocol) && !url.username && !url.password ? url.href : null;
    } catch { return null; }
  }

  function setSourceLink(node, value) {
    const url = safeExternalUrl(value);
    node.hidden = !url;
    if (url) node.href = url;
    else node.removeAttribute('href');
  }

  function renderSources(unit) {
    const url = unit.sourceUrls?.[settings.language];
    const citation = localised(unit.sourceCitation);
    $('source-citation').textContent = citation;
    $('source-citation').hidden = !citation.trim();
    setSourceLink($('primary-source'), url);
    setSourceLink($('commentary-source'), url);
    const languages = document.createDocumentFragment();
    ['ru', 'en'].forEach((language) => {
      const href = safeExternalUrl(unit.sourceUrls?.[language]);
      if (!href) return;
      const link = element('a', '', language.toUpperCase());
      link.href = href;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.hreflang = language;
      link.setAttribute('aria-label', t('sourceLanguage', { language: t(language === 'ru' ? 'russianSource' : 'englishSource') }));
      if (language === settings.language) link.setAttribute('aria-current', 'true');
      languages.append(link);
    });
    $('source-language-links').replaceChildren(languages);
  }

  function renderTranslation(unit) {
    const translation = unit.translation?.[settings.language];
    const hasTranslation = isRecord(translation) && Boolean(text(translation.text).trim());
    $('translation-section').hidden = !hasTranslation;
    $('translation-heading').textContent = t(translation?.kind === 'provided_edition' ? 'editionTranslation' : 'publishedTranslation');
    $('source-invitation').hidden = hasTranslation || !['ru', 'en'].some((language) => safeExternalUrl(unit.sourceUrls?.[language]));
    $('translation-text').textContent = hasTranslation ? translation.text : '';
    $('translation-attribution').textContent = hasTranslation ? text(translation.attribution) : '';
    $('translation-attribution').hidden = !hasTranslation || !text(translation.attribution).trim();
    $('translation-license').textContent = hasTranslation ? text(translation.license) : '';
    $('translation-license').hidden = !hasTranslation || !text(translation.license);
    const variants = Array.isArray(unit.variantTranslations) ? unit.variantTranslations.filter((variant) => isRecord(variant) && text(variant.text).trim()) : [];
    $('variant-section').hidden = variants.length === 0;
    const fragment = document.createDocumentFragment();
    variants.forEach((variant) => {
      const item = element('div', 'variant-item');
      const language = text(variant.language).split('-')[0].toLowerCase();
      const label = t(language === 'ru' ? 'variantRussian' : language === 'en' ? 'variantEnglish' : 'variantOther');
      const content = element('p', 'variant-text', variant.text);
      if (['ru', 'en'].includes(language)) content.lang = language;
      item.append(element('span', 'variant-language', label), content);
      if (text(variant.note)) item.append(element('p', 'variant-note', variant.note));
      if (text(variant.attribution)) item.append(element('p', 'attribution', variant.attribution));
      fragment.append(item);
    });
    $('variant-content').replaceChildren(fragment);
  }

  function shortDate(value, includeTime = false) {
    const date = new Date(value);
    if (!Number.isFinite(date.getTime())) return '';
    const options = { day: 'numeric', month: 'short' };
    if (date.getFullYear() !== new Date().getFullYear()) options.year = 'numeric';
    if (includeTime) { options.hour = '2-digit'; options.minute = '2-digit'; }
    return new Intl.DateTimeFormat(settings.language === 'ru' ? 'ru-RU' : 'en-GB', options).format(date);
  }

  function renderStudy() {
    const unit = currentUnit();
    if (!unit) return;
    $('study-page').hidden = false;
    $('bottom-navigation').hidden = false;
    $('unit-number').textContent = String(unit.number).padStart(2, '0');
    $('unit-group').textContent = groupLabel(unit.group);
    $('verse-heading').textContent = localised(unit.reference) || unit.id;
    $('source-author').textContent = text(unit.sourceAuthor);
    $('source-author').hidden = !text(unit.sourceAuthor).trim();
    $('meaning-text').textContent = localised(unit.meaning);
    $('meaning-section').hidden = !localised(unit.meaning).trim();
    $('commentary').hidden = !localised(unit.commentary).trim() && !(unit.hasPurport && safeExternalUrl(unit.sourceUrls?.[settings.language]));
    $('commentary-text').textContent = localised(unit.commentary) || t('commentaryUnavailable');
    $('commentary-source').querySelector('span').textContent = t(unit.hasPurport ? 'sourceCommentary' : 'readSource');
    const variantNote = localised(unit.variantNote);
    $('plate-note').hidden = !unit.plateVariant || !variantNote;
    $('plate-note-text').textContent = variantNote;
    const eligible = canStudy(unit);
    const readingNote = localised(unit.readingNote) || (!eligible ? t('readOnlyNote') : '');
    $('reading-note').hidden = !readingNote.trim();
    $('reading-note-text').textContent = readingNote;
    const favourite = isFavourite(unit.id);
    $('favourite-toggle').setAttribute('aria-pressed', String(favourite));
    $('favourite-toggle').setAttribute('aria-label', t(favourite ? 'removeFavourite' : 'addFavourite'));
    $('favourite-toggle').title = $('favourite-toggle').getAttribute('aria-label');
    const review = reviewFor(unit.id);
    $('learned-toggle').setAttribute('aria-pressed', String(Boolean(review?.learned)));
    $('learned-label').textContent = t(review?.learned ? 'isLearned' : 'markLearned');
    $('learned-toggle').disabled = !eligible;
    $('review-status').classList.toggle('is-due', isDue(unit.id));
    $('review-status').textContent = isDue(unit.id) ? t('reviewDue') : review?.due ? t('nextReview', { date: shortDate(review.due) }) : t('newVerse');
    $('review-status').hidden = !eligible;
    document.querySelectorAll('[data-mode]').forEach((button) => {
      button.disabled = button.dataset.mode === 'recall' && !eligible;
      button.setAttribute('aria-pressed', String(button.dataset.mode === (eligible ? settings.mode : 'read')));
      if (!eligible && button.dataset.mode === 'recall') button.setAttribute('aria-describedby', 'reading-note-text');
      else button.removeAttribute('aria-describedby');
    });
    document.querySelectorAll('[data-script]').forEach((button) => {
      button.hidden = !text(unit[button.dataset.script]).trim();
      button.setAttribute('aria-pressed', String(button.dataset.script === effectiveScript(unit)));
    });
    const recalling = settings.mode === 'recall' && eligible;
    $('recall-controls').hidden = !recalling;
    $('recall-reveal').hidden = !recalling;
    $('rating-panel').hidden = !recalling;
    $('mask-level').value = String(maskLevel);
    renderVerse();
    renderSources(unit);
    renderTranslation(unit);
    renderRatingIntervals();
    $('rating-feedback').textContent = ratingFeedback?.id === unit.id ? t('ratingSaved', { date: shortDate(ratingFeedback.due, true) }) : '';
    renderNavigation();
  }

  function neighbouring(direction) {
    if (!filtered.length) return null;
    const index = filtered.findIndex((unit) => unit.id === activeId);
    if (index !== -1) return filtered[index + direction] || null;
    const unit = currentUnit();
    if (!unit) return filtered[0];
    return direction === 1 ? filtered.find((candidate) => candidate.number > unit.number) || null : [...filtered].reverse().find((candidate) => candidate.number < unit.number) || null;
  }

  function renderNavigation() {
    const unit = currentUnit();
    $('position-label').textContent = unit ? `${unit.number} / ${units.length}` : '— / —';
    for (const id of ['previous-top', 'previous-bottom']) $(id).disabled = !unit || !neighbouring(-1);
    for (const id of ['next-top', 'next-bottom']) $(id).disabled = !unit || !neighbouring(1);
  }

  function selectUnit(id, { focus = false, scroll = false, updateHash = true } = {}) {
    if (!unitById.has(id)) return;
    const changed = id !== activeId;
    activeId = id;
    settings.positions[activeCollection] = id;
    if (activeCollection === 'sevakunj') settings.lastUnit = id;
    if (changed) {
      revealedLines = new Set();
      ratingFeedback = null;
      $('commentary').open = false;
    }
    if (updateHash) replaceHash(id);
    persist();
    renderList();
    renderStudy();
    const unit = currentUnit();
    $('navigation-announcement').textContent = t('navigation', { number: unit.number, total: units.length, reference: localised(unit.reference) });
    if (scroll) $('study-page').scrollIntoView({ block: 'start', behavior: reducedMotion.matches ? 'instant' : 'smooth' });
    if (focus) $('verse-heading').focus({ preventScroll: true });
  }

  function navigate(direction) {
    const next = neighbouring(direction);
    if (next) selectUnit(next.id, { scroll: true });
  }

  function dayKey(date = new Date()) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }

  function renderProgress() {
    const count = (settings.days[dayKey()] || []).filter((id) => collectionForId(id) === activeCollection && (!corpus || unitById.has(id))).length;
    const goal = collectionGoal();
    $('goal-ring-number').textContent = String(count);
    $('goal-count').textContent = `${count} / ${goal}`;
    $('goal-caption').textContent = t(count >= goal ? 'goalComplete' : 'dailyGoal');
    $('goal-ring-value').style.strokeDashoffset = String(125.664 * (1 - Math.min(1, count / goal)));
    $('goal-progress').setAttribute('aria-valuemax', String(goal));
    $('goal-progress').setAttribute('aria-valuenow', String(Math.min(count, goal)));
    $('goal-progress').setAttribute('aria-valuetext', t('goalProgress', { count, goal }));
    $('goal-button').setAttribute('aria-label', `${t('goalProgress', { count, goal })}. ${t('editGoal')}`);
  }

  // A small, transparent interval schedule; ratings are self-assessments.
  function schedule(previous, rating, now = new Date()) {
    const prior = previous || { interval: 0, ease: 2.5, repetitions: 0, learned: false };
    let interval = 0;
    let ease = prior.ease;
    let repetitions = prior.repetitions + 1;
    let learned = prior.learned;
    const due = new Date(now);
    if (rating === 'again') {
      repetitions = 0;
      ease = Math.max(1.3, ease - .2);
      learned = false;
      due.setMinutes(due.getMinutes() + 10);
    } else {
      if (rating === 'hard') {
        interval = Math.max(1, Math.round(prior.interval * 1.2));
        ease = Math.max(1.3, ease - .15);
      } else if (rating === 'good') {
        interval = prior.repetitions === 0 ? 1 : prior.interval < 3 ? 3 : Math.round(prior.interval * ease);
        learned = learned || interval >= 7;
      } else {
        interval = Math.max(4, Math.round(Math.max(1, prior.interval) * ease * 1.3));
        ease = Math.min(3.5, ease + .15);
        learned = true;
      }
      interval = Math.min(3650, interval);
      due.setDate(due.getDate() + interval);
    }
    return { interval, ease, repetitions, learned, due: due.toISOString(), lastReviewed: now.toISOString(), lastRating: rating };
  }

  function renderRatingIntervals() {
    if (!currentUnit()) return;
    RATINGS.forEach((rating) => {
      const result = schedule(reviewFor(activeId), rating);
      $(`interval-${rating}`).textContent = rating === 'again' ? t('inTenMinutes') : new Intl.RelativeTimeFormat(settings.language, { numeric: 'always' }).format(result.interval, 'day');
      const button = document.querySelector(`[data-rating="${rating}"]`);
      button.disabled = !canStudy() || ratingFeedback?.id === activeId;
      button.setAttribute('aria-pressed', String(ratingFeedback?.id === activeId && ratingFeedback.rating === rating));
    });
  }

  function rate(rating) {
    if (!canStudy() || settings.mode !== 'recall' || !RATINGS.includes(rating) || ratingFeedback?.id === activeId) return;
    const review = schedule(reviewFor(activeId), rating);
    settings.reviews[activeId] = review;
    const day = dayKey();
    settings.days[day] = [...new Set([...(settings.days[day] || []), activeId])];
    Object.keys(settings.days).sort().slice(0, -60).forEach((key) => { delete settings.days[key]; });
    ratingFeedback = { id: activeId, due: review.due, rating };
    persist();
    renderList();
    renderStudy();
    renderProgress();
  }

  function toggleFavourite() {
    if (!currentUnit()) return;
    const wasFavourite = isFavourite(activeId);
    settings.favourites = wasFavourite ? settings.favourites.filter((id) => id !== activeId) : [...settings.favourites, activeId];
    persist();
    renderList();
    renderStudy();
    showToast(t(wasFavourite ? 'favouriteRemoved' : 'favouriteAdded'));
  }

  function toggleLearned() {
    if (!canStudy()) return;
    const previous = reviewFor(activeId);
    const learned = !previous?.learned;
    const now = new Date();
    const due = new Date(now);
    due.setDate(due.getDate() + 7);
    settings.reviews[activeId] = {
      interval: 7, ease: 2.5, repetitions: 1, due: due.toISOString(), lastReviewed: now.toISOString(), lastRating: 'manual',
      ...previous, learned,
    };
    persist();
    renderList();
    renderStudy();
    showToast(t(learned ? 'markedLearned' : 'unmarkedLearned'));
  }

  function setMode(mode) {
    if (!['read', 'recall'].includes(mode)) return;
    if (mode === 'recall' && !canStudy()) return;
    if (settings.mode !== mode) ratingFeedback = null;
    settings.mode = mode;
    revealedLines = new Set();
    persist();
    renderStudy();
  }

  function toggleRevealAll() {
    const unit = currentUnit();
    if (!canStudy(unit) || settings.mode !== 'recall' || maskLevel === 0) return;
    const lines = verseLines(unit);
    revealedLines = revealedLines.size === lines.length ? new Set() : new Set(lines.map((_, index) => index));
    renderVerse();
  }

  function showToast(message) {
    clearTimeout(toastTimer);
    $('toast').textContent = message;
    $('toast').hidden = false;
    toastTimer = setTimeout(() => { $('toast').hidden = true; }, 4500);
  }

  function updateDrawerAccessibility() {
    $('sidebar').inert = mobile.matches && !drawerOpen;
    if (mobile.matches) $('sidebar').setAttribute('aria-hidden', String(!drawerOpen));
    else $('sidebar').removeAttribute('aria-hidden');
    $('topbar').inert = drawerOpen;
    $('main').inert = drawerOpen;
    if (drawerOpen) {
      $('sidebar').setAttribute('role', 'dialog');
      $('sidebar').setAttribute('aria-modal', 'true');
    } else {
      $('sidebar').removeAttribute('role');
      $('sidebar').removeAttribute('aria-modal');
    }
  }

  function openDrawer() {
    if (!mobile.matches || drawerOpen) return;
    drawerReturnFocus = document.activeElement;
    drawerOpen = true;
    $('sidebar').classList.add('is-open');
    $('drawer-backdrop').hidden = false;
    $('open-library').setAttribute('aria-expanded', 'true');
    document.body.classList.add('drawer-open');
    updateDrawerAccessibility();
    $('close-library').focus({ preventScroll: true });
  }

  function closeDrawer(restoreFocus = true) {
    if (!drawerOpen) return;
    drawerOpen = false;
    $('sidebar').classList.remove('is-open');
    $('drawer-backdrop').hidden = true;
    $('open-library').setAttribute('aria-expanded', 'false');
    document.body.classList.remove('drawer-open');
    updateDrawerAccessibility();
    if (restoreFocus && drawerReturnFocus?.isConnected) drawerReturnFocus.focus({ preventScroll: true });
  }

  function openDialog(id) {
    closeDrawer(false);
    $('download-menu').open = false;
    const dialog = $(id);
    if (id === 'goal-dialog') {
      $('goal-input').max = String(units.length || COLLECTIONS[activeCollection].maxUnits);
      $('goal-input').value = String(collectionGoal());
    }
    if (typeof dialog.showModal === 'function') {
      dialog.showModal();
      document.body.classList.add('modal-open');
    }
  }

  function handleKeyboard(event) {
    if (event.ctrlKey || event.metaKey || event.altKey || event.isComposing) return;
    if (document.querySelector('dialog[open]')) return;
    if (drawerOpen && event.key === 'Escape') { event.preventDefault(); closeDrawer(); return; }
    if (drawerOpen && event.key === 'Tab') {
      const focusable = [...$('sidebar').querySelectorAll('button, input, select, a[href]')].filter((node) => !node.disabled && node.getClientRects().length > 0);
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      return;
    }
    if (event.target.closest('input, textarea, select, [contenteditable="true"]')) return;
    if (event.key === 'Escape') { $('download-menu').open = false; return; }
    if (event.key === '/') {
      event.preventDefault();
      if (mobile.matches) openDrawer();
      $('search').focus();
      return;
    }
    if (event.key === '?') { event.preventDefault(); openDialog('help-dialog'); return; }
    if (drawerOpen || !currentUnit()) return;
    const key = event.key.toLowerCase();
    if (key === 'arrowright') { event.preventDefault(); navigate(1); }
    else if (key === 'arrowleft') { event.preventDefault(); navigate(-1); }
    else if (key === 'm') { event.preventDefault(); setMode(settings.mode === 'read' ? 'recall' : 'read'); }
    else if (key === 'f') { event.preventDefault(); toggleFavourite(); }
    else if (key === ' ' && settings.mode === 'recall' && !event.target.closest('button, a, summary')) { event.preventDefault(); toggleRevealAll(); }
    else if (/^[1-4]$/.test(key) && settings.mode === 'recall') { event.preventDefault(); rate(RATINGS[Number(key) - 1]); }
  }

  function hashTarget() {
    try {
      const hash = decodeURIComponent(window.location.hash.slice(1));
      const collection = collectionForId(hash);
      if (collection) return { collection, id: hash };
      if (/^\d{1,2}$/.test(hash) && Number(hash) >= 1 && Number(hash) <= 76) return { collection: 'sevakunj', number: Number(hash) };
    } catch { /* An invalid shared fragment leaves the saved position intact. */ }
    return null;
  }

  function hashUnit(target = hashTarget()) {
    if (target?.collection !== activeCollection) return '';
    if (unitById.has(target.id)) return target.id;
    if (target.number) return units.find((unit) => unit.number === target.number)?.id || '';
    return '';
  }

  function replaceHash(id) {
    if (!collectionForId(id)) return;
    try {
      const url = new URL(window.location.href);
      url.hash = id;
      window.history.replaceState(null, '', url);
    } catch { /* Local file previews can restrict history. */ }
  }

  function followHash() {
    const target = hashTarget();
    if (!target) return;
    if (target.collection === activeCollection && corpus) {
      const id = hashUnit(target);
      if (id) selectUnit(id, { updateHash: false });
    } else loadCorpus(target.collection, { target });
  }

  function bindEvents() {
    $('collection-select').addEventListener('change', () => {
      const id = $('collection-select').value;
      if (!Object.hasOwn(COLLECTIONS, id) || (id === activeCollection && corpus)) return;
      const target = { collection: id, id: settings.positions[id] || COLLECTIONS[id].firstId };
      replaceHash(target.id);
      loadCorpus(id, { target });
    });
    document.querySelectorAll('[data-language]').forEach((button) => button.addEventListener('click', () => {
      if (settings.language === button.dataset.language) return;
      settings.language = button.dataset.language;
      settings.script = settings.language === 'ru' ? 'cyrillic' : 'iast';
      revealedLines = new Set();
      $('toast').hidden = true;
      persist();
      applyLocale();
      renderList();
      renderStudy();
    }));
    $('theme-toggle').addEventListener('click', () => {
      settings.theme = settings.theme === 'dark' ? 'light' : 'dark';
      persist();
      applyLocale();
      renderStudy();
    });
    $('open-library').addEventListener('click', openDrawer);
    $('close-library').addEventListener('click', () => closeDrawer());
    $('drawer-backdrop').addEventListener('click', () => closeDrawer());
    mobile.addEventListener('change', () => { if (!mobile.matches) closeDrawer(false); updateDrawerAccessibility(); });
    $('search').addEventListener('input', () => {
      query = $('search').value;
      clearTimeout(searchTimer);
      searchTimer = setTimeout(renderList, 100);
    });
    document.querySelectorAll('[data-group]').forEach((button) => button.addEventListener('click', () => { group = button.dataset.group; renderList(); }));
    $('chapter-select').addEventListener('change', () => { group = $('chapter-select').value; $('unit-list').scrollTop = 0; renderList(); });
    $('status-filter').addEventListener('change', () => { statusFilter = $('status-filter').value; renderList(); });
    $('unit-list').addEventListener('click', (event) => {
      const button = event.target.closest('[data-unit-id]');
      if (!button) return;
      const wasMobile = mobile.matches;
      closeDrawer(false);
      selectUnit(button.dataset.unitId, { focus: wasMobile, scroll: wasMobile });
    });
    document.querySelectorAll('[data-mode]').forEach((button) => button.addEventListener('click', () => setMode(button.dataset.mode)));
    document.querySelectorAll('[data-script]').forEach((button) => button.addEventListener('click', () => {
      settings.script = button.dataset.script;
      revealedLines = new Set();
      persist();
      renderStudy();
    }));
    $('mask-level').addEventListener('input', () => {
      maskLevel = Number($('mask-level').value);
      revealedLines = new Set();
      renderVerse();
    });
    $('verse').addEventListener('click', (event) => {
      const button = event.target.closest('[data-line]');
      if (!button) return;
      const line = Number(button.dataset.line);
      if (revealedLines.has(line)) revealedLines.delete(line);
      else revealedLines.add(line);
      renderVerse();
      $('verse').querySelector(`[data-line="${line}"]`)?.focus({ preventScroll: true });
    });
    $('reveal-all').addEventListener('click', toggleRevealAll);
    $('favourite-toggle').addEventListener('click', toggleFavourite);
    $('learned-toggle').addEventListener('click', toggleLearned);
    for (const id of ['previous-top', 'previous-bottom']) $(id).addEventListener('click', () => navigate(-1));
    for (const id of ['next-top', 'next-bottom']) $(id).addEventListener('click', () => navigate(1));
    document.querySelectorAll('[data-rating]').forEach((button) => button.addEventListener('click', () => rate(button.dataset.rating)));
    $('goal-button').addEventListener('click', () => openDialog('goal-dialog'));
    $('help-button').addEventListener('click', () => openDialog('help-dialog'));
    $('shortcuts-button').addEventListener('click', () => openDialog('help-dialog'));
    document.querySelectorAll('[data-close-dialog]').forEach((button) => button.addEventListener('click', () => $(button.dataset.closeDialog).close()));
    document.querySelectorAll('dialog').forEach((dialog) => {
      dialog.addEventListener('close', () => { document.body.classList.remove('modal-open'); });
      dialog.addEventListener('click', (event) => {
        const box = dialog.getBoundingClientRect();
        if (event.target === dialog && (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom)) dialog.close();
      });
    });
    $('goal-form').addEventListener('submit', (event) => {
      event.preventDefault();
      if (!$('goal-form').reportValidity()) return;
      settings.goals[activeCollection] = Math.round(bounded($('goal-input').value, 5, 1, units.length || COLLECTIONS[activeCollection].maxUnits));
      if (activeCollection === 'sevakunj') settings.goal = settings.goals.sevakunj;
      persist();
      renderProgress();
      $('goal-dialog').close();
      showToast(t('goalSaved'));
    });
    $('download-menu').addEventListener('click', (event) => {
      if (event.target.closest('a[download]')) setTimeout(() => { $('download-menu').open = false; }, 0);
    });
    document.addEventListener('click', (event) => { if (!$('download-menu').contains(event.target)) $('download-menu').open = false; });
    document.addEventListener('keydown', handleKeyboard);
    window.addEventListener('hashchange', followHash);
    window.addEventListener('online', updateConnection);
    window.addEventListener('offline', updateConnection);
    window.addEventListener('focus', refreshTime);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) refreshTime(); });
    window.addEventListener('storage', (event) => {
      if (event.key !== STORAGE_KEY) return;
      settings = readSettings();
      // Another tab may be studying the other book; keep this tab's open page.
      settings.activeCollection = activeCollection;
      revealedLines = new Set();
      ratingFeedback = null;
      applyLocale();
      renderList();
      renderStudy();
    });
    $('retry-load').addEventListener('click', () => loadCorpus(activeCollection, { target: hashTarget() }));
  }

  function updateConnection() { $('offline-indicator').hidden = navigator.onLine !== false; }
  function refreshTime() { renderProgress(); if (corpus) { renderList(); renderStudy(); } }

  function validateCorpus(data, collectionId) {
    const config = COLLECTIONS[collectionId];
    if (!isRecord(data) || !Array.isArray(data.units) || !data.units.length || data.units.length > config.maxUnits) throw new Error('Invalid corpus');
    if (data.collectionId !== undefined && data.collectionId !== collectionId) throw new Error('Wrong collection');
    const groupIds = new Set(GROUPS);
    if (collectionId === 'kanthahara') {
      if (data.collectionId !== collectionId || !Array.isArray(data.groups) || data.groups.length !== 13) throw new Error('Invalid chapters');
      groupIds.clear();
      for (const chapter of data.groups) {
        if (!isRecord(chapter) || !/^jewel-(?:0[1-9]|1[0-3])$/.test(text(chapter.id)) || groupIds.has(chapter.id) || !text(chapter.ru).trim() || !text(chapter.en).trim()) throw new Error('Invalid chapter');
        groupIds.add(chapter.id);
      }
    }
    const ids = new Set();
    const numbers = new Set();
    for (const unit of data.units) {
      if (!isRecord(unit) || collectionForId(unit.id) !== collectionId || ids.has(unit.id) || !Number.isInteger(unit.number) || unit.number < 1 || unit.number > config.maxUnits || numbers.has(unit.number) || !groupIds.has(unit.group)) throw new Error('Invalid verse record');
      if (collectionId === 'kanthahara' && Number(unit.id.split('-')[1].split('.')[0]) !== Number(unit.group.slice(-2))) throw new Error('Wrong chapter');
      ids.add(unit.id);
      numbers.add(unit.number);
    }
  }

  async function loadCorpus(collectionId = activeCollection, { target = null } = {}) {
    if (!Object.hasOwn(COLLECTIONS, collectionId)) return;
    const sequence = ++loadSequence;
    loadController?.abort();
    const controller = new AbortController();
    loadController = controller;
    loading = true;
    activeCollection = collectionId;
    corpus = null;
    units = [];
    activeId = '';
    unitById = new Map();
    searchIndex = new Map();
    query = '';
    group = 'all';
    statusFilter = 'all';
    revealedLines = new Set();
    ratingFeedback = null;
    clearTimeout(searchTimer);
    $('search').value = '';
    $('unit-list').scrollTop = 0;
    $('unit-list').setAttribute('aria-busy', 'true');
    $('study-page').hidden = true;
    $('bottom-navigation').hidden = true;
    $('rating-panel').hidden = true;
    $('commentary').open = false;
    $('edition-about').open = false;
    closeDrawer(false);
    $('loading-state').hidden = false;
    $('error-state').hidden = true;
    applyLocale();
    renderList();
    persist();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch(new URL(`./${COLLECTIONS[collectionId].file}`, window.location.href), { signal: controller.signal, credentials: 'same-origin', cache: 'no-cache' });
      if (!response.ok) throw new Error('Corpus unavailable');
      const data = await response.json();
      if (sequence !== loadSequence) return;
      validateCorpus(data, collectionId);
      corpus = data;
      units = data.units;
      unitById = new Map(units.map((unit) => [unit.id, unit]));
      searchIndex = new Map(units.map((unit) => [unit.id, indexUnit(unit)]));
      // Favourites, review records and daily history belong to both books.
      // Loading either corpus must never prune IDs from the other one.
      loading = false;
      $('loading-state').hidden = true;
      const selected = hashUnit(target) || (unitById.has(settings.positions[collectionId]) ? settings.positions[collectionId] : units[0].id);
      applyLocale();
      selectUnit(selected);
      renderProgress();
      if (!storageAvailable) showToast(t('storageWarning'));
      registerServiceWorker();
    } catch {
      if (sequence !== loadSequence) return;
      $('loading-state').hidden = true;
      $('error-state').hidden = false;
    } finally {
      clearTimeout(timeout);
      if (sequence === loadSequence) {
        loading = false;
        loadController = null;
        $('unit-list').setAttribute('aria-busy', 'false');
      }
    }
  }

  function registerServiceWorker() {
    if (serviceWorkerRequested || !('serviceWorker' in navigator) || !window.isSecureContext) return;
    serviceWorkerRequested = true;
    // Failure leaves the online study experience intact; no external fallback.
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }

  applyLocale();
  bindEvents();
  updateConnection();
  updateDrawerAccessibility();
  loadCorpus(activeCollection, { target: hashTarget() });
})();

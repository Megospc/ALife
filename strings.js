const languagesStrings = {
  "ru": {
    setupHeader: "Настройки",
    setupSeedHeader: "Семя",
    setupSeedNew: "новое",
    setupSizeHeader: "Размер поля",
    setupSizeValues: [
      "50x50 (Крошечный)",
      "100x100 (Очень маленький)",
      "200x200 (Маленький)",
      "300x300 (Небольшой)",
      "400x400 (Стандартный)",
      "600x600 (Крупный)",
      "800x800 (Большой)",
      "1200x1200 (Оргомный)",
      "1800x1800 (Гигантский)"
    ],
    setupSunHeader: "Уровень солнца",
    setupSunValues: [
      "100 (Критически низкий)",
      "200 (Очень низкий)",
      "300 (Низкий)",
      "500 (Стандартный)",
      "750 (Высокий)",
      "1000 (Очень высокий)",
      "2000 (Максимальный)"
    ],
    setupDensityHeader: "Инзначальная плотность",
    setupDensityValues: [
      "1/3 (Критически высокая)",
      "1/4 (Очень высокая)",
      "1/6 (Высокая)",
      "1/9 (Стандартная)",
      "1/16 (Ниже стандартной)",
      "1/25 (Низкая)",
      "1/36 (Очень низкая)",
      "1/50 (Критически низкая)"
    ],
    setupResourcesHeader: "Органика, заряд",
    setupResourcesValues: [
      "5, 1K (Критически мало)",
      "10, 2K (Очень мало)",
      "25, 5K (Мало)",
      "50, 10K (Стандартные)",
      "100, 20K (Много)",
      "150, 30K (Очень много)",
      "200, 40K (Критически много)"
    ],
    setupStart: "запуск",
    
    zoom: "Приближение",
    speed: "Скорость",
    pause: "пауза",
    continue: "продолжить",
    tocenter: "в центр",
    snapshot: "снимок",
    iteration: "Итерация",
    population: "Живых клеток",
    fps: "FPS",
    rendermodeHeader: "Режим отрисовки",
    rendermodeValues: [
      "По умолчанию",
      "Энергия",
      "Клан",
      "Ничего"
    ],
    groundmodeHeader: "Режим отрисовки земли",
    groundmodeValues: [
      "По умолчанию",
      "Органика",
      "Заряд",
      "Ничего"
    ],
    infoCopy: "копировать",
    infoHide: "скрыть",
    renderoff: "Без отрисовки",
    rendertime: "Время отрисовки",
    handletime: "Время обработки",
    seed: "Семя",
    ms: "мс",
    
    infoTypes: [
      "ДРЕВЕСИНА",
      "ОТРОСТОК",
      "СЕМЕЧКО",
      "СЕМЕЧКО",
      "ЛИСТ",
      "КОРЕНЬ",
      "АНТЕННА"
    ],
    infoEnergyHeader: "Энергия",
    infoGenomeHeader: "Геном",
    infoCurrentHeader: "Тек. команда",
    infoCurprogHeader: "Тек. программа",
    infoMutationsHeader: "Кол-во мутаций",
    infoShootHeader: "Отстрел",
    infoParentHeader: "Родитель",
    infoPlaceidHeader: "Приоритет",
    infoClanHeader: "Клан",
    infoAngleHeader: "Направление",
    infoPosHeader: "Координаты",
    infoOrganicHeader: "Органика",
    infoChargeHeader: "Заряд",
    infoSunHeader: "Солнце",
    
    language: "Сменить язык",
    
    angleNames: ["СЕВЕР", "ВОСТОК", "ЮГ", "ЗАПАД"],
    
    memoryAsk: (reqmem) => `Необходимо ${filesizeString(reqmem)} оперативной памяти. Запустить?`
  },
  "en": {
    setupHeader: "Settings",
    setupSeedHeader: "Seed",
    setupSeedNew: "generate",
    setupSizeHeader: "Field size",
    setupSizeValues: [
      "50x50 (Tiny)",
      "100x100 (Very small)",
      "200x200 (Small)",
      "300x300 (Not big)",
      "400x400 (Standard)",
      "600x600 (Large)",
      "800x800 (Big)",
      "1200x1200 (Huge)",
      "1800x1800 (Giant)"
    ],
    setupSunHeader: "Sun level",
    setupSunValues: [
      "100 (Critically low)",
      "200 (Very low)",
      "300 (Low)",
      "500 (Standard)",
      "750 (High)",
      "1000 (Very high)",
      "2000 (Maximum)"
    ],
    setupDensityHeader: "Initial density",
    setupDensityValues: [
      "1/3 (Critically high)",
      "1/4 (Very high)",
      "1/6 (High)",
      "1/9 (Standard)",
      "1/16 (Below standard)",
      "1/25 (Low)",
      "1/36 (Very low)",
      "1/50 (Critically low)"
    ],
    setupResourcesHeader: "Organic, charge",
    setupResourcesValues: [
      "5, 1K (Critically few)",
      "10, 2K (Too few)",
      "25, 5K (Few)",
      "50, 10K (Standard)",
      "100, 20K (Many of)",
      "150, 30K (Too many)",
      "200, 40K (Critically many)"
    ],
    setupStart: "start",
    
    zoom: "Zoom",
    speed: "Speed",
    pause: "pause",
    continue: "continue",
    tocenter: "to center",
    snapshot: "snapshot",
    iteration: "Iteration",
    population: "Cells alive",
    fps: "FPS",
    rendermodeHeader: "Rendering mode",
    rendermodeValues: [
      "Default",
      "Energy",
      "Clan",
      "Nothing"
    ],
    groundmodeHeader: "Background rendering mode",
    groundmodeValues: [
      "Default",
      "Organic",
      "Charge",
      "Nothing"
    ],
    infoCopy: "copy",
    infoHide: "hide",
    renderoff: "No rendering",
    rendertime: "Rendering time",
    handletime: "Processing time",
    seed: "Seed",
    ms: "ms",
    
    infoTypes: [
      "WOOD",
      "SPROUT",
      "SEED",
      "SEED",
      "LEAF",
      "ROOT",
      "AERIAL"
    ],
    infoEnergyHeader: "Energy",
    infoGenomeHeader: "Genome",
    infoCurrentHeader: "Current instruction",
    infoCurprogHeader: "Current program",
    infoMutationsHeader: "Number of mutations",
    infoShootHeader: "Shooting",
    infoParentHeader: "Parent",
    infoPlaceidHeader: "Priority",
    infoClanHeader: "Clan",
    infoAngleHeader: "Direction",
    infoPosHeader: "Coordinates",
    infoOrganicHeader: "Organic",
    infoChargeHeader: "Charge",
    infoSunHeader: "Sun",
    
    language: "Change language",
    
    angleNames: ["NORTH", "EAST", "SOUTH", "WEST"],
    
    memoryAsk: (reqmem) => `It needs ${filesizeString(reqmem)} of RAM. Do you want to start?`
  }
};
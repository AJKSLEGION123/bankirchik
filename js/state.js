// C:\AIJob_Hunter\study_bankirchik\bankirchik\js\state.js
// Единый менеджер состояния приложения «Банкирчик»

const BANKIR_STORAGE_KEY = "bankirchik_state_v2";

const DEFAULT_BANKIR_STATE = {
  // Семья и профиль
  familyCode: "BNK-777",
  childName: "Алихан",
  childAge: 9,
  hamsterName: "Буся",
  equippedAccessory: "hat_banker",
  isPremium: false,
  unlockedIsland: 1,

  // Баланс монет Б
  wallet: 6,  // В кошельке
  piggy: 12,  // В копилке

  // Звёзды за острова (массив id пройденных островов)
  stars: [1],

  // Вложенная структура для совместимости с прототипом
  child: {
    name: "Алихан",
    age: 9,
    hamsterName: "Буся",
    equippedItem: "hat_banker",
    soundEnabled: true,
    voyage: 1,
    unlockedIslands: [1],
    completedLevels: {}
  },

  // Список заданий от родителей
  tasks: [
    { id: "task_1", title: "Застелить кровать и убрать подушку", reward: 1, status: "completed" },
    { id: "task_2", title: "Убрать игрушки с пола в ящик", reward: 2, status: "review" },
    { id: "task_3", title: "Помочь маме накрыть на ужин", reward: 2, status: "pending" }
  ],

  // Цели накопления
  goals: [
    { id: "goal_1", title: "Конструктор LEGO", targetAmount: 30, currentAmount: 12 }
  ],

  // Купленные мечты и наклейки
  purchasedDreams: [],
  purchasedStickers: ["hat_banker"],

  // Аналитика для родителя
  analytics: {
    weeklyMinutes: 45,
    gamesPlayed: 12,
    patienceScore: 85,
    budgetingScore: 70
  },

  // Чат с AI-ассистентом для родителей
  aiChatHistory: [
    {
      role: "assistant",
      text: "Здравствуйте! Я ваш финансовый AI-консультант «Банкирчик». Помогу выстроить здоровые отношения с деньгами в семье. О чём хотите узнать?"
    }
  ]
};

class StateManagerClass {
  constructor() {
    this.listeners = [];
    this.data = this.load();
    this.syncChildData();
  }

  syncChildData() {
    if (!this.data.child) {
      this.data.child = {};
    }
    this.data.child.name = this.data.childName || "Алихан";
    this.data.child.age = this.data.childAge || 9;
    this.data.child.hamsterName = this.data.hamsterName || "Буся";
    this.data.child.equippedItem = this.data.equippedAccessory || "hat_banker";
    this.data.child.soundEnabled = true;
    if (!this.data.child.voyage) this.data.child.voyage = 1;
    if (!this.data.child.unlockedIslands) this.data.child.unlockedIslands = [this.data.unlockedIsland || 1];
    if (!this.data.child.completedLevels) this.data.child.completedLevels = {};
  }

  load() {
    try {
      const raw = localStorage.getItem(BANKIR_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return Object.assign({}, DEFAULT_BANKIR_STATE, parsed);
      }
    } catch (e) {
      console.warn("Storage load error:", e);
    }
    return JSON.parse(JSON.stringify(DEFAULT_BANKIR_STATE));
  }

  save() {
    try {
      this.syncChildData();
      localStorage.setItem(BANKIR_STORAGE_KEY, JSON.stringify(this.data));
    } catch (e) {
      console.warn("Storage save error:", e);
    }
  }

  get() {
    return this.data;
  }

  update(patch) {
    Object.assign(this.data, patch);
    this.syncChildData();
    this.save();
    this.notify();
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    for (const fn of this.listeners) {
      try { fn(this.data); } catch (e) { console.error(e); }
    }
  }

  // Финансовые операции
  addWallet(amount, reason = "") {
    this.data.wallet = Math.max(0, this.data.wallet + Number(amount));
    this.save();
    this.notify();
  }

  addPiggy(amount, reason = "") {
    this.data.piggy = Math.max(0, this.data.piggy + Number(amount));
    this.save();
    this.notify();
  }

  transferToPiggy(amount = 1) {
    if (this.data.wallet >= amount) {
      this.data.wallet -= amount;
      this.data.piggy += amount;
      this.save();
      this.notify();
      return true;
    }
    return false;
  }

  // Совместимость с играми: completeLevel & addTransaction
  completeLevel(islandId, levelNum, reward = 0) {
    if (reward > 0) {
      this.addWallet(reward, `Остров ${islandId}, уровень ${levelNum}`);
    }
    if (!this.data.stars.includes(Number(islandId))) {
      this.data.stars.push(Number(islandId));
    }
    const nextIsland = Number(islandId) + 1;
    if (nextIsland > this.data.unlockedIsland && nextIsland <= 8) {
      this.data.unlockedIsland = nextIsland;
    }
    if (this.data.child && !this.data.child.unlockedIslands.includes(nextIsland) && nextIsland <= 8) {
      this.data.child.unlockedIslands.push(nextIsland);
    }
    this.save();
    this.notify();
  }

  addTransaction(target = "wallet", amount = 0, category = "", desc = "") {
    if (target === "wallet") {
      this.addWallet(amount, desc);
    } else if (target === "piggy") {
      this.addPiggy(amount, desc);
    }
  }

  unlockIsland(id) {
    const num = Number(id);
    if (num > this.data.unlockedIsland && num <= 8) {
      this.data.unlockedIsland = num;
      if (this.data.child && !this.data.child.unlockedIslands.includes(num)) {
        this.data.child.unlockedIslands.push(num);
      }
      this.save();
      this.notify();
    }
  }

  // Задания от родителей
  addTask(title, reward) {
    const newTask = {
      id: "task_" + Date.now(),
      title: title,
      reward: Number(reward),
      status: "pending"
    };
    this.data.tasks.unshift(newTask);
    this.save();
    this.notify();
    return newTask;
  }

  markTaskDoneByChild(taskId) {
    const task = this.data.tasks.find(t => t.id === taskId);
    if (task && task.status === "pending") {
      task.status = "review";
      this.save();
      this.notify();
      return true;
    }
    return false;
  }

  confirmTaskByParent(taskId) {
    const task = this.data.tasks.find(t => t.id === taskId);
    if (task && task.status === "review") {
      task.status = "completed";
      this.addWallet(task.reward, `Награда за: ${task.title}`);
      this.save();
      this.notify();
      return true;
    }
    return false;
  }

  rejectTaskByParent(taskId) {
    const task = this.data.tasks.find(t => t.id === taskId);
    if (task && task.status === "review") {
      task.status = "pending";
      this.save();
      this.notify();
      return true;
    }
    return false;
  }

  // Покупка мечты / наклейки
  purchaseDream(dreamId, cost) {
    if (this.data.piggy >= cost && !this.data.purchasedDreams.includes(dreamId)) {
      this.data.piggy -= cost;
      this.data.purchasedDreams.push(dreamId);
      this.save();
      this.notify();
      return true;
    }
    return false;
  }

  purchaseSticker(stickerId, cost) {
    if (this.data.wallet >= cost && !this.data.purchasedStickers.includes(stickerId)) {
      this.data.wallet -= cost;
      this.data.purchasedStickers.push(stickerId);
      this.save();
      this.notify();
      return true;
    }
    return false;
  }

  equipAccessory(accId) {
    this.data.equippedAccessory = accId;
    if (this.data.child) {
      this.data.child.equippedItem = accId;
    }
    this.save();
    this.notify();
  }

  activatePremium() {
    this.data.isPremium = true;
    this.save();
    this.notify();
  }
}

// Экспорт единого синглтона в обе переменные для полной совместимости
if (typeof window !== "undefined") {
  const instance = new StateManagerClass();
  window.StateManager = instance;
  window.bankirState = instance;
}

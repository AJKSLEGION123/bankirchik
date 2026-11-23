// C:\Bankirchik\js\app.js
// Главное приложение «Банкирчик» (MVP)
// Архитектура: Single Page Application (PWA) с роутингом по экранам,
// поддержкой режимов «Ребёнок» и «Родитель», защитой Adult Lock (умножение),
// интеграцией 11 игр, интерактивной картой сокровищ, витриной мечты, альбомом наклеек
// и родительским кабинетом с Kaspi Pay и AI-ассистентом.

class BankirchikApp {
  constructor() {
    this.currentRole = 'child'; // 'child' | 'parent'
    this.childTab = 'map';      // 'map' | 'games' | 'tasks' | 'me'
    this.parentTab = 'dashboard'; // 'dashboard' | 'tasks' | 'analytics' | 'assistant' | 'premium'
    this.activeGameInstance = null;
    this.currentIslandId = 1;

    this.init();
  }

  init() {
    // Проверяем, зарегистрирован ли уже родитель/семья
    const state = window.StateManager.get();
    if (!state.familyCode) {
      this.renderScreen('splash');
    } else {
      this.renderScreen('child_home');
    }

    // Подписываемся на обновления состояния
    window.StateManager.subscribe(() => {
      this.updateHeaderStats();
    });
  }

  // --- Навигация и роутер ---
  renderScreen(screenName, params = {}) {
    const appEl = document.getElementById('app');
    if (!appEl) return;

    // Сброс текущей игры при смене экрана
    if (this.activeGameInstance) {
      this.activeGameInstance = null;
    }

    switch (screenName) {
      case 'splash':
        this.renderSplashScreen(appEl);
        break;
      case 'role_select':
        this.renderRoleSelectScreen(appEl);
        break;
      case 'child_login':
        this.renderChildLoginScreen(appEl);
        break;
      case 'parent_register':
        this.renderParentRegisterScreen(appEl);
        break;
      case 'child_home':
        this.renderChildHomeScreen(appEl);
        break;
      case 'parent_home':
        this.renderParentHomeScreen(appEl);
        break;
      case 'game_play':
        this.renderGamePlayScreen(appEl, params.islandId, params.gameKey);
        break;
      default:
        this.renderChildHomeScreen(appEl);
    }
  }

  // --- 01. Заставка (Splash) ---
  renderSplashScreen(el) {
    el.innerHTML = `
      <div class="screen-view splash-screen" style="display: flex; flex-direction: column; justify-content: space-between; align-items: center; min-height: 100vh; padding: 40px 20px; text-align: center;">
        <div style="margin-top: 40px;">
          <div style="font-size: 80px; filter: drop-shadow(0 8px 12px rgba(0,0,0,0.15)); animation: float 3s ease-in-out infinite;">🐹💰</div>
          <h1 style="font-size: 38px; font-weight: 900; color: var(--color-red); margin-top: 10px; text-shadow: 0 2px 0 #fff;">Банкирчик</h1>
          <p style="font-size: 16px; font-weight: 800; color: var(--color-ink); margin-top: 8px;">
            Учимся дружить с деньгами играючи!
          </p>
        </div>

        <div style="background: rgba(255,255,255,0.7); backdrop-filter: blur(10px); border-radius: 20px; padding: 18px; margin: 20px 0; border: 2px solid #FFE680;">
          <div style="font-size: 14px; font-weight: 800; color: var(--color-ink);">
            ✨ 8 островов приключений<br>
            🎯 Копи на настоящую мечту<br>
            👨‍👩‍👧 Играй вместе с родителями
          </div>
        </div>

        <div style="width: 100%; max-width: 320px; margin-bottom: 20px;">
          <button class="btn btn-primary" id="btn-start" style="width: 100%; font-size: 18px; padding: 16px;">
            Поехали! 🚀
          </button>
        </div>
      </div>
    `;

    el.querySelector('#btn-start').addEventListener('click', () => {
      if (window.AudioController) window.AudioController.click();
      this.renderScreen('role_select');
    });
  }

  // --- 02. Выбор роли ---
  renderRoleSelectScreen(el) {
    el.innerHTML = `
      <div class="screen-view" style="display: flex; flex-direction: column; justify-content: center; min-height: 100vh; padding: 24px; text-align: center;">
        <h2 style="font-size: 26px; font-weight: 900; color: var(--color-ink); margin-bottom: 8px;">Кто ты сегодня?</h2>
        <p style="font-size: 14px; color: var(--color-muted); margin-bottom: 28px;">Выбери режим входа в приложение</p>

        <div style="display: flex; flex-direction: column; gap: 16px; max-width: 340px; margin: 0 auto; width: 100%;">
          <!-- Карточка ребёнка -->
          <div class="card card-actionable" id="role-child-btn" style="padding: 20px; text-align: center; border: 3px solid #FFC21A; background: #FFFDF5;">
            <div style="font-size: 52px; margin-bottom: 8px;">🧒🚀</div>
            <h3 style="font-size: 20px; font-weight: 900; color: var(--color-ink);">Я — Ребёнок</h3>
            <p style="font-size: 13px; color: var(--color-muted); margin-top: 4px;">Буду проходить острова, копить монеты Б и кормить хомяка</p>
          </div>

          <!-- Карточка родителя -->
          <div class="card card-actionable" id="role-parent-btn" style="padding: 20px; text-align: center; border: 3px solid #E63946; background: #FFF9F9;">
            <div style="font-size: 52px; margin-bottom: 8px;">👩‍🦰📋</div>
            <h3 style="font-size: 20px; font-weight: 900; color: var(--color-ink);">Я — Родитель</h3>
            <p style="font-size: 13px; color: var(--color-muted); margin-top: 4px;">Давать задания, следить за прогрессом и советоваться с AI</p>
          </div>
        </div>
      </div>
    `;

    el.querySelector('#role-child-btn').addEventListener('click', () => {
      if (window.AudioController) window.AudioController.click();
      this.renderScreen('child_login');
    });

    el.querySelector('#role-parent-btn').addEventListener('click', () => {
      if (window.AudioController) window.AudioController.click();
      this.renderScreen('parent_register');
    });
  }

  // --- C01. Вход ребёнка ---
  renderChildLoginScreen(el) {
    el.innerHTML = `
      <div class="screen-view" style="display: flex; flex-direction: column; justify-content: center; min-height: 100vh; padding: 24px; text-align: center;">
        <div style="font-size: 60px; margin-bottom: 10px;">🐹🔑</div>
        <h2 style="font-size: 24px; font-weight: 900; margin-bottom: 6px;">Вход для ребёнка</h2>
        <p style="font-size: 13px; color: var(--color-muted); margin-bottom: 20px;">
          Введи код семьи из 6 знаков от родителей или выбери имя хомяку!
        </p>

        <div class="card" style="padding: 20px; text-align: left; max-width: 340px; margin: 0 auto; width: 100%;">
          <label style="font-size: 12px; font-weight: 800; color: var(--color-muted); text-transform: uppercase;">Код семьи</label>
          <input type="text" id="family-code-input" value="FAMILY" maxlength="8" style="width: 100%; font-size: 20px; font-weight: 900; text-align: center; letter-spacing: 4px; text-transform: uppercase; padding: 12px; border: 2px solid #FFC21A; border-radius: 14px; margin: 8px 0 16px 0; outline: none;">

          <label style="font-size: 12px; font-weight: 800; color: var(--color-muted); text-transform: uppercase;">Имя твоего хомяка</label>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 8px; margin-bottom: 20px;">
            <button class="btn btn-secondary name-choice-btn active" data-name="Буся">🐹 Буся</button>
            <button class="btn btn-secondary name-choice-btn" data-name="Хома">🐹 Хома</button>
            <button class="btn btn-secondary name-choice-btn" data-name="Пухлик">🐹 Пухлик</button>
            <button class="btn btn-secondary name-choice-btn" data-name="Монетка">🐹 Монетка</button>
          </div>

          <button class="btn btn-primary" id="btn-child-enter" style="width: 100%;">Войти в игру 🎮</button>
          <button class="btn btn-secondary" id="btn-back-to-roles" style="width: 100%; margin-top: 8px; font-size: 12px;">Назад</button>
        </div>
      </div>
    `;

    let selectedHamsterName = 'Буся';
    const nameBtns = el.querySelectorAll('.name-choice-btn');
    nameBtns.forEach(b => {
      b.addEventListener('click', () => {
        nameBtns.forEach(x => x.classList.remove('active'));
        b.classList.add('active');
        selectedHamsterName = b.dataset.name;
      });
    });

    el.querySelector('#btn-child-enter').addEventListener('click', () => {
      const code = el.querySelector('#family-code-input').value.trim() || 'FAMILY';
      window.StateManager.update({
        familyCode: code.toUpperCase(),
        childName: 'Алихан',
        hamsterName: selectedHamsterName
      });
      if (window.AudioController) {
        window.AudioController.win();
        window.AudioController.speak(`Привет! Я твой хомяк ${selectedHamsterName}! Погнали на карту сокровищ!`);
      }
      this.currentRole = 'child';
      this.renderScreen('child_home');
    });

    el.querySelector('#btn-back-to-roles').addEventListener('click', () => {
      this.renderScreen('role_select');
    });
  }

  // --- P01. Регистрация родителя ---
  renderParentRegisterScreen(el) {
    el.innerHTML = `
      <div class="screen-view" style="display: flex; flex-direction: column; justify-content: center; min-height: 100vh; padding: 24px;">
        <h2 style="font-size: 24px; font-weight: 900; color: var(--color-ink); text-align: center; margin-bottom: 6px;">Кабинет Родителя</h2>
        <p style="font-size: 13px; color: var(--color-muted); text-align: center; margin-bottom: 20px;">
          Создайте профиль семьи для управления заданиями и отслеживания прогресса
        </p>

        <div class="card" style="padding: 20px; max-width: 360px; margin: 0 auto; width: 100%;">
          <label style="font-size: 12px; font-weight: 800; color: var(--color-muted);">ВАШ ТЕЛЕФОН (ДЛЯ КАСПИ / SMS)</label>
          <input type="tel" id="parent-phone" value="+7 (701) 555-01-99" style="width: 100%; padding: 10px; border-radius: 12px; border: 2px solid #EAC54F; margin: 6px 0 14px 0; font-size: 14px;">

          <label style="font-size: 12px; font-weight: 800; color: var(--color-muted);">ИМЯ РЕБЁНКА</label>
          <input type="text" id="parent-child-name" value="Алихан" style="width: 100%; padding: 10px; border-radius: 12px; border: 2px solid #EAC54F; margin: 6px 0 14px 0; font-size: 14px;">

          <label style="font-size: 12px; font-weight: 800; color: var(--color-muted);">ВОЗРАСТ РЕБЁНКА</label>
          <select id="parent-child-age" style="width: 100%; padding: 10px; border-radius: 12px; border: 2px solid #EAC54F; margin: 6px 0 20px 0; font-size: 14px;">
            <option value="7">7 лет</option>
            <option value="8">8 лет</option>
            <option value="9" selected>9 лет</option>
            <option value="10">10 лет</option>
            <option value="11">11 лет</option>
            <option value="12">12 лет</option>
          </select>

          <button class="btn btn-primary" id="btn-save-parent" style="width: 100%;">Создать семью и войти</button>
          <button class="btn btn-secondary" id="btn-back-parent" style="width: 100%; margin-top: 8px; font-size: 12px;">Назад</button>
        </div>
      </div>
    `;

    el.querySelector('#btn-save-parent').addEventListener('click', () => {
      const childName = el.querySelector('#parent-child-name').value.trim() || 'Алихан';
      const age = parseInt(el.querySelector('#parent-child-age').value) || 9;
      window.StateManager.update({
        familyCode: 'KZ' + Math.floor(1000 + Math.random() * 9000),
        childName: childName,
        childAge: age
      });
      if (window.AudioController) window.AudioController.win();
      this.currentRole = 'parent';
      this.renderScreen('parent_home');
    });

    el.querySelector('#btn-back-parent').addEventListener('click', () => {
      this.renderScreen('role_select');
    });
  }

  // --- C02–C19. Главный экран Ребёнка (С нижней панелью Карта · Игры · От мамы · Я) ---
  renderChildHomeScreen(el) {
    const state = window.StateManager.get();

    el.innerHTML = `
      <div class="screen-view child-dashboard" style="display: flex; flex-direction: column; height: 100%; position: relative; overflow: hidden;">
        <!-- Верхняя шапка ребёнка -->
        <header class="app-header">
          <div class="user-badge-left">
            <div class="user-avatar-circle">🐹</div>
            <div class="user-info-text">
              <div class="user-name">${state.childName}</div>
              <div class="user-sub">Хомяк: ${state.hamsterName}</div>
            </div>
          </div>

          <div class="purse-row">
            <div class="pill-badge" id="header-wallet-badge" title="Монеты в кошельке">
              <span>👛</span>
              <strong id="badge-wallet-val">${state.wallet} Б</strong>
            </div>
            <div class="pill-badge piggy-pill" id="header-piggy-badge" title="Монеты в копилке">
              <span>🐷</span>
              <strong id="badge-piggy-val">${state.piggy} Б</strong>
            </div>
            <button class="btn-3d btn-secondary btn-small" id="btn-open-adult-lock" title="Родительский замок">
              🔒 Маме
            </button>
          </div>
        </header>

        <!-- Центральная область контента вкладки с прокруткой -->
        <main id="child-tab-content" class="screen-scroll">
          <!-- Контент рендерится методом renderChildTab -->
        </main>

        <!-- Виджет Хомяка-помощника внизу -->
        <div id="hamster-mascot-container"></div>

        <!-- Нижняя навигационная панель C02 (Карта · Игры · От мамы · Я) -->
        <nav class="bottom-tab-bar">
          <button class="nav-tab-btn ${this.childTab === 'map' ? 'active' : ''}" data-tab="map">
            <span class="tab-icon">🗺️</span>
            <span>Карта</span>
          </button>
          <button class="nav-tab-btn ${this.childTab === 'games' ? 'active' : ''}" data-tab="games">
            <span class="tab-icon">🎮</span>
            <span>Игры</span>
          </button>
          <button class="nav-tab-btn ${this.childTab === 'tasks' ? 'active' : ''}" data-tab="tasks">
            <span class="tab-icon">💌</span>
            <span>От мамы</span>
            ${state.tasks.some(t => t.status === 'pending') ? '<span class="tab-badge-dot"></span>' : ''}
          </button>
          <button class="nav-tab-btn ${this.childTab === 'me' ? 'active' : ''}" data-tab="me">
            <span class="tab-icon">👑</span>
            <span>Я</span>
          </button>
        </nav>
      </div>
    `;

    // Инициализация виджета хомяка
    const mascotContainer = el.querySelector('#hamster-mascot-container');
    this.hamsterWidget = new HamsterMascot(mascotContainer);
    this.hamsterWidget.render();

    // Обработчики нижней навигации
    const navItems = el.querySelectorAll('.bottom-tab-bar .nav-tab-btn');
    navItems.forEach(item => {
      item.addEventListener('click', () => {
        if (window.AudioController) window.AudioController.click();
        navItems.forEach(x => x.classList.remove('active'));
        item.classList.add('active');
        this.childTab = item.dataset.tab;
        this.renderChildTab(el.querySelector('#child-tab-content'));
      });
    });

    // Обработчик родительского замка (Adult Lock)
    el.querySelector('#btn-open-adult-lock').addEventListener('click', () => {
      this.showAdultLockModal();
    });

    // Рендерим текущую вкладку
    this.renderChildTab(el.querySelector('#child-tab-content'));
  }

  updateHeaderStats() {
    const state = window.StateManager.get();
    const w = document.getElementById('badge-wallet-val');
    const p = document.getElementById('badge-piggy-val');
    if (w) w.textContent = `${state.wallet} Б`;
    if (p) p.textContent = `${state.piggy} Б`;
  }

  // --- Вкладки ребёнка ---
  renderChildTab(container) {
    switch (this.childTab) {
      case 'map':
        this.renderMapTab(container);
        break;
      case 'games':
        this.renderGamesCatalogTab(container);
        break;
      case 'tasks':
        this.renderTasksTab(container);
        break;
      case 'me':
        this.renderMeTab(container);
        break;
    }
  }

  // Вкладка 1: Карта сокровищ (8 островов по пиратской тропе)
  renderMapTab(container) {
    const state = window.StateManager.get();
    const islands = window.BankirchikData.islands;

    // Сбалансированные координаты островов по пиратской тропе (снизу вверх: остров 1 -> 8)
    const positions = [
      [32, 89], // 1. Чистый дом
      [68, 78], // 2. Фруктовый сад
      [30, 67], // 3. Свинья-копилка
      [70, 55], // 4. Рынок
      [32, 43], // 5. Нужно/Хочу
      [68, 31], // 6. Остров терпения
      [34, 19], // 7. Первый банк
      [50, 7]   // 8. Финал: Сундук сокровищ
    ];

    let islandsHtml = '';
    islands.forEach((island, idx) => {
      const pos = positions[idx] || [50, 50];
      const isUnlocked = island.id <= state.unlockedIsland;
      const isCurrent = island.id === state.unlockedIsland;
      const hasStar = state.stars.includes(island.id);
      const cls = isCurrent ? 'now' : hasStar ? 'done' : isUnlocked ? 'open' : 'locked';

      islandsHtml += `
        <button class="island-btn ${cls}" data-island-id="${island.id}" style="left:${pos[0]}%; top:${pos[1]}%;" title="${island.title}">
          <div class="island-icon-inner">${island.icon}</div>
          <div class="island-label">${island.id}. ${island.title}</div>
          ${isCurrent ? '<span class="hamster-avatar-top">🐹</span>' : ''}
          ${!isUnlocked ? '<span class="lock-badge">🔒</span>' : ''}
        </button>
      `;
    });

    container.innerHTML = `
      <div style="padding-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
          <div>
            <h2 style="font-size: 22px; font-weight: 900; color: var(--ink); line-height: 1.1;">Карта Сокровищ 🗺️</h2>
            <p style="font-size: 12px; font-weight: 800; color: var(--muted); margin-top: 2px;">Пройди 8 островов и открой сундук знаний!</p>
          </div>
          <div class="pill-badge" style="font-size: 13px;">
            ⭐ ${state.stars.length} / 8
          </div>
        </div>

        <!-- Пиратская карта с сочной красной тропой -->
        <div class="pirate-map-wrapper">
          <div class="map-decor-compass" title="Роза ветров">🧭</div>
          <div class="map-decor-ship" title="Пиратский корабль">⛵</div>
          <div class="map-decor-palms" title="Пальмы">🌴</div>
          <div style="position: absolute; left: 50%; top: 3.5%; transform: translateX(-50%); font-size: 12px; font-weight: 900; color: var(--red); background: rgba(255,255,255,0.95); padding: 2px 8px; border-radius: 10px; border: 1.5px solid var(--red); z-index: 12;">
            🏆 ФИНИШ
          </div>

          <svg class="map-svg-path" viewBox="0 0 100 100" preserveAspectRatio="none">
            <!-- Плавная тропа по точкам островов -->
            <path d="M 32 89 C 55 86, 68 83, 68 78 C 68 72, 30 73, 30 67 C 30 61, 70 61, 70 55 C 70 49, 32 49, 32 43 C 32 37, 68 37, 68 31 C 68 25, 34 25, 34 19 C 34 13, 50 12, 50 7" 
                  fill="none" stroke="#E63946" stroke-width="3" stroke-dasharray="4 4" stroke-linecap="round"/>
          </svg>
          ${islandsHtml}
        </div>
      </div>
    `;

    // Клик по открытому острову запускает игру
    container.querySelectorAll('.island-btn').forEach(btn => {
      const islandId = parseInt(btn.dataset.islandId);
      btn.addEventListener('click', () => {
        if (islandId <= state.unlockedIsland) {
          if (window.AudioController) window.AudioController.click();
          this.launchIslandGame(islandId);
        } else {
          if (window.AudioController) {
            window.AudioController.error();
            window.AudioController.speak('Этот остров пока закрыт. Пройди предыдущие острова сокровищ!');
          }
        }
      });
    });

    if (this.hamsterWidget) {
      this.hamsterWidget.say(`Остров ${state.unlockedIsland} светится! Жми на него, погнали!`);
    }

    // Автоматическая прокрутка к текущему острову, чтобы ребёнок сразу видел свой активный уровень
    setTimeout(() => {
      const currentIslandEl = container.querySelector('.island-btn.now');
      if (currentIslandEl) {
        currentIslandEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        container.scrollTop = container.scrollHeight;
      }
    }, 150);
  }

  // Вкладка 2: Каталог всех 11 игр
  renderGamesCatalogTab(container) {
    const games = [
      { id: 1, key: 'clean_house', title: 'Уборка комнаты 🧹', island: 'Остров 1', desc: 'Заработай первые монеты Б за наведение порядка' },
      { id: 2, key: 'fruit_garden', title: 'Фруктовый сад 🍎', island: 'Остров 2', desc: 'Лови падающие фрукты в корзину и продавай урожай' },
      { id: 3, key: 'piggy_bank', title: 'Свинья-копилка 🐷', island: 'Остров 3', desc: 'Учись откладывать карманные деньги в копилку' },
      { id: 4, key: 'market', title: 'Супермаркет 🛒', island: 'Остров 4', desc: 'Купи продукты строго по списку и забери сдачу' },
      { id: 5, key: 'need_want', title: 'Нужно или хочу? 🎯', island: 'Остров 5', desc: 'Различай базовые потребности и сиюминутные хотелки' },
      { id: 6, key: 'patience_island', title: 'Остров терпения ⏳', island: 'Остров 6', desc: 'Не нажимай на печеньку 20 секунд и получи x2 награду' },
      { id: 7, key: 'first_bank', title: 'Первый банк 🏦', island: 'Остров 7', desc: 'Симулятор вклада на 6 недель: накопи на крутой велик' },
      { id: 8, key: 'treasure_chest', title: 'Сундук сокровищ 💎', island: 'Остров 8', desc: 'Финал путешествия! 3 ключа и проверка знаний' },
      { id: 9, key: 'lemonade_stand', title: 'Лимонадный ларёк 🍋', island: 'Бонус', desc: 'Управляй бизнесом 5 дней: рецепт, погода и прибыль' },
      { id: 10, key: 'exact_sum', title: 'Точная сумма 🪙', island: 'Тренировка', desc: 'Набирай монетами ровную сумму без сдачи' },
      { id: 11, key: 'infinite_quiz', title: 'Бесконечная викторина ❓', island: 'Бонус', desc: 'Отвечай на финансовые вопросы и зарабатывай Б' }
    ];

    let html = `
      <div style="margin-bottom: 14px;">
        <h2 style="font-size: 22px; font-weight: 900; color: var(--color-ink);">Игровая Комната 🎮</h2>
        <p style="font-size: 12px; color: var(--color-muted);">Все 11 финансовых тренажёров в одном месте</p>
      </div>
      <div style="display: flex; flex-direction: column; gap: 10px;">
    `;

    games.forEach(g => {
      html += `
        <div class="card card-actionable" data-game-key="${g.key}" data-island-id="${g.id}" style="display: flex; justify-content: space-between; align-items: center; padding: 12px 16px;">
          <div>
            <span style="font-size: 10px; font-weight: 800; color: var(--color-red); text-transform: uppercase;">${g.island}</span>
            <h4 style="font-size: 15px; font-weight: 900; margin: 2px 0;">${g.title}</h4>
            <p style="font-size: 11px; color: var(--color-muted); margin: 0;">${g.desc}</p>
          </div>
          <button class="btn btn-primary" style="padding: 8px 12px; font-size: 12px; white-space: nowrap;">Играть</button>
        </div>
      `;
    });

    html += `</div>`;
    container.innerHTML = html;

    container.querySelectorAll('.card-actionable').forEach(card => {
      card.addEventListener('click', () => {
        const key = card.dataset.gameKey;
        const islandId = parseInt(card.dataset.islandId);
        this.renderScreen('game_play', { islandId: islandId, gameKey: key });
      });
    });
  }

  // Вкладка 3: От мамы (Задания C08)
  renderTasksTab(container) {
    const state = window.StateManager.get();
    const tasks = state.tasks || [];

    let tasksHtml = '';
    if (tasks.length === 0) {
      tasksHtml = `
        <div class="card" style="text-align: center; padding: 30px 20px;">
          <div style="font-size: 48px; margin-bottom: 10px;">💌</div>
          <h3 style="font-size: 18px; font-weight: 900;">Заданий пока нет!</h3>
          <p style="font-size: 13px; color: var(--color-muted); margin-top: 6px;">
            Попроси маму или папу добавить тебе полезное задание за вознаграждение в Б!
          </p>
        </div>
      `;
    } else {
      tasks.forEach(task => {
        const isDone = task.status === 'completed';
        const isReview = task.status === 'review';

        tasksHtml += `
          <div class="card" style="padding: 14px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; background: ${isDone ? '#F6FCF7' : '#FFFFFF'};">
            <div>
              <div style="font-size: 14px; font-weight: 900; color: var(--color-ink); text-decoration: ${isDone ? 'line-through' : 'none'};">
                ${task.title}
              </div>
              <div style="font-size: 12px; color: var(--color-muted); margin-top: 2px;">
                Награда: <strong style="color: var(--color-red);">+${task.reward} Б</strong>
              </div>
            </div>

            <div>
              ${task.status === 'pending' ? `
                <button class="btn btn-primary btn-claim-task" data-id="${task.id}" style="padding: 8px 12px; font-size: 12px;">
                  Я сделал! ✅
                </button>
              ` : isReview ? `
                <span class="chip chip-yellow" style="font-size: 11px;">⏳ На проверке</span>
              ` : `
                <span class="chip chip-success" style="font-size: 11px;">🎉 Получено!</span>
              `}
            </div>
          </div>
        `;
      });
    }

    container.innerHTML = `
      <div style="margin-bottom: 14px;">
        <h2 style="font-size: 22px; font-weight: 900; color: var(--color-ink);">Задания от Мамы 💌</h2>
        <p style="font-size: 12px; color: var(--color-muted);">Выполняй дела по дому и получай честные монеты!</p>
      </div>
      <div>
        ${tasksHtml}
      </div>
    `;

    container.querySelectorAll('.btn-claim-task').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        window.StateManager.setTaskReview(id);
        if (window.AudioController) {
          window.AudioController.win();
          window.AudioController.speak('Отлично! Задание отправлено маме на проверку!');
        }
        this.renderTasksTab(container);
      });
    });
  }

  // Вкладка 4: Я (Кошелёк, Копилка мечты C06, Наклейки C10, Гардероб хомяка)
  renderMeTab(container) {
    const state = window.StateManager.get();
    const dreams = window.BankirchikData.dreams;
    const stickers = window.BankirchikData.stickers;

    // Считаем прогресс по первой доступной мечте
    const currentGoal = state.goals[0] || { targetAmount: 30, title: 'Конструктор LEGO' };
    const goalPct = Math.min(100, Math.round((state.piggy / currentGoal.targetAmount) * 100));

    container.innerHTML = `
      <div class="me-view">
        <h2 style="font-size: 22px; font-weight: 900; color: var(--color-ink); margin-bottom: 12px;">Мой Профиль 👑</h2>

        <!-- Панель управления финансами: Перекладывание из кошелька в копилку -->
        <div class="card" style="padding: 16px; margin-bottom: 16px; background: linear-gradient(135deg, #FFFDF5, #FFF9EA);">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 14px; text-align: center;">
            <div style="background: #FFFFFF; border-radius: 14px; padding: 12px; border: 2px solid #FFE680;">
              <div style="font-size: 26px;">👛</div>
              <div style="font-size: 11px; font-weight: 800; color: var(--color-muted);">КОШЕЛЁК</div>
              <div style="font-size: 20px; font-weight: 900;">${state.wallet} Б</div>
            </div>
            <div style="background: #FFFFFF; border-radius: 14px; padding: 12px; border: 2px solid #FFA6B5;">
              <div style="font-size: 26px;">🐷</div>
              <div style="font-size: 11px; font-weight: 800; color: var(--color-muted);">КОПИЛКА</div>
              <div style="font-size: 20px; font-weight: 900; color: var(--color-red);">${state.piggy} Б</div>
            </div>
          </div>

          <div style="display: flex; gap: 8px;">
            <button class="btn btn-secondary" id="btn-transfer-piggy" style="flex: 1; font-size: 12px;" ${state.wallet < 1 ? 'disabled' : ''}>
              Отложить 1 Б в копилку 🐷
            </button>
            <button class="btn btn-secondary" id="btn-transfer-wallet" style="flex: 1; font-size: 12px;" ${state.piggy < 1 ? 'disabled' : ''}>
              Достать 1 Б в кошелёк 👛
            </button>
          </div>
        </div>

        <!-- Витрина Мечты (C06) -->
        <div class="card" style="padding: 16px; margin-bottom: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <h3 style="font-size: 16px; font-weight: 900;">Копилка Мечты 🎯</h3>
            <span style="font-size: 12px; font-weight: 800; color: var(--color-red);">${goalPct}%</span>
          </div>
          <p style="font-size: 12px; color: var(--color-muted); margin-bottom: 10px;">
            Цель: <strong>${currentGoal.title}</strong> (${state.piggy} из ${currentGoal.targetAmount} Б)
          </p>
          <div class="progress-bar-track" style="margin-bottom: 14px;">
            <div class="progress-bar-fill" style="width: ${goalPct}%; background: linear-gradient(90deg, #FFC21A, #E63946);"></div>
          </div>

          <h4 style="font-size: 13px; font-weight: 900; margin-bottom: 8px;">Магазин настоящих целей:</h4>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
            ${dreams.map(d => {
              const isBought = state.purchasedDreams.includes(d.id);
              const canBuy = state.piggy >= d.cost && !isBought;
              return `
                <div class="card" style="padding: 10px; text-align: center; font-size: 12px; background: ${isBought ? '#E3F6E8' : '#FFFDF5'};">
                  <div style="font-size: 28px; margin-bottom: 4px;">${d.icon}</div>
                  <div style="font-weight: 800; line-height: 1.2;">${d.title}</div>
                  <div style="color: var(--color-red); font-weight: 900; margin: 4px 0;">${d.cost} Б</div>
                  ${isBought ? `
                    <span style="color: var(--color-success); font-weight: 800; font-size: 11px;">Куплено! 🏆</span>
                  ` : `
                    <button class="btn btn-secondary btn-buy-dream" data-id="${d.id}" data-cost="${d.cost}" style="padding: 4px 8px; font-size: 10px; width: 100%;" ${canBuy ? '' : 'disabled'}>
                      ${canBuy ? 'Купить!' : 'Копим...'}
                    </button>
                  `}
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Альбом Наклеек (C10) и гардероб -->
        <div class="card" style="padding: 16px;">
          <h3 style="font-size: 16px; font-weight: 900; margin-bottom: 8px;">Альбом наклеек для хомяка ✨</h3>
          <p style="font-size: 12px; color: var(--color-muted); margin-bottom: 12px;">Покупай аксессуары и наряжай хомяка!</p>

          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;">
            ${stickers.map(s => {
              const isUnlocked = state.purchasedStickers.includes(s.id);
              const isEquipped = state.equippedAccessory === s.id;
              const canUnlock = state.wallet >= s.cost && !isUnlocked;
              return `
                <div class="card" style="padding: 8px; text-align: center; font-size: 11px; background: ${isEquipped ? '#FFF4C2' : '#FFFFFF'};">
                  <div style="font-size: 26px; margin-bottom: 2px;">${s.icon}</div>
                  <div style="font-weight: 800;">${s.title}</div>
                  <div style="color: var(--color-muted); font-size: 10px; margin-bottom: 4px;">${s.cost} Б</div>
                  ${isUnlocked ? `
                    <button class="btn ${isEquipped ? 'btn-primary' : 'btn-secondary'} btn-equip-sticker" data-id="${s.id}" style="padding: 3px 6px; font-size: 9px; width: 100%;">
                      ${isEquipped ? 'Надето' : 'Надеть'}
                    </button>
                  ` : `
                    <button class="btn btn-secondary btn-buy-sticker" data-id="${s.id}" data-cost="${s.cost}" style="padding: 3px 6px; font-size: 9px; width: 100%;" ${canUnlock ? '' : 'disabled'}>
                      Купить
                    </button>
                  `}
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    `;

    // Обработчики перевода денег
    container.querySelector('#btn-transfer-piggy').addEventListener('click', () => {
      window.StateManager.transferToPiggy(1);
      if (window.AudioController) window.AudioController.coin();
      this.renderMeTab(container);
    });

    container.querySelector('#btn-transfer-wallet').addEventListener('click', () => {
      window.StateManager.transferToWallet(1);
      if (window.AudioController) window.AudioController.coin();
      this.renderMeTab(container);
    });

    // Обработчик покупки мечты
    container.querySelectorAll('.btn-buy-dream').forEach(b => {
      b.addEventListener('click', () => {
        const id = b.dataset.id;
        const cost = parseInt(b.dataset.cost);
        this.showPurchaseConfirmModal('мечту', cost, () => {
          window.StateManager.buyDream(id, cost);
          if (window.AudioController) {
            window.AudioController.confetti();
            window.AudioController.win();
            window.AudioController.speak('Поздравляю! Ты накопил и купил свою мечту! Родители будут тобой гордиться!');
          }
          this.renderMeTab(container);
        });
      });
    });

    // Обработчик покупки наклеек
    container.querySelectorAll('.btn-buy-sticker').forEach(b => {
      b.addEventListener('click', () => {
        const id = b.dataset.id;
        const cost = parseInt(b.dataset.cost);
        window.StateManager.buySticker(id, cost);
        if (window.AudioController) {
          window.AudioController.coin();
          window.AudioController.win();
        }
        this.renderMeTab(container);
      });
    });

    // Обработчик надевания наклейки
    container.querySelectorAll('.btn-equip-sticker').forEach(b => {
      b.addEventListener('click', () => {
        const id = b.dataset.id;
        const state = window.StateManager.get();
        const newAcc = state.equippedAccessory === id ? null : id;
        window.StateManager.equipAccessory(newAcc);
        if (this.hamsterWidget) this.hamsterWidget.render();
        this.renderMeTab(container);
      });
    });
  }

  // --- Запуск конкретной игры на экране ---
  launchIslandGame(islandId) {
    const gameMap = {
      1: 'clean_house',
      2: 'fruit_garden',
      3: 'piggy_bank',
      4: 'market',
      5: 'need_want',
      6: 'patience_island',
      7: 'first_bank',
      8: 'treasure_chest'
    };
    const key = gameMap[islandId] || 'clean_house';
    this.renderScreen('game_play', { islandId: islandId, gameKey: key });
  }

  renderGamePlayScreen(el, islandId, gameKey) {
    el.innerHTML = `
      <div class="screen-view game-play-screen" style="display: flex; flex-direction: column; height: 100%; padding: 12px; overflow-y: auto;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-shrink: 0;">
          <button class="btn-3d btn-white btn-small" id="btn-quit-game">
            ⬅️ Выйти на карту
          </button>
          <div class="pill-badge" style="font-size: 13px;">
            <span>👛</span> <strong id="game-live-wallet">${window.StateManager.get().wallet} Б</strong>
          </div>
        </div>

        <div id="game-active-container" style="flex: 1; display: flex; flex-direction: column;">
          <!-- Игра рендерится сюда -->
        </div>
      </div>
    `;

    el.querySelector('#btn-quit-game').addEventListener('click', () => {
      if (window.AudioController) window.AudioController.click();
      this.renderScreen('child_home');
    });

    const gameContainer = el.querySelector('#game-active-container');

    const handleComplete = (isWin) => {
      if (isWin && islandId) {
        // Открываем следующий остров, если прошли текущий
        const curUnlocked = window.StateManager.get().unlockedIsland;
        if (islandId >= curUnlocked && islandId < 8) {
          window.StateManager.unlockIsland(islandId + 1);
        }
      }
      setTimeout(() => {
        this.renderScreen('child_home');
      }, 800);
    };

    // Инстанциируем выбранную игру
    switch (gameKey) {
      case 'clean_house':
        this.activeGameInstance = new CleanHouseGame(gameContainer, 1, handleComplete);
        break;
      case 'fruit_garden':
        this.activeGameInstance = new FruitGardenGame(gameContainer, 1, handleComplete);
        break;
      case 'piggy_bank':
        this.activeGameInstance = new PiggyBankGame(gameContainer, 1, handleComplete);
        break;
      case 'market':
        this.activeGameInstance = new MarketGame(gameContainer, 1, handleComplete);
        break;
      case 'need_want':
        this.activeGameInstance = new NeedWantGame(gameContainer, 1, handleComplete);
        break;
      case 'patience_island':
        this.activeGameInstance = new PatienceIslandGame(gameContainer, 1, handleComplete);
        break;
      case 'first_bank':
        this.activeGameInstance = new FirstBankGame(gameContainer, 1, handleComplete);
        break;
      case 'treasure_chest':
        this.activeGameInstance = new TreasureChestGame(gameContainer, 1, handleComplete);
        break;
      case 'lemonade_stand':
        this.activeGameInstance = new LemonadeStandGame(gameContainer, 1, handleComplete);
        break;
      case 'exact_sum':
        this.activeGameInstance = new ExactSumGame(gameContainer, 1, handleComplete);
        break;
      case 'infinite_quiz':
        this.activeGameInstance = new InfiniteQuizGame(gameContainer, 1, handleComplete);
        break;
      default:
        this.activeGameInstance = new CleanHouseGame(gameContainer, 1, handleComplete);
    }
  }

  // --- Защита Взрослым замком (Adult Lock): умножение 7x8 ---
  showAdultLockModal() {
    const num1 = 7;
    const num2 = 8;
    const correctAns = num1 * num2; // 56

    const modal = document.createElement('div');
    modal.className = 'modal-backdrop';
    modal.innerHTML = `
      <div class="modal-card">
        <div style="font-size: 38px; margin-bottom: 8px;">🔒👨‍👩‍👧</div>
        <h3 class="modal-title">Взрослый замок</h3>
        <p style="font-size: 13px; color: var(--color-muted); margin-bottom: 14px;">
          Чтобы войти в кабинет родителя, решите пример:<br>
          <strong style="font-size: 18px; color: var(--color-ink);">${num1} × ${num2} = ?</strong>
        </p>

        <input type="number" id="adult-lock-answer" placeholder="Ответ" style="width: 100%; text-align: center; font-size: 22px; font-weight: 900; padding: 10px; border: 2px solid #EAC54F; border-radius: 12px; margin-bottom: 14px; outline: none;">

        <div style="display: flex; gap: 8px;">
          <button class="btn btn-secondary" id="btn-cancel-adult-lock" style="flex: 1;">Отмена</button>
          <button class="btn btn-primary" id="btn-submit-adult-lock" style="flex: 1.2;">Войти</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const input = modal.querySelector('#adult-lock-answer');
    input.focus();

    modal.querySelector('#btn-cancel-adult-lock').addEventListener('click', () => {
      modal.remove();
    });

    modal.querySelector('#btn-submit-adult-lock').addEventListener('click', () => {
      const val = parseInt(input.value.trim());
      if (val === correctAns) {
        modal.remove();
        if (window.AudioController) window.AudioController.click();
        this.currentRole = 'parent';
        this.renderScreen('parent_home');
      } else {
        if (window.AudioController) window.AudioController.error();
        input.style.borderColor = 'var(--color-red)';
        input.value = '';
        input.placeholder = 'Неверно!';
      }
    });
  }

  // --- Модалка подтверждения покупки (ТЗ: "Было X -> станет Y") ---
  showPurchaseConfirmModal(itemName, cost, onConfirm) {
    const state = window.StateManager.get();
    const before = state.piggy;
    const after = before - cost;

    const modal = document.createElement('div');
    modal.className = 'modal-backdrop';
    modal.innerHTML = `
      <div class="modal-card">
        <div style="font-size: 38px; margin-bottom: 8px;">🤔💭</div>
        <h3 class="modal-title">Подтверждение покупки</h3>
        <p style="font-size: 13px; color: var(--color-muted); margin-bottom: 14px;">
          Ты действительно хочешь потратить монеты на ${itemName}?
        </p>

        <div style="background: #FFF8D6; border-radius: 12px; padding: 12px; margin-bottom: 16px; font-size: 13px; text-align: left;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
            <span>Было в копилке:</span>
            <strong>${before} Б</strong>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px; color: var(--color-red);">
            <span>Стоимость:</span>
            <strong>-${cost} Б</strong>
          </div>
          <hr style="border: none; border-top: 1px dashed #EAC54F; margin: 6px 0;">
          <div style="display: flex; justify-content: space-between; font-weight: 900;">
            <span>Останется:</span>
            <strong style="color: ${after >= 0 ? 'var(--color-success)' : 'var(--color-red)'};">${after} Б</strong>
          </div>
        </div>

        <div style="display: flex; gap: 8px;">
          <button class="btn btn-secondary" id="btn-cancel-buy" style="flex: 1;">Подумаю ещё</button>
          <button class="btn btn-primary" id="btn-confirm-buy" style="flex: 1.2;">Да, купить!</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector('#btn-cancel-buy').addEventListener('click', () => modal.remove());
    modal.querySelector('#btn-confirm-buy').addEventListener('click', () => {
      modal.remove();
      if (onConfirm) onConfirm();
    });
  }

  // =========================================================================
  // --- РОДИТЕЛЬСКИЙ КАБИНЕТ (P01–P14) ---
  // =========================================================================
  renderParentHomeScreen(el) {
    const state = window.StateManager.get();

    el.innerHTML = `
      <div class="screen-view parent-dashboard" style="display: flex; flex-direction: column; height: 100%; position: relative; overflow: hidden; background: #FAF7EE;">
        <!-- Верхняя шапка родителя -->
        <header style="background: #FFFFFF; padding: 10px 14px; display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #EAE3D2; flex-shrink: 0;">
          <div>
            <div style="font-size: 11px; font-weight: 800; color: var(--bad); text-transform: uppercase;">Кабинет Родителя</div>
            <h2 style="font-size: 17px; font-weight: 900; color: var(--ink); margin: 0;">Семья: ${state.familyCode}</h2>
          </div>

          <div style="display: flex; gap: 8px; align-items: center;">
            <button class="btn-3d btn-secondary btn-small" id="btn-switch-to-child">
              🧒 В игру
            </button>
          </div>
        </header>

        <!-- Контент родительской вкладки -->
        <main id="parent-tab-content" class="screen-scroll">
          <!-- Рендерится через renderParentTabContent -->
        </main>

        <!-- Нижняя навигация родителя: Дашборд · Задания · Аналитика · AI-Ассистент · Премиум -->
        <nav class="bottom-tab-bar" style="border-top-color: #EAE3D2;">
          <button class="nav-tab-btn ${this.parentTab === 'dashboard' ? 'active' : ''}" data-ptab="dashboard">
            <span class="tab-icon">📊</span>
            <span>Обзор</span>
          </button>
          <button class="nav-tab-btn ${this.parentTab === 'tasks' ? 'active' : ''}" data-ptab="tasks">
            <span class="tab-icon">📋</span>
            <span>Задания</span>
            ${state.tasks.some(t => t.status === 'review') ? '<span class="tab-badge-dot"></span>' : ''}
          </button>
          <button class="nav-tab-btn ${this.parentTab === 'analytics' ? 'active' : ''}" data-ptab="analytics">
            <span class="tab-icon">📈</span>
            <span>Отчёт</span>
          </button>
          <button class="nav-tab-btn ${this.parentTab === 'assistant' ? 'active' : ''}" data-ptab="assistant">
            <span class="tab-icon">🤖</span>
            <span>AI Совет</span>
          </button>
          <button class="nav-tab-btn ${this.parentTab === 'premium' ? 'active' : ''}" data-ptab="premium">
            <span class="tab-icon">⭐</span>
            <span>Premium</span>
          </button>
        </nav>
      </div>
    `;

    // Переключение обратно в режим ребёнка
    el.querySelector('#btn-switch-to-child').addEventListener('click', () => {
      this.currentRole = 'child';
      this.renderScreen('child_home');
    });

    // Обработчики нижней навигации
    const pNavItems = el.querySelectorAll('.bottom-tab-bar .nav-tab-btn');
    pNavItems.forEach(item => {
      item.addEventListener('click', () => {
        if (window.AudioController) window.AudioController.click();
        pNavItems.forEach(x => x.classList.remove('active'));
        item.classList.add('active');
        this.parentTab = item.dataset.ptab;
        this.renderParentTabContent(el.querySelector('#parent-tab-content'));
      });
    });

    this.renderParentTabContent(el.querySelector('#parent-tab-content'));
  }

  renderParentTabContent(container) {
    switch (this.parentTab) {
      case 'dashboard':
        this.renderParentDashboard(container);
        break;
      case 'tasks':
        this.renderParentTasks(container);
        break;
      case 'analytics':
        this.renderParentAnalytics(container);
        break;
      case 'assistant':
        this.renderParentAiAssistant(container);
        break;
      case 'premium':
        this.renderParentPremium(container);
        break;
    }
  }

  // P02. Главная родителя (Дашборд)
  renderParentDashboard(container) {
    const state = window.StateManager.get();
    const tasksForReview = state.tasks.filter(t => t.status === 'review');

    container.innerHTML = `
      <div class="parent-view">
        <!-- Карточка статуса ребёнка -->
        <div class="card" style="padding: 16px; margin-bottom: 14px; background: #FFFFFF;">
          <div style="display: flex; gap: 12px; align-items: center; margin-bottom: 12px;">
            <div style="font-size: 38px;">🧒</div>
            <div>
              <h3 style="font-size: 17px; font-weight: 900; margin: 0;">${state.childName}, ${state.childAge} лет</h3>
              <div style="font-size: 12px; color: var(--color-muted);">Код семьи: <strong>${state.familyCode}</strong></div>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; text-align: center;">
            <div style="background: #FFF8D6; padding: 8px; border-radius: 10px;">
              <div style="font-size: 11px; color: var(--color-muted); font-weight: 800;">В кошельке</div>
              <div style="font-size: 16px; font-weight: 900;">${state.wallet} Б</div>
            </div>
            <div style="background: #FFF8D6; padding: 8px; border-radius: 10px;">
              <div style="font-size: 11px; color: var(--color-muted); font-weight: 800;">В копилке</div>
              <div style="font-size: 16px; font-weight: 900; color: var(--color-red);">${state.piggy} Б</div>
            </div>
            <div style="background: #FFF8D6; padding: 8px; border-radius: 10px;">
              <div style="font-size: 11px; color: var(--color-muted); font-weight: 800;">Звёзды</div>
              <div style="font-size: 16px; font-weight: 900; color: #E63946;">⭐ ${state.stars.length} / 8</div>
            </div>
          </div>
        </div>

        <!-- Требуют проверки (P14) -->
        ${tasksForReview.length > 0 ? `
          <div class="card" style="padding: 16px; margin-bottom: 14px; border: 2px solid #FFC21A; background: #FFFDF5;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <h4 style="font-size: 15px; font-weight: 900; color: var(--color-red); margin: 0;">Требуют проверки (${tasksForReview.length})</h4>
              <span class="chip chip-yellow">P14</span>
            </div>
            ${tasksForReview.map(t => `
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px dashed #FFE680;">
                <div>
                  <div style="font-size: 13px; font-weight: 800;">${t.title}</div>
                  <div style="font-size: 11px; color: var(--color-muted);">Награда: +${t.reward} Б</div>
                </div>
                <button class="btn btn-primary btn-confirm-task-parent" data-id="${t.id}" style="padding: 6px 12px; font-size: 12px;">
                  Подтвердить ✅
                </button>
              </div>
            `).join('')}
          </div>
        ` : ''}

        <!-- Совет недели от методиста -->
        <div class="card" style="padding: 16px; margin-bottom: 14px; background: #EAF4FF; border-left: 4px solid #1D70B8;">
          <div style="font-size: 12px; font-weight: 900; color: #1D70B8; text-transform: uppercase; margin-bottom: 4px;">💡 Совет недели родителям</div>
          <p style="font-size: 13px; color: #1D3A5F; line-height: 1.4; margin: 0;">
            ${window.BankirchikData.parentTips[0].text}
          </p>
        </div>

        <!-- Быстрые действия -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <button class="btn btn-primary" id="btn-quick-add-task" style="font-size: 12px; padding: 12px;">
            ➕ Создать задание
          </button>
          <button class="btn btn-secondary" id="btn-quick-open-ai" style="font-size: 12px; padding: 12px;">
            🤖 Спросить AI-совет
          </button>
        </div>
      </div>
    `;

    container.querySelectorAll('.btn-confirm-task-parent').forEach(b => {
      b.addEventListener('click', () => {
        const id = b.dataset.id;
        window.StateManager.completeTask(id);
        if (window.AudioController) window.AudioController.win();
        this.renderParentDashboard(container);
      });
    });

    container.querySelector('#btn-quick-add-task').addEventListener('click', () => {
      this.parentTab = 'tasks';
      this.renderParentTabContent(container);
    });

    container.querySelector('#btn-quick-open-ai').addEventListener('click', () => {
      this.parentTab = 'assistant';
      this.renderParentTabContent(container);
    });
  }

  // P03–P05. Задания от родителя
  renderParentTasks(container) {
    const state = window.StateManager.get();
    const tasks = state.tasks;

    container.innerHTML = `
      <div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <h3 style="font-size: 18px; font-weight: 900;">Задания для ребёнка (P03)</h3>
          <button class="btn btn-primary" id="btn-show-add-task-form" style="padding: 6px 12px; font-size: 12px;">
            + Новое
          </button>
        </div>

        <!-- Форма создания нового задания (P04) -->
        <div id="add-task-form-panel" class="card" style="display: none; padding: 14px; margin-bottom: 14px; border: 2px solid #FFC21A;">
          <h4 style="font-size: 14px; font-weight: 900; margin-bottom: 8px;">Создать задание</h4>
          <input type="text" id="new-task-title" placeholder="Например: Прочитать 10 страниц книги" style="width: 100%; padding: 10px; border-radius: 10px; border: 1px solid #EAC54F; margin-bottom: 8px; font-size: 13px;">
          
          <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 12px;">
            <label style="font-size: 12px; font-weight: 800;">Награда:</label>
            <select id="new-task-reward" style="padding: 6px 10px; border-radius: 8px; border: 1px solid #EAC54F; font-size: 13px;">
              <option value="1">1 Б</option>
              <option value="2" selected>2 Б</option>
              <option value="3">3 Б</option>
              <option value="5">5 Б</option>
              <option value="10">10 Б</option>
            </select>
          </div>

          <div style="display: flex; gap: 8px;">
            <button class="btn btn-secondary" id="btn-cancel-task-form" style="flex: 1; font-size: 12px;">Отмена</button>
            <button class="btn btn-primary" id="btn-save-new-task" style="flex: 1.2; font-size: 12px;">Сохранить</button>
          </div>
        </div>

        <!-- Список всех заданий -->
        <div style="display: flex; flex-direction: column; gap: 10px;">
          ${tasks.map(t => `
            <div class="card" style="padding: 12px; display: flex; justify-content: space-between; align-items: center;">
              <div>
                <div style="font-size: 14px; font-weight: 800;">${t.title}</div>
                <div style="font-size: 11px; color: var(--color-muted); margin-top: 2px;">
                  Награда: <strong>${t.reward} Б</strong> • Статус: 
                  <span style="color: ${t.status === 'completed' ? 'var(--color-success)' : t.status === 'review' ? 'var(--color-red)' : 'var(--color-ink)'};">
                    ${t.status === 'completed' ? 'Выполнено' : t.status === 'review' ? 'Ждёт проверки' : 'В процессе'}
                  </span>
                </div>
              </div>
              ${t.status === 'review' ? `
                <button class="btn btn-primary btn-confirm-task-parent" data-id="${t.id}" style="padding: 6px 10px; font-size: 11px;">
                  Одобрить ✅
                </button>
              ` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    `;

    const formPanel = container.querySelector('#add-task-form-panel');
    container.querySelector('#btn-show-add-task-form').addEventListener('click', () => {
      formPanel.style.display = formPanel.style.display === 'none' ? 'block' : 'none';
    });

    container.querySelector('#btn-cancel-task-form').addEventListener('click', () => {
      formPanel.style.display = 'none';
    });

    container.querySelector('#btn-save-new-task').addEventListener('click', () => {
      const title = container.querySelector('#new-task-title').value.trim();
      const reward = parseInt(container.querySelector('#new-task-reward').value) || 2;
      if (title) {
        window.StateManager.addTask(title, reward);
        if (window.AudioController) window.AudioController.click();
        this.renderParentTasks(container);
      }
    });

    container.querySelectorAll('.btn-confirm-task-parent').forEach(b => {
      b.addEventListener('click', () => {
        const id = b.dataset.id;
        window.StateManager.completeTask(id);
        if (window.AudioController) window.AudioController.win();
        this.renderParentTasks(container);
      });
    });
  }

  // P07/P13. Аналитика и статистика
  renderParentAnalytics(container) {
    const state = window.StateManager.get();
    const isPremium = state.isPremium;

    container.innerHTML = `
      <div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <h3 style="font-size: 18px; font-weight: 900;">Аналитика навыков (P13)</h3>
          ${isPremium ? '<span class="chip chip-success">⭐ Premium</span>' : '<span class="chip chip-yellow">Базовый</span>'}
        </div>

        <!-- Метрики недели -->
        <div class="card" style="padding: 14px; margin-bottom: 14px;">
          <h4 style="font-size: 14px; font-weight: 900; margin-bottom: 10px;">Прогресс за неделю:</h4>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; text-align: center;">
            <div style="background: #FFF8D6; border-radius: 12px; padding: 10px;">
              <div style="font-size: 20px; font-weight: 900; color: var(--color-ink);">${state.analytics.weeklyMinutes} мин</div>
              <div style="font-size: 11px; color: var(--color-muted);">Времени в обучении</div>
            </div>
            <div style="background: #FFF8D6; border-radius: 12px; padding: 10px;">
              <div style="font-size: 20px; font-weight: 900; color: var(--color-ink);">${state.analytics.gamesPlayed}</div>
              <div style="font-size: 11px; color: var(--color-muted);">Игр сыграно</div>
            </div>
          </div>
        </div>

        <!-- Радар навыков (из ТЗ) -->
        <div class="card" style="padding: 16px; margin-bottom: 14px;">
          <h4 style="font-size: 14px; font-weight: 900; margin-bottom: 12px;">Финансовые навыки:</h4>
          
          <div style="margin-bottom: 10px;">
            <div style="display: flex; justify-content: space-between; font-size: 12px; font-weight: 800; margin-bottom: 4px;">
              <span>Терпение и отсроченное вознаграждение</span>
              <span>${state.analytics.patienceScore}%</span>
            </div>
            <div class="progress-bar-track">
              <div class="progress-bar-fill" style="width: ${state.analytics.patienceScore}%; background: #3FAE5A;"></div>
            </div>
          </div>

          <div style="margin-bottom: 10px;">
            <div style="display: flex; justify-content: space-between; font-size: 12px; font-weight: 800; margin-bottom: 4px;">
              <span>Различение «Нужно» и «Хочу»</span>
              <span>${state.analytics.budgetingScore}%</span>
            </div>
            <div class="progress-bar-track">
              <div class="progress-bar-fill" style="width: ${state.analytics.budgetingScore}%; background: #FFC21A;"></div>
            </div>
          </div>

          <div style="margin-bottom: 10px;">
            <div style="display: flex; justify-content: space-between; font-size: 12px; font-weight: 800; margin-bottom: 4px;">
              <span>Банковская грамотность и вклад</span>
              <span>75%</span>
            </div>
            <div class="progress-bar-track">
              <div class="progress-bar-fill" style="width: 75%; background: #E63946;"></div>
            </div>
          </div>
        </div>

        ${!isPremium ? `
          <div class="card" style="padding: 16px; text-align: center; border: 2px dashed #E63946; background: #FFF9F9;">
            <div style="font-size: 32px; margin-bottom: 6px;">🔒⭐</div>
            <h4 style="font-size: 15px; font-weight: 900; margin-bottom: 4px;">Глубокая аналитика закрыта</h4>
            <p style="font-size: 12px; color: var(--color-muted); margin-bottom: 12px;">
              Подключите Premium, чтобы получать еженедельные персональные отчёты психолога и методиста.
            </p>
            <button class="btn btn-primary" id="btn-goto-premium" style="font-size: 12px;">
              Подключить Premium за 1 990 ₸/мес
            </button>
          </div>
        ` : ''}
      </div>
    `;

    const gotoPrem = container.querySelector('#btn-goto-premium');
    if (gotoPrem) {
      gotoPrem.addEventListener('click', () => {
        this.parentTab = 'premium';
        this.renderParentTabContent(container);
      });
    }
  }

  // P12. AI-Ассистент для родителей (Чат с финансовым консультантом)
  renderParentAiAssistant(container) {
    const state = window.StateManager.get();
    const chatHistory = state.aiChatHistory || [];

    const quickQuestions = [
      'Как объяснить, почему мы не покупаем дорогую игрушку?',
      'Со скольких лет открывать детскую карту Kaspi Gold?',
      'Сколько карманных денег давать в 9 лет?'
    ];

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; height: 100%;">
        <div style="margin-bottom: 10px;">
          <h3 style="font-size: 18px; font-weight: 900; margin: 0;">AI-Консультант для родителей 🤖</h3>
          <p style="font-size: 12px; color: var(--color-muted); margin: 2px 0 0 0;">Методист по детской финансовой грамотности</p>
        </div>

        <!-- Быстрые вопросы -->
        <div style="display: flex; gap: 6px; overflow-x: auto; padding-bottom: 8px; margin-bottom: 10px;">
          ${quickQuestions.map(q => `
            <button class="btn btn-secondary btn-quick-q" style="font-size: 11px; white-space: nowrap; padding: 6px 10px;">
              ${q}
            </button>
          `).join('')}
        </div>

        <!-- Чат сообщений -->
        <div id="ai-chat-messages" style="flex: 1; max-height: 380px; overflow-y: auto; display: flex; flex-direction: column; gap: 8px; padding: 10px; background: #FFFFFF; border-radius: 14px; border: 2px solid #EAE3D2; margin-bottom: 10px;">
          ${chatHistory.map(m => `
            <div style="align-self: ${m.role === 'user' ? 'flex-end' : 'flex-start'}; max-width: 85%; padding: 10px 14px; border-radius: 14px; font-size: 13px; line-height: 1.4; background: ${m.role === 'user' ? '#E63946' : '#F6EEDC'}; color: ${m.role === 'user' ? '#FFFFFF' : '#3B1F0E'};">
              ${m.text}
            </div>
          `).join('')}
        </div>

        <!-- Поле ввода вопроса -->
        <div style="display: flex; gap: 8px;">
          <input type="text" id="ai-user-input" placeholder="Задайте вопрос о деньгах и детях..." style="flex: 1; padding: 10px 14px; border-radius: 12px; border: 2px solid #EAC54F; font-size: 13px; outline: none;">
          <button class="btn btn-primary" id="btn-send-ai-msg" style="padding: 10px 16px;">
            Отправить
          </button>
        </div>
      </div>
    `;

    const chatBox = container.querySelector('#ai-chat-messages');
    chatBox.scrollTop = chatBox.scrollHeight;

    const sendMsg = (text) => {
      if (!text.trim()) return;
      window.StateManager.addAiMessage('user', text);

      // Генерируем ответ из базы знаний ТЗ
      const reply = this.generateAiResponse(text);
      setTimeout(() => {
        window.StateManager.addAiMessage('assistant', reply);
        this.renderParentAiAssistant(container);
      }, 500);

      this.renderParentAiAssistant(container);
    };

    container.querySelector('#btn-send-ai-msg').addEventListener('click', () => {
      const input = container.querySelector('#ai-user-input');
      const val = input.value;
      input.value = '';
      sendMsg(val);
    });

    container.querySelectorAll('.btn-quick-q').forEach(btn => {
      btn.addEventListener('click', () => {
        sendMsg(btn.textContent.trim());
      });
    });
  }

  // Интеллектуальный ответ AI на основе базы знаний ТЗ
  generateAiResponse(query) {
    const q = query.toLowerCase();
    const kb = window.BankirchikData.aiKnowledge;

    if (q.includes('карманн') || q.includes('сколько') || q.includes('денег')) {
      return kb.pocketMoneyRule;
    }
    if (q.includes('игрушк') || q.includes('магазин') || q.includes('отказ') || q.includes('хочет')) {
      return kb.handlingToyTantrum;
    }
    if (q.includes('каспи') || q.includes('kaspi') || q.includes('карт')) {
      return kb.kaspiCardIntro;
    }
    if (q.includes('ошиб') || q.includes('потратил') || q.includes('ерунд')) {
      return kb.mistakesAdvice;
    }

    return `Отличный вопрос! Главное правило финансового воспитания в возрасте ${window.StateManager.get().childAge} лет — регулярность и предсказуемость. Давайте ребёнку возможность совершать маленькие ошибки на маленьких суммах (монеты Б в «Банкирчике» или 500–1000 ₸), чтобы во взрослой жизни он не совершал больших ошибок!`;
  }

  // P09–P11. Покупка Premium (Kaspi Pay checkout)
  renderParentPremium(container) {
    const state = window.StateManager.get();

    container.innerHTML = `
      <div style="text-align: center;">
        <div style="font-size: 44px; margin-bottom: 6px;">⭐💎</div>
        <h3 style="font-size: 20px; font-weight: 900; margin-bottom: 4px;">Подписка «Банкирчик Premium»</h3>
        <p style="font-size: 13px; color: var(--color-muted); margin-bottom: 16px;">
          Полный доступ для родителей: AI-ассистент 24/7, глубокая аналитика и все бонусные игры!
        </p>

        ${state.isPremium ? `
          <div class="card" style="padding: 20px; background: #E3F6E8; border: 2px solid var(--color-success); margin-bottom: 16px;">
            <div style="font-size: 32px; margin-bottom: 6px;">🎉</div>
            <h4 style="font-size: 16px; font-weight: 900; color: #2B7A3E;">У вас активен тариф Premium!</h4>
            <p style="font-size: 12px; color: #2B7A3E; margin-top: 4px;">Все функции доступны без ограничений.</p>
          </div>
        ` : `
          <!-- Тарифы (P09) -->
          <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 16px; text-align: left;">
            <div class="card card-actionable plan-card active" data-plan="month" style="padding: 14px; border: 2px solid #E63946; background: #FFFDF5;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-weight: 900; font-size: 15px;">1 месяц</span>
                <strong style="font-size: 18px; color: var(--color-red);">1 990 ₸</strong>
              </div>
              <div style="font-size: 11px; color: var(--color-muted); margin-top: 4px;">Идеально для 14-дневного теста на MVP</div>
            </div>

            <div class="card card-actionable plan-card" data-plan="year" style="padding: 14px; border: 2px solid #EAE3D2;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <span style="font-weight: 900; font-size: 15px;">1 год (Скидка 25%)</span>
                  <span class="chip chip-success" style="font-size: 9px; margin-left: 6px;">ВЫГОДНО</span>
                </div>
                <strong style="font-size: 18px; color: var(--color-ink);">17 990 ₸</strong>
              </div>
              <div style="font-size: 11px; color: var(--color-muted); margin-top: 4px;">Экономия 5 890 ₸ в год</div>
            </div>
          </div>

          <!-- Оплата через Kaspi Pay (P10) -->
          <div class="card" style="padding: 16px; background: #FFFFFF; border: 2px solid #F14635; margin-bottom: 16px;">
            <div style="display: flex; align-items: center; gap: 8px; justify-content: center; margin-bottom: 8px;">
              <div style="font-size: 22px;">🔴</div>
              <h4 style="font-size: 15px; font-weight: 900; color: #F14635; margin: 0;">Оплата через Kaspi Pay</h4>
            </div>
            <p style="font-size: 12px; color: var(--color-muted); margin-bottom: 12px;">
              Номер телефона: <strong>+7 (701) 555-01-99</strong><br>
              Счёт на оплату будет выставлен в приложении Kaspi.kz
            </p>

            <button class="btn btn-primary" id="btn-pay-kaspi" style="width: 100%; background: #F14635; border-color: #A61B25;">
              Оплатить 1 990 ₸ через Kaspi 💳
            </button>
          </div>
        `}
      </div>
    `;

    const payBtn = container.querySelector('#btn-pay-kaspi');
    if (payBtn) {
      payBtn.addEventListener('click', () => {
        // Симуляция успешной оплаты Kaspi Pay
        window.StateManager.update({ isPremium: true });
        if (window.AudioController) {
          window.AudioController.confetti();
          window.AudioController.win();
        }
        alert('Счёт Kaspi Pay успешно оплачен! Premium активирован на 30 дней. 🎉');
        this.renderParentPremium(container);
      });
    }
  }
}

// Запуск приложения при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
  window.App = new BankirchikApp();
});

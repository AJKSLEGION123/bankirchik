// C:\Bankirchik\js\games\clean_house.js
// Игра 6.1 «Чистый дом» (3 уровня: Детская, Весь дом, Генеральная уборка)

class CleanHouseGame {
  constructor(container, levelNum = 1, onComplete) {
    if (typeof levelNum === 'function') {
      onComplete = levelNum;
      levelNum = 1;
    }
    this.container = container;
    this.levelNum = Number(levelNum) || 1;
    this.onComplete = onComplete || (() => {});
    this.islandData = (window.BANKIR_DATA && window.BANKIR_DATA.islands) ? window.BANKIR_DATA.islands[0] : (window.BankirchikData ? window.BankirchikData.islands[0] : null);
    this.levelConfig = (this.islandData && this.islandData.levels) ? (this.islandData.levels[this.levelNum - 1] || this.islandData.levels[0]) : { name: "Уборка", items: 4, places: 3, reward: 2, timer: 45 };

    this.timer = this.levelConfig.timer || 0;
    this.timerInterval = null;
    this.remainingItems = [];
    this.activeItem = null; // Для тач-управления (тап по вещи -> тап по комнате)
    this.solvedCount = 0;
    this.totalCount = this.levelConfig.items;

    this.init();
  }

  init() {
    // Выбор вещей без повторов
    const all = [...window.BANKIR_DATA.cleaningItems];
    // Перемешиваем
    all.sort(() => Math.random() - 0.5);

    // Фильтруем места по уровню (в уровне 1 — 3 места: шкаф, кухня, игрушки)
    const allowedPlaces = (this.levelConfig.places === 3) 
      ? ["closet", "kitchen", "toys"] 
      : ["closet", "kitchen", "toys", "bath"];

    const filtered = all.filter(it => allowedPlaces.includes(it.place));
    this.remainingItems = filtered.slice(0, this.levelConfig.items);
    this.totalCount = this.remainingItems.length;

    this.render();

    if (this.timer > 0) {
      this.timerInterval = setInterval(() => {
        this.timer--;
        const timerEl = document.getElementById("clean-timer-badge");
        if (timerEl) timerEl.textContent = `⏱️ ${this.timer} с`;

        if (this.timer <= 0) {
          clearInterval(this.timerInterval);
          this.gameOver(false, "Время вышло! В следующий раз убирайся чуть быстрее.");
        }
      }, 1000);
    }
  }

  destroy() {
    if (this.timerInterval) clearInterval(this.timerInterval);
  }

  render() {
    const places = [
      { id: "closet", name: "Шкаф", emoji: "🚪", desc: "Одежда и вещи" },
      { id: "kitchen", name: "Кухня", emoji: "🍽️", desc: "Посуда" },
      { id: "toys", name: "Игрушки", emoji: "🧸", desc: "Коробка с играми" }
    ];
    if (this.levelConfig.places >= 4) {
      places.push({ id: "bath", name: "Ванная", emoji: "🛁", desc: "Мыло и щётки" });
    }

    this.container.innerHTML = `
      <div class="game-view-wrapper">
        <div class="game-header-bar">
          <button class="icon-btn" id="game-close-btn">✕</button>
          <div class="game-title-box">
            <div class="game-level-name">Остров 1: Чистый дом</div>
            <div class="game-sub-name">Уровень ${this.levelNum}: ${this.levelConfig.name}</div>
          </div>
          ${this.timer > 0 ? `<div class="coin-pill" id="clean-timer-badge">⏱️ ${this.timer} с</div>` : `<div></div>`}
        </div>

        <div class="card" style="margin-top: 10px; padding: 14px; text-align: center;">
          <div style="font-size: 15px; font-weight: 800; color: var(--ink);">
            Разложи вещи по своим местам! Нажми на предмет, а затем на нужную комнату.
          </div>
          <div style="font-size: 13px; font-weight: 900; color: var(--red); margin-top: 4px;">
            Осталось убрать: <span id="clean-left-count">${this.remainingItems.length}</span> из ${this.totalCount}
          </div>
        </div>

        <!-- Комнаты / Зоны раскладки -->
        <div class="clean-zones-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 16px;">
          ${places.map(p => `
            <div class="clean-target-zone" data-place="${p.id}" style="background: #FFF; border: 3px solid var(--shadow); box-shadow: 0 4px 0 var(--shadow); border-radius: 20px; padding: 14px 10px; text-align: center; cursor: pointer; transition: all 0.2s;">
              <div style="font-size: 32px;">${p.emoji}</div>
              <div style="font-weight: 900; font-size: 16px; margin-top: 4px; color: var(--ink);">${p.name}</div>
              <div style="font-size: 11px; font-weight: 700; color: var(--muted);">${p.desc}</div>
            </div>
          `).join('')}
        </div>

        <!-- Разбросанные вещи -->
        <div class="card" style="min-height: 140px; background: #FFF9E6; border-style: dashed;">
          <div style="font-size: 12px; font-weight: 800; color: var(--muted); margin-bottom: 8px;">Разбросанные предметы:</div>
          <div id="clean-items-pool" style="display: flex; flex-wrap: wrap; gap: 10px; justify-content: center;">
            ${this.remainingItems.map(it => `
              <div class="clean-draggable-item" data-id="${it.id}" style="width: 68px; height: 68px; border-radius: 18px; background: #FFF; border: 2.5px solid var(--shadow); box-shadow: 0 4px 0 var(--shadow); display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; transition: transform 0.15s;">
                <span style="font-size: 30px;">${it.emoji}</span>
                <span style="font-size: 9px; font-weight: 800; max-width: 60px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${it.name}</span>
              </div>
            `).join('')}
          </div>
        </div>

        ${HamsterRenderer.renderWithBubble("Наведи порядок в доме — и получи честно заработанные монеты Б!", window.bankirState.data.child.equippedItem)}
      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    document.getElementById("game-close-btn").onclick = () => {
      this.destroy();
      this.onComplete(false);
    };

    // Выбор предмета
    const itemEls = this.container.querySelectorAll(".clean-draggable-item");
    itemEls.forEach(el => {
      el.onclick = () => {
        window.bankirAudio.playClick();
        itemEls.forEach(i => {
          i.style.transform = "scale(1)";
          i.style.borderColor = "var(--shadow)";
        });
        el.style.transform = "scale(1.15)";
        el.style.borderColor = "var(--red)";
        const id = el.getAttribute("data-id");
        this.activeItem = this.remainingItems.find(it => it.id === id);
      };
    });

    // Клик по комнате / зоне
    const zoneEls = this.container.querySelectorAll(".clean-target-zone");
    zoneEls.forEach(zone => {
      zone.onclick = () => {
        if (!this.activeItem) {
          window.bankirAudio.speak("Сначала нажми на предмет, который хочешь убрать!");
          return;
        }

        const place = zone.getAttribute("data-place");
        if (this.activeItem.place === place) {
          // Верно!
          window.bankirAudio.playCoin();
          zone.style.background = "var(--success-light)";
          zone.style.borderColor = "var(--success)";
          setTimeout(() => {
            zone.style.background = "#FFF";
            zone.style.borderColor = "var(--shadow)";
          }, 400);

          // Убираем предмет
          this.remainingItems = this.remainingItems.filter(i => i.id !== this.activeItem.id);
          this.activeItem = null;
          this.solvedCount++;

          const countEl = document.getElementById("clean-left-count");
          if (countEl) countEl.textContent = this.remainingItems.length;

          // Перерисовываем предметы
          const pool = document.getElementById("clean-items-pool");
          if (pool) {
            pool.innerHTML = this.remainingItems.map(it => `
              <div class="clean-draggable-item" data-id="${it.id}" style="width: 68px; height: 68px; border-radius: 18px; background: #FFF; border: 2.5px solid var(--shadow); box-shadow: 0 4px 0 var(--shadow); display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; transition: transform 0.15s;">
                <span style="font-size: 30px;">${it.emoji}</span>
                <span style="font-size: 9px; font-weight: 800; max-width: 60px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${it.name}</span>
              </div>
            `).join('');
            this.bindEvents();
          }

          if (this.remainingItems.length === 0) {
            this.gameOver(true);
          }
        } else {
          // Ошибка
          window.bankirAudio.playError();
          zone.classList.add("shake");
          zone.style.borderColor = "var(--red)";
          setTimeout(() => {
            zone.classList.remove("shake");
            zone.style.borderColor = "var(--shadow)";
          }, 400);
          window.bankirAudio.speak(`Ой! Это нужно положить в ${this.activeItem.placeName}!`);
        }
      };
    });
  }

  gameOver(isWin, errorMsg = "") {
    this.destroy();
    if (isWin) {
      window.bankirAudio.playWin();
      window.bankirState.completeLevel(1, this.levelNum, this.levelConfig.reward);
    }

    const randomFact = this.islandData.facts[Math.floor(Math.random() * this.islandData.facts.length)];

    this.container.innerHTML = `
      <div class="modal-overlay">
        <div class="modal-content" style="text-align: center;">
          <div style="font-size: 54px; margin-bottom: 8px;">${isWin ? "🎉" : "💪"}</div>
          <h2 style="font-size: 24px; font-weight: 900; color: ${isWin ? "var(--success)" : "var(--red)"};">
            ${isWin ? "Уровень пройден!" : "Почти получилось!"}
          </h2>
          <p style="font-size: 15px; font-weight: 800; color: var(--ink); margin: 8px 0 16px 0;">
            ${isWin ? `Отличная работа! В кошелёк зачислено +${this.levelConfig.reward} Б!` : errorMsg}
          </p>

          <div class="card" style="background: var(--yellow-light); border-color: var(--yellow); padding: 12px; margin-bottom: 16px; text-align: left;">
            <div style="font-size: 12px; font-weight: 900; color: #B45309;">💡 Знаешь ли ты?</div>
            <div style="font-size: 13px; font-weight: 700; color: var(--ink); margin-top: 4px;">${randomFact}</div>
          </div>

          <div style="display: flex; flex-direction: column; gap: 10px;">
            ${isWin && this.levelNum < 3 ? `
              <button class="btn btn-red" id="clean-next-btn">Уровень ${this.levelNum + 1} ➜</button>
            ` : ""}
            <button class="btn btn-yellow" id="clean-retry-btn">${isWin ? "Играть снова" : "Попробовать ещё раз"}</button>
            <button class="btn btn-white" id="clean-map-btn">К островам</button>
          </div>
        </div>
      </div>
    `;

    const nextBtn = document.getElementById("clean-next-btn");
    if (nextBtn) {
      nextBtn.onclick = () => {
        new CleanHouseGame(this.container, this.levelNum + 1, this.onComplete);
      };
    }

    document.getElementById("clean-retry-btn").onclick = () => {
      new CleanHouseGame(this.container, this.levelNum, this.onComplete);
    };

    document.getElementById("clean-map-btn").onclick = () => {
      this.onComplete(isWin);
    };
  }
}

if (typeof window !== "undefined") {
  window.CleanHouseGame = CleanHouseGame;
}

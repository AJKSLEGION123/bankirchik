// C:\Bankirchik\js\games\need_want.js
// Игра 6.5 «Нужно или хочу» (свайп карточек потребностей и желаний)

class NeedWantGame {
  constructor(container, levelNum = 1, onComplete) {
    if (typeof levelNum === 'function') {
      onComplete = levelNum;
      levelNum = 1;
    }
    this.container = container;
    this.levelNum = Number(levelNum) || 1;
    this.onComplete = onComplete || (() => {});
    this.islandData = (window.BANKIR_DATA && window.BANKIR_DATA.islands) ? window.BANKIR_DATA.islands[4] : (window.BankirchikData ? window.BankirchikData.islands[4] : null);
    this.config = (this.islandData && this.islandData.levels) ? (this.islandData.levels[this.levelNum - 1] || this.islandData.levels[0]) : { name: "Нужно/Хочу", reward: 2 };

    this.cards = [];
    this.currentIndex = 0;
    this.correctCount = 0;
    this.budget = 0;
    this.currentExplanation = "";

    this.init();
  }

  init() {
    const data = window.BANKIR_DATA.needWantCards;
    let pool = [];

    if (this.levelNum === 1) {
      // 4 нужно + 4 хочу
      const n = [...data.needs].sort(() => Math.random() - 0.5).slice(0, 4);
      const w = [...data.wants].sort(() => Math.random() - 0.5).slice(0, 4);
      pool = [...n, ...w].sort(() => Math.random() - 0.5);
    } else if (this.levelNum === 2) {
      // 6 хитрых + 4 обычных
      const tn = [...data.trickyNeeds].sort(() => Math.random() - 0.5).slice(0, 3);
      const tw = [...data.trickyWants].sort(() => Math.random() - 0.5).slice(0, 3);
      const n = [...data.needs].sort(() => Math.random() - 0.5).slice(0, 2);
      const w = [...data.wants].sort(() => Math.random() - 0.5).slice(0, 2);
      pool = [...tn, ...tw, ...n, ...w].sort(() => Math.random() - 0.5);
    } else {
      // Бюджет недели (9 карточек с ценами)
      const n = [...data.needs].sort(() => Math.random() - 0.5).slice(0, 5).map(c => ({ ...c, price: 2 + Math.floor(Math.random() * 2) }));
      const w = [...data.wants].sort(() => Math.random() - 0.5).slice(0, 4).map(c => ({ ...c, price: 2 + Math.floor(Math.random() * 3) }));
      pool = [...n, ...w].sort(() => Math.random() - 0.5);

      const needSum = n.reduce((s, it) => s + it.price, 0);
      this.budget = needSum + 2; // Бюджет = сумма нужного + 2
    }

    this.cards = pool;
    this.render();
  }

  render() {
    if (this.currentIndex >= this.cards.length) {
      this.finishGame();
      return;
    }

    const card = this.cards[this.currentIndex];
    const isLevel3 = this.levelNum === 3;

    this.container.innerHTML = `
      <div class="game-view-wrapper">
        <div class="game-header-bar">
          <button class="icon-btn" id="nw-close-btn">✕</button>
          <div class="game-title-box">
            <div class="game-level-name">Остров 5: Нужно или хочу</div>
            <div class="game-sub-name">Карточка ${this.currentIndex + 1} из ${this.cards.length}</div>
          </div>
          ${isLevel3 ? `<div class="coin-pill">Бюджет: <b>${this.budget}</b> Б</div>` : `<div class="coin-pill">★ ${this.correctCount} верных</div>`}
        </div>

        <!-- Полоса прогресса -->
        <div style="width: 100%; height: 8px; background: rgba(0,0,0,0.08); border-radius: 4px; overflow: hidden; margin: 10px 0;">
          <div style="height: 100%; width: ${(this.currentIndex / this.cards.length) * 100}%; background: var(--red); transition: width 0.3s ease;"></div>
        </div>

        <!-- Контейнер интерактивной свайп-карточки -->
        <div style="height: 310px; display: flex; align-items: center; justify-content: center; position: relative; margin: 10px 0;">
          <div id="swipe-card" class="card" style="width: 270px; height: 290px; text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: grab; padding: 20px; transition: transform 0.15s ease-out; position: relative;">
            <div style="font-size: 70px; margin-bottom: 10px;">${card.emoji}</div>
            <div style="font-size: 18px; font-weight: 900; color: var(--ink);">${card.name}</div>
            ${isLevel3 ? `<div style="font-size: 16px; font-weight: 900; color: var(--red); margin-top: 6px;">Цена: ${card.price} Б</div>` : ""}

            <div id="badge-left" style="position: absolute; top: 16px; right: 16px; background: #FEE2E2; color: var(--red); border: 2px solid var(--red); font-weight: 900; font-size: 13px; padding: 4px 8px; border-radius: 10px; opacity: 0; transform: rotate(15deg);">
              ${isLevel3 ? "ПРОПУСТИТЬ" : "ХОЧУ ❤️"}
            </div>
            <div id="badge-right" style="position: absolute; top: 16px; left: 16px; background: var(--success-light); color: var(--success); border: 2px solid var(--success); font-weight: 900; font-size: 13px; padding: 4px 8px; border-radius: 10px; opacity: 0; transform: rotate(-15deg);">
              ${isLevel3 ? "КУПИТЬ ✅" : "НУЖНО ✅"}
            </div>
          </div>
        </div>

        <!-- Кнопки выбора под карточкой -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 10px;">
          <button class="btn btn-pink" id="btn-want">
            ${isLevel3 ? "✕ Пропустить" : "❤️ Хочется"}
          </button>
          <button class="btn btn-yellow" id="btn-need">
            ${isLevel3 ? "🛒 Купить" : "✅ Нужно"}
          </button>
        </div>

        ${HamsterRenderer.renderWithBubble(
          this.currentExplanation || (isLevel3 ? "Купи всё жизненно необходимое и уложись в недельный бюджет!" : "Свайпай вправо — если нужно для жизни, влево — если это просто желание!"),
          window.bankirState.data.child.equippedItem
        )}
      </div>
    `;

    document.getElementById("nw-close-btn").onclick = () => this.onComplete(false);

    document.getElementById("btn-want").onclick = () => this.handleAnswer(false);
    document.getElementById("btn-need").onclick = () => this.handleAnswer(true);

    this.bindSwipe();
  }

  bindSwipe() {
    const cardEl = document.getElementById("swipe-card");
    const badgeLeft = document.getElementById("badge-left");
    const badgeRight = document.getElementById("badge-right");
    if (!cardEl) return;

    let startX = 0;
    let currentX = 0;
    let isDragging = false;

    const onStart = (clientX) => {
      isDragging = true;
      startX = clientX;
      cardEl.style.cursor = "grabbing";
    };

    const onMove = (clientX) => {
      if (!isDragging) return;
      currentX = clientX - startX;
      const rotate = currentX * 0.08;
      cardEl.style.transform = `translateX(${currentX}px) rotate(${rotate}deg)`;

      if (currentX > 20) {
        badgeRight.style.opacity = Math.min(1, currentX / 70);
        badgeLeft.style.opacity = 0;
      } else if (currentX < -20) {
        badgeLeft.style.opacity = Math.min(1, Math.abs(currentX) / 70);
        badgeRight.style.opacity = 0;
      } else {
        badgeLeft.style.opacity = 0;
        badgeRight.style.opacity = 0;
      }
    };

    const onEnd = () => {
      if (!isDragging) return;
      isDragging = false;
      cardEl.style.cursor = "grab";

      if (currentX > 80) {
        // Свайп вправо = Нужно / Купить
        this.handleAnswer(true);
      } else if (currentX < -80) {
        // Свайп влево = Хочу / Пропустить
        this.handleAnswer(false);
      } else {
        cardEl.style.transform = "translateX(0) rotate(0deg)";
        badgeLeft.style.opacity = 0;
        badgeRight.style.opacity = 0;
      }
    };

    cardEl.addEventListener("pointerdown", e => onStart(e.clientX));
    window.addEventListener("pointermove", e => onMove(e.clientX));
    window.addEventListener("pointerup", onEnd);
  }

  handleAnswer(chosenNeed) {
    const card = this.cards[this.currentIndex];
    const isLevel3 = this.levelNum === 3;

    if (!isLevel3) {
      const isCorrect = (chosenNeed === card.isNeed);
      if (isCorrect) {
        this.correctCount++;
        window.bankirAudio.playCoin();
      } else {
        window.bankirAudio.playError();
      }
      this.currentExplanation = card.explanation;
    } else {
      // Уровень 3: Бюджет недели
      if (chosenNeed) {
        // Решил купить
        if (this.budget >= card.price) {
          this.budget -= card.price;
          if (card.isNeed) {
            this.correctCount++;
            window.bankirAudio.playCoin();
          } else {
            // Купил ненужное хочу
            window.bankirAudio.playError();
          }
        } else {
          window.bankirAudio.playError();
          alert("Бюджет закончился! Нельзя купить.");
          return;
        }
      } else {
        // Пропустил
        if (!card.isNeed) {
          // Верно отказался от хочу
          this.correctCount++;
          window.bankirAudio.playCoin();
        } else {
          // Ошибочно пропустил жизненно нужное
          window.bankirAudio.playError();
        }
      }
      this.currentExplanation = card.explanation;
    }

    this.currentIndex++;
    this.render();
  }

  finishGame() {
    const isLevel3 = this.levelNum === 3;
    let isWin = false;

    if (isLevel3) {
      isWin = this.budget >= 0 && this.correctCount >= 7;
    } else {
      isWin = this.correctCount >= this.config.minCorrect;
    }

    if (isWin) {
      window.bankirAudio.playWin();
      window.bankirState.completeLevel(5, this.levelNum, this.config.reward);
    } else {
      window.bankirAudio.playError();
    }

    const randomFact = this.islandData.facts[Math.floor(Math.random() * this.islandData.facts.length)];

    this.container.innerHTML = `
      <div class="modal-overlay">
        <div class="modal-content" style="text-align: center;">
          <div style="font-size: 54px; margin-bottom: 8px;">${isWin ? "🎯" : "🧐"}</div>
          <h2 style="font-size: 24px; font-weight: 900; color: ${isWin ? "var(--success)" : "var(--red)"};">
            ${isWin ? "Отличный выбор!" : "Нужно повторить!"}
          </h2>
          <p style="font-size: 15px; font-weight: 800; color: var(--ink); margin: 6px 0 14px 0;">
            Верных решений: <b>${this.correctCount}</b> из ${this.cards.length}<br/>
            ${isWin ? `Награда: <b style="color: var(--red);">+${this.config.reward} Б</b>!` : "Попробуй ещё раз, чтобы набрать нужное количество звёзд!"}
          </p>

          <div class="card" style="background: var(--yellow-light); border-color: var(--yellow); padding: 12px; margin-bottom: 16px; text-align: left;">
            <div style="font-size: 12px; font-weight: 900; color: #B45309;">💡 Знаешь ли ты?</div>
            <div style="font-size: 13px; font-weight: 700; color: var(--ink); margin-top: 4px;">${randomFact}</div>
          </div>

          <div style="display: flex; flex-direction: column; gap: 10px;">
            ${isWin && this.levelNum < 3 ? `
              <button class="btn btn-red" id="nw-next-btn">Уровень ${this.levelNum + 1} ➜</button>
            ` : ""}
            <button class="btn btn-yellow" id="nw-retry-btn">Сыграть снова</button>
            <button class="btn btn-white" id="nw-map-btn">К островам</button>
          </div>
        </div>
      </div>
    `;

    const nextBtn = document.getElementById("nw-next-btn");
    if (nextBtn) {
      nextBtn.onclick = () => {
        new NeedWantGame(this.container, this.levelNum + 1, this.onComplete);
      };
    }

    document.getElementById("nw-retry-btn").onclick = () => {
      new NeedWantGame(this.container, this.levelNum, this.onComplete);
    };

    document.getElementById("nw-map-btn").onclick = () => {
      this.onComplete(isWin);
    };
  }
}

if (typeof window !== "undefined") {
  window.NeedWantGame = NeedWantGame;
}

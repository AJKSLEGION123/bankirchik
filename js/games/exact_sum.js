// C:\Bankirchik\js\games\exact_sum.js
// Игра 6.7 «Точная сумма» (счёт монет и проверка сдачи)

class ExactSumGame {
  constructor(container, levelNum = 1, onComplete) {
    if (typeof levelNum === 'function') {
      onComplete = levelNum;
      levelNum = 1;
    }
    this.container = container;
    this.levelNum = Number(levelNum) || 1;
    this.onComplete = onComplete || (() => {});
    this.islandData = (window.BANKIR_DATA && window.BANKIR_DATA.islands) ? window.BANKIR_DATA.islands[6] : (window.BankirchikData ? window.BankirchikData.islands[6] : null);
    this.config = (this.islandData && this.islandData.levels) ? (this.islandData.levels[this.levelNum - 1] || this.islandData.levels[0]) : { name: "Точная сумма", rounds: 3, reward: 2 };

    this.round = 1;
    this.totalRounds = this.config.rounds;
    this.targetPrice = 0;
    this.customerPaid = 0;
    this.selectedCoins = [];
    this.correctCount = 0;

    this.init();
  }

  init() {
    this.startRound();
  }

  startRound() {
    this.selectedCoins = [];

    if (this.levelNum === 1) {
      // Цены 2..9 Б, монеты 1, 2, 5
      this.targetPrice = 2 + Math.floor(Math.random() * 8);
    } else if (this.levelNum === 2) {
      // Цены 11..19 Б, монеты 1, 2, 5, 10
      this.targetPrice = 11 + Math.floor(Math.random() * 9);
    } else {
      // Проверка сдачи: цена 4..16 Б, дали 10 или 20 Б
      this.customerPaid = Math.random() < 0.5 ? 10 : 20;
      this.targetPrice = this.customerPaid === 10 ? 3 + Math.floor(Math.random() * 6) : 11 + Math.floor(Math.random() * 8);
    }

    this.render();
  }

  render() {
    const isChangeMode = this.config.isChangeMode;
    const currentSum = this.selectedCoins.reduce((sum, c) => sum + c, 0);

    this.container.innerHTML = `
      <div class="game-view-wrapper">
        <div class="game-header-bar">
          <button class="icon-btn" id="exact-close-btn">✕</button>
          <div class="game-title-box">
            <div class="game-level-name">Остров 7: Точная сумма</div>
            <div class="game-sub-name">Раунд ${this.round} из ${this.totalRounds}</div>
          </div>
          <div class="coin-pill">★ ${this.correctCount} верных</div>
        </div>

        ${!isChangeMode ? `
          <!-- Режим набора суммы на прилавок -->
          <div class="card" style="margin-top: 10px; text-align: center; background: #FFF9E6; border-color: var(--yellow);">
            <div style="font-size: 13px; font-weight: 800; color: var(--muted);">Цена товара:</div>
            <div style="font-size: 32px; font-weight: 900; color: var(--red);">${this.targetPrice} Б</div>
            <div style="font-size: 14px; font-weight: 800; margin-top: 4px;">
              Положено на прилавок: <b style="color: ${currentSum === this.targetPrice ? 'var(--success)' : (currentSum > this.targetPrice ? 'var(--red)' : 'var(--ink)')};">${currentSum} Б</b>
            </div>
          </div>

          <!-- Прилавок с положенными монетами -->
          <div class="card" style="min-height: 120px; background: #FFF; text-align: center;">
            <div style="font-size: 12px; font-weight: 800; color: var(--muted); margin-bottom: 8px;">
              Монеты на прилавке (нажми, чтобы вернуть):
            </div>
            <div style="display: flex; gap: 8px; justify-content: center; flex-wrap: wrap; min-height: 44px;">
              ${this.selectedCoins.length === 0 ? `
                <div style="font-size: 12px; color: var(--muted); align-self: center;">Прилавок пуст. Добавь монеты снизу!</div>
              ` : this.selectedCoins.map((val, idx) => `
                <button class="btn-yellow on-counter-coin" data-idx="${idx}" style="width: 48px; height: 48px; border-radius: 50%; font-size: 16px; font-weight: 900; padding: 0; min-height: 48px;">
                  ${val}Б
                </button>
              `).join('')}
            </div>
          </div>

          <!-- Монеты в кошельке игрока -->
          <div class="card">
            <div style="font-size: 13px; font-weight: 800; color: var(--muted); margin-bottom: 10px; text-align: center;">
              Выбирай номинал монеты:
            </div>
            <div style="display: flex; gap: 12px; justify-content: center;">
              ${this.config.coins.map(val => `
                <button class="btn-yellow coin-picker-btn" data-val="${val}" style="width: 58px; height: 58px; border-radius: 50%; font-size: 20px; font-weight: 900; padding: 0; min-height: 58px;">
                  ${val}
                </button>
              `).join('')}
            </div>
          </div>

          <button class="btn btn-red" id="exact-pay-btn" style="margin-top: 10px;">
            ${currentSum === this.targetPrice ? "Оплатить точно! ➜" : (currentSum > this.targetPrice ? "Слишком много! Верни лишнее" : `Ещё нужно +${this.targetPrice - currentSum} Б`)}
          </button>
        ` : `
          <!-- Режим проверки сдачи -->
          <div class="card" style="margin-top: 10px; text-align: center;">
            <div style="font-size: 14px; font-weight: 800; color: var(--muted);">Покупка в магазине:</div>
            <div style="font-size: 22px; font-weight: 900; color: var(--ink); margin: 6px 0;">
              Цена покупки: <b style="color: var(--red);">${this.targetPrice} Б</b>
            </div>
            <div style="font-size: 16px; font-weight: 800; color: var(--ink);">
              Покупатель дал купюру: <b>${this.customerPaid} Б</b>
            </div>
            <div style="font-size: 15px; font-weight: 900; color: #B45309; margin-top: 12px;">
              Сколько сдачи должен выдать кассир?
            </div>
          </div>

          <!-- Варианты сдачи -->
          <div style="display: flex; flex-direction: column; gap: 10px; margin: 16px 0;">
            ${this.getChangeOptions().map(opt => `
              <button class="btn btn-white change-option-btn" data-val="${opt}" style="font-size: 18px;">
                Сдача: <b>${opt} Б</b>
              </button>
            `).join('')}
          </div>
        `}

        ${HamsterRenderer.renderWithBubble("Считай внимательно! Точный счёт помогает нигде не потерять свои монеты.", window.bankirState.data.child.equippedItem)}
      </div>
    `;

    document.getElementById("exact-close-btn").onclick = () => this.onComplete(false);

    if (!isChangeMode) {
      // Добавление монеты на прилавок
      this.container.querySelectorAll(".coin-picker-btn").forEach(btn => {
        btn.onclick = () => {
          const val = Number(btn.getAttribute("data-val"));
          this.selectedCoins.push(val);
          window.bankirAudio.playCoin();
          this.render();
        };
      });

      // Возврат монеты с прилавка
      this.container.querySelectorAll(".on-counter-coin").forEach(btn => {
        btn.onclick = () => {
          const idx = Number(btn.getAttribute("data-idx"));
          this.selectedCoins.splice(idx, 1);
          window.bankirAudio.playClick();
          this.render();
        };
      });

      // Оплата
      document.getElementById("exact-pay-btn").onclick = () => {
        if (currentSum === this.targetPrice) {
          window.bankirAudio.playCoin();
          this.correctCount++;
          this.nextRound();
        } else {
          window.bankirAudio.playError();
          window.bankirAudio.speak("Сумма на прилавке не совпадает с ценой!");
        }
      };
    } else {
      // Клик по варианту сдачи
      this.container.querySelectorAll(".change-option-btn").forEach(btn => {
        btn.onclick = () => {
          const chosen = Number(btn.getAttribute("data-val"));
          const realChange = this.customerPaid - this.targetPrice;

          if (chosen === realChange) {
            window.bankirAudio.playCoin();
            this.correctCount++;
          } else {
            window.bankirAudio.playError();
            window.bankirAudio.speak(`Ой! ${this.customerPaid} минус ${this.targetPrice} будет ${realChange} Б!`);
          }
          this.nextRound();
        };
      });
    }
  }

  getChangeOptions() {
    const real = this.customerPaid - this.targetPrice;
    const set = new Set([real]);
    while (set.size < 3) {
      const delta = (Math.random() < 0.5 ? 1 : -1) * (1 + Math.floor(Math.random() * 3));
      const fake = real + delta;
      if (fake > 0) set.add(fake);
    }
    return Array.from(set).sort(() => Math.random() - 0.5);
  }

  nextRound() {
    this.round++;
    if (this.round > this.totalRounds) {
      this.finishGame();
    } else {
      this.startRound();
    }
  }

  finishGame() {
    let isWin = false;
    if (this.levelNum <= 2) {
      isWin = this.correctCount === this.totalRounds;
    } else {
      isWin = this.correctCount >= 3;
    }

    if (isWin) {
      window.bankirAudio.playWin();
      window.bankirState.completeLevel(7, this.levelNum, this.config.reward);
    } else {
      window.bankirAudio.playError();
    }

    const randomFact = this.islandData.facts[Math.floor(Math.random() * this.islandData.facts.length)];

    this.container.innerHTML = `
      <div class="modal-overlay">
        <div class="modal-content" style="text-align: center;">
          <div style="font-size: 54px; margin-bottom: 8px;">${isWin ? "🪙" : "🔢"}</div>
          <h2 style="font-size: 24px; font-weight: 900; color: ${isWin ? "var(--success)" : "var(--red)"};">
            ${isWin ? "Мастер счёта!" : "Повторим тренировку?"}
          </h2>
          <p style="font-size: 15px; font-weight: 800; color: var(--ink); margin: 6px 0 14px 0;">
            Точных раундов: <b>${this.correctCount}</b> из ${this.totalRounds}<br/>
            ${isWin ? `Награда в кошелёк: <b style="color: var(--red);">+${this.config.reward} Б</b>!` : "Кассиру важна точность до копейки, попробуй ещё раз!"}
          </p>

          <div class="card" style="background: var(--yellow-light); border-color: var(--yellow); padding: 12px; margin-bottom: 16px; text-align: left;">
            <div style="font-size: 12px; font-weight: 900; color: #B45309;">💡 Знаешь ли ты?</div>
            <div style="font-size: 13px; font-weight: 700; color: var(--ink); margin-top: 4px;">${randomFact}</div>
          </div>

          <div style="display: flex; flex-direction: column; gap: 10px;">
            ${isWin && this.levelNum < 3 ? `
              <button class="btn btn-red" id="exact-next-btn">Уровень ${this.levelNum + 1} ➜</button>
            ` : ""}
            <button class="btn btn-yellow" id="exact-retry-btn">Посчитать снова</button>
            <button class="btn btn-white" id="exact-map-btn">К островам</button>
          </div>
        </div>
      </div>
    `;

    const nextBtn = document.getElementById("exact-next-btn");
    if (nextBtn) {
      nextBtn.onclick = () => {
        new ExactSumGame(this.container, this.levelNum + 1, this.onComplete);
      };
    }

    document.getElementById("exact-retry-btn").onclick = () => {
      new ExactSumGame(this.container, this.levelNum, this.onComplete);
    };

    document.getElementById("exact-map-btn").onclick = () => {
      this.onComplete(isWin);
    };
  }
}

if (typeof window !== "undefined") {
  window.ExactSumGame = ExactSumGame;
}

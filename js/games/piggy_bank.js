// C:\Bankirchik\js\games\piggy_bank.js
// Игра 6.3 «Копилка» (3 режима: Первая копилка, Неделя карманных, Вклад в банке)

class PiggyBankGame {
  constructor(container, levelNum = 1, onComplete) {
    if (typeof levelNum === 'function') {
      onComplete = levelNum;
      levelNum = 1;
    }
    this.container = container;
    this.levelNum = Number(levelNum) || 1;
    this.onComplete = onComplete || (() => {});
    this.islandData = (window.BANKIR_DATA && window.BANKIR_DATA.islands) ? window.BANKIR_DATA.islands[2] : (window.BankirchikData ? window.BankirchikData.islands[2] : null);
    this.config = (this.islandData && this.islandData.levels) ? (this.islandData.levels[this.levelNum - 1] || this.islandData.levels[0]) : { name: "Копилка", reward: 2 };

    this.init();
  }

  init() {
    if (this.levelNum === 1) {
      this.initMode1FirstPiggy();
    } else if (this.levelNum === 2) {
      this.initMode2PocketWeek();
    } else {
      this.initMode3BankDeposit();
    }
  }

  // РЕЖИМ 1: Первая копилка
  initMode1FirstPiggy() {
    let walletCoins = Math.max(window.bankirState.data.wallet, 6);
    let pigCoins = 0;
    let bankBonus = 0;

    const render = () => {
      bankBonus = Math.floor(pigCoins / 3);
      const pigScale = 1 + Math.min(pigCoins * 0.05, 0.6);

      this.container.innerHTML = `
        <div class="game-view-wrapper">
          <div class="game-header-bar">
            <button class="icon-btn" id="pig-close-btn">✕</button>
            <div class="game-title-box">
              <div class="game-level-name">Остров 3: Копилка</div>
              <div class="game-sub-name">Уровень 1: Первая копилка</div>
            </div>
            <div class="coin-pill">Бонус: +${bankBonus} Б</div>
          </div>

          <div class="card" style="margin-top: 10px; text-align: center;">
            <div style="font-size: 15px; font-weight: 800; color: var(--ink);">
              Перекладывай монетки в свинку! Банк дарит <b>+1 Б за каждые 3 отложенные</b>!
            </div>
            <div style="font-size: 13px; font-weight: 900; color: var(--red); margin-top: 4px;">
              Отложено: ${pigCoins} Б | Бонус банка: +${bankBonus} Б
            </div>
          </div>

          <!-- Свинка-копилка по центру -->
          <div style="height: 240px; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative;">
            <div id="pig-visual" style="font-size: 80px; transform: scale(${pigScale}); transition: transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275); cursor: pointer;">
              🐷
            </div>
            <div class="coin-pill" style="margin-top: 15px; font-size: 18px;">
              🪙 В свинке: <b>${pigCoins}</b> Б
            </div>
          </div>

          <!-- Монеты в кошельке для отправки -->
          <div class="card" style="background: #FFF9E6;">
            <div style="font-size: 13px; font-weight: 800; color: var(--muted); margin-bottom: 8px;">
              В кошельке: <b>${walletCoins}</b> Б (нажимай, чтобы отложить):
            </div>
            <div style="display: flex; gap: 8px; justify-content: center; flex-wrap: wrap;">
              ${Array.from({ length: walletCoins }).map((_, i) => `
                <button class="coin-click-item btn-yellow" data-idx="${i}" style="width: 44px; height: 44px; border-radius: 50%; font-size: 18px; padding: 0; min-height: 44px;">
                  🪙
                </button>
              `).join('')}
            </div>
          </div>

          <button class="btn btn-red" id="pig-finish-btn" style="margin-top: 8px;">
            ${pigCoins >= 3 ? `Завершить и забрать +${bankBonus + 3} Б` : "Отложи хотя бы 3 монетки!"}
          </button>

          ${HamsterRenderer.renderWithBubble("Смотри, как свинка растёт от каждой монетки! Копить выгодно!", window.bankirState.data.child.equippedItem)}
        </div>
      `;

      document.getElementById("pig-close-btn").onclick = () => this.onComplete(false);

      // Клик по монетке
      const coinBtns = this.container.querySelectorAll(".coin-click-item");
      coinBtns.forEach(btn => {
        btn.onclick = () => {
          if (walletCoins > 0) {
            walletCoins--;
            pigCoins++;
            window.bankirAudio.playCoin();
            render();
          }
        };
      });

      // Кнопка завершения
      document.getElementById("pig-finish-btn").onclick = () => {
        if (pigCoins >= 3) {
          this.showResultModal(true, `Ты отложил ${pigCoins} монет и получил подарок банка +${bankBonus} Б!`);
        } else {
          window.bankirAudio.speak("Отложи в свинку хотя бы 3 монетки, чтобы банк дал бонус!");
        }
      };
    };

    render();
  }

  // РЕЖИМ 2: Неделя карманных
  initMode2PocketWeek() {
    const days = [
      { name: "Понедельник", event: { type: "tempt", title: "Мороженое в парке", emoji: "🍦", cost: 2 } },
      { name: "Вторник", event: { type: "tempt", title: "Скин в игре", emoji: "🎮", cost: 3 } },
      { name: "Среда", event: { type: "gift", title: "Подарок от бабушки!", emoji: "👵", gift: 2 } },
      { name: "Четверг", event: { type: "tempt", title: "Пачка чипсов и кола", emoji: "🍟", cost: 2 } },
      { name: "Пятница", event: { type: "tempt", title: "Новая машинка-брелок", emoji: "🏎️", cost: 3 } }
    ];

    let currentDayIdx = 0;
    let piggySaved = 0;
    let wallet = 0;
    const spentHistory = [];

    const renderDay = () => {
      const day = days[currentDayIdx];
      // Каждый день мама даёт +2 Б карманных!
      wallet += 2;

      this.container.innerHTML = `
        <div class="game-view-wrapper">
          <div class="game-header-bar">
            <button class="icon-btn" id="week-close-btn">✕</button>
            <div class="game-title-box">
              <div class="game-level-name">Остров 3: Копилка</div>
              <div class="game-sub-name">Неделя карманных (День ${currentDayIdx + 1}/5)</div>
            </div>
            <div class="coin-pill">🐷 ${piggySaved} Б</div>
          </div>

          <div class="card" style="margin-top: 10px; text-align: center;">
            <div style="font-size: 13px; font-weight: 800; color: var(--muted);">День недели:</div>
            <div style="font-size: 20px; font-weight: 900; color: var(--red);">${day.name}</div>
            <div style="font-size: 14px; font-weight: 800; margin-top: 4px;">
              Мама дала +2 Б карманных! В кошельке: <b>${wallet} Б</b>.
            </div>
          </div>

          <!-- Карточка события дня -->
          <div class="card" style="background: #FFF; text-align: center; padding: 22px 14px;">
            <div style="font-size: 50px;">${day.event.emoji}</div>
            <div style="font-size: 18px; font-weight: 900; color: var(--ink); margin-top: 8px;">
              ${day.event.title}
            </div>
            <div style="font-size: 14px; font-weight: 800; color: ${day.event.type === 'gift' ? 'var(--success)' : 'var(--red)'}; margin-top: 4px;">
              ${day.event.type === 'gift' ? `+${day.event.gift} Б в подарок!` : `Цена: ${day.event.cost} Б`}
            </div>

            <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 18px;">
              ${day.event.type === "tempt" ? `
                <button class="btn btn-pink" id="buy-tempt-btn">Купить за ${day.event.cost} Б</button>
                <button class="btn btn-yellow" id="save-all-btn">Отложить всё в копилку ➜</button>
              ` : `
                <button class="btn btn-yellow" id="accept-gift-btn">Ура! Отложить в копилку ➜</button>
              `}
            </div>
          </div>

          ${HamsterRenderer.renderWithBubble("Цель недели — накопить не меньше 6 Б в копилке к пятнице!", window.bankirState.data.child.equippedItem)}
        </div>
      `;

      document.getElementById("week-close-btn").onclick = () => this.onComplete(false);

      const nextDay = () => {
        currentDayIdx++;
        if (currentDayIdx >= 5) {
          // Итог недели
          const isWin = piggySaved >= 6;
          let msg = `К пятнице в копилке: ${piggySaved} Б (цель: 6 Б)!`;
          if (!isWin) {
            msg += `<br/>Деньги ушли на соблазны: ${spentHistory.join(', ')}`;
          }
          this.showResultModal(isWin, msg);
        } else {
          renderDay();
        }
      };

      if (day.event.type === "tempt") {
        document.getElementById("buy-tempt-btn").onclick = () => {
          if (wallet >= day.event.cost) {
            wallet -= day.event.cost;
            spentHistory.push(day.event.title);
            window.bankirAudio.playClick();
            nextDay();
          } else {
            window.bankirAudio.speak("В кошельке не хватает монет на покупку!");
          }
        };

        document.getElementById("save-all-btn").onclick = () => {
          piggySaved += wallet;
          wallet = 0;
          window.bankirAudio.playCoin();
          nextDay();
        };
      } else {
        document.getElementById("accept-gift-btn").onclick = () => {
          piggySaved += (wallet + day.event.gift);
          wallet = 0;
          window.bankirAudio.playCoin();
          nextDay();
        };
      }
    };

    renderDay();
  }

  // РЕЖИМ 3: Вклад в банке (Сложные проценты)
  initMode3BankDeposit() {
    let deposit = 6;
    let pillow = 4;
    let totalStart = 10;
    let month = 0;
    let isSimulating = false;

    const render = () => {
      this.container.innerHTML = `
        <div class="game-view-wrapper">
          <div class="game-header-bar">
            <button class="icon-btn" id="dep-close-btn">✕</button>
            <div class="game-title-box">
              <div class="game-level-name">Остров 3: Копилка</div>
              <div class="game-sub-name">Вклад в банке (Месяц ${month}/4)</div>
            </div>
            <div class="coin-pill">🏦 Всего: ${deposit + pillow} Б</div>
          </div>

          <div class="card" style="margin-top: 10px; text-align: center;">
            <div style="font-size: 15px; font-weight: 800; color: var(--ink);">
              Банк начисляет <b>+20% каждый месяц</b>! Решай, сколько положить на вклад, а сколько оставить под подушкой.
            </div>
            <div style="font-size: 13px; font-weight: 900; color: var(--red); margin-top: 4px;">
              Цель через 4 месяца: собрать ≥ 15 Б!
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 14px 0;">
            <!-- Вклад -->
            <div class="card" style="text-align: center; background: #FEF3C7; border-color: var(--yellow);">
              <div style="font-size: 36px;">🏦</div>
              <div style="font-weight: 900; font-size: 15px; margin-top: 4px;">На вкладе</div>
              <div style="font-size: 24px; font-weight: 900; color: #B45309; margin: 6px 0;">${deposit} Б</div>
              <div style="font-size: 11px; font-weight: 700; color: var(--muted);">Растёт на +20% в месяц</div>
            </div>

            <!-- Под подушкой -->
            <div class="card" style="text-align: center; background: #F3F4F6;">
              <div style="font-size: 36px;">🛏️</div>
              <div style="font-weight: 900; font-size: 15px; margin-top: 4px;">Под подушкой</div>
              <div style="font-size: 24px; font-weight: 900; color: var(--ink); margin: 6px 0;">${pillow} Б</div>
              <div style="font-size: 11px; font-weight: 700; color: var(--muted);">Лежит без процентов</div>
            </div>
          </div>

          ${month === 0 ? `
            <div class="card" style="text-align: center;">
              <div style="font-size: 13px; font-weight: 800; color: var(--muted); margin-bottom: 8px;">
                Распредели 10 стартовых монет:
              </div>
              <div style="display: flex; justify-content: center; align-items: center; gap: 12px;">
                <button class="btn btn-yellow btn-sm" id="btn-less-dep" style="width: 50px;">−</button>
                <span style="font-size: 18px; font-weight: 900;">${deposit} Б на вклад</span>
                <button class="btn btn-yellow btn-sm" id="btn-more-dep" style="width: 50px;">+</button>
              </div>
            </div>

            <button class="btn btn-red" id="start-deposit-sim-btn" style="margin-top: 10px;">
              Положить в банк на 4 месяца ➜
            </button>
          ` : `
            <div class="card" style="text-align: center; background: var(--success-light); border-color: var(--success);">
              <div style="font-size: 16px; font-weight: 900; color: var(--success);">
                ${month < 4 ? `Идёт начисление процентов... Месяц ${month}` : "4 месяца завершены!"}
              </div>
            </div>
          `}

          ${HamsterRenderer.renderWithBubble("Деньги на вкладе работают сами по себе благодаря процентам!", window.bankirState.data.child.equippedItem)}
        </div>
      `;

      document.getElementById("dep-close-btn").onclick = () => this.onComplete(false);

      if (month === 0) {
        document.getElementById("btn-less-dep").onclick = () => {
          if (deposit > 1) {
            deposit--;
            pillow++;
            render();
          }
        };

        document.getElementById("btn-more-dep").onclick = () => {
          if (pillow > 0) {
            deposit++;
            pillow--;
            render();
          }
        };

        document.getElementById("start-deposit-sim-btn").onclick = () => {
          isSimulating = true;
          this.runDepositMonths(deposit, pillow);
        };
      }
    };

    render();
  }

  runDepositMonths(startDep, pillow) {
    let dep = startDep;
    let m = 1;

    const interval = setInterval(() => {
      // Каждый месяц: вклад += floor(вклад / 5)
      const interest = Math.floor(dep / 5);
      dep += interest;
      window.bankirAudio.playCoin();

      m++;
      if (m > 4) {
        clearInterval(interval);
        const total = dep + pillow;
        const isWin = total >= 15;
        this.showResultModal(isWin, `Через 4 месяца у тебя: ${total} Б (вклад ${dep} Б + под подушкой ${pillow} Б)!`);
      }
    }, 1300);
  }

  showResultModal(isWin, text) {
    if (isWin) {
      window.bankirAudio.playWin();
      window.bankirState.completeLevel(3, this.levelNum, this.config.reward);
    } else {
      window.bankirAudio.playError();
    }

    const randomFact = this.islandData.facts[Math.floor(Math.random() * this.islandData.facts.length)];

    this.container.innerHTML = `
      <div class="modal-overlay">
        <div class="modal-content" style="text-align: center;">
          <div style="font-size: 54px; margin-bottom: 8px;">${isWin ? "🐷" : "🪙"}</div>
          <h2 style="font-size: 24px; font-weight: 900; color: ${isWin ? "var(--success)" : "var(--red)"};">
            ${isWin ? "Уровень пройден!" : "Попробуем ещё раз?"}
          </h2>
          <p style="font-size: 15px; font-weight: 800; color: var(--ink); margin: 6px 0 14px 0;">
            ${text}<br/>
            ${isWin ? `Награда в копилку: <b style="color: var(--red);">+${this.config.reward} Б</b>!` : ""}
          </p>

          <div class="card" style="background: var(--yellow-light); border-color: var(--yellow); padding: 12px; margin-bottom: 16px; text-align: left;">
            <div style="font-size: 12px; font-weight: 900; color: #B45309;">💡 Знаешь ли ты?</div>
            <div style="font-size: 13px; font-weight: 700; color: var(--ink); margin-top: 4px;">${randomFact}</div>
          </div>

          <div style="display: flex; flex-direction: column; gap: 10px;">
            ${isWin && this.levelNum < 3 ? `
              <button class="btn btn-red" id="pig-next-btn">Уровень ${this.levelNum + 1} ➜</button>
            ` : ""}
            <button class="btn btn-yellow" id="pig-retry-btn">Играть снова</button>
            <button class="btn btn-white" id="pig-map-btn">К островам</button>
          </div>
        </div>
      </div>
    `;

    const nextBtn = document.getElementById("pig-next-btn");
    if (nextBtn) {
      nextBtn.onclick = () => {
        new PiggyBankGame(this.container, this.levelNum + 1, this.onComplete);
      };
    }

    document.getElementById("pig-retry-btn").onclick = () => {
      new PiggyBankGame(this.container, this.levelNum, this.onComplete);
    };

    document.getElementById("pig-map-btn").onclick = () => {
      this.onComplete(isWin);
    };
  }
}

if (typeof window !== "undefined") {
  window.PiggyBankGame = PiggyBankGame;
}

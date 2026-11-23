// C:\Bankirchik\js\games\first_bank.js
// Игра 6.11: Первый банк (симулятор банковского вклада на 6 недель)

class FirstBankGame {
  constructor(container, levelOrComplete, maybeComplete) {
    this.container = container;
    this.onComplete = typeof maybeComplete === 'function' ? maybeComplete : (typeof levelOrComplete === 'function' ? levelOrComplete : (() => {}));
    this.week = 1;
    this.totalWeeks = 6;
    this.goalAmount = 30; // Велосипед
    this.wallet = 4;      // Стартовые в кошельке
    this.deposit = 0;     // Во вкладе
    this.interestTotal = 0;
    
    this.temptations = [
      { name: 'Крутое мороженое 🍦', cost: 2, desc: 'На улице жара, все едят мороженое!' },
      { name: 'Набор крутых стикеров ✨', cost: 1, desc: 'Одноклассники хвастаются в школе.' },
      { name: 'Хрустящие чипсы 🥔', cost: 2, desc: 'Очень хочется перекусить после уроков.' },
      { name: 'Пин с динозавром 🦕', cost: 1, desc: 'Яркий значок на рюкзак!' },
      { name: 'Газировка с пузырьками 🥤', cost: 2, desc: 'Шипит и манит на витрине!' },
      { name: 'Светящийся брелок 🔑', cost: 1, desc: 'Красиво светится в темноте!' }
    ];

    this.currentTemptation = null;
    this.temptationHandled = false;
    this.interestEarnedThisWeek = 0;
    this.pocketMoneyAdded = false;

    this.init();
  }

  init() {
    this.render();
    if (window.AudioController) {
      window.AudioController.speak('Добро пожаловать в Первый Банк! Наша цель — накопить 30 Б на крутой велосипед за 6 недель. Вклад приносит 20% каждую неделю!');
    }
  }

  render() {
    const totalMoney = this.wallet + this.deposit;
    const progressPct = Math.min(100, Math.round((totalMoney / this.goalAmount) * 100));

    this.container.innerHTML = `
      <div class="game-container first-bank-game">
        <div class="game-header">
          <div class="game-stat-badge">
            <span>📅 Неделя: <strong>${this.week}</strong> / ${this.totalWeeks}</span>
          </div>
          <div class="game-stat-badge">
            <span>🎯 Цель: 🚲 <strong>${this.goalAmount} Б</strong></span>
          </div>
          <div class="game-stat-badge">
            <span>💰 Всего: <strong>${totalMoney} Б</strong></span>
          </div>
        </div>

        <!-- Прогресс-бар до велосипеда -->
        <div class="card progress-card" style="margin-bottom: 12px; padding: 12px;">
          <div style="display: flex; justify-content: space-between; font-weight: 800; font-size: 13px; margin-bottom: 6px;">
            <span>Накоплено: ${totalMoney} Б из ${this.goalAmount} Б</span>
            <span style="color: var(--color-red);">${progressPct}%</span>
          </div>
          <div class="progress-bar-track">
            <div class="progress-bar-fill" style="width: ${progressPct}%; background: linear-gradient(90deg, #FFC21A, #3FAE5A);"></div>
          </div>
        </div>

        <!-- Панель счетов: Кошелек vs Вклад -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 14px;">
          <div class="card" style="text-align: center; border-top: 4px solid #FFC21A;">
            <div style="font-size: 28px; margin-bottom: 4px;">👛</div>
            <div style="font-size: 12px; color: var(--color-muted); font-weight: 800; text-transform: uppercase;">В кошельке</div>
            <div style="font-size: 24px; font-weight: 900; color: var(--color-ink);">${this.wallet} Б</div>
            <div style="font-size: 11px; color: var(--color-muted); margin-top: 4px;">Карманные расходы</div>
          </div>

          <div class="card" style="text-align: center; border-top: 4px solid var(--color-success); background: #F6FCF7;">
            <div style="font-size: 28px; margin-bottom: 4px;">🏦</div>
            <div style="font-size: 12px; color: #2B7A3E; font-weight: 800; text-transform: uppercase;">Во вкладе (+20%)</div>
            <div style="font-size: 24px; font-weight: 900; color: var(--color-success);">${this.deposit} Б</div>
            <div style="font-size: 11px; color: #2B7A3E; margin-top: 4px;">Приносит +1 Б за каждые 5 Б</div>
          </div>
        </div>

        <!-- Центральный интерактивный экран недели -->
        <div id="bank-step-container">
          ${this.getStepContent()}
        </div>
      </div>
    `;

    this.attachEvents();
  }

  getStepContent() {
    if (!this.pocketMoneyAdded) {
      return `
        <div class="card" style="text-align: center; padding: 20px;">
          <div style="font-size: 40px; margin-bottom: 8px;">💌</div>
          <h3 style="font-size: 18px; margin-bottom: 6px;">Начало недели ${this.week}!</h3>
          <p style="font-size: 14px; color: var(--color-muted); margin-bottom: 16px;">
            Мама дала тебе карманные деньги на неделю: <strong>+3 Б</strong>!
          </p>
          <button class="btn btn-primary" id="btn-receive-allowance" style="width: 100%;">
            Получить 3 Б в кошелёк
          </button>
        </div>
      `;
    }

    if (!this.temptationHandled) {
      const t = this.temptations[this.week - 1] || this.temptations[0];
      this.currentTemptation = t;
      return `
        <div class="card" style="padding: 16px; border: 2px dashed #FFC21A; background: #FFFDF5;">
          <div style="display: flex; gap: 12px; align-items: center; margin-bottom: 10px;">
            <div style="font-size: 36px;">🍩</div>
            <div>
              <div style="font-size: 11px; color: var(--color-red); font-weight: 800; text-transform: uppercase;">Соблазн недели!</div>
              <h4 style="font-size: 16px; font-weight: 900; margin: 0;">${t.name}</h4>
            </div>
          </div>
          <p style="font-size: 13px; color: var(--color-muted); margin-bottom: 14px;">
            ${t.desc} Цена: <strong style="color: var(--color-red);">${t.cost} Б</strong>.
          </p>
          <div style="display: flex; gap: 10px;">
            <button class="btn btn-secondary" id="btn-buy-temptation" style="flex: 1; font-size: 13px;" ${this.wallet < t.cost ? 'disabled' : ''}>
              Купить (-${t.cost} Б)
            </button>
            <button class="btn btn-primary" id="btn-skip-temptation" style="flex: 1.2; font-size: 13px;">
              Устоять! (0 Б)
            </button>
          </div>
        </div>
      `;
    }

    // Экран управления депозитом
    const potentialInterest = Math.floor(this.deposit / 5);
    return `
      <div class="card" style="padding: 16px;">
        <h4 style="font-size: 15px; font-weight: 900; margin-bottom: 8px;">Управление деньгами недели</h4>
        <p style="font-size: 12px; color: var(--color-muted); margin-bottom: 14px;">
          Положи деньги на вклад, чтобы получить <strong>+20%</strong> в конце недели!
        </p>

        <!-- Быстрые действия -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 14px;">
          <button class="btn btn-secondary" id="btn-deposit-all" style="font-size: 12px;" ${this.wallet <= 0 ? 'disabled' : ''}>
            Вложить всё (${this.wallet} Б)
          </button>
          <button class="btn btn-secondary" id="btn-deposit-1" style="font-size: 12px;" ${this.wallet < 1 ? 'disabled' : ''}>
            Вложить 1 Б
          </button>
          <button class="btn btn-secondary" id="btn-withdraw-all" style="font-size: 12px;" ${this.deposit <= 0 ? 'disabled' : ''}>
            Забрать всё
          </button>
          <button class="btn btn-secondary" id="btn-withdraw-1" style="font-size: 12px;" ${this.deposit < 1 ? 'disabled' : ''}>
            Снять 1 Б
          </button>
        </div>

        <div style="background: #E3F6E8; border-radius: 12px; padding: 10px; margin-bottom: 14px; text-align: center; font-size: 12px; color: #2B7A3E; font-weight: 800;">
          Ожидаемые проценты за неделю: +${potentialInterest} Б
        </div>

        <button class="btn btn-primary" id="btn-finish-week" style="width: 100%;">
          Завершить неделю ${this.week} ➡️
        </button>
      </div>
    `;
  }

  attachEvents() {
    const receiveBtn = this.container.querySelector('#btn-receive-allowance');
    if (receiveBtn) {
      receiveBtn.addEventListener('click', () => {
        this.wallet += 3;
        this.pocketMoneyAdded = true;
        if (window.AudioController) window.AudioController.coin();
        this.render();
      });
    }

    const buyTemptationBtn = this.container.querySelector('#btn-buy-temptation');
    if (buyTemptationBtn) {
      buyTemptationBtn.addEventListener('click', () => {
        if (this.wallet >= this.currentTemptation.cost) {
          this.wallet -= this.currentTemptation.cost;
          this.temptationHandled = true;
          if (window.AudioController) {
            window.AudioController.click();
            window.AudioController.speak('Ты купил вкусняшку! Приятно, но деньги потрачены.');
          }
          this.render();
        }
      });
    }

    const skipTemptationBtn = this.container.querySelector('#btn-skip-temptation');
    if (skipTemptationBtn) {
      skipTemptationBtn.addEventListener('click', () => {
        this.temptationHandled = true;
        if (window.AudioController) {
          window.AudioController.win();
          window.AudioController.speak('Красавчик! Сберегли деньги для велика!');
        }
        this.render();
      });
    }

    const depAllBtn = this.container.querySelector('#btn-deposit-all');
    if (depAllBtn) {
      depAllBtn.addEventListener('click', () => {
        this.deposit += this.wallet;
        this.wallet = 0;
        if (window.AudioController) window.AudioController.coin();
        this.render();
      });
    }

    const dep1Btn = this.container.querySelector('#btn-deposit-1');
    if (dep1Btn) {
      dep1Btn.addEventListener('click', () => {
        if (this.wallet >= 1) {
          this.wallet -= 1;
          this.deposit += 1;
          if (window.AudioController) window.AudioController.coin();
          this.render();
        }
      });
    }

    const withAllBtn = this.container.querySelector('#btn-withdraw-all');
    if (withAllBtn) {
      withAllBtn.addEventListener('click', () => {
        this.wallet += this.deposit;
        this.deposit = 0;
        if (window.AudioController) window.AudioController.coin();
        this.render();
      });
    }

    const with1Btn = this.container.querySelector('#btn-withdraw-1');
    if (with1Btn) {
      with1Btn.addEventListener('click', () => {
        if (this.deposit >= 1) {
          this.deposit -= 1;
          this.wallet += 1;
          if (window.AudioController) window.AudioController.coin();
          this.render();
        }
      });
    }

    const finishWeekBtn = this.container.querySelector('#btn-finish-week');
    if (finishWeekBtn) {
      finishWeekBtn.addEventListener('click', () => {
        this.completeWeek();
      });
    }
  }

  completeWeek() {
    // Начисление процентов: +20% (округление вниз: floor(deposit / 5))
    const interest = Math.floor(this.deposit / 5);
    this.deposit += interest;
    this.interestTotal += interest;
    this.interestEarnedThisWeek = interest;

    if (window.AudioController) {
      window.AudioController.win();
    }

    // Модальное окно отчета недели
    this.showWeeklyReportModal(interest);
  }

  showWeeklyReportModal(interest) {
    const total = this.wallet + this.deposit;
    const remaining = Math.max(0, this.goalAmount - total);

    const modal = document.createElement('div');
    modal.className = 'modal-backdrop';
    modal.innerHTML = `
      <div class="modal-card">
        <div style="font-size: 40px; margin-bottom: 8px;">📊</div>
        <h3 class="modal-title">Итоги недели ${this.week}!</h3>
        <div style="background: #FFF8D6; border-radius: 14px; padding: 14px; margin-bottom: 16px; text-align: left; font-size: 13px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
            <span>Во вкладе:</span>
            <strong>${this.deposit} Б</strong>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 6px; color: var(--color-success);">
            <span>Банк начислил процентов:</span>
            <strong>+${interest} Б 🎉</strong>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
            <span>В кошельке:</span>
            <strong>${this.wallet} Б</strong>
          </div>
          <hr style="border: none; border-top: 1px dashed #EAC54F; margin: 8px 0;">
          <div style="display: flex; justify-content: space-between; font-weight: 900; font-size: 15px;">
            <span>Всего накоплено:</span>
            <span style="color: var(--color-red);">${total} Б</span>
          </div>
          <div style="font-size: 12px; color: var(--color-muted); margin-top: 6px; text-align: center;">
            ${remaining > 0 ? `Осталось до велика: ${remaining} Б` : 'Ура! Ты уже можешь купить велик! 🚲'}
          </div>
        </div>
        <button class="btn btn-primary" id="btn-next-week-modal" style="width: 100%;">
          ${this.week < this.totalWeeks ? `Перейти к неделе ${this.week + 1} ➡️` : 'Посмотреть финал игры! 🏆'}
        </button>
      </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector('#btn-next-week-modal').addEventListener('click', () => {
      modal.remove();
      if (this.week < this.totalWeeks) {
        this.week += 1;
        this.pocketMoneyAdded = false;
        this.temptationHandled = false;
        this.render();
      } else {
        this.finishGame();
      }
    });
  }

  finishGame() {
    const total = this.wallet + this.deposit;
    const isWin = total >= this.goalAmount;

    this.container.innerHTML = `
      <div class="card" style="text-align: center; padding: 24px;">
        <div style="font-size: 54px; margin-bottom: 12px;">${isWin ? '🚲🎉' : '🏦🧐'}</div>
        <h2 style="font-size: 22px; font-weight: 900; color: ${isWin ? 'var(--color-success)' : 'var(--color-red)'}; margin-bottom: 8px;">
          ${isWin ? 'Победа! Велосипед твой!' : 'Не хватило совсем чуть-чуть!'}
        </h2>
        <p style="font-size: 14px; color: var(--color-muted); margin-bottom: 16px;">
          ${isWin 
            ? `Ты собрал <strong>${total} Б</strong> (из них проценты от банка: <strong>+${this.interestTotal} Б</strong>)! Вклад реально работает!`
            : `Ты накопил <strong>${total} Б</strong> из ${this.goalAmount} Б. Чтобы копить быстрее, нужно меньше поддаваться соблазнам и класть деньги во вклад раньше!`}
        </p>

        <div style="background: #FFF8D6; border-radius: 16px; padding: 14px; margin-bottom: 20px; font-size: 13px;">
          <div>Всего заработано на процентах: <strong>+${this.interestTotal} Б</strong></div>
          <div>Итоговый капитал: <strong>${total} Б</strong></div>
        </div>

        <div style="display: flex; gap: 10px;">
          ${!isWin ? `
            <button class="btn btn-secondary" id="btn-retry-bank" style="flex: 1;">
              Попробовать ещё раз
            </button>
          ` : ''}
          <button class="btn btn-primary" id="btn-claim-bank-reward" style="flex: 1.5;">
            ${isWin ? 'Забрать +5 Б и звезду ⭐' : 'Выйти на карту'}
          </button>
        </div>
      </div>
    `;

    const retryBtn = this.container.querySelector('#btn-retry-bank');
    if (retryBtn) {
      retryBtn.addEventListener('click', () => {
        this.week = 1;
        this.wallet = 4;
        this.deposit = 0;
        this.interestTotal = 0;
        this.pocketMoneyAdded = false;
        this.temptationHandled = false;
        this.render();
      });
    }

    const claimBtn = this.container.querySelector('#btn-claim-bank-reward');
    if (claimBtn) {
      claimBtn.addEventListener('click', () => {
        if (isWin) {
          if (window.StateManager) {
            window.StateManager.addPiggy(5, 'Победа в Первом Банке: накоплено на велосипед!');
            window.StateManager.addStar(7);
          }
          if (window.AudioController) {
            window.AudioController.confetti();
            window.AudioController.win();
          }
        }
        if (this.onComplete) this.onComplete(isWin);
      });
    }
  }
}

window.FirstBankGame = FirstBankGame;

// C:\Bankirchik\js\games\lemonade_stand.js
// Игра 6.10 «Лимонадная лавка» (бизнес-симулятор на 5 дней)

class LemonadeStandGame {
  constructor(container, levelOrComplete, maybeComplete) {
    this.container = container;
    this.onComplete = typeof maybeComplete === 'function' ? maybeComplete : (typeof levelOrComplete === 'function' ? levelOrComplete : (() => {}));

    this.day = 1;
    this.cash = 10; // Стартовая касса 10 Б
    this.goal = 35; // Цель 35 Б
    this.history = [];

    this.weathers = [
      { name: "Жара", emoji: "☀️", baseCustomers: 14, desc: "Отличный день для холодного лимонада!" },
      { name: "Тепло", emoji: "🌤️", baseCustomers: 11, desc: "Приятная тёплая погода, люди гуляют." },
      { name: "Облачно", emoji: "⛅", baseCustomers: 8, desc: "Ветерок и облака, спрос умеренный." },
      { name: "Дождь", emoji: "🌧️", baseCustomers: 4, desc: "Идёт дождь, на улице мало прохожих." }
    ];

    this.init();
  }

  init() {
    this.startDay();
  }

  startDay() {
    // Случайная погода
    const weather = this.weathers[Math.floor(Math.random() * this.weathers.length)];
    let cupsToMake = Math.min(this.cash, 6);
    let cupPrice = 2;

    const renderPlanning = () => {
      this.container.innerHTML = `
        <div class="game-view-wrapper">
          <div class="game-header-bar">
            <button class="icon-btn" id="lem-close-btn">✕</button>
            <div class="game-title-box">
              <div class="game-level-name">Лимонадная лавка 🍋</div>
              <div class="game-sub-name">День ${this.day} из 5 • Утро</div>
            </div>
            <div class="coin-pill">Касса: <b>${this.cash}</b> Б</div>
          </div>

          <!-- Прогноз погоды -->
          <div class="card" style="margin-top: 10px; text-align: center; background: #FFFBEB; border-color: #F59E0B;">
            <div style="font-size: 50px;">${weather.emoji}</div>
            <div style="font-size: 18px; font-weight: 900; color: var(--ink); margin-top: 4px;">
              Погода: ${weather.name}
            </div>
            <div style="font-size: 13px; font-weight: 700; color: var(--muted); margin-top: 2px;">
              ${weather.desc} (ожидается ~${weather.baseCustomers} покупателей)
            </div>
          </div>

          <!-- Планирование производства и цены -->
          <div class="card">
            <!-- Стаканы -->
            <div style="margin-bottom: 16px;">
              <div style="display: flex; justify-content: space-between; font-size: 14px; font-weight: 900; margin-bottom: 6px;">
                <span>Сколько стаканов приготовить?</span>
                <span style="color: var(--red);">${cupsToMake} шт. (${cupsToMake} Б)</span>
              </div>
              <div style="font-size: 11px; font-weight: 700; color: var(--muted); margin-bottom: 8px;">
                Себестоимость: 1 стакан = 1 Б (не больше кассы ${this.cash} Б)
              </div>
              <div style="display: flex; align-items: center; justify-content: center; gap: 14px;">
                <button class="btn btn-yellow btn-sm" id="btn-less-cups" style="width: 44px;">−</button>
                <span style="font-size: 20px; font-weight: 900;">${cupsToMake} 🥤</span>
                <button class="btn btn-yellow btn-sm" id="btn-more-cups" style="width: 44px;">+</button>
              </div>
            </div>

            <hr style="border: 0; border-top: 1px dashed #E5E7EB; margin: 12px 0;" />

            <!-- Цена -->
            <div>
              <div style="display: flex; justify-content: space-between; font-size: 14px; font-weight: 900; margin-bottom: 6px;">
                <span>Цена за стакан:</span>
                <span style="color: var(--red); font-size: 16px;">${cupPrice} Б</span>
              </div>
              <div style="display: flex; gap: 8px; justify-content: center; margin-top: 8px;">
                ${[1, 2, 3, 4].map(p => `
                  <button class="btn ${p === cupPrice ? 'btn-red' : 'btn-white'} btn-sm price-btn" data-price="${p}" style="flex: 1; font-size: 15px;">
                    ${p} Б
                  </button>
                `).join('')}
              </div>
            </div>
          </div>

          <button class="btn btn-red" id="lem-open-btn" style="margin-top: 8px;">
            Открыть лавку! 🍋
          </button>

          ${HamsterRenderer.renderWithBubble("Высокая цена снижает спрос, а низкая уменьшает прибыль. Ищи баланс!", window.bankirState.data.child.equippedItem)}
        </div>
      `;

      document.getElementById("lem-close-btn").onclick = () => this.onComplete(false);

      document.getElementById("btn-less-cups").onclick = () => {
        if (cupsToMake > 1) {
          cupsToMake--;
          renderPlanning();
        }
      };

      document.getElementById("btn-more-cups").onclick = () => {
        if (cupsToMake < this.cash) {
          cupsToMake++;
          renderPlanning();
        }
      };

      this.container.querySelectorAll(".price-btn").forEach(btn => {
        btn.onclick = () => {
          cupPrice = Number(btn.getAttribute("data-price"));
          renderPlanning();
        };
      });

      document.getElementById("lem-open-btn").onclick = () => {
        this.runDaySimulation(weather, cupsToMake, cupPrice);
      };
    };

    renderPlanning();
  }

  runDaySimulation(weather, cups, price) {
    // Формула спроса по ТЗ:
    // Спрос = Math.round(погода * coef + random(-2..2))
    const priceCoefs = { 1: 1.25, 2: 1.0, 3: 0.65, 4: 0.35 };
    const coef = priceCoefs[price] || 1.0;
    const randomDelta = (Math.random() * 4) - 2;
    const totalCustomers = Math.max(1, Math.round(weather.baseCustomers * coef + randomDelta));

    const sold = Math.min(cups, totalCustomers);
    const unserved = Math.max(0, totalCustomers - cups);
    const unsold = Math.max(0, cups - totalCustomers);

    const expense = cups * 1; // 1 Б за стакан
    const revenue = sold * price;
    const profit = revenue - expense;

    this.cash += profit;

    // Анимация очереди покупателей
    let servedAnimCount = 0;
    this.container.innerHTML = `
      <div class="game-view-wrapper">
        <div class="game-header-bar">
          <div></div>
          <div class="game-title-box">
            <div class="game-level-name">Лавка открыта! 🍋</div>
            <div class="game-sub-name">День ${this.day} • Идут покупатели...</div>
          </div>
          <div class="coin-pill">🥤 ${cups} шт.</div>
        </div>

        <div class="card" style="margin-top: 14px; height: 320px; display: flex; flex-direction: column; align-items: center; justify-content: center; background: #FFFBEB;">
          <div id="lem-queue-visual" style="font-size: 56px; margin-bottom: 12px; transition: transform 0.15s;">
            🏪
          </div>
          <div id="lem-customers-flow" style="display: flex; gap: 8px; font-size: 32px; min-height: 48px; align-items: center; justify-content: center; flex-wrap: wrap;">
            🏃...
          </div>
          <div id="lem-sim-status" style="font-size: 14px; font-weight: 900; color: var(--red); margin-top: 14px;">
            Обслуживаем покупателей...
          </div>
        </div>

        ${HamsterRenderer.renderWithBubble("Смотри, сколько людей подходят к твоей витрине!", window.bankirState.data.child.equippedItem)}
      </div>
    `;

    const flowEl = document.getElementById("lem-customers-flow");
    const queueEl = document.getElementById("lem-queue-visual");

    let step = 0;
    const simInterval = setInterval(() => {
      step++;
      if (step <= totalCustomers) {
        const happy = step <= cups;
        if (flowEl) {
          flowEl.innerHTML += happy ? "😀🥤" : "😢";
        }
        if (happy) {
          window.bankirAudio.playCoin();
        } else {
          window.bankirAudio.playClick();
        }
      } else {
        clearInterval(simInterval);
        setTimeout(() => {
          this.showDayReport(weather, cups, price, totalCustomers, sold, revenue, expense, profit, unserved, unsold);
        }, 600);
      }
    }, 180);
  }

  showDayReport(weather, cups, price, customers, sold, revenue, expense, profit, unserved, unsold) {
    let advice = "";
    if (unsold > 0) {
      advice = `Осталось не распродано ${unsold} стаканов. Это убыток — в плохую погоду готовь меньше!`;
    } else if (unserved > 0) {
      advice = `${unserved} покупателей ушли без лимонада! Можно было сварить больше и заработать ещё.`;
    } else {
      advice = "Идеальный расчёт! Все стаканы распроданы без остатка!";
    }

    this.history.push({ day: this.day, profit, revenue });

    this.container.innerHTML = `
      <div class="game-view-wrapper">
        <div class="game-header-bar">
          <div></div>
          <div class="game-title-box">
            <div class="game-level-name">Отчёт за День ${this.day}</div>
            <div class="game-sub-name">Погода: ${weather.name} ${weather.emoji}</div>
          </div>
          <div class="coin-pill">Касса: <b>${this.cash}</b> Б</div>
        </div>

        <div class="card" style="margin-top: 12px;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; text-align: center; margin-bottom: 12px;">
            <div style="background: #F3F4F6; padding: 10px; border-radius: 14px;">
              <div style="font-size: 11px; font-weight: 700; color: var(--muted);">Пришло гостей:</div>
              <div style="font-size: 18px; font-weight: 900;">${customers} чел.</div>
            </div>
            <div style="background: #F3F4F6; padding: 10px; border-radius: 14px;">
              <div style="font-size: 11px; font-weight: 700; color: var(--muted);">Продано:</div>
              <div style="font-size: 18px; font-weight: 900; color: var(--success);">${sold} шт.</div>
            </div>
            <div style="background: #F3F4F6; padding: 10px; border-radius: 14px;">
              <div style="font-size: 11px; font-weight: 700; color: var(--muted);">Выручка:</div>
              <div style="font-size: 18px; font-weight: 900;">+${revenue} Б</div>
            </div>
            <div style="background: #F3F4F6; padding: 10px; border-radius: 14px;">
              <div style="font-size: 11px; font-weight: 700; color: var(--muted);">Расходы:</div>
              <div style="font-size: 18px; font-weight: 900; color: var(--red);">−${expense} Б</div>
            </div>
          </div>

          <div style="text-align: center; padding: 10px; background: ${profit >= 0 ? 'var(--success-light)' : '#FEE2E2'}; border-radius: 16px;">
            <div style="font-size: 13px; font-weight: 800;">Прибыль за день:</div>
            <div style="font-size: 22px; font-weight: 900; color: ${profit >= 0 ? 'var(--success)' : 'var(--red)'};">
              ${profit >= 0 ? `+${profit}` : profit} Б
            </div>
          </div>

          <div style="font-size: 12px; font-weight: 700; color: var(--muted); margin-top: 10px; text-align: center;">
            💡 Совет хомяка: ${advice}
          </div>
        </div>

        <button class="btn btn-red" id="lem-next-day-btn" style="margin-top: 10px;">
          ${this.day < 5 ? `Перейти к Дню ${this.day + 1} ➜` : "Подвести итоги недели ➜"}
        </button>

        ${HamsterRenderer.renderWithBubble(`Касса: ${this.cash} Б. Наша цель — собрать не меньше ${this.goal} Б к концу 5-го дня!`, window.bankirState.data.child.equippedItem)}
      </div>
    `;

    document.getElementById("lem-next-day-btn").onclick = () => {
      this.day++;
      if (this.day > 5) {
        this.finishWeek();
      } else {
        this.startDay();
      }
    };
  }

  finishWeek() {
    const isWin = this.cash >= this.goal;
    const totalProfit = this.cash - 10;
    // Награда: от 2 до 8 Б (прибыль / 4)
    const rewardCoins = Math.min(8, Math.max(2, Math.floor(totalProfit / 4)));

    if (isWin) {
      window.bankirAudio.playWin();
      window.bankirState.addTransaction("wallet", rewardCoins, "game", "Лимонадная лавка: Неделя закрыта с прибылью!");
    } else {
      window.bankirAudio.playError();
    }

    this.container.innerHTML = `
      <div class="modal-overlay">
        <div class="modal-content" style="text-align: center;">
          <div style="font-size: 54px; margin-bottom: 8px;">${isWin ? "🍋🏆" : "🍋📊"}</div>
          <h2 style="font-size: 24px; font-weight: 900; color: ${isWin ? "var(--success)" : "var(--red)"};">
            ${isWin ? "Бизнес удался!" : "Неделя завершена"}
          </h2>
          <p style="font-size: 15px; font-weight: 800; color: var(--ink); margin: 6px 0 14px 0;">
            Итоговая касса: <b>${this.cash} Б</b> (цель: ${this.goal} Б)<br/>
            Чистая прибыль бизнеса: <b>${totalProfit} Б</b>!<br/>
            ${isWin ? `Награда предпринимателю: <b style="color: var(--red);">+${rewardCoins} Б</b> в кошелёк!` : "Не хватило совсем немного до 35 Б. Попробуй ещё!"}
          </p>

          <div class="card" style="background: var(--yellow-light); border-color: var(--yellow); padding: 12px; margin-bottom: 16px; text-align: left;">
            <div style="font-size: 12px; font-weight: 900; color: #B45309;">💡 Урок предпринимателя</div>
            <div style="font-size: 13px; font-weight: 700; color: var(--ink); margin-top: 4px;">
              В бизнесе важно следить за прогнозом погоды и не задирать цены слишком высоко, иначе покупатели уйдут ни с чем!
            </div>
          </div>

          <div style="display: flex; flex-direction: column; gap: 10px;">
            <button class="btn btn-red" id="lem-retry-btn">Новая неделя ➜</button>
            <button class="btn btn-white" id="lem-exit-btn">К играм</button>
          </div>
        </div>
      </div>
    `;

    document.getElementById("lem-retry-btn").onclick = () => {
      new LemonadeStandGame(this.container, this.onComplete);
    };

    document.getElementById("lem-exit-btn").onclick = () => {
      this.onComplete(isWin);
    };
  }
}

if (typeof window !== "undefined") {
  window.LemonadeStandGame = LemonadeStandGame;
}

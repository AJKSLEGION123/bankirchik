// C:\Bankirchik\js\games\market.js
// Игра 6.4 «Рынок» (покупки по списку с бюджетом и сдачей)

class MarketGame {
  constructor(container, levelNum = 1, onComplete) {
    if (typeof levelNum === 'function') {
      onComplete = levelNum;
      levelNum = 1;
    }
    this.container = container;
    this.levelNum = Number(levelNum) || 1;
    this.onComplete = onComplete || (() => {});
    this.islandData = (window.BANKIR_DATA && window.BANKIR_DATA.islands) ? window.BANKIR_DATA.islands[3] : (window.BankirchikData ? window.BankirchikData.islands[3] : null);
    this.config = (this.islandData && this.islandData.levels) ? (this.islandData.levels[this.levelNum - 1] || this.islandData.levels[0]) : { name: "Рынок", reward: 2 };

    this.shoppingList = [];
    this.shelfItems = [];
    this.cart = [];
    this.budget = 0;
    this.initialBudget = 0;

    this.init();
  }

  init() {
    // 1. Выбираем товары для списка от мамы
    const products = [...window.BANKIR_DATA.marketProducts].sort(() => Math.random() - 0.5);
    this.shoppingList = products.slice(0, this.config.count);

    // Считаем сумму списка
    const listSum = this.shoppingList.reduce((sum, it) => sum + it.price, 0);
    this.budget = listSum + this.config.budgetExtra;
    this.initialBudget = this.budget;

    // 2. Формируем полку
    let shelf = [...this.shoppingList];

    // Добавляем ещё случайные обычные товары для выбора
    const otherProducts = products.slice(this.config.count, this.config.count + 4);
    shelf = shelf.concat(otherProducts);

    // Уровень 1: добавляем 3 сладости-соблазна
    if (this.levelNum === 1) {
      shelf = shelf.concat(window.BANKIR_DATA.temptations.slice(0, 3));
    }

    // Уровни 2 и 3: добавляем двойники «Люкс»
    if (this.levelNum >= 2) {
      this.shoppingList.forEach(it => {
        shelf.push({
          id: it.id + "_lux",
          name: it.luxName,
          emoji: it.emoji,
          price: it.luxPrice,
          isLux: true,
          baseId: it.id
        });
      });
    }

    // Перемешиваем полку
    shelf.sort(() => Math.random() - 0.5);
    this.shelfItems = shelf;

    this.render();
  }

  render() {
    const listIds = this.shoppingList.map(it => it.id);
    const cartIds = this.cart.map(it => it.id);

    this.container.innerHTML = `
      <div class="game-view-wrapper">
        <div class="game-header-bar">
          <button class="icon-btn" id="market-close-btn">✕</button>
          <div class="game-title-box">
            <div class="game-level-name">Остров 4: Рынок</div>
            <div class="game-sub-name">Уровень ${this.levelNum}: ${this.config.name}</div>
          </div>
          <div class="coin-pill">Бюджет: <b>${this.budget}</b> Б</div>
        </div>

        <!-- Список от мамы -->
        <div class="card" style="margin-top: 10px; background: #FFF9E6; border-color: var(--yellow);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <div style="font-size: 13px; font-weight: 900; color: var(--ink);">📝 Список покупок от мамы:</div>
            <div style="font-size: 12px; font-weight: 800; color: var(--red);">Выдано: ${this.initialBudget} Б</div>
          </div>
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            ${this.shoppingList.map(it => {
              const inCart = this.cart.some(c => c.id === it.id || (c.isLux && c.baseId === it.id));
              return `
                <div style="display: flex; align-items: center; gap: 4px; background: ${inCart ? 'var(--success-light)' : '#FFF'}; border: 1.5px solid ${inCart ? 'var(--success)' : '#D1D5DB'}; border-radius: 12px; padding: 4px 8px; font-size: 12px; font-weight: 800;">
                  <span>${it.emoji}</span>
                  <span style="${inCart ? 'text-decoration: line-through; color: var(--muted);' : ''}">${it.name}</span>
                  ${inCart ? '✅' : ''}
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Корзина -->
        <div class="card" style="padding: 12px; min-height: 80px;">
          <div style="font-size: 13px; font-weight: 900; color: var(--ink); margin-bottom: 6px;">
            🛒 В корзине (${this.cart.length} шт.) — нажми, чтобы вернуть на полку:
          </div>
          <div style="display: flex; gap: 8px; flex-wrap: wrap; min-height: 40px;">
            ${this.cart.length === 0 ? `
              <div style="font-size: 12px; color: var(--muted); font-weight: 700; align-self: center;">Пока пусто. Выбирай товары на полке!</div>
            ` : this.cart.map(it => `
              <div class="market-cart-item" data-id="${it.id}" style="display: flex; align-items: center; gap: 6px; background: #FEE2E2; border: 2px solid var(--red); border-radius: 14px; padding: 4px 8px; cursor: pointer;">
                <span>${it.emoji}</span>
                <span style="font-size: 12px; font-weight: 900;">${it.name}</span>
                <span style="font-size: 12px; font-weight: 900; color: var(--red);">${it.price}Б</span>
                <span style="font-size: 10px;">❌</span>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Полка магазина -->
        <div class="card">
          <div style="font-size: 13px; font-weight: 900; color: var(--ink); margin-bottom: 8px;">
            🏪 Полка магазина (нажми, чтобы положить в корзину):
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
            ${this.shelfItems.map(it => {
              const alreadyInCart = this.cart.some(c => c.id === it.id);
              return `
                <div class="market-shelf-item" data-id="${it.id}" style="background: ${it.isLux ? '#FFFBEB' : '#FFF'}; border: 2px solid ${it.isLux ? '#F59E0B' : 'var(--shadow)'}; box-shadow: 0 3px 0 ${it.isLux ? '#D97706' : 'var(--shadow)'}; border-radius: 16px; padding: 10px; display: flex; align-items: center; gap: 8px; cursor: pointer; opacity: ${alreadyInCart ? '0.4' : '1'}; pointer-events: ${alreadyInCart ? 'none' : 'auto'};">
                  <div style="font-size: 26px;">${it.emoji}</div>
                  <div style="flex: 1; min-width: 0;">
                    <div style="font-size: 12px; font-weight: 900; color: var(--ink); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${it.name}</div>
                    <div style="font-size: 13px; font-weight: 900; color: var(--red);">${it.price} Б</div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <button class="btn btn-red" id="market-checkout-btn" style="margin-top: 8px;">
          На кассу ➔ (Сдача будет твоей наградой!)
        </button>

        ${HamsterRenderer.renderWithBubble("Покупай строго по списку и следи за сдачей! Лишние сладости съедят бюджет.", window.bankirState.data.child.equippedItem)}
      </div>
    `;

    document.getElementById("market-close-btn").onclick = () => this.onComplete(false);

    // Добавление с полки в корзину
    this.container.querySelectorAll(".market-shelf-item").forEach(el => {
      el.onclick = () => {
        const id = el.getAttribute("data-id");
        const item = this.shelfItems.find(i => i.id === id);
        if (item) {
          if (this.budget >= item.price) {
            this.budget -= item.price;
            this.cart.push(item);
            window.bankirAudio.playCoin();
            this.render();
          } else {
            window.bankirAudio.playError();
            window.bankirAudio.speak("Не хватает бюджета на этот товар!");
          }
        }
      };
    });

    // Возврат из корзины на полку
    this.container.querySelectorAll(".market-cart-item").forEach(el => {
      el.onclick = () => {
        const id = el.getAttribute("data-id");
        const idx = this.cart.findIndex(i => i.id === id);
        if (idx !== -1) {
          const item = this.cart[idx];
          this.budget += item.price;
          this.cart.splice(idx, 1);
          window.bankirAudio.playClick();
          this.render();
        }
      };
    });

    // Оплата на кассе
    document.getElementById("market-checkout-btn").onclick = () => {
      this.checkout();
    };
  }

  checkout() {
    // Проверка: куплены ли все товары из списка?
    const missing = [];
    this.shoppingList.forEach(needed => {
      const bought = this.cart.some(c => c.id === needed.id || (c.isLux && c.baseId === needed.id));
      if (!bought) {
        missing.push(needed.name);
      }
    });

    // Проверка на лишние покупки
    const extra = [];
    this.cart.forEach(c => {
      const isNeeded = this.shoppingList.some(s => s.id === c.id || (c.isLux && c.baseId === s.id));
      if (!isNeeded) {
        extra.push(c.name);
      }
    });

    if (missing.length > 0) {
      window.bankirAudio.playError();
      window.bankirAudio.speak(`Ой! Ты забыл купить из списка: ${missing.join(', ')}!`);
      alert(`Ты забыл купить: ${missing.join(', ')}. Проверь список от мамы!`);
      return;
    }

    // Награда = сдача (минимум 1 Б)
    const change = Math.max(1, this.budget);
    const isWin = extra.length === 0 && this.budget >= 0;

    let resultMsg = "";
    if (isWin) {
      resultMsg = `Ты купил всё по списку! Сдача: <b style="color: var(--red);">+${change} Б</b> переходит в твой кошелёк!`;
    } else {
      resultMsg = `Ты купил всё, но взял лишнее: ${extra.join(', ')}! Попробуй уложиться без лишних трат.`;
    }

    this.showResultModal(isWin, change, resultMsg);
  }

  showResultModal(isWin, rewardCoins, text) {
    if (isWin) {
      window.bankirAudio.playWin();
      window.bankirState.completeLevel(4, this.levelNum, rewardCoins);
    } else {
      window.bankirAudio.playError();
    }

    const randomFact = this.islandData.facts[Math.floor(Math.random() * this.islandData.facts.length)];

    this.container.innerHTML = `
      <div class="modal-overlay">
        <div class="modal-content" style="text-align: center;">
          <div style="font-size: 54px; margin-bottom: 8px;">${isWin ? "🛒" : "🛍️"}</div>
          <h2 style="font-size: 24px; font-weight: 900; color: ${isWin ? "var(--success)" : "var(--red)"};">
            ${isWin ? "Чек оплачен!" : "Внимание к покупкам!"}
          </h2>
          <p style="font-size: 15px; font-weight: 800; color: var(--ink); margin: 6px 0 14px 0;">
            ${text}
          </p>

          <div class="card" style="background: var(--yellow-light); border-color: var(--yellow); padding: 12px; margin-bottom: 16px; text-align: left;">
            <div style="font-size: 12px; font-weight: 900; color: #B45309;">💡 Знаешь ли ты?</div>
            <div style="font-size: 13px; font-weight: 700; color: var(--ink); margin-top: 4px;">${randomFact}</div>
          </div>

          <div style="display: flex; flex-direction: column; gap: 10px;">
            ${isWin && this.levelNum < 3 ? `
              <button class="btn btn-red" id="market-next-btn">Уровень ${this.levelNum + 1} ➜</button>
            ` : ""}
            <button class="btn btn-yellow" id="market-retry-btn">В магазин снова</button>
            <button class="btn btn-white" id="market-map-btn">К островам</button>
          </div>
        </div>
      </div>
    `;

    const nextBtn = document.getElementById("market-next-btn");
    if (nextBtn) {
      nextBtn.onclick = () => {
        new MarketGame(this.container, this.levelNum + 1, this.onComplete);
      };
    }

    document.getElementById("market-retry-btn").onclick = () => {
      new MarketGame(this.container, this.levelNum, this.onComplete);
    };

    document.getElementById("market-map-btn").onclick = () => {
      this.onComplete(isWin);
    };
  }
}

if (typeof window !== "undefined") {
  window.MarketGame = MarketGame;
}

// C:\Bankirchik\js\games\patience_island.js
// Игра 6.6 «Остров терпения» (таймер отложенного удовольствия и ловушки мошенников)

class PatienceIslandGame {
  constructor(container, levelNum = 1, onComplete) {
    if (typeof levelNum === 'function') {
      onComplete = levelNum;
      levelNum = 1;
    }
    this.container = container;
    this.levelNum = Number(levelNum) || 1;
    this.onComplete = onComplete || (() => {});
    this.islandData = (window.BANKIR_DATA && window.BANKIR_DATA.islands) ? window.BANKIR_DATA.islands[5] : (window.BankirchikData ? window.BankirchikData.islands[5] : null);
    this.config = (this.islandData && this.islandData.levels) ? (this.islandData.levels[this.levelNum - 1] || this.islandData.levels[0]) : { name: "Терпение", waitSeconds: 20, reward: 2 };

    this.state = "choice"; // "choice", "waiting", "result"
    this.timer = this.config.waitSeconds;
    this.totalTime = this.config.waitSeconds;
    this.timerInterval = null;
    this.temptInterval = null;
    this.cookiePos = { x: 50, y: 50 };
    this.cookieVel = { x: 2, y: 2 };
    this.cookieAnim = null;
    this.popupActive = null;

    this.init();
  }

  init() {
    this.renderChoice();
  }

  destroy() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    if (this.temptInterval) clearInterval(this.temptInterval);
    if (this.cookieAnim) cancelAnimationFrame(this.cookieAnim);
  }

  renderChoice() {
    this.container.innerHTML = `
      <div class="game-view-wrapper">
        <div class="game-header-bar">
          <button class="icon-btn" id="pat-close-btn">✕</button>
          <div class="game-title-box">
            <div class="game-level-name">Остров 6: Остров терпения</div>
            <div class="game-sub-name">Уровень ${this.levelNum}: ${this.config.name}</div>
          </div>
          <div class="coin-pill">⏳ Выбор</div>
        </div>

        <div class="card" style="margin-top: 10px; text-align: center;">
          <div style="font-size: 15px; font-weight: 800; color: var(--ink);">
            Что ты выберешь: забрать мало монет прямо сейчас или подождать и получить в разы больше?
          </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 14px; margin: 20px 0;">
          <!-- Вариант 1: Сейчас -->
          <div class="card" id="choose-now-card" style="display: flex; align-items: center; justify-content: space-between; padding: 18px; cursor: pointer; border-color: var(--shadow);">
            <div style="display: flex; align-items: center; gap: 12px;">
              <div style="font-size: 40px;">⚡</div>
              <div>
                <div style="font-size: 16px; font-weight: 900; color: var(--ink);">Забрать сейчас</div>
                <div style="font-size: 13px; font-weight: 700; color: var(--muted);">Без ожидания</div>
              </div>
            </div>
            <div class="coin-pill" style="font-size: 17px; color: var(--ink);">
              +${this.config.nowReward} Б
            </div>
          </div>

          <!-- Вариант 2: Подождать -->
          <div class="card" id="choose-wait-card" style="display: flex; align-items: center; justify-content: space-between; padding: 18px; cursor: pointer; border-color: var(--red); background: #FFF5F5;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <div style="font-size: 40px;">⏳</div>
              <div>
                <div style="font-size: 16px; font-weight: 900; color: var(--red);">Подождать ${this.config.waitSeconds} сек</div>
                <div style="font-size: 13px; font-weight: 700; color: var(--muted);">Увеличенная награда!</div>
              </div>
            </div>
            <div class="coin-pill" style="font-size: 18px; color: var(--red); border-color: var(--red);">
              +${this.config.waitReward} Б
            </div>
          </div>
        </div>

        ${HamsterRenderer.renderWithBubble("Умение ждать и не поддаваться импульсам — суперсила миллионеров!", window.bankirState.data.child.equippedItem)}
      </div>
    `;

    document.getElementById("pat-close-btn").onclick = () => this.onComplete(false);

    document.getElementById("choose-now-card").onclick = () => {
      this.finishGame(false, `Ты выбрал не ждать и забрал +${this.config.nowReward} Б прямо сейчас!`);
    };

    document.getElementById("choose-wait-card").onclick = () => {
      this.startWaitingMode();
    };
  }

  startWaitingMode() {
    this.state = "waiting";
    this.timer = this.config.waitSeconds;

    const phrases = [
      "Печенька так аппетитно пахнет... может, нажмёшь?",
      "Терпеть так долго... а вдруг она исчезнет?",
      "Держись! Настоящий банкир спокоен как скала!",
      "Ещё совсем чуть-чуть, не сдавайся соблазнам!"
    ];

    let phraseIdx = 0;

    const renderWait = () => {
      const progress = ((this.totalTime - this.timer) / this.totalTime) * 100;

      this.container.innerHTML = `
        <div class="game-view-wrapper">
          <div class="game-header-bar">
            <button class="icon-btn" id="wait-give-up-btn">✕</button>
            <div class="game-title-box">
              <div class="game-level-name">Остров терпения</div>
              <div class="game-sub-name">Осталось подождать: ${this.timer} сек</div>
            </div>
            <div class="coin-pill">🎯 Цель: +${this.config.waitReward} Б</div>
          </div>

          <!-- Анимированная арена терпения -->
          <div id="patience-arena" style="position: relative; width: 100%; height: 380px; background: #FFF9E6; border: 3px solid var(--shadow); border-radius: 26px; overflow: hidden; margin: 14px 0;">
            <!-- Круговой прогресс таймера -->
            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 160px; height: 160px; border-radius: 50%; border: 10px solid #FDE68A; display: flex; flex-direction: column; align-items: center; justify-content: center; background: #FFF;">
              <div style="font-size: 42px; font-weight: 900; color: var(--red);">${this.timer}</div>
              <div style="font-size: 12px; font-weight: 800; color: var(--muted);">секунд</div>
            </div>

            <!-- Летающая соблазнительная печенька -->
            <div id="flying-cookie" style="position: absolute; left: ${this.cookiePos.x}px; top: ${this.cookiePos.y}px; font-size: 44px; cursor: pointer; transition: transform 0.1s; z-index: 10;">
              🍪
            </div>

            <!-- Всплывающее окно ловушки -->
            ${this.popupActive ? `
              <div class="modal-overlay" style="z-index: 20; background: rgba(0,0,0,0.4);">
                <div class="card" style="text-align: center; max-width: 280px; animation: popModal 0.2s ease;">
                  <div style="font-size: 38px;">${this.popupActive.emoji}</div>
                  <div style="font-size: 16px; font-weight: 900; color: var(--red); margin: 6px 0;">${this.popupActive.title}</div>
                  <div style="font-size: 12px; font-weight: 700; color: var(--muted);">${this.popupActive.text}</div>
                  <button class="btn btn-red btn-sm" id="popup-trap-btn" style="margin-top: 12px;">Забрать приз!</button>
                </div>
              </div>
            ` : ""}
          </div>

          <button class="btn btn-white" id="take-small-now-btn">
            Сдаться и забрать +${this.config.nowReward} Б
          </button>

          ${HamsterRenderer.renderWithBubble(phrases[phraseIdx % phrases.length], window.bankirState.data.child.equippedItem)}
        </div>
      `;

      document.getElementById("wait-give-up-btn").onclick = () => {
        this.destroy();
        this.finishGame(false, "Ты не стал ждать и забрал малую награду.");
      };

      document.getElementById("take-small-now-btn").onclick = () => {
        this.destroy();
        this.finishGame(false, "Ты не выдержал ожидания и забрал малую награду.");
      };

      const cookieEl = document.getElementById("flying-cookie");
      if (cookieEl) {
        cookieEl.onclick = () => {
          // Нажал на печеньку = сорвался!
          this.destroy();
          window.bankirAudio.playError();
          this.finishGame(false, `Ой! Ты нажал на летающую печеньку и сорвался! Награда: +${this.config.nowReward} Б.`);
        };
      }

      const trapBtn = document.getElementById("popup-trap-btn");
      if (trapBtn) {
        trapBtn.onclick = () => {
          this.destroy();
          window.bankirAudio.playError();
          this.finishGame(false, "Ловушка мошенников! Никогда не верь объявлениям «Бесплатно» в интернете!");
        };
      }
    };

    renderWait();

    // Запуск таймера
    this.timerInterval = setInterval(() => {
      this.timer--;
      if (this.timer % 3 === 0) {
        phraseIdx++;
      }

      // Спавн ловушек на 2 и 3 уровне
      if (this.config.traps && this.timer === 8) {
        this.popupActive = { emoji: "📱", title: "Новое видео!", text: "Друг прислал смешной ролик в чат!" };
      }
      if (this.config.fraudTraps && this.timer === 10) {
        this.popupActive = { emoji: "🎁", title: "ВЫ ВЫИГРАЛИ 100 000 ₸!", text: "Нажмите прямо сейчас для получения!" };
      }

      if (this.timer <= 0) {
        this.destroy();
        this.finishGame(true, `БРАВО! Ты выдержал все соблазны и получил максимальную награду: +${this.config.waitReward} Б!`);
      } else {
        renderWait();
      }
    }, 1000);

    // Анимация летающей печеньки
    const stepCookie = () => {
      if (this.state !== "waiting") return;
      this.cookiePos.x += this.cookieVel.x;
      this.cookiePos.y += this.cookieVel.y;

      if (this.cookiePos.x < 10 || this.cookiePos.x > 280) this.cookieVel.x *= -1;
      if (this.cookiePos.y < 10 || this.cookiePos.y > 300) this.cookieVel.y *= -1;

      const el = document.getElementById("flying-cookie");
      if (el) {
        el.style.left = `${this.cookiePos.x}px`;
        el.style.top = `${this.cookiePos.y}px`;
      }

      this.cookieAnim = requestAnimationFrame(stepCookie);
    };

    this.cookieAnim = requestAnimationFrame(stepCookie);
  }

  finishGame(waitedFull, text) {
    this.destroy();
    const reward = waitedFull ? this.config.waitReward : this.config.nowReward;

    window.bankirAudio.playWin();
    window.bankirState.completeLevel(6, this.levelNum, reward);

    const randomFact = this.islandData.facts[Math.floor(Math.random() * this.islandData.facts.length)];

    this.container.innerHTML = `
      <div class="modal-overlay">
        <div class="modal-content" style="text-align: center;">
          <div style="font-size: 54px; margin-bottom: 8px;">${waitedFull ? "🏆" : "🍪"}</div>
          <h2 style="font-size: 24px; font-weight: 900; color: ${waitedFull ? "var(--success)" : "var(--red)"};">
            ${waitedFull ? "Железная воля!" : "Уровень завершён"}
          </h2>
          <p style="font-size: 15px; font-weight: 800; color: var(--ink); margin: 6px 0 14px 0;">
            ${text}<br/>
            Зачислено в кошелёк: <b style="color: var(--red);">+${reward} Б</b>!
          </p>

          <div class="card" style="background: var(--yellow-light); border-color: var(--yellow); padding: 12px; margin-bottom: 16px; text-align: left;">
            <div style="font-size: 12px; font-weight: 900; color: #B45309;">💡 Знаешь ли ты?</div>
            <div style="font-size: 13px; font-weight: 700; color: var(--ink); margin-top: 4px;">${randomFact}</div>
          </div>

          <div style="display: flex; flex-direction: column; gap: 10px;">
            ${this.levelNum < 3 ? `
              <button class="btn btn-red" id="pat-next-btn">Уровень ${this.levelNum + 1} ➜</button>
            ` : ""}
            <button class="btn btn-yellow" id="pat-retry-btn">Повторить попытку</button>
            <button class="btn btn-white" id="pat-map-btn">К островам</button>
          </div>
        </div>
      </div>
    `;

    const nextBtn = document.getElementById("pat-next-btn");
    if (nextBtn) {
      nextBtn.onclick = () => {
        new PatienceIslandGame(this.container, this.levelNum + 1, this.onComplete);
      };
    }

    document.getElementById("pat-retry-btn").onclick = () => {
      new PatienceIslandGame(this.container, this.levelNum, this.onComplete);
    };

    document.getElementById("pat-map-btn").onclick = () => {
      this.onComplete(true);
    };
  }
}

if (typeof window !== "undefined") {
  window.PatienceIslandGame = PatienceIslandGame;
}

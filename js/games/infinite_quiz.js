// C:\Bankirchik\js\games\infinite_quiz.js
// Игра 6.9 «Нужно или хочется?» (бесконечная викторина по 5 вопросов)

class InfiniteQuizGame {
  constructor(container, roundNum = 1, onComplete) {
    if (typeof roundNum === 'function') {
      onComplete = roundNum;
      roundNum = 1;
    }
    this.container = container;
    this.roundNum = Number(roundNum) || 1;
    this.onComplete = onComplete || (() => {});

    this.roundQuestions = [];
    this.qIndex = 0;
    this.roundScore = 0;
    this.answered = false;

    this.init();
  }

  init() {
    const data = window.BANKIR_DATA.needWantCards;
    let pool = [];

    // Раунд 1 — без хитрых, Раунд 2 — 2 хитрых, Раунд 3+ — 3 хитрых
    const trickyCount = this.roundNum === 1 ? 0 : (this.roundNum === 2 ? 2 : 3);
    const normalCount = 5 - trickyCount;

    if (trickyCount > 0) {
      const allTricky = [...data.trickyNeeds, ...data.trickyWants].sort(() => Math.random() - 0.5);
      pool = pool.concat(allTricky.slice(0, trickyCount));
    }

    const allNormal = [...data.needs, ...data.wants].sort(() => Math.random() - 0.5);
    pool = pool.concat(allNormal.slice(0, normalCount));

    pool.sort(() => Math.random() - 0.5);
    this.roundQuestions = pool;

    this.renderQuestion();
  }

  renderQuestion() {
    if (this.qIndex >= 5) {
      this.finishRound();
      return;
    }

    const q = this.roundQuestions[this.qIndex];
    this.answered = false;

    this.container.innerHTML = `
      <div class="game-view-wrapper">
        <div class="game-header-bar">
          <button class="icon-btn" id="quiz-close-btn">✕</button>
          <div class="game-title-box">
            <div class="game-level-name">Викторина «Нужно или хочется?»</div>
            <div class="game-sub-name">Раунд ${this.roundNum} • Вопрос ${this.qIndex + 1} из 5</div>
          </div>
          <div class="coin-pill">🪙 +${this.roundScore} Б</div>
        </div>

        <!-- Полоска прогресса (1/5 ... 5/5) -->
        <div style="width: 100%; height: 8px; background: rgba(0,0,0,0.08); border-radius: 4px; overflow: hidden; margin: 12px 0;">
          <div style="height: 100%; width: ${((this.qIndex) / 5) * 100}%; background: var(--red); transition: width 0.3s ease;"></div>
        </div>

        <!-- Карточка вопроса -->
        <div class="card" style="text-align: center; padding: 24px 16px; margin-top: 10px;">
          <div style="font-size: 76px; margin-bottom: 12px;">${q.emoji}</div>
          <div style="font-size: 20px; font-weight: 900; color: var(--ink);">${q.name}</div>
          <div style="font-size: 13px; font-weight: 700; color: var(--muted); margin-top: 4px;">
            Это жизненная необходимость или просто приятное желание?
          </div>
        </div>

        <!-- Кнопки выбора -->
        <div id="quiz-buttons-area" style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 16px 0;">
          <button class="btn btn-yellow" id="quiz-btn-need">
            ✅ Нужно
          </button>
          <button class="btn btn-pink" id="quiz-btn-want">
            ❤️ Хочется
          </button>
        </div>

        <!-- Плашка объяснения (появляется после ответа) -->
        <div id="quiz-explanation-box" style="display: none; margin-bottom: 16px;"></div>

        ${HamsterRenderer.renderWithBubble("Подумай: сможет ли человек прожить и быть здоровым без этой вещи?", window.bankirState.data.child.equippedItem)}
      </div>
    `;

    document.getElementById("quiz-close-btn").onclick = () => this.onComplete(false);

    document.getElementById("quiz-btn-need").onclick = () => this.handleChoice(true);
    document.getElementById("quiz-btn-want").onclick = () => this.handleChoice(false);
  }

  handleChoice(chosenNeed) {
    if (this.answered) return;
    this.answered = true;

    const q = this.roundQuestions[this.qIndex];
    const isCorrect = (chosenNeed === q.isNeed);

    if (isCorrect) {
      this.roundScore++;
      window.bankirAudio.playCoin();
    } else {
      window.bankirAudio.playError();
    }

    // Блокируем кнопки
    document.getElementById("quiz-btn-need").disabled = true;
    document.getElementById("quiz-btn-want").disabled = true;

    // Показываем зелёную или красную плашку объяснения
    const expBox = document.getElementById("quiz-explanation-box");
    expBox.style.display = "block";
    expBox.innerHTML = `
      <div class="card" style="background: ${isCorrect ? 'var(--success-light)' : '#FEE2E2'}; border-color: ${isCorrect ? 'var(--success)' : 'var(--red)'}; padding: 14px;">
        <div style="font-size: 15px; font-weight: 900; color: ${isCorrect ? 'var(--success)' : 'var(--red)'}; margin-bottom: 4px;">
          ${isCorrect ? "Верно! +1 Б" : "Не совсем так!"}
        </div>
        <div style="font-size: 13px; font-weight: 700; color: var(--ink); margin-bottom: 12px;">
          ${q.explanation}
        </div>
        <button class="btn btn-red btn-sm" id="quiz-next-q-btn">Дальше ➜</button>
      </div>
    `;

    document.getElementById("quiz-next-q-btn").onclick = () => {
      this.qIndex++;
      this.renderQuestion();
    };
  }

  finishRound() {
    window.bankirAudio.playWin();
    if (this.roundScore > 0) {
      window.bankirState.addTransaction("wallet", this.roundScore, "quiz", `Викторина: Раунд ${this.roundNum}`);
    }

    const facts = [
      "Осознанные покупки помогают семье экономить до 20% бюджета в месяц!",
      "Если сомневаешься, нужно или хочется — дай себе 24 часа на раздумья.",
      "Каждая сэкономленная монетка приближает тебя к покупке главной мечты!"
    ];
    const fact = facts[Math.floor(Math.random() * facts.length)];

    this.container.innerHTML = `
      <div class="modal-overlay">
        <div class="modal-content" style="text-align: center;">
          <div style="font-size: 54px; margin-bottom: 8px;">🧠💡</div>
          <h2 style="font-size: 24px; font-weight: 900; color: var(--red);">
            Раунд ${this.roundNum} завершён!
          </h2>
          <p style="font-size: 16px; font-weight: 800; color: var(--ink); margin: 6px 0 14px 0;">
            Результат: <b>${this.roundScore}</b> из 5 верных!<br/>
            Зачислено в кошелёк: <b style="color: var(--red); font-size: 18px;">+${this.roundScore} Б</b>!
          </p>

          <div class="card" style="background: var(--yellow-light); border-color: var(--yellow); padding: 12px; margin-bottom: 16px; text-align: left;">
            <div style="font-size: 12px; font-weight: 900; color: #B45309;">💡 Знаешь ли ты?</div>
            <div style="font-size: 13px; font-weight: 700; color: var(--ink); margin-top: 4px;">${fact}</div>
          </div>

          <div style="display: flex; flex-direction: column; gap: 10px;">
            <button class="btn btn-red" id="quiz-next-round-btn">Играть дальше ➜ Раунд ${this.roundNum + 1}</button>
            <button class="btn btn-white" id="quiz-to-games-btn">К играм</button>
          </div>
        </div>
      </div>
    `;

    document.getElementById("quiz-next-round-btn").onclick = () => {
      new InfiniteQuizGame(this.container, this.roundNum + 1, this.onComplete);
    };

    document.getElementById("quiz-to-games-btn").onclick = () => {
      this.onComplete(true);
    };
  }
}

if (typeof window !== "undefined") {
  window.InfiniteQuizGame = InfiniteQuizGame;
}

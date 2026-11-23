// C:\Bankirchik\js\games\treasure_chest.js
// Игра 6.8 «Сундук» (итоговая викторина плавания, 3 замка, конфетти)

class TreasureChestGame {
  constructor(container, levelOrComplete, maybeComplete) {
    this.container = container;
    this.onComplete = typeof maybeComplete === 'function' ? maybeComplete : (typeof levelOrComplete === 'function' ? levelOrComplete : (() => {}));
    this.islandData = (window.BANKIR_DATA && window.BANKIR_DATA.islands) ? window.BANKIR_DATA.islands[7] : (window.BankirchikData ? window.BankirchikData.islands[7] : null);

    this.unlockedLocks = 0;
    this.totalLocks = 3;
    this.questionPool = [...window.BANKIR_DATA.chestQuestions].sort(() => Math.random() - 0.5);
    this.qIndex = 0;

    this.init();
  }

  init() {
    this.render();
  }

  render() {
    if (this.unlockedLocks >= this.totalLocks) {
      this.finishChestVictory();
      return;
    }

    const q = this.questionPool[this.qIndex % this.questionPool.length];

    this.container.innerHTML = `
      <div class="game-view-wrapper">
        <div class="game-header-bar">
          <button class="icon-btn" id="chest-close-btn">✕</button>
          <div class="game-title-box">
            <div class="game-level-name">Остров 8: Сундук сокровищ</div>
            <div class="game-sub-name">Финальный экзамен плавания</div>
          </div>
          <div class="coin-pill">🏆 Награда: +6 Б</div>
        </div>

        <!-- Сундук с 3 замками -->
        <div class="card" style="margin-top: 10px; text-align: center; background: #FFF9E6; border-color: var(--yellow);">
          <div style="font-size: 70px; margin-bottom: 6px;">🏴‍☠️🪙</div>
          <div style="font-size: 16px; font-weight: 900; color: var(--ink);">Сундук заперт на 3 замка:</div>
          
          <div style="display: flex; gap: 14px; justify-content: center; margin-top: 10px;">
            ${[0, 1, 2].map(i => `
              <div style="font-size: 34px; padding: 6px 12px; background: ${i < this.unlockedLocks ? 'var(--success-light)' : '#F3F4F6'}; border: 2px solid ${i < this.unlockedLocks ? 'var(--success)' : '#D1D5DB'}; border-radius: 16px;">
                ${i < this.unlockedLocks ? "🔓" : "🔒"}
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Карточка вопроса -->
        <div class="card" style="padding: 18px;">
          <div style="font-size: 12px; font-weight: 800; color: var(--muted); margin-bottom: 6px;">
            Замок №${this.unlockedLocks + 1} из 3:
          </div>
          <div style="font-size: 16px; font-weight: 900; color: var(--ink); line-height: 1.4; margin-bottom: 16px;">
            ${q.q}
          </div>

          <div style="display: flex; flex-direction: column; gap: 10px;">
            ${q.options.map((opt, idx) => `
              <button class="btn btn-white chest-option-btn" data-idx="${idx}" style="text-align: left; justify-content: flex-start; padding: 12px 16px; font-size: 15px;">
                <span style="font-size: 18px; margin-right: 6px;">${['A', 'B', 'C'][idx]})</span> ${opt}
              </button>
            `).join('')}
          </div>
        </div>

        ${HamsterRenderer.renderWithBubble("Открой все 3 замка своими знаниями — и сокровища твои!", window.bankirState.data.child.equippedItem)}
      </div>
    `;

    document.getElementById("chest-close-btn").onclick = () => this.onComplete(false);

    this.container.querySelectorAll(".chest-option-btn").forEach(btn => {
      btn.onclick = () => {
        const chosen = Number(btn.getAttribute("data-idx"));
        if (chosen === q.correct) {
          // Верно!
          window.bankirAudio.playWin();
          this.unlockedLocks++;
          this.qIndex++;
          this.render();
        } else {
          // Неверно — объясняем и даём другой вопрос
          window.bankirAudio.playError();
          window.bankirAudio.speak(`Не совсем! ${q.fact}`);
          alert(`Не совсем верно! Подсказка: ${q.fact}`);
          this.qIndex++;
          this.render();
        }
      };
    });
  }

  finishChestVictory() {
    window.bankirAudio.playWin();
    // Начисляем 6 Б и завершаем остров 8
    window.bankirState.completeLevel(8, 1, 6);
    // Начинаем Плавание №2!
    window.bankirState.data.child.voyage += 1;
    window.bankirState.save();

    // Запуск победного конфетти
    this.launchConfetti();

    this.container.innerHTML = `
      <div class="modal-overlay">
        <div class="modal-content" style="text-align: center;">
          <div style="font-size: 64px; margin-bottom: 8px;">👑💎</div>
          <h2 style="font-size: 26px; font-weight: 900; color: var(--red);">
            СОКРОВИЩА ОТКРЫТЫ!
          </h2>
          <p style="font-size: 16px; font-weight: 800; color: var(--ink); margin: 8px 0 16px 0;">
            Ты успешно прошёл все 8 островов финансовой грамотности!<br/>
            Зачислено: <b style="color: var(--red); font-size: 20px;">+6 Б</b>!<br/>
            Открыто <b>Плавание №${window.bankirState.data.child.voyage}</b>!
          </p>

          <div class="card" style="background: var(--yellow-light); border-color: var(--yellow); padding: 12px; margin-bottom: 16px; text-align: left;">
            <div style="font-size: 12px; font-weight: 900; color: #B45309;">🌟 Диплом Юного Банкира</div>
            <div style="font-size: 13px; font-weight: 700; color: var(--ink); margin-top: 4px;">
              Ты умеешь зарабатывать трудом, вести бюджет, отличать нужное от капризов и защищаться от мошенников!
            </div>
          </div>

          <button class="btn btn-red" id="chest-finish-btn">
            Начать Плавание №${window.bankirState.data.child.voyage} ➜
          </button>
        </div>
      </div>
    `;

    document.getElementById("chest-finish-btn").onclick = () => {
      this.onComplete(true);
    };
  }

  launchConfetti() {
    const canvas = document.getElementById("confetti-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;

    const pieces = Array.from({ length: 60 }).map(() => ({
      x: Math.random() * canvas.width,
      y: Math.random() * -canvas.height,
      size: 6 + Math.random() * 8,
      color: ["#FFC21A", "#E63946", "#3FAE5A", "#3B82F6", "#EC4899"][Math.floor(Math.random() * 5)],
      velY: 2 + Math.random() * 4,
      velX: (Math.random() - 0.5) * 3,
      rot: Math.random() * 360
    }));

    let frames = 0;
    const animate = () => {
      frames++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      pieces.forEach(p => {
        p.y += p.velY;
        p.x += p.velX;
        p.rot += 4;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rot * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      });

      if (frames < 140) {
        requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    animate();
  }
}

if (typeof window !== "undefined") {
  window.TreasureChestGame = TreasureChestGame;
}

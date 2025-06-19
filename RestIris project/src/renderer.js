class EyeStrainTimer {
  constructor() {
    this.workDuration = 10; // TEST: 10 seconds
    this.breakDuration = 5; // TEST: 5 seconds
    this.currentTime = this.workDuration;
    this.isRunning = false;
    this.isBreakTime = false;
    this.interval = null;

    this.initializeElements();
    this.bindEvents();
    this.updateDisplay();
  }

  initializeElements() {
    this.startBtn = document.getElementById('start-btn');
    this.stopBtn = document.getElementById('stop-btn');
    this.timerText = document.getElementById('timer-text');
    this.timerLabel = document.getElementById('timer-label');
    this.statusText = document.getElementById('status-text');
    this.breakMessage = document.getElementById('break-message');
    this.breakTimer = document.getElementById('break-timer');
    this.minimizeBtn = document.getElementById('minimize-btn');
    this.closeBtn = document.getElementById('close-btn');
  }

  bindEvents() {
    this.startBtn.addEventListener('click', () => this.startTimer());
    this.stopBtn.addEventListener('click', () => this.stopTimer());
    this.minimizeBtn.addEventListener('click', () => window.electronAPI.minimizeWindow());
    this.closeBtn.addEventListener('click', () => window.electronAPI.closeWindow());
  }

  startTimer() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.startBtn.disabled = true;
    this.stopBtn.disabled = false;
    this.statusText.textContent = 'Timer running...';

    this.interval = setInterval(() => {
      this.currentTime--;
      this.updateDisplay();

      if (this.currentTime <= 0) {
        if (!this.isBreakTime) {
          this.startBreak();
        } else {
          this.completeBreak();
        }
      }
    }, 1000);
  }

  stopTimer() {
    this.isRunning = false;
    clearInterval(this.interval);
    this.interval = null;
    this.startBtn.disabled = false;
    this.stopBtn.disabled = true;
    this.resetTimer();
    this.statusText.textContent = 'Timer stopped';
  }

  startBreak() {
    this.isBreakTime = true;
    this.currentTime = this.breakDuration;
    clearInterval(this.interval);

    console.log('🕒 Timer done. Starting break.');

    window.electronAPI.showNotification(
      '20-20-20 Break Time!',
      'Look at something 20 feet away for 20 seconds'
    );
    window.electronAPI.restoreWindow();

    this.breakMessage.classList.remove('hidden');

    this.interval = setInterval(() => {
      this.currentTime--;
      this.updateDisplay();

      if (this.currentTime <= 0) {
        this.completeBreak();
      }
    }, 1000);
  }

  completeBreak() {
    clearInterval(this.interval);
    this.interval = null;
    this.isBreakTime = false;
    this.breakMessage.classList.add('hidden');
    this.resetTimer();
    this.startTimer();
    this.statusText.textContent = 'Back to work! Timer running...';
  }

  resetTimer() {
    this.currentTime = this.workDuration;
    this.isRunning = false;
    this.isBreakTime = false;
    this.updateDisplay();
  }

  updateDisplay() {
    if (this.isBreakTime) {
      this.breakTimer.textContent = this.currentTime;
    } else {
      const minutes = Math.floor(this.currentTime / 60);
      const seconds = this.currentTime % 60;
      this.timerText.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new EyeStrainTimer();
});

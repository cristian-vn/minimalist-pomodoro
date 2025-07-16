const circularProgress = document.querySelector(".circular-progress");
const timerDisplay = document.getElementById('timer');
const stateDisplay = document.getElementById('state');
const startButton = document.getElementById('start');
const pauseButton = document.getElementById('pause');
const resetButton = document.getElementById('reset');
let elapsed = 0
let progress = 0

function formatTime(seconds) {
	const minutes = Math.floor(seconds / 60);
	const remaining = seconds % 60;
	return `${String(minutes).padStart(2, '0')}:${String(remaining).padStart(2, '0')}`;
}

function updateTimer() {
	chrome.runtime.sendMessage({ type: 'GET_TIME_LEFT' }, (response) => {
		if (response) {
			let full_time = response.duration + elapsed;
			let full_elapsed = response.elapsed + elapsed;
			progress = full_elapsed * 100 / full_time;
			timerDisplay.textContent = formatTime(response.timeLeft);
			circularProgress.style.background = `conic-gradient(var(--fg-primary-color) ${progress * 3.6}deg, var(--primary) 1deg)`;
		}
		
		if (response.duration <= response.elapsed) {
			chrome.runtime.sendMessage({ type: 'RESTART_TIMER' }, (response) => {
				if (response) { stateDisplay.textContent = response.state; }
				startButton.disabled = false;
				pauseButton.disabled = true;
				resetButton.disabled = false;
				updateTimer()
			});
		}
	});
}

startButton.addEventListener('click', () => {
	chrome.runtime.sendMessage({ type: 'START_TIMER' }, updateTimer);
	startButton.disabled = true;
	pauseButton.disabled = false;
	resetButton.disabled = false;
});

pauseButton.addEventListener('click', () => {
	chrome.runtime.sendMessage({ type: 'PAUSE_TIMER' }, (response) => {
		elapsed = elapsed + response.elapsed;
		startButton.disabled = false;
		pauseButton.disabled = true;
		resetButton.disabled = false;
		updateTimer();
	});
});

resetButton.addEventListener('click', () => {
	chrome.runtime.sendMessage({ type: 'RESET_TIMER' }, updateTimer);
    startButton.disabled = false;
	pauseButton.disabled = true;
	resetButton.disabled = true;
	stateDisplay.textContent = 'Focus';
	
	progress = 0
	elapsed = 0
});

pauseButton.disabled = true;
resetButton.disabled = true;
setInterval(updateTimer, 1000);
updateTimer();

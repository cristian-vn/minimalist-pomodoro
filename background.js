let startTime = null;
let duration = 1500;
let isRunning = false;
let loops = 0
let state = 'Focus';

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (message.type === 'START_TIMER') {
		startTime = Date.now();
		isRunning = true
		chrome.storage.local.set({
			startTime,
			isRunning: true,
			duration: duration,
		}, () => {
			sendResponse({ success: true });
		});
		return true;
	}
	
	if (message.type === 'GET_TIME_LEFT') {
		if (isRunning && startTime) {
			chrome.storage.local.get(['startTime', 'isRunning', 'duration'], (data) => {
				const elapsed = Math.floor((Date.now() - startTime) / 1000);
				const timeLeft = Math.max(duration - elapsed, 0);

				/*chrome.storage.local.set({
					isRunning: true,
					startTime: startTime,
					duration: duration,
				});*/

				sendResponse({ timeLeft, duration: duration, elapsed, isRunning: data.isRunning });
			});
		} else {
			sendResponse({ timeLeft: duration, isRunning: true });
		}

		return true;
	}
	
	if (message.type === 'PAUSE_TIMER') {
		chrome.storage.local.get(['startTime', 'duration'], (data) => {
			const elapsed = Math.floor((Date.now() - startTime) / 1000);
			duration -= elapsed;
			isRunning = false;
			
			chrome.storage.local.set({
				isRunning: false,
				startTime: null,
				duration: duration,
			}, () => {
				sendResponse({ elapsed, success: true });
			});
		});
		return true;
	}
	
	if (message.type === 'RESET_TIMER') {
		duration = 1500;
		isRunning = false;
		chrome.storage.local.set({
			isRunning: isRunning,
			startTime: null,
			duration: duration,
		}, () => {
			sendResponse({ success: true });
		});
		return true;
	}

	if (message.type === 'RESTART_TIMER') {
		if (state != 'Focus') {
			duration = 1500;
			state = 'Focus';
		} else {
			if (loops < 3) {
				loops += 1
				duration = 300;
				state = 'Short break';
			} else {
				loops = 0;
				duration = 600;
				state = 'Long break';
			}
		}

		startTime = Date.now();
		isRunning = false;
		chrome.storage.local.set({
			startTime,
			isRunning: isRunning,
			duration: duration,
		}, () => {
			sendResponse({ state, success: true });
		});
		return true;
	}
	
	return true;
});

//10
import { timeInSeconds, countdown, checkLoginStatus, isMyTimer, convertRemainingTime, updateTimerTable, setButtonVisibility, setMessages } from './index.js';
import { getTokenAndUserId } from './fetchUser.js';
import { createRegisterForm } from './register.js';
import { createLoginForm } from './login.js';

const startButton = document.getElementById('startButton');
const pauseButton = document.getElementById('pauseButton');
const resumeButton = document.getElementById('resumeButton');
const stopButton = document.getElementById('stopButton');

let timerState = null;
let userId = null;

startButton.addEventListener('click', async () => {
  try {
    if (checkLoginStatus()) {
      const { message, timer } = await startTimer();
      if (timer) {
        setMessages(message, 'success');
        timerState = 'started';
      } else {
        setMessages(message, 'error');
      }
      setButtonVisibility({ time: false, start: false, pause: true, resume: false, stop: true });
    } else {
      // 登録フォームまたはログインフォームが表示されていない場合
      if (!document.getElementById('register-form') || !document.getElementById('login-form')) {
        createRegisterForm();
        createLoginForm();
      }
    }
  } catch (error) {
    setMessages(error.message, 'error');
  }
});

async function startTimer() {
  try {
    if (checkLoginStatus()) {
      const userId = getTokenAndUserId().userId;
      const response = await fetch('api/timers/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          timeInSeconds,
        }),
      })
      const data = await response.json();
      if (!response.ok) {
        const error = new Error(data.message);
        error.isServerError = true;
        throw error;
      }

      return data;
    } else {
      // 登録フォームまたはログインフォームが表示されていない場合
      if (!document.getElementById('register-form') || !document.getElementById('login-form')) {
        createRegisterForm();
        createLoginForm();
      }
    }
  } catch (error) {
    if (error.isServerError) {
      throw error;
    } else {
      throw new Error('予期せぬエラーが発生しました。ページを再読み込みしてもう一度お試しください。');
    }
  }
}


pauseButton.addEventListener('click', async () => {
  try {
    if (checkLoginStatus()) {
      const { message, timer } = await pauseTimer();
      if (timer) {
        setMessages(message, 'success');
        timerState = 'paused';
      } else {
        setMessages(message, 'error');
      }
      updateButtonDisplay();
  
    } else {
      // 登録フォームまたはログインフォームが表示されていない場合
      if (!document.getElementById('register-form') || !document.getElementById('login-form')) {
        createRegisterForm();
        createLoginForm();
      }
    }
  } catch (error) {
    setMessages(error.message, 'error');
  }
});

async function pauseTimer() {
  try {
    const userId = getTokenAndUserId().userId;
    const response = await fetch('api/timers/pause', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
      }),
    })
    
    const data = await response.json();
    if (!response.ok) {
      const error = new Error(data.message);
      error.isServerError = true;
      throw error;
    }
    return data;
  } catch (error) {
    if (error.isServerError) {
      throw error;
    } else {
      throw new Error('予期せぬエラーが発生しました。ページをリロードしてもう一度お試しください。');
    }
  }
}

resumeButton.addEventListener('click', async () => {
  try {
    if (checkLoginStatus()) {
      const { message, timer } = await resumeTimer();
      if (timer) {
        timerState = 'started';
        setMessages(message, 'success');
      } else {
        setMessages(message, 'error');
      }
      updateButtonDisplay();
  
    } else {
      // 登録フォームまたはログインフォームが表示されていない場合
      if (!document.getElementById('register-form') || !document.getElementById('login-form')) {
        createRegisterForm();
        createLoginForm();
      }
    }
  } catch (error) {
    setMessages(error.message, 'error');
  }

});

async function resumeTimer() {
  try {
    userId = getTokenAndUserId().userId;
    const response = await fetch('api/timers/resume', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
      }),
    })
    const data = await response.json();
    if (!response.ok) {
      const error = new Error(data.message);
      error.isServerError = true;
      throw error;
    }
    return data;
  } catch (error) {
    if (error.isServerError) {
      throw error;
    } else {
      throw new Error('予期せぬエラーが発生しました。ページをリロードしてもう一度お試しください。');
    }
  }
}


stopButton.addEventListener('click', async () => {
  try {
    if (checkLoginStatus()) {
      const { message, result } = await stopTimer();
      if(result === 'success') {
        timerState = 'stopped';
        document.getElementById('myTimer-area').textContent = (`${(timeInSeconds/60)}：00`);
        setButtonVisibility({ time: true, start: true, pause: false, resume: false, stop: false });
        setMessages(message, 'success');
      }
    } else {
      // 登録フォームまたはログインフォームが表示されていない場合
      if (!document.getElementById('register-form') || !document.getElementById('login-form')) {
        createRegisterForm();
        createLoginForm();
      }
    }
  } catch (error) {
    setMessages(error.message, 'error');
  }
});

async function stopTimer() {
  try {

    let { userId } = getTokenAndUserId();

    const response = await fetch('api/timers/stop', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      const error = new Error(data.message);
      error.isServerError = true;
      throw error;
    }
    data.result = 'success';
    return data;
  } catch (error) {
    if (error.isServerError) {
      throw error;
    } else {
      throw new Error('予期せぬエラーが発生しました。ページをリロードしてもう一度お試しください。');
    }
  }
}


async function loadTimers() {
  let userId = null;
  if (checkLoginStatus()) {
    userId = getTokenAndUserId().userId;
  }
  const tableBody = document.querySelector("#timer-table tbody");
  while (tableBody.firstChild) {
    tableBody.removeChild(tableBody.firstChild);
  }
  try {
    const response = await fetch('api/timers/getAllTimers');
    const data = await response.json();
    if (!data.timers) {
      throw new Error('タイマーはありません。');
    }
    for (let timer of data.timers) {
      let { minutes, seconds, formattedSeconds } = convertRemainingTime(timer.remainingTime * 1000);
      switch (timer.action) {
        case 'start':
          countdown(timer);
          timerState = 'started';
          break;
        case 'pause':
          updateTimerTable(minutes, seconds, timer, formattedSeconds);
          break;
      }
      if (isMyTimer(timer, userId)) {
        // 自分のタイマーだった時の処理
        switch (timer.action) {
          case 'start':
            setButtonVisibility({ time: false, start: false, pause: true, resume: false, stop: true });
            timerState = 'started';
            break;
          case 'pause':
            setButtonVisibility({ time: false, start: false, pause: false, resume: true, stop: true });
            timerState = 'paused';
            break;
        }
      }
    }
  } catch (error) {
    setMessages(error.message, 'error');
  }
};



function updateButtonDisplay() {
  switch (timerState) {
    case 'stopped':
      startButton.style.display = 'inline-block';
      pauseButton.style.display = 'none';
      resumeButton.style.display = 'none';
      stopButton.style.display = 'none';
      break;
    case 'started':
      startButton.style.display = 'none';
      pauseButton.style.display = 'inline-block';
      resumeButton.style.display = 'none';
      stopButton.style.display = 'inline-block';
      break;
    case 'paused':
      startButton.style.display = 'none';
      pauseButton.style.display = 'none';
      resumeButton.style.display = 'inline-block';
      stopButton.style.display = 'inline-block';
      break;
  }
}

export { loadTimers, startButton, pauseButton, resumeButton, stopButton, timerState, pauseTimer, stopTimer, updateButtonDisplay };
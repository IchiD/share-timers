import { loadTimers, startButton, pauseButton, resumeButton, stopButton, stopTimer } from './fetchTimer.js';
import { createRegisterForm } from './register.js';
import { createLoginForm } from './login.js';
import { createDeleteConfirmForm } from './deleteConfirm.js';
import { getTokenAndUserId, updateName, addComment, getUser, deleteUser, sendMail } from './fetchUser.js';

const socket = io();
const userInfoName = document.getElementById('user-info-name');
const updateNameButton = document.getElementById('update-name-button');
const myTimerArea = document.getElementById('myTimer-area');
const logoutButton = document.getElementById('logout-button');
const deleteButton = document.getElementById('delete-button');
const userInfoButton = document.getElementById('user-info-button');
const userInfoArea = document.getElementById('user-info');
const userInfoClose = document.getElementById('user-info-close');
const contactClose = document.getElementById('contact-close');
const modalArea = document.getElementById('modal-area');
const formData = document.getElementById('user-info-form');
const inputCommentArea = document.getElementById('input-comment-area');
const messageArea = document.getElementById('message-area');
const audioElement = document.getElementById('alert-sound');
const volumeCheckButton = document.getElementById('volume-check-button');
const stopAlertButton = document.getElementById('stop-alert-button');
const contactForm = document.getElementById('contact-form');
const contactSubmitButton = document.getElementById('contact-submit');
const footerContact = document.getElementById('footer-contact');

let volumeSlider = document.getElementById('volume-slider');
let timerSelectionElement = document.getElementById('selection-time');
let activeTimers = {};
let userId = null;
let userName = null;
const TIMER_DEFAULT = 900;// タイマーの初期値を設定(秒数)
let timeInSeconds = TIMER_DEFAULT;
timerSelectionElement.value = TIMER_DEFAULT;

// エスケープされたHTMLをデコードする関数
function decodeHtmlEntities(encodedText) {
  if (!encodedText) {
    return '';
  }
  let div = document.createElement('div');
  div.innerHTML = encodedText;
  let decodedText = div.textContent || div.innerText;
  return decodedText;
}

function headerScroll() {
  const header = document.querySelector('header');
  const headerHeight = header.clientHeight;
  const scrollY = window.scrollY;
  if (scrollY > 30) {
    header.classList.add('fadeOut');
    header.classList.remove('fadeIn');
  } else {
    header.classList.add('fadeIn');
    header.classList.remove('fadeOut');
  }
}

window.onscroll = headerScroll;


// スライダーの値が変更されたときに音量を調整
volumeSlider.addEventListener('input', function () {
  audioElement.volume = this.value;
});

volumeCheckButton.addEventListener('click', function () {
  if (audioElement.paused) {
    audioElement.play();
    this.textContent = "　停止　";
  } else {
    audioElement.pause();
    audioElement.currentTime = 0; // 再生位置を先頭に戻す
    this.textContent = "音量確認";
  }
});



async function getUserInfo() {
  if (checkLoginStatus()) {
    userId = getTokenAndUserId().userId;
    try {
      const user = await getUser(userId);
      userName = user.username;
    } catch (error) {
      setMessages(error.message, 'error');
    }
  } else {
    // 登録フォームまたはログインフォームが表示されていない場合
    if (!document.getElementById('register-form') || !document.getElementById('login-form')) {
      createRegisterForm();
      createLoginForm();
    }
  }
}


function setFooterEventListener() {
  footerContact.addEventListener('click', function () {
    if (contactForm.classList.contains('noDisp')) {
      contactForm.classList.remove('noDisp');
      modalArea.className = 'modalBg fadeIn';
    }


  });

  contactClose.addEventListener('click', function () {
    if (!contactForm.classList.contains('noDisp')) {
      contactForm.classList.add('noDisp');
      modalArea.className = 'modalBg fadeOut';
    }
  });

  //  お問い合わせフォーム
  contactForm.addEventListener('submit', async (event) => {
    try {
      event.preventDefault();
      var name = document.getElementById('name').value;
      var email = document.getElementById('email').value;
      var message = document.getElementById('message').value;
      contactSubmitButton.disabled = true;
      contactSubmitButton.textContent = '送信中...';
      const data = await sendMail(name, email, message);
      if (data && data.result) {
        contactForm.classList.add('noDisp');
        modalArea.className = 'modalBg fadeOut';
        document.getElementById('name').value = '';
        document.getElementById('email').value = '';
        document.getElementById('message').value = '';
        setMessages(data.message, 'success');
      } else if (data && !data.result) {
        setMessages(data.message, 'error');
      } else if (data === null) {
        setMessages('送信できませんでした。', 'error');
      } else {
        setMessages('システムエラーが発生しました。時間を置いてもう一度お試しください。', 'error');
      }
      contactSubmitButton.textContent = '送信';
      contactSubmitButton.disabled = false;
    } catch (error) {
      setMessages(error.message, 'error');
      contactSubmitButton.textContent = '送信';
      contactSubmitButton.disabled = false;
    }
  });

}



document.addEventListener('DOMContentLoaded', () => {

  setFooterEventListener();
  headerScroll();

  loadTimers();
  if (checkLoginStatus()) {
    getUserInfo();
    setupDOMElements();

  } else {
    createRegisterForm();
    createLoginForm();
  }
  const message = sessionStorage.getItem('message') || null;

  if (message) {
    setMessages(message, 'success');
    sessionStorage.removeItem('message');
  }
});

window.addEventListener('onload', () => {
  loadTimers();
});

window.addEventListener('visibilitychange', function (event) {
  if (checkLoginStatus()) {
    if (document.visibilityState === 'visible') {
      loadTimers();
    }
  } else {
    // 登録フォームまたはログインフォームが表示されていない場合
    if (!document.getElementById('register-form') || !document.getElementById('login-form')) {
      createRegisterForm();
      createLoginForm();
    }
  }
});

function setupDOMElements() {

  // ユーザー名変更ボタン
  updateNameButton.addEventListener('click', async () => {
    if (checkLoginStatus()) {
      try {
        const data = await updateName();
        if (data.status === 'notChanged') return;
        if (data.username) {
          userName = data.username;
          setMessages(data.message, 'success');
          modalArea.className = 'modalBg fadeOut';
          userInfoArea.classList.add('noDisp');
          userInfoButton.classList.remove('noDisp');
        } else {
          setMessages(data.message, 'error');
          modalArea.className = 'modalBg fadeOut';
          userInfoArea.classList.add('noDisp');
          userInfoButton.classList.remove('noDisp');
          userInfoName.value = userName;
        }
      } catch (error) {
        setMessages('サーバーに接続できませんでした。時間を置いてもう一度お試しください。', 'error');
      }
    }
  });

  logoutButton.addEventListener('click', async () => {

    if (checkLoginStatus()) {
      const user = await getUser(userId);
      removeTimerFromTable(decodeHtmlEntities(user.username));
      if (activeTimers[userId]) {
        stopTimer();
      }
      logout();
      createRegisterForm();
      createLoginForm();
      userInfoButton.classList.add('noDisp');
      userInfoArea.classList.add('noDisp');
      modalArea.classList.add('noDisp');
      myTimerArea.remove();
      setButtonVisibility({ time: false, start: false, pause: false, resume: false, stop: false });
      setMessages('ログアウトしました。', 'success');
    }
    userInfoArea.classList.add('noDisp');
    modalArea.classList.add('noDisp');
    myTimerArea.remove();
    if (!document.getElementById('register-form') || !document.getElementById('login-form')) {
      createRegisterForm();
      createLoginForm();
    }
  });

  // 会員情報削除のボタンを押したとき
  deleteButton.addEventListener('click', async (event) => {
    event.preventDefault();
    if (checkLoginStatus()) {
      modalArea.className = 'modalBg fadeIn';
      userInfoArea.classList.add('noDisp');
      const result = await createDeleteConfirmForm();
      // resultがtrueなら削除実行
      if (!result) {
        userInfoArea.classList.remove('noDisp');
        return;
      }
      try {
        const data = await deleteUser();
        if (data && data.result) { // ユーザー削除成功
          // dbに自分のIDのタイマーがあれば削除
          if (activeTimers[data.userId]) {
            stopTimer();
          }
          logout();
          createRegisterForm();
          createLoginForm();
          userInfoButton.classList.add('noDisp');
          userInfoArea.classList.add('noDisp');
          modalArea.style.display = 'none';
          myTimerArea.remove();
          setButtonVisibility({ time: false, start: false, pause: false, resume: false, stop: false });
          setMessages(data.message, 'success');
        } else if (data && !data.result) {
          setMessages(data.message, 'error');
        } else {
          setMessages('システムエラーが発生しました。ページの再読み込みをしてもう一度お試しください。', 'error');
        }
      } catch (error) {
        setMessages(error.message, 'error');
      }
    } else {
      // 登録フォームまたはログインフォームが表示されていない場合
      if (!document.getElementById('register-form') || !document.getElementById('login-form')) {
        userInfoArea.classList.add('noDisp');
        modalArea.classList.add('noDisp');
        createRegisterForm();
        createLoginForm();
      }
    }
  });

  //  アラーム音の停止ボタン
  stopAlertButton.addEventListener('click', function () {
    audioElement.pause(); // 音を停止
    audioElement.currentTime = 0; // 再生位置を先頭に戻す
    this.classList.add('noDisp');
  });

  // ユーザー情報を表示させるボタン
  userInfoButton.addEventListener('click', function () {
    if (checkLoginStatus()) {
      if (userInfoArea.classList.contains('noDisp')) {
        userInfoButton.classList.add('noDisp');
        userInfoArea.className = 'fadeIn';
        modalArea.className = 'modalBg fadeIn';
      }
    } else {
      // 登録フォームまたはログインフォームが表示されていない場合
      if (!document.getElementById('register-form') || !document.getElementById('login-form')) {
        createRegisterForm();
        createLoginForm();
      }
    }
  });
  // ユーザー情報を閉じるボタン
  userInfoClose.addEventListener('click', function () {
    if (!userInfoArea.classList.contains('noDisp')) {
      userInfoArea.className = 'fadeOut noDisp';
      modalArea.className = 'modalBg fadeOut';
      userInfoButton.classList.remove('noDisp');
    }
  });

  if (userId) {
    // ユーザーIDからユーザー情報を取得
    getUser(userId).then((user) => {
      // コメントを反映
      if (user.comment) {
        const decodedComment = decodeHtmlEntities(user.comment)
        if (!decodedComment) {
          inputCommentArea.value = '';
          return;
        } else {
          inputCommentArea.value = decodedComment;
        }
      }
      // ユーザー名を反映
      if (user.username) {
        userInfoName.value = user.username;
      }
    });
  }
};

// コメントの更新
formData.addEventListener('submit', (event) => {
  event.preventDefault();
  if (checkLoginStatus()) {
    addComment();
    userInfoButton.classList.remove('noDisp');
  } else {
    // 登録フォームまたはログインフォームが表示されていない場合
    if (!document.getElementById('register-form') || !document.getElementById('login-form')) {
      createRegisterForm();
      createLoginForm();
    }
  }
  userInfoArea.classList.add('noDisp');
  modalArea.classList.add('noDisp');
});

// タイマー設定時間が変更された時の処理
timerSelectionElement.addEventListener('change', function () {
  timeInSeconds = this.value;
  myTimerArea.textContent = `${timeInSeconds / 60}：00`;
});

// ーーーーここまでイベントリスナーの設定ーーーー

// メッセージを表示しフェードアウト
let currentAnimation = null;
function setMessages(message, state) {
  if (currentAnimation) {
    clearTimeout(currentAnimation);
    messageArea.className = '';
  }

  messageArea.textContent = message;
  messageArea.classList.add(state);
  messageArea.style.display = 'block';

  currentAnimation = setTimeout(() => {
    messageArea.classList.add('fadeOut');
  }, 10000);

  messageArea.addEventListener('animationend', () => {
    messageArea.classList.remove(state);
    messageArea.classList.remove('fadeOut');
    messageArea.style.display = 'none';
    currentAnimation = null;
  }, { once: true });
}

// トークンがローカルストレージにあるかどうか
function hasToken() {
  return !!localStorage.getItem('token');
}

function checkLoginStatus() {
  try {
    if (!hasToken()) {
      // ローカルストレージにトークンがない場合
      handleNotLoggedIn();
      return null;
    } else {
      const { userId, reason } = getTokenAndUserId();
      if (reason) {
        handleInvalidUser(reason);
        return null;
      } else {
        handleLoggedIn(userId);
        return true;
      }
    }
  } catch (error) {
    setMessages(error.message, 'error');
    return null;
  }
}

// ログイン済みの場合の処理
function handleLoggedIn(userId) {
  // userInfoAreaがnoDispクラスを持っている場合
  if (userInfoArea.classList.contains('noDisp')) {
    userInfoButton.classList.remove('noDisp');
  }
}

// ログインしていない場合の処理
function handleNotLoggedIn() {
  setButtonVisibility({ time: false, start: false, pause: false, resume: false, stop: false });
  myTimerArea.remove();
}

// ユーザーが無効な場合の処理
function handleInvalidUser(reason) {
  myTimerArea.remove();
  userInfoButton.classList.add('noDisp');
  setButtonVisibility({ time: false, start: false, pause: false, resume: false, stop: false });
  setMessages(reason, 'error');
}




// ログアウト
function logout() {
  localStorage.removeItem('token');
}

// 自分のタイマーかどうかを判定する関数
function isMyTimer(timer, userId) {
  if (timer.userId === userId) {
    return true;
  } else {
    return false;
  }
}





socket.on('timerStarted', function (timer) {
  countdown(timer);
});

socket.on('timerPaused', function (timer) {
  pauseTimer(timer);
});

socket.on('timerResumed', function (timer) {
  resumeTimer(timer);
});

socket.on('timerStopped', function (timer) {
  clearInterval(activeTimers[timer.userId]);
  removeTimerFromTable(decodeHtmlEntities(timer.username));
});

// 現在時刻とタイマーの終了時間の差分を取得する関数
function getRemainingTimeInMilliseconds(timer) {
  // 現在時刻とタイマーの終了時間の差分を取得
  let remainingTimeInMilliseconds = new Date(timer.endTime).getTime() - new Date().getTime();
  return remainingTimeInMilliseconds;
}

// 残り時間を分と秒に変換する関数
function convertRemainingTime(remainingTimeInMilliseconds) {
  // 残り時間が0以下の場合は0を返す
  if (remainingTimeInMilliseconds < 0) {
    return { minutes: 0, seconds: 0, formattedSeconds: '00' };
  }
  // 残り時間を分と秒に変換
  let minutes = Math.floor((remainingTimeInMilliseconds % (1000 * 60 * 60)) / (1000 * 60));
  let seconds = Math.floor((remainingTimeInMilliseconds % (1000 * 60)) / 1000);
  // 1桁の秒数を2桁にフォーマット
  let formattedSeconds = String(seconds).padStart(2, '0');
  return { minutes, seconds, formattedSeconds };
}

function countdown(timer) {
  // すでにカウントダウンが始まっている場合はカウントダウンを停止
  if (activeTimers[timer.userId]) {
    clearInterval(activeTimers[timer.userId]);
  }


  let remainingTimeInMilliseconds = getRemainingTimeInMilliseconds(timer);

  // カウントダウン処理
  activeTimers[timer.userId] = setInterval(function () {
    let { minutes, seconds, formattedSeconds } = convertRemainingTime(remainingTimeInMilliseconds);
    // 残り時間を表示
    updateTimerTable(minutes, seconds, timer, formattedSeconds);
    // 残り時間を減らす
    remainingTimeInMilliseconds -= 1000;
    // タイマーが0になったらカウントダウンを停止
    if (remainingTimeInMilliseconds <= 0) {
      remainingTimeInMilliseconds = 0;
      clearInterval(activeTimers[timer.userId]);
      // サーバーに削除要求を送信
      socket.emit('endedTimerDeleted', timer.userId);
      setTimeout(function () {
        removeTimerFromTable(decodeHtmlEntities(timer.username));
      }, 60000);

      if (isMyTimer(timer, userId)) {
        setButtonVisibility({ time: true, start: true, pause: false, resume: false, stop: false });
      }
    }
    if (isMyTimer(timer, userId)) {
      if (minutes === 0 && seconds <= 0) {
        audioElement.play();
        myTimerArea.textContent = `0：00`;
        stopAlertButton.classList.remove('noDisp');
      } else {
        myTimerArea.textContent = `${minutes}：${formattedSeconds}`;
      }
    }
  }, 1000);
}

function pauseTimer(timer) {
  let remainingTimeInMilliseconds = getRemainingTimeInMilliseconds(timer);
  let { minutes, seconds, formattedSeconds } = convertRemainingTime(remainingTimeInMilliseconds);
  updateTimerTable(minutes, seconds, timer, formattedSeconds);
  clearInterval(activeTimers[timer.userId]);
}

function resumeTimer(timer) {
  countdown(timer);
}


// テーブルを更新する関数
function updateTimerTable(minutes, seconds, timer, formattedSeconds) {

  const decodedUsername = decodeHtmlEntities(timer.username);
  const decodedComment = decodeHtmlEntities(timer.comment);
  const tableBody = document.querySelector("#timer-table tbody");
  // 既存の行を検索
  let row = tableBody.querySelector(`tr[data-username="${decodedUsername}"]`);
  let additionalInfoRow; // コメント行の定義
  if (!row) {

    // 行が存在しない場合は新規作成
    row = document.createElement("tr");
    row.setAttribute("data-username", decodedUsername);
    row.classList.add('user-list');

    const usernameCell = document.createElement("td");
    usernameCell.textContent = decodedUsername;
    row.appendChild(usernameCell);

    const timeCell = document.createElement("td");
    timeCell.textContent = `${minutes} : ${formattedSeconds}`;
    row.appendChild(timeCell);

    // コメントを表示するための新しい行とセルを作成
    if (decodedComment !== '') {
      additionalInfoRow = document.createElement("tr");
      additionalInfoRow.setAttribute("data-username", `${decodedUsername}-info`);
      additionalInfoRow.classList.add('timer-info');
      const additionalInfoCell = document.createElement("td");
      additionalInfoCell.textContent = decodedComment;
      additionalInfoCell.colSpan = 2; // セルを2列分に広げる
      additionalInfoRow.appendChild(additionalInfoCell);
    }

    // 行をクリックしたときのイベントリスナーを設定
    row.addEventListener("click", () => {
      if (additionalInfoRow) {
        // コメントの行が非表示なら表示し、表示中なら非表示にする
        if (additionalInfoRow.classList.contains('is-open')) {
          row.classList.remove('is-open');
          additionalInfoRow.classList.remove('is-open');
        } else {
          row.classList.add('is-open');
          additionalInfoRow.classList.add('is-open');
        }
      }
    });

    tableBody.appendChild(row);
    if (additionalInfoRow) {
      tableBody.appendChild(additionalInfoRow);
    }

    if (isMyTimer(timer, userId)) {
      myTimerArea.textContent = `${minutes}：${formattedSeconds}`;
      tableBody.insertBefore(row, tableBody.firstChild);
      if (additionalInfoRow) {
        tableBody.insertBefore(additionalInfoRow, row.nextSibling);
      }
      row.style.background = '#45fdf7b3';
    }
  }

  // 残り時間を更新
  const timeCell = row.lastChild;
  if (minutes === 0 && seconds <= 0) {
    timeCell.textContent = `終了`;
  } else {
    timeCell.textContent = `${minutes}：${formattedSeconds}`;
  }
}

// テーブルからタイマーを削除する関数
function removeTimerFromTable(username) {
  const tableBody = document.querySelector("#timer-table tbody");

  // 既存の行を検索
  let row = tableBody.querySelector(`tr[data-username="${username}"]`);
  // コメント行の定義
  let additionalInfoRow = tableBody.querySelector(`tr[data-username="${username}-info"]`);
  if (row) {
    // 行が存在する場合は削除
    tableBody.removeChild(row);
    if (additionalInfoRow) {
      additionalInfoRow.remove();
    }
  }
}

// ボタンの表示非表示を切り替える関数
function setButtonVisibility({ time, start, pause, resume, stop }) {
  timerSelectionElement.style.display = time ? 'inline-block' : 'none';
  startButton.style.display = start ? 'inline-block' : 'none';
  pauseButton.style.display = pause ? 'inline-block' : 'none';
  resumeButton.style.display = resume ? 'inline-block' : 'none';
  stopButton.style.display = stop ? 'inline-block' : 'none';
}





export { timeInSeconds, userInfoName, messageArea, userInfoArea, userInfoButton, modalArea, setButtonVisibility, checkLoginStatus, isMyTimer, countdown, convertRemainingTime, updateTimerTable, setupDOMElements, setMessages, decodeHtmlEntities };
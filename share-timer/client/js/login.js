import { authenticateUser } from './fetchUser.js';
import { setMessages } from './index.js';


export function createLoginForm() {
  const formArea = document.getElementById("form-area");

  // フォームを作成
  var loginForm = document.createElement("form");
  loginForm.setAttribute("id", "login-form");
  loginForm.setAttribute("action", "process.env.APP_URL");
  loginForm.setAttribute("method", "POST");

  // ユーザー名入力フィールドを作成
  var usernameInput = document.createElement("input");
  usernameInput.setAttribute("type", "text");
  usernameInput.setAttribute("name", "username");
  usernameInput.setAttribute("placeholder", "ユーザー名");
  loginForm.appendChild(usernameInput);

  // パスワード入力フィールドを作成
  var passwordInput = document.createElement("input");
  passwordInput.setAttribute("type", "password");
  passwordInput.setAttribute("name", "password");
  passwordInput.setAttribute("placeholder", "パスワード");
  loginForm.appendChild(passwordInput);

  // ログインボタンを作成
  var submitInput = document.createElement("input");
  submitInput.setAttribute("type", "submit");
  submitInput.setAttribute("value", "ログイン");
  loginForm.appendChild(submitInput);

  // 作成したフォームを#form-areaの最後に追加
  formArea.appendChild(loginForm);

  loginForm.addEventListener('submit', async (event) => {
    try {
      event.preventDefault();
      const formData = new FormData(loginForm);
      const username = formData.get('username');
      const password = formData.get('password');
      // 未入力の場合はエラー
      if (!username || !password) {
        return setMessages('ユーザー名とパスワードを入力してください。', 'error');
      }
      if(username.length > 10) {
        return setMessages('ユーザー名は10文字以内で入力してください。', 'error');
      }
      if (username.match(/https?:\/\/[-_.!~*\'()a-zA-Z0-9;\/?:\@&=+\$,%#]+/)) {
        return setMessages('ユーザー名にURLは使用できません。f', 'error');
      }
      if(password.length < 5 || password.length > 20) {
        return setMessages('パスワードは5〜20文字で入力してください。', 'error');
      }
      const { token, message } = await authenticateUser(`/api/users/login`, username, password);
      if (token) {
        localStorage.setItem('token', token);
        sessionStorage.setItem('message', 'ログインしました！');
        location.reload();
      } else {
        throw new Error(message);
      }
    } catch (error) {
      console.error(error.message);
      setMessages(error.message, 'error');
    }
  });

}

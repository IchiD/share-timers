import { authenticateUser } from './fetchUser.js';
import { setMessages } from './index.js';

export function createRegisterForm() {
  const formArea = document.getElementById("form-area");

  // フォームを作成
  let registerForm = document.createElement("form");
  registerForm.setAttribute("id", "register-form");
  registerForm.setAttribute("action", "process.env.APP_URL");
  registerForm.setAttribute("method", "POST");

  // ユーザー名入力フィールドを作成
  let usernameInput = document.createElement("input");
  usernameInput.setAttribute("type", "text");
  usernameInput.setAttribute("name", "username");
  usernameInput.setAttribute("placeholder", "ユーザー名");
  registerForm.appendChild(usernameInput);

  // パスワード入力フィールドを作成
  let passwordInput = document.createElement("input");
  passwordInput.setAttribute("type", "password");
  passwordInput.setAttribute("name", "password");
  passwordInput.setAttribute("placeholder", "パスワード");
  registerForm.appendChild(passwordInput);
  
  // 登録ボタンを作成
  let submitInput = document.createElement("input");
  submitInput.setAttribute("type", "submit");
  submitInput.setAttribute("value", "登録");
  registerForm.appendChild(submitInput);

  // 注意書きを作成
  let caution = document.createElement("p");
  caution.textContent = "※ユーザー名はアプリ内で公開されますので、個人情報は入力しないでください。";
  caution.setAttribute("class", "register-caution");
  registerForm.appendChild(caution);
  
  // 作成したフォームを#form-areaの最後に追加
  formArea.appendChild(registerForm);

  registerForm.addEventListener('submit', async (event) => {
    try {
      event.preventDefault();
      const formData = new FormData(registerForm);
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
        return setMessages('ユーザー名にURLは使用できません。', 'error');
      }
      if(password.length < 5 || password.length > 20) {
        return setMessages('パスワードは5〜20文字で入力してください。', 'error');
      }
      const { token, message } = await authenticateUser(`/api/users/register`, username, password);
      if (token) {
        localStorage.setItem('token', token);
        sessionStorage.setItem('message', '登録しました！');
        location.reload();
      } else {
        throw new Error(message);
      }

    } catch (error) {
      setMessages(error.message, 'error');
    }
  });
}


import { setMessages, checkLoginStatus, userInfoName } from './index.js';

async function authenticateUser(url, username, password) {
  let data = null;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });
    if(!response.ok) {
      const { message } = await response.json();
      throw new Error(message);
    }
    const { token, message } = await response.json();
    return { token, message };

  } catch (error) {
    return { token: null, message: error.message };
  }
}

// JWTをlocalStorageから取得しそれをデコードしてユーザーIDを取得。
function getTokenAndUserId() {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('トークンが見つかりませんでした。ログインしてください。');
    }
    // tokenからユーザーIDを取得
    const payload = token.split('.')[1];
    if (!payload) {
      throw new Error('トークンが無効です。もう一度ログインしてください。');
    }
    const decodedPayload = atob(payload);
    const { userId, exp } = JSON.parse(decodedPayload);
    const currentTimestamp = Math.floor(Date.now() / 1000);
    if (currentTimestamp > exp) {
      localStorage.removeItem('token');
      throw new Error('ログインの有効期限が切れました。もう一度ログインしてください。');
    }
    return { token, userId };
  } catch (error) {
    // setMessages(error.message, 'error');
    return { token: null, userId: null, reason: error.message };
  }
}

// ユーザーIDからユーザー情報を取得
async function getUser(userId) {
  const { token } = getTokenAndUserId();
  try {
    const response = await fetch(`api/users/getUser/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error('ユーザー情報が取得できませんでした。');
    }
    const data = await response.json();
    const user = data;
    return user;
  } catch (error) {
    if (error.message === 'ユーザー情報が取得できませんでした') {
      return null;
    } else {
      return null;
    }

  }
}

// ユーザー名を変更する
async function updateName() {
  try {
    const { token, userId } = getTokenAndUserId();
    const userInfo = await getUser(userId);
    const usernameBefore = userInfo.name;
    const usernameAfter = userInfoName.value.trim();
    if (usernameAfter === "") {
      const data = {};
      data.message = 'aaaユーザー名を入力してください。';
      return data;
    }
    if (usernameAfter === usernameBefore) {
      const data = {};
      data.status = 'notChanged';
      return data;
    }
    if (usernameAfter.length > 10) {
      const data = {};
      data.message = 'ユーザー名は10文字以内で入力してください。';
      return data;
    }
    if (usernameAfter.match(/https?:\/\/[-_.!~*\'()a-zA-Z0-9;\/?:\@&=+\$,%#]+/)) {
      const data = {};
      data.message = 'ユーザー名にURLは使用できません。';
      return data;
    }

    const response = await fetch(`/api/users/updateName/${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ username: usernameAfter })
    });

    const data = await response.json();
    return data;

  } catch (error) {
    setMessages('aサーバーに接続できませんでした。時間を置いてもう一度お試しください。', 'error');
  }
}

// ユーザーのコメントを取得して変更がなかったら何もしない、変更があったら更新する。
async function addComment() {
  try {
    const { token, userId } = getTokenAndUserId();
    const commentFormData = new FormData(document.getElementById('user-info-form'));
    const comment = commentFormData.get('comment');

    if(comment.length > 25) {
      return setMessages('コメントは25文字以内で入力してください。', 'error');
    }
    if (comment.match(/https?:\/\/[-_.!~*\'()a-zA-Z0-9;\/?:\@&=+\$,%#]+/)) {
      return setMessages('コメントにURLは使用できません。', 'error');
    }

    const response = await fetch(`api/users/addComment/${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ comment }),
    });

    const data = await response.json();

    response.status === 200 ? setMessages(data.message, 'success') : setMessages(data.message, 'error');

  } catch (error) {
    setMessages('サーバーに接続できませんでした。時間を置いてもう一度お試しください。', 'error');
  }
}


async function deleteUser() {
  let data;
  try {
    const { token, userId } = getTokenAndUserId();
    const response = await fetch(`api/users/delete/${userId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    data = await response.json();
    return data;
  } catch (error) {
    return null;
  }
}



async function sendMail(name, email, message) {
  try {
    let userId = null;
    let token = null;
    let headers = {
      'Content-Type': 'application/json',
      'authorization': null,
    };
    if(checkLoginStatus()) {
      userId = getTokenAndUserId().userId;
      token = getTokenAndUserId().token;
      headers['authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`/api/users/sendMail/${userId}`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({ name: name, email: email, message: message }),
    })
    const data = await response.json();
    return data;

  } catch (error) {
    setMessages('サーバーに接続できませんでした。時間を置いてもう一度お試しください。', 'error');
    return null;
  }
};

export { getTokenAndUserId, authenticateUser, updateName, deleteUser, addComment, getUser, sendMail };
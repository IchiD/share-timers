import User from '../models/user.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import escapeHtml from 'escape-html';


dotenv.config();

// 会員情報のエンドポイント処理

const secret = process.env.JWT_SECRET;

// 登録
const register = async (req, res) => {
  try {
    let { username, password } = req.body;

    // エスケープ処理
    username = escapeHtml(username);
    // パスワードとユーザー名が同じ場合はエラー
    if (username === password) {
      return res.status(400).json({ message: 'ユーザー名とパスワードは同じものを使用できません。' });
    }
    // ユーザー名の重複チェック
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: '別のユーザー名をご使用ください。' });
    }
    const user = new User({ username, password });
    await user.save();
    const token = jwt.sign({ userId: user._id }, secret, { expiresIn: '8h' });
    res.status(201).json({ message: '会員登録しました', token });

  } catch (error) {
    res.status(500).json({ message: 'サーバーで問題が発生しました。時間を置いてもう一度お試しください。' });
  }
};


// ログイン
const login = async (req, res) => {
  try {
    let { username, password } = req.body;

    // エスケープ処理
    username = escapeHtml(username);
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: 'ユーザーが見つかりませんでした。' });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'パスワードが間違っています。' });
    }
    // 認証成功
    const token = jwt.sign({ userId: user._id }, secret, { expiresIn: '8h' });
    res.json({ message: 'ログインしました。', token });

  } catch (error) {
    // サーバーでエラーが発生した場合
    res.status(500).json({ message: 'サーバーで問題が発生しました。時間を置いてもう一度お試しください。' });
  }
};

// コメント追加
const addComment = async (req, res) => {
  try {
    const { id: _id } = req.params;
    let { comment } = req.body;
    if (_id !== req.userId) {
      return res.status(401).json({ message: '認証に失敗しました。' });
    }

    // エスケープ処理
    comment = escapeHtml(comment);
    // コメントだけを更新
    const updatedUser = await User.findByIdAndUpdate(_id, { comment: comment }, { new: true });

    if (!updatedUser) {
      return res.status(404).json({ message: 'ユーザーが見つかりませんでした。ログインし直してください。' });
    }

    res.status(200).json({ message: 'コメントを更新しました。' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'サーバーで問題が発生しました。時間を置いてもう一度お試しください。' });
  }
};

// ユーザー名変更
const updateName = async (req, res) => {
  console.log(req.body);
  try {
    const { id: _id } = req.params;
    let { username } = req.body;
    if (_id !== req.userId) {
      return res.status(401).json({ message: '認証に失敗しました。' });
    }

    // エスケープ処理
    username = escapeHtml(username);
    // ユーザー名が変更されていない場合
    const user = await User.findById({ _id });
    const userNameBefore = user.username;
    const userPassword = user.password;
    if (userNameBefore === username) {
      return res.status(400).json({ status: 'notChanged' });
    }
    const isUsernameSameAsPassword = await bcrypt.compare(username, userPassword);
    if (isUsernameSameAsPassword) {
      return res.status(400).json({ message: 'ユーザー名とパスワードが一致しています。ユーザー名とパスワードは異なるものを設定してください。' });
    }
    // ユーザー名の重複チェック
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: '別のユーザー名をご使用ください。' });
    }

    // ユーザー名だけを更新
    const updatedUser = await User.findByIdAndUpdate(_id, { username: username }, { new: true });

    if (!updatedUser) {
      return res.status(404).json({ message: 'ユーザーが見つかりませんでした。ログインし直してください。' });
    }

    res.status(200).json({ message: 'ユーザー名を変更しました。', username: updatedUser.username });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'サーバーで問題が発生しました。時間を置いてもう一度お試しください。' });
  }
};

// ユーザー情報の取得
const getUser = async (req, res) => {
  try {
    const { id: _id } = req.params;
    if (_id !== req.userId) {
      return res.status(401).json({ message: '認証に失敗しました。' });
    }
    const user = await User.findById(_id);
    if (!user) {
      return res.status(404).json({ message: 'ユーザーが見つかりませんでした。ログインし直してください。' });
    }
    return res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'サーバーで問題が発生しました。時間を置いてもう一度お試しください。' });
  }
};

// 会員削除
const deleteUser = async (req, res) => {
  try {
    const { id: _id } = req.params;
    if (_id !== req.userId) {
      return res.status(400).json({ message: '認証に失敗しました。', result: false });
    }
    const deletedUser = await User.findByIdAndDelete(_id);
    if (!deletedUser) {
      return res.status(404).json({ message: 'ユーザーが見つかりませんでした。ログインし直してください。', result: false });
    }
    res.status(200).json({ message: `${deletedUser.username}さんの会員情報を削除しました。`, userId: deletedUser._id, result: true });

  } catch (error) {
    res.status(500).json({ message: 'サーバーで問題が発生しました。時間を置いてもう一度お試しください。', result: false });
  }
};

const sendMail = async (req, res) => {
  try {
    const { id: _id } = req.params;
    if (req.userId && _id !== req.userId) {
      return res.status(400).json({ message: '認証に失敗しました。', result: false });
    }
    const { name, email, message, } = req.body;
    const mailOptions = {
      from: email,
      to: process.env.EMAIL_ADDRESS,
      replyTo: email,
      subject: `${name}様からのお問い合わせ`,
      text: message,
    };

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_ADDRESS,
        pass: process.env.EMAIL_ADDRESS_PASSWORD
      }
    });


    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return res.status(500).json({ message: 'サーバーで問題が発生しました。時間を置いてもう一度お試しください。', result: false });
      }
      res.status(200).json({ message: 'メッセージを送信しました。', result: true });
    });

  } catch (error) {
    res.status(500).json({ message: 'サーバーで問題が発生しました。時間を置いてもう一度お試しください。', result: false });
  }
};




export default { register, login, updateName, deleteUser, addComment, getUser, sendMail };

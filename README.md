# 集中タイマー
## 環境

- Language：JavaScript
- Version：1.0.0
- Visual Studio Code：1.80.1
- URL：[集中タイマー](https://share-timers-a181bd44c5a1.herokuapp.com/) 

### ライブラリ

- [bcryptjs](https://www.npmjs.com/package/bcryptjs)：パスワードハッシュ化用
- [dotenv](https://www.npmjs.com/package/dotenv)：環境変数の管理
- [express](https://www.npmjs.com/package/express)：サーバーサイドフレームワーク
- [express-validator](https://www.npmjs.com/package/express-validator)：リクエストバリデーション
- [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken)：JWT (Json Web Tokens) の生成と検証
- [mongodb](https://www.npmjs.com/package/mongodb)：MongoDB ドライバー
- [mongoose](https://www.npmjs.com/package/mongoose)：MongoDB のオブジェクトモデリング
- [nodemailer](https://www.npmjs.com/package/nodemailer)：メール送信
- [nodemon](https://www.npmjs.com/package/nodemon)：開発時の自動リロード
- [socket.io](https://www.npmjs.com/package/socket.io)：リアルタイム通信


## アプリの機能一覧

- ユーザー登録/ログイン機能：ユーザーネームとパスワードを使用してユーザー登録ができ、登録した情報を使ってログインが可能です。
- コメント登録機能：学習内容や取り組みをコメントとして登録することができます。
- タイマー機能：一定時間を設定し、その時間が経過したらアラームを鳴らすことができます。
- タイマー・コメント共有機能：設定したタイマー・コメントを他のユーザーと共有できます。
- リアルタイム通信：他のユーザーが設定したタイマー・コメントの状態をリアルタイムで確認できます。
- お問い合わせ機能：アプリ管理者へメール送信ができます。

## 使用した技術

- **プログラミング言語**：JavaScript
- **フロントエンド**：Vanilla JavaScript
- **バックエンド**：Express.js
- **データベース**：MongoDB
- **ORM**：Mongoose
- **リアルタイム通信**：Socket.io
- **認証**：jsonwebtoken, bcryptjs
- **メール送信**：nodemailer
- **開発ツール**：nodemon, dotenv
- **バリデーション**：express-validator

## リファレンス

- [Express.js公式ドキュメンテーション](https://expressjs.com/)
- [Mongoose公式ドキュメンテーション](https://mongoosejs.com/)
- [Socket.IO公式ドキュメンテーション](https://socket.io/)
- [【JS】ガチで学びたい人のためのJavaScriptメカニズム
](https://www.udemy.com/course/javascript-essence/)
- [Node.jsで学ぶWebシステムとソフトウェア開発基礎！Node.js完全入門ガイド](https://www.udemy.com/course/nodejs-comp-guide/)

- [独習JavaScript 新版](https://www.amazon.co.jp/%E7%8B%AC%E7%BF%92JavaScript-%E6%96%B0%E7%89%88-CodeMafia-%E5%A4%96%E6%9D%91-%E5%B0%86%E5%A4%A7/dp/479816027X)
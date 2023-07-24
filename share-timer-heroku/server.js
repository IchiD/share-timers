import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import userRoutes from './routes/users.js';
import Timer from './models/timer.js';
import User from './models/user.js';
import path from 'path';
import { fileURLToPath } from 'url';


const __dirname = path.dirname(fileURLToPath(import.meta.url));
import timerRoutes from './routes/timers.js';


// 環境変数の設定
dotenv.config();

const app = express();
app.use(express.static('client'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const server = http.createServer(app);

// Socket.IOを初期化
const io = new Server(server);


app.use('/api/users', userRoutes);
app.use('/api/timers', timerRoutes);

// MongoDB接続
async function connectToDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('データベースに接続しました。');
  } catch (error) {
    console.error('データベースに接続できませんでした。', error);
  }
}

connectToDatabase();


// ルートエンドポイントを設定
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/client/index.html'));
});


// Socket.IOの接続と切断のイベントを処理
io.on('connection', async (socket) => {
  console.log('ユーザーが接続しました。');

  const timers = await Timer.find({});
  if(!timers) {
    console.log('タイマーがありません。');
    return;
  }
  let timersWithUsernames = [];

  for (let timer of timers) {
    const user = await User.findById(timer.userId);
    let timerWithUsername = {
      username: user.username,
      userId: user._id,
      comments: user.comments,
      action: timer.action,
      remainingTime: timer.remainingTime,
      startTime: timer.startTime,
      endTime: timer.endTime
    }
    timersWithUsernames.push(timerWithUsername);
  }
  // クライアントに送信
  socket.emit('roaded', timersWithUsernames);

  socket.on('endedTimerDeleted', async (userId) => {
    try {
      // タイマーを削除
      await Timer.deleteOne({ userId: userId });
      console.log(`Timer for user ${userId} has been deleted.`);
    } catch (error) {
      console.error(`Failed to delete timer for user ${userId}: `, error);
    }
  });
  
  socket.on('disconnect', () => {
    console.log('ユーザーが切断しました。');
  });
  socket.on('updateTimer', () => {
    console.log('updateTimerが呼ばれました。');
  });
});

// サーバーを起動します
const port = process.env.PORT || 8080;
server.listen(port, () => {
  console.log(`Server Start at ${process.env.APP_URL}`);
});

export default io;
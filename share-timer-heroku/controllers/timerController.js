import Timer from '../models/timer.js';
import io from '../server.js';
import User from '../models/user.js';

// タイマー情報のエンドポイントの処理

// 開始
const start = async (req, res) => {
  try {
    const { userId, timeInSeconds } = req.body;
    
    const existingTimer = await Timer.findOne({ userId });
    if (existingTimer) {
      return res.status(400).json({ message: 'タイマーはすでに起動しています。' });
    }
  
    const startTime = new Date();
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: '存在しないユーザーです。' });
    }
    const endTime = new Date(startTime.getTime() + timeInSeconds * 1000);
    const timer = new Timer({userId, username: user.username, comment: user.comment,  remainingTime: timeInSeconds, startTime, endTime });
    await timer.save();
    io.emit('timerStarted', timer);
    res.status(201).json({ message: `${timeInSeconds / 60}分間集中しましょう！`, timer });
  } catch (error) {
    res.status(500).json({ message: 'サーバーでエラーが発生しました。時間を置いてもう一度お試しください。'})
  }
};

// 一時停止
const pause = async (req, res) => {
  try {
    const { userId } = req.body;
  
    const timer = await Timer.findOne({ userId });
    if (!timer) {
      return res.status(400).json({ message: 'タイマーは開始されていません。' });
    } else if (timer.action === 'pause') {
      return res.status(400).json({ message: 'タイマーはすでに一時停止しています。' });
    }
  
    const currentTime = Date.now();
    const remainingTime = timer.remainingTime - Math.round((currentTime - timer.startTime) / 1000);
    timer.remainingTime = remainingTime;
    timer.action = 'pause';
    await timer.save();
    io.emit('timerPaused', timer);
    res.status(200).json({ message: 'タイマーが一時停止しました。', timer });
  } catch (error) {
    res.status(500).json({ message: 'サーバーでエラーが発生しました。時間を置いてもう一度お試しください。'})
  }
};

// 再開
const resume = async (req, res) => {
  try {
    const { userId } = req.body;
  
    const timer = await Timer.findOne({ userId });
    if (!timer) {
      return res.status(404).json({ message: 'タイマーは開始されていません。' });
    }
  
    timer.startTime = Date.now();
    timer.endTime = new Date(timer.startTime.getTime() + timer.remainingTime * 1000);;
    timer.action = 'start';
    await timer.save();
    io.emit('timerResumed', timer);
    res.status(200).json({ message: 'タイマーが再開しました。', timer });
  } catch (error) {
    res.status(500).json({ message: 'サーバーでエラーが発生しました。時間を置いてもう一度お試しください。'})
  }
};

// 停止
const stop = async (req, res) => {
  try {
    const { userId } = req.body;
  
    const deletedTimer = await Timer.findOneAndDelete({ userId });
    if (!deletedTimer) {
      return res.status(404).json({ message: 'タイマーは開始されていません。' });
    }
    io.emit('timerStopped', deletedTimer);
    res.status(200).json({ message: 'タイマーを停止しました。' });
    
  } catch (error) {
    res.status(500).json({ message: 'サーバーでエラーが発生しました。時間を置いてもう一度お試しください。'})
  }
};

// 全てのタイマー情報取得
const getAllTimers = async (req, res) => {
  try {
    const timers = await Timer.find({});
    res.status(200).json({ timers });
  } catch (error) {
    res.status(500).json({ message: 'サーバーでエラーが発生しました。時間を置いてもう一度お試しください。'})
  }
};

export default { start, pause, resume, stop, getAllTimers };

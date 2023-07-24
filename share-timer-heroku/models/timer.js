import mongoose from 'mongoose';

const timerSchema = new mongoose.Schema({
  action: {
    type: String,
    enum: ['start', 'pause', 'resume', 'stop'],
    default: 'start'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  username: {
    type: String,
    required: true
  },
  comment: {
    type: String,
    required: false
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: Date,
  remainingTime: Number,
});

const Timer = mongoose.model('Timer', timerSchema);
export default Timer;
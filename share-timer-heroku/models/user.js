import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  comment: {
    type: String,
    required: false
  },
  timers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Timer'
  }]
});

UserSchema.pre('save', function(next) {
  const user = this;
  // パスワードが変更されていない場合は次の処理へ
  if (!user.isModified('password')) return next();

  bcrypt.genSalt(10, function(err, salt) {
    if (err) return next(err);

    bcrypt.hash(user.password, salt, function(err, hash) {
      if (err) return next(err);

      user.password = hash;
      next();
    });
  });
});

const User = mongoose.model('User', UserSchema);
export default User;

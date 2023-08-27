import { body, validationResult } from 'express-validator';

const handleErrors = (req, res, next) => {
  const errors = validationResult(req);
  console.log(errors);
  if (!errors.isEmpty()) {
    console.log(errors.array()[0].msg, errors.array()[0].path);
    return res.status(400).json({ message: errors.array()[0].msg, path: errors.array()[0].path });
  }
  next();
};

const registerValidation = [
  body('username')
  .notEmpty()
  .withMessage('ユーザー名を入力してください。')
  .isLength({ min: 1, max: 10 })
  .withMessage('ユーザー名は10文字以内で入力してください。')
  .trim(),
  body('password')
  .notEmpty()
  .withMessage('パスワードを入力してください。')
  .isLength({ min: 5, max: 20 })
  .withMessage('パスワードは5〜20文字で入力してください。')
  .custom((value) => {
    if (value.match(/https?:\/\/[-_.!~*\'()a-zA-Z0-9;\/?:\@&=+\$,%#]+/)) {
      throw new Error('ユーザー名にURLは使用できません。');
    }
    return true;
  })
  .trim(),
];

const loginValidation = registerValidation;

const updateNameValidation = [
  body('username')
  .notEmpty()
  .withMessage('ユーザー名を入力してください。')
  .isLength({ min: 1, max: 10 })
  .withMessage('ユーザー名は10文字以内で入力してください。')
  .custom((value) => {
    if (value.match(/https?:\/\/[-_.!~*\'()a-zA-Z0-9;\/?:\@&=+\$,%#]+/)) {
      throw new Error('ユーザー名にURLは使用できません。');
    }
    return true;
  })
  .trim(),
];

const commentValidation = [
  body('comment')
  .isLength({ max: 25 })
  .withMessage('コメントは25文字以内で入力してください。')
  .custom((value) => {
    if (value.match(/https?:\/\/[-_.!~*\'()a-zA-Z0-9;\/?:\@&=+\$,%#]+/)) {
      throw new Error('コメントにURLは使用できません。');
    }
    return true;
  })
  .trim(),
];

const sendMailValidation = [
  body('name')
  .notEmpty()
  .withMessage('お名前を入力してください。')
  .isLength({ max: 30 })
  .withMessage('お名前は30文字以内で入力してください。')
  .trim(),
  body('email')
  .notEmpty()
  .withMessage('メールアドレスを入力してください。')
  .isEmail()
  .withMessage('メールアドレスの形式が正しくありません。')  
  .trim(),
  body('message')
  .notEmpty()
  .withMessage('メッセージを入力してください。')
  .isLength({ max: 300 })
  .withMessage('メッセージは300字以内で入力してください。')
  .trim(),
];



export { loginValidation, registerValidation, updateNameValidation, commentValidation, sendMailValidation, handleErrors } ;
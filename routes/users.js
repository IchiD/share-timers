import express from 'express';
import UserController from '../controllers/userController.js';
import auth from '../middleware/auth.js';
import { handleErrors, registerValidation, loginValidation, updateNameValidation, commentValidation, sendMailValidation } from '../middleware/validation.js';
const router = express.Router();

router.post('/register',registerValidation, handleErrors, UserController.register);
router.post('/login',loginValidation, handleErrors, UserController.login);

router.post('/updateName/:id', updateNameValidation, handleErrors, auth, UserController.updateName);
router.post('/addComment/:id', commentValidation, handleErrors ,auth, UserController.addComment);
router.get('/getUser/:id',auth, UserController.getUser);
router.delete('/delete/:id', auth, UserController.deleteUser);
router.post('/sendMail/:id?', sendMailValidation, handleErrors, auth, UserController.sendMail);

export default router;

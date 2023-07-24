import express from 'express';
import timerController from '../controllers/timerController.js';

const router = express.Router();

router.post('/start', timerController.start);
router.post('/pause', timerController.pause);
router.post('/resume', timerController.resume);
router.post('/stop', timerController.stop);
router.get('/getAlltimers', timerController.getAllTimers);

export default router;

'use strict';

import express from 'express'
import Data from '../controller/system/data'
import Check from '../middlewares/check'

const router = express.Router()

router.get('/start/:_id', Data.startRead);
router.get('/stop/:_id', Data.stopRead);
router.get('/allStartSensor',Data.getAllSensor)

// router.get('/info', User.getUserInfo);
// router.post('/update/:user_id', User.update);
// router.post('/changepassword', User.chanegPassword);

export default router

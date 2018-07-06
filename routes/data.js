'use strict';

import express from 'express'
import Data from '../controller/system/data'
import Check from '../middlewares/check'

const router = express.Router()

router.post('/collectData/:_id',Data.collectData)
router.get('/start/:_id', Data.startRead);
// router.get('/stop/:_id', Data.stopRead);
router.get('/allStartSensor',Data.getAllSensor)

export default router

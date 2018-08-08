'use strict';

import express from 'express'
import File from '../controller/system/file'
import Check from '../middlewares/check'

const router = express.Router()

// router.post('/collectData/:_id',Data.collectData)
router.get('/excel/:name', File.downloadExcel);

// router.get('/stop/:_id', Data.stopRead);
// router.get('/allStartSensor',Data.getAllSensor)

export default router

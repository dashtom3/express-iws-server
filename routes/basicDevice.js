'use strict';

import express from 'express'
import BasicDevice from '../controller/system/basicDevice'
import Check from '../middlewares/check'

const router = express.Router()

router.post('/add', BasicDevice.addDevice);
router.post('/update', BasicDevice.updateDevice);
router.post('/delete/:id', BasicDevice.deleteDevice)
router.get('/all',BasicDevice.getAllDevice);
// router.get('/info/:id',BasicDevice.getInfo);

export default router

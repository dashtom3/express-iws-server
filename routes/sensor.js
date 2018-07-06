'use strict';

import express from 'express'
import Sensor from '../controller/system/sensor'
import Check from '../middlewares/check'

const router = express.Router()

router.post('/point/add',Sensor.addPoint); //已测
router.post('/point/update', Sensor.updatePoint); //已测
router.get('/point/delete/:_id', Sensor.deletePoint)  //已测
router.get('/point/all', Sensor.getAllPoint); //已测


export default router

'use strict';

import express from 'express'
import System from '../controller/system/system'
import Check from '../middlewares/check'

const router = express.Router()

router.post('/system/add',System.addSystem); //已测
router.post('/system/update', System.updateSystem); //已测
router.get('/system/delete/:id', System.deleteSystem)  //已测
router.get('/system/all', System.getAllSystem); //已测

router.post('/location/add',System.addLocation); //已测
router.post('/location/update',System.updateLocation); //已测
router.get('/location/delete/:id',System.deleteLocation) //已测

router.post('/room/add',System.addRoom);       //已测
router.post('/room/update',System.updateRoom);
router.get('/room/delete/:id',System.deleteRoom);
//
// router.post('/device/add',System.addDevice);
// router.post('/device/update',System.updateDevice);
// router.get('/device/delete/:system_id',System.deleteDevice)

export default router

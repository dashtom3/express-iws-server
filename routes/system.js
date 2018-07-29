'use strict';

import express from 'express'
import System from '../controller/system/system'
import Check from '../middlewares/check'

const router = express.Router()

router.post('/system/add',System.addSystem); //已测
router.post('/system/update', System.updateSystem); //已测
router.get('/system/delete/:_id', System.deleteSystem)  //已测
router.get('/system/all', System.getAllSystem); //已测
router.get('/system/allByRole', System.getAllSystemByRole); //已测

router.post('/location/add',System.addLocation); //已测
router.post('/location/update',System.updateLocation); //已测
router.get('/location/delete/:_id',System.deleteLocation) //已测

router.post('/room/add',System.addRoom);       //已测
router.post('/room/update',System.updateRoom);  //已测
router.get('/room/delete/:_id',System.deleteRoom); //已测

router.post('/device/add',System.addDevice);
router.post('/device/update',System.updateDevice);
router.get('/device/delete/:_id',System.deleteDevice);

export default router

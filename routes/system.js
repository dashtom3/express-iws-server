'use strict';

import express from 'express'
import System from '../controller/system/system'
import Check from '../middlewares/check'

const router = express.Router()

router.post('/system/add',System.addSystem);
// router.post('/system/update/:system_id', Check.checkAdmin,System.updateSystem);
// router.get('/system/delete/:system_id')
// router.get('/system/info/:system_id')
// router.get('/system/all', Check.checkAdmin);

router.post('/location/add',System.addLocation);
// router.post('/location/update/:system_id', Check.checkAdmin,System.updateSystem);
// router.get('/location/delete/:system_id')
// router.get('/location/info/:system_id')
// router.get('/location/all', Check.checkAdmin);

router.post('/room/add',System.addRoom);
// router.post('/room/update/:system_id', Check.checkAdmin,System.updateSystem);
// router.get('/room/delete/:system_id')
// router.get('/room/info/:system_id')
// router.get('/room/all', Check.checkAdmin);
//
// router.post('/device/add', Check.checkAdmin,System.addSystem);
// router.post('/device/update/:system_id', Check.checkAdmin,System.updateSystem);
// router.get('/device/delete/:system_id')
// router.get('/device/info/:system_id')
// router.get('/device/all', Check.checkAdmin);
export default router

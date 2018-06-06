'use strict';

import express from 'express'
import Role from '../controller/role/role'
import Check from '../middlewares/check'

const router = express.Router()

router.post('/add', Role.addDevice);
router.post('/update', Role.updateDevice);
router.post('/delete/:id', Role.deleteDevice)
router.get('/all',Role.getAllDevice);
router.get('/info/:id',Role.getInfo);
// router.get('/info', User.getUserInfo);
// router.post('/update/:user_id', User.update);
// router.post('/changepassword', User.chanegPassword);

export default router

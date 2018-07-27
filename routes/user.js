'use strict';

import express from 'express'
import User from '../controller/user/user'
import Check from '../middlewares/check'

const router = express.Router()

router.post('/login', User.login);   //已测
router.post('/register', User.register); //已测
router.get('/all',User.getAllUser); //已测
router.get('/updateRole/:_id',User.updateUserRole);
router.get('/delete/:_id',User.deleteUser);
router.post('/changePassword',User.changePassword);
// router.get('/info', User.getUserInfo);
router.post('/update/:_id', User.update);
// router.post('/changepassword', User.chanegPassword);

export default router

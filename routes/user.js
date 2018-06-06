'use strict';

import express from 'express'
import User from '../controller/user/user'
import Check from '../middlewares/check'

const router = express.Router()

router.post('/login', User.login);
router.post('/register', User.register);
router.get('/all', Check.checkAdmin,User.getAllUser);
// router.get('/info', User.getUserInfo);
// router.post('/update/:user_id', User.update);
// router.post('/changepassword', User.chanegPassword);

export default router

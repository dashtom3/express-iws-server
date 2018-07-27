'use strict';

import express from 'express'
import Role from '../controller/user/role'
import Check from '../middlewares/check'

const router = express.Router()

router.post('/add', Role.addRole);
router.post('/update', Role.updateRole);
router.get('/delete/:_id', Role.deleteRole)
router.get('/all',Role.getAllRole);

// router.get('/info', User.getUserInfo);
// router.post('/update/:user_id', User.update);
// router.post('/changepassword', User.chanegPassword);

export default router

'use strict';

import express from 'express'
import Work from '../controller/system/work'
import Check from '../middlewares/check'

const router = express.Router()

router.get('/changeWorker/:_id', Work.changeWorker);
router.post('/sign/add',Work.addSign);
router.get('/sign/all',Work.allSign);

export default router

'use strict';

import express from 'express'
import Video from '../controller/system/video'
import Check from '../middlewares/check'

const router = express.Router()

router.get('/all', Video.getAllVideo);
router.get('/my', Video.getMyVideoList);
router.post('/update', Video.updateVideo);

export default router

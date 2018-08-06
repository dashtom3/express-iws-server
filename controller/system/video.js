'use strict';

import config from 'config-lite'
import axios from 'axios'
import dtime from 'time-formater'
import crypto from 'crypto'
import formidable from 'formidable'
import request from 'request'
import BaseComponent from '../../prototype/baseComponent'
import UserModel from '../../models/user/user'
import RoleModel from '../../models/user/role'


class Video extends BaseComponent{
	constructor(){
        super()
       
    }
    async getAllVideo(req, res, next){
        try {  
            const appKey = 'ef7cb66d'
            const secret = 'd8ffe01088474c22bb0b10f4ba8b1b67'
            const opUserUuid = 'cc78be40ec8611e78168af26905e6f0f'
            var params = {appkey: appKey,time: new Date().getTime(),opUserUuid:opUserUuid,pageNo:1,pageSize:400}
            var url = '/openapi/service/vss/res/getCamerasEx'
            var temp = url + JSON.stringify(params) + secret
            var hash = crypto.createHash('md5');
            hash.update(temp)
            var token = hash.digest('hex')
            request({url:'http://61.190.61.78:8068/openapi/service/vss/res/getCamerasEx?token='+token,
                method:"POST",
                json:true,
                body:params
            },function(error,response,body){
                // console.log(error)
                console.log(body)
                res.send({
                    status: 1, 
                    data: body.data
                })
            })
        }catch(err){
            console.log(err)
			res.send({
				status: 0,
				type: 'ERROR_GET_LIST',
				message: '获取失败'
			})
		}
    }
    async updateVideoRole(){
        const {_id} = req.query; // role id
        if (!_id) {
            console.log('参数错误');
            res.send({
                status: 0,
                type: 'ERROR_PARAMS',
                message: '参数错误', 
            })
            return
        }
        const form = new formidable.IncomingForm();
        form.parse(req, async (err, fields, files) => {
            if (err) {
                res.send({
                    status: 0,
                    type: 'FORM_DATA_ERROR',
                    message: '表单信息错误'
                })
                return
            }
            
            const {video} = fields;
            try{
                if (video == null) {
                    throw new Error('字段不能为空')
                }
                const role = await RoleModel.findOne({_id:_id})
                if(!role){
                    res.send({
                        status: 0,
                        type: 'ERROR_GET_LIST',
                        message: '角色不存在'
                    })
                }
                // user.video = []
                // user.video = video
                
                await RoleModel.findOneAndUpdate({'_id':_id},{$set:{video:video}})
                res.send({
                    status: 1,
                    type: 'SUCCESS',
                    message: '更新成功'
                })
            }catch(err){
                console.log(err)
                res.send({
                    status: 0,
                    type: 'ERROR_GET_LIST',
                    message: '更新失败'
                })
            }
        })

    }
    async getMyVideoList(req, res, next){
        const {token} = req.query;
        if (!token) {
                console.log('参数错误');
                res.send({
                    status: 0,
                    type: 'ERROR_PARAMS',
                    message: '参数错误', 
                })
                return
            }
        try {
            const user = await UserModel.findOne({token:token})
            if(!user){
                res.send({
                    status: 0,
                    type: 'ERROR_GET_LIST',
                    message: '用户不存在'
                })
            }
            res.send({
				status: 1,
				data:user.video
			})
        }catch(err){
			console.log('读取失败', err);
			res.send({
				status: 0,
				type: 'ERROR_GET_LIST',
				message: '读取失败'
			})
		}
    }
    async updateVideo(req,res,next){
        const {token} = req.query;
        if (!token) {
            console.log('参数错误');
            res.send({
                status: 0,
                type: 'ERROR_PARAMS',
                message: '参数错误', 
            })
            return
        }
        const form = new formidable.IncomingForm();
        form.parse(req, async (err, fields, files) => {
            if (err) {
                res.send({
                    status: 0,
                    type: 'FORM_DATA_ERROR',
                    message: '表单信息错误'
                })
                return
            }
            
            const {video} = fields;
            try{
                if (!video) {
                    throw new Error('字段不能为空')
                }
                const user = await UserModel.findOne({token:token})
                if(!user){
                    res.send({
                        status: 0,
                        type: 'ERROR_GET_LIST',
                        message: '用户不存在'
                    })
                }
                // user.video = []
                // user.video = video
                
                await UserModel.findOneAndUpdate({'_id':user._id},{$set:{video:video}})
                res.send({
                    status: 1,
                    type: 'SUCCESS',
                    message: '更新成功'
                })
            }catch(err){
                console.log(err)
                res.send({
                    status: 0,
                    type: 'ERROR_GET_LIST',
                    message: '更新失败'
                })
            }
        })

    }
    
    
}

export default new Video()

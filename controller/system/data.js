'use strict';

import PointModel from '../../models/system/point'
import SensorModel from '../../models/system/sensor'
import DeviceModel from '../../models/system/device'
import BaseComponent from '../../prototype/baseComponent'
import config from 'config-lite'
import formidable from 'formidable'
import axios from 'axios'
// import request from 'request'

class Data extends BaseComponent{
	constructor(){
		super()
    }
    async collectData(req, res, next){
        const _id = req.params._id
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
            const data = fields; //device id
			try{
				if (!data) {
					throw new Error('字段不能为空')
				}
			}catch(err){
				console.log(err.message, err);
				res.send({
					status: 0,
					type: 'GET_ERROR_PARAM',
					message: err.message,
				})
				return
			}
            try {
                SensorModel.findOneAndUpdate({'_id':_id},{$set:{}})
                console.log(fields)
                
                
                
            }catch(err){
                console.log('开启失败', err);
                res.send({
                    status: 0,
                    type: 'ERROR_INTERFACE_ERROR',
                    message: '开启失败'
                })
            }
        })
       
    }
    async startRead(req, res, next){
        const _id = req.params._id
        if (!_id) {
                console.log('参数错误');
                res.send({
                    status: 0,
                    type: 'ERROR_PARAMS',
                    message: '参数错误',
                })
                return
            }
        try {
            const device = await DeviceModel.findOne({'_id':_id}).populate({path:'sensor',populate:[{path:'point'},{path:'alarm'}]})
            console.log(device)
            
            if(device.sensor[0].isStart == false) {
                console.log(config.data_ip+config.api.start)
                var p = await axios.post(config.data_ip+config.api.start,device)
                if(p.data.status ==1) {
                    await SensorModel.findOneAndUpdate({'_id':device.sensor[0]._id},{$set:{isStart:true}})
                    res.send({
                        status: 1,
                        message: '开启成功'
                    })
                }else {
                    res.send({
                        status: 0,
                        message: '开启失败'
                    })
                }
                
            }else {
                var p = await axios.post(config.data_ip+config.api.stop,device)
                if(p.data.status ==1) {
                    await SensorModel.findOneAndUpdate({'_id':device.sensor[0]._id},{$set:{isStart:false}})
                    res.send({
                        status: 1,
                        message: '关闭成功'
                    })
                }else {
                    res.send({
                        status: 0,
                        message: '关闭失败'
                    })
                }
            }
        }catch(err){
			console.log('关闭失败', err);
			res.send({
				status: 0,
				message: '关闭失败'
			})
		}
  }
  async getAllSensor(req, res, next){
    try {
        const sensor = await SensorModel.find({'isStart':true}, '-__v -oldAlarmData -oldData -data -alarmData').populate('point')
        console.log(sensor)
        res.send({
            status: 1,
            data:sensor
        })
    }catch(err){
        console.log('删除失败', err);
        res.send({
            status: 0,
            type: 'ERROR_GET_LIST',
            message: '删除失败'
        })
    }
}
  async stopRead(req, res, next){
    const _id = req.params._id
    if (!_id) {
            console.log('参数错误');
            res.send({
                status: 0,
                type: 'ERROR_PARAMS',
                message: '参数错误',
            })
            return
        }
    try {
        const device = await DeviceModel.findOne({'_id':_id})
        
        await PointModel.findOneAndRemove({'_id':_id})
        res.send({
            status: 1,
            message: '开启成功'
        })
    }catch(err){
        console.log('删除失败', err);
        res.send({
            status: 0,
            type: 'ERROR_GET_LIST',
            message: '删除失败'
        })
    }
}
   

}

export default new Data()

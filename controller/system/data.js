'use strict';

import PointModel from '../../models/system/point'
import SensorModel from '../../models/system/sensor'
import DeviceModel from '../../models/system/device'
import BaseComponent from '../../prototype/baseComponent'
import config from 'config-lite'
import axios from 'axios'
// import request from 'request'

class Data extends BaseComponent{
	constructor(){
		super()
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
                console.log(p)
                await SensorModel.findOneAndUpdate({'_id':device.sensor[0]._id},{$set:{isStart:true}})
                res.send({
                    status: 1,
                    message: '开启成功'
                })
            }
            
        }catch(err){
			console.log('删除失败', err);
			res.send({
				status: 0,
				type: 'ERROR_GET_LIST',
				message: '删除失败'
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
